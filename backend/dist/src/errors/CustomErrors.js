"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.RateLimitError = exports.ConflictError = exports.BadRequestError = exports.ValidationError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.CustomError = void 0;
class CustomError extends Error {
    constructor(statusCode, errorCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = isOperational;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomError = CustomError;
class AuthenticationError extends CustomError {
    constructor(message = 'Authentication failed') {
        super(401, 'AUTHENTICATION_ERROR', message);
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends CustomError {
    constructor(message = 'Access denied') {
        super(403, 'AUTHORIZATION_ERROR', message);
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends CustomError {
    constructor(message = 'Resource not found') {
        super(404, 'NOT_FOUND_ERROR', message);
    }
}
exports.NotFoundError = NotFoundError;
class ValidationError extends CustomError {
    constructor(message = 'Validation failed') {
        super(400, 'VALIDATION_ERROR', message);
    }
}
exports.ValidationError = ValidationError;
class BadRequestError extends CustomError {
    constructor(message = 'Bad request') {
        super(400, 'BAD_REQUEST_ERROR', message);
    }
}
exports.BadRequestError = BadRequestError;
class ConflictError extends CustomError {
    constructor(message = 'Resource conflict') {
        super(409, 'CONFLICT_ERROR', message);
    }
}
exports.ConflictError = ConflictError;
class RateLimitError extends CustomError {
    constructor(message = 'Rate limit exceeded') {
        super(429, 'RATE_LIMIT_ERROR', message);
    }
}
exports.RateLimitError = RateLimitError;
class InternalServerError extends CustomError {
    constructor(message = 'Internal server error') {
        super(500, 'INTERNAL_SERVER_ERROR', message, false);
    }
}
exports.InternalServerError = InternalServerError;
//# sourceMappingURL=CustomErrors.js.map