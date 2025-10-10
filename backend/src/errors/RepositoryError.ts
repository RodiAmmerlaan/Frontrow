import { CustomError } from "./CustomErrors";

export class RepositoryError extends CustomError {
  constructor(
    message: string = 'Repository operation failed',
    errorCode: string = 'REPOSITORY_ERROR'
  ) {
    super(500, errorCode, message);
  }
}

export class EntityNotFoundError extends CustomError {
  constructor(
    message: string = 'Entity not found',
    errorCode: string = 'ENTITY_NOT_FOUND'
  ) {
    super(404, errorCode, message);
  }
}

export class DuplicateEntityError extends CustomError {
  constructor(
    message: string = 'Entity already exists',
    errorCode: string = 'DUPLICATE_ENTITY'
  ) {
    super(409, errorCode, message);
  }
}

export class ValidationError extends CustomError {
  constructor(
    message: string = 'Validation failed',
    errorCode: string = 'VALIDATION_ERROR'
  ) {
    super(400, errorCode, message);
  }
}