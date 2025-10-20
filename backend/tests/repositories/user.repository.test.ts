import { UserRepositoryImpl } from '../../src/repositories/UserRepositoryImpl';
import { PrismaClient } from '@prisma/client';
import { EntityNotFoundError, RepositoryError } from '../../src/errors/RepositoryError';

// Mock PrismaClient
const mockPrismaClient = {
  users: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
    upsert: jest.fn(),
    count: jest.fn()
  }
};

// Mock the PrismaClient constructor
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

describe('UserRepositoryImpl', () => {
  let userRepository: UserRepositoryImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepositoryImpl();
  });

  const mockUser = {
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

  describe('findById', () => {
    it('should find a user by ID', async () => {
      mockPrismaClient.users.findUnique.mockResolvedValue(mockUser);

      const result = await userRepository.findById('user-123');

      expect(mockPrismaClient.users.findUnique).toHaveBeenCalledWith({ where: { id: 'user-123' } });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      mockPrismaClient.users.findUnique.mockResolvedValue(null);

      const result = await userRepository.findById('non-existent-id');

      expect(mockPrismaClient.users.findUnique).toHaveBeenCalledWith({ where: { id: 'non-existent-id' } });
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all users', async () => {
      const mockUsers = [mockUser, { ...mockUser, id: 'user-456' }];
      mockPrismaClient.users.findMany.mockResolvedValue(mockUsers);

      const result = await userRepository.findAll();

      expect(mockPrismaClient.users.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(mockUsers);
    });

    it('should return an empty array when no users exist', async () => {
      mockPrismaClient.users.findMany.mockResolvedValue([]);

      const result = await userRepository.findAll();

      expect(mockPrismaClient.users.findMany).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'hashedPassword456',
        first_name: 'New',
        last_name: 'User',
        street: 'New Street',
        house_number: '456',
        postal_code: '67890',
        city: 'New City',
        role: 'USER'
      };

      mockPrismaClient.users.create.mockResolvedValue({ ...mockUser, ...userData, id: 'user-789' });

      const result = await userRepository.create(userData);

      expect(mockPrismaClient.users.create).toHaveBeenCalledWith({
        data: {
          ...userData,
          postal_code: '67890'
        }
      });
      expect(result).toEqual({ ...mockUser, ...userData, id: 'user-789' });
    });

    it('should normalize postal code when creating a user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'hashedPassword456',
        first_name: 'New',
        last_name: 'User',
        street: 'New Street',
        house_number: '456',
        postal_code: '67 890',
        city: 'New City',
        role: 'USER'
      };

      const expectedUserData = {
        ...userData,
        postal_code: '67890'
      };

      mockPrismaClient.users.create.mockResolvedValue({ ...mockUser, ...expectedUserData, id: 'user-789' });

      const result = await userRepository.create(userData);

      expect(mockPrismaClient.users.create).toHaveBeenCalledWith({
        data: expectedUserData
      });
      expect(result).toEqual({ ...mockUser, ...expectedUserData, id: 'user-789' });
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      const updateData = { first_name: 'Updated' };
      const updatedUser = { ...mockUser, ...updateData };

      mockPrismaClient.users.update.mockResolvedValue(updatedUser);

      const result = await userRepository.update('user-123', updateData);

      expect(mockPrismaClient.users.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: updateData
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw EntityNotFoundError when user does not exist', async () => {
      const updateData = { first_name: 'Updated' };

      mockPrismaClient.users.update.mockRejectedValue({ code: 'P2025' });

      await expect(userRepository.update('non-existent-id', updateData))
        .rejects
        .toThrow(EntityNotFoundError);
    });

    it('should throw RepositoryError for other update errors', async () => {
      const updateData = { first_name: 'Updated' };

      mockPrismaClient.users.update.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.update('user-123', updateData))
        .rejects
        .toThrow(RepositoryError);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      mockPrismaClient.users.delete.mockResolvedValue(undefined);

      const result = await userRepository.delete('user-123');

      expect(mockPrismaClient.users.delete).toHaveBeenCalledWith({ where: { id: 'user-123' } });
      expect(result).toBe(true);
    });

    it('should throw EntityNotFoundError when user does not exist', async () => {
      mockPrismaClient.users.delete.mockRejectedValue({ code: 'P2025' });

      await expect(userRepository.delete('non-existent-id'))
        .rejects
        .toThrow(EntityNotFoundError);
    });

    it('should throw RepositoryError for other delete errors', async () => {
      mockPrismaClient.users.delete.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.delete('user-123'))
        .rejects
        .toThrow(RepositoryError);
    });
  });

  describe('exists', () => {
    it('should return true when user exists', async () => {
      mockPrismaClient.users.findUnique.mockResolvedValue(mockUser);

      const result = await userRepository.exists('user-123');

      expect(mockPrismaClient.users.findUnique).toHaveBeenCalledWith({ where: { id: 'user-123' } });
      expect(result).toBe(true);
    });

    it('should return false when user does not exist', async () => {
      mockPrismaClient.users.findUnique.mockResolvedValue(null);

      const result = await userRepository.exists('non-existent-id');

      expect(mockPrismaClient.users.findUnique).toHaveBeenCalledWith({ where: { id: 'non-existent-id' } });
      expect(result).toBe(false);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      mockPrismaClient.users.findFirst.mockResolvedValue(mockUser);

      const result = await userRepository.findByEmail('test@example.com');

      expect(mockPrismaClient.users.findFirst).toHaveBeenCalledWith({
        where: {
          email: {
            equals: 'test@example.com',
            mode: 'insensitive'
          }
        }
      });
      expect(result).toEqual(mockUser);
    });

    it('should normalize email when searching', async () => {
      mockPrismaClient.users.findFirst.mockResolvedValue(mockUser);

      const result = await userRepository.findByEmail('  TEST@EXAMPLE.COM  ');

      expect(mockPrismaClient.users.findFirst).toHaveBeenCalledWith({
        where: {
          email: {
            equals: 'test@example.com',
            mode: 'insensitive'
          }
        }
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user with email is not found', async () => {
      mockPrismaClient.users.findFirst.mockResolvedValue(null);

      const result = await userRepository.findByEmail('nonexistent@example.com');

      expect(mockPrismaClient.users.findFirst).toHaveBeenCalledWith({
        where: {
          email: {
            equals: 'nonexistent@example.com',
            mode: 'insensitive'
          }
        }
      });
      expect(result).toBeNull();
    });
  });

  describe('findByRole', () => {
    it('should find users by role', async () => {
      const mockUsers = [mockUser, { ...mockUser, id: 'user-456' }];
      mockPrismaClient.users.findMany.mockResolvedValue(mockUsers);

      const result = await userRepository.findByRole('USER');

      expect(mockPrismaClient.users.findMany).toHaveBeenCalledWith({ where: { role: 'USER' } });
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOrCreate', () => {
    it('should find or create a user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedPassword123',
        first_name: 'Test',
        last_name: 'User',
        street: 'Test Street',
        house_number: '123',
        postal_code: '12345',
        city: 'Test City',
        role: 'USER'
      };

      mockPrismaClient.users.upsert.mockResolvedValue(mockUser);

      const result = await userRepository.findOrCreate(userData);

      expect(mockPrismaClient.users.upsert).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        update: {},
        create: {
          email: 'test@example.com',
          password: 'hashedPassword123',
          first_name: 'Test',
          last_name: 'User',
          street: 'Test Street',
          house_number: '123',
          postal_code: '12345',
          city: 'Test City',
          role: 'USER'
        }
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'hashedPassword456',
        first_name: 'New',
        last_name: 'User',
        street: 'New Street',
        house_number: '456',
        postal_code: '67890',
        city: 'New City'
      };

      const expectedUserData = {
        email: 'newuser@example.com',
        password: 'hashedPassword456',
        first_name: 'New',
        last_name: 'User',
        street: 'New Street',
        house_number: '456',
        postal_code: '67890',
        city: 'New City',
        role: 'USER'
      };

      mockPrismaClient.users.upsert.mockResolvedValue({ ...mockUser, ...expectedUserData, id: 'user-789' });

      const result = await userRepository.registerUser(
        userData.email,
        userData.password,
        userData.first_name,
        userData.last_name,
        userData.street,
        userData.house_number,
        userData.postal_code,
        userData.city
      );

      expect(mockPrismaClient.users.upsert).toHaveBeenCalledWith({
        where: { email: 'newuser@example.com' },
        update: {},
        create: expectedUserData
      });
      expect(result).toEqual({ ...mockUser, ...expectedUserData, id: 'user-789' });
    });
  });
});