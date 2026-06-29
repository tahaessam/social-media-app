import { Router } from "express";
import commentController from "./comments.controller.js";

const router = Router();
router.use("/", commentController);

export default router;
