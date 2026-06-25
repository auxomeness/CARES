import { Request, Response } from "express";

import { UnauthorizedError } from "../../../shared/errors";
import { successResponse } from "../../../shared/utils/apiResponse";
import { notificationService } from "../service/notification.service";
import { NotificationListQuery } from "../types/notification.types";

export const notificationController = {
  async getNotifications(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const result = await notificationService.getUserNotifications(
      actor,
      req.query as unknown as NotificationListQuery
    );

    return res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully",
      data: result.data,
      meta: result.meta
    });
  },

  async markAsRead(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const notification = await notificationService.markAsRead(req.params.id, actor);
    return successResponse(res, "Notification marked as read", { notification });
  },

  async markAsUnread(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const notification = await notificationService.markAsUnread(req.params.id, actor);
    return successResponse(res, "Notification marked as unread", { notification });
  },

  async markAllAsRead(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const result = await notificationService.markAllAsRead(actor);
    return successResponse(res, "All notifications marked as read", {
      updatedCount: result.count
    });
  },

  async deleteNotification(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const notification = await notificationService.deleteNotification(req.params.id, actor);
    return successResponse(res, "Notification deleted successfully", { notification });
  }
};

function requireActor(req: Request) {
  if (!req.user) throw new UnauthorizedError("Authentication required");
  return req.user;
}
