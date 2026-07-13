import { Router } from "express";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../../../common/middlewares/validation.js";
import { authenticate } from "../../../common/middlewares/auth.middleware.js";
import CommentService from "../services/comments.service.js";
import { CommentRepository } from "../repositories/comments.repository.js";
import {
  createCommentSchema,
  updateCommentSchema,
  getCommentsSchema,
  commentIdSchema,
  reactCommentSchema,
} from "../validations/comments.validation.js";

const router = Router();
const commentService = new CommentService(new CommentRepository());

router.post(
  "/",
  authenticate,
  validateBody(createCommentSchema),
  async (req, res) => {
    const user = req.user as any;
    const { postId, parentId, content, attachments, mentions } = req.body;
    const comment = await commentService.createComment({
      userId: user._id,
      postId,
      parentId,
      content,
      attachments,
      mentions,
    });
    return res.status(201).json(comment);
  },
);

router.get("/", validateQuery(getCommentsSchema), async (req, res) => {
  const { postId, page, limit } = req.query as any;
  const comments = await commentService.getCommentsForPost(
    postId,
    Number(page),
    Number(limit),
  );
  return res.json(comments);
});

router.put(
  "/:id",
  authenticate,
  validateParams(commentIdSchema),
  validateBody(updateCommentSchema),
  async (req, res) => {
    const user = req.user as any;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await commentService.updateComment(
      id,
      user._id,
      req.body.content,
    );
    return res.json(updated);
  },
);

router.delete(
  "/:id",
  authenticate,
  validateParams(commentIdSchema),
  async (req, res) => {
    const user = req.user as any;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await commentService.deleteComment(id, user._id);
    return res.json({ message: "Comment deleted" });
  },
);

router.post(
  "/:id/reactions",
  authenticate,
  validateParams(commentIdSchema),
  validateBody(reactCommentSchema),
  async (req, res) => {
    const user = req.user as any;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const reaction = await commentService.reactToComment(
      id,
      user._id,
      req.body.reactionType,
    );
    return res.status(201).json(reaction);
  },
);

router.delete(
  "/:id/reactions",
  authenticate,
  validateParams(commentIdSchema),
  async (req, res) => {
    const user = req.user as any;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await commentService.removeCommentReaction(id, user._id);
    return res.json({ message: "Reaction removed" });
  },
);

router.get(
  "/:id/reactions",
  validateParams(commentIdSchema),
  async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const currentUserId = (req.user as any)?._id;
    const result = await commentService.getCommentReactions(id, currentUserId);
    return res.json(result);
  },
);

export default router;
