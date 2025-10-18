"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRepositoryImpl = void 0;
const BaseRepositoryImpl_1 = require("./BaseRepositoryImpl");
const dateFilterUtils_1 = require("../utils/dateFilterUtils");
const RepositoryError_1 = require("../errors/RepositoryError");
class OrderRepositoryImpl extends BaseRepositoryImpl_1.BaseRepositoryImpl {
    /**
     * Find an order by its ID
     * @param id - The unique identifier of the order
     * @returns A promise that resolves to the order or null if not found
     */
    async findById(id) {
        return await this.prisma.orders.findUnique({ where: { id } });
    }
    /**
     * Find all orders
     * @returns A promise that resolves to an array of all orders
     */
    async findAll() {
        return await this.prisma.orders.findMany();
    }
    /**
     * Create a new order
     * @param orderData - The order data to create
     * @returns A promise that resolves to the created order
     */
    async create(orderData) {
        return await this.prisma.orders.create({ data: orderData });
    }
    /**
     * Update an existing order
     * @param id - The unique identifier of the order to update
     * @param orderData - The updated order data
     * @returns A promise that resolves to the updated order or null if not found
     */
    async update(id, orderData) {
        try {
            return await this.prisma.orders.update({
                where: { id },
                data: orderData
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new RepositoryError_1.EntityNotFoundError(`Order with ID ${id} not found`);
            }
            throw new RepositoryError_1.RepositoryError(`Failed to update order with ID ${id}: ${error.message}`);
        }
    }
    /**
     * Delete an order by its ID
     * @param id - The unique identifier of the order to delete
     * @returns A promise that resolves to true if deletion was successful, false otherwise
     */
    async delete(id) {
        try {
            await this.prisma.orders.delete({ where: { id } });
            return true;
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new RepositoryError_1.EntityNotFoundError(`Order with ID ${id} not found`);
            }
            throw new RepositoryError_1.RepositoryError(`Failed to delete order with ID ${id}: ${error.message}`);
        }
    }
    /**
     * Check if an order exists by its ID
     * @param id - The unique identifier to check
     * @returns A promise that resolves to true if the order exists, false otherwise
     */
    async exists(id) {
        const order = await this.prisma.orders.findUnique({ where: { id } });
        return !!order;
    }
    /**
     * Find orders by user ID
     * @param userId - The ID of the user
     * @returns A promise that resolves to an array of orders for the user
     */
    async findByUserId(userId) {
        return await this.prisma.orders.findMany({ where: { user_id: userId } });
    }
    /**
     * Find orders by event ID
     * @param eventId - The ID of the event
     * @returns A promise that resolves to an array of orders for the event
     */
    async findByEventId(eventId) {
        const startDate = new Date(0);
        return await this.prisma.orders.findMany({
            where: {
                AND: [
                    { event_id: eventId },
                    { created_at: { gte: startDate } }
                ]
            }
        });
    }
    /**
     * Get orders with related event and user information
     * @returns A promise that resolves to an array of detailed order records
     */
    async findWithDetails() {
        return await this.prisma.orders.findMany({
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
     * Creates a new order for ticket purchase
     * @param event_id - The ID of the event for which tickets are being purchased
     * @param user_id - The ID of the user purchasing the tickets
     * @param total_amount - The total number of tickets being purchased
     * @returns A promise that resolves to the created order
     */
    async buyTickets(event_id, user_id, total_amount) {
        return await this.create({
            user_id: user_id,
            event_id: event_id,
            total_amount: total_amount
        });
    }
    /**
     * Retrieves detailed sales data for events with related event and user information
     * @param month - Optional month filter (1-12)
     * @param year - Optional year filter
     * @returns A promise that resolves to an array of detailed sales records
     */
    async getEventSalesDetails(month, year) {
        const whereClause = (0, dateFilterUtils_1.buildDateFilterWhereClause)({ month, year });
        return await this.prisma.orders.findMany({
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
     * Retrieves detailed user purchase data with related event and user information
     * @param month - Optional month filter (1-12)
     * @param year - Optional year filter
     * @returns A promise that resolves to an array of detailed purchase records
     */
    async getUserPurchaseDetails(month, year) {
        const whereClause = (0, dateFilterUtils_1.buildDateFilterWhereClause)({ month, year });
        return await this.prisma.orders.findMany({
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
}
exports.OrderRepositoryImpl = OrderRepositoryImpl;
//# sourceMappingURL=OrderRepositoryImpl.js.map