import { Router } from "express";
import { storage } from "../storage-wrapper";
import { requirePermission, isAuthenticated } from "../middleware/auth";
import { logger } from "../utils/logger";

const router = Router();

// Get all users (admin only)
router.get("/", requirePermission("manage_users"), async (req: any, res) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    logger.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get single user
router.get("/:id", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.params.id;
    const requestingUser = req.user;
    
    // Users can view their own profile, admins can view any profile
    if (userId !== requestingUser.id && !requestingUser.permissions?.includes("manage_users")) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    logger.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Update user
router.patch("/:id", requirePermission("manage_users"), async (req: any, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    
    // Validate user exists
    const existingUser = await storage.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = await storage.updateUser(userId, updates);
    res.json(updatedUser);
  } catch (error) {
    logger.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Update user role
router.patch("/:id/role", requirePermission("manage_users"), async (req: any, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    const updatedUser = await storage.updateUser(userId, { role });
    res.json(updatedUser);
  } catch (error) {
    logger.error("Error updating user role:", error);
    res.status(500).json({ error: "Failed to update user role" });
  }
});

// Update user permissions
router.patch("/:id/permissions", requirePermission("manage_users"), async (req: any, res) => {
  try {
    const userId = req.params.id;
    const { permissions } = req.body;
    
    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: "Permissions must be an array" });
    }

    const updatedUser = await storage.updateUser(userId, { permissions });
    res.json(updatedUser);
  } catch (error) {
    logger.error("Error updating user permissions:", error);
    res.status(500).json({ error: "Failed to update user permissions" });
  }
});

// Update user status (active/inactive)
router.patch("/:id/status", requirePermission("manage_users"), async (req: any, res) => {
  try {
    const userId = req.params.id;
    const { isActive } = req.body;
    
    const updatedUser = await storage.updateUser(userId, { isActive });
    res.json(updatedUser);
  } catch (error) {
    logger.error("Error updating user status:", error);
    res.status(500).json({ error: "Failed to update user status" });
  }
});

// Delete user
router.delete("/:id", requirePermission("manage_users"), async (req: any, res) => {
  try {
    const userId = req.params.id;
    
    // Validate user exists
    const existingUser = await storage.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    await storage.deleteUser(userId);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    logger.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Committee management endpoints
router.get("/:id/committees", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.params.id;
    const committees = await storage.getUserCommittees(userId);
    res.json(committees);
  } catch (error) {
    logger.error("Error fetching user committees:", error);
    res.status(500).json({ error: "Failed to fetch user committees" });
  }
});

router.post("/:id/committees", requirePermission("manage_users"), async (req: any, res) => {
  try {
    const userId = req.params.id;
    const { committeeId } = req.body;
    
    if (!committeeId) {
      return res.status(400).json({ error: "Committee ID is required" });
    }

    await storage.addUserToCommittee(userId, committeeId);
    res.json({ success: true, message: "User added to committee successfully" });
  } catch (error) {
    logger.error("Error adding user to committee:", error);
    res.status(500).json({ error: "Failed to add user to committee" });
  }
});

router.delete("/:id/committees/:committeeId", requirePermission("manage_users"), async (req: any, res) => {
  try {
    const userId = req.params.id;
    const committeeId = req.params.committeeId;
    
    await storage.removeUserFromCommittee(userId, committeeId);
    res.json({ success: true, message: "User removed from committee successfully" });
  } catch (error) {
    logger.error("Error removing user from committee:", error);
    res.status(500).json({ error: "Failed to remove user from committee" });
  }
});

export default router;