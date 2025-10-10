export interface BaseRepository<T, ID> {
  /**
   * Find an entity by its ID
   * @param id - The unique identifier of the entity
   * @returns A promise that resolves to the entity or null if not found
   */
  findById(id: ID): Promise<T | null>;

  /**
   * Find all entities
   * @returns A promise that resolves to an array of all entities
   */
  findAll(): Promise<T[]>;

  /**
   * Create a new entity
   * @param entity - The entity to create
   * @returns A promise that resolves to the created entity
   */
  create(entity: Omit<T, 'id'>): Promise<T>;

  /**
   * Update an existing entity
   * @param id - The unique identifier of the entity to update
   * @param entity - The updated entity data
   * @returns A promise that resolves to the updated entity
   */
  update(id: ID, entity: Partial<T>): Promise<T | null>;

  /**
   * Delete an entity by its ID
   * @param id - The unique identifier of the entity to delete
   * @returns A promise that resolves to true if deletion was successful, false otherwise
   */
  delete(id: ID): Promise<boolean>;

  /**
   * Check if an entity exists by its ID
   * @param id - The unique identifier to check
   * @returns A promise that resolves to true if the entity exists, false otherwise
   */
  exists(id: ID): Promise<boolean>;
}