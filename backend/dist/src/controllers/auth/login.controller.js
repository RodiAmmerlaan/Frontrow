"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.loginController = exports.LoginController = void 0;
const cookie_1 = require("./cookie");
const BaseController_1 = require("../BaseController");
const auth_service_1 = require("../../services/auth.service");
const logger_1 = __importDefault(require("../../utils/logger"));
const errors_1 = require("../../errors");
class LoginController extends BaseController_1.BaseController {
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
    async login(request, response) {
        const correlationId = request.correlationId || 'N/A';
        const { email, password } = request.body;
        logger_1.default.debug(`[${correlationId}] Login controller called`, { email });
        try {
            const authResult = await auth_service_1.AuthService.authenticateUser(email, password);
            (0, cookie_1.setRefreshCookie)(response, authResult.refreshToken, 30);
            logger_1.default.info(`[${correlationId}] User logged in successfully`, { email });
            return this.sendSuccess(response, { access_token: authResult.accessToken });
        }
        catch (error) {
            if (error instanceof errors_1.ValidationError) {
                logger_1.default.warn(`[${correlationId}] Login validation error`, { email, error: error.message });
                this.throwBadRequestError(error.message);
            }
            if (error instanceof errors_1.AuthenticationError) {
                logger_1.default.warn(`[${correlationId}] Authentication failed`, { email });
                this.throwAuthenticationError(error.message);
            }
            logger_1.default.error(`[${correlationId}] Login error:`, error);
            throw error;
        }
    }
}
exports.LoginController = LoginController;
exports.loginController = new LoginController();
exports.login = exports.loginController.login.bind(exports.loginController);
//# sourceMappingURL=login.controller.js.map