# FrontRow Backend

## Setup Instructions

### Docker Setup

1. Build the Docker images:
   ```bash
   docker-compose build
   ```

2. Start the services:
   ```bash
   docker-compose up
   ```

The database seeding is handled automatically by the `seed` service in docker-compose.yml.

### Manual Database Seeding

If you need to seed the database manually, you can run:

```bash
npm run seed
```

Or using Docker:

```bash
docker-compose run --rm backend npm run seed
```

### Development

To run the backend in development mode:

```bash
npm run dev
```

### Building

To build the TypeScript code:

```bash
npm run build
```

### Testing

To run tests:

```bash
npm test
```

To run tests with coverage:

```bash
npm run test:coverage
```