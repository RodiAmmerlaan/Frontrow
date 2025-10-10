import { Request, Response } from "express";
import { AuthService } from "../../services/auth.service";
import { clearRefreshCookie, getRefreshCookie } from "./cookie";
import { sendSuccess } from "../../utils/response.util";
import Logger from "../../utils/logger";

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
export async function logoutController(request: Request, response: Response) {
    const correlationId = (request as any).correlationId || 'N/A';
    Logger.debug(`[${correlationId}] Logout controller called`);
    
    try {
        const raw = getRefreshCookie(request);
        
        if (raw) {
            await AuthService.logoutUser(raw);
        }
        
        clearRefreshCookie(response);
        Logger.info(`[${correlationId}] User logged out successfully`);
        return sendSuccess(response, { message: 'Logged out successfully' });
    } catch (error) {
        Logger.error(`[${correlationId}] Error in logoutController:`, error);

        clearRefreshCookie(response);
        return sendSuccess(response, { message: 'Logged out successfully' });
    }
};