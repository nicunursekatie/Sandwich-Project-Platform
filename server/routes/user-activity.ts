import { Router } from "express";
import { z } from "zod";
import { insertUserActivityLogSchema } from "@shared/schema";
// Import isAuthenticated from temp-auth instead of middleware/auth
import type { IStorage } from "../storage";

export function createUserActivityRoutes(storage: IStorage) {
  const router = Router();

  // Log user activity (authentication will be handled by parent router)
  router.post("/", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const validatedData = insertUserActivityLogSchema.parse({
        ...req.body,
        userId,
        sessionId: req.sessionID,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || ''
      });

      const activity = await storage.logUserActivity(validatedData);
      res.json(activity);
    } catch (error) {
      console.error("Error logging user activity:", error);
      res.status(500).json({ error: "Failed to log activity" });
    }
  });

  // Get user activity stats (authentication will be handled by parent router)
  router.get("/stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const days = parseInt(req.query.days as string) || 30;

      // Allow users to view their own stats or admins to view any stats
      const currentUserId = req.user?.id;
      const hasAdminAccess = req.user?.permissions?.includes('manage_users');
      
      if (userId !== currentUserId && !hasAdminAccess) {
        return res.status(403).json({ error: "Access denied" });
      }

      const stats = await storage.getUserActivityStats(userId, days);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user activity stats:", error);
      res.status(500).json({ error: "Failed to fetch activity stats" });
    }
  });

  // Get all users activity summary (admin only)
  router.get("/summary", async (req, res) => {
    try {
      const hasAdminAccess = req.user?.permissions?.includes('manage_users');
      if (!hasAdminAccess) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const days = parseInt(req.query.days as string) || 30;
      const summary = await storage.getAllUsersActivitySummary(days);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching activity summary:", error);
      res.status(500).json({ error: "Failed to fetch activity summary" });
    }
  });

  return router;
}