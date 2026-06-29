import { model } from "mongoose";
import type { IPost } from "../../../interfaces/post.interface.js";
import postSchema from "./post.schema.js";

export const post = model<IPost>("Post", postSchema);
