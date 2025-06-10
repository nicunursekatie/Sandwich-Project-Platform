import { Router } from "express";
import { authRoutes } from "./auth";
import { hostsRoutes } from "./hosts";
import { projectsRoutes } from "./projects";
import { messagesRoutes } from "./messages";

const router = Router();

// Mount all route modules
router.use("/api", authRoutes);
router.use("/api", hostsRoutes);
router.use("/api", projectsRoutes);
router.use("/api", messagesRoutes);

export { router as apiRoutes };