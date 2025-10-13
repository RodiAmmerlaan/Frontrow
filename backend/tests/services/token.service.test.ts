import * as tokenService from '../../src/services/token.service';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

jest.mock('jsonwebtoken');
jest.mock('bcrypt');
jest.mock('crypto');
jest.mock('@prisma/client', () => {
  const mockRefreshToken = {
    create: jest.fn(),
    findMany: jest.fn()
  };
  
  return {
    PrismaClient: jest.fn(() => ({
      refreshToken: mockRefreshToken
    }))
  };
});

jest.mock('../../src/config', () => ({
  JWT_CONFIG: {
    ACCESS_SECRET: 'test-secret',
    REFRESH_TTL_DAYS: 30
  }
}));

describe('Token Service', () => {
  const mockJwtPayload = {
    sub: 'user-123',
    email: 'test@example.com',
    role: 'USER'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signAccessToken', () => {
    it('should sign a JWT access token with the provided payload', () => {
      (jwt.sign as jest.Mock).mockReturnValue('signed-token');

      const result = tokenService.signAccessToken(mockJwtPayload);

      expect(jwt.sign).toHaveBeenCalledWith(mockJwtPayload, 'test-secret');
      expect(result).toBe('signed-token');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a JWT access token and return the decoded payload', () => {
      const decodedPayload = { ...mockJwtPayload, iat: 1234567890, exp: 1234571490 };
      (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);

      const result = tokenService.verifyAccessToken('valid-token');

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(result).toEqual(decodedPayload);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a cryptographically secure random refresh token', () => {
      const mockRandomBytes = Buffer.from('72616e646f6d686578737472696e67', 'hex'); // 'randomhexstring' in hex
      (crypto.randomBytes as jest.Mock).mockImplementation(() => mockRandomBytes);

      const result = tokenService.generateRefreshToken();

      expect(crypto.randomBytes).toHaveBeenCalledWith(48);
      expect(result).toBe('72616e646f6d686578737472696e67');
    });
  });

  describe('issueRefreshToken', () => {
    it('should create a new refresh token record in the database', async () => {
      const mockTokenRecord = {
        id: 1n,
        user_id: 'user-123',
        hashedtoken: 'hashed-token',
        createdat: new Date(),
        expiresat: new Date(),
        revokedat: null
      };
      
      const { PrismaClient } = require('@prisma/client');
      const mockPrismaClient = new PrismaClient();
      mockPrismaClient.refreshToken.create.mockResolvedValue(mockTokenRecord);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-token');

      const result = await tokenService.issueRefreshToken('user-123', 'raw-token');

      expect(bcrypt.hash).toHaveBeenCalledWith('raw-token', 10);
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
      
      const { PrismaClient } = require('@prisma/client');
      const mockPrismaClient = new PrismaClient();
      mockPrismaClient.refreshToken.findMany.mockResolvedValue(mockTokens);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await tokenService.validateRefreshtoken('user-123', 'raw-token');

      expect(mockPrismaClient.refreshToken.findMany).toHaveBeenCalledWith({
        where: {
          user_id: 'user-123',
          revokedat: null,
          expiresat: { gt: expect.any(Date) }
        }
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('raw-token', 'hashed-token-1');
      expect(result).toEqual(mockTokens[0]);
    });

    it('should return null when no valid tokens are found', async () => {
      const { PrismaClient } = require('@prisma/client');
      const mockPrismaClient = new PrismaClient();
      mockPrismaClient.refreshToken.findMany.mockResolvedValue([]);
      
      const result = await tokenService.validateRefreshtoken('user-123', 'raw-token');

      expect(result).toBeNull();
    });
  });
});