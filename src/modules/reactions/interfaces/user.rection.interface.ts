import { On_model, ReactionType } from "../../../common/enums/enum.js";
import { Types } from "mongoose";
export interface IUserReaction {
  userId: Types.ObjectId;
  refId: Types.ObjectId;
  onModel: On_model;
  reactionType: ReactionType;//0:like, 1:dislike, 2:angry,3:love,4:haha,5:wow,6:sad
}
