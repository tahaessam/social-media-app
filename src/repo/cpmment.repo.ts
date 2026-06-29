import BaseRepo from "./base.repo.js";
import { Icomment } from "../interfaces/comments.interface.js";
import { CommentModel } from "../modules/comments/DB/comments.model.js";
export class CommentRepository extends BaseRepo<Icomment> {
  constructor() {
    super(CommentModel);
  }
}
