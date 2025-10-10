import { Request, Response } from 'express';
import { 
  sendSuccess, 
  sendError, 
  sendNotFound, 
  sendBadRequest, 
  sendUnauthorized, 
  sendForbidden 
} from '../utils/response.util';
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  BadRequestError,
  ConflictError,
  InternalServerError
} from '../errors';

export class BaseController {
  /**
   * Send a successful response
   * @param response - Express response object
   * @param data - Data to send in the response
   * @param message - Optional message
   * @param statusCode - HTTP status code (default: 200)
   */
  protected sendSuccess<T>(
    response: Response,
    data: T,
    message?: string,
    statusCode: number = 200
  ): Response {
    return sendSuccess(response, data, message, statusCode);
  }

  /**
   * Send an error response
   * @param response - Express response object
   * @param error - Error identifier
   * @param statusCode - HTTP status code (default: 500)
   * @param message - Optional message
   */
  protected sendError(
    response: Response,
    error: string,
    statusCode: number = 500,
    message?: string
  ): Response {
    return sendError(response, error, statusCode, message);
  }

  /**
   * Send a not found response
   * @param response - Express response object
   * @param message - Optional message
   */
  protected sendNotFound(
    response: Response,
    message?: string
  ): Response {
    return sendNotFound(response, message);
  }

  /**
   * Send a bad request response
   * @param response - Express response object
   * @param message - Optional message
   */
  protected sendBadRequest(
    response: Response,
    message?: string
  ): Response {
    return sendBadRequest(response, message);
  }

  /**
   * Send an unauthorized response
   * @param response - Express response object
   * @param message - Optional message
   */
  protected sendUnauthorized(
    response: Response,
    message?: string
  ): Response {
    return sendUnauthorized(response, message);
  }

  /**
   * Send a forbidden response
   * @param response - Express response object
   * @param message - Optional message
   */
  protected sendForbidden(
    response: Response,
    message?: string
  ): Response {
    return sendForbidden(response, message);
  }

  /**
   * Throw an authentication error
   * @param message - Optional error message
   */
  protected throwAuthenticationError(message?: string): never {
    throw new AuthenticationError(message);
  }

  /**
   * Throw an authorization error
   * @param message - Optional error message
   */
  protected throwAuthorizationError(message?: string): never {
    throw new AuthorizationError(message);
  }

  /**
   * Throw a not found error
   * @param message - Optional error message
   */
  protected throwNotFoundError(message?: string): never {
    throw new NotFoundError(message);
  }

  /**
   * Throw a validation error
   * @param message - Optional error message
   */
  protected throwValidationError(message?: string): never {
    throw new ValidationError(message);
  }

  /**
   * Throw a bad request error
   * @param message - Optional error message
   */
  protected throwBadRequestError(message?: string): never {
    throw new BadRequestError(message);
  }

  /**
   * Throw a conflict error
   * @param message - Optional error message
   */
  protected throwConflictError(message?: string): never {
    throw new ConflictError(message);
  }

  /**
   * Throw an internal server error
   * @param message - Optional error message
   */
  protected throwInternalServerError(message?: string): never {
    throw new InternalServerError(message);
  }

  /**
   * Get the authenticated user from the request
   * @param request - Express request object
   * @returns User object or null if not authenticated
   */
  protected getAuthenticatedUser(request: Request): { id: string; email: string; role: string } | null {
    return (request as any).user || null;
  }

  /**
   * Check if the authenticated user has a specific role
   * @param request - Express request object
   * @param role - Role to check
   * @returns True if user has the role, false otherwise
   */
  protected hasRole(request: Request, role: string): boolean {
    const user = this.getAuthenticatedUser(request);
    return user ? user.role === role : false;
  }

  /**
   * Check if the authenticated user has any of the specified roles
   * @param request - Express request object
   * @param roles - Array of roles to check
   * @returns True if user has any of the roles, false otherwise
   */
  protected hasAnyRole(request: Request, roles: string[]): boolean {
    const user = this.getAuthenticatedUser(request);
    return user ? roles.includes(user.role) : false;
  }
}