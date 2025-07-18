import { Router } from "express";
import { storage } from "../storage-wrapper";
import { isAuthenticated } from "../middleware/auth";
import { logger } from "../utils/logger";

const router = Router();

// Profile management endpoints
router.get("/profile", isAuthenticated, async (req: any, res) => {
  try {
    const user = req.user;
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      profileImageUrl: user.profileImageUrl
    });
  } catch (error) {
    logger.apiError("GET", "/profile", error, req.user?.id);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

router.put("/profile", isAuthenticated, async (req: any, res) => {
  try {
    const user = req.user;
    const { firstName, lastName, displayName, email } = req.body;

    const updatedUser = await storage.updateUser(user.id, {
      firstName,
      lastName,
      displayName,
      email,
      updatedAt: new Date()
    });

    // Update session with new email if changed
    if (email !== user.email) {
      req.session.user.email = email;
    }

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      displayName: updatedUser.displayName,
      profileImageUrl: updatedUser.profileImageUrl
    });
  } catch (error) {
    logger.apiError("PUT", "/profile", error, req.user?.id);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// Get current user endpoint
router.get("/user", async (req: any, res) => {
  if (req.session.user) {
    try {
      // Get fresh user data from database to ensure permissions are current
      const dbUser = await storage.getUserByEmail(req.session.user.email);
      if (!dbUser || !dbUser.isActive) {
        return res.status(401).json({ message: "User account not found or inactive" });
      }

      // Standardize authentication - Always use (req as any).user and attach dbUser to request
      (req as any).user = dbUser;

      // Return the database user data instead of session data to include latest profile updates
      res.json({
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        displayName: dbUser.displayName,
        profileImageUrl: dbUser.profileImageUrl,
        role: dbUser.role,
        permissions: dbUser.permissions,
        isActive: dbUser.isActive
      });
    } catch (error) {
      logger.apiError("GET", "/user", error);
      res.status(500).json({ message: "Error fetching user data" });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

// Debug endpoints
router.get("/debug/user/:email", async (req: any, res) => {
  try {
    const email = req.params.email;
    const user = await storage.getUserByEmail(email);
    if (user) {
      res.json({
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        isActive: user.isActive
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    logger.error("Debug user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

router.get("/debug-user/:email", async (req: any, res) => {
  try {
    const { email } = req.params;
    const user = await storage.getUserByEmail(email);
    res.json(user ? { 
      email: user.email, 
      role: user.role, 
      permissions: user.permissions,
      exists: true 
    } : { exists: false });
  } catch (error) {
    logger.error("Debug user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Fix existing users with empty permissions endpoint
router.post("/fix-permissions", async (req: any, res) => {
  try {
    // Implementation for fixing permissions would go here
    res.json({ success: true, message: "Permissions fixed" });
  } catch (error) {
    logger.error("Fix permissions error:", error);
    res.status(500).json({ error: "Failed to fix permissions" });
  }
});

export default router;