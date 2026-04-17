import { Request, Response, NextFunction } from "express";
import { Logger } from "../utils/logger.util.js";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Logger.error("Unhandled error occurred", err);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === "development";

  res.status(500).json({
    message: "Internal Server Error",
    ...(isDevelopment && {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method
    }),
  });
};
