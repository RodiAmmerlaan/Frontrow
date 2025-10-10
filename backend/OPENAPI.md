# OpenAPI Documentation

The backend now includes automatic OpenAPI documentation generation using JSDoc-style annotations in the controller files.

## Endpoints

- `/api/v1/docs/` - Swagger UI interface for browsing the API documentation
- `/api/v1/docs/json` - Raw OpenAPI JSON specification

## How it works

The OpenAPI specification is generated automatically from JSDoc annotations in the controller files. The system uses:

- `swagger-jsdoc` to extract the OpenAPI definitions from JSDoc comments
- `swagger-ui-express` to serve the interactive Swagger UI

## Adding Documentation to Controllers

To add documentation for a new endpoint, add JSDoc annotations in the following format:

```javascript
/**
 * @openapi
 * /path:
 *   get:
 *     summary: Brief description
 *     description: Detailed description
 *     tags:
 *       - TagName
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */
```

## Available Tags

Current API tags include:
- Authentication
- Events
- Orders
- Utilities

## Security

Endpoints that require authentication will have the `bearerAuth` security scheme applied, which uses JWT tokens.

## Components

Reusable schemas are defined in the OpenAPI configuration:
- Event
- User
- Order
- Address
- AuthResponse

These can be referenced in endpoint definitions using `$ref: '#/components/schemas/SchemaName'`.

## Documented Endpoints

The following endpoints are currently documented:
1. GET /events - Retrieve all events
2. GET /events/{eventId} - Retrieve a specific event by ID
3. POST /events/create - Create a new event
4. GET /events/search - Search for events by name
5. GET /events/sales-overview - Retrieve sales overview data
6. GET /events/user-purchase-report - Retrieve user purchase report data
7. POST /auth/login - User login
8. POST /auth/register - User registration
9. GET /auth/profile - Retrieve authenticated user's profile
10. POST /auth/logout - User logout
11. POST /auth/refresh - Refresh authentication tokens
12. POST /orders/buy - Purchase tickets for an event
13. GET /orders/{orderId} - Retrieve order details by ID
14. GET /orders/user/{userId} - Retrieve all orders for a specific user
15. GET /address-check - Check address information based on postal code and house number