"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationSchemas = void 0;
exports.sanitizeData = sanitizeData;
exports.validateRequest = validateRequest;
const joi_1 = __importDefault(require("joi"));
const escape_html_1 = __importDefault(require("escape-html"));
const CustomErrors_1 = require("../errors/CustomErrors");
/**
 * Sanitizes string values to prevent XSS attacks
 * @param data - The data to sanitize
 * @returns Sanitized data
 */
function sanitizeData(data) {
    if (typeof data === 'string') {
        return (0, escape_html_1.default)(data);
    }
    else if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item));
    }
    else if (typeof data === 'object' && data !== null) {
        const sanitized = {};
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
function validateRequest(schema, options = { source: 'body' }) {
    return (request, response, next) => {
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
                throw new CustomErrors_1.ValidationError(errorMessage);
            }
            setDataOnRequest(request, options.source, value);
            next();
        }
        catch (error) {
            if (error instanceof CustomErrors_1.ValidationError) {
                throw error;
            }
            throw new CustomErrors_1.ValidationError('Validation failed: ' + error.message);
        }
    };
}
/**
 * Extracts data from the request based on the source
 * @param request - Express request object
 * @param source - Where to extract data from
 * @returns Data object
 */
function getDataFromRequest(request, source) {
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
/**
 * Sets validated data back on the request object
 * @param request - Express request object
 * @param source - Where to set the data
 * @param data - Validated data
 */
function setDataOnRequest(request, source, data) {
    switch (source) {
        case 'body':
            request.body = data;
            break;
        case 'query':
            request.query = data;
            break;
        case 'params':
            request.params = data;
            break;
    }
}
exports.ValidationSchemas = {
    email: () => joi_1.default.string().email().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required'
    }),
    password: (minLength = 8) => joi_1.default.string().min(minLength).required().messages({
        'string.min': `Password must be at least ${minLength} characters long`,
        'any.required': 'Password is required'
    }),
    uuid: () => joi_1.default.string().uuid({ version: ['uuidv4'] }).required().messages({
        'string.uuid': 'Invalid ID format',
        'any.required': 'ID is required'
    }),
    positiveInteger: () => joi_1.default.number().integer().min(1).required().messages({
        'number.integer': 'Value must be an integer',
        'number.min': 'Value must be a positive integer',
        'any.required': 'Value is required'
    }),
    text: (maxLength = 1000) => joi_1.default.string().max(maxLength).optional().messages({
        'string.max': `Text must be less than ${maxLength} characters`
    })
};
//# sourceMappingURL=validation.middleware.js.map