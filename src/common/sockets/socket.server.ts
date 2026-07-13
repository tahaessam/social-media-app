import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cacheProvider from "../utils/redis.service.js";
import UserRepo from "../../modules/users/repositories/user.repository.js";
import ChatService from "../../modules/chats/services/chat.service.js";

const userRepo = new UserRepo();
const chatService = new ChatService();

export const attachSocketServer = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || true,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers["authorization"]?.toString().replace("Bearer ", "");
    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as Record<string, any>;
      const cachedToken = await cacheProvider.get(`session:${decoded.userId}`);
      if (!cachedToken || cachedToken !== token) {
        return next(new Error("Authentication error"));
      }

      socket.data.user = decoded;
      next();
    } catch {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", async (socket) => {
    const user = socket.data.user;
    if (!user) return;

    const userId = user.userId;
    const socketRoom = `user:${userId}`;
    socket.join(socketRoom);

    await cacheProvider.set(`online:${userId}`, "true");

    io.emit("user:status", { userId, online: true });

    socket.on("typing:start", ({ conversationId, recipientId }) => {
      if (!conversationId || !recipientId) return;
      io.to(`user:${recipientId}`).emit("typing:start", { conversationId, senderId: userId });
    });

    socket.on("typing:stop", ({ conversationId, recipientId }) => {
      if (!conversationId || !recipientId) return;
      io.to(`user:${recipientId}`).emit("typing:stop", { conversationId, senderId: userId });
    });

    socket.on("message:send", async ({ recipientId, content, conversationId }) => {
      if (!recipientId || !content) return;
      const message = await chatService.sendMessage(userId, recipientId, content, conversationId);
      const payload = {
        id: message._id.toString(),
        conversationId: message.conversationId.toString(),
        senderId: message.senderId.toString(),
        receiverId: message.receiverId.toString(),
        content: message.content,
        status: message.status,
        isSeen: message.isSeen,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      };
      io.to(`user:${recipientId}`).emit("message:received", payload);
      io.to(socketRoom).emit("message:sent", payload);
      io.emit("conversation:update", {
        conversationId: payload.conversationId,
        lastMessage: payload.content,
        lastMessageAt: payload.createdAt,
      });
    });

    socket.on("message:read", async ({ conversationId }) => {
      if (!conversationId) return;
      await chatService.getMessages(conversationId, userId);
      io.to(socketRoom).emit("message:read", { conversationId, userId });
    });

    socket.on("disconnect", async () => {
      await cacheProvider.del(`online:${userId}`);
      io.emit("user:status", { userId, online: false });
    });
  });
};
