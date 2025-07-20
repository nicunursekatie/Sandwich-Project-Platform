import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage-wrapper";
import { requirePermission, isAuthenticated, optionalAuth } from "../middleware/auth";
import { insertRecipientSchema } from "@shared/schema";
import { logger } from "../utils/logger";

const router = Router();

// Get all recipients
router.get("/", optionalAuth, async (req: any, res) => {
  try {
    const recipients = await storage.getAllRecipients();
    res.json(recipients);
  } catch (error) {
    logger.error("Error fetching recipients:", error);
    res.status(500).json({ error: "Failed to fetch recipients" });
  }
});

// Get single recipient
router.get("/:id", optionalAuth, async (req: any, res) => {
  try {
    const recipientId = parseInt(req.params.id);
    const recipient = await storage.getRecipientById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }
    res.json(recipient);
  } catch (error) {
    logger.error("Error fetching recipient:", error);
    res.status(500).json({ error: "Failed to fetch recipient" });
  }
});

// Create new recipient
router.post("/", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const validatedData = insertRecipientSchema.parse(req.body);
    const recipient = await storage.createRecipient(validatedData);
    res.status(201).json(recipient);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid recipient data", details: error?.errors || "Unknown" });
    }
    logger.error("Error creating recipient:", error);
    res.status(500).json({ error: "Failed to create recipient" });
  }
});

// Update recipient
router.patch("/:id", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const recipientId = parseInt(req.params.id);
    
    // Validate recipient exists
    const existingRecipient = await storage.getRecipientById(recipientId);
    if (!existingRecipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    const updatedRecipient = await storage.updateRecipient(recipientId, req.body);
    res.json(updatedRecipient);
  } catch (error) {
    logger.error("Error updating recipient:", error);
    res.status(500).json({ error: "Failed to update recipient" });
  }
});

// Delete recipient
router.delete("/:id", requirePermission("delete_data"), async (req: any, res) => {
  try {
    const recipientId = parseInt(req.params.id);
    
    // Validate recipient exists
    const existingRecipient = await storage.getRecipientById(recipientId);
    if (!existingRecipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    await storage.deleteRecipient(recipientId);
    res.json({ message: "Recipient deleted successfully" });
  } catch (error) {
    logger.error("Error deleting recipient:", error);
    res.status(500).json({ error: "Failed to delete recipient" });
  }
});

// Recipient status (active/inactive)
router.patch("/:id/status", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const recipientId = parseInt(req.params.id);
    const { isActive } = req.body;
    
    const updatedRecipient = await storage.updateRecipient(recipientId, { isActive });
    res.json(updatedRecipient);
  } catch (error) {
    logger.error("Error updating recipient status:", error);
    res.status(500).json({ error: "Failed to update recipient status" });
  }
});

// Get recipients by type/category
router.get("/type/:type", optionalAuth, async (req: any, res) => {
  try {
    const type = req.params.type;
    const recipients = await storage.getRecipientsByType(type);
    res.json(recipients);
  } catch (error) {
    logger.error("Error fetching recipients by type:", error);
    res.status(500).json({ error: "Failed to fetch recipients by type" });
  }
});

// Get recipient distributions
router.get("/:id/distributions", optionalAuth, async (req: any, res) => {
  try {
    const recipientId = parseInt(req.params.id);
    const { startDate, endDate } = req.query;
    
    const dateRange = startDate && endDate ? { 
      startDate: new Date(startDate as string), 
      endDate: new Date(endDate as string) 
    } : undefined;
    
    const distributions = await storage.getRecipientDistributions(recipientId, dateRange);
    res.json(distributions);
  } catch (error) {
    logger.error("Error fetching recipient distributions:", error);
    res.status(500).json({ error: "Failed to fetch recipient distributions" });
  }
});

// Get recipient statistics
router.get("/:id/stats", optionalAuth, async (req: any, res) => {
  try {
    const recipientId = parseInt(req.params.id);
    const stats = await storage.getRecipientStats(recipientId);
    res.json(stats);
  } catch (error) {
    logger.error("Error fetching recipient stats:", error);
    res.status(500).json({ error: "Failed to fetch recipient stats" });
  }
});

export default router;