import { Types } from "mongoose";
import type { CommentRepository } from "../repositories/comments.repository.js";
import type { IUserReaction } from "../../reactions/interfaces/user.rection.interface.js";
import BaseRepo from "../../../common/repositories/base.repo.js";
import userReactionRepo from "../../reactions/repositories/user-reaction.repo.js";
import { On_model, ReactionType } from "../../../common/enums/enum.js";

interface CreateCommentPayload {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  parentId?: Types.ObjectId;
  content: string;
  attachments?: string;
  mentions?: Types.ObjectId[];
}

export class CommentService {
  private readonly reactionRepository: BaseRepo<IUserReaction>;

  constructor(
    private readonly commentRepository: CommentRepository,
    reactionRepository?: BaseRepo<IUserReaction>,
  ) {
    this.reactionRepository = reactionRepository ?? userReactionRepo;
  }

  async createComment(payload: CreateCommentPayload) {
    return this.commentRepository.create(payload as any);
  }

  async getCommentsForPost(postId: string | Types.ObjectId, page = 1, limit = 10) {
    const filter = { PostId: typeof postId === "string" ? new Types.ObjectId(postId) : postId, parentid: undefined };
    const skip = (page - 1) * limit;
    return this.commentRepository.find(filter, undefined, { skip, limit, sort: { createdAt: -1 } });
  }

  async updateComment(commentId: string, userId: Types.ObjectId, content: string) {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) throw new Error("Comment not found");
    if (!comment.UserId.equals(userId)) throw new Error("Not authorized");
    return this.commentRepository.updateById(commentId, { content } as any);
  }

  async deleteComment(commentId: string, userId: Types.ObjectId) {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) throw new Error("Comment not found");
    if (!comment.UserId.equals(userId)) throw new Error("Not authorized");
    return this.commentRepository.deleteById(commentId);
  }

  async reactToComment(commentId: string, userId: Types.ObjectId, reactionType: ReactionType) {
    const refId = new Types.ObjectId(commentId);
    const existing = await this.reactionRepository.findOne({ userId, refId, onModel: On_model.COMMENT });
    if (existing) {
      if (existing.reactionType === reactionType) {
        return existing;
      }
      return this.reactionRepository.updateOne({ _id: existing._id }, { reactionType } as any);
    }
    return this.reactionRepository.create({ userId, refId, onModel: On_model.COMMENT, reactionType } as any);
  }

  async removeCommentReaction(commentId: string, userId: Types.ObjectId) {
    const refId = new Types.ObjectId(commentId);
    return this.reactionRepository.deleteOne({ userId, refId, onModel: On_model.COMMENT });
  }

  async getCommentReactions(commentId: string, currentUserId?: string) {
    const refId = new Types.ObjectId(commentId);
    const reactions = await this.reactionRepository.find({ refId, onModel: On_model.COMMENT });
    const counts = reactions.reduce((acc, reaction) => {
      acc[reaction.reactionType] = (acc[reaction.reactionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const currentUserReaction = reactions.find(r => currentUserId && r.userId.toString() === currentUserId);
    return { counts, currentUserReaction };
  }
}

export default CommentService;
