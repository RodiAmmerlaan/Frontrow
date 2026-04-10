# Stage 1: Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Install serve to serve the static files
RUN npm install -g serve

# Copy built application from builder stage
COPY --from=builder /app/build ./build

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001

# Change ownership of the app directory to the non-root user
RUN chown -R appuser:nodejs /app
USER appuser

# Expose port
EXPOSE 3001

# Serve the app
CMD ["serve", "-s", "build", "-l", "3001"]