"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const CustomErrors_1 = require("../errors/CustomErrors");
const response_util_1 = require("../utils/response.util");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Global error handling middleware
 * Catches all errors and sends standardized responses
 * @param error - The error object
 * @param request - Express request object
 * @param response - Express response object
 * @param next - Express next function
 */
function errorHandler(error, request, response, next) {
    if (!(error instanceof CustomErrors_1.CustomError) || !error.isOperational) {
        logger_1.default.error('Unexpected error:', error);
    }
    if (error instanceof CustomErrors_1.CustomError) {
        logger_1.default.warn(`Custom error: ${error.errorCode} - ${error.message}`);
        return (0, response_util_1.sendError)(response, error.errorCode, error.statusCode, error.message);
    }
    if (error.name === 'ValidationError') {
        logger_1.default.warn(`Validation error: ${error.message}`);
        return (0, response_util_1.sendError)(response, 'VALIDATION_ERROR', 400, error.message);
    }
    if (error.name === 'SyntaxError' && error.status === 400) {
        logger_1.default.warn(`Syntax error: ${error.message}`);
        return (0, response_util_1.sendError)(response, 'SYNTAX_ERROR', 400, 'Invalid JSON syntax');
    }
    if (error.name === 'MongoError' && error.code === 11000) {
        logger_1.default.warn(`Duplicate key error: ${error.message}`);
        return (0, response_util_1.sendError)(response, 'DUPLICATE_KEY_ERROR', 409, 'Duplicate key error');
    }
    logger_1.default.error('Internal server error:', error);
    return (0, response_util_1.sendError)(response, 'INTERNAL_ERROR', 500, 'An unexpected error occurred');
}
//# sourceMappingURL=errorHandler.middleware.js.map