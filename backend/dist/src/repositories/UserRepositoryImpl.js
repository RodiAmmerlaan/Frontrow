"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepositoryImpl = void 0;
const BaseRepositoryImpl_1 = require("./BaseRepositoryImpl");
const RepositoryError_1 = require("../errors/RepositoryError");
class UserRepositoryImpl extends BaseRepositoryImpl_1.BaseRepositoryImpl {
    /**
     * Find a user by their ID
     * @param id - The unique identifier of the user
     * @returns A promise that resolves to the user or null if not found
     */
    async findById(id) {
        return await this.prisma.users.findUnique({ where: { id } });
    }
    /**
     * Find all users
     * @returns A promise that resolves to an array of all users
     */
    async findAll() {
        return await this.prisma.users.findMany();
    }
    /**
     * Create a new user
     * @param userData - The user data to create
     * @returns A promise that resolves to the created user
     */
    async create(userData) {
        return await this.prisma.users.create({
            data: {
                ...userData,
                postal_code: userData.postal_code ? userData.postal_code.replace(/\s+/g, '') : null
            }
        });
    }
    /**
     * Update an existing user
     * @param id - The unique identifier of the user to update
     * @param userData - The updated user data
     * @returns A promise that resolves to the updated user or null if not found
     */
    async update(id, userData) {
        try {
            return await this.prisma.users.update({
                where: { id },
                data: userData
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new RepositoryError_1.EntityNotFoundError(`User with ID ${id} not found`);
            }
            throw new RepositoryError_1.RepositoryError(`Failed to update user with ID ${id}: ${error.message}`);
        }
    }
    /**
     * Delete a user by their ID
     * @param id - The unique identifier of the user to delete
     * @returns A promise that resolves to true if deletion was successful, false otherwise
     */
    async delete(id) {
        try {
            await this.prisma.users.delete({ where: { id } });
            return true;
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new RepositoryError_1.EntityNotFoundError(`User with ID ${id} not found`);
            }
            throw new RepositoryError_1.RepositoryError(`Failed to delete user with ID ${id}: ${error.message}`);
        }
    }
    /**
     * Check if a user exists by their ID
     * @param id - The unique identifier to check
     * @returns A promise that resolves to true if the user exists, false otherwise
     */
    async exists(id) {
        const user = await this.prisma.users.findUnique({ where: { id } });
        return !!user;
    }
    /**
     * Find a user by their email address
     * @param email - The email address of the user to find
     * @returns A promise that resolves to the user or null if not found
     */
    async findByEmail(email) {
        const normalizedEmail = email.toLowerCase().trim();
        return await this.prisma.users.findFirst({
            where: {
                email: {
                    equals: normalizedEmail,
                    mode: 'insensitive'
                }
            }
        });
    }
    /**
     * Find users by their role
     * @param role - The role to filter users by
     * @returns A promise that resolves to an array of users with the specified role
     */
    async findByRole(role) {
        return await this.prisma.users.findMany({ where: { role } });
    }
    /**
     * Find or create a user (upsert)
     * @param userData - The user data to find or create
     * @returns A promise that resolves to the found or created user
     */
    async findOrCreate(userData) {
        return await this.prisma.users.upsert({
            where: { email: userData.email },
            update: {},
            create: {
                email: userData.email,
                password: userData.password,
                first_name: userData.first_name || null,
                last_name: userData.last_name || null,
                street: userData.street || null,
                house_number: userData.house_number || null,
                postal_code: userData.postal_code ? userData.postal_code.replace(/\s+/g, '') : null,
                city: userData.city || null,
                role: userData.role || 'USER'
            }
        });
    }
    /**
     * Registers a new user in the database
     * @param email - The user's email address
     * @param password - The hashed password
     * @param first_name - The user's first name
     * @param last_name - The user's last name
     * @param street - The user's street address
     * @param house_number - The user's house number
     * @param postal_code - The user's postal code
     * @param city - The user's city
     * @returns A promise that resolves to the created or updated user
     */
    async registerUser(email, password, first_name, last_name, street, house_number, postal_code, city) {
        return await this.findOrCreate({
            email: email,
            password: password,
            first_name: first_name,
            last_name: last_name,
            street: street,
            house_number: house_number,
            postal_code: postal_code,
            city: city,
            role: 'USER'
        });
    }
}
exports.UserRepositoryImpl = UserRepositoryImpl;
//# sourceMappingURL=UserRepositoryImpl.js.map