# Repository Pattern Implementation

This directory contains the implementation of the Repository pattern for database operations in the application.

## Overview

The Repository pattern is a design pattern that creates an abstraction layer between the data access layer and the business logic layer. It promotes separation of concerns and makes the code more testable and maintainable.

## Structure

- `BaseRepository.ts` - Base repository interface defining common CRUD operations
- `BaseRepositoryImpl.ts` - Abstract base repository implementation using Prisma
- Entity-specific interfaces:
  - `UserRepository.ts`
  - `EventRepository.ts`
  - `OrderRepository.ts`
  - `TicketRepository.ts`
  - `TicketBatchRepository.ts`
  - `RefreshTokenRepository.ts`
- Entity-specific implementations:
  - `UserRepositoryImpl.ts`
  - `EventRepositoryImpl.ts`
  - `OrderRepositoryImpl.ts`
  - `TicketRepositoryImpl.ts`
  - `TicketBatchRepositoryImpl.ts`
  - `RefreshTokenRepositoryImpl.ts`
- `index.ts` - Export file for all repositories

## Benefits

1. **Separation of Concerns**: Database operations are separated from business logic
2. **Testability**: Repositories can be easily mocked for unit testing
3. **Maintainability**: Changes to the data access layer are isolated
4. **Consistency**: Standardized interface for all database operations
5. **Flexibility**: Easy to switch data sources or ORMs in the future

## Usage

To use a repository, simply instantiate the implementation class:

```typescript
import { UserRepositoryImpl } from './repositories/UserRepositoryImpl';

const userRepository = new UserRepositoryImpl();
const user = await userRepository.findById('user-id');
```

## Migration from DAO Pattern

The previous DAO (Data Access Object) pattern has been refactored to use the Repository pattern while maintaining the same public API. This ensures backward compatibility with existing services.