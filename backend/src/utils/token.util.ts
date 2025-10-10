import { Request } from 'express';
import { verifyAccessToken } from '../services/token.service';

/**
 * Extracts and verifies JWT token from request authorization header
 * @param request - Express request object
 * @returns The decoded JWT payload or null if token is missing/invalid
 */
export function extractAndVerifyToken(request: Request): { 
  success: true; 
  decoded: ReturnType<typeof verifyAccessToken> 
} | { 
  success: false; 
  error: string 
} {
  try {
    const jwt = request.headers.authorization?.split(" ")[1]?.trim();
    if (!jwt) {
      return { success: false, error: "No token provided" };
    }
    
    const decoded = verifyAccessToken(jwt);
    return { success: true, decoded };
  } catch (error) {
    return { success: false, error: "Invalid or expired token" };
  }
}