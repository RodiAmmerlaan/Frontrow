import { TicketBatches } from "@prisma/client";
import { BaseRepositoryImpl } from "./BaseRepositoryImpl";
import { TicketBatchRepository } from "./TicketBatchRepository";

export class TicketBatchRepositoryImpl extends BaseRepositoryImpl<TicketBatches, string> implements TicketBatchRepository {
  /**
   * Find a ticket batch by its ID
   * @param id - The unique identifier of the ticket batch
   * @returns A promise that resolves to the ticket batch or null if not found
   */
  async findById(id: string): Promise<TicketBatches | null> {
    return await this.prisma.ticketBatches.findUnique({ where: { id } });
  }

  /**
   * Find all ticket batches
   * @returns A promise that resolves to an array of all ticket batches
   */
  async findAll(): Promise<TicketBatches[]> {
    return await this.prisma.ticketBatches.findMany();
  }

  /**
   * Create a new ticket batch
   * @param ticketBatchData - The ticket batch data to create
   * @returns A promise that resolves to the created ticket batch
   */
  async create(ticketBatchData: Omit<TicketBatches, 'id' | 'created_at'>): Promise<TicketBatches> {
    return await this.prisma.ticketBatches.create({ data: ticketBatchData });
  }

  /**
   * Update an existing ticket batch
   * @param id - The unique identifier of the ticket batch to update
   * @param ticketBatchData - The updated ticket batch data
   * @returns A promise that resolves to the updated ticket batch or null if not found
   */
  async update(id: string, ticketBatchData: Partial<TicketBatches>): Promise<TicketBatches | null> {
    try {
      return await this.prisma.ticketBatches.update({
        where: { id },
        data: ticketBatchData
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Delete a ticket batch by its ID
   * @param id - The unique identifier of the ticket batch to delete
   * @returns A promise that resolves to true if deletion was successful, false otherwise
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.ticketBatches.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if a ticket batch exists by its ID
   * @param id - The unique identifier to check
   * @returns A promise that resolves to true if the ticket batch exists, false otherwise
   */
  async exists(id: string): Promise<boolean> {
    const ticketBatch = await this.prisma.ticketBatches.findUnique({ where: { id } });
    return !!ticketBatch;
  }

  /**
   * Find ticket batches by event ID
   * @param eventId - The ID of the event
   * @returns A promise that resolves to an array of ticket batches for the event
   */
  async findByEventId(eventId: string): Promise<TicketBatches[]> {
    return await this.prisma.ticketBatches.findMany({ where: { event_id: eventId } });
  }

  /**
   * Find the first ticket batch for an event
   * @param eventId - The ID of the event
   * @returns A promise that resolves to the first ticket batch or null if not found
   */
  async findFirstByEventId(eventId: string): Promise<TicketBatches | null> {
    return await this.prisma.ticketBatches.findFirst({ where: { event_id: eventId } });
  }

  /**
   * Creates a new ticket batch for an event
   * @param event_id - The ID of the event
   * @param total_tickets - The total number of tickets in this batch
   * @param price - The price per ticket
   * @returns A promise that resolves to the created ticket batch
   */
  async createTicketBatch(event_id: string, total_tickets: number, price: number): Promise<TicketBatches> {
    return await this.create({
        event_id: event_id,
        total_tickets: total_tickets,
        price: price
    });
  }
}