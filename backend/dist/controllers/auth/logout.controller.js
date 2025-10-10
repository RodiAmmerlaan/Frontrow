"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutController = logoutController;
const auth_service_1 = require("../../services/auth.service");
const cookie_1 = require("./cookie");
const response_util_1 = require("../../utils/response.util");
const logger_1 = __importDefault(require("../../utils/logger"));
/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logs out the current user by clearing their refresh token cookie
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful logout
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *         headers:
 *           Set-Cookie:
 *             description: Clear refresh token cookie
 *             schema:
 *               type: string
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
async function logoutController(request, response) {
    const correlationId = request.correlationId || 'N/A';
    logger_1.default.debug(`[${correlationId}] Logout controller called`);
    try {
        const raw = (0, cookie_1.getRefreshCookie)(request);
        if (raw) {
            await auth_service_1.AuthService.logoutUser(raw);
        }
        (0, cookie_1.clearRefreshCookie)(response);
        logger_1.default.info(`[${correlationId}] User logged out successfully`);
        return (0, response_util_1.sendSuccess)(response, { message: 'Logged out successfully' });
    }
    catch (error) {
        logger_1.default.error(`[${correlationId}] Error in logoutController:`, error);
        (0, cookie_1.clearRefreshCookie)(response);
        return (0, response_util_1.sendSuccess)(response, { message: 'Logged out successfully' });
    }
}
;
//# sourceMappingURL=logout.controller.js.map