import { Types } from "mongoose";
import {
  requestRepository,
  type RequestRepository,
} from "../repositories/request.repositry.js";
import UserRepo from "../../users/repositories/user.repository.js";
import notificationService from "../../../common/firebase/notification.service.js";

export class RequestService {
  private readonly userRepo = new UserRepo();

  constructor(private readonly requestRepository: RequestRepository) {}

  private async getRequestOrThrow(requestId: Types.ObjectId) {
    const request = await this.requestRepository.findById(requestId);

    if (!request) {
      throw new Error("Request not found");
    }

    return request;
  }

  /**
   * @param senderId => sender (from token)
   * @param receiverId => receiver (from params)
   */
  async sendRequest(senderId: Types.ObjectId, receiverId: Types.ObjectId) {
    // 1. المستخدم ميبعتش لنفسه
    if (senderId.toString() === receiverId.toString()) {
      throw new Error("You can't send a friend request to yourself");
    }

    // 2. Check if request already exists
    const requestExist = await this.requestRepository.findOne({
      $or: [
        {
          sender: senderId,
          receiver: receiverId,
        },
        {
          sender: receiverId,
          receiver: senderId,
        },
      ],
    });

    if (requestExist) {
      throw new Error("Request already exists");
    }

    // 3. Create request
    const request = await this.requestRepository.create({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    const sender = await this.userRepo.findById(senderId);
    const receiver = await this.userRepo.findById(receiverId);

    if (receiver?.fcmToken && sender) {
      await notificationService.sendToToken(receiver.fcmToken, {
        title: "New friend request",
        body: `${sender.fullName} sent you a friend request.`,
        data: {
          type: "friend_request",
          senderId: senderId.toString(),
          requestId: request._id.toString(),
        },
      });
    }

    return request;
  }

  /**
   * Accept request by receiver
   */
  async acceptRequest(requestId: Types.ObjectId, actorId: Types.ObjectId) {
    const request = await this.getRequestOrThrow(requestId);

    if (request.receiver.toString() !== actorId.toString()) {
      throw new Error("Only receiver can accept this request");
    }

    if (request.status !== "pending") {
      throw new Error("Only pending requests can be accepted");
    }

    const updatedRequest = await this.requestRepository.updateById(requestId, {
      status: "accepted",
    });

    const sender = await this.userRepo.findById(request.sender);
    const receiver = await this.userRepo.findById(request.receiver);

    if (sender?.fcmToken && receiver) {
      await notificationService.sendToToken(sender.fcmToken, {
        title: "Request accepted",
        body: `${receiver.fullName} accepted your friend request.`,
        data: {
          type: "friend_request_accepted",
          receiverId: receiver._id.toString(),
          requestId: request._id.toString(),
        },
      });
    }

    return updatedRequest;
  }

  /**
   * Decline request by receiver
   */
  async declineRequest(requestId: Types.ObjectId, actorId: Types.ObjectId) {
    const request = await this.getRequestOrThrow(requestId);

    if (request.receiver.toString() !== actorId.toString()) {
      throw new Error("Only receiver can decline this request");
    }

    if (request.status !== "pending") {
      throw new Error("Only pending requests can be declined");
    }

    return this.requestRepository.updateById(requestId, {
      status: "declined",
    });
  }

  /**
   * Cancel pending request by sender
   */
  async cancelRequest(requestId: Types.ObjectId, actorId: Types.ObjectId) {
    const request = await this.getRequestOrThrow(requestId);

    if (request.sender.toString() !== actorId.toString()) {
      throw new Error("Only sender can cancel this request");
    }

    if (request.status !== "pending") {
      throw new Error("Only pending requests can be canceled");
    }

    await this.requestRepository.deleteById(requestId);

    return {
      message: "Request canceled successfully",
    };
  }

  /**
   * Remove request by either participant
   */
  async removeRequest(requestId: Types.ObjectId, actorId: Types.ObjectId) {
    const request = await this.getRequestOrThrow(requestId);

    const isSender = request.sender.toString() === actorId.toString();
    const isReceiver = request.receiver.toString() === actorId.toString();

    if (!isSender && !isReceiver) {
      throw new Error("Only participants can remove this request");
    }

    await this.requestRepository.deleteById(requestId);

    return {
      message: "Request removed successfully",
    };
  }
}
export default new RequestService(requestRepository);
