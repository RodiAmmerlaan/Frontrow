"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketRepositoryImpl = void 0;
const BaseRepositoryImpl_1 = require("./BaseRepositoryImpl");
class TicketRepositoryImpl extends BaseRepositoryImpl_1.BaseRepositoryImpl {
    /**
     * Find a ticket by its ID
     * @param id - The unique identifier of the ticket
     * @returns A promise that resolves to the ticket or null if not found
     */
    async findById(id) {
        return await this.prisma.tickets.findUnique({ where: { id } });
    }
    /**
     * Find all tickets
     * @returns A promise that resolves to an array of all tickets
     */
    async findAll() {
        return await this.prisma.tickets.findMany();
    }
    /**
     * Create a new ticket
     * @param ticketData - The ticket data to create
     * @returns A promise that resolves to the created ticket
     */
    async create(ticketData) {
        return await this.prisma.tickets.create({ data: ticketData });
    }
    /**
     * Update an existing ticket
     * @param id - The unique identifier of the ticket to update
     * @param ticketData - The updated ticket data
     * @returns A promise that resolves to the updated ticket or null if not found
     */
    async update(id, ticketData) {
        try {
            return await this.prisma.tickets.update({
                where: { id },
                data: ticketData
            });
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Delete a ticket by its ID
     * @param id - The unique identifier of the ticket to delete
     * @returns A promise that resolves to true if deletion was successful, false otherwise
     */
    async delete(id) {
        try {
            await this.prisma.tickets.delete({ where: { id } });
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Check if a ticket exists by its ID
     * @param id - The unique identifier to check
     * @returns A promise that resolves to true if the ticket exists, false otherwise
     */
    async exists(id) {
        const ticket = await this.prisma.tickets.findUnique({ where: { id } });
        return !!ticket;
    }
    /**
     * Find tickets by order ID
     * @param orderId - The ID of the order
     * @returns A promise that resolves to an array of tickets for the order
     */
    async findByOrderId(orderId) {
        const now = new Date();
        return await this.prisma.tickets.findMany({
            where: {
                AND: [
                    { order_id: orderId },
                    { created_at: { lte: now } }
                ]
            }
        });
    }
    /**
     * Find tickets by user ID
     * @param userId - The ID of the user
     * @returns A promise that resolves to an array of tickets assigned to the user
     */
    async findByUserId(userId) {
        return await this.prisma.tickets.findMany({ where: { assigned_to: userId } });
    }
    /**
     * Create multiple tickets at once
     * @param tickets - Array of ticket data to create
     * @returns A promise that resolves to an array of created tickets
     */
    async createMany(tickets) {
        await this.prisma.tickets.createMany({
            data: tickets
        });
        const ticketNumbers = tickets.map(ticket => ticket.ticket_number);
        return await this.prisma.tickets.findMany({
            where: {
                ticket_number: {
                    in: ticketNumbers
                }
            }
        });
    }
    /**
     * Creates multiple tickets for an order
     * @param order_id - The ID of the order for which tickets are being created
     * @param user_id - The ID of the user who will own the tickets
     * @param amount - The number of tickets to create
     * @returns A promise that resolves to an array of created tickets
     */
    async createTickets(order_id, user_id, amount) {
        const ticketsData = Array.from({ length: amount }, (_, i) => ({
            order_id: order_id,
            assigned_to: user_id,
            ticket_number: "T-" + order_id.split("-")[0] + "-" + (i + 1).toString()
        }));
        return await this.createMany(ticketsData);
    }
}
exports.TicketRepositoryImpl = TicketRepositoryImpl;
//# sourceMappingURL=TicketRepositoryImpl.js.map