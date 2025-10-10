export class CustomError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errorCode: string,
    message: string,
    public readonly isOperational: boolean = true
  ) {
    super(message);
    
    this.name = this.constructor.name;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = 'Authentication failed') {
    super(401, 'AUTHENTICATION_ERROR', message);
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = 'Access denied') {
    super(403, 'AUTHORIZATION_ERROR', message);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource not found') {
    super(404, 'NOT_FOUND_ERROR', message);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string = 'Validation failed') {
    super(400, 'VALIDATION_ERROR', message);
  }
}

export class BadRequestError extends CustomError {
  constructor(message: string = 'Bad request') {
    super(400, 'BAD_REQUEST_ERROR', message);
  }
}

export class ConflictError extends CustomError {
  constructor(message: string = 'Resource conflict') {
    super(409, 'CONFLICT_ERROR', message);
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string = 'Rate limit exceeded') {
    super(429, 'RATE_LIMIT_ERROR', message);
  }
}

export class InternalServerError extends CustomError {
  constructor(message: string = 'Internal server error') {
    super(500, 'INTERNAL_SERVER_ERROR', message, false);
  }
}