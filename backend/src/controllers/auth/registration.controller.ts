import { Request, Response } from 'express';
import { setRefreshCookie } from './cookie';
import { sendBadRequest, sendSuccess } from '../../utils/response.util';
import { AuthService } from '../../services/auth.service';
import Logger from '../../utils/logger';
import { ConflictError, ValidationError, InternalServerError } from '../../errors';

/**
 * Controller function to handle user registration
 * Creates a new user account and issues authentication tokens
 * @param request - Express request object containing user registration data in body
 * @param response - Express response object
 * @returns Response with access token and refresh cookie, or error message
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: User registration
 *     description: Creates a new user account and issues authentication tokens
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *               - street
 *               - house_number
 *               - postal_code
 *               - city
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               street:
 *                 type: string
 *               house_number:
 *                 type: string
 *               postal_code:
 *                 type: string
 *               city:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successful registration
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
 *       400:
 *         description: Bad request - validation error
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
 *       409:
 *         description: Conflict - user already exists
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
export async function registrationController(
    request: Request,
    response: Response
) {
    const correlationId = (request as any).correlationId || 'N/A';
    Logger.debug(`[${correlationId}] Registration controller called`, { 
        email: request.body.email 
    });
    
    try {
        const { email, password, first_name, last_name, street, house_number, postal_code, city } = request.body;
        
        const authResult = await AuthService.registerUser({
            email,
            password,
            first_name,
            last_name,
            street,
            house_number,
            postal_code,
            city
        });

        Logger.info(`[${correlationId}] User registered successfully`, { email });
        setRefreshCookie(response, authResult.refreshToken, 30);
        return sendSuccess(response, { access_token: authResult.accessToken }, undefined, 201);
    } catch (error: any) {
        Logger.error(`[${correlationId}] Registration error:`, error);
        if (error instanceof ConflictError) {
            return sendBadRequest(response, error.message);
        }
        if (error instanceof ValidationError) {
            return sendBadRequest(response, error.message);
        }
        return sendBadRequest(response, 'Failed to register user. Please try again later.');
    }
}