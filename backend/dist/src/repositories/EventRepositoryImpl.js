"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRepositoryImpl = void 0;
const BaseRepositoryImpl_1 = require("./BaseRepositoryImpl");
const RepositoryError_1 = require("../errors/RepositoryError");
class EventRepositoryImpl extends BaseRepositoryImpl_1.BaseRepositoryImpl {
    /**
     * Find an event by its ID
     * @param id - The unique identifier of the event
     * @returns A promise that resolves to the event or null if not found
     */
    async findById(id) {
        return await this.prisma.events.findUnique({ where: { id } });
    }
    /**
     * Find all events
     * @returns A promise that resolves to an array of all events
     */
    async findAll() {
        return await this.prisma.events.findMany();
    }
    /**
     * Create a new event
     * @param eventData - The event data to create
     * @returns A promise that resolves to the created event
     */
    async create(eventData) {
        return await this.prisma.events.create({ data: eventData });
    }
    /**
     * Update an existing event
     * @param id - The unique identifier of the event to update
     * @param eventData - The updated event data
     * @returns A promise that resolves to the updated event or null if not found
     */
    async update(id, eventData) {
        try {
            return await this.prisma.events.update({
                where: { id },
                data: eventData
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new RepositoryError_1.EntityNotFoundError(`Event with ID ${id} not found`);
            }
            throw new RepositoryError_1.RepositoryError(`Failed to update event with ID ${id}: ${error.message}`);
        }
    }
    /**
     * Delete an event by its ID
     * @param id - The unique identifier of the event to delete
     * @returns A promise that resolves to true if deletion was successful, false otherwise
     */
    async delete(id) {
        try {
            await this.prisma.events.delete({ where: { id } });
            return true;
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new RepositoryError_1.EntityNotFoundError(`Event with ID ${id} not found`);
            }
            throw new RepositoryError_1.RepositoryError(`Failed to delete event with ID ${id}: ${error.message}`);
        }
    }
    /**
     * Check if an event exists by its ID
     * @param id - The unique identifier to check
     * @returns A promise that resolves to true if the event exists, false otherwise
     */
    async exists(id) {
        const event = await this.prisma.events.findUnique({ where: { id } });
        return !!event;
    }
    /**
     * Find an event by its title
     * @param title - The title of the event to find
     * @returns A promise that resolves to the event or null if not found
     */
    async findByTitle(title) {
        return await this.prisma.events.findFirst({ where: { title } });
    }
    /**
     * Search for events by name using a case-insensitive partial match
     * @param searchTerm - The term to search for in event titles
     * @returns A promise that resolves to an array of events matching the search term
     */
    async searchByName(searchTerm) {
        return await this.prisma.events.findMany({
            where: {
                title: {
                    contains: searchTerm.toUpperCase(),
                    mode: 'insensitive'
                }
            },
            orderBy: {
                start_time: 'asc'
            }
        });
    }
    /**
     * Find all events ordered by date, filtering for future events
     * @returns A promise that resolves to an array of events
     */
    async findAllByDate() {
        const now = new Date();
        return await this.prisma.events.findMany({
            where: {
                start_time: {
                    gte: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 0)
                }
            },
            orderBy: {
                start_time: 'asc'
            }
        });
    }
    /**
     * Find events within a date range
     * @param startDate - The start date of the range
     * @param endDate - The end date of the range
     * @returns A promise that resolves to an array of events within the date range
     */
    async findByDateRange(startDate, endDate) {
        return await this.prisma.events.findMany({
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
    }
    /**
     * Finds an event by its ID with related ticket batches and order counts
     * @param eventId - The unique identifier of the event
     * @returns A promise that resolves to the event with related data, or null if not found
     */
    async findEventById(eventId) {
        const event = await this.prisma.events.findFirst({ where: { id: eventId } });
        if (event) {
            const ticketBatches = await this.prisma.ticketBatches.findMany({
                where: { event_id: eventId },
                select: {
                    total_tickets: true,
                    price: true
                }
            });
            const orderCount = await this.prisma.orders.count({ where: { event_id: eventId } });
            return {
                ...event,
                TicketBatches: ticketBatches,
                _count: {
                    Orders: orderCount
                }
            };
        }
        return event;
    }
    /**
     * Creates a new event or updates an existing one if the title already exists
     * @param title - The title of the event
     * @param description - The description of the event
     * @param date - The date of the event in YYYY-MM-DD format
     * @param start_time - The start time of the event in HH:MM format
     * @param end_time - The end time of the event in HH:MM format
     * @returns A promise that resolves to the created or updated event
     */
    async createEventWithDetails(title, description, date, start_time, end_time) {
        return await this.prisma.events.upsert({
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
}
exports.EventRepositoryImpl = EventRepositoryImpl;
//# sourceMappingURL=EventRepositoryImpl.js.map