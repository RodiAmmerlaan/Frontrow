"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const tokenService = __importStar(require("../../src/services/token.service"));
const bcrypt = __importStar(require("bcrypt"));
const errors_1 = require("../../src/errors");
const testUtils_1 = require("../mocks/testUtils");
const mockUserRepository = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    registerUser: jest.fn(),
    findValidTokens: jest.fn(),
    revokeToken: jest.fn()
};
const mockRefreshTokenRepository = {
    findValidTokens: jest.fn(),
    revokeToken: jest.fn()
};
jest.mock('../../src/repositories/UserRepositoryImpl', () => {
    return {
        UserRepositoryImpl: jest.fn(() => mockUserRepository)
    };
});
jest.mock('../../src/repositories/RefreshTokenRepositoryImpl', () => {
    return {
        RefreshTokenRepositoryImpl: jest.fn(() => mockRefreshTokenRepository)
    };
});
jest.mock('../../src/services/token.service');
jest.mock('bcrypt');
jest.mock('../../src/utils/logger', () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
}));
const { AuthService } = require('../../src/services/auth.service');
describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        tokenService.signAccessToken.mockReturnValue('mock-access-token');
        tokenService.generateRefreshToken.mockReturnValue('mock-refresh-token');
        tokenService.issueRefreshToken.mockResolvedValue(testUtils_1.mockRefreshTokenRecord);
        bcrypt.compare.mockResolvedValue(true);
        bcrypt.hash.mockResolvedValue('hashed-password');
    });
    describe('authenticateUser', () => {
        it('should authenticate a user with valid credentials', async () => {
            mockUserRepository.findByEmail.mockResolvedValue(testUtils_1.mockUser);
            const result = await AuthService.authenticateUser('test@example.com', 'password123');
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', testUtils_1.mockUser.password);
            expect(tokenService.signAccessToken).toHaveBeenCalled();
            expect(tokenService.generateRefreshToken).toHaveBeenCalled();
            expect(tokenService.issueRefreshToken).toHaveBeenCalledWith(testUtils_1.mockUser.id, 'mock-refresh-token');
            expect(result).toEqual({
                user: {
                    id: testUtils_1.mockUser.id,
                    email: testUtils_1.mockUser.email,
                    firstName: testUtils_1.mockUser.first_name,
                    lastName: testUtils_1.mockUser.last_name,
                    role: testUtils_1.mockUser.role
                },
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token'
            });
        });
        it('should throw AuthenticationError when user is not found', async () => {
            mockUserRepository.findByEmail.mockResolvedValue(null);
            await expect(AuthService.authenticateUser('test@example.com', 'password123'))
                .rejects
                .toThrow(errors_1.AuthenticationError);
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
        });
        it('should throw AuthenticationError when password is invalid', async () => {
            mockUserRepository.findByEmail.mockResolvedValue(testUtils_1.mockUser);
            bcrypt.compare.mockResolvedValue(false);
            await expect(AuthService.authenticateUser('test@example.com', 'wrongpassword'))
                .rejects
                .toThrow(errors_1.AuthenticationError);
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', testUtils_1.mockUser.password);
        });
        it('should throw InternalServerError when an unexpected error occurs', async () => {
            mockUserRepository.findByEmail.mockRejectedValue(new Error('Database error'));
            await expect(AuthService.authenticateUser('test@example.com', 'password123'))
                .rejects
                .toThrow(errors_1.InternalServerError);
        });
    });
    describe('registerUser', () => {
        const userData = {
            email: 'newuser@example.com',
            password: 'password123',
            first_name: 'New',
            last_name: 'User',
            street: 'New Street',
            house_number: '456',
            postal_code: '67890',
            city: 'New City'
        };
        it('should register a new user successfully', async () => {
            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.registerUser.mockResolvedValue({
                ...testUtils_1.mockUser,
                email: userData.email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                street: userData.street,
                house_number: userData.house_number,
                postal_code: userData.postal_code,
                city: userData.city
            });
            mockUserRepository.findByEmail.mockResolvedValueOnce(null); // First call
            mockUserRepository.findByEmail.mockResolvedValueOnce({
                ...testUtils_1.mockUser,
                email: userData.email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                street: userData.street,
                house_number: userData.house_number,
                postal_code: userData.postal_code,
                city: userData.city
            });
            const result = await AuthService.registerUser(userData);
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
            expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
            expect(mockUserRepository.registerUser).toHaveBeenCalled();
            expect(tokenService.signAccessToken).toHaveBeenCalled();
            expect(tokenService.generateRefreshToken).toHaveBeenCalled();
            expect(tokenService.issueRefreshToken).toHaveBeenCalledWith(expect.any(String), 'mock-refresh-token');
            expect(result).toEqual({
                user: {
                    id: testUtils_1.mockUser.id,
                    email: userData.email,
                    firstName: userData.first_name,
                    lastName: userData.last_name,
                    role: testUtils_1.mockUser.role
                },
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token'
            });
        });
        it('should throw ConflictError when user already exists', async () => {
            mockUserRepository.findByEmail.mockResolvedValue(testUtils_1.mockUser);
            await expect(AuthService.registerUser(userData))
                .rejects
                .toThrow(errors_1.ConflictError);
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
        });
        it('should throw InternalServerError when failing to retrieve newly created user', async () => {
            mockUserRepository.findByEmail.mockResolvedValue(null); // First call
            mockUserRepository.findByEmail.mockResolvedValue(null); // Second call (after registration)
            mockUserRepository.registerUser.mockResolvedValue({});
            await expect(AuthService.registerUser(userData))
                .rejects
                .toThrow(errors_1.InternalServerError);
        });
    });
    describe('getUserProfile', () => {
        it('should return user profile when user exists', async () => {
            mockUserRepository.findById.mockResolvedValue(testUtils_1.mockUser);
            const result = await AuthService.getUserProfile('user-123');
            expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
            expect(result).toEqual({
                id: testUtils_1.mockUser.id,
                email: testUtils_1.mockUser.email,
                first_name: testUtils_1.mockUser.first_name,
                last_name: testUtils_1.mockUser.last_name,
                role: testUtils_1.mockUser.role
            });
        });
        it('should throw NotFoundError when user does not exist', async () => {
            mockUserRepository.findById.mockResolvedValue(null);
            await expect(AuthService.getUserProfile('nonexistent-user'))
                .rejects
                .toThrow(errors_1.NotFoundError);
            expect(mockUserRepository.findById).toHaveBeenCalledWith('nonexistent-user');
        });
    });
    describe('refreshUserTokens', () => {
        it('should refresh tokens when valid refresh token is provided', async () => {
            mockRefreshTokenRepository.findValidTokens.mockResolvedValue([testUtils_1.mockRefreshTokenRecord]);
            mockUserRepository.findById.mockResolvedValue(testUtils_1.mockUser);
            const result = await AuthService.refreshUserTokens('valid-refresh-token');
            expect(mockRefreshTokenRepository.findValidTokens).toHaveBeenCalled();
            expect(bcrypt.compare).toHaveBeenCalledWith('valid-refresh-token', testUtils_1.mockRefreshTokenRecord.hashedtoken);
            expect(mockUserRepository.findById).toHaveBeenCalledWith(testUtils_1.mockRefreshTokenRecord.user_id);
            expect(tokenService.signAccessToken).toHaveBeenCalled();
            expect(tokenService.generateRefreshToken).toHaveBeenCalled();
            expect(tokenService.issueRefreshToken).toHaveBeenCalledWith(testUtils_1.mockUser.id, 'mock-refresh-token');
            expect(result).toEqual({
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token'
            });
        });
        it('should throw AuthenticationError when refresh token is invalid', async () => {
            mockRefreshTokenRepository.findValidTokens.mockResolvedValue([testUtils_1.mockRefreshTokenRecord]);
            bcrypt.compare.mockResolvedValue(false);
            await expect(AuthService.refreshUserTokens('invalid-refresh-token'))
                .rejects
                .toThrow(errors_1.AuthenticationError);
        });
        it('should throw AuthenticationError when user for token is not found', async () => {
            mockRefreshTokenRepository.findValidTokens.mockResolvedValue([testUtils_1.mockRefreshTokenRecord]);
            mockUserRepository.findById.mockResolvedValue(null);
            await expect(AuthService.refreshUserTokens('valid-refresh-token'))
                .rejects
                .toThrow(errors_1.AuthenticationError);
        });
    });
    describe('logoutUser', () => {
        it('should logout user when valid refresh token is provided', async () => {
            mockRefreshTokenRepository.findValidTokens.mockResolvedValue([testUtils_1.mockRefreshTokenRecord]);
            mockRefreshTokenRepository.revokeToken.mockResolvedValue(null);
            const result = await AuthService.logoutUser('valid-refresh-token');
            expect(mockRefreshTokenRepository.findValidTokens).toHaveBeenCalled();
            expect(bcrypt.compare).toHaveBeenCalledWith('valid-refresh-token', testUtils_1.mockRefreshTokenRecord.hashedtoken);
            expect(mockRefreshTokenRepository.revokeToken).toHaveBeenCalledWith(Number(testUtils_1.mockRefreshTokenRecord.id));
            expect(result).toEqual({ message: 'Logout successful' });
        });
        it('should throw AuthenticationError when refresh token is invalid', async () => {
            mockRefreshTokenRepository.findValidTokens.mockResolvedValue([testUtils_1.mockRefreshTokenRecord]);
            bcrypt.compare.mockResolvedValue(false);
            await expect(AuthService.logoutUser('invalid-refresh-token'))
                .rejects
                .toThrow(errors_1.AuthenticationError);
        });
    });
});
//# sourceMappingURL=auth.service.test.js.map