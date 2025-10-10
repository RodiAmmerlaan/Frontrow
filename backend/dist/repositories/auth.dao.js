"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserById = findUserById;
const UserRepositoryImpl_1 = require("./UserRepositoryImpl");
const userRepository = new UserRepositoryImpl_1.UserRepositoryImpl();
/**
 * Find a user by their ID
 * @param id - The unique identifier of the user
 * @returns A promise that resolves to the user or null if not found
 */
async function findUserById(id) {
    return await userRepository.findById(id);
}
//# sourceMappingURL=auth.dao.js.map