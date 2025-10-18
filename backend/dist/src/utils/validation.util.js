"use strict";
/**
 * Shared validation utilities for common validation scenarios
 * These utilities provide reusable validation functions that can be used
 * across services and controllers to ensure consistent validation logic
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequired = validateRequired;
exports.validateNonEmptyString = validateNonEmptyString;
exports.validatePositiveInteger = validatePositiveInteger;
exports.validateNonNegativeNumber = validateNonNegativeNumber;
exports.validateOptionalInteger = validateOptionalInteger;
exports.validateEmail = validateEmail;
exports.validatePassword = validatePassword;
exports.validateDate = validateDate;
exports.validateUUID = validateUUID;
const CustomErrors_1 = require("../errors/CustomErrors");
/**
 * Validates that a value is not null, undefined, or empty
 * @param value - The value to validate
 * @param fieldName - The name of the field being validated (for error messages)
 * @throws ValidationError if the value is null, undefined, or empty
 */
function validateRequired(value, fieldName) {
    if (value === null || value === undefined || value === '') {
        throw new CustomErrors_1.ValidationError(`${fieldName} is required`);
    }
}
/**
 * Validates that a string is not empty after trimming
 * @param value - The string to validate
 * @param fieldName - The name of the field being validated (for error messages)
 * @throws ValidationError if the string is null, undefined, or empty after trimming
 */
function validateNonEmptyString(value, fieldName) {
    if (!value || value.trim() === '') {
        throw new CustomErrors_1.ValidationError(`${fieldName} cannot be empty`);
    }
}
/**
 * Validates that a number is a positive integer
 * @param value - The number to validate
 * @param fieldName - The name of the field being validated (for error messages)
 * @throws ValidationError if the number is not a positive integer
 */
function validatePositiveInteger(value, fieldName) {
    if (value === null || value === undefined || !Number.isInteger(value) || value < 1) {
        throw new CustomErrors_1.ValidationError(`${fieldName} must be a positive integer`);
    }
}
/**
 * Validates that a number is non-negative
 * @param value - The number to validate
 * @param fieldName - The name of the field being validated (for error messages)
 * @throws ValidationError if the number is negative
 */
function validateNonNegativeNumber(value, fieldName) {
    if (value === null || value === undefined || value < 0) {
        throw new CustomErrors_1.ValidationError(`${fieldName} must be a non-negative number`);
    }
}
/**
 * Validates that an optional number is an integer within a specified range
 * @param value - The number to validate
 * @param fieldName - The name of the field being validated (for error messages)
 * @param min - Minimum allowed value (inclusive)
 * @param max - Maximum allowed value (inclusive)
 * @throws ValidationError if the number is not an integer within the specified range
 */
function validateOptionalInteger(value, fieldName, min, max) {
    if (value === null || value === undefined) {
        return;
    }
    if (!Number.isInteger(value) || value < min || value > max) {
        throw new CustomErrors_1.ValidationError(`${fieldName} must be an integer between ${min} and ${max}`);
    }
}
/**
 * Validates that an email has a valid format
 * @param email - The email to validate
 * @param fieldName - The name of the field being validated (for error messages)
 * @throws ValidationError if the email format is invalid
 */
function validateEmail(email, fieldName) {
    if (!email) {
        throw new CustomErrors_1.ValidationError(`${fieldName} is required`);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new CustomErrors_1.ValidationError(`${fieldName} must be a valid email address`);
    }
}
/**
 * Validates that a password meets minimum security requirements
 * @param password - The password to validate
 * @param minLength - Minimum length requirement (default: 8)
 * @throws ValidationError if the password doesn't meet requirements
 */
function validatePassword(password, minLength = 8) {
    if (!password) {
        throw new CustomErrors_1.ValidationError('Password is required');
    }
    if (password.length < minLength) {
        throw new CustomErrors_1.ValidationError(`Password must be at least ${minLength} characters long`);
    }
}
/**
 * Validates that a date is a valid Date object or valid date string
 * @param date - The date to validate
 * @param fieldName - The name of the field being validated (for error messages)
 * @throws ValidationError if the date is invalid
 */
function validateDate(date, fieldName) {
    if (!date) {
        throw new CustomErrors_1.ValidationError(`${fieldName} is required`);
    }
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        throw new CustomErrors_1.ValidationError(`${fieldName} must be a valid date`);
    }
}
/**
 * Validates that a UUID has a valid format
 * @param uuid - The UUID to validate
 * @param fieldName - The name of the field being validated (for error messages)
 * @throws ValidationError if the UUID format is invalid
 */
function validateUUID(uuid, fieldName) {
    if (!uuid) {
        throw new CustomErrors_1.ValidationError(`${fieldName} is required`);
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
        throw new CustomErrors_1.ValidationError(`${fieldName} must be a valid UUID`);
    }
}
exports.default = {
    validateRequired,
    validateNonEmptyString,
    validatePositiveInteger,
    validateNonNegativeNumber,
    validateOptionalInteger,
    validateEmail,
    validatePassword,
    validateDate,
    validateUUID
};
//# sourceMappingURL=validation.util.js.map