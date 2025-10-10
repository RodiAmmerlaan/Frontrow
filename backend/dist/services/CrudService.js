"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrudService = void 0;
/**
 * Generic CRUD service base class that provides common CRUD operations
 * This class should be extended by specific service classes to provide
 * type-safe CRUD operations for specific entities
 */
class CrudService {
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * Find an entity by its ID
     * @param id - The unique identifier of the entity
     * @returns A promise that resolves to the entity or null if not found
     */
    async findById(id) {
        return await this.repository.findById(id);
    }
    /**
     * Find all entities
     * @returns A promise that resolves to an array of all entities
     */
    async findAll() {
        return await this.repository.findAll();
    }
    /**
     * Create a new entity
     * @param entity - The entity data to create
     * @returns A promise that resolves to the created entity
     */
    async create(entity) {
        return await this.repository.create(entity);
    }
    /**
     * Update an existing entity
     * @param id - The unique identifier of the entity to update
     * @param entity - The updated entity data
     * @returns A promise that resolves to the updated entity or null if not found
     */
    async update(id, entity) {
        return await this.repository.update(id, entity);
    }
    /**
     * Delete an entity by its ID
     * @param id - The unique identifier of the entity to delete
     * @returns A promise that resolves to true if deletion was successful, false otherwise
     */
    async delete(id) {
        return await this.repository.delete(id);
    }
    /**
     * Check if an entity exists by its ID
     * @param id - The unique identifier to check
     * @returns A promise that resolves to true if the entity exists, false otherwise
     */
    async exists(id) {
        return await this.repository.exists(id);
    }
}
exports.CrudService = CrudService;
//# sourceMappingURL=CrudService.js.map