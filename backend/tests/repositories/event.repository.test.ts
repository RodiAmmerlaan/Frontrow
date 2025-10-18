import { EventRepositoryImpl } from '../../src/repositories/EventRepositoryImpl';
import { PrismaClient } from '@prisma/client';
import { EntityNotFoundError, RepositoryError } from '../../src/errors/RepositoryError';

// Mock PrismaClient
const mockPrismaClient = {
  events: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn()
  }
};

// Mock the PrismaClient constructor
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

describe('EventRepositoryImpl', () => {
  let eventRepository: EventRepositoryImpl;
  let prismaClient: PrismaClient;

  beforeEach(() => {
    jest.clearAllMocks();
    // Create repository without passing prisma client since it's created in the constructor
    eventRepository = new EventRepositoryImpl();
  });

  const mockEvent = {
    id: 'event-123',
    title: 'Test Event',
    description: 'Test Description',
    start_time: new Date(),
    end_time: new Date(),
    created_at: new Date(),
    created_by: null
  };

  describe('findById', () => {
    it('should find an event by ID', async () => {
      mockPrismaClient.events.findUnique.mockResolvedValue(mockEvent);

      const result = await eventRepository.findById('event-123');

      expect(mockPrismaClient.events.findUnique).toHaveBeenCalledWith({ where: { id: 'event-123' } });
      expect(result).toEqual(mockEvent);
    });

    it('should return null when event is not found', async () => {
      mockPrismaClient.events.findUnique.mockResolvedValue(null);

      const result = await eventRepository.findById('non-existent-id');

      expect(mockPrismaClient.events.findUnique).toHaveBeenCalledWith({ where: { id: 'non-existent-id' } });
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all events', async () => {
      const mockEvents = [mockEvent, { ...mockEvent, id: 'event-456' }];
      mockPrismaClient.events.findMany.mockResolvedValue(mockEvents);

      const result = await eventRepository.findAll();

      expect(mockPrismaClient.events.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(mockEvents);
    });

    it('should return an empty array when no events exist', async () => {
      mockPrismaClient.events.findMany.mockResolvedValue([]);

      const result = await eventRepository.findAll();

      expect(mockPrismaClient.events.findMany).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new event', async () => {
      const eventData = {
        title: 'New Event',
        description: 'New Description',
        start_time: new Date(),
        end_time: new Date(),
        created_by: null
      };

      mockPrismaClient.events.create.mockResolvedValue(mockEvent);

      const result = await eventRepository.create(eventData);

      expect(mockPrismaClient.events.create).toHaveBeenCalledWith({ data: eventData });
      expect(result).toEqual(mockEvent);
    });
  });

  describe('update', () => {
    it('should update an existing event', async () => {
      const updateData = { title: 'Updated Event' };
      const updatedEvent = { ...mockEvent, ...updateData };
      
      mockPrismaClient.events.update.mockResolvedValue(updatedEvent);

      const result = await eventRepository.update('event-123', updateData);

      expect(mockPrismaClient.events.update).toHaveBeenCalledWith({
        where: { id: 'event-123' },
        data: updateData
      });
      expect(result).toEqual(updatedEvent);
    });

    it('should throw EntityNotFoundError when event does not exist', async () => {
      const updateData = { title: 'Updated Event' };
      
      mockPrismaClient.events.update.mockRejectedValue({ code: 'P2025' });

      await expect(eventRepository.update('non-existent-id', updateData))
        .rejects
        .toThrow(EntityNotFoundError);
    });

    it('should throw RepositoryError for other update errors', async () => {
      const updateData = { title: 'Updated Event' };
      
      mockPrismaClient.events.update.mockRejectedValue(new Error('Database error'));

      await expect(eventRepository.update('event-123', updateData))
        .rejects
        .toThrow(RepositoryError);
    });
  });

  describe('delete', () => {
    it('should delete an event', async () => {
      mockPrismaClient.events.delete.mockResolvedValue(undefined);

      const result = await eventRepository.delete('event-123');

      expect(mockPrismaClient.events.delete).toHaveBeenCalledWith({ where: { id: 'event-123' } });
      expect(result).toBe(true);
    });

    it('should throw EntityNotFoundError when event does not exist', async () => {
      mockPrismaClient.events.delete.mockRejectedValue({ code: 'P2025' });

      await expect(eventRepository.delete('non-existent-id'))
        .rejects
        .toThrow(EntityNotFoundError);
    });

    it('should throw RepositoryError for other delete errors', async () => {
      mockPrismaClient.events.delete.mockRejectedValue(new Error('Database error'));

      await expect(eventRepository.delete('event-123'))
        .rejects
        .toThrow(RepositoryError);
    });
  });

  describe('exists', () => {
    it('should return true when event exists', async () => {
      mockPrismaClient.events.findUnique.mockResolvedValue(mockEvent);

      const result = await eventRepository.exists('event-123');

      expect(mockPrismaClient.events.findUnique).toHaveBeenCalledWith({ where: { id: 'event-123' } });
      expect(result).toBe(true);
    });

    it('should return false when event does not exist', async () => {
      mockPrismaClient.events.findUnique.mockResolvedValue(null);

      const result = await eventRepository.exists('non-existent-id');

      expect(mockPrismaClient.events.findUnique).toHaveBeenCalledWith({ where: { id: 'non-existent-id' } });
      expect(result).toBe(false);
    });
  });

  describe('findByTitle', () => {
    it('should find an event by title', async () => {
      mockPrismaClient.events.findFirst.mockResolvedValue(mockEvent);

      const result = await eventRepository.findByTitle('Test Event');

      expect(mockPrismaClient.events.findFirst).toHaveBeenCalledWith({ where: { title: 'Test Event' } });
      expect(result).toEqual(mockEvent);
    });

    it('should return null when event with title is not found', async () => {
      mockPrismaClient.events.findFirst.mockResolvedValue(null);

      const result = await eventRepository.findByTitle('Non-existent Event');

      expect(mockPrismaClient.events.findFirst).toHaveBeenCalledWith({ where: { title: 'Non-existent Event' } });
      expect(result).toBeNull();
    });
  });

  describe('searchByName', () => {
    it('should search events by name', async () => {
      const mockEvents = [mockEvent, { ...mockEvent, id: 'event-456' }];
      mockPrismaClient.events.findMany.mockResolvedValue(mockEvents);

      const result = await eventRepository.searchByName('Test');

      expect(mockPrismaClient.events.findMany).toHaveBeenCalledWith({
        where: {
          title: {
            contains: 'TEST',
            mode: 'insensitive'
          }
        },
        orderBy: {
          start_time: 'asc'
        }
      });
      expect(result).toEqual(mockEvents);
    });
  });

  describe('findAllByDate', () => {
    it('should find all events ordered by date', async () => {
      const mockEvents = [mockEvent];
      mockPrismaClient.events.findMany.mockResolvedValue(mockEvents);

      const result = await eventRepository.findAllByDate();

      expect(mockPrismaClient.events.findMany).toHaveBeenCalledWith({
        where: {
          start_time: {
            gte: expect.any(Date)
          }
        },
        orderBy: {
          start_time: 'asc'
        }
      });
      expect(result).toEqual(mockEvents);
    });
  });

  describe('findByDateRange', () => {
    it('should find events within a date range', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      const mockEvents = [mockEvent];
      mockPrismaClient.events.findMany.mockResolvedValue(mockEvents);

      const result = await eventRepository.findByDateRange(startDate, endDate);

      expect(mockPrismaClient.events.findMany).toHaveBeenCalledWith({
        where: {
          start_time: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          start_time: 'asc'
        }
      });
      expect(result).toEqual(mockEvents);
    });
  });
});