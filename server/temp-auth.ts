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