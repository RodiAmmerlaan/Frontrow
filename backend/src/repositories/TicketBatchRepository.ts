import { TicketBatches } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";

export interface TicketBatchRepository extends BaseRepository<TicketBatches, string> {
  /**
   * Find ticket batches by event ID
   * @param eventId - The ID of the event
   * @returns A promise that resolves to an array of ticket batches for the event
   */
  findByEventId(eventId: string): Promise<TicketBatches[]>;

  /**
   * Find the first ticket batch for an event
   * @param eventId - The ID of the event
   * @returns A promise that resolves to the first ticket batch or null if not found
   */
  findFirstByEventId(eventId: string): Promise<TicketBatches | null>;
}