import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimitMiddleware } from "./middlewares/rate-limit.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { indexRoutes } from "./routes/index.routes.js";
import authRouter from "./modules/auth/user.controller.js";
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(rateLimitMiddleware);
app.use("/auth", authRouter);
app.use("/", indexRoutes);
app.use(errorMiddleware);
export default app;
//# sourceMappingURL=app.js.map