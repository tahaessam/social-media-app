import { Router } from "express";
import UserService from "./user.service.js";
const authRouter = Router();
authRouter.post("/signup", (req, res, next) => UserService.signup(req, res, next));
authRouter.post("/login", (req, res, next) => UserService.login(req, res, next));
export default authRouter;
//# sourceMappingURL=user.controller.js.map