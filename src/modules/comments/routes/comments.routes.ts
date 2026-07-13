import { Router } from "express";
import commentController from "../controllers/comments.controller.js";

const router = Router();
router.use("/", commentController);

export default router;
