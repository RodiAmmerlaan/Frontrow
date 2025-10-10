import { Tickets } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";

export interface TicketRepository extends BaseRepository<Tickets, string> {
  /**
   * Find tickets by order ID
   * @param orderId - The ID of the order
   * @returns A promise that resolves to an array of tickets for the order
   */
  findByOrderId(orderId: string): Promise<Tickets[]>;

  /**
   * Find tickets by user ID
   * @param userId - The ID of the user
   * @returns A promise that resolves to an array of tickets assigned to the user
   */
  findByUserId(userId: string): Promise<Tickets[]>;

  /**
   * Create multiple tickets at once
   * @param tickets - Array of ticket data to create
   * @returns A promise that resolves to an array of created tickets
   */
  createMany(tickets: Omit<Tickets, 'id'>[]): Promise<Tickets[]>;
}