import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import express from "express";
import session from "express-session";
import multer from "multer";
import { parse } from 'csv-parse/sync';
import fs from 'fs/promises';
import path from 'path';
import mammoth from 'mammoth';
import { storage } from "./storage-wrapper";
import { sendDriverAgreementNotification } from "./sendgrid";
// import { generalRateLimit, strictRateLimit, uploadRateLimit, clearRateLimit } from "./middleware/rateLimiter";
import { sanitizeMiddleware } from "./middleware/sanitizer";
import { requestLogger, errorLogger, logger } from "./middleware/logger";
import { insertProjectSchema, insertProjectTaskSchema, insertProjectCommentSchema, insertMessageSchema, insertWeeklyReportSchema, insertSandwichCollectionSchema, insertMeetingMinutesSchema, insertAgendaItemSchema, insertMeetingSchema, insertDriverAgreementSchema, insertHostSchema, insertHostContactSchema, insertRecipientSchema, insertContactSchema } from "@shared/schema";

// Extend Request interface to include file metadata
declare global {
  namespace Express {
    interface Request {
      fileMetadata?: {
        fileName: string;
        filePath: string;
        fileType: string;
        mimeType: string;
      };
    }
  }
}
import dataManagementRoutes from "./routes/data-management";
import { registerPerformanceRoutes } from "./routes/performance";
import { SearchEngine } from "./search-engine";
import { CacheManager } from "./performance/cache-manager";
import { ReportGenerator } from "./reporting/report-generator";
import { EmailService } from "./notifications/email-service";
import { VersionControl } from "./middleware/version-control";
import { BackupManager } from "./operations/backup-manager";

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Configure multer for meeting minutes file uploads
const meetingMinutesUpload = multer({
  dest: 'uploads/meeting-minutes/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const hasValidMimeType = allowedMimeTypes.includes(file.mimetype);
    const hasValidExtension = allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));
    
    if (hasValidMimeType || hasValidExtension) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed for meeting minutes'));
    }
  }
});

// Configure multer for import operations (memory storage)
const importUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const allowedExtensions = ['.csv', '.xls', '.xlsx'];
    const hasValidType = allowedTypes.includes(file.mimetype);
    const hasValidExtension = allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));
    
    if (hasValidType || hasValidExtension) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  }
});

// Configure multer for project files (supports various file types)
const projectFilesUpload = multer({
  dest: 'uploads/projects/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
  fileFilter: (req, file, cb) => {
    // Allow most common file types for project documentation
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'text/plain', 'text/csv',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip', 'application/x-zip-compressed'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Add session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'temp-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // Setup temporary authentication
  const { setupTempAuth, isAuthenticated, requirePermission } = await import("./temp-auth");
  setupTempAuth(app);

  // Import and register signup routes
  const { signupRoutes } = await import("./routes/signup");
  app.use("/api", signupRoutes);

  // Add a simple login page for testing
  app.get('/api/login', (req, res) => {
    res.send(`
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 400px; margin: 100px auto; padding: 20px;">
          <h2>Login as Test Admin</h2>
          <button onclick="login()" style="background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">
            Login as Admin
          </button>
          <script>
            function login() {
              fetch('/api/temp-login', { method: 'POST' })
                .then(res => res.json())
                .then(() => window.location.href = '/')
                .catch(err => alert('Login failed'));
            }
          </script>
        </body>
      </html>
    `);
  });

  // Import and use the new modular routes
  const { apiRoutes } = await import("./routes/index");
  app.use(apiRoutes);
  
  // Register performance optimization routes
  registerPerformanceRoutes(app);
  // Apply global middleware
  app.use(requestLogger);
  // Temporarily disable rate limiting to fix sandwich collections
  // app.use(generalRateLimit);
  app.use(sanitizeMiddleware);

  // User management routes
  app.get('/api/users', isAuthenticated, requirePermission('view_users'), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/users/:id', isAuthenticated, requirePermission('manage_users'), async (req, res) => {
    try {
      const { id } = req.params;
      const { role, permissions } = req.body;
      const updatedUser = await storage.updateUser(id, { role, permissions });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.patch('/api/users/:id/status', isAuthenticated, requirePermission('manage_users'), async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const updatedUser = await storage.updateUser(id, { isActive });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
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
      console.log("Received project data:", req.body);
      const projectData = insertProjectSchema.parse(req.body);
      console.log("Parsed project data:", projectData);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      console.error("Project creation error details:", error);
      logger.error("Failed to create project", error);
      res.status(400).json({ 
        message: "Invalid project data", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
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

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      // Filter out timestamp fields that shouldn't be updated directly
      const { createdAt, updatedAt, ...validUpdates } = updates;
      
      const updatedProject = await storage.updateProject(id, validUpdates);
      
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(updatedProject);
    } catch (error) {
      logger.error("Failed to update project", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      // Filter out timestamp fields that shouldn't be updated directly
      const { createdAt, updatedAt, ...validUpdates } = updates;
      
      const updatedProject = await storage.updateProject(id, validUpdates);
      
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(updatedProject);
    } catch (error) {
      logger.error("Failed to update project", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const deleted = await storage.deleteProject(id);
      if (!deleted) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      logger.error("Failed to delete project", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Project Files
  app.post("/api/projects/:id/files", projectFilesUpload.array('files'), async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      // Process uploaded files and return metadata
      const fileMetadata = files.map(file => ({
        name: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        path: file.path,
        uploadedAt: new Date().toISOString()
      }));

      res.status(201).json({ 
        message: "Files uploaded successfully", 
        files: fileMetadata 
      });
    } catch (error) {
      logger.error("Failed to upload project files", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  });

  app.get("/api/projects/:id/files", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      // For now, return empty array as file storage is basic
      // In a production app, you'd store file metadata in database
      res.json([]);
    } catch (error) {
      logger.error("Failed to fetch project files", error);
      res.status(500).json({ message: "Failed to fetch files" });
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

  // Sandwich Collections Stats - Complete totals including individual + group collections
  app.get("/api/sandwich-collections/stats", async (req, res) => {
    try {
      const collections = await storage.getAllSandwichCollections();
      
      let individualTotal = 0;
      let groupTotal = 0;
      
      collections.forEach(collection => {
        individualTotal += collection.individualSandwiches || 0;
        
        // Calculate group collections total
        try {
          const groupData = JSON.parse(collection.groupCollections || "[]");
          if (Array.isArray(groupData)) {
            groupTotal += groupData.reduce((sum: number, group: any) => sum + (group.sandwichCount || 0), 0);
          }
        } catch (error) {
          // Handle text format like "Marketing Team: 8, Development: 6"
          if (collection.groupCollections && collection.groupCollections !== "[]") {
            const matches = collection.groupCollections.match(/(\d+)/g);
            if (matches) {
              groupTotal += matches.reduce((sum, num) => sum + parseInt(num), 0);
            }
          }
        }
      });
      
      res.json({
        totalEntries: collections.length,
        individualSandwiches: individualTotal,
        groupSandwiches: groupTotal,
        completeTotalSandwiches: individualTotal + groupTotal
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sandwich collection stats" });
    }
  });

  // Sandwich Collections
  app.get("/api/sandwich-collections", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const result = await storage.getSandwichCollections(limit, offset);
      const totalCount = await storage.getSandwichCollectionsCount();
      
      res.json({
        collections: result,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        }
      });
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
        logger.warn("Invalid sandwich collection input", { error: error.errors, ip: req.ip });
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

  // Batch delete sandwich collections (must be before :id route)
  app.delete("/api/sandwich-collections/batch-delete", async (req, res) => {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid or empty IDs array" });
      }

      let deletedCount = 0;
      const errors = [];

      // Delete in reverse order to maintain consistency
      const sortedIds = ids.sort((a, b) => b - a);

      for (const id of sortedIds) {
        try {
          const deleted = await storage.deleteSandwichCollection(id);
          if (deleted) {
            deletedCount++;
          } else {
            errors.push(`Collection with ID ${id} not found`);
          }
        } catch (error) {
          errors.push(`Failed to delete collection ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      res.json({
        message: `Successfully deleted ${deletedCount} of ${ids.length} collections`,
        deletedCount,
        totalRequested: ids.length,
        errors: errors.length > 0 ? errors.slice(0, 5) : undefined
      });
    } catch (error) {
      logger.error("Failed to batch delete collections", error);
      res.status(500).json({ message: "Failed to batch delete collections" });
    }
  });

  // Clean duplicates from sandwich collections (must be before :id route)
  app.delete("/api/sandwich-collections/clean-duplicates", async (req, res) => {
    try {
      const { mode = 'exact' } = req.body; // 'exact', 'suspicious', or 'og-duplicates'
      const collections = await storage.getAllSandwichCollections();

      let collectionsToDelete = [];

      if (mode === 'exact') {
        // Find exact duplicates based on date, host, and counts
        const duplicateGroups = new Map();

        collections.forEach(collection => {
          const key = `${collection.collectionDate}-${collection.hostName}-${collection.individualSandwiches}-${collection.groupCollections}`;

          if (!duplicateGroups.has(key)) {
            duplicateGroups.set(key, []);
          }
          duplicateGroups.get(key).push(collection);
        });

        // Keep only the newest entry from each duplicate group
        duplicateGroups.forEach(group => {
          if (group.length > 1) {
            const sorted = group.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
            collectionsToDelete.push(...sorted.slice(1)); // Keep first (newest), delete rest
          }
        });
      } else if (mode === 'og-duplicates') {
        // Find duplicates between OG Sandwich Project and early collections with no location data
        const ogCollections = collections.filter(c => c.hostName === 'OG Sandwich Project');
        const earlyCollections = collections.filter(c => 
          c.hostName !== 'OG Sandwich Project' && 
          (c.hostName === '' || c.hostName === null || c.hostName.trim() === '' || 
           c.hostName.toLowerCase().includes('unknown') || c.hostName.toLowerCase().includes('no location'))
        );

        // Create a map of OG entries by date and count
        const ogMap = new Map();
        ogCollections.forEach(og => {
          const key = `${og.collectionDate}-${og.individualSandwiches}`;
          if (!ogMap.has(key)) {
            ogMap.set(key, []);
          }
          ogMap.get(key).push(og);
        });

        // Find matching early collections and mark older/duplicate entries for deletion
        earlyCollections.forEach(early => {
          const key = `${early.collectionDate}-${early.individualSandwiches}`;
          if (ogMap.has(key)) {
            const ogEntries = ogMap.get(key);
            // If we have matching OG entries, mark the early collection for deletion
            // as OG entries are the authoritative historical record
            collectionsToDelete.push(early);
          }
        });

        // Also check for duplicate OG entries with same date/count and keep only the newest
        ogMap.forEach(ogGroup => {
          if (ogGroup.length > 1) {
            const sorted = ogGroup.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
            collectionsToDelete.push(...sorted.slice(1)); // Keep newest, delete duplicates
          }
        });
      } else if (mode === 'suspicious') {
        // Remove entries with suspicious patterns
        collectionsToDelete = collections.filter(collection => {
          const hostName = collection.hostName.toLowerCase();
          return hostName.startsWith('loc ') || 
                 hostName.match(/^group \d-\d$/) ||
                 hostName.match(/^group \d+$/) ||  // Matches "Group 8", "Group 1", etc.
                 hostName.includes('test') ||
                 hostName.includes('duplicate');
        });
      }

      let deletedCount = 0;
      const errors = [];

      // Delete in reverse order by ID to maintain consistency
      const sortedCollections = collectionsToDelete.sort((a, b) => b.id - a.id);

      for (const collection of sortedCollections) {
        try {
          // Ensure ID is a valid number
          const id = Number(collection.id);
          if (isNaN(id)) {
            errors.push(`Invalid collection ID: ${collection.id}`);
            continue;
          }
          
          const deleted = await storage.deleteSandwichCollection(id);
          if (deleted) {
            deletedCount++;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to delete collection ${collection.id}: ${errorMessage}`);
          console.error(`Failed to delete collection ${collection.id}:`, error);
        }
      }

      res.json({ 
        message: `Successfully cleaned ${deletedCount} duplicate entries using ${mode} mode`,
        deletedCount,
        totalRequested: collectionsToDelete.length,
        errors: errors.length > 0 ? errors.slice(0, 5) : undefined
      });
    } catch (error) {
      console.error("Failed to clean duplicates", error);
      res.status(500).json({ message: "Failed to clean duplicate entries" });
    }
  });

  app.delete("/api/sandwich-collections/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid collection ID" });
      }
      const deleted = await storage.deleteSandwichCollection(id);
      if (!deleted) {
        return res.status(404).json({ message: "Collection not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete collection" });
    }
  });

  // Analyze duplicates in sandwich collections
  app.get("/api/sandwich-collections/analyze-duplicates", async (req, res) => {
    try {
      const collections = await storage.getAllSandwichCollections();

      // Group by date, host, and sandwich counts to find exact duplicates
      const duplicateGroups = new Map();
      const suspiciousPatterns = [];
      const ogDuplicates = [];

      collections.forEach(collection => {
        const key = `${collection.collectionDate}-${collection.hostName}-${collection.individualSandwiches}-${collection.groupCollections}`;

        if (!duplicateGroups.has(key)) {
          duplicateGroups.set(key, []);
        }
        duplicateGroups.get(key).push(collection);

        // Check for suspicious patterns
        const hostName = collection.hostName.toLowerCase();
        if (hostName.startsWith('loc ') || 
            hostName.match(/^group \d-\d$/) ||
            hostName.includes('test') ||
            hostName.includes('duplicate')) {
          suspiciousPatterns.push(collection);
        }
      });

      // Find OG Sandwich Project duplicates with early collections
      const ogCollections = collections.filter(c => c.hostName === 'OG Sandwich Project');
      const earlyCollections = collections.filter(c => 
        c.hostName !== 'OG Sandwich Project' && 
        (c.hostName === '' || c.hostName === null || c.hostName.trim() === '' || 
         c.hostName.toLowerCase().includes('unknown') || c.hostName.toLowerCase().includes('no location'))
      );

      const ogMap = new Map();
      ogCollections.forEach(og => {
        const key = `${og.collectionDate}-${og.individualSandwiches}`;
        if (!ogMap.has(key)) {
          ogMap.set(key, []);
        }
        ogMap.get(key).push(og);
      });

      earlyCollections.forEach(early => {
        const key = `${early.collectionDate}-${early.individualSandwiches}`;
        if (ogMap.has(key)) {
          const ogEntries = ogMap.get(key);
          ogDuplicates.push({
            ogEntry: ogEntries[0],
            earlyEntry: early,
            reason: 'Same date and sandwich count as OG Project entry'
          });
        }
      });

      // Also find duplicate OG entries
      ogMap.forEach(ogGroup => {
        if (ogGroup.length > 1) {
          const sorted = ogGroup.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
          sorted.slice(1).forEach(duplicate => {
            ogDuplicates.push({
              ogEntry: sorted[0],
              duplicateOgEntry: duplicate,
              reason: 'Duplicate OG Project entry'
            });
          });
        }
      });

      // Find actual duplicates (groups with more than 1 entry)
      const duplicates = Array.from(duplicateGroups.values())
        .filter(group => group.length > 1)
        .map(group => ({
          entries: group,
          count: group.length,
          keepNewest: group.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0],
          toDelete: group.slice(1)
        }));

      res.json({
        totalCollections: collections.length,
        duplicateGroups: duplicates.length,
        totalDuplicateEntries: duplicates.reduce((sum, group) => sum + group.toDelete.length, 0),
        suspiciousPatterns: suspiciousPatterns.length,
        ogDuplicates: ogDuplicates.length,
        duplicates,
        suspiciousEntries: suspiciousPatterns,
        ogDuplicateEntries: ogDuplicates
      });
    } catch (error) {
      logger.error("Failed to analyze duplicates", error);
      res.status(500).json({ message: "Failed to analyze duplicates" });
    }
  });

  // Clean duplicates from sandwich collections
  app.delete("/api/sandwich-collections/clean-duplicates", async (req, res) => {
    try {
      const { mode = 'exact' } = req.body; // 'exact', 'suspicious', or 'og-duplicates'
      const collections = await storage.getAllSandwichCollections();

      let collectionsToDelete = [];

      if (mode === 'exact') {
        // Find exact duplicates based on date, host, and counts
        const duplicateGroups = new Map();

        collections.forEach(collection => {
          const key = `${collection.collectionDate}-${collection.hostName}-${collection.individualSandwiches}-${collection.groupCollections}`;

          if (!duplicateGroups.has(key)) {
            duplicateGroups.set(key, []);
          }
          duplicateGroups.get(key).push(collection);
        });

        // Keep only the newest entry from each duplicate group
        duplicateGroups.forEach(group => {
          if (group.length > 1) {
            const sorted = group.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
            collectionsToDelete.push(...sorted.slice(1)); // Keep first (newest), delete rest
          }
        });
      } else if (mode === 'suspicious') {
        // Remove entries with suspicious patterns
        collectionsToDelete = collections.filter(collection => {
          const hostName = collection.hostName.toLowerCase();
          return hostName.startsWith('loc ') || 
                 hostName.match(/^group \d-\d$/) ||
                 hostName.match(/^group \d+$/) ||  // Matches "Group 8", "Group 1", etc.
                 hostName.includes('test') ||
                 hostName.includes('duplicate');
        });
      }

      let deletedCount = 0;
      const errors = [];

      // Delete in reverse order by ID to maintain consistency
      const sortedCollections = collectionsToDelete.sort((a, b) => b.id - a.id);

      for (const collection of sortedCollections) {
        try {
          // Ensure ID is a valid number
          const id = Number(collection.id);
          if (isNaN(id)) {
            errors.push(`Invalid collection ID: ${collection.id}`);
            continue;
          }
          
          const deleted = await storage.deleteSandwichCollection(id);
          if (deleted) {
            deletedCount++;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to delete collection ${collection.id}: ${errorMessage}`);
          console.error(`Failed to delete collection ${collection.id}:`, error);
        }
      }

      res.json({ 
        message: `Successfully cleaned ${deletedCount} duplicate entries using ${mode} mode`,
        deletedCount,
        totalFound: collectionsToDelete.length,
        errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
        mode
      });
    } catch (error) {
      logger.error("Failed to clean duplicates", error);
      res.status(500).json({ message: "Failed to clean duplicate entries" });
    }
  });

  // Batch edit sandwich collections
  app.patch("/api/sandwich-collections/batch-edit", async (req, res) => {
    try {
      const { ids, updates } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid or empty IDs array" });
      }

      if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No updates provided" });
      }

      let updatedCount = 0;
      const errors = [];

      for (const id of ids) {
        try {
          const updated = await storage.updateSandwichCollection(id, updates);
          if (updated) {
            updatedCount++;
          } else {
            errors.push(`Collection with ID ${id} not found`);
          }
        } catch (error) {
          errors.push(`Failed to update collection ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      res.json({
        message: `Successfully updated ${updatedCount} of ${ids.length} collections`,
        updatedCount,
        totalRequested: ids.length,
        errors: errors.length > 0 ? errors.slice(0, 5) : undefined
      });
    } catch (error) {
      logger.error("Failed to batch edit collections", error);
      res.status(500).json({ message: "Failed to batch edit collections" });
    }
  });

  // CSV Import for Sandwich Collections
  app.post("/api/import-collections", upload.single('csvFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No CSV file uploaded" });
      }

      const csvContent = await fs.readFile(req.file.path, 'utf-8');
      logger.info(`CSV content preview: ${csvContent.substring(0, 200)}...`);

      // Detect CSV format type
      const lines = csvContent.split('\n');
      let formatType = 'standard';
      
      // Check for complex weekly totals format
      if (lines[0].includes('WEEK #') || lines[0].includes('Hosts:')) {
        formatType = 'complex';
      }
      // Check for structured weekly data format
      else if (lines[0].includes('Week_Number') && lines[0].includes('Total_Sandwiches')) {
        formatType = 'structured';
      }
      
      let records = [];
      
      if (formatType === 'complex') {
        logger.info('Complex weekly totals format detected');
        // Find the row with actual data (skip header rows)
        let startRow = 0;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].match(/^\d+,/) && lines[i].includes('TRUE')) {
            startRow = i;
            break;
          }
        }
        
        // Parse the complex format manually
        for (let i = startRow; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line || !line.includes('TRUE')) continue;
          
          const parts = line.split(',');
          if (parts.length >= 5 && parts[4]) {
            const weekNum = parts[0];
            const date = parts[3];
            const totalSandwiches = parts[4].replace(/[",]/g, '');
            
            if (date && totalSandwiches && !isNaN(parseInt(totalSandwiches))) {
              records.push({
                'Host Name': `Week ${weekNum} Total`,
                'Sandwich Count': totalSandwiches,
                'Date': date,
                'Logged By': 'CSV Import',
                'Notes': `Weekly total import from complex spreadsheet`,
                'Created At': new Date().toISOString()
              });
            }
          }
        }
      } else if (formatType === 'structured') {
        logger.info('Structured weekly data format detected');
        // Parse the structured format
        const parsedData = parse(csvContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          delimiter: ',',
          quote: '"'
        });
        
        // Convert structured data to standard format
        for (const row of parsedData) {
          if (row.Week_Number && row.Date && row.Total_Sandwiches && parseInt(row.Total_Sandwiches) > 0) {
            // Parse the date to a more readable format
            const date = new Date(row.Date);
            const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
            
            records.push({
              'Host Name': `Week ${row.Week_Number} Complete Data`,
              'Sandwich Count': row.Total_Sandwiches,
              'Date': formattedDate,
              'Logged By': 'CSV Import',
              'Notes': `Structured weekly data import with location and group details`,
              'Created At': new Date().toISOString()
            });
          }
        }
      } else {
        logger.info('Standard CSV format detected');
        // Parse normal CSV format
        records = parse(csvContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          delimiter: ',',
          quote: '"'
        });
      }
      
      logger.info(`Parsed ${records.length} records`);
      if (records.length > 0) {
        logger.info(`First record: ${JSON.stringify(records[0])}`);
      }

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Process each record
      for (let i = 0; i < records.length; i++) {
        const record = records[i];

        try {
          // Debug log the record structure
          logger.info(`Processing row ${i + 1}:`, { record: JSON.stringify(record) });
          
          // Check for alternative column names
          const hostName = record['Host Name'] || record['Host'] || record['host_name'] || record['HostName'];
          const sandwichCountStr = record['Individual Sandwiches'] || record['Sandwich Count'] || record['Count'] || record['sandwich_count'] || record['SandwichCount'] || record['Sandwiches'];
          const date = record['Collection Date'] || record['Date'] || record['date'] || record['CollectionDate'];
          
          // Validate required fields with more detailed error reporting
          if (!hostName) {
            const availableKeys = Object.keys(record).join(', ');
            throw new Error(`Missing Host Name (available columns: ${availableKeys}) in row ${i + 1}`);
          }
          if (!sandwichCountStr) {
            const availableKeys = Object.keys(record).join(', ');
            throw new Error(`Missing Individual Sandwiches (available columns: ${availableKeys}) in row ${i + 1}`);
          }
          if (!date) {
            const availableKeys = Object.keys(record).join(', ');
            throw new Error(`Missing Collection Date (available columns: ${availableKeys}) in row ${i + 1}`);
          }

          // Parse sandwich count as integer
          const sandwichCount = parseInt(sandwichCountStr.toString().trim());
          if (isNaN(sandwichCount)) {
            throw new Error(`Invalid sandwich count "${sandwichCountStr}" in row ${i + 1}`);
          }

          // Parse dates
          let collectionDate = date;
          let submittedAt = new Date();

          // Try to parse Created At if provided
          const createdAt = record['Created At'] || record['created_at'] || record['CreatedAt'];
          if (createdAt) {
            const parsedDate = new Date(createdAt);
            if (!isNaN(parsedDate.getTime())) {
              submittedAt = parsedDate;
            }
          }

          // Handle Group Collections data
          const groupCollectionsStr = record['Group Collections'] || '';
          let groupCollections = '[]';
          if (groupCollectionsStr && groupCollectionsStr.trim() !== '') {
            // If it's a number, convert to simple array format
            const groupCount = parseInt(groupCollectionsStr.trim());
            if (!isNaN(groupCount) && groupCount > 0) {
              groupCollections = JSON.stringify([{ count: groupCount, description: 'Group Collection' }]);
            }
          }

          // Create sandwich collection
          await storage.createSandwichCollection({
            hostName: hostName.trim(),
            individualSandwiches: sandwichCount,
            collectionDate: collectionDate.trim(),
            groupCollections: groupCollections,
            submittedAt: submittedAt
          });

          successCount++;

        } catch (error) {
          errorCount++;
          const errorMsg = `Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          logger.error(errorMsg);
        }
      }

      // Clean up uploaded file
      await fs.unlink(req.file.path);

      const result = {
        totalRecords: records.length,
        successCount,
        errorCount,
        errors: errors.slice(0, 10) // Return first 10 errors
      };

      logger.info(`CSV import completed: ${successCount}/${records.length} records imported`);
      res.json(result);

    } catch (error) {
      // Clean up uploaded file if it exists
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          logger.error("Failed to clean up uploaded file", cleanupError);
        }
      }

      logger.error("CSV import failed", error);
      res.status(500).json({ 
        message: "Failed to import CSV file",
        error: error instanceof Error ? error.message : "Unknown error"
      });
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

  app.delete("/api/meeting-minutes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMeetingMinutes(id);
      
      if (success) {
        logger.info("Meeting minutes deleted", { 
          minutesId: id,
          method: req.method,
          url: req.url,
          ip: req.ip
        });
        res.json({ success: true, message: "Meeting minutes deleted successfully" });
      } else {
        res.status(404).json({ message: "Meeting minutes not found" });
      }
    } catch (error: any) {
      logger.error("Failed to delete meeting minutes", error);
      res.status(500).json({ message: "Failed to delete meeting minutes" });
    }
  });

  // Meeting minutes file upload endpoint
  app.post("/api/meeting-minutes/upload", meetingMinutesUpload.single('file'), async (req, res) => {
    try {
      const { meetingId, title, date, summary, googleDocsUrl } = req.body;
      
      if (!meetingId || !title || !date) {
        return res.status(400).json({ message: "Missing required fields: meetingId, title, date" });
      }

      let finalSummary = summary;
      let documentContent = "";
      
      // Handle file upload and store file
      if (req.file) {
        logger.info("Meeting minutes file uploaded", { 
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          meetingId: meetingId
        });
        
        try {
          // Create permanent storage path
          const uploadsDir = path.join(process.cwd(), 'uploads', 'meeting-minutes');
          await fs.mkdir(uploadsDir, { recursive: true });
          
          const permanentPath = path.join(uploadsDir, req.file.filename);
          await fs.copyFile(req.file.path, permanentPath);
          
          // Determine file type
          let fileType = 'unknown';
          if (req.file.mimetype === 'application/pdf') {
            fileType = 'pdf';
            finalSummary = `PDF document: ${req.file.originalname}`;
          } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                     req.file.originalname.toLowerCase().endsWith('.docx')) {
            fileType = 'docx';
            finalSummary = `DOCX document: ${req.file.originalname}`;
          } else if (req.file.mimetype === 'application/msword' || 
                     req.file.originalname.toLowerCase().endsWith('.doc')) {
            fileType = 'doc';
            finalSummary = `DOC document: ${req.file.originalname}`;
          } else {
            finalSummary = `Document: ${req.file.originalname}`;
          }
          
          // Store file metadata for later retrieval
          req.fileMetadata = {
            fileName: req.file.originalname,
            filePath: permanentPath,
            fileType: fileType,
            mimeType: req.file.mimetype
          };
          
          // Clean up temporary file
          await fs.unlink(req.file.path);
          
        } catch (fileError) {
          logger.error("Failed to store document file", fileError);
          finalSummary = `Document uploaded: ${req.file.originalname} (storage failed)`;
          // Clean up uploaded file even if storage failed
          try {
            await fs.unlink(req.file.path);
          } catch (unlinkError) {
            logger.error("Failed to clean up uploaded file", unlinkError);
          }
        }
      }
      
      // Handle Google Docs URL
      if (googleDocsUrl) {
        finalSummary = `Google Docs link: ${googleDocsUrl}`;
      }

      if (!finalSummary) {
        return res.status(400).json({ message: "Must provide either a file or Google Docs URL" });
      }

      // Create meeting minutes record
      const minutesData = {
        title,
        date,
        summary: finalSummary,
        fileName: req.fileMetadata?.fileName || null,
        filePath: req.fileMetadata?.filePath || null,
        fileType: req.fileMetadata?.fileType || (googleDocsUrl ? 'google_docs' : 'text'),
        mimeType: req.fileMetadata?.mimeType || null
      };

      const minutes = await storage.createMeetingMinutes(minutesData);
      
      logger.info("Meeting minutes created successfully", { 
        minutesId: minutes.id,
        meetingId: meetingId,
        method: req.method,
        url: req.url,
        ip: req.ip
      });

      res.status(201).json({
        success: true,
        message: "Meeting minutes uploaded successfully",
        minutes: minutes,
        filename: req.file?.originalname,
        extractedContent: documentContent ? true : false
      });

    } catch (error: any) {
      logger.error("Failed to upload meeting minutes", error);
      res.status(500).json({ 
        message: "Failed to upload meeting minutes",
        error: error.message 
      });
    }
  });

  // File serving endpoint for meeting minutes documents
  app.get("/api/files/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(process.cwd(), 'uploads', 'meeting-minutes', filename);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({ message: "File not found" });
      }
      
      // Get file info
      const stats = await fs.stat(filePath);
      const fileBuffer = await fs.readFile(filePath);
      
      // Determine content type based on file extension
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream';
      
      if (ext === '.pdf') {
        contentType = 'application/pdf';
      } else if (ext === '.docx') {
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else if (ext === '.doc') {
        contentType = 'application/msword';
      }
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      
      res.send(fileBuffer);
      
    } catch (error) {
      logger.error("Failed to serve file", error);
      res.status(500).json({ message: "Failed to serve file" });
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

  app.delete("/api/agenda-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAgendaItem(id);
      
      if (!success) {
        res.status(404).json({ message: "Agenda item not found" });
        return;
      }

      res.json({ message: "Agenda item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete agenda item" });
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

  app.patch("/api/meetings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid meeting ID" });
      }

      const updates = req.body;
      const updatedMeeting = await storage.updateMeeting(id, updates);
      
      if (!updatedMeeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }

      res.json(updatedMeeting);
    } catch (error) {
      logger.error("Failed to update meeting", error);
      res.status(500).json({ message: "Failed to update meeting" });
    }
  });

  app.delete("/api/meetings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid meeting ID" });
      }

      const deleted = await storage.deleteMeeting(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Meeting not found" });
      }

      res.status(204).send();
    } catch (error) {
      logger.error("Failed to delete meeting", error);
      res.status(500).json({ message: "Failed to delete meeting" });
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

  // Hosts API endpoints
  app.get("/api/hosts", async (req, res) => {
    try {
      const hosts = await storage.getAllHosts();
      res.json(hosts);
    } catch (error) {
      logger.error("Failed to get hosts", error);
      res.status(500).json({ message: "Failed to get hosts" });
    }
  });

  app.get("/api/hosts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const host = await storage.getHost(id);
      if (!host) {
        return res.status(404).json({ message: "Host not found" });
      }
      res.json(host);
    } catch (error) {
      logger.error("Failed to get host", error);
      res.status(500).json({ message: "Failed to get host" });
    }
  });

  app.post("/api/hosts", async (req, res) => {
    try {
      const hostData = insertHostSchema.parse(req.body);
      const host = await storage.createHost(hostData);
      res.status(201).json(host);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn("Invalid host input", { errors: error.errors, ip: req.ip });
        res.status(400).json({ message: "Invalid host data", errors: error.errors });
      } else {
        logger.error("Failed to create host", error);
        res.status(500).json({ message: "Failed to create host" });
      }
    }
  });

  app.put("/api/hosts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      // Get current host info
      const currentHost = await storage.getHost(id);
      if (!currentHost) {
        return res.status(404).json({ message: "Host not found" });
      }

      console.log('Host update request:', { currentHostName: currentHost.name, newName: updates.name });

      // Check if this is a location reassignment (when the host name matches an existing host)
      const allHosts = await storage.getAllHosts();
      const targetHost = allHosts.find(h => 
        h.id !== id && 
        h.name.toLowerCase().trim() === updates.name.toLowerCase().trim()
      );

      if (targetHost) {
        console.log('Reassignment detected: moving contacts from', currentHost.name, 'to', targetHost.name);
        
        // This is a location reassignment - merge contacts to the target host
        const contactsToMove = await storage.getHostContacts(id);
        console.log('Moving', contactsToMove.length, 'contacts');
        
        // Update all contacts to point to the target host
        for (const contact of contactsToMove) {
          console.log('Moving contact:', contact.name, 'from host', id, 'to host', targetHost.id);
          await storage.updateHostContact(contact.id, { 
            hostId: targetHost.id 
          });
        }

        // Update any sandwich collections that reference the old host name
        const collectionsUpdated = await storage.updateCollectionHostNames(currentHost.name, targetHost.name);
        console.log('Updated', collectionsUpdated, 'sandwich collection records');

        // Delete the original host since its contacts have been moved
        await storage.deleteHost(id);
        console.log('Deleted original host:', currentHost.name);

        // Return the target host with success message
        res.json({
          ...targetHost,
          message: `Host reassigned successfully. ${contactsToMove.length} contacts moved from "${currentHost.name}" to "${targetHost.name}".`
        });
      } else {
        // Normal host update
        console.log('Normal host update for:', currentHost.name);
        const host = await storage.updateHost(id, updates);
        if (!host) {
          return res.status(404).json({ message: "Host not found" });
        }
        res.json(host);
      }
    } catch (error) {
      logger.error("Failed to update host", error);
      res.status(500).json({ message: "Failed to update host" });
    }
  });

  app.patch("/api/hosts/:id", async (req, res) => {
    console.log(`🔥 PATCH route hit for host ${req.params.id}`);
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      console.log('PATCH host update - ID:', id, 'Updates:', JSON.stringify(updates, null, 2));
      
      // Clean up any problematic timestamp fields that might be strings
      const cleanUpdates = { ...updates };
      if (cleanUpdates.createdAt) delete cleanUpdates.createdAt;
      if (cleanUpdates.updatedAt) delete cleanUpdates.updatedAt;
      
      console.log('Cleaned updates:', JSON.stringify(cleanUpdates, null, 2));
      
      const host = await storage.updateHost(id, cleanUpdates);
      if (!host) {
        console.log('Host not found in storage for ID:', id);
        return res.status(404).json({ error: "Host not found" });
      }
      console.log('Host updated successfully:', host);
      res.json(host);
    } catch (error) {
      logger.error("Failed to update host", error);
      console.error("Host update error details:", error);
      res.status(500).json({ error: "Failed to update host" });
    }
  });

  app.delete("/api/hosts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteHost(id);
      if (!deleted) {
        return res.status(404).json({ message: "Host not found" });
      }
      res.status(204).send();
    } catch (error) {
      logger.error("Failed to delete host", error);
      res.status(500).json({ message: "Failed to delete host" });
    }
  });

  // Host Contacts
  app.get("/api/host-contacts", async (req, res) => {
    try {
      // Get all host contacts across all hosts
      const hosts = await storage.getAllHosts();
      const allContacts = [];
      
      for (const host of hosts) {
        const contacts = await storage.getHostContacts(host.id);
        allContacts.push(...contacts);
      }
      
      res.json(allContacts);
    } catch (error) {
      logger.error("Failed to get all host contacts", error);
      res.status(500).json({ message: "Failed to get host contacts" });
    }
  });

  app.post("/api/host-contacts", async (req, res) => {
    try {
      const contactData = insertHostContactSchema.parse(req.body);
      const contact = await storage.createHostContact(contactData);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid host contact data", errors: error.errors });
      } else {
        logger.error("Failed to create host contact", error);
        res.status(500).json({ message: "Failed to create host contact" });
      }
    }
  });

  app.get("/api/hosts/:hostId/contacts", async (req, res) => {
    try {
      const hostId = parseInt(req.params.hostId);
      const contacts = await storage.getHostContacts(hostId);
      res.json(contacts);
    } catch (error) {
      logger.error("Failed to get host contacts", error);
      res.status(500).json({ message: "Failed to get host contacts" });
    }
  });

  app.put("/api/host-contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedContact = await storage.updateHostContact(id, updates);
      if (!updatedContact) {
        return res.status(404).json({ message: "Host contact not found" });
      }
      res.json(updatedContact);
    } catch (error) {
      logger.error("Failed to update host contact", error);
      res.status(500).json({ message: "Failed to update host contact" });
    }
  });

  app.patch("/api/host-contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedContact = await storage.updateHostContact(id, updates);
      if (!updatedContact) {
        return res.status(404).json({ message: "Host contact not found" });
      }
      res.json(updatedContact);
    } catch (error) {
      logger.error("Failed to update host contact", error);
      res.status(500).json({ message: "Failed to update host contact" });
    }
  });

  app.delete("/api/host-contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteHostContact(id);
      if (!deleted) {
        return res.status(404).json({ message: "Host contact not found" });
      }
      res.status(204).send();
    } catch (error) {
      logger.error("Failed to delete host contact", error);
      res.status(500).json({ message: "Failed to delete host contact" });
    }
  });

  // Optimized endpoint to get all hosts with their contacts in one call
  app.get("/api/hosts-with-contacts", async (req, res) => {
    try {
      const hostsWithContacts = await storage.getAllHostsWithContacts();
      res.json(hostsWithContacts);
    } catch (error) {
      logger.error("Failed to fetch hosts with contacts", error);
      res.status(500).json({ message: "Failed to fetch hosts with contacts" });
    }
  });

  // Get collections by host name
  app.get("/api/collections-by-host/:hostName", async (req, res) => {
    try {
      const hostName = decodeURIComponent(req.params.hostName);
      const collections = await storage.getAllSandwichCollections();
      
      // Filter collections by host name (case insensitive)
      const hostCollections = collections.filter(collection => 
        collection.hostName.toLowerCase() === hostName.toLowerCase()
      );
      
      res.json(hostCollections);
    } catch (error) {
      logger.error("Failed to fetch collections by host", error);
      res.status(500).json({ message: "Failed to fetch collections by host" });
    }
  });

  // Recipients
  app.get("/api/recipients", async (req, res) => {
    try {
      const recipients = await storage.getAllRecipients();
      res.json(recipients);
    } catch (error) {
      logger.error("Failed to fetch recipients", error);
      res.status(500).json({ message: "Failed to fetch recipients" });
    }
  });

  app.post("/api/recipients", async (req, res) => {
    try {
      const recipientData = insertRecipientSchema.parse(req.body);
      const recipient = await storage.createRecipient(recipientData);
      res.status(201).json(recipient);
    } catch (error) {
      logger.error("Failed to create recipient", error);
      res.status(400).json({ message: "Invalid recipient data" });
    }
  });

  app.put("/api/recipients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedRecipient = await storage.updateRecipient(id, updates);
      if (!updatedRecipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      res.json(updatedRecipient);
    } catch (error) {
      logger.error("Failed to update recipient", error);
      res.status(500).json({ message: "Failed to update recipient" });
    }
  });

  app.patch("/api/recipients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedRecipient = await storage.updateRecipient(id, updates);
      if (!updatedRecipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      res.json(updatedRecipient);
    } catch (error) {
      logger.error("Failed to update recipient", error);
      res.status(500).json({ message: "Failed to update recipient" });
    }
  });

  app.delete("/api/recipients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteRecipient(id);
      if (!deleted) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      res.status(204).send();
    } catch (error) {
      logger.error("Failed to delete recipient", error);
      res.status(500).json({ message: "Failed to delete recipient" });
    }
  });

  // General Contacts
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      logger.error("Failed to fetch contacts", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.status(201).json(contact);
    } catch (error) {
      logger.error("Failed to create contact", error);
      res.status(400).json({ message: "Invalid contact data" });
    }
  });

  app.put("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedContact = await storage.updateContact(id, updates);
      if (!updatedContact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(updatedContact);
    } catch (error) {
      logger.error("Failed to update contact", error);
      res.status(500).json({ message: "Failed to update contact" });
    }
  });

  app.patch("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedContact = await storage.updateContact(id, updates);
      if (!updatedContact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(updatedContact);
    } catch (error) {
      logger.error("Failed to update contact", error);
      res.status(500).json({ message: "Failed to update contact" });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteContact(id);
      if (!deleted) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.status(204).send();
    } catch (error) {
      logger.error("Failed to delete contact", error);
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  // Import recipients from CSV/XLSX
  app.post('/api/recipients/import', importUpload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileExtension = req.file.originalname.toLowerCase().split('.').pop();
      let records: any[] = [];

      if (fileExtension === 'csv') {
        // Parse CSV
        const csvContent = req.file.buffer.toString('utf-8');
        const { parse } = await import('csv-parse/sync');
        records = parse(csvContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true
        });
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // Parse Excel
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        records = XLSX.utils.sheet_to_json(sheet);
      } else {
        return res.status(400).json({ message: "Unsupported file format" });
      }

      let imported = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const record of records) {
        try {
          // Normalize column names (case-insensitive)
          const normalizedRecord: any = {};
          Object.keys(record).forEach(key => {
            const normalizedKey = key.toLowerCase().trim();
            normalizedRecord[normalizedKey] = record[key];
          });

          // Required fields validation - support more column variations
          const name = normalizedRecord.name || 
                      normalizedRecord['recipient name'] || 
                      normalizedRecord['full name'] ||
                      normalizedRecord['organization'] ||
                      normalizedRecord['org'] ||
                      normalizedRecord['client name'];
          const phone = normalizedRecord.phone || 
                       normalizedRecord['phone number'] || 
                       normalizedRecord['mobile'] ||
                       normalizedRecord['phone#'] ||
                       normalizedRecord['contact phone'];

          if (!name || !phone) {
            errors.push(`Row skipped: Missing required fields (name: "${name}", phone: "${phone}")`);
            skipped++;
            continue;
          }

          // Skip empty rows
          if (!String(name).trim() || !String(phone).trim()) {
            skipped++;
            continue;
          }

          // Optional fields with defaults
          const email = normalizedRecord.email || normalizedRecord['email address'] || null;
          const address = normalizedRecord.address || normalizedRecord.location || null;
          const preferences = normalizedRecord.preferences || 
                            normalizedRecord.notes || 
                            normalizedRecord.dietary || 
                            normalizedRecord['sandwich type'] ||
                            normalizedRecord['weekly estimate'] ||
                            normalizedRecord['tsp contact'] ||
                            null;
          const status = normalizedRecord.status || 'active';

          // Check for duplicate (by phone number)
          const existingRecipients = await storage.getAllRecipients();
          const phoneToCheck = String(phone).trim().replace(/\D/g, ''); // Remove non-digits for comparison
          const isDuplicate = existingRecipients.some(r => {
            const existingPhone = r.phone.replace(/\D/g, '');
            return existingPhone === phoneToCheck;
          });

          if (isDuplicate) {
            errors.push(`Row skipped: Duplicate phone number "${phoneToCheck}"`);
            skipped++;
            continue;
          }

          // Create recipient
          await storage.createRecipient({
            name: String(name).trim(),
            phone: phoneToCheck,
            email: email ? String(email).trim() : null,
            address: address ? String(address).trim() : null,
            preferences: preferences ? String(preferences).trim() : null,
            status: String(status).toLowerCase() === 'inactive' ? 'inactive' : 'active'
          });

          imported++;
        } catch (error) {
          console.error('Import error:', error);
          errors.push(`Row skipped: ${error instanceof Error ? error.message : 'Unknown error'}`);
          skipped++;
        }
      }

      res.json({
        imported,
        skipped,
        total: records.length,
        errors: errors.slice(0, 10) // Limit error messages
      });

    } catch (error) {
      logger.error("Failed to import recipients", error);
      res.status(500).json({ message: "Failed to process import file" });
    }
  });

  // Import host and driver contacts from Excel/CSV
  app.post('/api/import-contacts', importUpload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileExtension = req.file.originalname.toLowerCase().split('.').pop();
      let records: any[] = [];

      if (fileExtension === 'csv') {
        // Parse CSV
        const csvContent = req.file.buffer.toString('utf-8');
        const { parse } = await import('csv-parse/sync');
        records = parse(csvContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true
        });
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // Parse Excel
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        
        // Handle Excel files where headers are in the first data row
        if (rawData.length > 0) {
          const firstRow = rawData[0];
          const hasGenericHeaders = Object.keys(firstRow).some(key => key.startsWith('__EMPTY'));
          
          if (hasGenericHeaders && rawData.length > 1) {
            // Use the first row as headers and map the rest of the data
            const headers = Object.values(firstRow) as string[];
            records = rawData.slice(1).map(row => {
              const mappedRow: any = {};
              const values = Object.values(row) as string[];
              headers.forEach((header, index) => {
                if (header && header.trim()) {
                  mappedRow[header.trim()] = values[index] || '';
                }
              });
              return mappedRow;
            });
          } else {
            records = rawData;
          }
        }
      } else {
        return res.status(400).json({ message: "Unsupported file format" });
      }

      let hostsCreated = 0;
      let contactsImported = 0;
      let skipped = 0;
      const errors: string[] = [];

      // Process each record from the Excel file
      for (const record of records) {
        try {
          // Normalize field names (case-insensitive)
          const normalizedRecord: any = {};
          Object.keys(record).forEach(key => {
            normalizedRecord[key.toLowerCase().trim()] = record[key];
          });

          // Extract host/location information from your Excel structure
          const hostName = normalizedRecord.area || 
                          normalizedRecord.location || 
                          normalizedRecord.host || 
                          normalizedRecord['host location'] ||
                          normalizedRecord.site ||
                          normalizedRecord.venue;

          // Extract contact information - combine first and last name
          const firstName = normalizedRecord['first name'] || normalizedRecord.firstname || '';
          const lastName = normalizedRecord['last name'] || normalizedRecord.lastname || '';
          const contactName = `${firstName} ${lastName}`.trim() || 
                             normalizedRecord.name || 
                             normalizedRecord['contact name'] ||
                             normalizedRecord['driver name'] ||
                             normalizedRecord['volunteer name'];

          const phone = normalizedRecord.phone || 
                       normalizedRecord['phone number'] ||
                       normalizedRecord.mobile ||
                       normalizedRecord.cell;

          const email = normalizedRecord.email || 
                       normalizedRecord['email address'] ||
                       null;

          const role = normalizedRecord.role || 
                      normalizedRecord.position ||
                      normalizedRecord.type ||
                      'Host/Driver';

          // Skip if missing essential data
          if (!hostName || !contactName || !phone) {
            skipped++;
            continue;
          }

          // Find or create host
          const existingHosts = await storage.getAllHosts();
          let host = existingHosts.find(h => 
            h.name.toLowerCase().trim() === String(hostName).toLowerCase().trim()
          );

          if (!host) {
            // Create new host
            host = await storage.createHost({
              name: String(hostName).trim(),
              address: normalizedRecord.address || null,
              status: 'active',
              notes: null
            });
            hostsCreated++;
          }

          // Clean phone number
          const cleanPhone = String(phone).trim().replace(/\D/g, '');
          if (cleanPhone.length < 10) {
            errors.push(`Skipped ${contactName}: Invalid phone number`);
            skipped++;
            continue;
          }

          // Check for duplicate contact
          const existingContacts = await storage.getHostContacts(host.id);
          const isDuplicate = existingContacts.some(c => 
            c.phone.replace(/\D/g, '') === cleanPhone
          );

          if (isDuplicate) {
            errors.push(`Skipped ${contactName}: Duplicate phone number`);
            skipped++;
            continue;
          }

          // Create host contact
          await storage.createHostContact({
            hostId: host.id,
            name: String(contactName).trim(),
            role: String(role).trim(),
            phone: cleanPhone,
            email: email ? String(email).trim() : null,
            isPrimary: false, // Can be updated manually later
            notes: normalizedRecord.notes || null
          });

          contactsImported++;

        } catch (error) {
          errors.push(`Error processing record: ${error instanceof Error ? error.message : 'Unknown error'}`);
          skipped++;
        }
      }

      res.json({
        message: "Import completed",
        imported: contactsImported,
        hosts: hostsCreated,
        skipped,
        total: records.length,
        errors: errors.slice(0, 10) // Limit error messages
      });

    } catch (error) {
      logger.error("Failed to import contacts", error);
      res.status(500).json({ message: "Failed to process import file" });
    }
  });

  // Collection statistics for bulk data manager
  app.get("/api/collection-stats", async (req, res) => {
    try {
      const totalRecords = await storage.getSandwichCollectionsCount();
      const allCollections = await storage.getAllSandwichCollections();
      
      // Count mapped vs unmapped records based on host assignment
      const hosts = await storage.getAllHosts();
      const hostNames = new Set(hosts.map(h => h.name));
      
      let mappedRecords = 0;
      let unmappedRecords = 0;
      
      for (const collection of allCollections) {
        // Consider "groups" as mapped hosts
        if (hostNames.has(collection.hostName) || collection.hostName.toLowerCase().includes('group')) {
          mappedRecords++;
        } else {
          unmappedRecords++;
        }
      }
      
      res.json({
        totalRecords: Number(totalRecords),
        processedRecords: Number(totalRecords),
        mappedRecords,
        unmappedRecords
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch collection statistics" });
    }
  });

  // Host mapping statistics
  app.get("/api/host-mapping-stats", async (req, res) => {
    try {
      const allCollections = await storage.getAllSandwichCollections();
      const hosts = await storage.getAllHosts();
      const hostNames = new Set(hosts.map(h => h.name));
      
      // Group collections by host name and count them
      const hostCounts = new Map<string, number>();
      
      for (const collection of allCollections) {
        const count = hostCounts.get(collection.hostName) || 0;
        hostCounts.set(collection.hostName, count + 1);
      }
      
      // Convert to array with mapping status
      // Consider "groups" as mapped hosts
      const mappingStats = Array.from(hostCounts.entries()).map(([hostName, count]) => ({
        hostName,
        count,
        mapped: hostNames.has(hostName) || hostName.toLowerCase().includes('group')
      })).sort((a, b) => b.count - a.count); // Sort by count descending
      
      res.json(mappingStats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch host mapping statistics" });
    }
  });

  // Register project routes
  const { projectsRoutes } = await import('./routes/projects');
  app.use('/api', projectsRoutes);

  // Static file serving for documents
  app.use('/documents', express.static('public/documents'));

  // Add data management routes
  app.use('/api/data', dataManagementRoutes);

  // Global search endpoint
  app.get('/api/search', async (req, res) => {
    try {
      const { q: query, type, limit = '50' } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
      }

      const searchLimit = Math.min(parseInt(limit as string) || 50, 200);

      if (type && typeof type === 'string') {
        // Type-specific search
        let results: any[] = [];
        switch (type) {
          case 'collections':
            results = await SearchEngine.searchCollections(query, {}, searchLimit);
            break;
          case 'hosts':
            results = await SearchEngine.searchHosts(query, {}, searchLimit);
            break;
          case 'projects':
            results = await SearchEngine.searchProjects(query, {}, searchLimit);
            break;
          case 'contacts':
            results = await SearchEngine.searchContacts(query, searchLimit);
            break;
          default:
            return res.status(400).json({ error: 'Invalid search type' });
        }
        res.json({ results, type });
      } else {
        // Global search
        const result = await SearchEngine.globalSearch(query, {}, searchLimit);
        res.json(result);
      }
    } catch (error) {
      logger.error('Search failed:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Search suggestions endpoint
  app.get('/api/search/suggestions', async (req, res) => {
    try {
      const { q: query, type } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ suggestions: [] });
      }

      const suggestions = await SearchEngine.getSearchSuggestions(
        query,
        type as 'collection' | 'host' | 'project' | 'contact' | undefined
      );
      
      res.json({ suggestions });
    } catch (error) {
      logger.error('Search suggestions failed:', error);
      res.status(500).json({ suggestions: [] });
    }
  });

  // Reporting and Analytics Routes
  
  // Generate report
  app.post('/api/reports/generate', async (req, res) => {
    try {
      const reportData = await ReportGenerator.generateReport(req.body);
      
      // Store report for download (in production, this would use cloud storage)
      const reportId = Date.now().toString();
      reportData.id = reportId;
      
      // Cache the report for 24 hours
      CacheManager.set(`report:${reportId}`, reportData, 24 * 60 * 60 * 1000);
      
      res.json(reportData);
    } catch (error) {
      console.error('Report generation failed:', error);
      res.status(500).json({ error: 'Failed to generate report' });
    }
  });

  // Download report
  app.get('/api/reports/download/:id', async (req, res) => {
    try {
      const reportId = req.params.id;
      const reportData = CacheManager.get(`report:${reportId}`);
      
      if (!reportData) {
        return res.status(404).json({ error: 'Report not found or expired' });
      }

      const format = reportData.metadata.format || 'json';
      
      res.setHeader('Content-Disposition', `attachment; filename="report-${reportId}.${format}"`);
      
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        // Convert to CSV format
        if (Array.isArray(reportData.data)) {
          const csvHeader = Object.keys(reportData.data[0] || {}).join(',');
          const csvRows = reportData.data.map(row => 
            Object.values(row).map(val => `"${val}"`).join(',')
          );
          res.send([csvHeader, ...csvRows].join('\n'));
        } else {
          res.send('No data available');
        }
      } else if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        // In production, this would generate actual PDF
        res.json({ message: 'PDF generation not implemented yet', data: reportData });
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.json(reportData);
      }
    } catch (error) {
      console.error('Report download failed:', error);
      res.status(500).json({ error: 'Failed to download report' });
    }
  });

  // Schedule report
  app.post('/api/reports/schedule', async (req, res) => {
    try {
      const { config, schedule } = req.body;
      const scheduledReport = await ReportGenerator.scheduleReport(config, schedule);
      
      res.json(scheduledReport);
    } catch (error) {
      console.error('Report scheduling failed:', error);
      res.status(500).json({ error: 'Failed to schedule report' });
    }
  });

  // Get scheduled reports
  app.get('/api/reports/scheduled', async (req, res) => {
    try {
      // In production, this would fetch from database
      const scheduledReports = CacheManager.get('scheduled_reports') || [];
      res.json(scheduledReports);
    } catch (error) {
      console.error('Failed to fetch scheduled reports:', error);
      res.status(500).json({ error: 'Failed to fetch scheduled reports' });
    }
  });

  // Get recent reports
  app.get('/api/reports/recent', async (req, res) => {
    try {
      // In production, this would fetch from database
      const recentReports = [];
      res.json(recentReports);
    } catch (error) {
      console.error('Failed to fetch recent reports:', error);
      res.status(500).json({ error: 'Failed to fetch recent reports' });
    }
  });

  // Email notification routes
  
  // Send test email
  app.post('/api/notifications/test', async (req, res) => {
    try {
      const { to, template, variables } = req.body;
      
      const success = await EmailService.sendEmail({
        to,
        template,
        variables
      });
      
      res.json({ success, message: success ? 'Email sent successfully' : 'Email sending failed' });
    } catch (error) {
      console.error('Test email failed:', error);
      res.status(500).json({ error: 'Failed to send test email' });
    }
  });

  // Get available email templates
  app.get('/api/notifications/templates', async (req, res) => {
    try {
      const templates = EmailService.getAvailableTemplates();
      res.json(templates);
    } catch (error) {
      console.error('Failed to fetch email templates:', error);
      res.status(500).json({ error: 'Failed to fetch email templates' });
    }
  });

  // Send milestone notification
  app.post('/api/notifications/milestone', async (req, res) => {
    try {
      const { milestone, recipients } = req.body;
      
      const success = await EmailService.sendMilestoneNotification(milestone, recipients);
      
      res.json({ success, message: success ? 'Milestone notification sent' : 'Failed to send notification' });
    } catch (error) {
      console.error('Milestone notification failed:', error);
      res.status(500).json({ error: 'Failed to send milestone notification' });
    }
  });

  // Send project deadline reminder
  app.post('/api/notifications/deadline-reminder', async (req, res) => {
    try {
      const { project, recipients } = req.body;
      
      const success = await EmailService.sendProjectDeadlineReminder(project, recipients);
      
      res.json({ success, message: success ? 'Deadline reminder sent' : 'Failed to send reminder' });
    } catch (error) {
      console.error('Deadline reminder failed:', error);
      res.status(500).json({ error: 'Failed to send deadline reminder' });
    }
  });

  // Send weekly summary
  app.post('/api/notifications/weekly-summary', async (req, res) => {
    try {
      const { summaryData, recipients } = req.body;
      
      const success = await EmailService.sendWeeklySummary(summaryData, recipients);
      
      res.json({ success, message: success ? 'Weekly summary sent' : 'Failed to send summary' });
    } catch (error) {
      console.error('Weekly summary failed:', error);
      res.status(500).json({ error: 'Failed to send weekly summary' });
    }
  });

  // Version Control API Routes
  app.get('/api/version-control/:entityType/:entityId/history', async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const history = await VersionControl.getVersionHistory(
        entityType as any,
        parseInt(entityId)
      );
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/version-control/:entityType/:entityId/version/:version', async (req, res) => {
    try {
      const { entityType, entityId, version } = req.params;
      const versionData = await VersionControl.getVersion(
        entityType as any,
        parseInt(entityId),
        parseInt(version)
      );
      if (!versionData) {
        return res.status(404).json({ error: 'Version not found' });
      }
      res.json(versionData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/version-control/:entityType/:entityId/restore/:version', async (req, res) => {
    try {
      const { entityType, entityId, version } = req.params;
      const userId = req.user?.claims?.sub;
      
      const success = await VersionControl.restoreVersion(
        entityType as any,
        parseInt(entityId),
        parseInt(version),
        userId
      );
      
      if (success) {
        res.json({ success: true, message: 'Version restored successfully' });
      } else {
        res.status(400).json({ error: 'Failed to restore version' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/version-control/:entityType/:entityId/compare/:version1/:version2', async (req, res) => {
    try {
      const { entityType, entityId, version1, version2 } = req.params;
      const comparison = await VersionControl.compareVersions(
        entityType as any,
        parseInt(entityId),
        parseInt(version1),
        parseInt(version2)
      );
      res.json(comparison);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/version-control/changeset', async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const result = await VersionControl.createChangeset({
        ...req.body,
        userId
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/version-control/stats', async (req, res) => {
    try {
      const { entityType, userId, startDate, endDate } = req.query;
      const stats = await VersionControl.getChangeStats(
        entityType as any,
        userId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/version-control/export', async (req, res) => {
    try {
      const { entityType, entityId } = req.query;
      const history = await VersionControl.exportVersionHistory(
        entityType as any,
        entityId ? parseInt(entityId as string) : undefined
      );
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Integration API Routes for external systems
  app.get('/api/integration/summary', async (req, res) => {
    try {
      const stats = await storage.getCollectionStats();
      const hosts = await storage.getAllHosts();
      const projects = await storage.getAllProjects();
      
      const summary = {
        totalSandwiches: stats.totalSandwiches,
        totalHosts: hosts.length,
        activeHosts: hosts.filter(h => h.status === 'active').length,
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'in_progress').length,
        lastUpdated: new Date().toISOString()
      };
      
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/integration/collections/recent', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const collections = await storage.getAllSandwichCollections(limit);
      
      const recentCollections = collections.slice(0, limit).map(collection => ({
        id: collection.id,
        hostName: collection.hostName,
        individualSandwiches: collection.individualSandwiches,
        groupCollections: collection.groupCollections,
        collectionDate: collection.collectionDate,
        submittedAt: collection.submittedAt
      }));
      
      res.json(recentCollections);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/integration/webhook', async (req, res) => {
    try {
      const { event, data } = req.body;
      
      // Log webhook event
      await AuditLogger.log(
        'webhook_received',
        'system',
        null,
        { event, dataKeys: Object.keys(data || {}) }
      );
      
      // Process different webhook events
      switch (event) {
        case 'collection_submitted':
          // Handle external collection submission
          if (data.hostName && data.sandwiches) {
            await storage.createSandwichCollection({
              hostName: data.hostName,
              individualSandwiches: data.sandwiches,
              groupCollections: data.groupCollections || '{}',
              collectionDate: data.date || new Date().toISOString().split('T')[0]
            });
          }
          break;
        
        case 'host_updated':
          // Handle external host updates
          if (data.hostId && data.updates) {
            await storage.updateHost(data.hostId, data.updates);
          }
          break;
        
        default:
          console.log(`Unknown webhook event: ${event}`);
      }
      
      res.json({ success: true, processed: event });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Backup Management API Routes for Phase 5: Operations & Reliability
  app.post('/api/backups/create', async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { reason } = req.body;
      
      const manifest = await BackupManager.createBackup('manual', userId, reason);
      res.json({ success: true, manifest });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/backups', async (req, res) => {
    try {
      const backups = await BackupManager.listBackups();
      res.json(backups);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/backups/:backupId', async (req, res) => {
    try {
      const { backupId } = req.params;
      const backup = await BackupManager.getBackupInfo(backupId);
      
      if (!backup) {
        return res.status(404).json({ error: 'Backup not found' });
      }
      
      res.json(backup);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/backups/:backupId/validate', async (req, res) => {
    try {
      const { backupId } = req.params;
      const validation = await BackupManager.validateBackup(backupId);
      res.json(validation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/backups/:backupId', async (req, res) => {
    try {
      const { backupId } = req.params;
      const userId = req.user?.claims?.sub;
      
      const success = await BackupManager.deleteBackup(backupId, userId);
      
      if (success) {
        res.json({ success: true, message: 'Backup deleted successfully' });
      } else {
        res.status(400).json({ error: 'Failed to delete backup' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/backups/stats/storage', async (req, res) => {
    try {
      const stats = await BackupManager.getStorageStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Operations Dashboard API for comprehensive system monitoring
  app.get('/api/operations/system-health', async (req, res) => {
    try {
      const stats = await storage.getCollectionStats();
      const hosts = await storage.getAllHosts();
      const projects = await storage.getAllProjects();
      const backupStats = await BackupManager.getStorageStats();
      const cacheStats = CacheManager.getStats();
      
      const systemHealth = {
        database: {
          status: 'healthy',
          totalRecords: stats.totalEntries,
          totalSandwiches: stats.totalSandwiches,
          lastActivity: new Date().toISOString()
        },
        hosts: {
          total: hosts.length,
          active: hosts.filter(h => h.status === 'active').length,
          inactive: hosts.filter(h => h.status === 'inactive').length
        },
        projects: {
          total: projects.length,
          active: projects.filter(p => p.status === 'in_progress').length,
          completed: projects.filter(p => p.status === 'completed').length
        },
        backups: {
          total: backupStats.totalBackups,
          totalSize: backupStats.diskUsage,
          lastBackup: backupStats.newestBackup
        },
        cache: {
          hitRate: cacheStats.hitRate,
          size: cacheStats.size,
          memory: `${Math.round(cacheStats.memoryUsage / 1024 / 1024)}MB`
        },
        uptime: process.uptime(),
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
        }
      };
      
      res.json(systemHealth);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Initialize backup system
  BackupManager.initialize().then(() => {
    BackupManager.scheduleAutoBackup();
    console.log('Backup system initialized with automated daily backups');
  });

  const httpServer = createServer(app);
  return httpServer;
}