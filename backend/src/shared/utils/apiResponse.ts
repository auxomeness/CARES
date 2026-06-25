import { Response } from "express";

export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors: unknown[];
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
};

export function successResponse<T>(
  res: Response,
  message = "Operation successful",
  data: T
): Response<ApiSuccessResponse<T>> {
  return res.status(200).json({
    success: true,
    message,
    data
  });
}

export function createdResponse<T>(
  res: Response,
  message = "Resource created successfully",
  data: T
): Response<ApiSuccessResponse<T>> {
  return res.status(201).json({
    success: true,
    message,
    data
  });
}

export function paginatedResponse<T>(
  res: Response,
  message: string,
  data: T[],
  meta: PaginationMeta
): Response<{ success: true; message: string; data: T[]; meta: PaginationMeta }> {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta
  });
}

export function errorResponse(
  res: Response,
  statusCode: number,
  message = "Something went wrong",
  errors: unknown[] = []
): Response<ApiErrorResponse> {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
}
