import { Request, Response } from 'express';
import * as eventsService from '../../src/services/events.service';
import * as reportsService from '../../src/services/reports.service';
import { InternalServerError, NotFoundError, ConflictError, ValidationError, BadRequestError } from '../../src/errors';
import { getAllEvents, getAllEventsController } from '../../src/controllers/events/getAllEvents.controller';
import { getEventById, getEventByIdController } from '../../src/controllers/events/getEventById.controller';
import { createEvent, createEventController } from '../../src/controllers/events/createEvent.controller';
import { searchEvents, searchEventsController } from '../../src/controllers/events/searchEvents.controller';
import { getSalesOverview, salesOverviewController } from '../../src/controllers/events/salesOverview.controller';
import { getUserPurchaseReport, userPurchaseReportController } from '../../src/controllers/events/userPurchaseReport.controller';

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
jest.spyOn(getAllEventsController, 'sendSuccess' as any);
jest.spyOn(getAllEventsController, 'throwInternalServerError' as any);
jest.spyOn(getEventByIdController, 'sendSuccess' as any);
jest.spyOn(getEventByIdController, 'throwNotFoundError' as any);
jest.spyOn(getEventByIdController, 'throwInternalServerError' as any);
jest.spyOn(createEventController, 'sendSuccess' as any);
jest.spyOn(createEventController, 'throwConflictError' as any);
jest.spyOn(createEventController, 'throwBadRequestError' as any);
jest.spyOn(createEventController, 'throwInternalServerError' as any);
jest.spyOn(searchEventsController, 'sendSuccess' as any);
jest.spyOn(searchEventsController, 'throwBadRequestError' as any);
jest.spyOn(searchEventsController, 'throwNotFoundError' as any);
jest.spyOn(searchEventsController, 'throwInternalServerError' as any);
jest.spyOn(salesOverviewController, 'sendSuccess' as any);
jest.spyOn(salesOverviewController, 'throwBadRequestError' as any);
jest.spyOn(salesOverviewController, 'throwNotFoundError' as any);
jest.spyOn(salesOverviewController, 'throwInternalServerError' as any);
jest.spyOn(userPurchaseReportController, 'sendSuccess' as any);
jest.spyOn(userPurchaseReportController, 'throwBadRequestError' as any);
jest.spyOn(userPurchaseReportController, 'throwNotFoundError' as any);
jest.spyOn(userPurchaseReportController, 'throwInternalServerError' as any);

describe('Events Controllers', () => {
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

  describe('GetAllEventsController', () => {
    const mockEvents = [
      {
        id: 'event-1',
        title: 'Test Event 1',
        description: 'Test Description 1',
        start_time: new Date().toString(),
        end_time: new Date().toString(),
        total_tickets: 100,
        tickets_left: 50,
        price: 25
      },
      {
        id: 'event-2',
        title: 'Test Event 2',
        description: 'Test Description 2',
        start_time: new Date().toString(),
        end_time: new Date().toString(),
        total_tickets: 200,
        tickets_left: 150,
        price: 30
      }
    ];

    beforeEach(() => {
      mockRequest.query = { page: '1', limit: '10' };
    });

    it('should successfully retrieve all events', async () => {
      jest.spyOn(eventsService.EventsService, 'getEnrichedEvents').mockResolvedValue(mockEvents);

      await getAllEvents(mockRequest as Request, mockResponse as Response);

      expect(eventsService.EventsService.getEnrichedEvents).toHaveBeenCalled();
      expect((getAllEventsController as any).sendSuccess).toHaveBeenCalledWith(mockResponse, { events: mockEvents });
    });

    it('should handle internal server error when fetching events fails', async () => {
      jest.spyOn(eventsService.EventsService, 'getEnrichedEvents').mockRejectedValue(new Error('Database error'));

      await expect(getAllEvents(mockRequest as Request, mockResponse as Response)).rejects.toThrow(InternalServerError);
      
      expect((getAllEventsController as any).throwInternalServerError).toHaveBeenCalledWith('Failed to retrieve events');
    });

    it('should handle specific internal server error from service', async () => {
      const internalError = new InternalServerError('Database connection failed');
      jest.spyOn(eventsService.EventsService, 'getEnrichedEvents').mockRejectedValue(internalError);

      await expect(getAllEvents(mockRequest as Request, mockResponse as Response)).rejects.toThrow(InternalServerError);
      
      expect((getAllEventsController as any).throwInternalServerError).toHaveBeenCalledWith('Database connection failed');
    });
  });

  describe('GetEventByIdController', () => {
    const mockEvent = {
      id: 'event-123',
      title: 'Test Event',
      description: 'Test Description',
      start_time: new Date().toString(),
      end_time: new Date().toString(),
      total_tickets: 100,
      tickets_left: 50,
      price: 25,
      created_at: new Date().toString()
    };

    beforeEach(() => {
      mockRequest.params = { eventId: 'event-123' };
    });

    it('should successfully retrieve an event by ID', async () => {
      jest.spyOn(eventsService.EventsService, 'getEventById').mockResolvedValue(mockEvent);

      await getEventById(mockRequest as Request, mockResponse as Response);

      expect(eventsService.EventsService.getEventById).toHaveBeenCalledWith('event-123');
      expect((getEventByIdController as any).sendSuccess).toHaveBeenCalledWith(mockResponse, { event: mockEvent });
    });

    it('should handle event not found', async () => {
      jest.spyOn(eventsService.EventsService, 'getEventById').mockRejectedValue(new NotFoundError('Event not found'));

      await expect(getEventById(mockRequest as Request, mockResponse as Response)).rejects.toThrow(NotFoundError);
      
      expect((getEventByIdController as any).throwNotFoundError).toHaveBeenCalledWith('Event not found');
    });

    it('should handle specific not found error from service', async () => {
      const notFoundError = new NotFoundError('Event with ID event-123 not found');
      jest.spyOn(eventsService.EventsService, 'getEventById').mockRejectedValue(notFoundError);

      await expect(getEventById(mockRequest as Request, mockResponse as Response)).rejects.toThrow(NotFoundError);
      
      expect((getEventByIdController as any).throwNotFoundError).toHaveBeenCalledWith('Event with ID event-123 not found');
    });

    it('should handle internal server error when fetching event fails', async () => {
      jest.spyOn(eventsService.EventsService, 'getEventById').mockRejectedValue(new Error('Database error'));

      await expect(getEventById(mockRequest as Request, mockResponse as Response)).rejects.toThrow(InternalServerError);
      
      expect((getEventByIdController as any).throwInternalServerError).toHaveBeenCalledWith('Failed to retrieve event');
    });

    it('should handle specific internal server error from service', async () => {
      const internalError = new InternalServerError('Database connection failed');
      jest.spyOn(eventsService.EventsService, 'getEventById').mockRejectedValue(internalError);

      await expect(getEventById(mockRequest as Request, mockResponse as Response)).rejects.toThrow(InternalServerError);
      
      expect((getEventByIdController as any).throwInternalServerError).toHaveBeenCalledWith('Database connection failed');
    });
  });

  describe('CreateEventController', () => {
    const eventData = {
      title: 'New Test Event',
      description: 'New Test Description',
      date: '2023-12-25',
      start_time: '10:00',
      end_time: '12:00',
      total_tickets: 100,
      price: 50
    };

    const createResult = { message: "Event created" };

    beforeEach(() => {
      mockRequest.body = eventData;
    });

    it('should successfully create a new event', async () => {
      jest.spyOn(eventsService.EventsService, 'createEvent').mockResolvedValue(createResult);

      await createEvent(mockRequest as Request, mockResponse as Response);

      expect(eventsService.EventsService.createEvent).toHaveBeenCalledWith(eventData);
      expect((createEventController as any).sendSuccess).toHaveBeenCalledWith(mockResponse, createResult, undefined, 201);
    });

    it('should handle conflict error when event already exists', async () => {
      const conflictError = new ConflictError('An event with this title already exists');
      jest.spyOn(eventsService.EventsService, 'createEvent').mockRejectedValue(conflictError);

      await expect(createEvent(mockRequest as Request, mockResponse as Response)).rejects.toThrow(ConflictError);
      
      expect((createEventController as any).throwConflictError).toHaveBeenCalledWith('An event with this title already exists');
    });

    it('should handle validation error during event creation', async () => {
      const validationError = new ValidationError('Validation failed');
      jest.spyOn(eventsService.EventsService, 'createEvent').mockRejectedValue(validationError);

      await expect(createEvent(mockRequest as Request, mockResponse as Response)).rejects.toThrow(BadRequestError);
      
      expect((createEventController as any).throwBadRequestError).toHaveBeenCalledWith('Validation failed');
    });

    it('should handle internal server error when creating event fails', async () => {
      jest.spyOn(eventsService.EventsService, 'createEvent').mockRejectedValue(new Error('Database error'));

      await expect(createEvent(mockRequest as Request, mockResponse as Response)).rejects.toThrow(InternalServerError);
      
      expect((createEventController as any).throwInternalServerError).toHaveBeenCalledWith('Failed to create event. Please try again later.');
    });
  });

  describe('SearchEventsController', () => {
    const mockSearchResult = {
      events: [
        {
          id: 'event-1',
          title: 'Test Event 1',
          description: 'Test Description 1',
          start_time: new Date().toString(),
          end_time: new Date().toString(),
          total_tickets: 100,
          tickets_left: 50,
          price: 25
        }
      ],
      count: 1,
      searchTerm: 'Test'
    };

    beforeEach(() => {
      mockRequest.query = { name: 'Test' };
    });

    it('should successfully search events by name', async () => {
      jest.spyOn(eventsService.EventsService, 'searchEventsByName').mockResolvedValue(mockSearchResult);

      await searchEvents(mockRequest as Request, mockResponse as Response);

      expect(eventsService.EventsService.searchEventsByName).toHaveBeenCalledWith('Test');
      expect((searchEventsController as any).sendSuccess).toHaveBeenCalledWith(mockResponse, mockSearchResult);
    });

    it('should handle validation error during search', async () => {
      const validationError = new ValidationError('Search term is required');
      jest.spyOn(eventsService.EventsService, 'searchEventsByName').mockRejectedValue(validationError);

      await expect(searchEvents(mockRequest as Request, mockResponse as Response)).rejects.toThrow(BadRequestError);
      
      expect((searchEventsController as any).throwBadRequestError).toHaveBeenCalledWith('Search term is required');
    });

    it('should handle not found error when no events match search term', async () => {
      const notFoundError = new NotFoundError('No events found matching the search term');
      jest.spyOn(eventsService.EventsService, 'searchEventsByName').mockRejectedValue(notFoundError);

      await expect(searchEvents(mockRequest as Request, mockResponse as Response)).rejects.toThrow(NotFoundError);
      
      expect((searchEventsController as any).throwNotFoundError).toHaveBeenCalledWith('No events found matching the search term');
    });

    it('should handle internal server error when searching events fails', async () => {
      jest.spyOn(eventsService.EventsService, 'searchEventsByName').mockRejectedValue(new Error('Database error'));

      await expect(searchEvents(mockRequest as Request, mockResponse as Response)).rejects.toThrow(InternalServerError);
      
      expect((searchEventsController as any).throwInternalServerError).toHaveBeenCalledWith('Failed to search events. Please try again later.');
    });
  });

  describe('SalesOverviewController', () => {
    const mockSalesOverview = {
      totalRevenue: 5000,
      totalTicketsSold: 200,
      totalEvents: 5,
      averageTicketPrice: 25
    };

    beforeEach(() => {
      mockRequest.query = { month: '12', year: '2023' };
    });

    it('should successfully retrieve sales overview', async () => {
      jest.spyOn(reportsService.ReportsService, 'getSalesOverview').mockResolvedValue(mockSalesOverview);

      await getSalesOverview(mockRequest as Request, mockResponse as Response);

      expect(reportsService.ReportsService.getSalesOverview).toHaveBeenCalledWith(12, 2023);
      expect((salesOverviewController as any).sendSuccess).toHaveBeenCalledWith(mockResponse, mockSalesOverview);
    });

    it('should handle validation error during sales overview retrieval', async () => {
      const validationError = new ValidationError('Invalid month or year');
      jest.spyOn(reportsService.ReportsService, 'getSalesOverview').mockRejectedValue(validationError);

      await expect(getSalesOverview(mockRequest as Request, mockResponse as Response)).rejects.toThrow(BadRequestError);
      
      expect((salesOverviewController as any).throwBadRequestError).toHaveBeenCalledWith('Invalid month or year');
    });

    it('should handle not found error when no sales data is available', async () => {
      const notFoundError = new NotFoundError('No sales data found for the specified period');
      jest.spyOn(reportsService.ReportsService, 'getSalesOverview').mockRejectedValue(notFoundError);

      await expect(getSalesOverview(mockRequest as Request, mockResponse as Response)).rejects.toThrow(NotFoundError);
      
      expect((salesOverviewController as any).throwNotFoundError).toHaveBeenCalledWith('No sales data found for the specified period');
    });

    it('should handle internal server error when retrieving sales overview fails', async () => {
      jest.spyOn(reportsService.ReportsService, 'getSalesOverview').mockRejectedValue(new Error('Database error'));

      await expect(getSalesOverview(mockRequest as Request, mockResponse as Response)).rejects.toThrow(InternalServerError);
      
      expect((salesOverviewController as any).throwInternalServerError).toHaveBeenCalledWith('Failed to retrieve sales overview');
    });
  });

  describe('UserPurchaseReportController', () => {
    const mockUserPurchaseReport = {
      totalUsers: 50,
      averageTicketsPerUser: 2.5,
      averageSpentPerUser: 75,
      mostActiveUser: {
        id: 'user-123',
        email: 'active@example.com',
        ticketsPurchased: 10,
        totalSpent: 250
      }
    };

    beforeEach(() => {
      mockRequest.query = { month: '12', year: '2023' };
    });

    it('should successfully retrieve user purchase report', async () => {
      jest.spyOn(reportsService.ReportsService, 'getUserPurchaseReport').mockResolvedValue(mockUserPurchaseReport);

      await getUserPurchaseReport(mockRequest as Request, mockResponse as Response);

      expect(reportsService.ReportsService.getUserPurchaseReport).toHaveBeenCalledWith(12, 2023);
      expect((userPurchaseReportController as any).sendSuccess).toHaveBeenCalledWith(mockResponse, mockUserPurchaseReport);
    });

    it('should handle validation error during user purchase report retrieval', async () => {
      const validationError = new ValidationError('Invalid month or year');
      jest.spyOn(reportsService.ReportsService, 'getUserPurchaseReport').mockRejectedValue(validationError);

      await expect(getUserPurchaseReport(mockRequest as Request, mockResponse as Response)).rejects.toThrow(BadRequestError);
      
      expect((userPurchaseReportController as any).throwBadRequestError).toHaveBeenCalledWith('Invalid month or year');
    });

    it('should handle not found error when no purchase data is available', async () => {
      const notFoundError = new NotFoundError('No purchase data found for the specified period');
      jest.spyOn(reportsService.ReportsService, 'getUserPurchaseReport').mockRejectedValue(notFoundError);

      await expect(getUserPurchaseReport(mockRequest as Request, mockResponse as Response)).rejects.toThrow(NotFoundError);
      
      expect((userPurchaseReportController as any).throwNotFoundError).toHaveBeenCalledWith('No purchase data found for the specified period');
    });

    it('should handle internal server error when retrieving user purchase report fails', async () => {
      jest.spyOn(reportsService.ReportsService, 'getUserPurchaseReport').mockRejectedValue(new Error('Database error'));

      await expect(getUserPurchaseReport(mockRequest as Request, mockResponse as Response)).rejects.toThrow(InternalServerError);
      
      expect((userPurchaseReportController as any).throwInternalServerError).toHaveBeenCalledWith('Failed to retrieve user purchase report');
    });
  });
});