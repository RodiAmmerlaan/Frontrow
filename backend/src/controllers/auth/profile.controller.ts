import { Request, Response } from 'express';
import { AuthService } from '../../services/auth.service';
import { extractAndVerifyToken } from '../../utils/token.util';
import { sendUnauthorized, sendNotFound, sendSuccess, sendError } from '../../utils/response.util';
import Logger from '../../utils/logger';
import { NotFoundError } from '../../errors';

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
export async function getProfileController(
    request: Request,
    response: Response
) {
    const correlationId = (request as any).correlationId || 'N/A';
    Logger.debug(`[${correlationId}] Get profile controller called`);
    
    try {
        const tokenResult = extractAndVerifyToken(request);
        
        if (!tokenResult.success) {
            Logger.warn(`[${correlationId}] Unauthorized access attempt`, { error: tokenResult.error });
            return sendUnauthorized(response, tokenResult.error);
        }
        
        const { decoded } = tokenResult;
        const userProfile = await AuthService.getUserProfile(decoded.sub);
        
        Logger.info(`[${correlationId}] User profile retrieved successfully`, { userId: decoded.sub });
        return sendSuccess(response, userProfile);
        
    } catch (error) {
        if (error instanceof NotFoundError) {
            Logger.warn(`[${correlationId}] User not found`, { error: error.message });
            return sendNotFound(response, error.message);
        }
        
        Logger.error(`[${correlationId}] Error in getProfileController:`, error);
        return sendError(response, "Failed to retrieve user profile. Please try again later.", 500);
    }
}