import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import path from "path";
import { storage } from "../storage-wrapper";
import { sanitizeMiddleware } from "../middleware/sanitizer";
import { insertProjectSchema, insertProjectTaskSchema, insertProjectCommentSchema } from "@shared/schema";

// Configure multer for file uploads
const taskUpload = multer({
  dest: 'uploads/tasks/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|csv|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed'));
    }
  }
});

const router = Router();

// Project management routes
router.get("/projects", async (req, res) => {
  try {
    const projects = await storage.getAllProjects();
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.get("/projects/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const project = await storage.getProject(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

router.post("/projects", sanitizeMiddleware, async (req, res) => {
  try {
    const result = insertProjectSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    const project = await storage.createProject(result.data);
    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.patch("/projects/:id", sanitizeMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    const project = await storage.updateProject(id, updates);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

router.delete("/projects/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteProject(id);
    if (!success) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// Project Task routes
router.get("/projects/:projectId/tasks", async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const tasks = await storage.getProjectTasks(projectId);
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching project tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

router.post("/projects/:projectId/tasks", sanitizeMiddleware, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const taskData = { ...req.body, projectId };
    const result = insertProjectTaskSchema.safeParse(taskData);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    const task = await storage.createProjectTask(result.data);
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating project task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

router.patch("/projects/:projectId/tasks/:taskId", sanitizeMiddleware, async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const projectId = parseInt(req.params.projectId);
    const updates = req.body;
    
    console.log(`PATCH request - Task ID: ${taskId}, Project ID: ${projectId}`);
    console.log("Updates payload:", updates);
    
    const task = await storage.updateProjectTask(taskId, updates);
    if (!task) {
      console.log(`Task ${taskId} not found in database`);
      return res.status(404).json({ error: "Task not found" });
    }
    
    console.log(`Task ${taskId} updated successfully`);
    res.json(task);
  } catch (error) {
    console.error("Error updating project task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

router.delete("/projects/:projectId/tasks/:taskId", async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const success = await storage.deleteProjectTask(taskId);
    if (!success) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting project task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// Task file upload route
router.post("/projects/:projectId/tasks/:taskId/upload", taskUpload.array('files', 5), async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Get current task to append to existing attachments
    const task = await storage.getProjectTasks(parseInt(req.params.projectId));
    const currentTask = task.find(t => t.id === taskId);
    
    if (!currentTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Parse existing attachments
    let existingAttachments = [];
    if (currentTask.attachments) {
      try {
        existingAttachments = JSON.parse(currentTask.attachments);
      } catch (e) {
        existingAttachments = [];
      }
    }

    // Add new file info
    const newAttachments = files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      uploadedAt: new Date().toISOString()
    }));

    const allAttachments = [...existingAttachments, ...newAttachments];

    // Update task with new attachments
    const updatedTask = await storage.updateProjectTask(taskId, {
      attachments: JSON.stringify(allAttachments)
    });

    res.json({ task: updatedTask, uploadedFiles: newAttachments });
  } catch (error) {
    console.error("Error uploading task files:", error);
    res.status(500).json({ error: "Failed to upload files" });
  }
});

// Project Comment routes
router.get("/projects/:projectId/comments", async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const comments = await storage.getProjectComments(projectId);
    res.json(comments);
  } catch (error) {
    console.error("Error fetching project comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

router.post("/projects/:projectId/comments", sanitizeMiddleware, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const commentData = { ...req.body, projectId };
    const result = insertProjectCommentSchema.safeParse(commentData);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    const comment = await storage.createProjectComment(result.data);
    res.status(201).json(comment);
  } catch (error) {
    console.error("Error creating project comment:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

router.delete("/projects/:projectId/comments/:commentId", async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const success = await storage.deleteProjectComment(commentId);
    if (!success) {
      return res.status(404).json({ error: "Comment not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting project comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

export { router as projectsRoutes };