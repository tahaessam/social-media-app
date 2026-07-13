import BaseRepo from "../../../common/repositories/base.repo.js";
import { Icomment } from "../interfaces/comments.interface.js";
import { CommentModel } from "../models/comments.model.js";
export class CommentRepository extends BaseRepo<Icomment> {
  constructor() {
    super(CommentModel);
  }
}
