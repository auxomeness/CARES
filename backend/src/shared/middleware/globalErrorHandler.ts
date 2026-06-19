import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { env } from "../../config/env";
import { BaseError, BadRequestError } from "../errors";
import { errorResponse } from "../utils/apiResponse";
import { logger } from "../utils/logger";

function normalizeError(error: unknown): BaseError {
  if (error instanceof BaseError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new BadRequestError("Validation failed", error.issues);
  }

  if (error instanceof Error) {
    return new BaseError(error.message, 500, [], false);
  }

  return new BaseError("Something went wrong", 500, [], false);
}

export function globalErrorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  const normalizedError = normalizeError(error);

  logger.error(
    {
      error: normalizedError,
      stack: env.NODE_ENV === "production" ? undefined : normalizedError.stack
    },
    normalizedError.message
  );

  const message =
    env.NODE_ENV === "production" && !normalizedError.isOperational
      ? "Something went wrong"
      : normalizedError.message;

  const errors =
    env.NODE_ENV === "production" && !normalizedError.isOperational
      ? []
      : normalizedError.errors;

  return errorResponse(res, normalizedError.statusCode, message, errors);
}
