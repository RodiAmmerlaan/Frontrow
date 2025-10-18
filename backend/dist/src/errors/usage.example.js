"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CustomErrors_1 = require("./CustomErrors");
const logger_1 = __importDefault(require("../utils/logger"));
try {
    throw new CustomErrors_1.AuthenticationError('Invalid username or password');
}
catch (error) {
    if (error instanceof CustomErrors_1.AuthenticationError) {
        logger_1.default.info(`Authentication Error: ${error.message}`);
    }
}
try {
    throw new CustomErrors_1.AuthorizationError('Insufficient permissions to access this resource');
}
catch (error) {
    if (error instanceof CustomErrors_1.AuthorizationError) {
        logger_1.default.info(`Authorization Error: ${error.message}`);
    }
}
try {
    throw new CustomErrors_1.NotFoundError('User with ID 123 not found');
}
catch (error) {
    if (error instanceof CustomErrors_1.NotFoundError) {
        logger_1.default.info(`Not Found Error: ${error.message}`);
    }
}
try {
    throw new CustomErrors_1.ValidationError('Email field is required');
}
catch (error) {
    if (error instanceof CustomErrors_1.ValidationError) {
        logger_1.default.info(`Validation Error: ${error.message}`);
    }
}
try {
    throw new CustomErrors_1.BadRequestError('Malformed request payload');
}
catch (error) {
    if (error instanceof CustomErrors_1.BadRequestError) {
        logger_1.default.info(`Bad Request Error: ${error.message}`);
    }
}
try {
    throw new CustomErrors_1.ConflictError('A user with this email already exists');
}
catch (error) {
    if (error instanceof CustomErrors_1.ConflictError) {
        logger_1.default.info(`Conflict Error: ${error.message}`);
    }
}
try {
    throw new CustomErrors_1.RateLimitError('Too many requests. Please try again later.');
}
catch (error) {
    if (error instanceof CustomErrors_1.RateLimitError) {
        logger_1.default.info(`Rate Limit Error: ${error.message}`);
    }
}
try {
    throw new CustomErrors_1.InternalServerError('Database connection failed');
}
catch (error) {
    if (error instanceof CustomErrors_1.InternalServerError) {
        logger_1.default.error(`Internal Server Error: ${error.message}`);
    }
}
//# sourceMappingURL=usage.example.js.map