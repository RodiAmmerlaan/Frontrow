"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.verifyAccessToken = verifyAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.issueRefreshToken = issueRefreshToken;
exports.validateRefreshtoken = validateRefreshtoken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_TTL_DAYS = Number(process.env.REFRESH_TTL_DAYS || 30);
/**
 * Signs a JWT access token with the provided payload
 * @param payload - The JWT payload containing user information
 * @returns The signed JWT access token
 */
function signAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, ACCESS_SECRET);
}
;
/**
 * Verifies a JWT access token
 * @param token - The JWT token to verify
 * @returns The decoded JWT payload
 */
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, ACCESS_SECRET);
}
;
/**
 * Generates a cryptographically secure random refresh token
 * @returns A random hex string to be used as a refresh token
 */
function generateRefreshToken() {
    return crypto_1.default.randomBytes(48).toString('hex');
}
;
/**
 * Issues a new refresh token for a user and stores it in the database
 * @param userId - The ID of the user for whom to issue the token
 * @param rawToken - The raw refresh token to hash and store
 * @returns A promise that resolves to the created refresh token record
 */
async function issueRefreshToken(userId, rawToken) {
    const hashed = await bcrypt_1.default.hash(rawToken, 10);
    const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
    return prisma.refreshToken.create({
        data: {
            user_id: userId,
            hashedtoken: hashed,
            expiresat: expiresAt
        }
    });
}
;
/**
 * Validates a refresh token for a user
 * @param userId - The ID of the user whose token to validate
 * @param rawToken - The raw refresh token to validate
 * @returns A promise that resolves to the valid refresh token record or null if invalid
 */
async function validateRefreshtoken(userId, rawToken) {
    const tokens = await prisma.refreshToken.findMany({
        where: {
            user_id: userId,
            revokedat: null,
            expiresat: { gt: new Date() }
        }
    });
    for (const t of tokens) {
        const ok = await bcrypt_1.default.compare(rawToken, t.hashedtoken);
        if (ok)
            return t;
    }
    return null;
}
//# sourceMappingURL=token.service.js.map