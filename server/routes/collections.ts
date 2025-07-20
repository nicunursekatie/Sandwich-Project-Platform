import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage-wrapper";
import { requirePermission, isAuthenticated, optionalAuth } from "../middleware/auth";
import { insertSandwichCollectionSchema } from "@shared/schema";
import { logger } from "../utils/logger";

const router = Router();

// Get all collections
router.get("/", optionalAuth, async (req: any, res) => {
  try {
    const collections = await storage.getAllCollections();
    res.json(collections);
  } catch (error) {
    logger.error("Error fetching collections:", error);
    res.status(500).json({ error: "Failed to fetch collections" });
  }
});

// Get single collection
router.get("/:id", optionalAuth, async (req: any, res) => {
  try {
    const collectionId = parseInt(req.params.id);
    const collection = await storage.getCollectionById(collectionId);
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }
    res.json(collection);
  } catch (error) {
    logger.error("Error fetching collection:", error);
    res.status(500).json({ error: "Failed to fetch collection" });
  }
});

// Create new collection
router.post("/", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const validatedData = insertSandwichCollectionSchema.parse(req.body);
    const collection = await storage.createCollection(validatedData);
    res.status(201).json(collection);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid collection data", details: error?.errors || "Unknown" });
    }
    logger.error("Error creating collection:", error);
    res.status(500).json({ error: "Failed to create collection" });
  }
});

// Update collection
router.patch("/:id", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const collectionId = parseInt(req.params.id);
    
    // Validate collection exists
    const existingCollection = await storage.getCollectionById(collectionId);
    if (!existingCollection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    const updatedCollection = await storage.updateCollection(collectionId, req.body);
    res.json(updatedCollection);
  } catch (error) {
    logger.error("Error updating collection:", error);
    res.status(500).json({ error: "Failed to update collection" });
  }
});

// Delete collection
router.delete("/:id", requirePermission("delete_data"), async (req: any, res) => {
  try {
    const collectionId = parseInt(req.params.id);
    
    // Validate collection exists
    const existingCollection = await storage.getCollectionById(collectionId);
    if (!existingCollection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    await storage.deleteCollection(collectionId);
    res.json({ message: "Collection deleted successfully" });
  } catch (error) {
    logger.error("Error deleting collection:", error);
    res.status(500).json({ error: "Failed to delete collection" });
  }
});

// Analytics endpoints
router.get("/analytics/summary", optionalAuth, async (req: any, res) => {
  try {
    const summary = await storage.getCollectionsSummary();
    res.json(summary);
  } catch (error) {
    logger.error("Error fetching collections summary:", error);
    res.status(500).json({ error: "Failed to fetch collections summary" });
  }
});

router.get("/analytics/by-date", optionalAuth, async (req: any, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateRange = startDate && endDate ? { startDate: new Date(startDate as string), endDate: new Date(endDate as string) } : undefined;
    
    const analytics = await storage.getCollectionsByDate(dateRange);
    res.json(analytics);
  } catch (error) {
    logger.error("Error fetching collections by date:", error);
    res.status(500).json({ error: "Failed to fetch collections analytics" });
  }
});

router.get("/analytics/by-host", optionalAuth, async (req: any, res) => {
  try {
    const analytics = await storage.getCollectionsByHost();
    res.json(analytics);
  } catch (error) {
    logger.error("Error fetching collections by host:", error);
    res.status(500).json({ error: "Failed to fetch host analytics" });
  }
});

// Export endpoints
router.get("/export/csv", requirePermission("view_reports"), async (req: any, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateRange = startDate && endDate ? { startDate: new Date(startDate as string), endDate: new Date(endDate as string) } : undefined;
    
    const csvData = await storage.exportCollectionsToCSV(dateRange);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="collections.csv"');
    res.send(csvData);
  } catch (error) {
    logger.error("Error exporting collections to CSV:", error);
    res.status(500).json({ error: "Failed to export collections" });
  }
});

export default router;