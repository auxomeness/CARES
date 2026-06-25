import { UserRole } from "@prisma/client";
import { NextFunction, Request, Response, Router } from "express";
import multer from "multer";

import { BadRequestError, BaseError } from "../../../shared/errors";
import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { validateRequest } from "../../../shared/middleware/validateRequest";
import { submissionRateLimiter } from "../../../shared/middleware/submissionRateLimiter";
import { asyncHandler } from "../../../shared/utils/asyncHandler";
import { attachmentController } from "../concern-attachments/attachment.controller";
import { resolutionController } from "../concern-resolutions/resolution.controller";
import { supportController } from "../concern-supports/support.controller";
import { timelineController } from "../concern-timeline/timeline.controller";
import { transferController } from "../concern-transfers/transfer.controller";
import { concernController } from "../controller/concern.controller";
import {
  concernIdParamSchema,
  concernListQuerySchema,
  createConcernSchema,
  createResolutionSchema,
  rejectResolutionSchema,
  transferConcernSchema,
  updateConcernStatusSchema
} from "../validators/concern.validators";

const concernUsers = [
  UserRole.ADMIN,
  UserRole.STUDENT,
  UserRole.OFFICE_STAFF,
  UserRole.DEAN,
  UserRole.CHAIR
];
const handlers = [UserRole.ADMIN, UserRole.OFFICE_STAFF, UserRole.DEAN, UserRole.CHAIR];

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  },
  fileFilter: (_req, file, callback) => {
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

    if (!allowedTypes.has(file.mimetype)) {
      callback(new BadRequestError("Only JPEG, PNG, WebP, and GIF images are allowed"));
      return;
    }
    callback(null, true);
  }
});

function uploadConcernImage(req: Request, res: Response, next: NextFunction): void {
  imageUpload.single("image")(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    next(
      error instanceof BaseError
        ? error
        : new BadRequestError(error instanceof Error ? error.message : "Image upload failed")
    );
  });
}

export const concernRoutes = Router();

concernRoutes.use(authenticate);

concernRoutes.get(
  "/",
  authorize(concernUsers),
  validateRequest({ query: concernListQuerySchema }),
  asyncHandler(concernController.getConcerns)
);
concernRoutes.get(
  "/public",
  authorize([UserRole.STUDENT]),
  validateRequest({ query: concernListQuerySchema }),
  asyncHandler(concernController.getPublicConcerns)
);
concernRoutes.post(
  "/",
  authorize([UserRole.STUDENT]),
  submissionRateLimiter,
  validateRequest({ body: createConcernSchema }),
  asyncHandler(concernController.createConcern)
);
concernRoutes.get(
  "/:id/timeline",
  authorize(concernUsers),
  validateRequest({ params: concernIdParamSchema }),
  asyncHandler(timelineController.getTimeline)
);
concernRoutes.post(
  "/:id/attachments",
  authorize(concernUsers),
  validateRequest({ params: concernIdParamSchema }),
  uploadConcernImage,
  asyncHandler(attachmentController.uploadImage)
);
concernRoutes.post(
  "/:id/support",
  authorize([UserRole.STUDENT]),
  validateRequest({ params: concernIdParamSchema }),
  asyncHandler(supportController.addSupport)
);
concernRoutes.post(
  "/:id/transfer",
  authorize(handlers),
  validateRequest({
    params: concernIdParamSchema,
    body: transferConcernSchema
  }),
  asyncHandler(transferController.transferConcern)
);
concernRoutes.post(
  "/:id/resolution",
  authorize(handlers),
  validateRequest({
    params: concernIdParamSchema,
    body: createResolutionSchema
  }),
  asyncHandler(resolutionController.createResolution)
);
concernRoutes.post(
  "/:id/confirm",
  authorize([UserRole.STUDENT]),
  validateRequest({ params: concernIdParamSchema }),
  asyncHandler(resolutionController.confirmResolution)
);
concernRoutes.post(
  "/:id/reject",
  authorize([UserRole.STUDENT]),
  validateRequest({
    params: concernIdParamSchema,
    body: rejectResolutionSchema
  }),
  asyncHandler(resolutionController.rejectResolution)
);
concernRoutes.patch(
  "/:id/status",
  authorize(handlers),
  validateRequest({
    params: concernIdParamSchema,
    body: updateConcernStatusSchema
  }),
  asyncHandler(concernController.updateConcernStatus)
);
concernRoutes.get(
  "/:id",
  authorize(concernUsers),
  validateRequest({ params: concernIdParamSchema }),
  asyncHandler(concernController.getConcernById)
);
