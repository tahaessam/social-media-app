import BaseRepo from "../../../common/repositories/base.repo.js";
import { IPost } from "../interfacees/post.interface.js";
import { post as PostModel } from "../models/post.model.js";

export class PostRepository extends BaseRepo<IPost> {
  constructor() {
    super(PostModel);
  }
}
