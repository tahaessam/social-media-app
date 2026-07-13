import { buildSchema } from "graphql";
import UserRepo from "../../modules/users/repositories/user.repository.js";
import { PostRepository } from "../../modules/posts/repositories/post.repository.js";
import ChatService from "../../modules/chats/services/chat.service.js";

const userRepo = new UserRepo();
const postRepo = new PostRepository();
const chatService = new ChatService();

export const createGraphQLSchema = (): string => `
  type User {
    id: ID!
    email: String!
    fullName: String!
    role: String!
    isVerified: Boolean!
    isOnline: Boolean
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    userId: ID!
    createdAt: String!
    updatedAt: String!
  }

  type Conversation {
    id: ID!
    participants: [User!]!
    lastMessage: String
    lastMessageAt: String
  }

  type Message {
    id: ID!
    conversationId: ID!
    senderId: ID!
    receiverId: ID!
    content: String!
    status: String!
    isSeen: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    me: User
    posts: [Post!]!
    conversation(id: ID!): Conversation
    conversations: [Conversation!]!
    messages(conversationId: ID!): [Message!]!
  }

  type Mutation {
    sendMessage(recipientId: ID!, content: String!, conversationId: ID): Message!
  }
`;

export const graphQLResolvers = {
  me: async (_args: any, context: any) => {
    if (!context.user?.userId) return null;
    const user = await userRepo.findById(context.user.userId);
    if (!user) return null;
    return {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isVerified: user.isVerified,
      isOnline: user.isOnline || false,
    };
  },
  posts: async () => {
    const posts = await postRepo.find({}, undefined, { sort: { createdAt: -1 } });
    return posts.map((post: any) => ({
      id: post._id.toString(),
      title: post.title,
      content: post.content,
      userId: post.userId.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }));
  },
  conversation: async ({ id }: { id: string }, context: any) => {
    if (!context.user?.userId) return null;
    const conversation = await chatService.getConversationById(id, context.user.userId);
    if (!conversation) return null;
    return {
      id: conversation._id.toString(),
      participants: await Promise.all(
        conversation.participants.map(async (participant: any) => {
          const user = await userRepo.findById(participant);
          return {
            id: user?._id.toString(),
            email: user?.email,
            fullName: user?.fullName,
            role: user?.role,
            isVerified: user?.isVerified,
            isOnline: user?.isOnline || false,
          };
        }),
      ),
      lastMessage: conversation.lastMessage || null,
      lastMessageAt: conversation.lastMessageAt?.toISOString() || null,
    };
  },
  conversations: async (_args: any, context: any) => {
    if (!context.user?.userId) return [];
    const conversations = await chatService.listConversations(context.user.userId);
    return Promise.all(
      conversations.map(async (conversation: any) => ({
        id: conversation._id.toString(),
        participants: await Promise.all(
          conversation.participants.map(async (participant: any) => {
            const user = await userRepo.findById(participant);
            return {
              id: user?._id.toString(),
              email: user?.email,
              fullName: user?.fullName,
              role: user?.role,
              isVerified: user?.isVerified,
              isOnline: user?.isOnline || false,
            };
          }),
        ),
        lastMessage: conversation.lastMessage || null,
        lastMessageAt: conversation.lastMessageAt?.toISOString() || null,
      })),
    );
  },
  messages: async ({ conversationId }: { conversationId: string }, context: any) => {
    if (!context.user?.userId) return [];
    const messages = await chatService.getMessages(conversationId, context.user.userId);
    return messages.map((message: any) => ({
      id: message._id.toString(),
      conversationId: message.conversationId.toString(),
      senderId: message.senderId.toString(),
      receiverId: message.receiverId.toString(),
      content: message.content,
      status: message.status,
      isSeen: message.isSeen,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
    }));
  },
  sendMessage: async (
    { recipientId, content, conversationId }: { recipientId: string; content: string; conversationId?: string },
    context: any,
  ) => {
    if (!context.user?.userId) {
      throw new Error("Unauthorized");
    }
    const message = await chatService.sendMessage(
      context.user.userId,
      recipientId,
      content,
      conversationId,
    );
    return {
      id: message._id.toString(),
      conversationId: message.conversationId.toString(),
      senderId: message.senderId.toString(),
      receiverId: message.receiverId.toString(),
      content: message.content,
      status: message.status,
      isSeen: message.isSeen,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
    };
  },
};
