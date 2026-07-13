import { Types } from "mongoose";
import { ChatRepository, MessageRepository } from "../repositories/chat.repository.js";
import UserRepo from "../../users/repositories/user.repository.js";

class ChatService {
  private readonly chatRepository = new ChatRepository();
  private readonly messageRepository = new MessageRepository();
  private readonly userRepo = new UserRepo();

  async getConversationById(conversationId: string, userId: string) {
    const conversation = await this.chatRepository.findById(conversationId);
    if (!conversation) return null;
    if (!conversation.participants.some((participant) => participant.toString() === userId)) {
      return null;
    }
    return conversation;
  }

  async listConversations(userId: string) {
    return this.chatRepository.listByParticipant(userId);
  }

  async getMessages(conversationId: string, userId: string) {
    const conversation = await this.getConversationById(conversationId, userId);
    if (!conversation) return [];
    await this.messageRepository.markAsRead(conversationId, userId);
    return this.messageRepository.listByConversation(conversationId);
  }

  async sendMessage(senderId: string, receiverId: string, content: string, conversationId?: string) {
    const senderObjectId = new Types.ObjectId(senderId);
    const receiverObjectId = new Types.ObjectId(receiverId);

    let conversation = conversationId
      ? await this.chatRepository.findById(conversationId)
      : null;

    if (!conversation || !conversation.participants.some((participant) => participant.equals(senderObjectId))) {
      conversation = await this.chatRepository.findBetweenParticipants(senderId, receiverId);
    }

    if (!conversation) {
      conversation = await this.chatRepository.create({
        participants: [senderObjectId, receiverObjectId],
        lastMessage: content,
        lastMessageAt: new Date(),
      } as any);
    } else {
      await this.chatRepository.updateById(conversation._id, {
        lastMessage: content,
        lastMessageAt: new Date(),
      });
    }

    const message = await this.messageRepository.create({
      conversationId: conversation._id,
      senderId: senderObjectId,
      receiverId: receiverObjectId,
      content,
      status: "sent",
      isSeen: false,
    } as any);

    return message;
  }
}

export default ChatService;
