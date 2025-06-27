import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Extend session and request types
declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      profileImageUrl: string | null;
      role: string;
      permissions: string[];
      isActive: boolean;
    };
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        profileImageUrl: string | null;
        role: string;
        permissions: string[];
        isActive: boolean;
      };
    }
  }
}

// Temporary simple authentication for testing
export function setupTempAuth(app: Express) {
  // GET route for login page
  app.get("/api/login", (req, res) => {
    const loginHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>The Sandwich Project - Login</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          min-height: 100vh; 
          margin: 0; 
          background-color: #f5f5f5; 
        }
        .login-card { 
          background: white; 
          padding: 2rem; 
          border-radius: 8px; 
          box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
          text-align: center; 
          max-width: 400px; 
          width: 100%; 
        }
        .btn { 
          background-color: #236383; 
          color: white; 
          border: none; 
          padding: 12px 24px; 
          border-radius: 6px; 
          cursor: pointer; 
          font-size: 16px; 
          margin: 10px 0; 
        }
        .btn:hover { background-color: #1a4d61; }
        h1 { color: #236383; margin-bottom: 1rem; }
        p { color: #666; margin-bottom: 1.5rem; }
      </style>
    </head>
    <body>
      <div class="login-card">
        <h1>The Sandwich Project</h1>
        <p>Welcome to the platform! Click below to access as admin.</p>
        <button class="btn" onclick="login()">Login as Admin</button>
      </div>
      <script>
        function login() {
          fetch('/api/temp-login', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              window.location.href = '/';
            } else {
              alert('Login failed');
            }
          })
          .catch(error => {
            console.error('Login error:', error);
            alert('Login failed');
          });
        }
      </script>
    </body>
    </html>
    `;
    res.send(loginHtml);
  });

  // Simple login endpoint that creates a test admin user
  app.post("/api/temp-login", async (req: any, res) => {
    try {
      // Create or get a test admin user
      const testUser = {
        id: "test-admin-user",
        email: "admin@example.com",
        firstName: "Test",
        lastName: "Admin",
        profileImageUrl: null,
        role: "admin",
        permissions: ["view_phone_directory", "edit_data", "delete_data", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "manage_users"],
        isActive: true,
      };

      // Store user in session
      req.session.user = testUser;
      
      res.json({ success: true, user: testUser });
    } catch (error) {
      console.error("Temp login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get current user endpoint
  app.get("/api/auth/user", (req: any, res) => {
    if (req.session.user) {
      res.json(req.session.user);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req: any, res) => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });
}

// Middleware to check if user is authenticated
export const isAuthenticated: RequestHandler = (req: any, res, next) => {
  if (req.session.user) {
    req.user = req.session.user;
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Permission checking middleware
export const requirePermission = (permission: string): RequestHandler => {
  return (req: any, res, next) => {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (user.role === "admin" || (user.permissions && user.permissions.includes(permission))) {
      return next();
    }
    
    res.status(403).json({ message: "Forbidden" });
  };
};