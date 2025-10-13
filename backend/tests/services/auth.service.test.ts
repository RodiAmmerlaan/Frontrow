import * as tokenService from '../../src/services/token.service';
import * as bcrypt from 'bcrypt';
import { AuthenticationError, ConflictError, InternalServerError, NotFoundError } from '../../src/errors';
import { mockUser, mockRefreshTokenRecord } from '../mocks/testUtils';

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

    (tokenService.signAccessToken as jest.Mock).mockReturnValue('mock-access-token');
    (tokenService.generateRefreshToken as jest.Mock).mockReturnValue('mock-refresh-token');
    (tokenService.issueRefreshToken as jest.Mock).mockResolvedValue(mockRefreshTokenRecord);

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
  });

  describe('authenticateUser', () => {
    it('should authenticate a user with valid credentials', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await AuthService.authenticateUser('test@example.com', 'password123');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
      expect(tokenService.signAccessToken).toHaveBeenCalled();
      expect(tokenService.generateRefreshToken).toHaveBeenCalled();
      expect(tokenService.issueRefreshToken).toHaveBeenCalledWith(mockUser.id, 'mock-refresh-token');
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.first_name,
          lastName: mockUser.last_name,
          role: mockUser.role
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      });
    });

    it('should throw AuthenticationError when user is not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(AuthService.authenticateUser('test@example.com', 'password123'))
        .rejects
        .toThrow(AuthenticationError);
      
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw AuthenticationError when password is invalid', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(AuthService.authenticateUser('test@example.com', 'wrongpassword'))
        .rejects
        .toThrow(AuthenticationError);
      
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', mockUser.password);
    });

    it('should throw InternalServerError when an unexpected error occurs', async () => {
      mockUserRepository.findByEmail.mockRejectedValue(new Error('Database error'));

      await expect(AuthService.authenticateUser('test@example.com', 'password123'))
        .rejects
        .toThrow(InternalServerError);
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
        ...mockUser,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        street: userData.street,
        house_number: userData.house_number,
        postal_code: userData.postal_code,
        city: userData.city
      } as any);

      mockUserRepository.findByEmail.mockResolvedValueOnce(null); // First call
      mockUserRepository.findByEmail.mockResolvedValueOnce({
        ...mockUser,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        street: userData.street,
        house_number: userData.house_number,
        postal_code: userData.postal_code,
        city: userData.city
      } as any); 
      
      const result = await AuthService.registerUser(userData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(mockUserRepository.registerUser).toHaveBeenCalled();
      expect(tokenService.signAccessToken).toHaveBeenCalled();
      expect(tokenService.generateRefreshToken).toHaveBeenCalled();
      expect(tokenService.issueRefreshToken).toHaveBeenCalledWith(
        expect.any(String),
        'mock-refresh-token'
      );
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          role: mockUser.role
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      });
    });

    it('should throw ConflictError when user already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(AuthService.registerUser(userData))
        .rejects
        .toThrow(ConflictError);
      
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
    });

    it('should throw InternalServerError when failing to retrieve newly created user', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null); // First call
      mockUserRepository.findByEmail.mockResolvedValue(null); // Second call (after registration)
      mockUserRepository.registerUser.mockResolvedValue({} as any);

      await expect(AuthService.registerUser(userData))
        .rejects
        .toThrow(InternalServerError);
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile when user exists', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await AuthService.getUserProfile('user-123');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        role: mockUser.role
      });
    });

    it('should throw NotFoundError when user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(AuthService.getUserProfile('nonexistent-user'))
        .rejects
        .toThrow(NotFoundError);
      
      expect(mockUserRepository.findById).toHaveBeenCalledWith('nonexistent-user');
    });
  });

  describe('refreshUserTokens', () => {
    it('should refresh tokens when valid refresh token is provided', async () => {
      mockRefreshTokenRepository.findValidTokens.mockResolvedValue([mockRefreshTokenRecord]);
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await AuthService.refreshUserTokens('valid-refresh-token');

      expect(mockRefreshTokenRepository.findValidTokens).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith('valid-refresh-token', mockRefreshTokenRecord.hashedtoken);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRefreshTokenRecord.user_id);
      expect(tokenService.signAccessToken).toHaveBeenCalled();
      expect(tokenService.generateRefreshToken).toHaveBeenCalled();
      expect(tokenService.issueRefreshToken).toHaveBeenCalledWith(mockUser.id, 'mock-refresh-token');
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      });
    });

    it('should throw AuthenticationError when refresh token is invalid', async () => {
      mockRefreshTokenRepository.findValidTokens.mockResolvedValue([mockRefreshTokenRecord]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(AuthService.refreshUserTokens('invalid-refresh-token'))
        .rejects
        .toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError when user for token is not found', async () => {
      mockRefreshTokenRepository.findValidTokens.mockResolvedValue([mockRefreshTokenRecord]);
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(AuthService.refreshUserTokens('valid-refresh-token'))
        .rejects
        .toThrow(AuthenticationError);
    });
  });

  describe('logoutUser', () => {
    it('should logout user when valid refresh token is provided', async () => {
      mockRefreshTokenRepository.findValidTokens.mockResolvedValue([mockRefreshTokenRecord]);
      mockRefreshTokenRepository.revokeToken.mockResolvedValue(null);

      const result = await AuthService.logoutUser('valid-refresh-token');

      expect(mockRefreshTokenRepository.findValidTokens).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith('valid-refresh-token', mockRefreshTokenRecord.hashedtoken);
      expect(mockRefreshTokenRepository.revokeToken).toHaveBeenCalledWith(Number(mockRefreshTokenRecord.id));
      expect(result).toEqual({ message: 'Logout successful' });
    });

    it('should throw AuthenticationError when refresh token is invalid', async () => {
      mockRefreshTokenRepository.findValidTokens.mockResolvedValue([mockRefreshTokenRecord]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(AuthService.logoutUser('invalid-refresh-token'))
        .rejects
        .toThrow(AuthenticationError);
    });
  });
});