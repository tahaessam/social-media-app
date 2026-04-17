import { Router } from "express";
import { appController } from "../controllers/app.controller.js";

const router = Router();

// Health check route
router.get("/ping", appController.ping);

// Main routes
router.get("/", appController.getHello);

// Test routes
router.get("/test-error", appController.testError);

// 404 handler for API routes
router.use((req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

export { router as indexRoutes };
