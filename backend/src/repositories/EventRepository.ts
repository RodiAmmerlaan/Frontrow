import { Events } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";

export interface EventRepository extends BaseRepository<Events, string> {
  /**
   * Find an event by its title
   * @param title - The title of the event to find
   * @returns A promise that resolves to the event or null if not found
   */
  findByTitle(title: string): Promise<Events | null>;

  /**
   * Search for events by name using a case-insensitive partial match
   * @param searchTerm - The term to search for in event titles
   * @returns A promise that resolves to an array of events matching the search term
   */
  searchByName(searchTerm: string): Promise<Events[]>;

  /**
   * Find all events ordered by date, filtering for future events
   * @returns A promise that resolves to an array of events
   */
  findAllByDate(): Promise<Events[]>;

  /**
   * Find events within a date range
   * @param startDate - The start date of the range
   * @param endDate - The end date of the range
   * @returns A promise that resolves to an array of events within the date range
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<Events[]>;
}