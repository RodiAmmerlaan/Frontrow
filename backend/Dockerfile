# Stage 1: Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including devDependencies needed for building
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy TypeScript config and source code
COPY tsconfig.json ./
COPY src ./src/

# Build TypeScript to JavaScript
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy Prisma schema and generate client for production
COPY prisma ./prisma/
RUN npx prisma generate

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create logs directory (needed by logger)
RUN mkdir -p logs

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001

# Change ownership of the app directory to the non-root user
RUN chown -R appuser:nodejs /app
USER appuser

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]