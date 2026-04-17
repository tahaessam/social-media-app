import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimitMiddleware } from "./middlewares/rate-limit.middleware.ts";
import { errorMiddleware } from "./middlewares/error.middleware.ts";
import { indexRoutes } from "./routes/index.routes.ts";
import authRouter from "./modules/auth/user.controller.ts";

const app = express();

// Global middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(rateLimitMiddleware);

// Routes
app.use("/auth", authRouter);
app.use("/", indexRoutes);

// Error handling middleware (must be last)
app.use(errorMiddleware);

export default app;
