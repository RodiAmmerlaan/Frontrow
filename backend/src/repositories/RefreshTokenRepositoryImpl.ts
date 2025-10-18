import { RefreshToken } from "@prisma/client";
import { BaseRepositoryImpl } from "./BaseRepositoryImpl";
import { RefreshTokenRepository } from "./RefreshTokenRepository";

export class RefreshTokenRepositoryImpl extends BaseRepositoryImpl<RefreshToken, number> implements RefreshTokenRepository {
  /**
   * Find a refresh token by its ID
   * @param id - The unique identifier of the refresh token
   * @returns A promise that resolves to the refresh token or null if not found
   */
  async findById(id: number): Promise<RefreshToken | null> {
    return await this.prisma.refreshToken.findUnique({ where: { id } });
  }

  /**
   * Find all refresh tokens
   * @returns A promise that resolves to an array of all refresh tokens
   */
  async findAll(): Promise<RefreshToken[]> {
    return await this.prisma.refreshToken.findMany();
  }

  /**
   * Create a new refresh token
   * @param refreshTokenData - The refresh token data to create
   * @returns A promise that resolves to the created refresh token
   */
  async create(refreshTokenData: Omit<RefreshToken, 'id' | 'createdat' | 'expiresat' | 'revokedat'>): Promise<RefreshToken> {
    return await this.prisma.refreshToken.create({ data: refreshTokenData });
  }

  /**
   * Update an existing refresh token
   * @param id - The unique identifier of the refresh token to update
   * @param refreshTokenData - The updated refresh token data
   * @returns A promise that resolves to the updated refresh token or null if not found
   */
  async update(id: number, refreshTokenData: Partial<RefreshToken>): Promise<RefreshToken | null> {
    try {
      return await this.prisma.refreshToken.update({
        where: { id },
        data: refreshTokenData
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Delete a refresh token by its ID
   * @param id - The unique identifier of the refresh token to delete
   * @returns A promise that resolves to true if deletion was successful, false otherwise
   */
  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.refreshToken.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if a refresh token exists by its ID
   * @param id - The unique identifier to check
   * @returns A promise that resolves to true if the refresh token exists, false otherwise
   */
  async exists(id: number): Promise<boolean> {
    const refreshToken = await this.prisma.refreshToken.findUnique({ where: { id } });
    return !!refreshToken;
  }

  /**
   * Find all valid (non-revoked) refresh tokens
   * @returns A promise that resolves to an array of valid refresh tokens
   */
  async findValidTokens(): Promise<RefreshToken[]> {
    return await this.prisma.refreshToken.findMany({ where: { revokedat: null } });
  }

  /**
   * Find refresh tokens by user ID
   * @param userId - The ID of the user
   * @returns A promise that resolves to an array of refresh tokens for the user
   */
  async findByUserId(userId: string): Promise<RefreshToken[]> {
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
  async revokeToken(id: number): Promise<RefreshToken | null> {
    try {
      return await this.prisma.refreshToken.update({
        where: { id },
        data: { revokedat: new Date() }
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Retrieves all valid (non-revoked) refresh tokens
   * @returns A promise that resolves to an array of valid refresh tokens
   */
  async getRefreshTokens(): Promise<RefreshToken[]> {
    return await this.findValidTokens();
  }
}