import { Types } from "mongoose";
import BaseRepo from "../../../common/repositories/base.repo.js";
import Conversation, { IConversation } from "../models/conversation.model.js";
import Message, { IMessage } from "../models/message.model.js";

export class ChatRepository extends BaseRepo<IConversation> {
  constructor() {
    super(Conversation);
  }

  async findBetweenParticipants(userA: string, userB: string) {
    const objectIdA = new Types.ObjectId(userA);
    const objectIdB = new Types.ObjectId(userB);
    return this.findOne({
      participants: { $all: [objectIdA, objectIdB] },
    });
  }

  async listByParticipant(userId: string) {
    const objectId = new Types.ObjectId(userId);
    return this.find({ participants: objectId }, undefined, { sort: { lastMessageAt: -1 } });
  }
}

export class MessageRepository extends BaseRepo<IMessage> {
  constructor() {
    super(Message);
  }

  async listByConversation(conversationId: string) {
    return this.find({ conversationId: new Types.ObjectId(conversationId) }, undefined, { sort: { createdAt: 1 } });
  }

  async markAsRead(conversationId: string, readerId: string) {
    return this.model.updateMany(
      { conversationId: new Types.ObjectId(conversationId), receiverId: new Types.ObjectId(readerId), isSeen: false },
      { status: "read", isSeen: true },
    );
  }
}
