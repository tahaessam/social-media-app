import { Types } from "mongoose";
export interface IPost {
  userId: Types.ObjectId;
  title?: string;
  content: string;
  attachments?: string[];
//   createdAt: Date;
//   updatedAt: Date;
//   reactions?: {
//     likes: number;
//     dislikes: number;
//     angry: number;
//   };
  sharecount?: number;
  commentscount?: number;
}
