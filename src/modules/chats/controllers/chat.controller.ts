import { Router } from "express";
import { authenticate } from "../../../common/middlewares/auth.middleware.js";
import ChatService from "../services/chat.service.js";
import UserRepo from "../../users/repositories/user.repository.js";

const router = Router();
const chatService = new ChatService();
const userRepo = new UserRepo();

const serializeMessage = (message: any) => ({
  id: message._id?.toString?.() || message.id,
  conversationId: message.conversationId?.toString?.() || message.conversationId,
  senderId: message.senderId?.toString?.() || message.senderId,
  receiverId: message.receiverId?.toString?.() || message.receiverId,
  content: message.content,
  status: message.status,
  isSeen: message.isSeen,
  createdAt: message.createdAt,
  updatedAt: message.updatedAt,
});

const serializeUser = (user: any) => ({
  id: user._id.toString(),
  email: user.email,
  fullName: user.fullName,
  isOnline: user.isOnline || false,
});

router.get("/", authenticate, async (req, res, next) => {
  try {
    const user = req.user as any;
    const conversations = await chatService.listConversations(user.userId);
    const payload = await Promise.all(
      conversations.map(async (conversation: any) => {
        const participants = await Promise.all(
          conversation.participants.map(async (participantId: any) => {
            const participant = await userRepo.findById(participantId);
            return participant
              ? serializeUser(participant)
              : { id: participantId.toString(), email: "", fullName: "Unknown", isOnline: false };
          }),
        );
        return {
          id: conversation._id.toString(),
          participants,
          lastMessage: conversation.lastMessage || null,
          lastMessageAt: conversation.lastMessageAt || null,
        };
      }),
    );
    return res.json(payload);
  } catch (error) {
    return next(error);
  }
});

router.get("/:conversationId/messages", authenticate, async (req, res, next) => {
  try {
    const user = req.user as any;
    const conversationId = Array.isArray(req.params.conversationId)
      ? req.params.conversationId[0]
      : req.params.conversationId;
    const messages = await chatService.getMessages(conversationId, user.userId);
    return res.json(messages.map(serializeMessage));
  } catch (error) {
    return next(error);
  }
});

router.post("/send", authenticate, async (req, res, next) => {
  try {
    const user = req.user as any;
    const { recipientId, content, conversationId } = req.body;
    if (!recipientId || !content) {
      return res.status(400).json({ message: "recipientId and content are required" });
    }
    const message = await chatService.sendMessage(
      user.userId,
      recipientId,
      content,
      conversationId,
    );
    return res.status(201).json(serializeMessage(message));
  } catch (error) {
    return next(error);
  }
});

export default router;
