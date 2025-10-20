import { TicketBatchRepositoryImpl } from '../../src/repositories/TicketBatchRepositoryImpl';
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient
const mockPrismaClient = {
  ticketBatches: {
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

describe('TicketBatchRepositoryImpl', () => {
  let ticketBatchRepository: TicketBatchRepositoryImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    ticketBatchRepository = new TicketBatchRepositoryImpl();
  });

  const mockTicketBatch = {
    id: 'batch-123',
    event_id: 'event-456',
    total_tickets: 100,
    price: 25.00,
    created_at: new Date()
  };

  describe('findById', () => {
    it('should find a ticket batch by ID', async () => {
      mockPrismaClient.ticketBatches.findUnique.mockResolvedValue(mockTicketBatch);

      const result = await ticketBatchRepository.findById('batch-123');

      expect(mockPrismaClient.ticketBatches.findUnique).toHaveBeenCalledWith({ where: { id: 'batch-123' } });
      expect(result).toEqual(mockTicketBatch);
    });

    it('should return null when ticket batch is not found', async () => {
      mockPrismaClient.ticketBatches.findUnique.mockResolvedValue(null);

      const result = await ticketBatchRepository.findById('non-existent-id');

      expect(mockPrismaClient.ticketBatches.findUnique).toHaveBeenCalledWith({ where: { id: 'non-existent-id' } });
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all ticket batches', async () => {
      const mockTicketBatches = [mockTicketBatch, { ...mockTicketBatch, id: 'batch-456' }];
      mockPrismaClient.ticketBatches.findMany.mockResolvedValue(mockTicketBatches);

      const result = await ticketBatchRepository.findAll();

      expect(mockPrismaClient.ticketBatches.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(mockTicketBatches);
    });

    it('should return an empty array when no ticket batches exist', async () => {
      mockPrismaClient.ticketBatches.findMany.mockResolvedValue([]);

      const result = await ticketBatchRepository.findAll();

      expect(mockPrismaClient.ticketBatches.findMany).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new ticket batch', async () => {
      const ticketBatchData = {
        event_id: 'event-456',
        total_tickets: 100,
        price: 25.00
      };

      mockPrismaClient.ticketBatches.create.mockResolvedValue(mockTicketBatch);

      const result = await ticketBatchRepository.create(ticketBatchData);

      expect(mockPrismaClient.ticketBatches.create).toHaveBeenCalledWith({ data: ticketBatchData });
      expect(result).toEqual(mockTicketBatch);
    });
  });

  describe('update', () => {
    it('should update an existing ticket batch', async () => {
      const updateData = { total_tickets: 150 };
      const updatedTicketBatch = { ...mockTicketBatch, ...updateData };
      
      mockPrismaClient.ticketBatches.update.mockResolvedValue(updatedTicketBatch);

      const result = await ticketBatchRepository.update('batch-123', updateData);

      expect(mockPrismaClient.ticketBatches.update).toHaveBeenCalledWith({
        where: { id: 'batch-123' },
        data: updateData
      });
      expect(result).toEqual(updatedTicketBatch);
    });

    it('should return null for update errors', async () => {
      const updateData = { total_tickets: 150 };
      
      mockPrismaClient.ticketBatches.update.mockRejectedValue(new Error('Database error'));

      const result = await ticketBatchRepository.update('batch-123', updateData);

      expect(mockPrismaClient.ticketBatches.update).toHaveBeenCalledWith({
        where: { id: 'batch-123' },
        data: updateData
      });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a ticket batch', async () => {
      mockPrismaClient.ticketBatches.delete.mockResolvedValue(undefined);

      const result = await ticketBatchRepository.delete('batch-123');

      expect(mockPrismaClient.ticketBatches.delete).toHaveBeenCalledWith({ where: { id: 'batch-123' } });
      expect(result).toBe(true);
    });

    it('should return false for delete errors', async () => {
      mockPrismaClient.ticketBatches.delete.mockRejectedValue(new Error('Database error'));

      const result = await ticketBatchRepository.delete('batch-123');

      expect(mockPrismaClient.ticketBatches.delete).toHaveBeenCalledWith({ where: { id: 'batch-123' } });
      expect(result).toBe(false);
    });
  });

  describe('exists', () => {
    it('should return true when ticket batch exists', async () => {
      mockPrismaClient.ticketBatches.findUnique.mockResolvedValue(mockTicketBatch);

      const result = await ticketBatchRepository.exists('batch-123');

      expect(mockPrismaClient.ticketBatches.findUnique).toHaveBeenCalledWith({ where: { id: 'batch-123' } });
      expect(result).toBe(true);
    });

    it('should return false when ticket batch does not exist', async () => {
      mockPrismaClient.ticketBatches.findUnique.mockResolvedValue(null);

      const result = await ticketBatchRepository.exists('non-existent-id');

      expect(mockPrismaClient.ticketBatches.findUnique).toHaveBeenCalledWith({ where: { id: 'non-existent-id' } });
      expect(result).toBe(false);
    });
  });

  describe('findByEventId', () => {
    it('should find ticket batches by event ID', async () => {
      const mockTicketBatches = [mockTicketBatch];
      mockPrismaClient.ticketBatches.findMany.mockResolvedValue(mockTicketBatches);

      const result = await ticketBatchRepository.findByEventId('event-456');

      expect(mockPrismaClient.ticketBatches.findMany).toHaveBeenCalledWith({ where: { event_id: 'event-456' } });
      expect(result).toEqual(mockTicketBatches);
    });
  });

  describe('findFirstByEventId', () => {
    it('should find the first ticket batch for an event', async () => {
      const mockTicketBatches = [mockTicketBatch];
      mockPrismaClient.ticketBatches.findMany.mockResolvedValue(mockTicketBatches);

      const result = await ticketBatchRepository.findFirstByEventId('event-456');

      expect(mockPrismaClient.ticketBatches.findMany).toHaveBeenCalledWith({ 
        where: { event_id: 'event-456' },
        take: 1
      });
      expect(result).toEqual(mockTicketBatch);
    });

    it('should return null when no ticket batches exist for an event', async () => {
      mockPrismaClient.ticketBatches.findMany.mockResolvedValue([]);

      const result = await ticketBatchRepository.findFirstByEventId('event-456');

      expect(mockPrismaClient.ticketBatches.findMany).toHaveBeenCalledWith({ 
        where: { event_id: 'event-456' },
        take: 1
      });
      expect(result).toBeNull();
    });
  });

  describe('createTicketBatch', () => {
    it('should create a new ticket batch for an event', async () => {
      const ticketBatchData = {
        event_id: 'event-456',
        total_tickets: 100,
        price: 25.00
      };

      mockPrismaClient.ticketBatches.create.mockResolvedValue(mockTicketBatch);

      const result = await ticketBatchRepository.createTicketBatch('event-456', 100, 25.00);

      expect(mockPrismaClient.ticketBatches.create).toHaveBeenCalledWith({ data: ticketBatchData });
      expect(result).toEqual(mockTicketBatch);
    });
  });
});