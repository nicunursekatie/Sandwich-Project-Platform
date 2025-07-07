import { Router } from "express";
import { authRoutes } from "./auth";
import { hostsRoutes } from "./hosts";
import { projectsRoutes } from "./projects";
import { messagesRoutes } from "./messages";
import { conversationsRoutes } from "./conversations";

const router = Router();

// Mount all route modules
router.use("/api", authRoutes);
router.use("/api", hostsRoutes);
router.use("/api", projectsRoutes);
router.use("/api", messagesRoutes);
router.use("/api", conversationsRoutes);

export { router as apiRoutes };