"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAllEvents = findAllEvents;
exports.findEventByTitle = findEventByTitle;
exports.searchEventsByName = searchEventsByName;
exports.findEventById = findEventById;
exports.createEvent = createEvent;
exports.createTicketBatch = createTicketBatch;
exports.getAllEventsByDate = getAllEventsByDate;
exports.getTicketsByEventId = getTicketsByEventId;
exports.getOrdersByEventId = getOrdersByEventId;
exports.getEventSalesOverview = getEventSalesOverview;
exports.getEventSalesDetails = getEventSalesDetails;
exports.getUserPurchaseAnalytics = getUserPurchaseAnalytics;
exports.getUserPurchaseDetails = getUserPurchaseDetails;
const EventRepositoryImpl_1 = require("../../repositories/EventRepositoryImpl");
const TicketBatchRepositoryImpl_1 = require("../../repositories/TicketBatchRepositoryImpl");
const OrderRepositoryImpl_1 = require("../../repositories/OrderRepositoryImpl");
const dateFilterUtils_1 = require("../../utils/dateFilterUtils");
const eventRepository = new EventRepositoryImpl_1.EventRepositoryImpl();
const ticketBatchRepository = new TicketBatchRepositoryImpl_1.TicketBatchRepositoryImpl();
const orderRepository = new OrderRepositoryImpl_1.OrderRepositoryImpl();
/**
 * Retrieves all events from the database
 * @returns A promise that resolves to an array of all events
 */
async function findAllEvents() {
    return await eventRepository.findAll();
}
;
/**
 * Finds an event by its title
 * @param title - The title of the event to find
 * @returns A promise that resolves to the first event matching the title, or null if not found
 */
async function findEventByTitle(title) {
    return await eventRepository.findByTitle(title);
}
;
/**
 * Searches for events by name using a case-insensitive partial match
 * @param searchTerm - The term to search for in event titles
 * @returns A promise that resolves to an array of events matching the search term
 */
async function searchEventsByName(searchTerm) {
    return await eventRepository.searchByName(searchTerm);
}
;
/**
 * Finds an event by its ID with related ticket batches and order counts
 * @param eventId - The unique identifier of the event
 * @returns A promise that resolves to the event with related data, or null if not found
 */
async function findEventById(eventId) {
    // Note: This method requires a more complex query with includes that isn't directly supported by our repository
    // We'll keep the original implementation for now
    return await eventRepository['prisma'].events.findFirst({
        where: { id: eventId },
        include: {
            TicketBatches: {
                select: {
                    total_tickets: true,
                    price: true
                }
            },
            _count: {
                select: {
                    Orders: true
                }
            }
        }
    });
}
;
/**
 * Creates a new event or updates an existing one if the title already exists
 * @param title - The title of the event
 * @param description - The description of the event
 * @param date - The date of the event in YYYY-MM-DD format
 * @param start_time - The start time of the event in HH:MM format
 * @param end_time - The end time of the event in HH:MM format
 * @returns A promise that resolves to the created or updated event
 */
async function createEvent(title, description, date, start_time, end_time) {
    // start_time and end_time are already Date objects, so we can use them directly
    return await eventRepository['prisma'].events.upsert({
        where: { title: title },
        update: {},
        create: {
            title: title,
            description: description,
            start_time: start_time,
            end_time: end_time
        }
    });
}
;
/**
 * Creates a new ticket batch for an event
 * @param event_id - The ID of the event
 * @param total_tickets - The total number of tickets in this batch
 * @param price - The price per ticket
 * @returns A promise that resolves to the created ticket batch
 */
async function createTicketBatch(event_id, total_tickets, price) {
    return await ticketBatchRepository.create({
        event_id: event_id,
        total_tickets: total_tickets,
        price: price
    });
}
;
/**
 * Retrieves all events ordered by date, filtering for future events
 * @returns A promise that resolves to an array of events
 */
async function getAllEventsByDate() {
    return await eventRepository.findAllByDate();
}
/**
 * Retrieves ticket information for a specific event
 * @param eventId - The ID of the event
 * @returns A promise that resolves to the ticket batch for the event, or null if not found
 */
async function getTicketsByEventId(eventId) {
    return await ticketBatchRepository.findFirstByEventId(eventId);
}
/**
 * Retrieves all orders for a specific event
 * @param eventId - The ID of the event
 * @returns A promise that resolves to an array of orders for the event
 */
async function getOrdersByEventId(eventId) {
    return await orderRepository.findByEventId(eventId);
}
/**
 * Retrieves sales overview data for events, grouped by event ID
 * @param month - Optional month filter (1-12)
 * @param year - Optional year filter
 * @returns A promise that resolves to grouped sales data by event
 */
async function getEventSalesOverview(month, year) {
    const whereClause = (0, dateFilterUtils_1.buildDateFilterWhereClause)({ month, year });
    return await orderRepository['prisma'].orders.groupBy({
        by: ['event_id'],
        where: whereClause,
        _count: {
            id: true
        },
        _sum: {
            total_amount: true
        }
    });
}
/**
 * Retrieves detailed sales data for events with related event and user information
 * @param month - Optional month filter (1-12)
 * @param year - Optional year filter
 * @returns A promise that resolves to an array of detailed sales records
 */
async function getEventSalesDetails(month, year) {
    const whereClause = (0, dateFilterUtils_1.buildDateFilterWhereClause)({ month, year });
    return await orderRepository['prisma'].orders.findMany({
        where: whereClause,
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
}
/**
 * Retrieves user purchase analytics, grouped by user ID
 * @param month - Optional month filter (1-12)
 * @param year - Optional year filter
 * @returns A promise that resolves to grouped purchase analytics by user
 */
async function getUserPurchaseAnalytics(month, year) {
    const whereClause = (0, dateFilterUtils_1.buildDateFilterWhereClause)({ month, year });
    return await orderRepository['prisma'].orders.groupBy({
        by: ['user_id'],
        where: whereClause,
        _count: {
            id: true
        },
        _sum: {
            total_amount: true
        }
    });
}
/**
 * Retrieves detailed user purchase data with related event and user information
 * @param month - Optional month filter (1-12)
 * @param year - Optional year filter
 * @returns A promise that resolves to an array of detailed purchase records
 */
async function getUserPurchaseDetails(month, year) {
    const whereClause = (0, dateFilterUtils_1.buildDateFilterWhereClause)({ month, year });
    return await orderRepository['prisma'].orders.findMany({
        where: whereClause,
        include: {
            Events: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    start_time: true,
                    end_time: true,
                    TicketBatches: {
                        select: {
                            price: true
                        }
                    }
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
}
//# sourceMappingURL=events.dao.js.map