"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.DuplicateEntityError = exports.EntityNotFoundError = exports.RepositoryError = void 0;
const CustomErrors_1 = require("./CustomErrors");
class RepositoryError extends CustomErrors_1.CustomError {
    constructor(message = 'Repository operation failed', errorCode = 'REPOSITORY_ERROR') {
        super(500, errorCode, message);
    }
}
exports.RepositoryError = RepositoryError;
class EntityNotFoundError extends CustomErrors_1.CustomError {
    constructor(message = 'Entity not found', errorCode = 'ENTITY_NOT_FOUND') {
        super(404, errorCode, message);
    }
}
exports.EntityNotFoundError = EntityNotFoundError;
class DuplicateEntityError extends CustomErrors_1.CustomError {
    constructor(message = 'Entity already exists', errorCode = 'DUPLICATE_ENTITY') {
        super(409, errorCode, message);
    }
}
exports.DuplicateEntityError = DuplicateEntityError;
class ValidationError extends CustomErrors_1.CustomError {
    constructor(message = 'Validation failed', errorCode = 'VALIDATION_ERROR') {
        super(400, errorCode, message);
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=RepositoryError.js.map