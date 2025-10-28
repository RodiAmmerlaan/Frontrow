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
 * @param key - The field key (to skip sanitization for email fields)
 * @returns Sanitized data
 */
export function sanitizeData(data: any, key?: string): any {
  // Skip sanitization for email fields to preserve valid email format
  if (key === 'email') {
    return data;
  }
  
  if (typeof data === 'string') {
    return escapeHtml(data);
  } else if (Array.isArray(data)) {
    return data.map((item, index) => sanitizeData(item, key ? `${key}[${index}]` : undefined));
  } else if (typeof data === 'object' && data !== null && !Object.isFrozen(data)) {
    // Check if data is a plain object and not frozen before checking hasOwnProperty
    const sanitized: any = {};
    for (const objKey in data) {
      // Use Object.prototype.hasOwnProperty.call to safely check for property existence
      if (Object.prototype.hasOwnProperty.call(data, objKey)) {
        sanitized[objKey] = sanitizeData(data[objKey], key ? `${key}.${objKey}` : objKey);
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
    console.log('=== VALIDATION MIDDLEWARE CALLED ===');
    console.log('Request method:', request.method);
    console.log('Request URL:', request.url);
    console.log('Request body:', request.body);
    console.log('Request headers:', request.headers);
    
    try {
      let data = getDataFromRequest(request, options.source);
      
      console.log('Data from request:', data);
      
      // Only sanitize if explicitly enabled (not false)
      if (options.sanitize === true) {
        // For body data, we pass the data directly to sanitizeData which will handle object traversal
        // For other sources, we sanitize as before
        if (options.source === 'body') {
          data = sanitizeData(data);
        } else {
          data = sanitizeData(data);
        }
        console.log('Data after sanitization:', data);
      } else {
        console.log('Sanitization skipped');
      }
      
      const { error, value } = schema.validate(data, { 
        abortEarly: false,
        stripUnknown: options.stripUnknown ?? true
      });
      
      console.log('Validation result - Error:', error, 'Value:', value);
      
      if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        console.log('Throwing validation error:', errorMessage);
        throw new ValidationError(errorMessage);
      }
      
      if (!request.validated) {
        request.validated = {};
      }
      request.validated[options.source] = value;
      
      console.log('Validation successful, calling next()');
      next();
    } catch (error) {
      console.log('Validation error caught:', error);
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