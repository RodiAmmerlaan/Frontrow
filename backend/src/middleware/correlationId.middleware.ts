import { Request, Response, NextFunction } from 'express';
import Logger from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

/**
 * Generates a simple correlation ID using timestamp and random number
 * @returns A string representing a correlation ID
 */
function generateCorrelationId(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

/**
 * Middleware to generate and attach a correlation ID to each request
 * This helps with tracing requests through the system for debugging purposes
 * @param request - Express request object
 * @param response - Express response object
 * @param next - Express next function
 */
export function correlationIdMiddleware(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const correlationId = generateCorrelationId();
  request.correlationId = correlationId;
  
  response.setHeader('X-Correlation-ID', correlationId);
  
  Logger.http(`[${correlationId}] ${request.method} ${request.path} - Request started`);
  
  response.on('finish', () => {
    Logger.http(`[${correlationId}] ${request.method} ${request.path} - Response status: ${response.statusCode}`);
  });
  
  next();
}