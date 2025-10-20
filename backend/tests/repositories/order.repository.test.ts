import { OrderRepositoryImpl } from '../../src/repositories/OrderRepositoryImpl';
import { PrismaClient } from '@prisma/client';
import { EntityNotFoundError, RepositoryError } from '../../src/errors/RepositoryError';

// Mock PrismaClient
const mockPrismaClient = {
  orders: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
};

// Mock the PrismaClient constructor
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

describe('OrderRepositoryImpl', () => {
  let orderRepository: OrderRepositoryImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    orderRepository = new OrderRepositoryImpl();
  });

  const mockOrder = {
    id: 'order-123',
    user_id: 'user-456',
    event_id: 'event-789',
    total_amount: 2,
    created_at: new Date()
  };

  describe('findById', () => {
    it('should find an order by ID', async () => {
      mockPrismaClient.orders.findUnique.mockResolvedValue(mockOrder);

      const result = await orderRepository.findById('order-123');

      expect(mockPrismaClient.orders.findUnique).toHaveBeenCalledWith({ where: { id: 'order-123' } });
      expect(result).toEqual(mockOrder);
    });

    it('should return null when order is not found', async () => {
      mockPrismaClient.orders.findUnique.mockResolvedValue(null);

      const result = await orderRepository.findById('non-existent-id');

      expect(mockPrismaClient.orders.findUnique).toHaveBeenCalledWith({ where: { id: 'non-existent-id' } });
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all orders', async () => {
      const mockOrders = [mockOrder, { ...mockOrder, id: 'order-456' }];
      mockPrismaClient.orders.findMany.mockResolvedValue(mockOrders);

      const result = await orderRepository.findAll();

      expect(mockPrismaClient.orders.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(mockOrders);
    });

    it('should return an empty array when no orders exist', async () => {
      mockPrismaClient.orders.findMany.mockResolvedValue([]);

      const result = await orderRepository.findAll();

      expect(mockPrismaClient.orders.findMany).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const orderData = {
        user_id: 'user-456',
        event_id: 'event-789',
        total_amount: 2
      };

      mockPrismaClient.orders.create.mockResolvedValue(mockOrder);

      const result = await orderRepository.create(orderData);

      expect(mockPrismaClient.orders.create).toHaveBeenCalledWith({ data: orderData });
      expect(result).toEqual(mockOrder);
    });
  });

  describe('update', () => {
    it('should update an existing order', async () => {
      const updateData = { total_amount: 3 };
      const updatedOrder = { ...mockOrder, ...updateData };
      
      mockPrismaClient.orders.update.mockResolvedValue(updatedOrder);

      const result = await orderRepository.update('order-123', updateData);

      expect(mockPrismaClient.orders.update).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: updateData
      });
      expect(result).toEqual(updatedOrder);
    });

    it('should throw EntityNotFoundError when order does not exist', async () => {
      const updateData = { total_amount: 3 };
      
      mockPrismaClient.orders.update.mockRejectedValue({ code: 'P2025' });

      await expect(orderRepository.update('non-existent-id', updateData))
        .rejects
        .toThrow(EntityNotFoundError);
    });

    it('should throw RepositoryError for other update errors', async () => {
      const updateData = { total_amount: 3 };
      
      mockPrismaClient.orders.update.mockRejectedValue(new Error('Database error'));

      await expect(orderRepository.update('order-123', updateData))
        .rejects
        .toThrow(RepositoryError);
    });
  });

  describe('delete', () => {
    it('should delete an order', async () => {
      mockPrismaClient.orders.delete.mockResolvedValue(undefined);

      const result = await orderRepository.delete('order-123');

      expect(mockPrismaClient.orders.delete).toHaveBeenCalledWith({ where: { id: 'order-123' } });
      expect(result).toBe(true);
    });

    it('should throw EntityNotFoundError when order does not exist', async () => {
      mockPrismaClient.orders.delete.mockRejectedValue({ code: 'P2025' });

      await expect(orderRepository.delete('non-existent-id'))
        .rejects
        .toThrow(EntityNotFoundError);
    });

    it('should throw RepositoryError for other delete errors', async () => {
      mockPrismaClient.orders.delete.mockRejectedValue(new Error('Database error'));

      await expect(orderRepository.delete('order-123'))
        .rejects
        .toThrow(RepositoryError);
    });
  });

  describe('exists', () => {
    it('should return true when order exists', async () => {
      mockPrismaClient.orders.findUnique.mockResolvedValue(mockOrder);

      const result = await orderRepository.exists('order-123');

      expect(mockPrismaClient.orders.findUnique).toHaveBeenCalledWith({ where: { id: 'order-123' } });
      expect(result).toBe(true);
    });

    it('should return false when order does not exist', async () => {
      mockPrismaClient.orders.findUnique.mockResolvedValue(null);

      const result = await orderRepository.exists('non-existent-id');

      expect(mockPrismaClient.orders.findUnique).toHaveBeenCalledWith({ where: { id: 'non-existent-id' } });
      expect(result).toBe(false);
    });
  });

  describe('findByUserId', () => {
    it('should find orders by user ID', async () => {
      const mockOrders = [mockOrder];
      mockPrismaClient.orders.findMany.mockResolvedValue(mockOrders);

      const result = await orderRepository.findByUserId('user-456');

      expect(mockPrismaClient.orders.findMany).toHaveBeenCalledWith({ where: { user_id: 'user-456' } });
      expect(result).toEqual(mockOrders);
    });
  });

  describe('findByEventId', () => {
    it('should find orders by event ID', async () => {
      const mockOrders = [mockOrder];
      mockPrismaClient.orders.findMany.mockResolvedValue(mockOrders);

      const result = await orderRepository.findByEventId('event-789');

      expect(mockPrismaClient.orders.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { event_id: 'event-789' },
            { created_at: { gte: expect.any(Date) } }
          ]
        }
      });
      expect(result).toEqual(mockOrders);
    });
  });

  describe('findWithDetails', () => {
    it('should find orders with event and user details', async () => {
      const mockOrderWithDetails = {
        ...mockOrder,
        Events: {
          id: 'event-789',
          title: 'Test Event',
          description: 'Test Description',
          start_time: new Date(),
          end_time: new Date()
        },
        Users: {
          id: 'user-456',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User'
        },
        Tickets: []
      };
      
      const mockOrders = [mockOrderWithDetails];
      mockPrismaClient.orders.findMany.mockResolvedValue(mockOrders);

      const result = await orderRepository.findWithDetails();

      expect(mockPrismaClient.orders.findMany).toHaveBeenCalledWith({
        include: {
          Events: {
            select: {
              id: true,
              title: true,
              description: true,
              start_time: true,
              end_time: true
            }
          },
          Users: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true
            }
          },
          Tickets: true
        },
        orderBy: {
          created_at: 'desc'
        }
      });
      expect(result).toEqual(mockOrders);
    });
  });

  describe('buyTickets', () => {
    it('should create a new order for ticket purchase', async () => {
      const orderData = {
        user_id: 'user-456',
        event_id: 'event-789',
        total_amount: 2
      };

      mockPrismaClient.orders.create.mockResolvedValue(mockOrder);

      const result = await orderRepository.buyTickets('event-789', 'user-456', 2);

      expect(mockPrismaClient.orders.create).toHaveBeenCalledWith({ data: orderData });
      expect(result).toEqual(mockOrder);
    });
  });
});