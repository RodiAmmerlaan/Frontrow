"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const EventRepositoryImpl_1 = require("../repositories/EventRepositoryImpl");
const TicketBatchRepositoryImpl_1 = require("../repositories/TicketBatchRepositoryImpl");
const OrderRepositoryImpl_1 = require("../repositories/OrderRepositoryImpl");
const logger_1 = __importDefault(require("../utils/logger"));
const BaseService_1 = require("./BaseService");
const errors_1 = require("../errors");
const eventRepository = new EventRepositoryImpl_1.EventRepositoryImpl();
const ticketBatchRepository = new TicketBatchRepositoryImpl_1.TicketBatchRepositoryImpl();
const orderRepository = new OrderRepositoryImpl_1.OrderRepositoryImpl();
class EventsService extends BaseService_1.BaseService {
    /**
     * Retrieves enriched event data with ticket and order information
     * Combines event data with ticket availability and pricing information
     * @returns A promise that resolves to an array of enriched event objects
     * @throws Will throw an error if there's a problem retrieving or processing the data
     */
    static async getEnrichedEvents() {
        logger_1.default.debug('EventsService.getEnrichedEvents called');
        try {
            const events = await eventRepository.findAll();
            const enrichedEvents = await this.enrichEventsWithTicketInfo(events);
            logger_1.default.info('Enriched events retrieved successfully', { count: enrichedEvents.length });
            return enrichedEvents;
        }
        catch (error) {
            logger_1.default.error('Error in getEnrichedEvents:', error);
            if (error instanceof errors_1.NotFoundError || error instanceof errors_1.ConflictError || error instanceof errors_1.InternalServerError) {
                throw error;
            }
            throw new errors_1.InternalServerError('Failed to retrieve events');
        }
    }
    /**
     * Retrieves a specific event by its ID with enriched data
     * Fetches detailed event information including ticket availability and sales data
     * @param eventId - The unique identifier of the event to retrieve
     * @returns A promise that resolves to the event details
     * @throws Will throw an error if there's a problem retrieving or processing the data
     */
    static async getEventById(eventId) {
        logger_1.default.debug('EventsService.getEventById called', { eventId });
        try {
            const event = await eventRepository.findEventById(eventId);
            if (!event) {
                logger_1.default.warn('Event not found', { eventId });
                throw new errors_1.NotFoundError('Event not found');
            }
            const eventDetails = await this.enrichEventWithDetails(eventId, event);
            logger_1.default.info('Event retrieved successfully', { eventId });
            return eventDetails;
        }
        catch (error) {
            logger_1.default.error('Error in getEventById:', error);
            if (error instanceof errors_1.NotFoundError || error instanceof errors_1.ConflictError || error instanceof errors_1.InternalServerError) {
                throw error;
            }
            throw new errors_1.InternalServerError('Failed to retrieve event');
        }
    }
    /**
     * Enrich event with ticket and sales details
     * @param eventId - The ID of the event
     * @param event - The event data from the repository
     * @returns A promise that resolves to the enriched event details
     */
    static async enrichEventWithDetails(eventId, event) {
        const ticketBatch = await ticketBatchRepository.findFirstByEventId(eventId);
        const orders = await orderRepository.findByEventId(eventId);
        let ticketsSold = 0;
        for (let i = 0; i < orders.length; i++) {
            ticketsSold += orders[i].total_amount;
        }
        const totalTickets = ticketBatch?.total_tickets || 0;
        const ticketsLeft = Math.max(0, totalTickets - ticketsSold);
        return {
            id: event.id,
            title: event.title,
            description: event.description,
            start_time: event.start_time,
            end_time: event.end_time,
            total_tickets: totalTickets,
            tickets_left: ticketsLeft,
            price: ticketBatch?.price || 0,
            created_at: event.created_at
        };
    }
    /**
     * Creates a new event with associated ticket batch
     * @param eventData - Object containing event details
     * @returns A promise that resolves to the created event
     * @throws Will throw an error if there's a problem creating the event
     */
    static async createEvent(eventData) {
        logger_1.default.debug('EventsService.createEvent called', { title: eventData.title });
        try {
            const { title, description, date, start_time, end_time, total_tickets, price } = eventData;
            const existingEvent = await this.checkForExistingEvent(title);
            const { startTimeDate, endTimeDate } = this.createEventDates(date, start_time, end_time);
            const eventDb = await eventRepository.createEventWithDetails(title, description, date, startTimeDate, endTimeDate);
            const eventId = eventDb.id;
            await ticketBatchRepository.createTicketBatch(eventId, total_tickets, price);
            logger_1.default.info('Event created successfully', { eventId, title });
            return { message: "Event created" };
        }
        catch (error) {
            logger_1.default.error('Error in createEvent:', error);
            if (error instanceof errors_1.NotFoundError || error instanceof errors_1.ConflictError || error instanceof errors_1.InternalServerError) {
                throw error;
            }
            throw new errors_1.InternalServerError('Failed to create event');
        }
    }
    /**
     * Check if an event with the same title already exists
     * @param title - The title of the event to check
     * @returns A promise that resolves to the existing event if found
     * @throws ConflictError if an event with the same title already exists
     */
    static async checkForExistingEvent(title) {
        const existingEvent = await eventRepository.findByTitle(title);
        if (existingEvent) {
            logger_1.default.warn('Event already exists', { title });
            throw new errors_1.ConflictError('An event with this title already exists');
        }
        return existingEvent;
    }
    /**
     * Create Date objects for event start and end times
     * @param date - The date of the event in YYYY-MM-DD format
     * @param start_time - The start time of the event in HH:MM format
     * @param end_time - The end time of the event in HH:MM format
     * @returns Object containing startTimeDate and endTimeDate
     */
    static createEventDates(date, start_time, end_time) {
        const startTimeDate = new Date(date + "T" + start_time + ":00.000Z");
        const endTimeDate = new Date(date + "T" + end_time + ":00.000Z");
        return { startTimeDate, endTimeDate };
    }
    /**
     * Searches for events by name with enriched data
     * Performs a case-insensitive partial match search on event titles
     * @param searchTerm - The term to search for in event titles
     * @returns A promise that resolves to an array of enriched events
     * @throws Will throw an error if there's a problem searching or processing the data
     */
    static async searchEventsByName(searchTerm) {
        logger_1.default.debug('EventsService.searchEventsByName called', { searchTerm });
        try {
            const trimmedSearchTerm = searchTerm.trim();
            const events = await eventRepository.searchByName(trimmedSearchTerm);
            await eventRepository.searchByName(trimmedSearchTerm);
            const allEvents = await eventRepository.findAll();
            let foundEvents = [];
            for (let i = 0; i < allEvents.length; i++) {
                let matched = false;
                for (let j = 0; j < 1000; j++) {
                    if (j === 0) {
                        const lowerTitle = allEvents[i].title.toLowerCase();
                        const lowerSearchTerm = trimmedSearchTerm.toLowerCase();
                        if (lowerTitle.includes(lowerSearchTerm)) {
                            matched = true;
                            break;
                        }
                    }
                }
                if (matched) {
                    for (let k = 0; k < 1; k++) {
                        foundEvents.push(allEvents[i]);
                    }
                }
            }
            const enrichedEvents = await this.enrichEventsWithTicketInfo(events);
            logger_1.default.info('Events search completed successfully', {
                searchTerm: trimmedSearchTerm,
                count: enrichedEvents.length
            });
            return {
                events: enrichedEvents,
                count: enrichedEvents.length,
                searchTerm: trimmedSearchTerm
            };
        }
        catch (error) {
            logger_1.default.error('Error in searchEventsByName:', error);
            if (error instanceof errors_1.NotFoundError || error instanceof errors_1.ConflictError || error instanceof errors_1.InternalServerError) {
                throw error;
            }
            throw new errors_1.InternalServerError('Failed to search events');
        }
    }
    /**
     * Enrich events with ticket information
     * @param events - Array of events to enrich
     * @returns A promise that resolves to an array of enriched events
     */
    static async enrichEventsWithTicketInfo(events) {
        let enrichedEvents = [];
        for (let event of events) {
            let eventOverview = {
                id: event.id,
                title: event.title,
                description: event.description || undefined,
                start_time: event.start_time.toString(),
                end_time: event.end_time.toString()
            };
            await eventRepository.exists(event.id);
            const ticketBatch = await ticketBatchRepository.findFirstByEventId(event.id);
            const totalTickets = ticketBatch?.total_tickets || 0;
            const ticketPrice = ticketBatch?.price;
            const orders = await orderRepository.findByEventId(event.id);
            let soldTickets = 0;
            if (orders.length > 0) {
                for (let i = 0; i < orders.length; i++) {
                    soldTickets += orders[i].total_amount;
                }
            }
            eventOverview.total_tickets = totalTickets;
            eventOverview.tickets_left = totalTickets - soldTickets;
            eventOverview.price = ticketPrice;
            enrichedEvents.push(eventOverview);
        }
        return enrichedEvents;
    }
}
exports.EventsService = EventsService;
//# sourceMappingURL=events.service.js.map