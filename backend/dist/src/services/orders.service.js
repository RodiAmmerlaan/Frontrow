"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const OrderRepositoryImpl_1 = require("../repositories/OrderRepositoryImpl");
const TicketRepositoryImpl_1 = require("../repositories/TicketRepositoryImpl");
const UserRepositoryImpl_1 = require("../repositories/UserRepositoryImpl");
const EventRepositoryImpl_1 = require("../repositories/EventRepositoryImpl");
const TicketBatchRepositoryImpl_1 = require("../repositories/TicketBatchRepositoryImpl");
const logger_1 = __importDefault(require("../utils/logger"));
const BaseService_1 = require("./BaseService");
const errors_1 = require("../errors");
const orderRepository = new OrderRepositoryImpl_1.OrderRepositoryImpl();
const ticketRepository = new TicketRepositoryImpl_1.TicketRepositoryImpl();
const userRepository = new UserRepositoryImpl_1.UserRepositoryImpl();
const eventRepository = new EventRepositoryImpl_1.EventRepositoryImpl();
const ticketBatchRepository = new TicketBatchRepositoryImpl_1.TicketBatchRepositoryImpl();
class OrdersService extends BaseService_1.BaseService {
    /**
     * Process a ticket purchase for an event
     * Validates inputs, creates an order, and generates tickets
     * @param event_id - The ID of the event for which tickets are being purchased
     * @param user_id - The ID of the user purchasing the tickets
     * @param total_amount - The total number of tickets being purchased
     * @returns A promise that resolves to the created tickets
     * @throws Will throw an error if there's a problem processing the purchase
     */
    static async processTicketPurchase(event_id, user_id, total_amount) {
        logger_1.default.debug('OrdersService.processTicketPurchase called', { event_id, user_id, total_amount });
        try {
            const event = await this.verifyEventExists(event_id);
            const user = await this.verifyUserExists(user_id);
            const { ticketBatch, ticketsLeft } = await this.checkTicketAvailability(event_id, total_amount);
            const order = await orderRepository.buyTickets(event_id, user_id, total_amount);
            const tickets = await ticketRepository.createTickets(order.id, user_id, total_amount);
            logger_1.default.info('Ticket purchase processed successfully', {
                order_id: order.id,
                event_id,
                user_id,
                total_amount
            });
            return tickets;
        }
        catch (error) {
            logger_1.default.error('Error in processTicketPurchase:', error);
            throw error;
        }
    }
    /**
     * Verify that an event exists
     * @param event_id - The ID of the event to verify
     * @returns A promise that resolves to the event if it exists
     * @throws NotFoundError if the event doesn't exist
     */
    static async verifyEventExists(event_id) {
        const event = await eventRepository.findById(event_id);
        if (!event) {
            logger_1.default.warn('Event not found for ticket purchase', { event_id });
            throw new errors_1.NotFoundError("Event not found");
        }
        return event;
    }
    /**
     * Verify that a user exists
     * @param user_id - The ID of the user to verify
     * @returns A promise that resolves to the user if they exist
     * @throws NotFoundError if the user doesn't exist
     */
    static async verifyUserExists(user_id) {
        const user = await userRepository.findById(user_id);
        if (!user) {
            logger_1.default.warn('User not found for ticket purchase', { user_id });
            throw new errors_1.NotFoundError("User not found");
        }
        return user;
    }
    /**
     * Check if enough tickets are available for purchase
     * @param event_id - The ID of the event
     * @param requested_amount - The number of tickets requested
     * @returns A promise that resolves to ticket batch and tickets left information
     * @throws NotFoundError if no ticket batch is found
     * @throws BadRequestError if not enough tickets are available
     */
    static async checkTicketAvailability(event_id, requested_amount) {
        const ticketBatch = await ticketBatchRepository.findFirstByEventId(event_id);
        if (!ticketBatch) {
            logger_1.default.warn('No ticket batch found for event', { event_id });
            throw new errors_1.NotFoundError("Ticket batch not found for this event");
        }
        const orders = await orderRepository.findByEventId(event_id);
        let soldTickets = 0;
        if (orders.length > 0) {
            soldTickets = orders.reduce((sum, order) => sum + order.total_amount, 0);
        }
        const ticketsLeft = ticketBatch.total_tickets - soldTickets;
        if (ticketsLeft < requested_amount) {
            logger_1.default.warn('Not enough tickets available', { event_id, ticketsLeft, requested: requested_amount });
            throw new errors_1.BadRequestError(`Insufficient tickets available. Only ${ticketsLeft} tickets remaining.`);
        }
        return { ticketBatch, ticketsLeft };
    }
    /**
     * Retrieves sales overview data for events
     * Calculates sales metrics for events, with optional filtering by month and year
     * @param month - Optional month filter (1-12)
     * @param year - Optional year filter
     * @returns A promise that resolves to sales overview data
     * @throws Will throw an error if there's a problem retrieving or processing the data
     */
    static async getSalesOverview(month, year) {
        logger_1.default.debug('OrdersService.getSalesOverview called', { month, year });
        try {
            const detailedOrdersData = await orderRepository.getEventSalesDetails(month, year);
            const eventDataMap = this.processEventSalesData(detailedOrdersData);
            const eventsOverview = await this.generateEventsOverview(eventDataMap);
            const totals = this.calculateSalesTotals(eventsOverview);
            const periodDescription = this.generatePeriodDescription(month, year);
            const responseData = {
                period: {
                    month,
                    year,
                    description: periodDescription
                },
                total_events: eventsOverview.length,
                total_orders: totals.totalOrders,
                total_tickets_sold: totals.totalTicketsSold,
                total_revenue: totals.totalRevenue,
                average_revenue_per_event: eventsOverview.length > 0 ?
                    Math.round(totals.totalRevenue / eventsOverview.length) : 0,
                events: eventsOverview.sort((a, b) => b.total_revenue - a.total_revenue)
            };
            logger_1.default.info('Sales overview retrieved successfully', {
                total_events: eventsOverview.length,
                totalOrders: totals.totalOrders,
                totalTicketsSold: totals.totalTicketsSold,
                totalRevenue: totals.totalRevenue
            });
            return responseData;
        }
        catch (error) {
            logger_1.default.error('Error in getSalesOverview:', error);
            throw error;
        }
    }
    /**
     * Process event sales data into a map grouped by event ID
     * @param detailedOrdersData - Raw order data from repository
     * @returns Map of event data grouped by event ID
     */
    static processEventSalesData(detailedOrdersData) {
        const eventDataMap = new Map();
        for (const order of detailedOrdersData) {
            if (!order.event_id || !order.Events)
                continue;
            const eventId = order.event_id;
            if (!eventDataMap.has(eventId)) {
                eventDataMap.set(eventId, {
                    event: order.Events,
                    orders: [],
                    totalTickets: 0,
                    totalRevenue: 0
                });
            }
            const eventData = eventDataMap.get(eventId);
            eventData.orders.push(order);
            eventData.totalTickets += order.total_amount;
            eventData.totalRevenue += order.total_amount;
        }
        return eventDataMap;
    }
    /**
     * Generate events overview from processed event data
     * @param eventDataMap - Map of event data grouped by event ID
     * @returns Array of event overview objects
     */
    static async generateEventsOverview(eventDataMap) {
        const eventsOverview = [];
        for (const [eventId, eventData] of eventDataMap) {
            const ticketBatch = await ticketBatchRepository.findFirstByEventId(eventId);
            const ticketPrice = ticketBatch?.price || 0;
            const ticketsAvailable = ticketBatch?.total_tickets || 0;
            const eventRevenue = eventData.totalTickets * ticketPrice;
            const eventOverview = {
                event_id: eventId,
                event_title: eventData.event.title,
                event_description: eventData.event.description,
                event_start_time: eventData.event.start_time.toISOString(),
                event_end_time: eventData.event.end_time.toISOString(),
                total_orders: eventData.orders.length,
                total_tickets_sold: eventData.totalTickets,
                total_revenue: eventRevenue,
                ticket_price: ticketPrice,
                tickets_available: ticketsAvailable,
                sales_percentage: ticketsAvailable > 0 ?
                    Math.round((eventData.totalTickets / ticketsAvailable) * 100) : 0
            };
            eventsOverview.push(eventOverview);
        }
        return eventsOverview;
    }
    /**
     * Calculate sales totals from events overview
     * @param eventsOverview - Array of event overview objects
     * @returns Object containing total orders, tickets sold, and revenue
     */
    static calculateSalesTotals(eventsOverview) {
        let totalOrders = 0;
        let totalTicketsSold = 0;
        let totalRevenue = 0;
        for (const event of eventsOverview) {
            totalOrders += event.total_orders;
            totalTicketsSold += event.total_tickets_sold;
            totalRevenue += event.total_revenue;
        }
        return { totalOrders, totalTicketsSold, totalRevenue };
    }
    /**
     * Generate period description based on month and year filters
     * @param month - Optional month filter
     * @param year - Optional year filter
     * @returns Formatted period description string
     */
    static generatePeriodDescription(month, year) {
        let periodDescription = "All time";
        if (month && year) {
            const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            periodDescription = `${monthNames[month - 1]} ${year}`;
        }
        else if (year) {
            periodDescription = `Year ${year}`;
        }
        return periodDescription;
    }
    /**
     * Retrieves user purchase report data
     * Calculates user purchasing behavior metrics, with optional filtering by month and year
     * @param month - Optional month filter (1-12)
     * @param year - Optional year filter
     * @returns A promise that resolves to user purchase report data
     * @throws Will throw an error if there's a problem retrieving or processing the data
     */
    static async getUserPurchaseReport(month, year) {
        logger_1.default.debug('OrdersService.getUserPurchaseReport called', { month, year });
        try {
            const purchaseData = await orderRepository.getUserPurchaseDetails(month, year);
            const userDataMap = this.processUserPurchaseData(purchaseData);
            const { totalOrders, totalTickets, totalRevenue } = this.calculatePurchaseTotals(userDataMap);
            const userStats = this.generateUserStats(userDataMap);
            const frequentBuyers = this.getFrequentBuyers(userStats);
            userStats.sort((a, b) => b.total_spent - a.total_spent);
            const totalUsers = userStats.length;
            const averageTicketsPerOrder = totalOrders > 0 ?
                Math.round((totalTickets / totalOrders) * 100) / 100 : 0;
            const averageOrdersPerUser = totalUsers > 0 ?
                Math.round((totalOrders / totalUsers) * 100) / 100 : 0;
            const averageSpendingPerUser = totalUsers > 0 ?
                Math.round((totalRevenue / totalUsers) * 100) / 100 : 0;
            const periodDescription = this.generatePeriodDescription(month, year);
            const responseData = {
                period: {
                    month,
                    year,
                    description: periodDescription
                },
                summary: {
                    total_users: totalUsers,
                    total_orders: totalOrders,
                    total_tickets_sold: totalTickets,
                    total_revenue: totalRevenue,
                    average_tickets_per_order: averageTicketsPerOrder,
                    average_orders_per_user: averageOrdersPerUser,
                    average_spending_per_user: averageSpendingPerUser
                },
                user_stats: userStats,
                frequent_buyers: frequentBuyers
            };
            logger_1.default.info('User purchase report retrieved successfully', {
                totalUsers,
                totalOrders,
                totalTickets,
                totalRevenue
            });
            return responseData;
        }
        catch (error) {
            logger_1.default.error('Error in getUserPurchaseReport:', error);
            throw error;
        }
    }
    /**
     * Process user purchase data into a map grouped by user ID
     * @param purchaseData - Raw purchase data from repository
     * @returns Map of user data grouped by user ID
     */
    static processUserPurchaseData(purchaseData) {
        const userDataMap = new Map();
        let totalOrders = 0;
        let totalTickets = 0;
        let totalRevenue = 0;
        for (const order of purchaseData) {
            if (!order.user_id || !order.Events || !order.Users)
                continue;
            const userId = order.user_id;
            const ticketPrice = order.Events.TicketBatches?.[0]?.price || 0;
            const orderRevenue = order.total_amount * ticketPrice;
            totalOrders++;
            totalTickets += order.total_amount;
            totalRevenue += orderRevenue;
            if (!userDataMap.has(userId)) {
                userDataMap.set(userId, {
                    user_id: userId,
                    user_email: order.Users.email,
                    user_name: `${order.Users.first_name || ''} ${order.Users.last_name || ''}`.trim() || 'Unknown User',
                    orders: [],
                    total_orders: 0,
                    total_tickets_purchased: 0,
                    total_spent: 0,
                    events_attended: new Set(),
                    purchase_dates: []
                });
            }
            const userData = userDataMap.get(userId);
            userData.orders.push(order);
            userData.total_orders++;
            userData.total_tickets_purchased += order.total_amount;
            userData.total_spent += orderRevenue;
            userData.events_attended.add(order.event_id);
            userData.purchase_dates.push(order.created_at);
        }
        return userDataMap;
    }
    /**
     * Calculate purchase totals from user data map
     * @param userDataMap - Map of user data grouped by user ID
     * @returns Object containing total orders, tickets, and revenue
     */
    static calculatePurchaseTotals(userDataMap) {
        let totalOrders = 0;
        let totalTickets = 0;
        let totalRevenue = 0;
        for (const userData of userDataMap.values()) {
            totalOrders += userData.total_orders;
            totalTickets += userData.total_tickets_purchased;
            totalRevenue += userData.total_spent;
        }
        return { totalOrders, totalTickets, totalRevenue };
    }
    /**
     * Generate user statistics from processed user data
     * @param userDataMap - Map of user data grouped by user ID
     * @returns Array of user statistics objects
     */
    static generateUserStats(userDataMap) {
        const userStats = [];
        for (const [userId, userData] of userDataMap) {
            const sortedDates = userData.purchase_dates.sort((a, b) => a.getTime() - b.getTime());
            userStats.push({
                user_id: userId,
                user_email: userData.user_email,
                user_name: userData.user_name,
                total_orders: userData.total_orders,
                total_tickets_purchased: userData.total_tickets_purchased,
                total_spent: userData.total_spent,
                average_tickets_per_order: userData.total_orders > 0 ?
                    Math.round((userData.total_tickets_purchased / userData.total_orders) * 100) / 100 : 0,
                events_attended: userData.events_attended.size,
                first_purchase_date: sortedDates[0]?.toISOString() || '',
                last_purchase_date: sortedDates[sortedDates.length - 1]?.toISOString() || ''
            });
        }
        return userStats;
    }
    /**
     * Get top 10 frequent buyers from user statistics
     * @param userStats - Array of user statistics objects
     * @returns Array of top 10 frequent buyers
     */
    static getFrequentBuyers(userStats) {
        const sortedBySpent = [...userStats].sort((a, b) => b.total_spent - a.total_spent);
        return sortedBySpent.slice(0, 10).map((user, index) => ({
            user_id: user.user_id,
            user_email: user.user_email,
            user_name: user.user_name,
            total_orders: user.total_orders,
            total_tickets_purchased: user.total_tickets_purchased,
            total_spent: user.total_spent,
            rank: index + 1
        }));
    }
    /**
     * Retrieves order details by ID
     * @param orderId - The ID of the order to retrieve
     * @returns A promise that resolves to the order details
     * @throws Will throw an error if the order is not found
     */
    static async getOrderById(orderId) {
        logger_1.default.debug('OrdersService.getOrderById called', { orderId });
        try {
            const order = await orderRepository.findById(orderId);
            if (!order) {
                logger_1.default.warn('Order not found', { orderId });
                throw new errors_1.NotFoundError('Order not found');
            }
            const tickets = await ticketRepository.findByOrderId(orderId);
            logger_1.default.info('Order retrieved successfully', { orderId });
            return {
                ...order,
                tickets
            };
        }
        catch (error) {
            logger_1.default.error('Error in getOrderById:', error);
            throw error;
        }
    }
    /**
     * Retrieves all orders for a specific user
     * @param userId - The ID of the user
     * @returns A promise that resolves to an array of user orders
     * @throws Will throw an error if there's a problem retrieving the orders
     */
    static async getUserOrders(userId) {
        logger_1.default.debug('OrdersService.getUserOrders called', { userId });
        try {
            const orders = await orderRepository.findByUserId(userId);
            const enrichedOrders = await this.enrichOrdersWithTickets(orders);
            logger_1.default.info('User orders retrieved successfully', { userId, order_count: orders.length });
            return enrichedOrders;
        }
        catch (error) {
            logger_1.default.error('Error in getUserOrders:', error);
            throw error;
        }
    }
    /**
     * Enrich orders with ticket information
     * @param orders - Array of orders to enrich
     * @returns A promise that resolves to an array of enriched orders
     */
    static async enrichOrdersWithTickets(orders) {
        const enrichedOrders = [];
        for (const order of orders) {
            const tickets = await ticketRepository.findByOrderId(order.id);
            enrichedOrders.push({
                ...order,
                tickets
            });
        }
        return enrichedOrders;
    }
    /**
     * Cancels an order
     * @param orderId - The ID of the order to cancel
     * @returns A promise that resolves to the cancellation result
     * @throws Will throw an error if the order is not found or cannot be cancelled
     */
    static async cancelOrder(orderId) {
        logger_1.default.debug('OrdersService.cancelOrder called', { orderId });
        try {
            const order = await orderRepository.findById(orderId);
            if (!order) {
                logger_1.default.warn('Order not found for cancellation', { orderId });
                throw new errors_1.NotFoundError('Order not found');
            }
            logger_1.default.info('Order cancellation requested', { orderId });
            return {
                message: 'Order cancellation requested',
                orderId
            };
        }
        catch (error) {
            logger_1.default.error('Error in cancelOrder:', error);
            throw error;
        }
    }
}
exports.OrdersService = OrdersService;
//# sourceMappingURL=orders.service.js.map