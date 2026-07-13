import { messaging } from "./firebase.js";
import type { Message, MulticastMessage, Notification } from "firebase-admin/messaging";

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

const createNotification = (payload: NotificationPayload): Notification => {
  const notification: Notification = {
    title: payload.title,
    body: payload.body,
  };

  if (payload.imageUrl) {
    notification.imageUrl = payload.imageUrl;
  }

  return notification;
};

const sendToToken = async (token: string, payload: NotificationPayload) => {
  if (!messaging) return null;
  const message: Message = {
    token,
    notification: createNotification(payload),
    data: payload.data ?? {},
  };
  return messaging.send(message);
};

const sendToTopic = async (topic: string, payload: NotificationPayload) => {
  if (!messaging) return null;
  const message: Message = {
    topic,
    notification: createNotification(payload),
    data: payload.data ?? {},
  };
  return messaging.send(message);
};

const sendToTokens = async (tokens: string[], payload: NotificationPayload) => {
  if (!messaging) return null;
  const message: MulticastMessage = {
    tokens,
    notification: createNotification(payload),
    data: payload.data ?? {},
  };
  return messaging.sendEachForMulticast(message);
};

const notificationService = {
  sendToToken,
  sendToTopic,
  sendToTokens,
};

export default notificationService;
