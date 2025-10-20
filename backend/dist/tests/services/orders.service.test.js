"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../src/errors");
const mockOrderRepository = {
    buyTickets: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    getEventSalesDetails: jest.fn(),
    getUserPurchaseDetails: jest.fn(),
    findByEventId: jest.fn()
};
const mockTicketRepository = {
    createTickets: jest.fn(),
    findByOrderId: jest.fn()
};
const mockUserRepository = {
    findById: jest.fn()
};
const mockEventRepository = {
    findById: jest.fn()
};
const mockTicketBatchRepository = {
    findFirstByEventId: jest.fn()
};
jest.mock('../../src/repositories/OrderRepositoryImpl', () => {
    return {
        OrderRepositoryImpl: jest.fn(() => mockOrderRepository)
    };
});
jest.mock('../../src/repositories/TicketRepositoryImpl', () => {
    return {
        TicketRepositoryImpl: jest.fn(() => mockTicketRepository)
    };
});
jest.mock('../../src/repositories/UserRepositoryImpl', () => {
    return {
        UserRepositoryImpl: jest.fn(() => mockUserRepository)
    };
});
jest.mock('../../src/repositories/EventRepositoryImpl', () => {
    return {
        EventRepositoryImpl: jest.fn(() => mockEventRepository)
    };
});
jest.mock('../../src/repositories/TicketBatchRepositoryImpl', () => {
    return {
        TicketBatchRepositoryImpl: jest.fn(() => mockTicketBatchRepository)
    };
});
jest.mock('../../src/utils/logger', () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
}));
const { OrdersService } = require('../../src/services/orders.service');
describe('OrdersService', () => {
    const mockOrder = {
        id: 'order-123',
        user_id: 'user-123',
        event_id: 'event-123',
        total_amount: 2,
        created_at: new Date()
    };
    const mockEvent = {
        id: 'event-123',
        title: 'Test Event',
        description: 'Test Description',
        start_time: new Date(),
        end_time: new Date(),
        created_by: 'user-456',
        created_at: new Date()
    };
    const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'USER'
    };
    const mockTicketBatch = {
        id: 'batch-123',
        event_id: 'event-123',
        total_tickets: 100,
        price: 50,
        created_at: new Date()
    };
    const mockTickets = [
        { id: 'ticket-1', order_id: 'order-123', assigned_to: 'user-123' },
        { id: 'ticket-2', order_id: 'order-123', assigned_to: 'user-123' }
    ];
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('processTicketPurchase', () => {
        it('should process ticket purchase successfully', async () => {
            mockEventRepository.findById.mockResolvedValue(mockEvent);
            mockUserRepository.findById.mockResolvedValue(mockUser);
            mockTicketBatchRepository.findFirstByEventId.mockResolvedValue(mockTicketBatch);
            mockOrderRepository.findByEventId.mockResolvedValue([]);
            mockOrderRepository.buyTickets.mockResolvedValue(mockOrder);
            mockTicketRepository.createTickets.mockResolvedValue(mockTickets);
            const result = await OrdersService.processTicketPurchase('event-123', 'user-123', 2);
            expect(mockEventRepository.findById).toHaveBeenCalledWith('event-123');
            expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
            expect(mockTicketBatchRepository.findFirstByEventId).toHaveBeenCalledWith('event-123');
            expect(mockOrderRepository.findByEventId).toHaveBeenCalledWith('event-123');
            expect(mockOrderRepository.buyTickets).toHaveBeenCalledWith('event-123', 'user-123', 2);
            expect(mockTicketRepository.createTickets).toHaveBeenCalledWith('order-123', 'user-123', 2);
            expect(result).toEqual(mockTickets);
        });
        it('should throw NotFoundError when event is not found', async () => {
            mockEventRepository.findById.mockResolvedValue(null);
            await expect(OrdersService.processTicketPurchase('event-123', 'user-123', 2))
                .rejects
                .toThrow(errors_1.NotFoundError);
        });
        it('should throw NotFoundError when user is not found', async () => {
            mockEventRepository.findById.mockResolvedValue(mockEvent);
            mockUserRepository.findById.mockResolvedValue(null);
            await expect(OrdersService.processTicketPurchase('event-123', 'user-123', 2))
                .rejects
                .toThrow(errors_1.NotFoundError);
        });
        it('should throw NotFoundError when ticket batch is not found', async () => {
            mockEventRepository.findById.mockResolvedValue(mockEvent);
            mockUserRepository.findById.mockResolvedValue(mockUser);
            mockTicketBatchRepository.findFirstByEventId.mockResolvedValue(null);
            await expect(OrdersService.processTicketPurchase('event-123', 'user-123', 2))
                .rejects
                .toThrow(errors_1.NotFoundError);
        });
        it('should throw BadRequestError when not enough tickets are available', async () => {
            mockEventRepository.findById.mockResolvedValue(mockEvent);
            mockUserRepository.findById.mockResolvedValue(mockUser);
            mockTicketBatchRepository.findFirstByEventId.mockResolvedValue({
                ...mockTicketBatch,
                total_tickets: 1
            });
            mockOrderRepository.findByEventId.mockResolvedValue([{ total_amount: 1 }]);
            await expect(OrdersService.processTicketPurchase('event-123', 'user-123', 2))
                .rejects
                .toThrow(errors_1.BadRequestError);
        });
        it('should throw an error when processing ticket purchase fails', async () => {
            mockEventRepository.findById.mockResolvedValue(mockEvent);
            mockUserRepository.findById.mockResolvedValue(mockUser);
            mockTicketBatchRepository.findFirstByEventId.mockResolvedValue(mockTicketBatch);
            mockOrderRepository.findByEventId.mockResolvedValue([]);
            mockOrderRepository.buyTickets.mockRejectedValue(new Error('Database error'));
            await expect(OrdersService.processTicketPurchase('event-123', 'user-123', 2))
                .rejects
                .toThrow('Database error');
        });
    });
    describe('getOrderById', () => {
        it('should return an order by ID with tickets', async () => {
            mockOrderRepository.findById.mockResolvedValue(mockOrder);
            mockTicketRepository.findByOrderId.mockResolvedValue(mockTickets);
            const result = await OrdersService.getOrderById('order-123');
            expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-123');
            expect(mockTicketRepository.findByOrderId).toHaveBeenCalledWith('order-123');
            expect(result).toEqual({
                ...mockOrder,
                tickets: mockTickets
            });
        });
        it('should throw NotFoundError when order is not found', async () => {
            mockOrderRepository.findById.mockResolvedValue(null);
            await expect(OrdersService.getOrderById('order-123'))
                .rejects
                .toThrow(errors_1.NotFoundError);
        });
        it('should throw an error when fetching order fails', async () => {
            mockOrderRepository.findById.mockRejectedValue(new Error('Database error'));
            await expect(OrdersService.getOrderById('order-123'))
                .rejects
                .toThrow('Database error');
        });
    });
    describe('getUserOrders', () => {
        it('should return orders for a user with tickets', async () => {
            const mockOrders = [mockOrder];
            mockOrderRepository.findByUserId.mockResolvedValue(mockOrders);
            mockTicketRepository.findByOrderId.mockResolvedValue(mockTickets);
            const result = await OrdersService.getUserOrders('user-123');
            expect(mockOrderRepository.findByUserId).toHaveBeenCalledWith('user-123');
            expect(mockTicketRepository.findByOrderId).toHaveBeenCalledWith('order-123');
            expect(result).toEqual([{
                    ...mockOrder,
                    tickets: mockTickets
                }]);
        });
        it('should throw an error when fetching user orders fails', async () => {
            mockOrderRepository.findByUserId.mockRejectedValue(new Error('Database error'));
            await expect(OrdersService.getUserOrders('user-123'))
                .rejects
                .toThrow('Database error');
        });
    });
});
//# sourceMappingURL=orders.service.test.js.map