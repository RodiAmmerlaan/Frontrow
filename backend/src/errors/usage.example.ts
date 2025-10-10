import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  BadRequestError,
  ConflictError,
  RateLimitError,
  InternalServerError
} from './CustomErrors';
import Logger from '../utils/logger';

try {
  throw new AuthenticationError('Invalid username or password');
} catch (error) {
  if (error instanceof AuthenticationError) {
    Logger.info(`Authentication Error: ${error.message}`);
  }
}

try {
  throw new AuthorizationError('Insufficient permissions to access this resource');
} catch (error) {
  if (error instanceof AuthorizationError) {
    Logger.info(`Authorization Error: ${error.message}`);
  }
}

try {
  throw new NotFoundError('User with ID 123 not found');
} catch (error) {
  if (error instanceof NotFoundError) {
    Logger.info(`Not Found Error: ${error.message}`);
  }
}

try {
  throw new ValidationError('Email field is required');
} catch (error) {
  if (error instanceof ValidationError) {
    Logger.info(`Validation Error: ${error.message}`);
  }
}

try {
  throw new BadRequestError('Malformed request payload');
} catch (error) {
  if (error instanceof BadRequestError) {
    Logger.info(`Bad Request Error: ${error.message}`);
  }
}

try {
  throw new ConflictError('A user with this email already exists');
} catch (error) {
  if (error instanceof ConflictError) {
    Logger.info(`Conflict Error: ${error.message}`);
  }
}

try {
  throw new RateLimitError('Too many requests. Please try again later.');
} catch (error) {
  if (error instanceof RateLimitError) {
    Logger.info(`Rate Limit Error: ${error.message}`);
  }
}

try {
  throw new InternalServerError('Database connection failed');
} catch (error) {
  if (error instanceof InternalServerError) {
    Logger.error(`Internal Server Error: ${error.message}`);
  }
}