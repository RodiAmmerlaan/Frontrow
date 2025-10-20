import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import * as validationMiddleware from '../../src/middleware/validation.middleware';
import { ValidationError } from '../../src/errors/CustomErrors';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      body: {},
      query: {},
      params: {}
    };

    mockResponse = {};

    mockNext = jest.fn();
  });

  describe('sanitizeData', () => {
    it('should sanitize string values to prevent XSS', () => {
      const input = '<script>alert("xss")</script>';
      const result = validationMiddleware.sanitizeData(input);
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('should sanitize array values', () => {
      const input = ['<script>alert("xss")</script>', 'normal text'];
      const result = validationMiddleware.sanitizeData(input);
      expect(result).toEqual([
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
        'normal text'
      ]);
    });

    it('should sanitize object values', () => {
      const input = {
        name: '<script>alert("xss")</script>',
        description: 'normal text',
        nested: {
          value: '<img src="x" onerror="alert(1)">'
        }
      };
      const result = validationMiddleware.sanitizeData(input);
      expect(result).toEqual({
        name: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
        description: 'normal text',
        nested: {
          value: '&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;'
        }
      });
    });

    it('should not modify non-string values', () => {
      const input = {
        number: 42,
        boolean: true,
        null: null,
        undefined: undefined
      };
      const result = validationMiddleware.sanitizeData(input);
      expect(result).toEqual(input);
    });
  });

  describe('validateRequest', () => {
    it('should call next() when validation passes', () => {
      const schema = Joi.object({
        name: Joi.string().required()
      });

      mockRequest.body = { name: 'test' };

      const middleware = validationMiddleware.validateRequest(schema, { source: 'body' });

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.validated?.body).toEqual({ name: 'test' });
    });

    it('should sanitize data by default', () => {
      const schema = Joi.object({
        name: Joi.string().required()
      });

      mockRequest.body = { name: '<script>alert("xss")</script>' };

      const middleware = validationMiddleware.validateRequest(schema, { source: 'body' });

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.validated?.body).toEqual({ 
        name: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;' 
      });
    });

    it('should not sanitize data when sanitize is false', () => {
      const schema = Joi.object({
        name: Joi.string().required()
      });

      mockRequest.body = { name: '<script>alert("xss")</script>' };

      const middleware = validationMiddleware.validateRequest(schema, { 
        source: 'body', 
        sanitize: false 
      });

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.validated?.body).toEqual({ 
        name: '<script>alert("xss")</script>' 
      });
    });

    it('should strip unknown fields by default', () => {
      const schema = Joi.object({
        name: Joi.string().required()
      });

      mockRequest.body = { 
        name: 'test',
        unknown: 'should be stripped'
      };

      const middleware = validationMiddleware.validateRequest(schema, { source: 'body' });

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.validated?.body).toEqual({ name: 'test' });
    });

    it('should not strip unknown fields when stripUnknown is false', () => {
      const schema = Joi.object({
        name: Joi.string().required()
      }).options({ stripUnknown: false, allowUnknown: true });

      mockRequest.body = { 
        name: 'test',
        unknown: 'should not be stripped'
      };

      const middleware = validationMiddleware.validateRequest(schema, { 
        source: 'body', 
        stripUnknown: false 
      });

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.validated?.body).toEqual({ 
        name: 'test',
        unknown: 'should not be stripped'
      });
    });

    it('should throw ValidationError when validation fails', () => {
      const schema = Joi.object({
        name: Joi.string().required()
      });

      mockRequest.body = {};

      const middleware = validationMiddleware.validateRequest(schema, { source: 'body' });

      expect(() => {
        middleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }).toThrow(ValidationError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should validate query parameters', () => {
      const schema = Joi.object({
        page: Joi.number().integer().min(1)
      });

      mockRequest.query = { page: '1' };

      const middleware = validationMiddleware.validateRequest(schema, { source: 'query' });

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.validated?.query).toEqual({ page: 1 });
    });

    it('should validate route parameters', () => {
      const schema = Joi.object({
        id: Joi.string().uuid({ version: ['uuidv4'] }).required()
      });

      mockRequest.params = { id: '123e4567-e89b-42d3-a456-426614174000' };

      const middleware = validationMiddleware.validateRequest(schema, { source: 'params' });

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.validated?.params).toEqual({ 
        id: '123e4567-e89b-42d3-a456-426614174000' 
      });
    });

    it('should handle validation errors and throw ValidationError', () => {
      const schema = Joi.object({
        email: Joi.string().email().required()
      });

      mockRequest.body = { email: 'invalid-email' };

      const middleware = validationMiddleware.validateRequest(schema, { source: 'body' });

      expect(() => {
        middleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }).toThrow(ValidationError);

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('ValidationSchemas', () => {
    it('should create email schema', () => {
      const schema = validationMiddleware.ValidationSchemas.email();
      const { error } = schema.validate('test@example.com');
      expect(error).toBeUndefined();
    });

    it('should create password schema', () => {
      const schema = validationMiddleware.ValidationSchemas.password();
      const { error } = schema.validate('password123');
      expect(error).toBeUndefined();
    });

    it('should create UUID schema', () => {
      const schema = validationMiddleware.ValidationSchemas.uuid();
      const { error } = schema.validate('123e4567-e89b-42d3-a456-426614174000');
      expect(error).toBeUndefined();
    });

    it('should create positive integer schema', () => {
      const schema = validationMiddleware.ValidationSchemas.positiveInteger();
      const { error } = schema.validate(5);
      expect(error).toBeUndefined();
    });

    it('should create text schema', () => {
      const schema = validationMiddleware.ValidationSchemas.text();
      const { error } = schema.validate('This is a test text');
      expect(error).toBeUndefined();
    });
  });
});