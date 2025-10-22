# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including devDependencies needed for building
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy config files
COPY tsconfig.json ./

# Copy source code
COPY src ./src/

# Create logs directory (needed by logger)
RUN mkdir -p logs

# Build TypeScript to JavaScript
RUN npm run build

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory to the non-root user
RUN chown -R nextjs:nodejs /app

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]