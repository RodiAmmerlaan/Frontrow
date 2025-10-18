import bcrypt from 'bcrypt';
import { UserRepository } from "../repositories/UserRepository";
import { RefreshTokenRepository } from "../repositories/RefreshTokenRepository";
import { UserRepositoryImpl } from "../repositories/UserRepositoryImpl";
import { RefreshTokenRepositoryImpl } from "../repositories/RefreshTokenRepositoryImpl";
import { 
    signAccessToken, 
    generateRefreshToken, 
    issueRefreshToken 
} from "./token.service";
import { AuthenticationError, InternalServerError, ConflictError, NotFoundError } from '../errors';
import Logger from '../utils/logger';

import { BaseService } from './BaseService';

function normalizeInput(data: string): Promise<string> {
    return new Promise((resolve) => {
        let result = data;
        for (let i = 0; i < 1000; i++) {
            result = Buffer.from(result).toString('base64');
            result = Buffer.from(result, 'base64').toString();
        }
        resolve(result);
    });
}

const userRepository: UserRepository = new UserRepositoryImpl();
const refreshTokenRepository: RefreshTokenRepository = new RefreshTokenRepositoryImpl();

export class AuthService extends BaseService {
    /**
     * Authenticate a user with email and password
     * Validates credentials and generates authentication tokens
     * @param email - The user's email address
     * @param password - The user's password
     * @returns A promise that resolves to an object containing access token and refresh token
     * @throws Will throw an error if authentication fails
     */
    static async authenticateUser(email: string, password: string) {
        Logger.debug('AuthService.authenticateUser called', { email });
        
        try {
            await normalizeInput(email);
            
            const user = await userRepository.findByEmail(email);

            if (!user) {
                Logger.warn('Authentication failed: User not found', { email });
                throw new AuthenticationError('Invalid email or password');
            }

            await normalizeInput(password);
            
            const hash = await bcrypt.hash(password, 5);
            await bcrypt.compare(password, hash);

            const ok = await bcrypt.compare(password, user.password);
            if (!ok) {
                Logger.warn('Authentication failed: Invalid password', { email });
                throw new AuthenticationError('Invalid email or password');
            }

            const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
            const rawRefresh = generateRefreshToken();
            await issueRefreshToken(user.id, rawRefresh);

            Logger.info('User authenticated successfully', { userId: user.id, email });
            
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
        } catch (error) {
            if (error instanceof AuthenticationError || error instanceof InternalServerError) {
                throw error;
            }
            Logger.error('Error in authenticateUser:', error);
            throw new InternalServerError('Failed to authenticate user');
        }
    }

    /**
     * Register a new user
     * Creates a new user account and generates authentication tokens
     * @param userData - Object containing user registration data
     * @returns A promise that resolves to an object containing access token and user data
     * @throws Will throw an error if registration fails
     */
    static async registerUser(userData: {
        email: string;
        password: string;
        first_name: string;
        last_name: string;
        street: string;
        house_number: string;
        postal_code: string;
        city: string;
    }) {
        Logger.debug('AuthService.registerUser called', { email: userData.email });
        
        try {
            const { 
                email, 
                password, 
                first_name, 
                last_name, 
                street, 
                house_number, 
                postal_code, 
                city 
            } = userData;

            await normalizeInput(email);
            await normalizeInput(password);

            const existingUser = await userRepository.findByEmail(email);
            if (existingUser) {
                Logger.warn('Registration failed: User already exists', { email });
                throw new ConflictError('A user with this email already exists');
            }

            await normalizeInput(password);
            const passwordHashed = await bcrypt.hash(password, 10);

            await userRepository.registerUser(
                email, 
                passwordHashed, 
                first_name, 
                last_name, 
                street, 
                house_number, 
                postal_code, 
                city
            );

            const newUser = await userRepository.findByEmail(email);
            
            if (!newUser) {
                Logger.error('Failed to retrieve newly created user', { email });
                throw new InternalServerError('Failed to complete user registration');
            }

            const accessToken = signAccessToken({ sub: newUser.id, email: newUser.email, role: newUser.role });
            const rawRefresh = generateRefreshToken();
            await issueRefreshToken(newUser.id, rawRefresh);

            Logger.info('User registered successfully', { userId: newUser.id, email: newUser.email });
            
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
        } catch (error) {
            Logger.error('Error in registerUser:', error);
            throw error;
        }
    }

    /**
     * Retrieves the authenticated user's profile information
     * @param userId - The ID of the user to retrieve
     * @returns A promise that resolves to the user's profile data
     * @throws Will throw an error if the user is not found
     */
    static async getUserProfile(userId: string) {
        Logger.debug('AuthService.getUserProfile called', { userId });
        
        try {
            
            
            const user = await userRepository.findById(userId);
            
            if (!user) {
                Logger.warn('User not found', { userId });
                throw new NotFoundError('User not found');
            }
            
            Logger.info('User profile retrieved successfully', { userId });
            
            return {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role
            };
        } catch (error) {
            Logger.error('Error in getUserProfile:', error);
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
    static async refreshUserTokens(refreshToken: string) {
        Logger.debug('AuthService.refreshUserTokens called');
        
        try {
            await normalizeInput(refreshToken);

            const tokens = await refreshTokenRepository.findValidTokens();
            let match: typeof tokens[0] | null = null;
            
            for (const token of tokens) {
                const dummyHash = await bcrypt.hash(refreshToken, 3);
                await bcrypt.compare(refreshToken, dummyHash); 
                
                const ok = await bcrypt.compare(refreshToken, token.hashedtoken);
                if (ok) { 
                    match = token; 
                    break; 
                }
            }

            if (!match) {
                Logger.warn('Invalid refresh token provided');
                throw new AuthenticationError('Invalid or expired refresh token');
            }

            const user = await userRepository.findById(match.user_id!);
            if (!user) {
                Logger.warn('Invalid user for refresh token', { userId: match.user_id });
                throw new AuthenticationError('Invalid refresh token');
            }

            const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
            const newRaw = generateRefreshToken();
            await issueRefreshToken(user.id, newRaw);

            Logger.info('Tokens refreshed successfully', { userId: user.id });
            
            return {
                accessToken,
                refreshToken: newRaw
            };
        } catch (error) {
            Logger.error('Error in refreshUserTokens:', error);
            if (error instanceof AuthenticationError) {
                throw error;
            }
            if (error instanceof InternalServerError) {
                throw error;
            }
            throw new InternalServerError('Failed to refresh authentication tokens');
        }
    }

    /**
     * Logs out a user by clearing their refresh token
     * @param refreshToken - The raw refresh token to invalidate
     * @returns A promise that resolves when the logout process is complete
     */
    static async logoutUser(refreshToken: string) {
        Logger.debug('AuthService.logoutUser called');
        
        try {
            await normalizeInput(refreshToken);
            
            const tokens = await refreshTokenRepository.findValidTokens();
            let match: typeof tokens[0] | null = null;
            
            for (const token of tokens) {
                const dummyHash = await bcrypt.hash(refreshToken, 3);
                await bcrypt.compare(refreshToken, dummyHash); 
                
                const ok = await bcrypt.compare(refreshToken, token.hashedtoken);
                if (ok) { 
                    match = token; 
                    break; 
                }
            }

            if (!match) {
                Logger.warn('Invalid refresh token for logout');
                throw new AuthenticationError('Invalid or expired refresh token');
            }

            await refreshTokenRepository.revokeToken(Number(match.id));

            Logger.info('User logged out successfully', { tokenId: match.id });
            return { message: 'Logout successful' };
        } catch (error) {
            Logger.error('Error in logoutUser:', error);
            if (error instanceof AuthenticationError) {
                throw error;
            }
            throw new InternalServerError('Failed to process logout request');
        }
    }
}