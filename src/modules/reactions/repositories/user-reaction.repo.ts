import { IUserReaction } from "../interfaces/user.rection.interface.js";
import BaseRepo from "../../../common/repositories/base.repo.js";
import { UserReactionModel } from "../models/user-reaction.model.js";

class UserReactionRepo extends BaseRepo<IUserReaction> {
  constructor() {
    super(UserReactionModel);
  }
}

export default new UserReactionRepo();