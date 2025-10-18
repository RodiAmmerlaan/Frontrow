import { Request, Response, NextFunction } from 'express';
import Joi, { ObjectSchema, ValidationError as JoiValidationError } from 'joi';
import escapeHtml from 'escape-html';
import { BaseController } from '../controllers/BaseController';
import { ValidationError } from '../errors/CustomErrors';
import '../interfaces/express.interface';

export interface ValidationOptions {
  source: 'body' | 'query' | 'params';
  stripUnknown?: boolean;
  sanitize?: boolean;
}

/**
 * Sanitizes string values to prevent XSS attacks
 * @param data - The data to sanitize
 * @returns Sanitized data
 */
export function sanitizeData(data: any): any {
  if (typeof data === 'string') {
    return escapeHtml(data);
  } else if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  } else if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        sanitized[key] = sanitizeData(data[key]);
      }
    }
    return sanitized;
  }
  return data;
}

/**
 * Validates request data based on provided Joi schema
 * @param schema - Joi schema for validation
 * @param options - Validation options
 * @returns Express middleware function
 */
export function validateRequest(schema: ObjectSchema, options: ValidationOptions = { source: 'body' }) {
  return (request: Request, response: Response, next: NextFunction) => {
    try {
      let data = getDataFromRequest(request, options.source);
      
      if (options.sanitize !== false) {
        data = sanitizeData(data);
      }
      
      const { error, value } = schema.validate(data, { 
        abortEarly: false,
        stripUnknown: options.stripUnknown ?? true
      });
      
      if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        throw new ValidationError(errorMessage);
      }
      
      if (!request.validated) {
        request.validated = {};
      }
      request.validated[options.source] = value;
      
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      
      throw new ValidationError('Validation failed: ' + (error as Error).message);
    }
  };
}

/**
 * Extracts data from the request based on the source
 * @param request - Express request object
 * @param source - Where to extract data from
 * @returns Data object
 */
function getDataFromRequest(request: Request, source: 'body' | 'query' | 'params'): any {
  switch (source) {
    case 'body':
      return request.body;
    case 'query':
      return request.query;
    case 'params':
      return request.params;
    default:
      return request.body;
  }
}

export const ValidationSchemas = {
  email: () => Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required'
  }),
  
  password: (minLength: number = 8) => Joi.string().min(minLength).required().messages({
    'string.min': `Password must be at least ${minLength} characters long`,
    'any.required': 'Password is required'
  }),
  
  uuid: () => Joi.string().uuid({ version: ['uuidv4'] }).required().messages({
    'string.uuid': 'Invalid ID format',
    'any.required': 'ID is required'
  }),
  
  positiveInteger: () => Joi.number().integer().min(1).required().messages({
    'number.integer': 'Value must be an integer',
    'number.min': 'Value must be a positive integer',
    'any.required': 'Value is required'
  }),
  
  text: (maxLength: number = 1000) => Joi.string().max(maxLength).optional().messages({
    'string.max': `Text must be less than ${maxLength} characters`
  })
};