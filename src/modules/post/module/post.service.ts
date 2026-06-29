import { Types } from "mongoose";
import { CreatePostDto } from "../dto's/post.dto.js";
import type { PostRepository } from "../../../repo/post.repo.js";
import type { IPost } from "../../../interfaces/post.interface.js";
import type { IUserReaction } from "../../../interfaces/user.rection.interface.js";
import BaseRepo from "../../../shared/repos/base.repo.js";
import userReactionRepo from "../../user-reaction/user-reaction.repo.js";
import { On_model, ReactionType } from "../../../shared/enums/enum.js";

export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly reactionRepository: BaseRepo<IUserReaction> = userReactionRepo,
  ) {}

  async Create(data: CreatePostDto, userId: Types.ObjectId) {
    // cast to Partial<IPost> to satisfy exactOptionalPropertyTypes strictness
    return this.postRepository.create({ ...(data as any), userId } as Partial<IPost>);
  }

  async addReaction(
    postId: string | Types.ObjectId,
    userId: Types.ObjectId,
    reactionType: ReactionType,
  ) {
    const refId = typeof postId === "string" ? new Types.ObjectId(postId) : postId;
    return this.reactionRepository.create({
      userId,
      refId,
      onModel: On_model.POST,
      reactionType,
    } as any);
  }

  async findReactionsForPost(postId: string | Types.ObjectId) {
    const refId = typeof postId === "string" ? new Types.ObjectId(postId) : postId;
    return this.reactionRepository.find({ refId, onModel: On_model.POST });
  }

  async findAll() {
    return this.postRepository.find({}, undefined, { sort: { createdAt: -1 } });
  }

  async findById(id: string | Types.ObjectId) {
    return this.postRepository.findById(id);
  }

  async updateById(id: string | Types.ObjectId, update: Partial<CreatePostDto>) {
    return this.postRepository.updateById(id, update as any);
  }

  async deleteById(id: string | Types.ObjectId) {
    return this.postRepository.deleteById(id);
  }
}
export default PostService;