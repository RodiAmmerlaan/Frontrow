"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
exports.sendNotFound = sendNotFound;
exports.sendBadRequest = sendBadRequest;
exports.sendUnauthorized = sendUnauthorized;
exports.sendForbidden = sendForbidden;
function sendSuccess(response, data, message, statusCode = 200) {
    return response.status(statusCode).json({
        success: true,
        data,
        message
    });
}
function sendError(response, error, statusCode = 500, message) {
    return response.status(statusCode).json({
        success: false,
        error,
        message
    });
}
function sendNotFound(response, message = 'Resource not found') {
    return sendError(response, 'NOT_FOUND', 404, message);
}
function sendBadRequest(response, message = 'Bad request') {
    return sendError(response, 'BAD_REQUEST', 400, message);
}
function sendUnauthorized(response, message = 'Unauthorized') {
    return sendError(response, 'UNAUTHORIZED', 401, message);
}
function sendForbidden(response, message = 'Forbidden') {
    return sendError(response, 'FORBIDDEN', 403, message);
}
//# sourceMappingURL=response.util.js.map