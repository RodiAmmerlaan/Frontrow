import { RefreshTokenRepositoryImpl } from '../../src/repositories/RefreshTokenRepositoryImpl';
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient
const mockPrismaClient = {
  refreshToken: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
};

// Mock the PrismaClient constructor
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

describe('RefreshTokenRepositoryImpl', () => {
  let refreshTokenRepository: RefreshTokenRepositoryImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    refreshTokenRepository = new RefreshTokenRepositoryImpl();
  });

  const mockRefreshToken = {
    id: 1,
    user_id: 'user-123',
    hashedtoken: 'hashed-refresh-token-123',
    createdat: new Date(),
    expiresat: new Date(Date.now() + 86400000), // 24 hours from now
    revokedat: null
  };

  describe('findById', () => {
    it('should find a refresh token by ID', async () => {
      mockPrismaClient.refreshToken.findUnique.mockResolvedValue(mockRefreshToken);

      const result = await refreshTokenRepository.findById(1);

      expect(mockPrismaClient.refreshToken.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockRefreshToken);
    });

    it('should return null when refresh token is not found', async () => {
      mockPrismaClient.refreshToken.findUnique.mockResolvedValue(null);

      const result = await refreshTokenRepository.findById(999);

      expect(mockPrismaClient.refreshToken.findUnique).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all refresh tokens', async () => {
      const mockRefreshTokens = [mockRefreshToken, { ...mockRefreshToken, id: 2 }];
      mockPrismaClient.refreshToken.findMany.mockResolvedValue(mockRefreshTokens);

      const result = await refreshTokenRepository.findAll();

      expect(mockPrismaClient.refreshToken.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(mockRefreshTokens);
    });

    it('should return an empty array when no refresh tokens exist', async () => {
      mockPrismaClient.refreshToken.findMany.mockResolvedValue([]);

      const result = await refreshTokenRepository.findAll();

      expect(mockPrismaClient.refreshToken.findMany).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new refresh token', async () => {
      const refreshTokenData = {
        user_id: 'user-123',
        hashedtoken: 'hashed-refresh-token-123',
        expiresat: new Date(Date.now() + 86400000)
      };

      mockPrismaClient.refreshToken.create.mockResolvedValue(mockRefreshToken);

      const result = await refreshTokenRepository.create(refreshTokenData);

      expect(mockPrismaClient.refreshToken.create).toHaveBeenCalledWith({ data: refreshTokenData });
      expect(result).toEqual(mockRefreshToken);
    });
  });

  describe('update', () => {
    it('should update an existing refresh token', async () => {
      const updateData = { revokedat: new Date() };
      const updatedRefreshToken = { ...mockRefreshToken, ...updateData };
      
      mockPrismaClient.refreshToken.update.mockResolvedValue(updatedRefreshToken);

      const result = await refreshTokenRepository.update(1, updateData);

      expect(mockPrismaClient.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData
      });
      expect(result).toEqual(updatedRefreshToken);
    });

    it('should return null for update errors', async () => {
      const updateData = { revokedat: new Date() };
      
      mockPrismaClient.refreshToken.update.mockRejectedValue(new Error('Database error'));

      const result = await refreshTokenRepository.update(1, updateData);

      expect(mockPrismaClient.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData
      });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a refresh token', async () => {
      mockPrismaClient.refreshToken.delete.mockResolvedValue(undefined);

      const result = await refreshTokenRepository.delete(1);

      expect(mockPrismaClient.refreshToken.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(true);
    });

    it('should return false for delete errors', async () => {
      mockPrismaClient.refreshToken.delete.mockRejectedValue(new Error('Database error'));

      const result = await refreshTokenRepository.delete(1);

      expect(mockPrismaClient.refreshToken.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(false);
    });
  });

  describe('exists', () => {
    it('should return true when refresh token exists', async () => {
      mockPrismaClient.refreshToken.findUnique.mockResolvedValue(mockRefreshToken);

      const result = await refreshTokenRepository.exists(1);

      expect(mockPrismaClient.refreshToken.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(true);
    });

    it('should return false when refresh token does not exist', async () => {
      mockPrismaClient.refreshToken.findUnique.mockResolvedValue(null);

      const result = await refreshTokenRepository.exists(999);

      expect(mockPrismaClient.refreshToken.findUnique).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(result).toBe(false);
    });
  });

  describe('findValidTokens', () => {
    it('should find all valid (non-revoked) refresh tokens', async () => {
      const mockRefreshTokens = [mockRefreshToken];
      mockPrismaClient.refreshToken.findMany.mockResolvedValue(mockRefreshTokens);

      const result = await refreshTokenRepository.findValidTokens();

      expect(mockPrismaClient.refreshToken.findMany).toHaveBeenCalledWith({ where: { revokedat: null } });
      expect(result).toEqual(mockRefreshTokens);
    });
  });

  describe('findByUserId', () => {
    it('should find refresh tokens by user ID', async () => {
      const mockRefreshTokens = [mockRefreshToken];
      mockPrismaClient.refreshToken.findMany.mockResolvedValue(mockRefreshTokens);

      const result = await refreshTokenRepository.findByUserId('user-123');

      expect(mockPrismaClient.refreshToken.findMany).toHaveBeenCalledWith({ 
        where: { user_id: 'user-123' },
        orderBy: { createdat: 'asc' }
      });
      expect(result).toEqual(mockRefreshTokens);
    });
  });

  describe('revokeToken', () => {
    it('should revoke a refresh token by setting its revoked timestamp', async () => {
      const updateData = { revokedat: expect.any(Date) };
      const updatedRefreshToken = { ...mockRefreshToken, revokedat: new Date() };
      
      mockPrismaClient.refreshToken.update.mockResolvedValue(updatedRefreshToken);

      const result = await refreshTokenRepository.revokeToken(1);

      expect(mockPrismaClient.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData
      });
      expect(result).toEqual(updatedRefreshToken);
    });

    it('should return null for revoke errors', async () => {
      mockPrismaClient.refreshToken.update.mockRejectedValue(new Error('Database error'));

      const result = await refreshTokenRepository.revokeToken(1);

      expect(mockPrismaClient.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { revokedat: expect.any(Date) }
      });
      expect(result).toBeNull();
    });
  });

  describe('getRefreshTokens', () => {
    it('should retrieve all valid (non-revoked) refresh tokens', async () => {
      const mockRefreshTokens = [mockRefreshToken];
      mockPrismaClient.refreshToken.findMany.mockResolvedValue(mockRefreshTokens);

      const result = await refreshTokenRepository.getRefreshTokens();

      expect(mockPrismaClient.refreshToken.findMany).toHaveBeenCalledWith({ where: { revokedat: null } });
      expect(result).toEqual(mockRefreshTokens);
    });
  });
});