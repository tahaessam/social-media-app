import { Logger } from "../utils/logger.util.js";
export const errorMiddleware = (err, req, res, next) => {
    Logger.error("Unhandled error occurred", err);
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
//# sourceMappingURL=error.middleware.js.map