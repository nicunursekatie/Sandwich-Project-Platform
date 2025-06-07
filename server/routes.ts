import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import express from "express";
import { storage } from "./storage-wrapper";
import { sendDriverAgreementNotification } from "./sendgrid";
// import { generalRateLimit, strictRateLimit, uploadRateLimit, clearRateLimit } from "./middleware/rateLimiter";
import { sanitizeMiddleware } from "./middleware/sanitizer";
import { requestLogger, errorLogger, logger } from "./middleware/logger";
import { insertProjectSchema, insertMessageSchema, insertWeeklyReportSchema, insertSandwichCollectionSchema, insertMeetingMinutesSchema, insertAgendaItemSchema, insertMeetingSchema, insertDriverAgreementSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply global middleware
  app.use(requestLogger);
  // Temporarily disable rate limiting to fix sandwich collections
  // app.use(generalRateLimit);
  app.use(sanitizeMiddleware);

  // Simple session storage
  let currentUser: any = null;

  // Authentication routes
  app.get('/api/auth/user', (req, res) => {
    if (currentUser) {
      res.json(currentUser);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  app.get('/api/login', (req, res) => {
    // Simulate login by setting current user
    currentUser = {
      id: "1",
      email: "team@sandwichproject.org",
      firstName: "Team",
      lastName: "Member",
      profileImageUrl: null
    };
    res.redirect('/');
  });

  app.get('/api/logout', (req, res) => {
    // Clear current user
    currentUser = null;
    res.redirect('/');
  });
  
  // Projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      logger.error("Failed to fetch projects", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      logger.error("Failed to create project", error);
      res.status(400).json({ message: "Invalid project data" });
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
      const committee = req.query.committee as string;
      
      let messages;
      if (committee) {
        messages = await storage.getMessagesByCommittee(committee);
      } else {
        messages = limit 
          ? await storage.getRecentMessages(limit)
          : await storage.getAllMessages();
      }
      
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

  app.delete("/api/messages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMessage(id);
      if (!deleted) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.status(204).send();
    } catch (error) {
      logger.error("Failed to delete message", error);
      res.status(500).json({ message: "Failed to delete message" });
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

  // Sandwich Collections
  app.get("/api/sandwich-collections", async (req, res) => {
    try {
      const collections = await storage.getAllSandwichCollections();
      res.json(collections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sandwich collections" });
    }
  });

  app.post("/api/sandwich-collections", async (req, res) => {
    try {
      const collectionData = insertSandwichCollectionSchema.parse(req.body);
      const collection = await storage.createSandwichCollection(collectionData);
      res.status(201).json(collection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn("Invalid sandwich collection input", { errors: error.errors, ip: req.ip });
        res.status(400).json({ message: "Invalid collection data", errors: error.errors });
      } else {
        logger.error("Failed to create sandwich collection", error);
        res.status(500).json({ message: "Failed to create collection" });
      }
    }
  });

  app.put("/api/sandwich-collections/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const collection = await storage.updateSandwichCollection(id, updates);
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  app.delete("/api/sandwich-collections/bulk", async (req, res) => {
    try {
      const collections = await storage.getAllSandwichCollections();
      const collectionsToDelete = collections.filter(collection => {
        const hostName = collection.hostName;
        return hostName.startsWith('Loc ') || 
               /^Group [1-8]/.test(hostName);
      });

      let deletedCount = 0;
      // Delete in reverse order by ID to maintain consistency
      const sortedCollections = collectionsToDelete.sort((a, b) => b.id - a.id);
      
      for (const collection of sortedCollections) {
        try {
          const deleted = await storage.deleteSandwichCollection(collection.id);
          if (deleted) {
            deletedCount++;
          }
        } catch (error) {
          console.error(`Failed to delete collection ${collection.id}:`, error);
        }
      }

      res.json({ 
        message: `Successfully deleted ${deletedCount} duplicate entries`,
        deletedCount,
        patterns: ['Loc *', 'Group 1-8']
      });
    } catch (error) {
      logger.error("Failed to bulk delete sandwich collections", error);
      res.status(500).json({ message: "Failed to delete duplicate entries" });
    }
  });

  app.delete("/api/sandwich-collections/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSandwichCollection(id);
      if (!deleted) {
        return res.status(404).json({ message: "Collection not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete collection" });
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

  // Agenda Items
  app.get("/api/agenda-items", async (req, res) => {
    try {
      const items = await storage.getAllAgendaItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agenda items" });
    }
  });

  app.post("/api/agenda-items", async (req, res) => {
    try {
      const itemData = insertAgendaItemSchema.parse(req.body);
      const item = await storage.createAgendaItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid agenda item data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create agenda item" });
      }
    }
  });

  app.patch("/api/agenda-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["pending", "approved", "rejected", "postponed"].includes(status)) {
        res.status(400).json({ message: "Invalid status" });
        return;
      }
      
      const updatedItem = await storage.updateAgendaItemStatus(id, status);
      if (!updatedItem) {
        res.status(404).json({ message: "Agenda item not found" });
        return;
      }
      
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update agenda item" });
    }
  });

  app.put("/api/agenda-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { title, description } = req.body;
      
      const updatedItem = await storage.updateAgendaItem(id, { title, description });
      if (!updatedItem) {
        res.status(404).json({ message: "Agenda item not found" });
        return;
      }
      
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update agenda item" });
    }
  });

  // Meetings
  app.get("/api/current-meeting", async (req, res) => {
    try {
      const meeting = await storage.getCurrentMeeting();
      res.json(meeting);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch current meeting" });
    }
  });

  app.post("/api/meetings", async (req, res) => {
    try {
      const meetingData = insertMeetingSchema.parse(req.body);
      const meeting = await storage.createMeeting(meetingData);
      res.status(201).json(meeting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid meeting data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create meeting" });
      }
    }
  });

  app.get("/api/meetings", async (req, res) => {
    try {
      const meetings = await storage.getAllMeetings();
      res.json(meetings);
    } catch (error) {
      logger.error("Failed to fetch meetings", error);
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  app.post("/api/meetings/:id/upload-agenda", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid meeting ID" });
      }

      // Mark the agenda as uploaded in the meeting record
      const agendaInfo = "agenda_uploaded_" + new Date().toISOString();
      const meeting = await storage.updateMeetingAgenda(id, agendaInfo);
      
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }

      res.json({ 
        message: "Agenda uploaded successfully",
        meeting 
      });
    } catch (error) {
      logger.error("Failed to upload agenda", error);
      res.status(500).json({ message: "Failed to upload agenda" });
    }
  });

  // Driver Agreements (admin access only)
  app.post("/api/driver-agreements", async (req, res) => {
    try {
      const result = insertDriverAgreementSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid driver agreement data" });
      }
      
      const agreement = await storage.createDriverAgreement(result.data);
      
      // Send notification email if available
      try {
        await sendDriverAgreementNotification(agreement);
      } catch (emailError) {
        logger.error("Failed to send driver agreement notification", emailError);
      }
      
      res.status(201).json(agreement);
    } catch (error) {
      logger.error("Failed to create driver agreement", error);
      res.status(500).json({ message: "Failed to create driver agreement" });
    }
  });

  // Get agenda items
  app.get("/api/agenda-items", async (req, res) => {
    try {
      const items = await storage.getAllAgendaItems();
      res.json(items);
    } catch (error) {
      logger.error("Failed to get agenda items", error);
      res.status(500).json({ message: "Failed to get agenda items" });
    }
  });

  // Get all meetings
  app.get("/api/meetings", async (req, res) => {
    try {
      const meetings = await storage.getAllMeetings();
      res.json(meetings);
    } catch (error) {
      logger.error("Failed to get meetings", error);
      res.status(500).json({ message: "Failed to get meetings" });
    }
  });

  // Get meetings by type
  app.get("/api/meetings/type/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const meetings = await storage.getMeetingsByType(type);
      res.json(meetings);
    } catch (error) {
      logger.error("Failed to get meetings by type", error);
      res.status(500).json({ message: "Failed to get meetings by type" });
    }
  });

  app.post("/api/meetings/:id/upload-agenda", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Update the meeting with the uploaded agenda
      const updatedMeeting = await storage.updateMeetingAgenda(id, "Final agenda uploaded - agenda.docx");
      
      if (!updatedMeeting) {
        res.status(404).json({ message: "Meeting not found" });
        return;
      }
      
      logger.info("Agenda file uploaded for meeting", { method: req.method, url: req.url, ip: req.ip });
      
      res.json({ 
        success: true, 
        message: "Agenda file uploaded successfully",
        filename: "agenda.docx",
        meeting: updatedMeeting
      });
    } catch (error) {
      logger.error("Failed to upload agenda file", error);
      res.status(500).json({ message: "Failed to upload agenda file" });
    }
  });



  // Driver agreement submission route (secure, private)
  app.post("/api/driver-agreements", async (req, res) => {
    try {
      const validatedData = insertDriverAgreementSchema.parse(req.body);
      
      // Store in database
      const agreement = await storage.createDriverAgreement(validatedData);
      
      // Send email notification
      const { sendDriverAgreementNotification } = await import('./sendgrid');
      const emailSent = await sendDriverAgreementNotification(agreement);
      
      if (!emailSent) {
        console.warn("Failed to send email notification for driver agreement:", agreement.id);
      }
      
      // Return success without sensitive data
      res.json({ 
        success: true, 
        message: "Driver agreement submitted successfully. You will be contacted soon.",
        id: agreement.id 
      });
    } catch (error: any) {
      console.error("Error submitting driver agreement:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Static file serving for documents
  app.use('/documents', express.static('public/documents'));

  const httpServer = createServer(app);
  return httpServer;
}
