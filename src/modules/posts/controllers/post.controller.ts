import { Router } from "express";
import { NextFunction, Request, Response } from "express";
import PostService from "../services/post.service.js";
import { PostRepository } from "../repositories/post.repository.js";
import { CreateReactionDtoSchema } from "../dto's/reaction.dto.js";

const router = Router();

const postService = new PostService(new PostRepository());

router.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, content, attachments } = req.body;
      const user = req.user as any;
      if (!user || !user._id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const userId = user._id;
      await postService.Create({ title, content, attachments }, userId);

      return res.status(201).json({ message: "Post created successfully" });
    } catch (error) {
      console.error("Error creating post:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
);

router.get("/", async (req: Request, res: Response) => {
  try {
    const posts = await postService.findAll();
    return res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const post = await postService.findById(id as string);
    if (!post) return res.status(404).json({ message: "Post not found" });
    return res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await postService.updateById(id as string, req.body);
    return res.json(updated);
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await postService.deleteById(id as string);
    return res.json({ message: "Post deleted" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/:id/reactions", async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user || !user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parseResult = CreateReactionDtoSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid reaction payload", errors: parseResult.error.errors });
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const reaction = await postService.addReaction(id as string, user._id, parseResult.data.reactionType);
    return res.status(201).json(reaction);
  } catch (error) {
    console.error("Error adding reaction:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id/reactions", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const reactions = await postService.findReactionsForPost(id as string);
    return res.json(reactions);
  } catch (error) {
    console.error("Error fetching reactions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
