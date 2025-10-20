import { TicketRepositoryImpl } from '../../src/repositories/TicketRepositoryImpl';
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient
const mockPrismaClient = {
  tickets: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createMany: jest.fn()
  }
};

// Mock the PrismaClient constructor
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

describe('TicketRepositoryImpl', () => {
  let ticketRepository: TicketRepositoryImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    ticketRepository = new TicketRepositoryImpl();
  });

  const mockTicket = {
    id: 'ticket-123',
    order_id: 'order-456',
    assigned_to: 'user-789',
    ticket_number: 'T-ORDER-1',
    created_at: new Date()
  };

  describe('findById', () => {
    it('should find a ticket by ID', async () => {
      mockPrismaClient.tickets.findUnique.mockResolvedValue(mockTicket);

      const result = await ticketRepository.findById('ticket-123');

      expect(mockPrismaClient.tickets.findUnique).toHaveBeenCalledWith({ where: { id: 'ticket-123' } });
      expect(result).toEqual(mockTicket);
    });

    it('should return null when ticket is not found', async () => {
      mockPrismaClient.tickets.findUnique.mockResolvedValue(null);

      const result = await ticketRepository.findById('non-existent-id');

      expect(mockPrismaClient.tickets.findUnique).toHaveBeenCalledWith({ where: { id: 'non-existent-id' } });
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all tickets', async () => {
      const mockTickets = [mockTicket, { ...mockTicket, id: 'ticket-456' }];
      mockPrismaClient.tickets.findMany.mockResolvedValue(mockTickets);

      const result = await ticketRepository.findAll();

      expect(mockPrismaClient.tickets.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(mockTickets);
    });

    it('should return an empty array when no tickets exist', async () => {
      mockPrismaClient.tickets.findMany.mockResolvedValue([]);

      const result = await ticketRepository.findAll();

      expect(mockPrismaClient.tickets.findMany).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new ticket', async () => {
      const ticketData = {
        order_id: 'order-456',
        assigned_to: 'user-789',
        ticket_number: 'T-ORDER-1'
      };

      mockPrismaClient.tickets.create.mockResolvedValue(mockTicket);

      const result = await ticketRepository.create(ticketData);

      expect(mockPrismaClient.tickets.create).toHaveBeenCalledWith({ data: ticketData });
      expect(result).toEqual(mockTicket);
    });
  });

  describe('update', () => {
    it('should update an existing ticket', async () => {
      const updateData = { assigned_to: 'user-999' };
      const updatedTicket = { ...mockTicket, ...updateData };
      
      mockPrismaClient.tickets.update.mockResolvedValue(updatedTicket);

      const result = await ticketRepository.update('ticket-123', updateData);

      expect(mockPrismaClient.tickets.update).toHaveBeenCalledWith({
        where: { id: 'ticket-123' },
        data: updateData
      });
      expect(result).toEqual(updatedTicket);
    });

    it('should return null for update errors', async () => {
      const updateData = { assigned_to: 'user-999' };
      
      mockPrismaClient.tickets.update.mockRejectedValue(new Error('Database error'));

      const result = await ticketRepository.update('ticket-123', updateData);

      expect(mockPrismaClient.tickets.update).toHaveBeenCalledWith({
        where: { id: 'ticket-123' },
        data: updateData
      });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a ticket', async () => {
      mockPrismaClient.tickets.delete.mockResolvedValue(undefined);

      const result = await ticketRepository.delete('ticket-123');

      expect(mockPrismaClient.tickets.delete).toHaveBeenCalledWith({ where: { id: 'ticket-123' } });
      expect(result).toBe(true);
    });

    it('should return false for delete errors', async () => {
      mockPrismaClient.tickets.delete.mockRejectedValue(new Error('Database error'));

      const result = await ticketRepository.delete('ticket-123');

      expect(mockPrismaClient.tickets.delete).toHaveBeenCalledWith({ where: { id: 'ticket-123' } });
      expect(result).toBe(false);
    });
  });

  describe('exists', () => {
    it('should return true when ticket exists', async () => {
      mockPrismaClient.tickets.findUnique.mockResolvedValue(mockTicket);

      const result = await ticketRepository.exists('ticket-123');

      expect(mockPrismaClient.tickets.findUnique).toHaveBeenCalledWith({ where: { id: 'ticket-123' } });
      expect(result).toBe(true);
    });

    it('should return false when ticket does not exist', async () => {
      mockPrismaClient.tickets.findUnique.mockResolvedValue(null);

      const result = await ticketRepository.exists('non-existent-id');

      expect(mockPrismaClient.tickets.findUnique).toHaveBeenCalledWith({ where: { id: 'non-existent-id' } });
      expect(result).toBe(false);
    });
  });

  describe('findByOrderId', () => {
    it('should find tickets by order ID', async () => {
      const mockTickets = [mockTicket];
      mockPrismaClient.tickets.findMany.mockResolvedValue(mockTickets);

      const result = await ticketRepository.findByOrderId('order-456');

      expect(mockPrismaClient.tickets.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { order_id: 'order-456' },
            { created_at: { lte: expect.any(Date) } }
          ]
        }
      });
      expect(result).toEqual(mockTickets);
    });
  });

  describe('findByUserId', () => {
    it('should find tickets by user ID', async () => {
      const mockTickets = [mockTicket];
      mockPrismaClient.tickets.findMany.mockResolvedValue(mockTickets);

      const result = await ticketRepository.findByUserId('user-789');

      expect(mockPrismaClient.tickets.findMany).toHaveBeenCalledWith({ where: { assigned_to: 'user-789' } });
      expect(result).toEqual(mockTickets);
    });
  });

  describe('createMany', () => {
    it('should create multiple tickets', async () => {
      const ticketsData = [
        {
          order_id: 'order-456',
          assigned_to: 'user-789',
          ticket_number: 'T-ORDER-1'
        },
        {
          order_id: 'order-456',
          assigned_to: 'user-789',
          ticket_number: 'T-ORDER-2'
        }
      ];

      const mockCreatedTickets = [
        { ...mockTicket, ticket_number: 'T-ORDER-1' },
        { ...mockTicket, id: 'ticket-456', ticket_number: 'T-ORDER-2' }
      ];

      mockPrismaClient.tickets.createMany.mockResolvedValue(undefined);
      mockPrismaClient.tickets.findMany.mockResolvedValue(mockCreatedTickets);

      const result = await ticketRepository.createMany(ticketsData);

      expect(mockPrismaClient.tickets.createMany).toHaveBeenCalledWith({
        data: ticketsData
      });
      expect(mockPrismaClient.tickets.findMany).toHaveBeenCalledWith({
        where: {
          ticket_number: {
            in: ['T-ORDER-1', 'T-ORDER-2']
          }
        }
      });
      expect(result).toEqual(mockCreatedTickets);
    });
  });

  describe('createTickets', () => {
    it('should create multiple tickets for an order', async () => {
      const ticketsData = [
        {
          order_id: 'order-456',
          assigned_to: 'user-789',
          ticket_number: 'T-order-1'
        }
      ];

      const mockCreatedTickets = [
        { ...mockTicket }
      ];

      mockPrismaClient.tickets.createMany.mockResolvedValue(undefined);
      mockPrismaClient.tickets.findMany.mockResolvedValue(mockCreatedTickets);

      const result = await ticketRepository.createTickets('order-456', 'user-789', 1);

      expect(mockPrismaClient.tickets.createMany).toHaveBeenCalled();
      expect(mockPrismaClient.tickets.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedTickets);
    });
  });
});