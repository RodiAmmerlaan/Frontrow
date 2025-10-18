import { Request, Response } from 'express';
import * as authService from '../../src/services/auth.service';
import * as tokenUtil from '../../src/utils/token.util';
import { mockUser, mockRefreshTokenRecord } from '../mocks/testUtils';
import { AuthenticationError, ConflictError, NotFoundError, InternalServerError, ValidationError, BadRequestError } from '../../src/errors';
import { loginController, login } from '../../src/controllers/auth/login.controller';
import { registrationController } from '../../src/controllers/auth/registration.controller';
import { getProfileController } from '../../src/controllers/auth/profile.controller';
import { refreshController } from '../../src/controllers/auth/refresh.controller';
import { logoutController } from '../../src/controllers/auth/logout.controller';

// Mock the cookie functions
jest.mock('../../src/controllers/auth/cookie', () => {
  const originalModule = jest.requireActual('../../src/controllers/auth/cookie');
  return {
    ...originalModule,
    setRefreshCookie: jest.fn(),
    clearRefreshCookie: jest.fn(),
    getRefreshCookie: jest.fn()
  };
});

// Import the mocked functions after mocking
const { setRefreshCookie: mockSetRefreshCookie, clearRefreshCookie: mockClearRefreshCookie, getRefreshCookie: mockGetRefreshCookie } = require('../../src/controllers/auth/cookie');

// Mock the response utility functions
jest.mock('../../src/utils/response.util', () => {
  const originalModule = jest.requireActual('../../src/utils/response.util');
  return {
    ...originalModule,
    sendSuccess: jest.fn(),
    sendUnauthorized: jest.fn(),
    sendBadRequest: jest.fn(),
    sendNotFound: jest.fn(),
    sendError: jest.fn()
  };
});

// Import the mocked functions after mocking
const { 
  sendSuccess: mockSendSuccess,
  sendUnauthorized: mockSendUnauthorized,
  sendBadRequest: mockSendBadRequest,
  sendNotFound: mockSendNotFound,
  sendError: mockSendError
} = require('../../src/utils/response.util');

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

// Create a spy on the BaseController methods
jest.spyOn(loginController, 'sendSuccess' as any);
jest.spyOn(loginController, 'throwBadRequestError' as any);
jest.spyOn(loginController, 'throwAuthenticationError' as any);

describe('Auth Controllers', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let correlationId: string;

  beforeEach(() => {
    jest.clearAllMocks();
    
    correlationId = 'test-correlation-id';
    
    mockRequest = {
      correlationId,
      body: {},
      headers: {},
      cookies: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis()
    };
  });

  describe('LoginController', () => {
    const testEmail = 'test@example.com';
    const testPassword = 'password123';

    beforeEach(() => {
      mockRequest.body = {
        email: testEmail,
        password: testPassword
      };
    });

    it('should successfully authenticate a user and set refresh cookie', async () => {
      const authResult = {
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.first_name,
          lastName: mockUser.last_name,
          role: mockUser.role
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      };

      jest.spyOn(authService.AuthService, 'authenticateUser').mockResolvedValue(authResult);

      await login(mockRequest as Request, mockResponse as Response);

      expect(authService.AuthService.authenticateUser).toHaveBeenCalledWith(testEmail, testPassword);
      expect(mockSetRefreshCookie).toHaveBeenCalledWith(mockResponse, 'mock-refresh-token', 30);
      expect((loginController as any).sendSuccess).toHaveBeenCalledWith(mockResponse, { access_token: 'mock-access-token' });
    });

    it('should handle validation errors during login', async () => {
      const validationError = new ValidationError('Validation failed');
      jest.spyOn(authService.AuthService, 'authenticateUser').mockRejectedValue(validationError);

      await expect(login(mockRequest as Request, mockResponse as Response)).rejects.toThrow(BadRequestError);
      
      expect((loginController as any).throwBadRequestError).toHaveBeenCalledWith('Validation failed');
    });

    it('should handle authentication errors during login', async () => {
      const authError = new AuthenticationError('Invalid credentials');
      jest.spyOn(authService.AuthService, 'authenticateUser').mockRejectedValue(authError);

      await expect(login(mockRequest as Request, mockResponse as Response)).rejects.toThrow(AuthenticationError);
      
      expect((loginController as any).throwAuthenticationError).toHaveBeenCalledWith('Invalid credentials');
    });

    it('should handle unexpected errors during login', async () => {
      jest.spyOn(authService.AuthService, 'authenticateUser').mockRejectedValue(
        new Error('Unexpected error')
      );

      expect(async () => {
        await login(mockRequest as Request, mockResponse as Response);
      }).rejects.toThrow(Error);
    });
  });

  describe('RegistrationController', () => {
    const registrationData = {
      email: 'newuser@example.com',
      password: 'password123',
      first_name: 'New',
      last_name: 'User',
      street: 'New Street',
      house_number: '456',
      postal_code: '67890',
      city: 'New City'
    };

    beforeEach(() => {
      mockRequest.body = registrationData;
    });

    it('should successfully register a new user and set refresh cookie', async () => {
      const authResult = {
        user: {
          id: 'new-user-id',
          email: registrationData.email,
          firstName: registrationData.first_name,
          lastName: registrationData.last_name,
          role: 'USER'
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      };

      jest.spyOn(authService.AuthService, 'registerUser').mockResolvedValue(authResult);

      await registrationController(mockRequest as Request, mockResponse as Response);

      expect(authService.AuthService.registerUser).toHaveBeenCalledWith(registrationData);
      expect(mockSetRefreshCookie).toHaveBeenCalledWith(mockResponse, 'mock-refresh-token', 30);
      expect(mockSendSuccess).toHaveBeenCalledWith(mockResponse, { access_token: 'mock-access-token' }, undefined, 201);
    });

    it('should handle conflict errors during registration', async () => {
      jest.spyOn(authService.AuthService, 'registerUser').mockRejectedValue(
        new ConflictError('A user with this email already exists')
      );

      await registrationController(mockRequest as Request, mockResponse as Response);

      expect(mockSendBadRequest).toHaveBeenCalledWith(mockResponse, 'A user with this email already exists');
    });

    it('should handle validation errors during registration', async () => {
      jest.spyOn(authService.AuthService, 'registerUser').mockRejectedValue(
        new ValidationError('Validation error')
      );

      await registrationController(mockRequest as Request, mockResponse as Response);

      expect(mockSendBadRequest).toHaveBeenCalledWith(mockResponse, 'Validation error');
    });

    it('should handle unexpected errors during registration', async () => {
      jest.spyOn(authService.AuthService, 'registerUser').mockRejectedValue(
        new InternalServerError('Internal server error')
      );

      await registrationController(mockRequest as Request, mockResponse as Response);

      expect(mockSendBadRequest).toHaveBeenCalledWith(mockResponse, 'Failed to register user. Please try again later.');
    });
  });

  describe('GetProfileController', () => {
    const userId = 'user-123';
    const tokenResult = {
      success: true as const,
      decoded: {
        sub: userId,
        email: mockUser.email,
        role: mockUser.role
      }
    };

    beforeEach(() => {
      mockRequest.headers = {
        authorization: 'Bearer mock-access-token'
      };
    });

    it('should successfully retrieve user profile', async () => {
      const userProfile = {
        id: userId,
        email: mockUser.email,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        role: mockUser.role
      };

      jest.spyOn(tokenUtil, 'extractAndVerifyToken').mockReturnValue(tokenResult);
      jest.spyOn(authService.AuthService, 'getUserProfile').mockResolvedValue(userProfile);

      await getProfileController(mockRequest as Request, mockResponse as Response);

      expect(tokenUtil.extractAndVerifyToken).toHaveBeenCalledWith(mockRequest);
      expect(authService.AuthService.getUserProfile).toHaveBeenCalledWith(userId);
      expect(mockSendSuccess).toHaveBeenCalledWith(mockResponse, userProfile);
    });

    it('should handle invalid token', async () => {
      const invalidTokenResult = {
        success: false as const,
        error: 'Invalid or expired token'
      };

      jest.spyOn(tokenUtil, 'extractAndVerifyToken').mockReturnValue(invalidTokenResult);

      await getProfileController(mockRequest as Request, mockResponse as Response);

      expect(mockSendUnauthorized).toHaveBeenCalledWith(mockResponse, 'Invalid or expired token');
    });

    it('should handle user not found error', async () => {
      jest.spyOn(tokenUtil, 'extractAndVerifyToken').mockReturnValue(tokenResult);
      jest.spyOn(authService.AuthService, 'getUserProfile').mockRejectedValue(
        new NotFoundError('User not found')
      );

      await getProfileController(mockRequest as Request, mockResponse as Response);

      expect(mockSendNotFound).toHaveBeenCalledWith(mockResponse, 'User not found');
    });

    it('should handle unexpected errors during profile retrieval', async () => {
      jest.spyOn(tokenUtil, 'extractAndVerifyToken').mockReturnValue(tokenResult);
      jest.spyOn(authService.AuthService, 'getUserProfile').mockRejectedValue(
        new Error('Unexpected error')
      );

      await getProfileController(mockRequest as Request, mockResponse as Response);

      expect(mockSendError).toHaveBeenCalledWith(mockResponse, 'Failed to retrieve user profile. Please try again later.', 500);
    });
  });

  describe('RefreshController', () => {
    const refreshToken = 'mock-refresh-token';

    beforeEach(() => {
      mockGetRefreshCookie.mockReturnValue(refreshToken);
    });

    it('should successfully refresh tokens', async () => {
      const tokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };

      jest.spyOn(authService.AuthService, 'refreshUserTokens').mockResolvedValue(tokens);

      await refreshController(mockRequest as Request, mockResponse as Response);

      expect(authService.AuthService.refreshUserTokens).toHaveBeenCalledWith(refreshToken);
      expect(mockSetRefreshCookie).toHaveBeenCalledWith(mockResponse, 'new-refresh-token', 30);
      expect(mockSendSuccess).toHaveBeenCalledWith(mockResponse, { access_token: 'new-access-token' });
    });

    it('should handle missing refresh cookie', async () => {
      mockGetRefreshCookie.mockReturnValue(null);

      await refreshController(mockRequest as Request, mockResponse as Response);

      expect(mockSendUnauthorized).toHaveBeenCalledWith(mockResponse, 'Missing refresh Cookie');
    });

    it('should handle authentication errors during token refresh', async () => {
      jest.spyOn(authService.AuthService, 'refreshUserTokens').mockRejectedValue(
        new AuthenticationError('Invalid refresh token')
      );

      await refreshController(mockRequest as Request, mockResponse as Response);

      expect(mockSendUnauthorized).toHaveBeenCalledWith(mockResponse, 'Invalid refresh token');
    });

    it('should handle unexpected errors during token refresh', async () => {
      jest.spyOn(authService.AuthService, 'refreshUserTokens').mockRejectedValue(
        new Error('Unexpected error')
      );

      await refreshController(mockRequest as Request, mockResponse as Response);

      expect(mockSendUnauthorized).toHaveBeenCalledWith(mockResponse, 'Failed to refresh authentication tokens. Please try again later.');
    });
  });

  describe('LogoutController', () => {
    const refreshToken = 'mock-refresh-token';

    beforeEach(() => {
      mockGetRefreshCookie.mockReturnValue(refreshToken);
    });

    it('should successfully logout user', async () => {
      jest.spyOn(authService.AuthService, 'logoutUser').mockResolvedValue({ message: 'Logout successful' });

      await logoutController(mockRequest as Request, mockResponse as Response);

      expect(authService.AuthService.logoutUser).toHaveBeenCalledWith(refreshToken);
      expect(mockClearRefreshCookie).toHaveBeenCalledWith(mockResponse);
      expect(mockSendSuccess).toHaveBeenCalledWith(mockResponse, { message: 'Logged out successfully' });
    });

    it('should clear cookie even when refresh token is missing', async () => {
      mockGetRefreshCookie.mockReturnValue(null);

      await logoutController(mockRequest as Request, mockResponse as Response);

      expect(authService.AuthService.logoutUser).not.toHaveBeenCalled();
      expect(mockClearRefreshCookie).toHaveBeenCalledWith(mockResponse);
      expect(mockSendSuccess).toHaveBeenCalledWith(mockResponse, { message: 'Logged out successfully' });
    });

    it('should clear cookie even when logout service fails', async () => {
      jest.spyOn(authService.AuthService, 'logoutUser').mockRejectedValue(
        new Error('Logout failed')
      );

      await logoutController(mockRequest as Request, mockResponse as Response);

      expect(authService.AuthService.logoutUser).toHaveBeenCalledWith(refreshToken);
      expect(mockClearRefreshCookie).toHaveBeenCalledWith(mockResponse);
      expect(mockSendSuccess).toHaveBeenCalledWith(mockResponse, { message: 'Logged out successfully' });
    });
  });
});