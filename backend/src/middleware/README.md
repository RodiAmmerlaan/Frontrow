# Authentication and Authorization Middleware

## Overview
This document describes the authentication and authorization middleware functions that provide centralized security controls for the FrontRow backend application.

## Middleware Functions

### authenticate
Verifies JWT tokens and adds user information to the request object.

**Usage:**
```javascript
import { authenticate } from '../middleware/auth.middleware';

router.get('/protected-route', authenticate, (req, res) => {
  // req.user is now available with user information
});
```

**Functionality:**
- Extracts JWT token from Authorization header
- Verifies token validity using `verifyAccessToken`
- Fetches user details from database
- Adds user object to request: `{ id, email, role }`
- Returns 401 error if token is missing or invalid

### authorizeAdmin
Checks if the authenticated user has ADMIN role.

**Usage:**
```javascript
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

router.get('/admin-only', authenticate, authorizeAdmin, (req, res) => {
  // Only accessible by ADMIN users
});
```

**Functionality:**
- Requires `authenticate` middleware to run first
- Checks if user role is "ADMIN"
- Returns 403 error if user is not an admin
- Returns 401 error if user is not authenticated

### authorizeRoles
Factory function that creates middleware to check if user has specific roles.

**Usage:**
```javascript
import { authenticate, authorizeRoles } from '../middleware/auth.middleware';

// Allow both ADMIN and MODERATOR roles
router.get('/moderated', authenticate, authorizeRoles(['ADMIN', 'MODERATOR']), (req, res) => {
  // Accessible by ADMIN and MODERATOR users
});
```

**Functionality:**
- Requires `authenticate` middleware to run first
- Checks if user role is in the provided roles array
- Returns 403 error if user doesn't have required roles
- Returns 401 error if user is not authenticated

## Validation Middleware

A flexible validation middleware is also available for validating request data using Joi validation schemas.

### Usage
```typescript
import { validateRequest } from '../middleware/validation.middleware';
import Joi from 'joi';

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

router.post('/register', validateRequest(schema), registrationController);
```

### Features
- Validates request body, query parameters, or route parameters using Joi schemas
- Supports all Joi validation features including type checking, length limits, numeric ranges, and regex patterns
- Includes predefined schemas for common validations (email, password, UUID)
- Strips unknown fields by default for security
- Detailed error messages with all validation failures
- Updates request with validated/transformed data

See [VALIDATION.md](./VALIDATION.md) for detailed documentation.

## Error Responses

### Authentication Errors (401)
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "No token provided"
}
```

### Authorization Errors (403)
```json
{
  "success": false,
  "error": "FORBIDDEN",
  "message": "Access denied. Admin role required"
}
```

## Implementation Examples

### Router-level Middleware
```javascript
import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import Joi from 'joi';

export const eventsRouter = Router();

const createEventSchema = Joi.object({
  title: Joi.string().min(1).required()
});

eventsRouter.get("/", getAllEvents);

eventsRouter.post("/create", authenticate, authorizeAdmin, validateRequest(createEventSchema), createEvent);

eventsRouter.post("/admin-action", authenticate, authorizeAdmin, adminController);
```

### Controller Implementation
After applying authentication middleware, controllers can access user information:

```javascript
export async function createEvent(request: Request, response: Response) {
  // User information is available from middleware
  const user = (request as any).user;
  Logger.info(`User ${user.email} is creating an event`);
  
  // With validation middleware, we can safely assume all required fields are present and valid
  const { title } = request.body;
  
  // Proceed with controller logic...
}
```

## Benefits

1. **Centralized Security**: Authentication and authorization logic is in one place
2. **Reusable**: Middleware can be applied to any route
3. **Consistent**: All routes use the same security checks
4. **Maintainable**: Security updates only need to be made in middleware
5. **Clean Controllers**: Controllers don't need to duplicate security logic
6. **Input Validation**: Request data is automatically validated before reaching controllers
7. **Powerful Validation**: Joi provides comprehensive validation capabilities