"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractAndVerifyToken = extractAndVerifyToken;
const token_service_1 = require("../services/token.service");
/**
 * Extracts and verifies JWT token from request authorization header
 * @param request - Express request object
 * @returns The decoded JWT payload or null if token is missing/invalid
 */
function extractAndVerifyToken(request) {
    try {
        const jwt = request.headers.authorization?.split(" ")[1]?.trim();
        if (!jwt) {
            return { success: false, error: "No token provided" };
        }
        const decoded = (0, token_service_1.verifyAccessToken)(jwt);
        return { success: true, decoded };
    }
    catch (error) {
        return { success: false, error: "Invalid or expired token" };
    }
}
//# sourceMappingURL=token.util.js.map