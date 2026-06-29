import BaseRepo from "./base.repo.js";
import { IPost } from "../interfaces/post.interface.js";
import { post as PostModel } from "../modules/post/db/post.model.js";

export class PostRepository extends BaseRepo<IPost> {
  constructor() {
    super(PostModel);
  }
}
