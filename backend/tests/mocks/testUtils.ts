export const mockUser = {
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

export const mockAccessToken = 'mock-access-token';
export const mockRefreshToken = 'mock-refresh-token-hashed';

export const mockRefreshTokenRecord = {
  id: 1n,
  user_id: 'user-123',
  hashedtoken: mockRefreshToken,
  createdat: new Date(),
  expiresat: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  revokedat: null
};