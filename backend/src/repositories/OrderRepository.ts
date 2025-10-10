import { Orders } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";

export interface OrderRepository extends BaseRepository<Orders, string> {
  /**
   * Find orders by user ID
   * @param userId - The ID of the user
   * @returns A promise that resolves to an array of orders for the user
   */
  findByUserId(userId: string): Promise<Orders[]>;

  /**
   * Find orders by event ID
   * @param eventId - The ID of the event
   * @returns A promise that resolves to an array of orders for the event
   */
  findByEventId(eventId: string): Promise<Orders[]>;

  /**
   * Get orders with related event and user information
   * @returns A promise that resolves to an array of detailed order records
   */
  findWithDetails(): Promise<Orders[]>;
}