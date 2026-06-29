import { Types } from "mongoose";
export interface Icomment {
  UserId: Types.ObjectId;
  PostId: Types.ObjectId;
  parentid?: Types.ObjectId;
  content: string;
  mentions?: Types.ObjectId[];
  attachments?: string;
}
