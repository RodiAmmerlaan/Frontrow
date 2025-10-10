import { Users } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";

export interface UserRepository extends BaseRepository<Users, string> {
  /**
   * Find a user by their email address
   * @param email - The email address of the user to find
   * @returns A promise that resolves to the user or null if not found
   */
  findByEmail(email: string): Promise<Users | null>;

  /**
   * Find users by their role
   * @param role - The role to filter users by
   * @returns A promise that resolves to an array of users with the specified role
   */
  findByRole(role: string): Promise<Users[]>;

  /**
   * Find or create a user (upsert)
   * @param userData - The user data to find or create
   * @returns A promise that resolves to the found or created user
   */
  findOrCreate(userData: Partial<Users>): Promise<Users>;
  
  /**
   * Registers a new user in the database
   * @param email - The user's email address
   * @param password - The hashed password
   * @param first_name - The user's first name
   * @param last_name - The user's last name
   * @param street - The user's street address
   * @param house_number - The user's house number
   * @param postal_code - The user's postal code
   * @param city - The user's city
   * @returns A promise that resolves to the created or updated user
   */
  registerUser(email: string, password: string, first_name: string, last_name: string, street: string, house_number: string, postal_code: string, city: string): Promise<Users>;
}