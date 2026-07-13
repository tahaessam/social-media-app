import { Schema, model } from "mongoose";
import type { Icomment } from "../interfaces/comments.interface.js";

const commentSchema = new Schema<Icomment>(
  {
    UserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    PostId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    parentid: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    content: {
      type: String,
      required: true,
    },
    mentions: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
    attachments: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const CommentModel = model<Icomment>("Comment", commentSchema);
