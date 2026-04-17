import { Request, Response, NextFunction } from "express";

export class AppController {
  // Health check endpoint
  ping(req: Request, res: Response) {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  }

  // Main welcome endpoint
  getHello(req: Request, res: Response) {
    res.status(200).json({
      message: "Hello to social app",
      version: "1.0.0",
      timestamp: new Date().toISOString()
    });
  }

  // Test error endpoint
  testError(req: Request, res: Response, next: NextFunction) {
    const error = new Error("This is a test error for demonstration purposes");
    next(error);
  }

  // Example method for future use
  getStatus(req: Request, res: Response) {
    res.json({
      status: "running",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    });
  }
}

export const appController = new AppController();
