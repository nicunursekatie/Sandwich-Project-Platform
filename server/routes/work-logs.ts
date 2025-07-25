import { Router } from "express";
import { z } from "zod";
import { sql, eq } from "drizzle-orm";
import { workLogs } from "@shared/schema";
import { db } from "../db";
// Import the actual authentication middleware being used in the app
const isAuthenticated = (req: any, res: any, next: any) => {
  const user = req.user || req.session?.user;
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  req.user = user; // Ensure req.user is set
  next();
};

const router = Router();

// Zod schema for validation
const insertWorkLogSchema = z.object({
  description: z.string().min(1),
  hours: z.number().int().min(0),
  minutes: z.number().int().min(0).max(59),
  workDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format"
  })
});

// Middleware to check if user is super admin or admin
function isSuperAdmin(req) {
  return req.user?.role === "super_admin" || req.user?.role === "admin";
}

// Middleware to check if user can log work
function canLogWork(req) {
  // Allow admin, super_admin, or users with general permissions
  return req.user?.role === "admin" || req.user?.role === "super_admin" || req.user?.role === "work_logger";
}

// Get work logs - Admins see ALL, users see only their own
router.get("/work-logs", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const userRole = req.user.role;
    
    console.log(`[WORK LOGS] User: ${userId}, Email: ${userEmail}, Role: ${userRole}`);
    console.log(`[WORK LOGS] isSuperAdmin check: ${isSuperAdmin(req)}, isMarcy: ${userEmail === 'mdlouza@gmail.com'}`);
    
    // Super admin and Marcy can see ALL work logs
    if (isSuperAdmin(req) || userEmail === 'mdlouza@gmail.com') {
      console.log(`[WORK LOGS] Admin access - fetching ALL logs`);
      const logs = await db.select().from(workLogs);
      console.log(`[WORK LOGS] Found ${logs.length} total logs:`, logs.map(l => `${l.id}: ${l.userId}`));
      return res.json(logs);
    } else {
      // Regular users can only see their own logs
      console.log(`[WORK LOGS] Regular user access - fetching logs for ${userId}`);
      const logs = await db.select().from(workLogs).where(eq(workLogs.userId, userId));
      console.log(`[WORK LOGS] Found ${logs.length} logs for user ${userId}:`, logs.map(l => `${l.id}: ${l.description.substring(0, 30)}`));
      return res.json(logs);
    }
  } catch (error) {
    console.error("Error fetching work logs:", error);
    res.status(500).json({ error: "Failed to fetch work logs" });
  }
});

// Create a new work log
router.post("/work-logs", isAuthenticated, async (req, res) => {
  if (!canLogWork(req)) return res.status(403).json({ error: "Insufficient permissions" });
  const result = insertWorkLogSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.message });
  try {
    const log = await db.insert(workLogs).values({
      userId: req.user.id,
      description: result.data.description,
      hours: result.data.hours,
      minutes: result.data.minutes,
      workDate: new Date(result.data.workDate)
    }).returning();
    res.status(201).json(log[0]);
  } catch (error) {
    console.error("Error creating work log:", error);
    res.status(500).json({ error: "Failed to create work log" });
  }
});

// Update a work log (own or any if super admin)
router.put("/work-logs/:id", isAuthenticated, async (req, res) => {
  const logId = parseInt(req.params.id);
  if (isNaN(logId)) return res.status(400).json({ error: "Invalid log ID" });
  const result = insertWorkLogSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.message });
  try {
    // Only allow editing own log unless super admin or Marcy
    const log = await db.select().from(workLogs).where(eq(workLogs.id, logId));
    if (!log[0]) return res.status(404).json({ error: "Work log not found" });
    if (!isSuperAdmin(req) && req.user.email !== 'mdlouza@gmail.com' && log[0].userId !== req.user.id) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    const updated = await db.update(workLogs).set({
      description: result.data.description,
      hours: result.data.hours,
      minutes: result.data.minutes,
      workDate: new Date(result.data.workDate)
    }).where(eq(workLogs.id, logId)).returning();
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update work log" });
  }
});

// Delete a work log (own or any if super admin)
router.delete("/work-logs/:id", isAuthenticated, async (req, res) => {
  const logId = parseInt(req.params.id);
  console.log("[WORK LOGS DELETE] Attempting to delete log ID:", logId);
  
  if (isNaN(logId)) return res.status(400).json({ error: "Invalid log ID" });
  
  try {
    console.log("[WORK LOGS DELETE] Fetching log for permission check...");
    const log = await db.select().from(workLogs).where(eq(workLogs.id, logId));
    console.log("[WORK LOGS DELETE] Found log:", log[0] ? `ID ${log[0].id}, User ${log[0].userId}` : "None");
    
    if (!log[0]) return res.status(404).json({ error: "Work log not found" });
    
    const hasPermission = isSuperAdmin(req) || req.user.email === 'mdlouza@gmail.com' || log[0].userId === req.user.id;
    console.log("[WORK LOGS DELETE] Permission check:", { hasPermission, userRole: req.user.role, userEmail: req.user.email, logUserId: log[0].userId });
    
    if (!hasPermission) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    
    console.log("[WORK LOGS DELETE] Deleting log...");
    await db.delete(workLogs).where(eq(workLogs.id, logId));
    console.log("[WORK LOGS DELETE] Successfully deleted log ID:", logId);
    
    res.status(204).send();
  } catch (error) {
    console.error("[WORK LOGS DELETE] Error:", error);
    console.error("[WORK LOGS DELETE] Stack trace:", error.stack);
    res.status(500).json({ error: "Failed to delete work log" });
  }
});

export default router; 