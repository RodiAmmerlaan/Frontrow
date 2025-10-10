# Standardized API Response Format

## Overview
This document describes the standardized response format used across all API endpoints in the FrontRow backend application. All controllers now use consistent response structures to improve client-side handling and maintainability.

## Response Structure

### Success Responses
All successful responses now return only the data directly:
```json
{
  "id": 1,
  "name": "Resource Name"
}
```

### Error Responses
All error responses follow this structure:
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error description"
}
```

## HTTP Status Codes

The API uses standard HTTP status codes:

- **200**: OK - Successful GET, PUT, PATCH requests
- **201**: Created - Successful POST requests
- **204**: No Content - Successful DELETE requests
- **400**: Bad Request - Invalid request data
- **401**: Unauthorized - Missing or invalid authentication
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource doesn't exist
- **500**: Internal Server Error - Unexpected server error

## Utility Functions

The `response.util.ts` module provides helper functions for consistent responses:

### sendSuccess(response, data, message?, statusCode?)
Sends a successful response with only the data
```typescript
return sendSuccess(response, { id: 1, name: 'Event' }, 'Event created successfully', 201);
```

### sendError(response, error, statusCode, message?)
Sends a generic error response
```typescript
return sendError(response, 'DATABASE_ERROR', 500, 'Failed to connect to database');
```

### sendBadRequest(response, message?)
Sends a 400 Bad Request error
```typescript
return sendBadRequest(response, 'Missing required parameters');
```

### sendUnauthorized(response, message?)
Sends a 401 Unauthorized error
```typescript
return sendUnauthorized(response, 'Invalid credentials');
```

### sendForbidden(response, message?)
Sends a 403 Forbidden error
```typescript
return sendForbidden(response, 'Insufficient permissions');
```

### sendNotFound(response, message?)
Sends a 404 Not Found error
```typescript
return sendNotFound(response, 'Resource not found');
```

## Example Responses

### Successful Event Creation (201)
```json
{
  "id": "event-123",
  "name": "Concert"
}
```

### User Not Found (404)
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "User not found"
}
```

### Validation Error (400)
```json
{
  "success": false,
  "error": "BAD_REQUEST",
  "message": "Email is required"
}
```

## Benefits

1. **Consistency**: All endpoints return predictable response structures
2. **Client Reliability**: Frontend can reliably check `success` property
3. **Error Handling**: Standardized error codes and messages
4. **Maintainability**: Centralized response handling logic
5. **Documentation**: Clear contract between frontend and backend