"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../src/errors");
const mockEventRepository = {
    findAll: jest.fn(),
    findAllByDate: jest.fn(),
    findEventById: jest.fn(),
    createEventWithDetails: jest.fn(),
    findByTitle: jest.fn(),
    searchByName: jest.fn(),
    exists: jest.fn()
};
const mockTicketBatchRepository = {
    findFirstByEventId: jest.fn(),
    createTicketBatch: jest.fn()
};
const mockOrderRepository = {
    findByEventId: jest.fn()
};
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
jest.mock('../../src/repositories/OrderRepositoryImpl', () => {
    return {
        OrderRepositoryImpl: jest.fn(() => mockOrderRepository)
    };
});
jest.mock('../../src/utils/logger', () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
}));
const { EventsService } = require('../../src/services/events.service');
describe('EventsService', () => {
    const mockEvent = {
        id: 'event-123',
        title: 'Test Event',
        description: 'Test Description',
        start_time: new Date(),
        end_time: new Date(),
        created_at: new Date()
    };
    const mockTicketBatch = {
        id: 'batch-123',
        event_id: 'event-123',
        total_tickets: 100,
        price: 50,
        created_at: new Date()
    };
    const mockOrder = {
        id: 'order-123',
        event_id: 'event-123',
        total_amount: 10,
        created_at: new Date()
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('getEnrichedEvents', () => {
        it('should return enriched events', async () => {
            const mockEvents = [mockEvent];
            const enrichedEvent = {
                id: mockEvent.id,
                title: mockEvent.title,
                description: mockEvent.description,
                start_time: mockEvent.start_time.toString(),
                end_time: mockEvent.end_time.toString(),
                total_tickets: 100,
                tickets_left: 90,
                price: 50
            };
            mockEventRepository.findAll.mockResolvedValue(mockEvents);
            mockEventRepository.exists.mockResolvedValue(true);
            mockTicketBatchRepository.findFirstByEventId.mockResolvedValue(mockTicketBatch);
            mockOrderRepository.findByEventId.mockResolvedValue([mockOrder]);
            const result = await EventsService.getEnrichedEvents();
            expect(mockEventRepository.findAll).toHaveBeenCalled();
            expect(result).toEqual([enrichedEvent]);
        });
        it('should throw an InternalServerError when fetching enriched events fails', async () => {
            mockEventRepository.findAll.mockRejectedValue(new Error('Database error'));
            await expect(EventsService.getEnrichedEvents())
                .rejects
                .toThrow(errors_1.InternalServerError);
        });
    });
    describe('getEventById', () => {
        it('should return an event by ID with enriched details', async () => {
            const enrichedEvent = {
                id: mockEvent.id,
                title: mockEvent.title,
                description: mockEvent.description,
                start_time: mockEvent.start_time,
                end_time: mockEvent.end_time,
                total_tickets: 100,
                tickets_left: 90,
                price: 50,
                created_at: mockEvent.created_at
            };
            mockEventRepository.findEventById.mockResolvedValue(mockEvent);
            mockTicketBatchRepository.findFirstByEventId.mockResolvedValue(mockTicketBatch);
            mockOrderRepository.findByEventId.mockResolvedValue([mockOrder]);
            const result = await EventsService.getEventById('event-123');
            expect(mockEventRepository.findEventById).toHaveBeenCalledWith('event-123');
            expect(result).toEqual(enrichedEvent);
        });
        it('should throw NotFoundError when event is not found', async () => {
            mockEventRepository.findEventById.mockResolvedValue(null);
            await expect(EventsService.getEventById('event-123'))
                .rejects
                .toThrow(errors_1.NotFoundError);
        });
        it('should throw an InternalServerError when fetching event fails', async () => {
            mockEventRepository.findEventById.mockRejectedValue(new Error('Database error'));
            await expect(EventsService.getEventById('event-123'))
                .rejects
                .toThrow(errors_1.InternalServerError);
        });
    });
    describe('createEvent', () => {
        it('should create a new event successfully', async () => {
            const eventData = {
                title: 'Test Event',
                description: 'Test Description',
                date: '2023-12-25',
                start_time: '10:00',
                end_time: '12:00',
                total_tickets: 100,
                price: 50
            };
            const eventDb = { ...mockEvent, id: 'event-123' };
            mockEventRepository.findByTitle.mockResolvedValue(null);
            mockEventRepository.createEventWithDetails.mockResolvedValue(eventDb);
            mockTicketBatchRepository.createTicketBatch.mockResolvedValue(mockTicketBatch);
            const result = await EventsService.createEvent(eventData);
            expect(mockEventRepository.findByTitle).toHaveBeenCalledWith(eventData.title);
            expect(mockEventRepository.createEventWithDetails).toHaveBeenCalled();
            expect(mockTicketBatchRepository.createTicketBatch).toHaveBeenCalledWith('event-123', eventData.total_tickets, eventData.price);
            expect(result).toEqual({ message: "Event created" });
        });
        it('should throw ConflictError when event with same title already exists', async () => {
            const eventData = {
                title: 'Test Event',
                description: 'Test Description',
                date: '2023-12-25',
                start_time: '10:00',
                end_time: '12:00',
                total_tickets: 100,
                price: 50
            };
            mockEventRepository.findByTitle.mockResolvedValue(mockEvent);
            await expect(EventsService.createEvent(eventData))
                .rejects
                .toThrow(errors_1.ConflictError);
        });
        it('should throw an InternalServerError when event creation fails', async () => {
            const eventData = {
                title: 'Test Event',
                description: 'Test Description',
                date: '2023-12-25',
                start_time: '10:00',
                end_time: '12:00',
                total_tickets: 100,
                price: 50
            };
            mockEventRepository.findByTitle.mockResolvedValue(null);
            mockEventRepository.createEventWithDetails.mockRejectedValue(new Error('Database error'));
            await expect(EventsService.createEvent(eventData))
                .rejects
                .toThrow(errors_1.InternalServerError);
        });
    });
    describe('searchEventsByName', () => {
        it('should search events by name and return enriched results', async () => {
            const mockEvents = [mockEvent];
            const enrichedEvent = {
                id: mockEvent.id,
                title: mockEvent.title,
                description: mockEvent.description,
                start_time: mockEvent.start_time.toString(),
                end_time: mockEvent.end_time.toString(),
                total_tickets: 100,
                tickets_left: 90,
                price: 50
            };
            mockEventRepository.searchByName.mockResolvedValue(mockEvents);
            mockEventRepository.findAll.mockResolvedValue([mockEvent]);
            mockEventRepository.exists.mockResolvedValue(true);
            mockTicketBatchRepository.findFirstByEventId.mockResolvedValue(mockTicketBatch);
            mockOrderRepository.findByEventId.mockResolvedValue([mockOrder]);
            const result = await EventsService.searchEventsByName('Test');
            expect(mockEventRepository.searchByName).toHaveBeenCalledWith('Test');
            expect(mockEventRepository.findAll).toHaveBeenCalled();
            expect(result).toEqual({
                events: [enrichedEvent],
                count: 1,
                searchTerm: 'Test'
            });
        });
        it('should throw an InternalServerError when searching events fails', async () => {
            mockEventRepository.searchByName.mockRejectedValue(new Error('Database error'));
            await expect(EventsService.searchEventsByName('Test'))
                .rejects
                .toThrow(errors_1.InternalServerError);
        });
    });
});
//# sourceMappingURL=events.service.test.js.map