import * as bcrypt from 'bcrypt';
import * as tokenService from '../../src/services/token.service';

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
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-token');

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
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

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