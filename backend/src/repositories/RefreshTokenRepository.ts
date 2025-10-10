import { RefreshToken } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";

export interface RefreshTokenRepository extends BaseRepository<RefreshToken, number> {
  /**
   * Find all valid (non-revoked) refresh tokens
   * @returns A promise that resolves to an array of valid refresh tokens
   */
  findValidTokens(): Promise<RefreshToken[]>;

  /**
   * Find refresh tokens by user ID
   * @param userId - The ID of the user
   * @returns A promise that resolves to an array of refresh tokens for the user
   */
  findByUserId(userId: string): Promise<RefreshToken[]>;

  /**
   * Revoke a refresh token by setting its revoked timestamp
   * @param id - The ID of the refresh token to revoke
   * @returns A promise that resolves to the updated refresh token
   */
  revokeToken(id: number): Promise<RefreshToken | null>;
}