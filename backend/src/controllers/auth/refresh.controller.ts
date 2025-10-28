import { Request, Response } from 'express';
import { AuthService } from '../../services/auth.service';
import { getRefreshCookie, setRefreshCookie } from './cookie';
import { sendUnauthorized, sendSuccess } from '../../utils/response.util';
import Logger from '../../utils/logger';
import { AuthenticationError } from '../../errors';

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh authentication tokens
 *     description: Refreshes the access token using the refresh token stored in cookies
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Successful token refresh
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
 *                     access_token:
 *                       type: string
 *         headers:
 *           Set-Cookie:
 *             description: Refresh token cookie
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized - invalid or missing refresh token
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
export async function refreshController(
    request: Request,
    response: Response
) {
    const correlationId = (request as any).correlationId || 'N/A';
    Logger.debug(`[${correlationId}] Refresh controller called`);
    
    try {
        const raw = getRefreshCookie(request);
        if(!raw) {
            Logger.warn(`[${correlationId}] Missing refresh cookie`);
            return sendUnauthorized(response, 'Missing refresh Cookie');
        }

        const tokens = await AuthService.refreshUserTokens(raw);

        setRefreshCookie(response, tokens.refreshToken, 30);
        Logger.info(`[${correlationId}] Tokens refreshed successfully`);
        return sendSuccess(response, { access_token: tokens.accessToken });
    } catch (error) {
        if (error instanceof AuthenticationError) {
            Logger.warn(`[${correlationId}] Token refresh failed`, { error: error.message });
            return sendUnauthorized(response, error.message);
        }
        
        Logger.error(`[${correlationId}] Error in refreshController:`, error);
        return sendUnauthorized(response, 'Failed to refresh authentication tokens. Please try again later.');
    }
}