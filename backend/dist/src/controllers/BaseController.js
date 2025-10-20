"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
const response_util_1 = require("../utils/response.util");
const errors_1 = require("../errors");
class BaseController {
    /**
     * Send a successful response
     * @param response - Express response object
     * @param data - Data to send in the response
     * @param message - Optional message
     * @param statusCode - HTTP status code (default: 200)
     */
    sendSuccess(response, data, message, statusCode = 200) {
        return (0, response_util_1.sendSuccess)(response, data, message, statusCode);
    }
    /**
     * Send an error response
     * @param response - Express response object
     * @param error - Error identifier
     * @param statusCode - HTTP status code (default: 500)
     * @param message - Optional message
     */
    sendError(response, error, statusCode = 500, message) {
        return (0, response_util_1.sendError)(response, error, statusCode, message);
    }
    /**
     * Send a not found response
     * @param response - Express response object
     * @param message - Optional message
     */
    sendNotFound(response, message) {
        return (0, response_util_1.sendNotFound)(response, message);
    }
    /**
     * Send a bad request response
     * @param response - Express response object
     * @param message - Optional message
     */
    sendBadRequest(response, message) {
        return (0, response_util_1.sendBadRequest)(response, message);
    }
    /**
     * Send an unauthorized response
     * @param response - Express response object
     * @param message - Optional message
     */
    sendUnauthorized(response, message) {
        return (0, response_util_1.sendUnauthorized)(response, message);
    }
    /**
     * Send a forbidden response
     * @param response - Express response object
     * @param message - Optional message
     */
    sendForbidden(response, message) {
        return (0, response_util_1.sendForbidden)(response, message);
    }
    /**
     * Throw an authentication error
     * @param message - Optional error message
     */
    throwAuthenticationError(message) {
        throw new errors_1.AuthenticationError(message);
    }
    /**
     * Throw an authorization error
     * @param message - Optional error message
     */
    throwAuthorizationError(message) {
        throw new errors_1.AuthorizationError(message);
    }
    /**
     * Throw a not found error
     * @param message - Optional error message
     */
    throwNotFoundError(message) {
        throw new errors_1.NotFoundError(message);
    }
    /**
     * Throw a validation error
     * @param message - Optional error message
     */
    throwValidationError(message) {
        throw new errors_1.ValidationError(message);
    }
    /**
     * Throw a bad request error
     * @param message - Optional error message
     */
    throwBadRequestError(message) {
        throw new errors_1.BadRequestError(message);
    }
    /**
     * Throw a conflict error
     * @param message - Optional error message
     */
    throwConflictError(message) {
        throw new errors_1.ConflictError(message);
    }
    /**
     * Throw an internal server error
     * @param message - Optional error message
     */
    throwInternalServerError(message) {
        throw new errors_1.InternalServerError(message);
    }
    /**
     * Get the authenticated user from the request
     * @param request - Express request object
     * @returns User object or null if not authenticated
     */
    getAuthenticatedUser(request) {
        return request.user || null;
    }
    /**
     * Check if the authenticated user has a specific role
     * @param request - Express request object
     * @param role - Role to check
     * @returns True if user has the role, false otherwise
     */
    hasRole(request, role) {
        const user = this.getAuthenticatedUser(request);
        return user ? user.role === role : false;
    }
    /**
     * Check if the authenticated user has any of the specified roles
     * @param request - Express request object
     * @param roles - Array of roles to check
     * @returns True if user has any of the roles, false otherwise
     */
    hasAnyRole(request, roles) {
        const user = this.getAuthenticatedUser(request);
        return user ? roles.includes(user.role) : false;
    }
}
exports.BaseController = BaseController;
//# sourceMappingURL=BaseController.js.map