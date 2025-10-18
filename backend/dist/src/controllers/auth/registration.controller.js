"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrationController = registrationController;
const cookie_1 = require("./cookie");
const response_util_1 = require("../../utils/response.util");
const auth_service_1 = require("../../services/auth.service");
const logger_1 = __importDefault(require("../../utils/logger"));
const errors_1 = require("../../errors");
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
async function registrationController(request, response) {
    const correlationId = request.correlationId || 'N/A';
    logger_1.default.debug(`[${correlationId}] Registration controller called`, {
        email: request.body.email
    });
    try {
        const { email, password, first_name, last_name, street, house_number, postal_code, city } = request.body;
        const authResult = await auth_service_1.AuthService.registerUser({
            email,
            password,
            first_name,
            last_name,
            street,
            house_number,
            postal_code,
            city
        });
        logger_1.default.info(`[${correlationId}] User registered successfully`, { email });
        (0, cookie_1.setRefreshCookie)(response, authResult.refreshToken, 30);
        return (0, response_util_1.sendSuccess)(response, { access_token: authResult.accessToken }, undefined, 201);
    }
    catch (error) {
        logger_1.default.error(`[${correlationId}] Registration error:`, error);
        if (error instanceof errors_1.ConflictError) {
            return (0, response_util_1.sendBadRequest)(response, error.message);
        }
        if (error instanceof errors_1.ValidationError) {
            return (0, response_util_1.sendBadRequest)(response, error.message);
        }
        return (0, response_util_1.sendBadRequest)(response, 'Failed to register user. Please try again later.');
    }
}
//# sourceMappingURL=registration.controller.js.map