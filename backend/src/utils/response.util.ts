import { Response } from 'express';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function sendSuccess<T>(
  response: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response {
  return response.status(statusCode).json({
    success: true,
    data,
    message
  } as ApiResponse<T>);
}

export function sendError(
  response: Response,
  error: string,
  statusCode: number = 500,
  message?: string
): Response {
  return response.status(statusCode).json({
    success: false,
    error,
    message
  } as ApiResponse<null>);
}

export function sendNotFound(
  response: Response,
  message: string = 'Resource not found'
): Response {
  return sendError(response, 'NOT_FOUND', 404, message);
}

export function sendBadRequest(
  response: Response,
  message: string = 'Bad request'
): Response {
  return sendError(response, 'BAD_REQUEST', 400, message);
}

export function sendUnauthorized(
  response: Response,
  message: string = 'Unauthorized'
): Response {
  return sendError(response, 'UNAUTHORIZED', 401, message);
}

export function sendForbidden(
  response: Response,
  message: string = 'Forbidden'
): Response {
  return sendError(response, 'FORBIDDEN', 403, message);
}