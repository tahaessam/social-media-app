import rateLimit from "express-rate-limit";

export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes",
  },
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many requests from this IP, please try again after 15 minutes",
    });
  },
  legacyHeaders: false,
});
