# Backend Testing

This directory contains unit tests for the backend services and controllers.

## Running Tests

To run all tests:

```bash
npm test
```

To run tests in watch mode:

```bash
npm run test:watch
```

To generate a coverage report:

```bash
npm run test:coverage
```

## Test Structure

- `services/` - Unit tests for service classes
- `controllers/` - Unit tests for controller classes
- `repositories/` - Unit tests for repository classes
- `middleware/` - Unit tests for middleware functions
- `mocks/` - Test utilities and mock data

## Technologies Used

- Jest - Testing framework
- TypeScript - Type checking
- Supertest - HTTP assertions (for integration tests)

## Test Coverage

The current tests cover:

1. AuthService - Authentication and user management
2. TokenService - JWT token handling
3. EventsService - Event management
4. OrdersService - Order and ticket management
5. Events Controllers - HTTP endpoint handling for events
6. Orders Controllers - HTTP endpoint handling for orders
7. Auth Controllers - HTTP endpoint handling for authentication
8. Middleware - Authentication, validation, error handling, and correlation ID middleware

Each service and controller is tested for:
- Successful operations
- Error handling
- Edge cases