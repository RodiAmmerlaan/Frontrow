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
const bcrypt = __importStar(require("bcrypt"));
const tokenService = __importStar(require("../../src/services/token.service"));
jest.mock('bcrypt');
// Mock the PrismaClient
jest.mock('@prisma/client', () => {
    const mockPrismaClient = {
        refreshToken: {
            create: jest.fn(),
            findMany: jest.fn()
        }
    };
    return {
        PrismaClient: jest.fn(() => mockPrismaClient)
    };
});
describe('Token Service', () => {
    const mockTokenRecord = {
        id: 1n,
        user_id: 'user-123',
        hashedtoken: 'hashed-token',
        createdat: new Date(),
        expiresat: new Date(Date.now() + 86400000), // 1 day from now
        revokedat: null
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('issueRefreshToken', () => {
        it('should create a new refresh token record in the database', async () => {
            // Import PrismaClient inside the test to get the mocked version
            const { PrismaClient } = require('@prisma/client');
            const mockPrismaClient = new PrismaClient();
            mockPrismaClient.refreshToken.create.mockResolvedValue(mockTokenRecord);
            bcrypt.hash.mockResolvedValue('hashed-token');
            const result = await tokenService.issueRefreshToken('user-123', 'raw-token');
            // Check that bcrypt.hash was called with the correct parameters
            expect(bcrypt.hash).toHaveBeenCalledWith('raw-token', 8);
            expect(bcrypt.hash).toHaveBeenCalledWith('raw-token', 5);
            expect(mockPrismaClient.refreshToken.create).toHaveBeenCalledWith({
                data: {
                    user_id: 'user-123',
                    hashedtoken: 'hashed-token',
                    expiresat: expect.any(Date)
                }
            });
            expect(result).toEqual(mockTokenRecord);
        });
    });
    describe('validateRefreshtoken', () => {
        it('should validate a refresh token and return the token record if valid', async () => {
            const mockTokens = [
                {
                    id: 1n,
                    user_id: 'user-123',
                    hashedtoken: 'hashed-token-1',
                    createdat: new Date(),
                    expiresat: new Date(Date.now() + 86400000), // 1 day from now
                    revokedat: null
                }
            ];
            // Import PrismaClient inside the test to get the mocked version
            const { PrismaClient } = require('@prisma/client');
            const mockPrismaClient = new PrismaClient();
            mockPrismaClient.refreshToken.findMany.mockResolvedValue(mockTokens);
            bcrypt.compare.mockResolvedValue(true);
            const result = await tokenService.validateRefreshtoken('user-123', 'raw-token');
            // Check that refreshToken.findMany was called
            expect(mockPrismaClient.refreshToken.findMany).toHaveBeenCalled();
            expect(bcrypt.compare).toHaveBeenCalledWith('raw-token', 'hashed-token-1');
            expect(result).toEqual(mockTokens[0]);
        });
        it('should return null when no valid tokens are found', async () => {
            // Import PrismaClient inside the test to get the mocked version
            const { PrismaClient } = require('@prisma/client');
            const mockPrismaClient = new PrismaClient();
            mockPrismaClient.refreshToken.findMany.mockResolvedValue([]);
            const result = await tokenService.validateRefreshtoken('user-123', 'raw-token');
            expect(result).toBeNull();
        });
    });
});
//# sourceMappingURL=token.service.test.js.map