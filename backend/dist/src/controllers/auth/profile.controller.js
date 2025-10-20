"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfileController = getProfileController;
const auth_service_1 = require("../../services/auth.service");
const token_util_1 = require("../../utils/token.util");
const response_util_1 = require("../../utils/response.util");
const logger_1 = __importDefault(require("../../utils/logger"));
const errors_1 = require("../../errors");
/**
 * Controller function to retrieve the authenticated user's profile
 * Extracts user ID from JWT token and fetches user details
 * @param request - Express request object containing JWT in authorization header
 * @param response - Express response object
 * @returns Response with user profile data or appropriate error message
 */
/**
 * @openapi
 * /auth/profile:
 *   get:
 *     summary: Retrieve authenticated user's profile
 *     description: Fetches the profile details of the currently authenticated user using JWT token
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 */
async function getProfileController(request, response) {
    const correlationId = request.correlationId || 'N/A';
    logger_1.default.debug(`[${correlationId}] Get profile controller called`);
    try {
        const tokenResult = (0, token_util_1.extractAndVerifyToken)(request);
        if (!tokenResult.success) {
            logger_1.default.warn(`[${correlationId}] Unauthorized access attempt`, { error: tokenResult.error });
            return (0, response_util_1.sendUnauthorized)(response, tokenResult.error);
        }
        const { decoded } = tokenResult;
        const userProfile = await auth_service_1.AuthService.getUserProfile(decoded.sub);
        logger_1.default.info(`[${correlationId}] User profile retrieved successfully`, { userId: decoded.sub });
        return (0, response_util_1.sendSuccess)(response, userProfile);
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError) {
            logger_1.default.warn(`[${correlationId}] User not found`, { error: error.message });
            return (0, response_util_1.sendNotFound)(response, error.message);
        }
        logger_1.default.error(`[${correlationId}] Error in getProfileController:`, error);
        return (0, response_util_1.sendError)(response, "Failed to retrieve user profile. Please try again later.", 500);
    }
}
//# sourceMappingURL=profile.controller.js.map