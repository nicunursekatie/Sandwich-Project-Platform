import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage-wrapper";
import { requirePermission, isAuthenticated, optionalAuth } from "../middleware/auth";
import { insertHostSchema } from "@shared/schema";
import { logger } from "../utils/logger";

const router = Router();

// Get all hosts
router.get("/", optionalAuth, async (req: any, res) => {
  try {
    const hosts = await storage.getAllHosts();
    res.json(hosts);
  } catch (error) {
    logger.error("Error fetching hosts:", error);
    res.status(500).json({ error: "Failed to fetch hosts" });
  }
});

// Get single host
router.get("/:id", optionalAuth, async (req: any, res) => {
  try {
    const hostId = parseInt(req.params.id);
    const host = await storage.getHostById(hostId);
    if (!host) {
      return res.status(404).json({ error: "Host not found" });
    }
    res.json(host);
  } catch (error) {
    logger.error("Error fetching host:", error);
    res.status(500).json({ error: "Failed to fetch host" });
  }
});

// Create new host
router.post("/", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const validatedData = insertHostSchema.parse(req.body);
    const host = await storage.createHost(validatedData);
    res.status(201).json(host);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid host data", details: error?.errors || "Unknown" });
    }
    logger.error("Error creating host:", error);
    res.status(500).json({ error: "Failed to create host" });
  }
});

// Update host
router.patch("/:id", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const hostId = parseInt(req.params.id);
    
    // Validate host exists
    const existingHost = await storage.getHostById(hostId);
    if (!existingHost) {
      return res.status(404).json({ error: "Host not found" });
    }

    const updatedHost = await storage.updateHost(hostId, req.body);
    res.json(updatedHost);
  } catch (error) {
    logger.error("Error updating host:", error);
    res.status(500).json({ error: "Failed to update host" });
  }
});

// Delete host
router.delete("/:id", requirePermission("delete_data"), async (req: any, res) => {
  try {
    const hostId = parseInt(req.params.id);
    
    // Validate host exists
    const existingHost = await storage.getHostById(hostId);
    if (!existingHost) {
      return res.status(404).json({ error: "Host not found" });
    }

    await storage.deleteHost(hostId);
    res.json({ message: "Host deleted successfully" });
  } catch (error) {
    logger.error("Error deleting host:", error);
    res.status(500).json({ error: "Failed to delete host" });
  }
});

// Host status (active/inactive)
router.patch("/:id/status", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const hostId = parseInt(req.params.id);
    const { isActive } = req.body;
    
    const updatedHost = await storage.updateHost(hostId, { isActive });
    res.json(updatedHost);
  } catch (error) {
    logger.error("Error updating host status:", error);
    res.status(500).json({ error: "Failed to update host status" });
  }
});

// Get hosts by type
router.get("/type/:type", optionalAuth, async (req: any, res) => {
  try {
    const type = req.params.type;
    const hosts = await storage.getHostsByType(type);
    res.json(hosts);
  } catch (error) {
    logger.error("Error fetching hosts by type:", error);
    res.status(500).json({ error: "Failed to fetch hosts by type" });
  }
});

// Get host collections
router.get("/:id/collections", optionalAuth, async (req: any, res) => {
  try {
    const hostId = parseInt(req.params.id);
    const { startDate, endDate } = req.query;
    
    const dateRange = startDate && endDate ? { 
      startDate: new Date(startDate as string), 
      endDate: new Date(endDate as string) 
    } : undefined;
    
    const collections = await storage.getHostCollections(hostId, dateRange);
    res.json(collections);
  } catch (error) {
    logger.error("Error fetching host collections:", error);
    res.status(500).json({ error: "Failed to fetch host collections" });
  }
});

// Get host performance statistics
router.get("/:id/stats", optionalAuth, async (req: any, res) => {
  try {
    const hostId = parseInt(req.params.id);
    const stats = await storage.getHostStats(hostId);
    res.json(stats);
  } catch (error) {
    logger.error("Error fetching host stats:", error);
    res.status(500).json({ error: "Failed to fetch host stats" });
  }
});

export default router;