# Backend

This is the backend for the FrontRow application.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (copy .env.example to .env and fill in values)

3. Run the development server:
   ```bash
   npm run dev
   ```

## Testing

This project includes comprehensive unit tests for all services.

To run tests:
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

See [tests/README.md](tests/README.md) for more details about the testing setup.

## API Documentation

API documentation is available at `/api/v1/docs` when the server is running.