import { Router } from "express";
import { storage } from "../storage-wrapper";
import { optionalAuth, requirePermission } from "../middleware/auth";
import { ReportGenerator } from "../reporting/report-generator";
import { CacheManager } from "../performance/cache-manager";
import { logger } from "../utils/logger";

const router = Router();

// Get general analytics summary
router.get("/summary", optionalAuth, async (req: any, res) => {
  try {
    const summary = await storage.getAnalyticsSummary();
    res.json(summary);
  } catch (error) {
    logger.error("Error fetching analytics summary:", error);
    res.status(500).json({ error: "Failed to fetch analytics summary" });
  }
});

// Get collection analytics by date range
router.get("/collections/by-date", optionalAuth, async (req: any, res) => {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query;
    
    const dateRange = startDate && endDate ? {
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string)
    } : undefined;
    
    const analytics = await storage.getCollectionAnalyticsByDate(dateRange, groupBy as string);
    res.json(analytics);
  } catch (error) {
    logger.error("Error fetching collection analytics by date:", error);
    res.status(500).json({ error: "Failed to fetch collection analytics by date" });
  }
});

// Get top performers (hosts/recipients)
router.get("/top-performers", optionalAuth, async (req: any, res) => {
  try {
    const { type = "hosts", limit = 10, timeframe = "all" } = req.query;
    
    const topPerformers = await storage.getTopPerformers(
      type as string, 
      parseInt(limit as string), 
      timeframe as string
    );
    res.json(topPerformers);
  } catch (error) {
    logger.error("Error fetching top performers:", error);
    res.status(500).json({ error: "Failed to fetch top performers" });
  }
});

// Get trends analysis
router.get("/trends", optionalAuth, async (req: any, res) => {
  try {
    const { metric = "sandwiches", period = "monthly" } = req.query;
    
    const trends = await storage.getTrends(metric as string, period as string);
    res.json(trends);
  } catch (error) {
    logger.error("Error fetching trends analysis:", error);
    res.status(500).json({ error: "Failed to fetch trends analysis" });
  }
});

// Get geographical distribution
router.get("/geography", optionalAuth, async (req: any, res) => {
  try {
    const geoData = await storage.getGeographicalDistribution();
    res.json(geoData);
  } catch (error) {
    logger.error("Error fetching geographical distribution:", error);
    res.status(500).json({ error: "Failed to fetch geographical distribution" });
  }
});

// Generate and download reports
router.post("/reports/generate", requirePermission("view_reports"), async (req: any, res) => {
  try {
    const { type, format = "pdf", filters = {}, includeCharts = false } = req.body;
    
    if (!type) {
      return res.status(400).json({ error: "Report type is required" });
    }

    const reportData = await ReportGenerator.generateReport(type, {
      format,
      filters,
      includeCharts,
      requestedBy: req.user?.email || "unknown"
    });

    // Set appropriate headers based on format
    if (format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${type}-report.pdf"`);
    } else if (format === "csv") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${type}-report.csv"`);
    } else {
      res.setHeader("Content-Type", "application/json");
    }

    res.send(reportData);
  } catch (error) {
    logger.error("Error generating report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

// Schedule recurring reports
router.post("/reports/schedule", requirePermission("view_reports"), async (req: any, res) => {
  try {
    const { type, frequency, recipients, format = "pdf" } = req.body;
    
    if (!type || !frequency || !recipients) {
      return res.status(400).json({ error: "Missing required fields for scheduled report" });
    }

    const scheduledReport = await storage.createScheduledReport({
      type,
      frequency,
      recipients,
      format,
      createdBy: req.user?.id,
      isActive: true
    });

    res.status(201).json(scheduledReport);
  } catch (error) {
    logger.error("Error scheduling report:", error);
    res.status(500).json({ error: "Failed to schedule report" });
  }
});

// Get performance metrics
router.get("/performance", requirePermission("view_reports"), async (req: any, res) => {
  try {
    const metrics = await CacheManager.getPerformanceMetrics();
    res.json(metrics);
  } catch (error) {
    logger.error("Error fetching performance metrics:", error);
    res.status(500).json({ error: "Failed to fetch performance metrics" });
  }
});

// Get cached analytics data
router.get("/cached/:cacheKey", optionalAuth, async (req: any, res) => {
  try {
    const { cacheKey } = req.params;
    const cachedData = await CacheManager.get(cacheKey);
    
    if (!cachedData) {
      return res.status(404).json({ error: "Cached data not found" });
    }

    res.json(cachedData);
  } catch (error) {
    logger.error("Error fetching cached analytics:", error);
    res.status(500).json({ error: "Failed to fetch cached analytics" });
  }
});

// Clear analytics cache
router.delete("/cache", requirePermission("view_reports"), async (req: any, res) => {
  try {
    const { pattern } = req.query;
    
    if (pattern) {
      await CacheManager.clearPattern(pattern as string);
    } else {
      await CacheManager.clearAll();
    }

    res.json({ message: "Analytics cache cleared successfully" });
  } catch (error) {
    logger.error("Error clearing analytics cache:", error);
    res.status(500).json({ error: "Failed to clear analytics cache" });
  }
});

export default router;