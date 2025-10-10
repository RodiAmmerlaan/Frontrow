import { Request, Response, NextFunction } from 'express';
import { UserRepositoryImpl } from '../repositories/UserRepositoryImpl';
import { extractAndVerifyToken } from '../utils/token.util';

const userRepository = new UserRepositoryImpl();

/**
 * Middleware function to authenticate a user based on JWT token
 * Verifies the access token and attaches user information to the request object
 * @param request - Express request object
 * @param response - Express response object
 * @param next - Express next function
 * @returns Response with error if authentication fails, otherwise calls next()
 */
export async function authenticate(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const tokenResult = extractAndVerifyToken(request);
    
    if (!tokenResult.success) {
      return response.status(401).json({ 
        success: false, 
        error: "UNAUTHORIZED", 
        message: tokenResult.error
      });
    }
    
    const { decoded } = tokenResult;
    const user = await userRepository.findById(decoded.sub);
    
    if (!user) {
      return response.status(401).json({ 
        success: false, 
        error: "UNAUTHORIZED", 
        message: "Invalid token" 
      });
    }
    
    (request as any).user = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    return response.status(401).json({ 
      success: false, 
      error: "UNAUTHORIZED", 
      message: "Invalid or expired token" 
    });
  }
}

/**
 * Middleware function to authorize admin users
 * Checks if the authenticated user has ADMIN role
 * @param request - Express request object with user attached
 * @param response - Express response object
 * @param next - Express next function
 * @returns Response with error if user is not an admin, otherwise calls next()
 */
export function authorizeAdmin(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const user = (request as any).user;
  
  if (!user) {
    return response.status(401).json({ 
      success: false, 
      error: "UNAUTHORIZED", 
      message: "Authentication required" 
    });
  }
  
  if (user.role !== "ADMIN") {
    return response.status(403).json({ 
      success: false, 
      error: "FORBIDDEN", 
      message: "Access denied. Admin role required" 
    });
  }
  
  next();
}

/**
 * Factory function to create middleware for authorizing specific roles
 * @param roles - Array of roles that are authorized to access the route
 * @returns Middleware function that checks if user has one of the specified roles
 */
export function authorizeRoles(roles: string[]) {
  return (request: Request, response: Response, next: NextFunction) => {
    const user = (request as any).user;
    
    if (!user) {
      return response.status(401).json({ 
        success: false, 
        error: "UNAUTHORIZED", 
        message: "Authentication required" 
      });
    }
    
    if (!roles.includes(user.role)) {
      return response.status(403).json({ 
        success: false, 
        error: "FORBIDDEN", 
        message: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }
    
    next();
  };
}