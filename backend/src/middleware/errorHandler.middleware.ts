import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../errors/CustomErrors';
import { sendError } from '../utils/response.util';
import Logger from '../utils/logger';

/**
 * Global error handling middleware
 * Catches all errors and sends standardized responses
 * @param error - The error object
 * @param request - Express request object
 * @param response - Express response object
 * @param next - Express next function
 */
export function errorHandler(
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction
) {
  if (!(error instanceof CustomError) || !error.isOperational) {
    Logger.error('Unexpected error:', error);
  }

  if (error instanceof CustomError) {
    Logger.warn(`Custom error: ${error.errorCode} - ${error.message}`);
    return sendError(
      response,
      error.errorCode,
      error.statusCode,
      error.message
    );
  }

  if (error.name === 'ValidationError') {
    Logger.warn(`Validation error: ${error.message}`);
    return sendError(
      response,
      'VALIDATION_ERROR',
      400,
      error.message
    );
  }

  if (error.name === 'SyntaxError' && (error as any).status === 400) {
    Logger.warn(`Syntax error: ${error.message}`);
    return sendError(
      response,
      'SYNTAX_ERROR',
      400,
      'Invalid JSON syntax'
    );
  }

  if (error.name === 'MongoError' && (error as any).code === 11000) {
    Logger.warn(`Duplicate key error: ${error.message}`);
    return sendError(
      response,
      'DUPLICATE_KEY_ERROR',
      409,
      'Duplicate key error'
    );
  }

  Logger.error('Internal server error:', error);
  return sendError(
    response,
    'INTERNAL_ERROR',
    500,
    'An unexpected error occurred'
  );
}