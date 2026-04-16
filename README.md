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

### First time using the application

Before starting Docker, the applications need to be installed first. This is a one-time action.

In both folders `backend` and `frontend`, run the following command:

```bash
npm install
```

This will generate a package-lock.json file in both folders.

### Running the Application

To start all services:

```bash
docker compose up -d
```

To stop all services:

```bash
docker compose down
```

To view logs:

```bash
docker compose logs
```

After the first time running docker compose, the application wil appear in Docker Desktop and will start automatically when it is opened.

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

#### Users

You can create your own regular user. There are by default two accounts available:

Administrator: admin@frontrow.test
Password: Admin123!

User: user@user.test
Password: User123!

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