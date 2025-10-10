# Logging Implementation with Winston

This document describes the logging implementation using Winston in the backend application.

## Overview

Winston is a multi-transport async logging library for Node.js. It provides a simple and universal logging interface that supports multiple transports (console, file, etc.) and different log levels.

## Log Levels

The application uses the following log levels (in order of priority):

1. **error** - Runtime errors that require immediate attention
2. **warn** - Warning messages that indicate potential issues
3. **info** - General information about application operations
4. **http** - HTTP request logging
5. **debug** - Debug information for development purposes

## Configuration

The logger is configured in `src/utils/logger.ts` with the following features:

- **Transports**:
  - Console output (for development)
  - File output to `logs/error.log` (only error level)
  - File output to `logs/combined.log` (all levels)

- **Format**:
  - Timestamp in `YYYY-MM-DD HH:mm:ss:ms` format
  - Colorized output for console
  - Level-prefixed messages

- **Log Rotation**:
  - Error logs are written to `logs/error.log`
  - All logs are written to `logs/combined.log`
  - The logs directory is automatically created if it doesn't exist

## Usage

To use the logger in any module:

```typescript
import Logger from '../utils/logger';

// Different log levels
Logger.error('This is an error message');
Logger.warn('This is a warning message');
Logger.info('This is an info message');
Logger.http('This is an http message');
Logger.debug('This is a debug message');
```

## Best Practices

1. **Use appropriate log levels**:
   - Use `error` for exceptions and runtime errors
   - Use `warn` for unexpected situations that aren't errors
   - Use `info` for significant application events
   - Use `debug` for detailed diagnostic information

2. **Include context information**:
   ```typescript
   Logger.info(`User ${userId} successfully logged in from IP ${ipAddress}`);
   ```

3. **Log errors with full context**:
   ```typescript
   try {
     // Some operation
   } catch (error) {
     Logger.error('Operation failed:', error);
   }
   ```

4. **Avoid logging sensitive information**:
   - Never log passwords, tokens, or other sensitive data
   - Be careful with user personal information

## Log File Management

- Log files are stored in the `logs/` directory
- The directory is added to `.gitignore` to prevent committing logs to the repository
- In production, consider implementing log rotation to manage file sizes

## Environment-Specific Configuration

- In development: All log levels are enabled
- In production: Only `info` level and above are enabled by default