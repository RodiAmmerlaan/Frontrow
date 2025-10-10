"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepositoryImpl = void 0;
const client_1 = require("@prisma/client");
const RepositoryError_1 = require("../errors/RepositoryError");
class BaseRepositoryImpl {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    /**
     * Handles Prisma errors and converts them to application-specific errors
     * @param error - The error to handle
     * @param operation - The operation that was being performed
     * @param entityId - Optional entity ID related to the operation
     */
    handlePrismaError(error, operation, entityId) {
        if (error.code === 'P2002') {
            throw new RepositoryError_1.RepositoryError(`Duplicate entity: ${operation}`, 'DUPLICATE_ENTITY');
        }
        if (error.code === 'P2025') {
            throw new RepositoryError_1.RepositoryError(`Entity not found: ${operation}`, 'ENTITY_NOT_FOUND');
        }
        throw new RepositoryError_1.RepositoryError(`Database operation failed: ${operation}. ${error.message}`, 'DATABASE_ERROR');
    }
}
exports.BaseRepositoryImpl = BaseRepositoryImpl;
//# sourceMappingURL=BaseRepositoryImpl.js.map