import type { Express, RequestHandler } from "express";
import { storage } from "./storage-wrapper";
import { getDefaultPermissionsForRole } from "../shared/auth-utils";

// Simple working authentication system
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        permissions: string[];
        isActive: boolean;
      };
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      permissions: string[];
      isActive: boolean;
    };
  }
}

export function setupSimpleAuth(app: Express) {
  // Middleware to check authentication
  const authenticateUser: RequestHandler = (req, res, next) => {
    if (req.session?.user) {
      req.user = req.session.user;
    }
    next();
  };

  app.use(authenticateUser);

  // Simple login page
  app.get("/api/login", (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Login - The Sandwich Project</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 400px; margin: 100px auto; padding: 20px; }
        .form-group { margin: 15px 0; }
        label { display: block; margin-bottom: 5px; }
        input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #236383; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; width: 100%; }
        button:hover { background: #1a4d61; }
        .error { color: red; margin: 10px 0; }
      </style>
    </head>
    <body>
      <h2>The Sandwich Project - Login</h2>
      <form method="POST" action="/api/login">
        <div class="form-group">
          <label>Email:</label>
          <input type="email" name="email" required value="admin@sandwich.project">
        </div>
        <div class="form-group">
          <label>Password:</label>
          <input type="password" name="password" required value="sandwich123">
        </div>
        <button type="submit">Login</button>
      </form>
      <p style="color: #666; font-size: 14px; margin-top: 20px;">
        Default admin: admin@sandwich.project / sandwich123
      </p>
    </body>
    </html>
    `);
  });

  // Handle login
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check if user exists in database
      let user = await storage.getUserByEmail(email);
      
      // If user doesn't exist and it's the admin email, create admin user
      if (!user && email === "admin@sandwich.project") {
        const adminUser = {
          email: "admin@sandwich.project",
          firstName: "Admin",
          lastName: "User", 
          role: "super_admin",
          isActive: true,
          metadata: { password: "sandwich123" }
        };
        
        user = await storage.createUser(adminUser);
      }

      // Simple password check (in real app, use proper hashing)
      if (!user || !user.metadata?.password || user.metadata.password !== password) {
        return res.status(401).send(`
          <html><body style="font-family: Arial; text-align: center; padding: 50px;">
            <h2>Invalid credentials</h2>
            <a href="/api/login">Try again</a>
          </body></html>
        `);
      }

      // Set session
      req.session.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: user.permissions || getDefaultPermissionsForRole(user.role),
        isActive: user.isActive
      };

      // Redirect to app
      res.redirect('/');
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).send('<html><body><h2>Login error</h2><a href="/api/login">Try again</a></body></html>');
    }
  });

  // Get current user
  app.get("/api/auth/user", (req, res) => {
    if (req.user) {
      res.json({
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
        permissions: req.user.permissions,
        isActive: req.user.isActive
      });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Logout
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Logout redirect
  app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
      }
      res.redirect('/');
    });
  });
}

// Authentication middleware
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(401).json({ message: "Authentication required" });
  }
};

// Permission middleware
export const requirePermission = (permission: string): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (req.user.role === 'super_admin' || req.user.permissions?.includes(permission)) {
      next();
    } else {
      res.status(403).json({ message: "Insufficient permissions" });
    }
  };
};