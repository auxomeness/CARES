import { BadRequestError, ForbiddenError, NotFoundError } from "../../../shared/errors";
import { AuthenticatedUser } from "../../../shared/types/auth.types";
import { getPagination } from "../../../shared/utils/pagination";
import { notificationRepository } from "../repository/notification.repository";
import { CreateNotificationInput, NotificationListQuery } from "../types/notification.types";

export const notificationService = {
  async createNotification(input: CreateNotificationInput) {
    validateNotificationInput(input);
    const user = await notificationRepository.findUserById(input.userId);
    if (!user) throw new NotFoundError("Notification recipient not found");
    if (!user.isActive) throw new BadRequestError("Notification recipient is inactive");

    return notificationRepository.create(input);
  },

  async createNotifications(
    userIds: string[],
    content: Pick<CreateNotificationInput, "eventKey" | "title" | "message">
  ) {
    const uniqueUserIds = [...new Set(userIds)];
    if (uniqueUserIds.length === 0) return { count: 0 };

    const activeUsers = await notificationRepository.findActiveUserIds(uniqueUserIds);
    if (activeUsers.length === 0) return { count: 0 };

    const inputs = activeUsers.map(({ id }) => ({
      userId: id,
      eventKey: content.eventKey,
      title: content.title,
      message: content.message
    }));
    inputs.forEach(validateNotificationInput);

    return notificationRepository.createMany(inputs);
  },

  async getUserNotifications(actor: AuthenticatedUser, query: NotificationListQuery) {
    const { skip, take } = getPagination(query);
    const [notifications, total, unread] = await Promise.all([
      notificationRepository.findAllForUser(actor.id, query, skip, take),
      notificationRepository.countForUser(actor.id, query),
      notificationRepository.countUnreadForUser(actor.id)
    ]);

    return {
      data: notifications,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        unread
      }
    };
  },

  async markAsRead(id: string, actor: AuthenticatedUser) {
    await assertNotificationOwner(id, actor);
    return notificationRepository.markReadState(id, true);
  },

  async markAsUnread(id: string, actor: AuthenticatedUser) {
    await assertNotificationOwner(id, actor);
    return notificationRepository.markReadState(id, false);
  },

  async markAllAsRead(actor: AuthenticatedUser) {
    return notificationRepository.markAllAsRead(actor.id);
  },

  async deleteNotification(id: string, actor: AuthenticatedUser) {
    await assertNotificationOwner(id, actor);
    return notificationRepository.delete(id);
  }
};

async function assertNotificationOwner(id: string, actor: AuthenticatedUser): Promise<void> {
  const notification = await notificationRepository.findById(id);
  if (!notification) throw new NotFoundError("Notification not found");
  if (notification.userId !== actor.id) {
    throw new ForbiddenError("You cannot access this notification");
  }
}

function validateNotificationInput(input: CreateNotificationInput): void {
  if (!input.userId) throw new BadRequestError("Notification recipient is required");
  if (!input.title.trim()) throw new BadRequestError("Notification title is required");
  if (!input.message.trim()) throw new BadRequestError("Notification message is required");
}
