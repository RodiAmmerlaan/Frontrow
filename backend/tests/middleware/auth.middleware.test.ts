import { Request, Response, NextFunction } from 'express';
import * as tokenUtil from '../../src/utils/token.util';
import { UserRepositoryImpl } from '../../src/repositories/UserRepositoryImpl';

// Create mock user repository
const mockUserRepository = {
  findById: jest.fn()
};

// Mock the token utility functions
jest.mock('../../src/utils/token.util', () => ({
  extractAndVerifyToken: jest.fn()
}));

// Mock the user repository before importing auth.middleware
jest.mock('../../src/repositories/UserRepositoryImpl', () => {
  const actual = jest.requireActual('../../src/repositories/UserRepositoryImpl');
  return {
    __esModule: true,
    ...actual,
    UserRepositoryImpl: jest.fn(() => mockUserRepository)
  };
});

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  http: jest.fn()
}));

// Import auth middleware after mocks are set up
import * as authMiddleware from '../../src/middleware/auth.middleware';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockRequest = {
      headers: {}
    };

    mockResponse = {
      status: mockStatus,
      json: mockJson
    };

    mockNext = jest.fn();
  });

  describe('authenticate', () => {
    it('should call next() when authentication is successful', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER'
      };

      const mockTokenResult = {
        success: true as const,
        decoded: {
          sub: 'user-123',
          email: 'test@example.com',
          role: 'USER'
        }
      };

      (tokenUtil.extractAndVerifyToken as jest.Mock).mockReturnValue(mockTokenResult);
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await authMiddleware.authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(tokenUtil.extractAndVerifyToken).toHaveBeenCalledWith(mockRequest);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
      expect((mockRequest as any).user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER'
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should return 401 when no token is provided', async () => {
      const mockTokenResult = {
        success: false as const,
        error: 'No token provided'
      };

      (tokenUtil.extractAndVerifyToken as jest.Mock).mockReturnValue(mockTokenResult);

      await authMiddleware.authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(tokenUtil.extractAndVerifyToken).toHaveBeenCalledWith(mockRequest);
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'No token provided'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', async () => {
      const mockTokenResult = {
        success: false as const,
        error: 'Invalid or expired token'
      };

      (tokenUtil.extractAndVerifyToken as jest.Mock).mockReturnValue(mockTokenResult);

      await authMiddleware.authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(tokenUtil.extractAndVerifyToken).toHaveBeenCalledWith(mockRequest);
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid or expired token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not found', async () => {
      const mockTokenResult = {
        success: true as const,
        decoded: {
          sub: 'user-123',
          email: 'test@example.com',
          role: 'USER'
        }
      };

      (tokenUtil.extractAndVerifyToken as jest.Mock).mockReturnValue(mockTokenResult);
      mockUserRepository.findById.mockResolvedValue(null);

      await authMiddleware.authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(tokenUtil.extractAndVerifyToken).toHaveBeenCalledWith(mockRequest);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when an unexpected error occurs', async () => {
      (tokenUtil.extractAndVerifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await authMiddleware.authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(tokenUtil.extractAndVerifyToken).toHaveBeenCalledWith(mockRequest);
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid or expired token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('authorizeAdmin', () => {
    it('should call next() when user is an admin', () => {
      (mockRequest as any).user = {
        id: 'user-123',
        email: 'admin@example.com',
        role: 'ADMIN'
      };

      authMiddleware.authorizeAdmin(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', () => {
      (mockRequest as any).user = undefined;

      authMiddleware.authorizeAdmin(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user is not an admin', () => {
      (mockRequest as any).user = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'USER'
      };

      authMiddleware.authorizeAdmin(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. Admin role required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('authorizeRoles', () => {
    it('should call next() when user has one of the authorized roles', () => {
      (mockRequest as any).user = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'USER'
      };

      const authorizeRolesMiddleware = authMiddleware.authorizeRoles(['USER', 'ADMIN']);

      authorizeRolesMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', () => {
      (mockRequest as any).user = undefined;

      const authorizeRolesMiddleware = authMiddleware.authorizeRoles(['USER', 'ADMIN']);

      authorizeRolesMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user does not have any of the authorized roles', () => {
      (mockRequest as any).user = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'GUEST'
      };

      const authorizeRolesMiddleware = authMiddleware.authorizeRoles(['USER', 'ADMIN']);

      authorizeRolesMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. Required roles: USER, ADMIN'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});