"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = findUserByEmail;
exports.findUserById = findUserById;
exports.getRefreshTokens = getRefreshTokens;
exports.registerUser = registerUser;
const UserRepositoryImpl_1 = require("../../repositories/UserRepositoryImpl");
const RefreshTokenRepositoryImpl_1 = require("../../repositories/RefreshTokenRepositoryImpl");
const userRepository = new UserRepositoryImpl_1.UserRepositoryImpl();
const refreshTokenRepository = new RefreshTokenRepositoryImpl_1.RefreshTokenRepositoryImpl();
/**
 * Finds a user by their email address
 * @param email - The email address of the user to find
 * @returns A promise that resolves to the user object or null if not found
 */
async function findUserByEmail(email) {
    return await userRepository.findByEmail(email);
}
;
/**
 * Finds a user by their unique ID
 * @param id - The unique identifier of the user
 * @returns A promise that resolves to the user object or null if not found
 */
async function findUserById(id) {
    return await userRepository.findById(id);
}
;
/**
 * Retrieves all valid (non-revoked) refresh tokens
 * @returns A promise that resolves to an array of valid refresh tokens
 */
async function getRefreshTokens() {
    return await refreshTokenRepository.findValidTokens();
}
;
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
async function registerUser(email, password, first_name, last_name, street, house_number, postal_code, city) {
    return await userRepository.findOrCreate({
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
//# sourceMappingURL=auth.dao.js.map