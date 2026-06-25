import { NextFunction, Request, Response } from "express";
import { timingSafeEqual } from "node:crypto";

import { env } from "../../config/env";
import { errorResponse } from "../utils/apiResponse";

export function metricsAuth(req: Request, res: Response, next: NextFunction): void {
  if (!env.METRICS_TOKEN) {
    errorResponse(res, 404, "Resource not found");
    return;
  }

  const provided = req.header("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const expected = env.METRICS_TOKEN;
  const matches =
    provided.length === expected.length &&
    timingSafeEqual(Buffer.from(provided), Buffer.from(expected));

  if (!matches) {
    errorResponse(res, 401, "Invalid metrics credentials");
    return;
  }

  next();
}
