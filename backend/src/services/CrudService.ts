import { BaseRepository } from "../repositories/BaseRepository";

/**
 * Generic CRUD service base class that provides common CRUD operations
 * This class should be extended by specific service classes to provide
 * type-safe CRUD operations for specific entities
 */
export class CrudService<T, ID> {
  protected repository: BaseRepository<T, ID>;

  constructor(repository: BaseRepository<T, ID>) {
    this.repository = repository;
  }

  /**
   * Find an entity by its ID
   * @param id - The unique identifier of the entity
   * @returns A promise that resolves to the entity or null if not found
   */
  async findById(id: ID): Promise<T | null> {
    return await this.repository.findById(id);
  }

  /**
   * Find all entities
   * @returns A promise that resolves to an array of all entities
   */
  async findAll(): Promise<T[]> {
    return await this.repository.findAll();
  }

  /**
   * Create a new entity
   * @param entity - The entity data to create
   * @returns A promise that resolves to the created entity
   */
  async create(entity: Omit<T, 'id'>): Promise<T> {
    return await this.repository.create(entity);
  }

  /**
   * Update an existing entity
   * @param id - The unique identifier of the entity to update
   * @param entity - The updated entity data
   * @returns A promise that resolves to the updated entity or null if not found
   */
  async update(id: ID, entity: Partial<T>): Promise<T | null> {
    return await this.repository.update(id, entity);
  }

  /**
   * Delete an entity by its ID
   * @param id - The unique identifier of the entity to delete
   * @returns A promise that resolves to true if deletion was successful, false otherwise
   */
  async delete(id: ID): Promise<boolean> {
    return await this.repository.delete(id);
  }

  /**
   * Check if an entity exists by its ID
   * @param id - The unique identifier to check
   * @returns A promise that resolves to true if the entity exists, false otherwise
   */
  async exists(id: ID): Promise<boolean> {
    return await this.repository.exists(id);
  }
}