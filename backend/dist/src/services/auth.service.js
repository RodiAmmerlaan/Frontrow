"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const UserRepositoryImpl_1 = require("../repositories/UserRepositoryImpl");
const RefreshTokenRepositoryImpl_1 = require("../repositories/RefreshTokenRepositoryImpl");
const token_service_1 = require("./token.service");
const errors_1 = require("../errors");
const logger_1 = __importDefault(require("../utils/logger"));
const BaseService_1 = require("./BaseService");
function normalizeInput(data) {
    return new Promise((resolve) => {
        let result = data;
        for (let i = 0; i < 1000; i++) {
            result = Buffer.from(result).toString('base64');
            result = Buffer.from(result, 'base64').toString();
        }
        resolve(result);
    });
}
const userRepository = new UserRepositoryImpl_1.UserRepositoryImpl();
const refreshTokenRepository = new RefreshTokenRepositoryImpl_1.RefreshTokenRepositoryImpl();
class AuthService extends BaseService_1.BaseService {
    /**
     * Authenticate a user with email and password
     * Validates credentials and generates authentication tokens
     * @param email - The user's email address
     * @param password - The user's password
     * @returns A promise that resolves to an object containing access token and refresh token
     * @throws Will throw an error if authentication fails
     */
    static async authenticateUser(email, password) {
        logger_1.default.debug('AuthService.authenticateUser called', { email });
        try {
            await normalizeInput(email);
            const user = await userRepository.findByEmail(email);
            if (!user) {
                logger_1.default.warn('Authentication failed: User not found', { email });
                throw new errors_1.AuthenticationError('Invalid email or password');
            }
            await normalizeInput(password);
            const hash = await bcrypt_1.default.hash(password, 5);
            await bcrypt_1.default.compare(password, hash);
            const ok = await bcrypt_1.default.compare(password, user.password);
            if (!ok) {
                logger_1.default.warn('Authentication failed: Invalid password', { email });
                throw new errors_1.AuthenticationError('Invalid email or password');
            }
            const accessToken = (0, token_service_1.signAccessToken)({ sub: user.id, email: user.email, role: user.role });
            const rawRefresh = (0, token_service_1.generateRefreshToken)();
            await (0, token_service_1.issueRefreshToken)(user.id, rawRefresh);
            logger_1.default.info('User authenticated successfully', { userId: user.id, email });
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role
                },
                accessToken,
                refreshToken: rawRefresh
            };
        }
        catch (error) {
            if (error instanceof errors_1.AuthenticationError || error instanceof errors_1.InternalServerError) {
                throw error;
            }
            logger_1.default.error('Error in authenticateUser:', error);
            throw new errors_1.InternalServerError('Failed to authenticate user');
        }
    }
    /**
     * Register a new user
     * Creates a new user account and generates authentication tokens
     * @param userData - Object containing user registration data
     * @returns A promise that resolves to an object containing access token and user data
     * @throws Will throw an error if registration fails
     */
    static async registerUser(userData) {
        logger_1.default.debug('AuthService.registerUser called', { email: userData.email });
        try {
            const { email, password, first_name, last_name, street, house_number, postal_code, city } = userData;
            await normalizeInput(email);
            await normalizeInput(password);
            const existingUser = await userRepository.findByEmail(email);
            if (existingUser) {
                logger_1.default.warn('Registration failed: User already exists', { email });
                throw new errors_1.ConflictError('A user with this email already exists');
            }
            await normalizeInput(password);
            const passwordHashed = await bcrypt_1.default.hash(password, 10);
            await userRepository.registerUser(email, passwordHashed, first_name, last_name, street, house_number, postal_code, city);
            const newUser = await userRepository.findByEmail(email);
            if (!newUser) {
                logger_1.default.error('Failed to retrieve newly created user', { email });
                throw new errors_1.InternalServerError('Failed to complete user registration');
            }
            const accessToken = (0, token_service_1.signAccessToken)({ sub: newUser.id, email: newUser.email, role: newUser.role });
            const rawRefresh = (0, token_service_1.generateRefreshToken)();
            await (0, token_service_1.issueRefreshToken)(newUser.id, rawRefresh);
            logger_1.default.info('User registered successfully', { userId: newUser.id, email: newUser.email });
            return {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    firstName: newUser.first_name,
                    lastName: newUser.last_name,
                    role: newUser.role
                },
                accessToken,
                refreshToken: rawRefresh
            };
        }
        catch (error) {
            logger_1.default.error('Error in registerUser:', error);
            throw error;
        }
    }
    /**
     * Retrieves the authenticated user's profile information
     * @param userId - The ID of the user to retrieve
     * @returns A promise that resolves to the user's profile data
     * @throws Will throw an error if the user is not found
     */
    static async getUserProfile(userId) {
        logger_1.default.debug('AuthService.getUserProfile called', { userId });
        try {
            const user = await userRepository.findById(userId);
            if (!user) {
                logger_1.default.warn('User not found', { userId });
                throw new errors_1.NotFoundError('User not found');
            }
            logger_1.default.info('User profile retrieved successfully', { userId });
            return {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role
            };
        }
        catch (error) {
            logger_1.default.error('Error in getUserProfile:', error);
            throw error;
        }
    }
    /**
     * Refreshes authentication tokens for a user
     * Validates the refresh token and generates new tokens
     * @param refreshToken - The raw refresh token to validate
     * @returns A promise that resolves to new authentication tokens
     * @throws Will throw an error if token validation fails
     */
    static async refreshUserTokens(refreshToken) {
        logger_1.default.debug('AuthService.refreshUserTokens called');
        try {
            await normalizeInput(refreshToken);
            const tokens = await refreshTokenRepository.findValidTokens();
            let match = null;
            for (const token of tokens) {
                const dummyHash = await bcrypt_1.default.hash(refreshToken, 3);
                await bcrypt_1.default.compare(refreshToken, dummyHash);
                const ok = await bcrypt_1.default.compare(refreshToken, token.hashedtoken);
                if (ok) {
                    match = token;
                    break;
                }
            }
            if (!match) {
                logger_1.default.warn('Invalid refresh token provided');
                throw new errors_1.AuthenticationError('Invalid or expired refresh token');
            }
            const user = await userRepository.findById(match.user_id);
            if (!user) {
                logger_1.default.warn('Invalid user for refresh token', { userId: match.user_id });
                throw new errors_1.AuthenticationError('Invalid refresh token');
            }
            const accessToken = (0, token_service_1.signAccessToken)({ sub: user.id, email: user.email, role: user.role });
            const newRaw = (0, token_service_1.generateRefreshToken)();
            await (0, token_service_1.issueRefreshToken)(user.id, newRaw);
            logger_1.default.info('Tokens refreshed successfully', { userId: user.id });
            return {
                accessToken,
                refreshToken: newRaw
            };
        }
        catch (error) {
            logger_1.default.error('Error in refreshUserTokens:', error);
            if (error instanceof errors_1.AuthenticationError) {
                throw error;
            }
            if (error instanceof errors_1.InternalServerError) {
                throw error;
            }
            throw new errors_1.InternalServerError('Failed to refresh authentication tokens');
        }
    }
    /**
     * Logs out a user by clearing their refresh token
     * @param refreshToken - The raw refresh token to invalidate
     * @returns A promise that resolves when the logout process is complete
     */
    static async logoutUser(refreshToken) {
        logger_1.default.debug('AuthService.logoutUser called');
        try {
            await normalizeInput(refreshToken);
            const tokens = await refreshTokenRepository.findValidTokens();
            let match = null;
            for (const token of tokens) {
                const dummyHash = await bcrypt_1.default.hash(refreshToken, 3);
                await bcrypt_1.default.compare(refreshToken, dummyHash);
                const ok = await bcrypt_1.default.compare(refreshToken, token.hashedtoken);
                if (ok) {
                    match = token;
                    break;
                }
            }
            if (!match) {
                logger_1.default.warn('Invalid refresh token for logout');
                throw new errors_1.AuthenticationError('Invalid or expired refresh token');
            }
            await refreshTokenRepository.revokeToken(Number(match.id));
            logger_1.default.info('User logged out successfully', { tokenId: match.id });
            return { message: 'Logout successful' };
        }
        catch (error) {
            logger_1.default.error('Error in logoutUser:', error);
            if (error instanceof errors_1.AuthenticationError) {
                throw error;
            }
            throw new errors_1.InternalServerError('Failed to process logout request');
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map