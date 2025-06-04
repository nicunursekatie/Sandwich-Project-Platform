import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertMessageSchema, insertWeeklyReportSchema, insertMeetingMinutesSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects/:id/claim", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { assigneeName } = req.body;
      
      const updatedProject = await storage.updateProject(id, {
        status: "in_progress",
        assigneeName: assigneeName || "You"
      });
      
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: "Failed to claim project" });
    }
  });

  // Messages
  app.get("/api/messages", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const messages = limit 
        ? await storage.getRecentMessages(limit)
        : await storage.getAllMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  // Weekly Reports
  app.get("/api/weekly-reports", async (req, res) => {
    try {
      const reports = await storage.getAllWeeklyReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly reports" });
    }
  });

  app.post("/api/weekly-reports", async (req, res) => {
    try {
      const reportData = insertWeeklyReportSchema.parse(req.body);
      const report = await storage.createWeeklyReport(reportData);
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ message: "Invalid report data" });
    }
  });

  // Meeting Minutes
  app.get("/api/meeting-minutes", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const minutes = limit 
        ? await storage.getRecentMeetingMinutes(limit)
        : await storage.getAllMeetingMinutes();
      res.json(minutes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meeting minutes" });
    }
  });

  app.post("/api/meeting-minutes", async (req, res) => {
    try {
      const minutesData = insertMeetingMinutesSchema.parse(req.body);
      const minutes = await storage.createMeetingMinutes(minutesData);
      res.status(201).json(minutes);
    } catch (error) {
      res.status(400).json({ message: "Invalid meeting minutes data" });
    }
  });

  // Drive Links
  app.get("/api/drive-links", async (req, res) => {
    try {
      const links = await storage.getAllDriveLinks();
      res.json(links);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch drive links" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
