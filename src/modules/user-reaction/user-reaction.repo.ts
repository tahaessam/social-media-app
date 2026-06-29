import {IUserReaction} from '../../interfaces/user.rection.interface.js';
import BaseRepo from '../../shared/repos/base.repo.js';
import { UserReactionModel } from './user-reaction.model.js';

class UserReactionRepo extends BaseRepo<IUserReaction> {
  constructor() {
    super(UserReactionModel);
  }
}

export default new UserReactionRepo();