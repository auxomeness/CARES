import rateLimit from "express-rate-limit";

import { errorResponse } from "../utils/apiResponse";

export const submissionRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id ?? req.ip ?? "unknown",
  handler: (_req, res) => errorResponse(res, 429, "Too many submissions. Please try again later.")
});
