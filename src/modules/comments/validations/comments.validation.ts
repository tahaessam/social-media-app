import z from "zod";
import { ReactionType } from "../../../common/enums/enum.js";

export const createCommentSchema = z.object({
  postId: z.string().min(1),
  parentId: z.string().optional(),
  content: z.string().min(1),
  attachments: z.string().optional(),
  mentions: z.array(z.string()).optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1),
});

export const getCommentsSchema = z.object({
  postId: z.string().min(1),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const commentIdSchema = z.object({
  id: z.string().min(1),
});

export const reactCommentSchema = z.object({
  reactionType: z.nativeEnum(ReactionType),
});
