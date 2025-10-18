import { Request, Response } from 'express';
import { setRefreshCookie } from './cookie';
import { BaseController } from '../BaseController';
import { AuthService } from '../../services/auth.service';
import Logger from '../../utils/logger';
import { ValidationError, AuthenticationError } from '../../errors';

export class LoginController extends BaseController {
    /**
     * Controller function to handle user login
     * Authenticates user credentials and issues JWT tokens
     * @param request - Express request object containing email and password in body
     * @param response - Express response object
     * @returns Response with access token and refresh cookie, or unauthorized error
     */
    
    /**
     * @openapi
     * /auth/login:
     *   post:
     *     summary: User login
     *     description: Authenticates user credentials and issues JWT tokens
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
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *               password:
     *                 type: string
     *                 format: password
     *     responses:
     *       200:
     *         description: Successful login
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
     *       401:
     *         description: Unauthorized - invalid credentials
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
    public async login(
        request: Request,
        response: Response,
    ) {
        const correlationId = (request as any).correlationId || 'N/A';
        const { email, password } = request.validated?.body || request.body;
        Logger.debug(`[${correlationId}] Login controller called`, { email });
        
        try {
            const authResult = await AuthService.authenticateUser(email, password);
            
            setRefreshCookie(response, authResult.refreshToken, 30);
            Logger.info(`[${correlationId}] User logged in successfully`, { email });
            return this.sendSuccess(response, { access_token: authResult.accessToken });
        } catch (error) {
            if (error instanceof ValidationError) {
                Logger.warn(`[${correlationId}] Login validation error`, { email, error: error.message });
                this.throwBadRequestError(error.message);
            }
            if (error instanceof AuthenticationError) {
                Logger.warn(`[${correlationId}] Authentication failed`, { email });
                this.throwAuthenticationError(error.message);
            }
            Logger.error(`[${correlationId}] Login error:`, error);
            throw error;
        }
    }
}

export const loginController = new LoginController();
export const login = loginController.login.bind(loginController);