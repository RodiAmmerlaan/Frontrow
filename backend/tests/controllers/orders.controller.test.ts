import { Request, Response } from 'express';
import * as ordersService from '../../src/services/orders.service';
import { InternalServerError, NotFoundError, BadRequestError, ValidationError } from '../../src/errors';
import { buyTickets, buyTicketsController } from '../../src/controllers/orders/buyTickets.controller';
import { getOrderById, getOrderByIdController } from '../../src/controllers/orders/getOrderById.controller';
import { getUserOrders, getUserOrdersController } from '../../src/controllers/orders/getUserOrders.controller';

// Mock the response utility functions
jest.mock('../../src/utils/response.util', () => {
  const originalModule = jest.requireActual('../../src/utils/response.util');
  return {
    ...originalModule,
    sendSuccess: jest.fn(),
    sendBadRequest: jest.fn(),
    sendNotFound: jest.fn(),
    sendError: jest.fn()
  };
});

// Import the mocked functions after mocking
const { 
  sendSuccess: mockSendSuccess,
  sendBadRequest: mockSendBadRequest,
  sendNotFound: mockSendNotFound,
  sendError: mockSendError
} = require('../../src/utils/response.util');

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

// Create spies on the BaseController methods
jest.spyOn(buyTicketsController, 'sendSuccess' as any);
jest.spyOn(buyTicketsController, 'throwBadRequestError' as any);
jest.spyOn(buyTicketsController, 'throwNotFoundError' as any);
jest.spyOn(buyTicketsController, 'throwInternalServerError' as any);
jest.spyOn(getOrderByIdController, 'sendSuccess' as any);
jest.spyOn(getOrderByIdController, 'throwNotFoundError' as any);
jest.spyOn(getOrderByIdController, 'throwBadRequestError' as any);
jest.spyOn(getOrderByIdController, 'throwInternalServerError' as any);
jest.spyOn(getUserOrdersController, 'sendSuccess' as any);
jest.spyOn(getUserOrdersController, 'throwBadRequestError' as any);
jest.spyOn(getUserOrdersController, 'throwNotFoundError' as any);
jest.spyOn(getUserOrdersController, 'throwInternalServerError' as any);

describe('Orders Controllers', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let correlationId: string;

  beforeEach(() => {
    jest.clearAllMocks();
    
    correlationId = 'test-correlation-id';
    
    mockRequest = {
      correlationId,
      body: {},
      params: {},
      query: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('BuyTicketsController', () => {
    const mockTickets = [
      { 
        id: 'ticket-1', 
        order_id: 'order-123', 
        ticket_number: 'TICKET-001',
        assigned_to: 'user-123',
        created_at: new Date()
      },
      { 
        id: 'ticket-2', 
        order_id: 'order-123', 
        ticket_number: 'TICKET-002',
        assigned_to: 'user-123',
        created_at: new Date()
      }
    ];

    const requestData = {
      event_id: 'event-123',
      user_id: 'user-123',
      total_amount: 2
    };

    beforeEach(() => {
      mockRequest.body = requestData;
    });

    it('should successfully process ticket purchase', async () => {
      jest.spyOn(ordersService.OrdersService, 'processTicketPurchase').mockResolvedValue(mockTickets);

      await buyTickets(mockRequest as Request, mockResponse as Response);

      expect(ordersService.OrdersService.processTicketPurchase).toHaveBeenCalledWith(
        'event-123', 
        'user-123', 
        2
      );
      expect((buyTicketsController as any).sendSuccess).toHaveBeenCalledWith(
        mockResponse, 
        { tickets: mockTickets }, 
        undefined, 
        201
      );
    });

    it('should handle bad request error during ticket purchase', async () => {
      const badRequestError = new BadRequestError('Insufficient tickets available');
      jest.spyOn(ordersService.OrdersService, 'processTicketPurchase').mockRejectedValue(badRequestError);

      await expect(buyTickets(mockRequest as Request, mockResponse as Response)).rejects.toThrow(BadRequestError);
      
      expect((buyTicketsController as any).throwBadRequestError).toHaveBeenCalledWith('Insufficient tickets available');
    });

    it('should handle not found error during ticket purchase', async () => {
      const notFoundError = new NotFoundError('Event not found');
      jest.spyOn(ordersService.OrdersService, 'processTicketPurchase').mockRejectedValue(notFoundError);

      await expect(buyTickets(mockRequest as Request, mockResponse as Response)).rejects.toThrow(NotFoundError);
      
      expect((buyTicketsController as any).throwNotFoundError).toHaveBeenCalledWith('Event not found');
    });

    it('should handle validation error during ticket purchase', async () => {
      const validationError = new ValidationError('Invalid input data');
      jest.spyOn(ordersService.OrdersService, 'processTicketPurchase').mockRejectedValue(validationError);

      await expect(buyTickets(mockRequest as Request, mockResponse as Response)).rejects.toThrow(BadRequestError);
      
      expect((buyTicketsController as any).throwBadRequestError).toHaveBeenCalledWith('Invalid input data');
    });

    it('should handle internal server error when processing ticket purchase fails', async () => {
      jest.spyOn(ordersService.OrdersService, 'processTicketPurchase').mockRejectedValue(new Error('Database error'));

      await expect(buyTickets(mockRequest as Request, mockResponse as Response)).rejects.toThrow(InternalServerError);
      
      expect((buyTicketsController as any).throwInternalServerError).toHaveBeenCalledWith(
        'Failed to process ticket purchase. Please try again later.'
      );
    });
  });

  describe('GetOrderByIdController', () => {
    const mockOrder = {
      id: 'order-123',
      user_id: 'user-123',
      event_id: 'event-123',
      total_amount: 2,
      created_at: new Date(),
      tickets: [
        { 
          id: 'ticket-1', 
          order_id: 'order-123', 
          ticket_number: 'TICKET-001',
          assigned_to: 'user-123',
          created_at: new Date()
        },
        { 
          id: 'ticket-2', 
          order_id: 'order-123', 
          ticket_number: 'TICKET-002',
          assigned_to: 'user-123',
          created_at: new Date()
        }
      ]
    };

    beforeEach(() => {
      mockRequest.params = { orderId: 'order-123' };
    });

    it('should successfully retrieve order by ID', async () => {
      jest.spyOn(ordersService.OrdersService, 'getOrderById').mockResolvedValue(mockOrder);

      await getOrderById(mockRequest as Request, mockResponse as Response);

      expect(ordersService.OrdersService.getOrderById).toHaveBeenCalledWith('order-123');
      expect((getOrderByIdController as any).sendSuccess).toHaveBeenCalledWith(mockResponse, mockOrder);
    });

    it('should handle not found error when order is not found', async () => {
      const notFoundError = new NotFoundError('Order not found');
      jest.spyOn(ordersService.OrdersService, 'getOrderById').mockRejectedValue(notFoundError);

      await expect(getOrderById(mockRequest as Request, mockResponse as Response)).rejects.toThrow(NotFoundError);
      
      expect((getOrderByIdController as any).throwNotFoundError).toHaveBeenCalledWith('Order not found');
    });

    it('should handle validation error during order retrieval', async () => {
      const validationError = new ValidationError('Invalid order ID');
      jest.spyOn(ordersService.OrdersService, 'getOrderById').mockRejectedValue(validationError);

      await expect(getOrderById(mockRequest as Request, mockResponse as Response)).rejects.toThrow(BadRequestError);
      
      expect((getOrderByIdController as any).throwBadRequestError).toHaveBeenCalledWith('Invalid order ID');
    });

    it('should handle internal server error when retrieving order fails', async () => {
      jest.spyOn(ordersService.OrdersService, 'getOrderById').mockRejectedValue(new Error('Database error'));

      await expect(getOrderById(mockRequest as Request, mockResponse as Response)).rejects.toThrow(InternalServerError);
      
      expect((getOrderByIdController as any).throwInternalServerError).toHaveBeenCalledWith('Failed to retrieve order');
    });
  });

  describe('GetUserOrdersController', () => {
    const mockOrders = [
      {
        id: 'order-123',
        user_id: 'user-123',
        event_id: 'event-123',
        total_amount: 2,
        created_at: new Date(),
        tickets: [
          { 
            id: 'ticket-1', 
            order_id: 'order-123', 
            ticket_number: 'TICKET-001',
            assigned_to: 'user-123',
            created_at: new Date()
          },
          { 
            id: 'ticket-2', 
            order_id: 'order-123', 
            ticket_number: 'TICKET-002',
            assigned_to: 'user-123',
            created_at: new Date()
          }
        ]
      },
      {
        id: 'order-456',
        user_id: 'user-123',
        event_id: 'event-456',
        total_amount: 3,
        created_at: new Date(),
        tickets: [
          { 
            id: 'ticket-3', 
            order_id: 'order-456', 
            ticket_number: 'TICKET-003',
            assigned_to: 'user-123',
            created_at: new Date()
          },
          { 
            id: 'ticket-4', 
            order_id: 'order-456', 
            ticket_number: 'TICKET-004',
            assigned_to: 'user-123',
            created_at: new Date()
          },
          { 
            id: 'ticket-5', 
            order_id: 'order-456', 
            ticket_number: 'TICKET-005',
            assigned_to: 'user-123',
            created_at: new Date()
          }
        ]
      }
    ];

    beforeEach(() => {
      mockRequest.params = { userId: 'user-123' };
    });

    it('should successfully retrieve user orders', async () => {
      jest.spyOn(ordersService.OrdersService, 'getUserOrders').mockResolvedValue(mockOrders);

      await getUserOrders(mockRequest as Request, mockResponse as Response);

      expect(ordersService.OrdersService.getUserOrders).toHaveBeenCalledWith('user-123');
      expect((getUserOrdersController as any).sendSuccess).toHaveBeenCalledWith(mockResponse, { orders: mockOrders });
    });

    it('should handle validation error during user orders retrieval', async () => {
      const validationError = new ValidationError('Invalid user ID');
      jest.spyOn(ordersService.OrdersService, 'getUserOrders').mockRejectedValue(validationError);

      await expect(getUserOrders(mockRequest as Request, mockResponse as Response)).rejects.toThrow(BadRequestError);
      
      expect((getUserOrdersController as any).throwBadRequestError).toHaveBeenCalledWith('Invalid user ID');
    });

    it('should handle not found error when user orders are not found', async () => {
      const notFoundError = new NotFoundError('User orders not found');
      jest.spyOn(ordersService.OrdersService, 'getUserOrders').mockRejectedValue(notFoundError);

      await expect(getUserOrders(mockRequest as Request, mockResponse as Response)).rejects.toThrow(NotFoundError);
      
      expect((getUserOrdersController as any).throwNotFoundError).toHaveBeenCalledWith('User orders not found');
    });

    it('should handle internal server error when retrieving user orders fails', async () => {
      jest.spyOn(ordersService.OrdersService, 'getUserOrders').mockRejectedValue(new Error('Database error'));

      await expect(getUserOrders(mockRequest as Request, mockResponse as Response)).rejects.toThrow(InternalServerError);
      
      expect((getUserOrdersController as any).throwInternalServerError).toHaveBeenCalledWith('Failed to retrieve user orders');
    });
  });
});