# FrontRow Application

This is a full-stack TypeScript application with a React frontend and Node.js/Express backend, using PostgreSQL as the database.

## Docker Setup

This project includes Docker configuration for running all services:

- Frontend (React app) on port 3001
- Backend (Node.js/Express app) on port 3000
- PostgreSQL database on port 5432

### Prerequisites

- Docker
- Docker Compose

### Running the Application

To start all services:

```bash
docker-compose up -d
```

To run in detached mode:

```bash
docker-compose up -d
```

To stop all services:

```bash
docker-compose down
```

To view logs:

```bash
docker-compose logs
```

### Services Overview

1. **Database (PostgreSQL)**
   - Image: postgres:13
   - Port: 54321
   - Credentials are defined in docker-compose.yml

2. **Backend (Node.js/Express)**
   - Built from ./backend/Dockerfile
   - Port: 3000
   - Environment variables are defined in docker-compose.yml

3. **Frontend (React)**
   - Built from ./frontend/Dockerfile
   - Port: 3001
   - Serves static files using `serve`

### Accessing the Application

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- Backend Swagger: http://localhost:3000/api/v1/docs
- Database: localhost:54321 (PostgreSQL)

### Project Structure

```
.
├── backend/
│   ├── Dockerfile          # Backend Docker configuration
│   ├── src/                # Backend source code
│   └── package.json        # Backend dependencies
├── frontend/
│   ├── Dockerfile          # Frontend Docker configuration
│   ├── src/                # Frontend source code
│   └── package.json        # Frontend dependencies
├── docker-compose.yml      # Orchestration of all services
└── Dockerfile              # Root Dockerfile with instructions
```

### Development vs Production

The Docker configuration is set up for production by default. For development, you might want to use the npm scripts directly:

- Backend development: `npm run dev` (in backend directory)
- Frontend development: `npm run start` (in frontend directory)