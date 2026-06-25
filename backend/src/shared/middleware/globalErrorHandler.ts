import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

import { env } from "../../config/env";
import {
  BaseError,
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError
} from "../errors";
import { errorResponse } from "../utils/apiResponse";
import { logger } from "../utils/logger";

function normalizeError(error: unknown): BaseError {
  if (error instanceof BaseError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new BadRequestError("Validation failed", error.issues);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return new ConflictError("Resource already exists");
    if (error.code === "P2003") return new ConflictError("Related records prevent this operation");
    if (error.code === "P2025") return new NotFoundError("Resource not found");
    return new InternalServerError();
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new BadRequestError("Invalid database operation");
  }

  if (error instanceof Error) {
    return new InternalServerError();
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

  const logContext = {
    error: normalizedError,
    stack: env.NODE_ENV === "production" ? undefined : normalizedError.stack
  };
  if (normalizedError.statusCode >= 500) {
    logger.error(logContext, normalizedError.message);
  } else {
    logger.warn(logContext, normalizedError.message);
  }

  const message =
    env.NODE_ENV === "production" && !normalizedError.isOperational
      ? "Something went wrong"
      : normalizedError.message;

  const errors =
    env.NODE_ENV === "production" && !normalizedError.isOperational ? [] : normalizedError.errors;

  return errorResponse(res, normalizedError.statusCode, message, errors);
}
