import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage-wrapper";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Use memory store for stability during development
  // PostgreSQL sessions can be problematic during authentication setup
  console.log("🔧 Using memory-based session store for Replit Auth");
  const sessionStore = new session.MemoryStore();
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  console.log("🔄 Starting user upsert for claims:", JSON.stringify(claims, null, 2));
  
  // Check if user exists by email for migration
  let existingUser = null;
  try {
    if (claims["email"]) {
      console.log("🔍 Looking for existing user with email:", claims["email"]);
      existingUser = await storage.getUserByEmail(claims["email"]);
      if (existingUser) {
        console.log("✅ Found existing user:", existingUser.email, "with role:", existingUser.role);
      }
    }
  } catch (error) {
    console.log("ℹ️ No existing user found with email:", claims["email"]);
  }

  try {
    if (existingUser) {
      // Update existing user with Replit ID and profile info
      const updateData = {
        id: claims["sub"], // New Replit ID
        email: claims["email"],
        firstName: claims["first_name"] || existingUser.firstName,
        lastName: claims["last_name"] || existingUser.lastName,
        profileImageUrl: claims["profile_image_url"],
        role: existingUser.role, // Keep existing role
        permissions: existingUser.permissions, // Keep existing permissions
        metadata: existingUser.metadata || {},
        isActive: existingUser.isActive,
        displayName: existingUser.displayName,
      };
      console.log("🔄 Updating existing user with data:", JSON.stringify(updateData, null, 2));
      await storage.upsertUser(updateData);
      console.log("✅ Migrated existing user:", claims["email"], "to Replit ID:", claims["sub"]);
    } else {
      // New user - create with default volunteer permissions
      const newUserData = {
        id: claims["sub"],
        email: claims["email"],
        firstName: claims["first_name"],
        lastName: claims["last_name"],
        profileImageUrl: claims["profile_image_url"],
        role: "volunteer",
        permissions: ["view_collections", "general_chat"],
        metadata: {},
        isActive: true,
      };
      console.log("🔄 Creating new user with data:", JSON.stringify(newUserData, null, 2));
      await storage.upsertUser(newUserData);
      console.log("✅ Created new user:", claims["email"], "with Replit ID:", claims["sub"]);
    }
  } catch (error) {
    console.error("❌ Database error during user upsert:", error);
    throw error; // Re-throw to be handled by the verification function
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      const user = {};
      updateUserSession(user, tokens);
      await upsertUser(tokens.claims());
      verified(null, user);
    } catch (error) {
      console.error("Verification error:", error);
      verified(error);
    }
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    try {
      const strategyName = `replitauth:${req.hostname}`;

      // Check if strategy exists before attempting to authenticate
      if (!(passport as any)._strategy(strategyName)) {
        console.error(`Strategy ${strategyName} not found. Available strategies:`, Object.keys((passport as any)._strategies || {}));
        return res.status(500).send(`
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 400px; margin: 100px auto; padding: 20px;">
              <h2>Authentication Error</h2>
              <p>Authentication system is not properly configured. Please contact an administrator.</p>
              <a href="/" style="color: #236383;">Return to home page</a>
            </body>
          </html>
        `);
      }

      passport.authenticate(strategyName, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).send(`
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 400px; margin: 100px auto; padding: 20px;">
            <h2>Login Failed</h2>
            <p>An error occurred during login. Please try again later.</p>
            <a href="/" style="color: #236383;">Return to home page</a>
          </body>
        </html>
      `);
    }
  });

  app.get("/api/callback", (req, res, next) => {
    console.log("🔄 Callback route hit with query:", req.query);
    console.log("🔄 Request hostname:", req.hostname);
    console.log("🔄 Request host header:", req.headers.host);
    console.log("🔄 Available strategies:", Object.keys((passport as any)._strategies || {}));
    try {
      // Find the correct strategy - for local development, use the first available Replit strategy
      const availableStrategies = Object.keys((passport as any)._strategies || {});
      let strategyName = `replitauth:${req.hostname}`;
      
      // If localhost strategy doesn't exist, use the first replitauth strategy available
      if (!availableStrategies.includes(strategyName)) {
        const replitStrategy = availableStrategies.find(s => s.startsWith('replitauth:'));
        if (replitStrategy) {
          strategyName = replitStrategy;
          console.log("🔄 Using fallback strategy:", strategyName);
        }
      }
      
      console.log("🔄 Using strategy:", strategyName);
      
      passport.authenticate(strategyName, (err: any, user: any, info: any) => {
        console.log("🔄 Authentication result - err:", !!err, "user:", !!user, "info:", info);
        
        if (err) {
          console.error("❌ Authentication callback error:", JSON.stringify(err, null, 2));
          return res.status(500).send(`
            <html>
              <body style="font-family: Arial, sans-serif; max-width: 400px; margin: 100px auto; padding: 20px;">
                <h2>Authentication Failed</h2>
                <p>There was an error during authentication. Please try again.</p>
                <a href="/api/login" style="color: #236383;">Try Again</a>
              </body>
            </html>
          `);
        }
        
        if (!user) {
          console.error("❌ No user returned from authentication:", info);
          return res.status(500).send(`
            <html>
              <body style="font-family: Arial, sans-serif; max-width: 400px; margin: 100px auto; padding: 20px;">
                <h2>Authentication Failed</h2>
                <p>Unable to authenticate user. Please try again.</p>
                <a href="/api/login" style="color: #236383;">Try Again</a>
              </body>
            </html>
          `);
        }
        
        console.log("✅ User authenticated, attempting login...");
        req.logIn(user, (loginErr) => {
          if (loginErr) {
            console.error("❌ Login error:", JSON.stringify(loginErr, null, 2));
            return res.status(500).send(`
              <html>
                <body style="font-family: Arial, sans-serif; max-width: 400px; margin: 100px auto; padding: 20px;">
                  <h2>Login Failed</h2>
                  <p>Session setup failed. Please try again.</p>
                  <a href="/api/login" style="color: #236383;">Try Again</a>
                </body>
              </html>
            `);
          }
          console.log("✅ Authentication successful, redirecting to /");
          return res.redirect("/");
        });
      })(req, res, next);
    } catch (error) {
      console.error("❌ Callback route error:", error);
      return res.status(500).send(`
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 400px; margin: 100px auto; padding: 20px;">
            <h2>Server Error</h2>
            <p>An unexpected error occurred. Please try again.</p>
            <a href="/api/login" style="color: #236383;">Try Again</a>
          </body>
        </html>
      `);
    }
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user as any;
    // Check if user exists and has valid session
    if (!user || !user.expires_at) {
      return res.status(401).json({ message: "Unauthorized" });
    }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// Role-based authorization middleware
export const requireRole = (allowedRoles: string[]): RequestHandler => {
  return async (req, res, next) => {
    const user = req.user as any;

    if (!req.isAuthenticated() || !user.claims?.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const dbUser = await storage.getUser(user.claims.sub);
      if (!dbUser || !dbUser.isActive) {
        return res.status(401).json({ message: "User account not found or inactive" });
      }

      if (!allowedRoles.includes(dbUser.role)) {
        return res.status(403).json({ 
          message: "Insufficient permissions",
          required: allowedRoles,
          current: dbUser.role 
        });
      }

      // Attach user info to request for use in handlers
      (req as any).currentUser = dbUser;
      next();
    } catch (error) {
      res.status(500).json({ message: "Error checking user permissions" });
    }
  };
};

// Permission-based authorization middleware
export const requirePermission = (permission: string): RequestHandler => {
  return async (req, res, next) => {
    const user = req.user as any;

    if (!req.isAuthenticated() || !user.claims?.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const dbUser = await storage.getUser(user.claims.sub);
      if (!dbUser || !dbUser.isActive) {
        return res.status(401).json({ message: "User account not found or inactive" });
      }

      const permissions = Array.isArray(dbUser.permissions) ? dbUser.permissions : [];

      // Admin role has all permissions
      if (dbUser.role === 'admin' || permissions.includes(permission)) {
        (req as any).currentUser = dbUser;
        return next();
      }

      return res.status(403).json({ 
        message: "Insufficient permissions",
        required: permission 
      });
    } catch (error) {
      res.status(500).json({ message: "Error checking user permissions" });
    }
  };
};