import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "dotenv";
import session from "express-session";
import passport from "./shared/utils/passport.config.js";
import { rateLimitMiddleware } from "./shared/middlewares/rate-limit.middleware.js";
import { errorMiddleware } from "./shared/middlewares/error.middleware.js";
import { indexRoutes } from "./routes/index.routes.js";
import authRouter from "./modules/user/user.controller.js";
import postRouter from "./modules/post/module/post.controller.js";
import commentRoutes from "./modules/comments/comments.routes.js";

config();

const app = express();
const sessionSecret = process.env.SESSION_SECRET || "change-me-session-secret";

app.use(session({ secret: sessionSecret, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(rateLimitMiddleware);

app.use("/auth", authRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRoutes);
app.use("/", indexRoutes);

app.use(errorMiddleware);

export default app;
