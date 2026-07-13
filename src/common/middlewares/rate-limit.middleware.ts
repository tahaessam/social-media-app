import rateLimit from "express-rate-limit";

const isDev = process.env.NODE_ENV !== "production";

export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 5000 : 200,
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
