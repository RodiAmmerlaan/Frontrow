"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buyTickets = buyTickets;
exports.createTickets = createTickets;
exports.getUserById = getUserById;
exports.getEventById = getEventById;
const OrderRepositoryImpl_1 = require("../../repositories/OrderRepositoryImpl");
const TicketRepositoryImpl_1 = require("../../repositories/TicketRepositoryImpl");
const UserRepositoryImpl_1 = require("../../repositories/UserRepositoryImpl");
const EventRepositoryImpl_1 = require("../../repositories/EventRepositoryImpl");
const orderRepository = new OrderRepositoryImpl_1.OrderRepositoryImpl();
const ticketRepository = new TicketRepositoryImpl_1.TicketRepositoryImpl();
const userRepository = new UserRepositoryImpl_1.UserRepositoryImpl();
const eventRepository = new EventRepositoryImpl_1.EventRepositoryImpl();
/**
 * Creates a new order for ticket purchase
 * @param event_id - The ID of the event for which tickets are being purchased
 * @param user_id - The ID of the user purchasing the tickets
 * @param total_amount - The total number of tickets being purchased
 * @returns A promise that resolves to the created order
 */
async function buyTickets(event_id, user_id, total_amount) {
    return await orderRepository.create({
        user_id: user_id,
        event_id: event_id,
        total_amount: total_amount
    });
}
;
/**
 * Creates multiple tickets for an order
 * @param order_id - The ID of the order for which tickets are being created
 * @param user_id - The ID of the user who will own the tickets
 * @param amount - The number of tickets to create
 * @returns A promise that resolves to an array of created tickets
 */
async function createTickets(order_id, user_id, amount) {
    const ticketsData = Array.from({ length: amount }, (_, i) => ({
        order_id: order_id,
        assigned_to: user_id,
        ticket_number: "T-" + order_id.split("-")[0] + "-" + (i + 1).toString()
    }));
    return await ticketRepository.createMany(ticketsData);
}
/**
 * Retrieves user information by user ID
 * @param user_id - The ID of the user to retrieve
 * @returns A promise that resolves to the user's email, first name, and last name, or null if not found
 */
async function getUserById(user_id) {
    const user = await userRepository.findById(user_id);
    if (!user)
        return null;
    return {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
    };
}
/**
 * Retrieves event information by event ID
 * @param event_id - The ID of the event to retrieve
 * @returns A promise that resolves to the event's details, or null if not found
 */
async function getEventById(event_id) {
    const event = await eventRepository.findById(event_id);
    if (!event)
        return null;
    return {
        id: event.id,
        title: event.title,
        description: event.description,
        start_time: event.start_time,
        end_time: event.end_time
    };
}
//# sourceMappingURL=orders.dao.js.map