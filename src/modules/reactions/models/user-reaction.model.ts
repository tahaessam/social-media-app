import { Schema, model } from "mongoose";
import { IUserReaction } from "../interfaces/user.rection.interface.js";
import { On_model, ReactionType } from "../../../common/enums/enum.js";

const userReactionSchema = new Schema<IUserReaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    refId: {
      type: Schema.Types.ObjectId,
      refPath: "onModel",
      required: true,
    },
    onModel: {
      type: String,
      enum: Object.values(On_model),
      required: true,
    },
    reactionType: {
      type: String,
      enum: Object.values(ReactionType),
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const UserReactionModel = model<IUserReaction>(
  "User-Reaction",
  userReactionSchema,
);
