"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.correlationIdMiddleware = correlationIdMiddleware;
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Generates a simple correlation ID using timestamp and random number
 * @returns A string representing a correlation ID
 */
function generateCorrelationId() {
    return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}
/**
 * Middleware to generate and attach a correlation ID to each request
 * This helps with tracing requests through the system for debugging purposes
 * @param request - Express request object
 * @param response - Express response object
 * @param next - Express next function
 */
function correlationIdMiddleware(request, response, next) {
    const correlationId = generateCorrelationId();
    request.correlationId = correlationId;
    response.setHeader('X-Correlation-ID', correlationId);
    logger_1.default.http(`[${correlationId}] ${request.method} ${request.path} - Request started`);
    response.on('finish', () => {
        logger_1.default.http(`[${correlationId}] ${request.method} ${request.path} - Response status: ${response.statusCode}`);
    });
    next();
}
//# sourceMappingURL=correlationId.middleware.js.map