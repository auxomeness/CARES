import { NextFunction, Request, Response } from "express";

import { env } from "../../config/env";
import { errorResponse } from "../utils/apiResponse";

export function requestTimeout(req: Request, res: Response, next: NextFunction): void {
  res.setTimeout(env.REQUEST_TIMEOUT_MS, () => {
    if (res.headersSent) {
      res.end();
      return;
    }

    errorResponse(res, 503, "Request timed out");
  });

  next();
}
