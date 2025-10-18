"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockRefreshTokenRecord = exports.mockRefreshToken = exports.mockAccessToken = exports.mockUser = void 0;
exports.mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedPassword123',
    first_name: 'Test',
    last_name: 'User',
    street: 'Test Street',
    house_number: '123',
    postal_code: '12345',
    city: 'Test City',
    role: 'USER',
    created_at: new Date(),
    updated_at: new Date()
};
exports.mockAccessToken = 'mock-access-token';
exports.mockRefreshToken = 'mock-refresh-token-hashed';
exports.mockRefreshTokenRecord = {
    id: 1n,
    user_id: 'user-123',
    hashedtoken: exports.mockRefreshToken,
    createdat: new Date(),
    expiresat: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    revokedat: null
};
//# sourceMappingURL=testUtils.js.map