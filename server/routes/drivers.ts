import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage-wrapper";
import { requirePermission, isAuthenticated, optionalAuth } from "../middleware/auth";
import { insertDriverSchema } from "@shared/schema";
import { logger } from "../utils/logger";

const router = Router();

// Get all drivers
router.get("/", optionalAuth, async (req: any, res) => {
  try {
    const drivers = await storage.getAllDrivers();
    res.json(drivers);
  } catch (error) {
    logger.error("Error fetching drivers:", error);
    res.status(500).json({ error: "Failed to fetch drivers" });
  }
});

// Get single driver
router.get("/:id", optionalAuth, async (req: any, res) => {
  try {
    const driverId = parseInt(req.params.id);
    const driver = await storage.getDriverById(driverId);
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    res.json(driver);
  } catch (error) {
    logger.error("Error fetching driver:", error);
    res.status(500).json({ error: "Failed to fetch driver" });
  }
});

// Create new driver
router.post("/", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const validatedData = insertDriverSchema.parse(req.body);
    const driver = await storage.createDriver(validatedData);
    res.status(201).json(driver);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid driver data", details: error?.errors || "Unknown" });
    }
    logger.error("Error creating driver:", error);
    res.status(500).json({ error: "Failed to create driver" });
  }
});

// Update driver
router.patch("/:id", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const driverId = parseInt(req.params.id);
    
    // Validate driver exists
    const existingDriver = await storage.getDriverById(driverId);
    if (!existingDriver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    const updatedDriver = await storage.updateDriver(driverId, req.body);
    res.json(updatedDriver);
  } catch (error) {
    logger.error("Error updating driver:", error);
    res.status(500).json({ error: "Failed to update driver" });
  }
});

// Delete driver
router.delete("/:id", requirePermission("delete_data"), async (req: any, res) => {
  try {
    const driverId = parseInt(req.params.id);
    
    // Validate driver exists
    const existingDriver = await storage.getDriverById(driverId);
    if (!existingDriver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    await storage.deleteDriver(driverId);
    res.json({ message: "Driver deleted successfully" });
  } catch (error) {
    logger.error("Error deleting driver:", error);
    res.status(500).json({ error: "Failed to delete driver" });
  }
});

// Driver agreement status endpoints
router.patch("/:id/agreement", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const driverId = parseInt(req.params.id);
    const { status, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: "Agreement status is required" });
    }

    const updatedDriver = await storage.updateDriverAgreement(driverId, status, notes);
    res.json(updatedDriver);
  } catch (error) {
    logger.error("Error updating driver agreement:", error);
    res.status(500).json({ error: "Failed to update driver agreement" });
  }
});

// Driver zone assignment
router.patch("/:id/zone", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const driverId = parseInt(req.params.id);
    const { zone } = req.body;
    
    const updatedDriver = await storage.updateDriver(driverId, { zone });
    res.json(updatedDriver);
  } catch (error) {
    logger.error("Error updating driver zone:", error);
    res.status(500).json({ error: "Failed to update driver zone" });
  }
});

// Driver status (active/inactive)
router.patch("/:id/status", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const driverId = parseInt(req.params.id);
    const { isActive } = req.body;
    
    const updatedDriver = await storage.updateDriver(driverId, { isActive });
    res.json(updatedDriver);
  } catch (error) {
    logger.error("Error updating driver status:", error);
    res.status(500).json({ error: "Failed to update driver status" });
  }
});

// Get drivers by zone
router.get("/zone/:zone", optionalAuth, async (req: any, res) => {
  try {
    const zone = req.params.zone;
    const drivers = await storage.getDriversByZone(zone);
    res.json(drivers);
  } catch (error) {
    logger.error("Error fetching drivers by zone:", error);
    res.status(500).json({ error: "Failed to fetch drivers by zone" });
  }
});

// Get van-approved drivers
router.get("/van-approved", optionalAuth, async (req: any, res) => {
  try {
    const drivers = await storage.getVanApprovedDrivers();
    res.json(drivers);
  } catch (error) {
    logger.error("Error fetching van-approved drivers:", error);
    res.status(500).json({ error: "Failed to fetch van-approved drivers" });
  }
});

export default router;