import { Request, Response, NextFunction } from "express";
import { Logger } from "../utils/logger.util.js";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Logger.error("Unhandled error occurred", err);

  const statusCode = (err as any).statusCode || (err as any).status || 500;
  const isDevelopment = process.env.NODE_ENV === "development";

  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    ...(isDevelopment && {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method
    }),
  });
};
