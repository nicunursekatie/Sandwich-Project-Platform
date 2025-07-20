import { Express } from "express";
import authRoutes from "./auth";
import usersRoutes from "./users";
import projectsRoutes from "./projects";
import collectionsRoutes from "./collections";
import driversRoutes from "./drivers";
import hostsRoutes from "./hosts";
import recipientsRoutes from "./recipients";
import analyticsRoutes from "./analytics";
import dataManagementRoutes from "./data-management";
import googleSheetsRoutes from "./google-sheets";
import suggestionsRoutes from "../suggestions-routes";
import realTimeMessagesRoutes from "./real-time-messages";
import chatRoutes from "./chat";
import { registerMessageNotificationRoutes } from "./message-notifications";
import { registerPerformanceRoutes } from "./performance";
import { logger } from "../utils/logger";

export function registerModularRoutes(app: Express) {
  // Authentication routes
  app.use("/api/auth", authRoutes);
  
  // Core data management routes
  app.use("/api/users", usersRoutes);
  app.use("/api/projects", projectsRoutes);
  app.use("/api/collections", collectionsRoutes);
  app.use("/api/drivers", driversRoutes);
  app.use("/api/hosts", hostsRoutes);
  app.use("/api/recipients", recipientsRoutes);
  
  // Analytics and reporting routes
  app.use("/api/analytics", analyticsRoutes);
  
  // Feature-specific routes
  app.use("/api/data-management", dataManagementRoutes);
  app.use("/api/google-sheets", googleSheetsRoutes);
  app.use("/api/suggestions", suggestionsRoutes);
  app.use("/api/real-time-messages", realTimeMessagesRoutes);
  app.use("/api/chat", chatRoutes);
  
  // Register function-based routes
  registerMessageNotificationRoutes(app);
  registerPerformanceRoutes(app);
  
  // Modular routes registered successfully
}