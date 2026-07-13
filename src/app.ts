import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "dotenv";
import session from "express-session";
import passport from "./common/utils/passport.config.js";
import { createSessionStore, initRedisClient } from "./common/utils/redis.service.js";
import { rateLimitMiddleware } from "./common/middlewares/rate-limit.middleware.js";
import { errorMiddleware } from "./common/middlewares/error.middleware.js";
import { indexRoutes } from "./routes/index.routes.js";
import authRouter from "./modules/users/controllers/user.controller.js";
import postRouter from "./modules/posts/controllers/post.controller.js";
import commentRoutes from "./modules/comments/routes/comments.routes.js";
import requestRouter from "./modules/requests/controllers/request.controller.js";
import chatRouter from "./modules/chats/controllers/chat.controller.js";
import { createHandler } from "graphql-http/lib/use/express";
import { buildSchema } from "graphql";
import { createGraphQLSchema, graphQLResolvers } from "./common/graphql/schema.js";
import { createGraphQLContext } from "./common/graphql/context.js";

config();

const app = express();
const sessionSecret = process.env.SESSION_SECRET || "change-me-session-secret";

await initRedisClient();
const store = createSessionStore();

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || true, credentials: true }));
app.use(helmet());
app.use(rateLimitMiddleware);

app.use("/auth", authRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRoutes);
app.use("/requests", requestRouter);
app.use("/chats", chatRouter);

const schema = buildSchema(createGraphQLSchema());
app.all(
  "/graphql",
  createHandler({
    schema,
    rootValue: graphQLResolvers,
    context: createGraphQLContext,
  }),
);

app.use("/", indexRoutes);
app.use(errorMiddleware);

export default app;
