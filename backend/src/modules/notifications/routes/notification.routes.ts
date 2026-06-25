import { Router } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { validateRequest } from "../../../shared/middleware/validateRequest";
import { asyncHandler } from "../../../shared/utils/asyncHandler";
import { notificationController } from "../controller/notification.controller";
import {
  notificationIdParamSchema,
  notificationListQuerySchema
} from "../validators/notification.validators";

export const notificationRoutes = Router();

notificationRoutes.use(authenticate);

notificationRoutes.get(
  "/",
  validateRequest({ query: notificationListQuerySchema }),
  asyncHandler(notificationController.getNotifications)
);
notificationRoutes.patch("/read-all", asyncHandler(notificationController.markAllAsRead));
notificationRoutes.patch(
  "/:id/read",
  validateRequest({ params: notificationIdParamSchema }),
  asyncHandler(notificationController.markAsRead)
);
notificationRoutes.patch(
  "/:id/unread",
  validateRequest({ params: notificationIdParamSchema }),
  asyncHandler(notificationController.markAsUnread)
);
notificationRoutes.delete(
  "/:id",
  validateRequest({ params: notificationIdParamSchema }),
  asyncHandler(notificationController.deleteNotification)
);
