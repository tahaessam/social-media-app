import { model } from "mongoose";
import type { IPost } from "../interfacees/post.interface.js";
import postSchema from "../schemas/post.schema.js";

export const post = model<IPost>("Post", postSchema);
