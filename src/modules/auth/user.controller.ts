import { Router } from "express";
import UserService from "./user.service.js";
import { validateBody } from "../../middlewares/validation.ts";
import { signupSchema, loginSchema } from "./user.validation.ts";

const authRouter = Router();

// Auth signup endpoint
authRouter.post("/signup", validateBody(signupSchema), (req, res, next) => UserService.signup(req, res, next));

// Auth login endpoint
authRouter.post("/login", validateBody(loginSchema), (req, res, next) => UserService.login(req, res, next));

export default authRouter;
