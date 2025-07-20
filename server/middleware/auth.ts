import { storage } from "../storage-wrapper";
import { logger } from "../utils/logger";
import { hasPermission } from "@shared/auth-utils";

export const requirePermission = (permission: string) => {
  return async (req: any, res: any, next: any) => {
    try {
      let user = req.user || req.session?.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get fresh user data from database to ensure permissions are current
      const dbUser = await storage.getUserByEmail(user.email);
      if (!dbUser || !dbUser.isActive) {
        return res.status(401).json({ message: "User account not found or inactive" });
      }

      // Attach fresh user data to request
      (req as any).user = dbUser;
      
      // Check permissions
      const userHasPermission = hasPermission(dbUser, permission);
      if (!userHasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      next();
    } catch (error) {
      logger.error("Permission check failed", error?.message || error || "Unknown error", { userId: req.user?.id, permission });
      res.status(500).json({ message: "Internal server error" });
    }
  };
};

export const isAuthenticated = async (req: any, res: any, next: any) => {
  try {
    const user = req.user || req.session?.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Get fresh user data from database
    const dbUser = await storage.getUserByEmail(user.email);
    if (!dbUser || !dbUser.isActive) {
      return res.status(401).json({ message: "User account not found or inactive" });
    }

    // Attach fresh user data to request
    (req as any).user = dbUser;
    
    next();
  } catch (error) {
    logger.error("Authentication middleware error", error?.message || error || "Unknown error");
    res.status(500).json({ message: "Internal server error" });
  }
};

export const optionalAuth = async (req: any, res: any, next: any) => {
  try {
    const user = req.user || req.session?.user;
    if (user) {
      // If user is present, get fresh data
      const dbUser = await storage.getUserByEmail(user.email);
      if (dbUser && dbUser.isActive) {
        (req as any).user = dbUser;
      }
    }
    next();
  } catch (error) {
    // For optional auth, continue even if there's an error
    next();
  }
};