"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenRepositoryImpl = void 0;
const BaseRepositoryImpl_1 = require("./BaseRepositoryImpl");
class RefreshTokenRepositoryImpl extends BaseRepositoryImpl_1.BaseRepositoryImpl {
    /**
     * Find a refresh token by its ID
     * @param id - The unique identifier of the refresh token
     * @returns A promise that resolves to the refresh token or null if not found
     */
    async findById(id) {
        return await this.prisma.refreshToken.findUnique({ where: { id } });
    }
    /**
     * Find all refresh tokens
     * @returns A promise that resolves to an array of all refresh tokens
     */
    async findAll() {
        return await this.prisma.refreshToken.findMany();
    }
    /**
     * Create a new refresh token
     * @param refreshTokenData - The refresh token data to create
     * @returns A promise that resolves to the created refresh token
     */
    async create(refreshTokenData) {
        return await this.prisma.refreshToken.create({ data: refreshTokenData });
    }
    /**
     * Update an existing refresh token
     * @param id - The unique identifier of the refresh token to update
     * @param refreshTokenData - The updated refresh token data
     * @returns A promise that resolves to the updated refresh token or null if not found
     */
    async update(id, refreshTokenData) {
        try {
            return await this.prisma.refreshToken.update({
                where: { id },
                data: refreshTokenData
            });
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Delete a refresh token by its ID
     * @param id - The unique identifier of the refresh token to delete
     * @returns A promise that resolves to true if deletion was successful, false otherwise
     */
    async delete(id) {
        try {
            await this.prisma.refreshToken.delete({ where: { id } });
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Check if a refresh token exists by its ID
     * @param id - The unique identifier to check
     * @returns A promise that resolves to true if the refresh token exists, false otherwise
     */
    async exists(id) {
        const refreshToken = await this.prisma.refreshToken.findUnique({ where: { id } });
        return !!refreshToken;
    }
    /**
     * Find all valid (non-revoked) refresh tokens
     * @returns A promise that resolves to an array of valid refresh tokens
     */
    async findValidTokens() {
        return await this.prisma.refreshToken.findMany({ where: { revokedat: null } });
    }
    /**
     * Find refresh tokens by user ID
     * @param userId - The ID of the user
     * @returns A promise that resolves to an array of refresh tokens for the user
     */
    async findByUserId(userId) {
        return await this.prisma.refreshToken.findMany({
            where: { user_id: userId },
            orderBy: { createdat: 'asc' }
        });
    }
    /**
     * Revoke a refresh token by setting its revoked timestamp
     * @param id - The ID of the refresh token to revoke
     * @returns A promise that resolves to the updated refresh token
     */
    async revokeToken(id) {
        try {
            return await this.prisma.refreshToken.update({
                where: { id },
                data: { revokedat: new Date() }
            });
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Retrieves all valid (non-revoked) refresh tokens
     * @returns A promise that resolves to an array of valid refresh tokens
     */
    async getRefreshTokens() {
        return await this.findValidTokens();
    }
}
exports.RefreshTokenRepositoryImpl = RefreshTokenRepositoryImpl;
//# sourceMappingURL=RefreshTokenRepositoryImpl.js.map