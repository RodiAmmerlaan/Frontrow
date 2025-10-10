import { PrismaClient } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { RepositoryError } from '../errors/RepositoryError';

export abstract class BaseRepositoryImpl<T, ID> implements BaseRepository<T, ID> {
  protected prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Handles Prisma errors and converts them to application-specific errors
   * @param error - The error to handle
   * @param operation - The operation that was being performed
   * @param entityId - Optional entity ID related to the operation
   */
  protected handlePrismaError(error: any, operation: string, entityId?: ID): never {
    if (error.code === 'P2002') { 
      throw new RepositoryError(`Duplicate entity: ${operation}`, 'DUPLICATE_ENTITY');
    }
    if (error.code === 'P2025') { 
      throw new RepositoryError(`Entity not found: ${operation}`, 'ENTITY_NOT_FOUND');
    }
    
    throw new RepositoryError(`Database operation failed: ${operation}. ${error.message}`, 'DATABASE_ERROR');
  }

  abstract findById(id: ID): Promise<T | null>;  
  abstract findAll(): Promise<T[]>;
  abstract create(entity: Omit<T, 'id'>): Promise<T>;
  abstract update(id: ID, entity: Partial<T>): Promise<T | null>;
  abstract delete(id: ID): Promise<boolean>;
  abstract exists(id: ID): Promise<boolean>;
}