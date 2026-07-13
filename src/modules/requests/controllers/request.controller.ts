import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { authenticate } from "../../../common/middlewares/auth.middleware.js";
import { RequestRepository } from "../repositories/request.repositry.js";
import { RequestService } from "../services/request.service.js";

const router = Router();

const requestRepository = new RequestRepository();
const requestService = new RequestService(requestRepository);

router.post(
  "/send-request",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as any;
      const senderId = user?._id;
      const { receiverId } = req.body;

      if (!senderId || !receiverId) {
        return res.status(400).json({
          message: "Sender and receiver IDs are required",
        });
      }

      if (!Types.ObjectId.isValid(receiverId)) {
        return res.status(400).json({
          message: "Invalid receiver ID",
        });
      }

      const request = await requestService.sendRequest(
        new Types.ObjectId(senderId),
        new Types.ObjectId(receiverId),
      );

      return res.status(201).json({
        message: "Request sent successfully",
        data: request,
      });
    } catch (error) {
      return next(error);
    }
  },
);

router.patch(
  "/:requestId/accept",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as any;
      const actorId = user?._id;
      const requestId = Array.isArray(req.params.requestId)
        ? req.params.requestId[0]
        : req.params.requestId;

      if (!actorId || !requestId || !Types.ObjectId.isValid(requestId)) {
        return res.status(400).json({ message: "Invalid request or user ID" });
      }

      const request = await requestService.acceptRequest(
        new Types.ObjectId(requestId),
        new Types.ObjectId(actorId),
      );

      return res.status(200).json({
        message: "Request accepted successfully",
        data: request,
      });
    } catch (error) {
      return next(error);
    }
  },
);

router.patch(
  "/:requestId/decline",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as any;
      const actorId = user?._id;
      const requestId = Array.isArray(req.params.requestId)
        ? req.params.requestId[0]
        : req.params.requestId;

      if (!actorId || !requestId || !Types.ObjectId.isValid(requestId)) {
        return res.status(400).json({ message: "Invalid request or user ID" });
      }

      const request = await requestService.declineRequest(
        new Types.ObjectId(requestId),
        new Types.ObjectId(actorId),
      );

      return res.status(200).json({
        message: "Request declined successfully",
        data: request,
      });
    } catch (error) {
      return next(error);
    }
  },
);

router.delete(
  "/:requestId/cancel",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as any;
      const actorId = user?._id;
      const requestId = Array.isArray(req.params.requestId)
        ? req.params.requestId[0]
        : req.params.requestId;

      if (!actorId || !requestId || !Types.ObjectId.isValid(requestId)) {
        return res.status(400).json({ message: "Invalid request or user ID" });
      }

      const result = await requestService.cancelRequest(
        new Types.ObjectId(requestId),
        new Types.ObjectId(actorId),
      );

      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  },
);

router.delete(
  "/:requestId/remove",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as any;
      const actorId = user?._id;
      const requestId = Array.isArray(req.params.requestId)
        ? req.params.requestId[0]
        : req.params.requestId;

      if (!actorId || !requestId || !Types.ObjectId.isValid(requestId)) {
        return res.status(400).json({ message: "Invalid request or user ID" });
      }

      const result = await requestService.removeRequest(
        new Types.ObjectId(requestId),
        new Types.ObjectId(actorId),
      );

      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  },
);

export default router;
