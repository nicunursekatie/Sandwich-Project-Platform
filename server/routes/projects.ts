import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage-wrapper";
import { requirePermission, isAuthenticated } from "../middleware/auth";
import { insertProjectSchema, insertProjectTaskSchema, insertTaskCompletionSchema } from "@shared/schema";
import { logger } from "../utils/logger";

const router = Router();

// Get all projects
router.get("/", isAuthenticated, async (req: any, res) => {
  try {
    const projects = await storage.getAllProjects();
    res.json(projects);
  } catch (error) {
    logger.error("Error fetching projects:", error?.message || error || "Unknown error");
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Get single project
router.get("/:id", isAuthenticated, async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = await storage.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    logger.error("Error fetching project:", error?.message || error || "Unknown error");
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// Create new project
router.post("/", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const validatedData = insertProjectSchema.parse(req.body);
    const project = await storage.createProject(validatedData);
    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid project data", details: error?.errors || "Unknown" });
    }
    logger.error("Error creating project:", error?.message || error || "Unknown error");
    res.status(500).json({ error: "Failed to create project" });
  }
});

// Update project
router.patch("/:id", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.id);
    
    // Validate the project exists
    const existingProject = await storage.getProjectById(projectId);
    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    const updatedProject = await storage.updateProject(projectId, req.body);
    res.json(updatedProject);
  } catch (error) {
    logger.error("Error updating project:", error?.message || error || "Unknown error");
    res.status(500).json({ error: "Failed to update project" });
  }
});

// Delete project
router.delete("/:id", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.id);
    await storage.deleteProject(projectId);
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    logger.error("Error deleting project:", error?.message || error || "Unknown error");
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// Get project tasks
router.get("/:id/tasks", isAuthenticated, async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const tasks = await storage.getProjectTasks(projectId);
    res.json(tasks);
  } catch (error) {
    logger.error("Error fetching project tasks:", error?.message || error || "Unknown error");
    res.status(500).json({ error: "Failed to fetch project tasks" });
  }
});

// Create project task
router.post("/:id/tasks", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const validatedData = insertProjectTaskSchema.parse({
      ...req.body,
      projectId
    });
    const task = await storage.createProjectTask(validatedData);
    res.status(201).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid task data", details: error?.errors || "Unknown" });
    }
    logger.error("Error creating project task:", error?.message || error || "Unknown error");
    res.status(500).json({ error: "Failed to create project task" });
  }
});

// Update project task
router.patch("/tasks/:taskId", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const updatedTask = await storage.updateProjectTask(taskId, req.body);
    res.json(updatedTask);
  } catch (error) {
    logger.error("Error updating project task:", error?.message || error || "Unknown error");
    res.status(500).json({ error: "Failed to update project task" });
  }
});

// Delete project task
router.delete("/tasks/:taskId", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    await storage.deleteProjectTask(taskId);
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    logger.error("Error deleting project task:", error?.message || error || "Unknown error");
    res.status(500).json({ error: "Failed to delete project task" });
  }
});

// Mark task as complete/incomplete
router.post("/tasks/:taskId/completion", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const { userId, completed } = req.body;
    
    if (completed) {
      const validatedData = insertTaskCompletionSchema.parse({
        taskId,
        userId,
        completedAt: new Date().toISOString()
      });
      const completion = await storage.createTaskCompletion(validatedData);
      res.status(201).json(completion);
    } else {
      await storage.deleteTaskCompletion(taskId, userId);
      res.json({ success: true, message: "Task completion removed" });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid completion data", details: error?.errors || "Unknown" });
    }
    logger.error("Error managing task completion:", error?.message || error || "Unknown error");
    res.status(500).json({ error: "Failed to manage task completion" });
  }
});

// Get task completions
router.get("/tasks/:taskId/completions", isAuthenticated, async (req: any, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const completions = await storage.getTaskCompletions(taskId);
    res.json(completions);
  } catch (error) {
    logger.error("Error fetching task completions:", error?.message || error || "Unknown error");
    res.status(500).json({ error: "Failed to fetch task completions" });
  }
});

// Assign user to project
router.post("/:id/assign-user", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const { userId, role } = req.body;
    
    const assignment = await storage.assignUserToProject(projectId, userId, role);
    res.status(201).json(assignment);
  } catch (error) {
    logger.error("Error assigning user to project:", error?.message || error || "Unknown error");
    res.status(500).json({ error: "Failed to assign user to project" });
  }
});

// Remove user from project
router.delete("/:id/remove-user", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const { userId } = req.body;
    
    await storage.removeUserFromProject(projectId, userId);
    res.json({ success: true, message: "User removed from project successfully" });
  } catch (error) {
    logger.error("Error removing user from project:", error?.message || error || "Unknown error");
    res.status(500).json({ error: "Failed to remove user from project" });
  }
});

// Get project assignments
router.get("/:id/assignments", isAuthenticated, async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const assignments = await storage.getProjectAssignments(projectId);
    res.json(assignments);
  } catch (error) {
    logger.error("Error fetching project assignments:", error?.message || error || "Unknown error");
    res.status(500).json({ error: "Failed to fetch project assignments" });
  }
});

export default router;