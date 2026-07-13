import { Types } from "mongoose";
import { model, Schema } from "mongoose";
import type { IREQUEST } from "../interfaces/request.interface.js";

const schema = new Schema<IREQUEST>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const RequestModel = model("Request", schema);
