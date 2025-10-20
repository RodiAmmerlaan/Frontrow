import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../src/middleware/errorHandler.middleware';
import { CustomError, ValidationError, InternalServerError } from '../../src/errors/CustomErrors';
import * as responseUtil from '../../src/utils/response.util';

// Mock the response utility functions
jest.mock('../../src/utils/response.util', () => ({
  sendError: jest.fn()
}));

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  http: jest.fn()
}));

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockSendError: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSendError = jest.fn();
    (responseUtil.sendError as jest.Mock).mockImplementation(mockSendError);

    mockRequest = {};
    mockResponse = {};
    mockNext = jest.fn();
  });

  it('should handle CustomError instances', () => {
    const customError = new CustomError(400, 'TEST_ERROR', 'Test error message');

    errorHandler(
      customError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(responseUtil.sendError).toHaveBeenCalledWith(
      mockResponse,
      'TEST_ERROR',
      400,
      'Test error message'
    );
  });

  it('should log non-operational errors', () => {
    const logger = require('../../src/utils/logger');
    const customError = new InternalServerError('Test internal error');

    errorHandler(
      customError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(logger.error).toHaveBeenCalledWith('Unexpected error:', customError);
  });

  it('should not log operational CustomError instances', () => {
    const logger = require('../../src/utils/logger');
    const customError = new ValidationError('Test validation error');

    errorHandler(
      customError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith('Custom error: VALIDATION_ERROR - Test validation error');
  });

  it('should handle Joi ValidationError', () => {
    const validationError = new Error('Field is required') as any;
    validationError.name = 'ValidationError';

    errorHandler(
      validationError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(responseUtil.sendError).toHaveBeenCalledWith(
      mockResponse,
      'VALIDATION_ERROR',
      400,
      'Field is required'
    );
  });

  it('should handle JSON syntax errors', () => {
    const syntaxError = new Error('Unexpected token') as any;
    syntaxError.name = 'SyntaxError';
    syntaxError.status = 400;

    errorHandler(
      syntaxError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(responseUtil.sendError).toHaveBeenCalledWith(
      mockResponse,
      'SYNTAX_ERROR',
      400,
      'Invalid JSON syntax'
    );
  });

  it('should handle MongoDB duplicate key errors', () => {
    const mongoError = new Error('Duplicate key') as any;
    mongoError.name = 'MongoError';
    mongoError.code = 11000;

    errorHandler(
      mongoError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(responseUtil.sendError).toHaveBeenCalledWith(
      mockResponse,
      'DUPLICATE_KEY_ERROR',
      409,
      'Duplicate key error'
    );
  });

  it('should handle unexpected errors', () => {
    const unexpectedError = new Error('Unexpected error');
    const logger = require('../../src/utils/logger');

    errorHandler(
      unexpectedError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(logger.error).toHaveBeenCalledWith('Unexpected error:', unexpectedError);
    expect(responseUtil.sendError).toHaveBeenCalledWith(
      mockResponse,
      'INTERNAL_ERROR',
      500,
      'An unexpected error occurred'
    );
  });
});