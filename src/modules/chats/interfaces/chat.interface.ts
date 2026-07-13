import { Types } from "mongoose";

export interface IConversation {
  participants: Types.ObjectId[];
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  content: string;
  status: "sent" | "delivered" | "read";
  isSeen: boolean;
  createdAt: Date;
  updatedAt: Date;
}
