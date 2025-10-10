import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { JWT_CONFIG } from '../config';

const prisma = new PrismaClient();

const ACCESS_SECRET = JWT_CONFIG.ACCESS_SECRET;
const REFRESH_TTL_DAYS = JWT_CONFIG.REFRESH_TTL_DAYS;

export type JwtPayload = { 
    sub: string, 
    email: string,
    role: string
};

/**
 * Signs a JWT access token with the provided payload
 * @param payload - The JWT payload containing user information
 * @returns The signed JWT access token
 */
export function signAccessToken(payload: JwtPayload) {
    return jwt.sign(payload, ACCESS_SECRET);
};

/**
 * Verifies a JWT access token
 * @param token - The JWT token to verify
 * @returns The decoded JWT payload
 */
export function verifyAccessToken(token: string) {
    return jwt.verify(token, ACCESS_SECRET) as JwtPayload & jwt.JwtPayload;
};

/**
 * Generates a cryptographically secure random refresh token
 * @returns A random hex string to be used as a refresh token
 */
export function generateRefreshToken() {
    return crypto.randomBytes(48).toString('hex');
};

/**
 * Issues a new refresh token for a user and stores it in the database
 * @param userId - The ID of the user for whom to issue the token
 * @param rawToken - The raw refresh token to hash and store
 * @returns A promise that resolves to the created refresh token record
 */
export async function issueRefreshToken(userId: string, rawToken: string) {
    const hashed = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);

    return prisma.refreshToken.create({
        data: {
            user_id: userId, 
            hashedtoken: hashed, 
            expiresat: expiresAt
        }
    });
};

/**
 * Validates a refresh token for a user
 * @param userId - The ID of the user whose token to validate
 * @param rawToken - The raw refresh token to validate
 * @returns A promise that resolves to the valid refresh token record or null if invalid
 */
export async function validateRefreshtoken(userId: string, rawToken: string) {
    const tokens = await prisma.refreshToken.findMany({
        where: {
            user_id: userId,
            revokedat: null,
            expiresat: { gt: new Date() }
        }
    });

    for (const t of tokens) {
        const ok = await bcrypt.compare(rawToken, t.hashedtoken);
        if (ok) return t;
    }

    return null;
}