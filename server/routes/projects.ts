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
    logger.error("Error fetching projects:", error);
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
    logger.error("Error fetching project:", error);
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
      return res.status(400).json({ error: "Invalid project data", details: error.errors });
    }
    logger.error("Error creating project:", error);
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

    // Update project with provided fields
    const updatedProject = await storage.updateProject(projectId, req.body);
    res.json(updatedProject);
  } catch (error) {
    logger.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// Delete project
router.delete("/:id", requirePermission("delete_data"), async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.id);
    
    // Validate the project exists
    const existingProject = await storage.getProjectById(projectId);
    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    await storage.deleteProject(projectId);
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    logger.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// Project tasks endpoints
router.get("/:id/tasks", isAuthenticated, async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const tasks = await storage.getProjectTasks(projectId);
    res.json(tasks);
  } catch (error) {
    logger.error("Error fetching project tasks:", error);
    res.status(500).json({ error: "Failed to fetch project tasks" });
  }
});

router.post("/:id/tasks", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const taskData = { ...req.body, projectId };
    const validatedData = insertProjectTaskSchema.parse(taskData);
    
    const task = await storage.createProjectTask(validatedData);
    res.status(201).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid task data", details: error.errors });
    }
    logger.error("Error creating project task:", error);
    res.status(500).json({ error: "Failed to create project task" });
  }
});

router.patch("/tasks/:taskId", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    
    // Validate the task exists
    const existingTask = await storage.getProjectTaskById(taskId);
    if (!existingTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updatedTask = await storage.updateProjectTask(taskId, req.body);
    res.json(updatedTask);
  } catch (error) {
    logger.error("Error updating project task:", error);
    res.status(500).json({ error: "Failed to update project task" });
  }
});

router.delete("/tasks/:taskId", requirePermission("delete_data"), async (req: any, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    
    // Validate the task exists
    const existingTask = await storage.getProjectTaskById(taskId);
    if (!existingTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    await storage.deleteProjectTask(taskId);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    logger.error("Error deleting project task:", error);
    res.status(500).json({ error: "Failed to delete project task" });
  }
});

// Task completion endpoints
router.post("/tasks/:taskId/complete", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const user = req.user;
    
    const completionData = {
      taskId,
      userId: user.id,
      completedAt: new Date()
    };
    
    const validatedData = insertTaskCompletionSchema.parse(completionData);
    const completion = await storage.createTaskCompletion(validatedData);
    
    res.status(201).json(completion);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid completion data", details: error.errors });
    }
    logger.error("Error marking task complete:", error);
    res.status(500).json({ error: "Failed to mark task complete" });
  }
});

router.delete("/tasks/:taskId/complete", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const user = req.user;
    
    await storage.removeTaskCompletion(taskId, user.id);
    res.json({ message: "Task completion removed successfully" });
  } catch (error) {
    logger.error("Error removing task completion:", error);
    res.status(500).json({ error: "Failed to remove task completion" });
  }
});

// Project user assignment endpoints
router.get("/:id/assignments", isAuthenticated, async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const assignments = await storage.getProjectAssignments(projectId);
    res.json(assignments);
  } catch (error) {
    logger.error("Error fetching project assignments:", error);
    res.status(500).json({ error: "Failed to fetch project assignments" });
  }
});

router.post("/:id/assign-user", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const { userId, role } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const assignment = await storage.assignUserToProject(projectId, userId, role);
    res.status(201).json(assignment);
  } catch (error) {
    logger.error("Error assigning user to project:", error);
    res.status(500).json({ error: "Failed to assign user to project" });
  }
});

router.delete("/:id/remove-user", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    await storage.removeUserFromProject(projectId, userId);
    res.json({ message: "User removed from project successfully" });
  } catch (error) {
    logger.error("Error removing user from project:", error);
    res.status(500).json({ error: "Failed to remove user from project" });
  }
});

export default router;