import { Request, Response, NextFunction } from 'express';
import { correlationIdMiddleware } from '../../src/middleware/correlationId.middleware';

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  http: jest.fn()
}));

describe('Correlation ID Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockSetHeader: jest.Mock;
  let mockOn: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSetHeader = jest.fn();
    mockOn = jest.fn();

    mockRequest = {
      method: 'GET',
      path: '/test'
    };

    mockResponse = {
      setHeader: mockSetHeader,
      on: mockOn,
      statusCode: 200
    };

    mockNext = jest.fn();
  });

  it('should generate a correlation ID and attach it to the request', () => {
    correlationIdMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockRequest.correlationId).toBeDefined();
    expect(typeof mockRequest.correlationId).toBe('string');
    expect(mockRequest.correlationId).toMatch(/^\d+-\d+$/);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should set the X-Correlation-ID header in the response', () => {
    correlationIdMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockSetHeader).toHaveBeenCalledWith(
      'X-Correlation-ID',
      mockRequest.correlationId
    );
  });

  it('should register a finish event listener on the response', () => {
    correlationIdMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockOn).toHaveBeenCalledWith('finish', expect.any(Function));
  });

  it('should log the start of the request', () => {
    const logger = require('../../src/utils/logger');
    
    correlationIdMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(logger.http).toHaveBeenCalledWith(
      `[${mockRequest.correlationId}] GET /test - Request started`
    );
  });

  it('should log the response status when the response finishes', () => {
    const logger = require('../../src/utils/logger');
    
    correlationIdMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    // Get the callback function passed to mockOn
    const finishCallback = mockOn.mock.calls[0][1];
    
    // Simulate the finish event
    finishCallback();

    expect(logger.http).toHaveBeenCalledWith(
      `[${mockRequest.correlationId}] GET /test - Response status: 200`
    );
  });

  it('should generate unique correlation IDs for different requests', () => {
    correlationIdMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    const firstCorrelationId = mockRequest.correlationId;

    // Create a new request
    const secondRequest: Partial<Request> = {
      method: 'POST',
      path: '/api/users'
    };

    correlationIdMiddleware(
      secondRequest as Request,
      mockResponse as Response,
      mockNext
    );

    const secondCorrelationId = secondRequest.correlationId;

    expect(firstCorrelationId).not.toBe(secondCorrelationId);
  });
});