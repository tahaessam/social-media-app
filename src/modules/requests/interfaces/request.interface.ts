import { Types } from "mongoose";

export type RequestStatus = "pending" | "accepted" | "declined";

export interface IREQUEST {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  status: RequestStatus;
}
export default IREQUEST;