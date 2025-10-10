# Validation Middleware

This middleware provides a flexible and reusable way to validate incoming requests in Express.js applications using Joi validation schemas.

## Usage

### Basic Usage

```typescript
import { Router } from 'express';
import { validateRequest } from '../middleware/validation.middleware';
import Joi from 'joi';

// Define a Joi schema for validation
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(18).max(120).required()
});

// For body validation (default)
router.post('/users', validateRequest(userSchema, { source: 'body', sanitize: true }), createUserController);

// For query validation
router.get('/users', validateRequest(userSchema, { source: 'query', sanitize: true }), getUsersController);

// For params validation
router.get('/users/:id', validateRequest(userSchema, { source: 'params', sanitize: true }), getUserController);
```

### Validation Options

```typescript
interface ValidationOptions {
  source: 'body' | 'query' | 'params'; // Where to extract data from
  stripUnknown?: boolean; // Whether to remove unknown fields (default: true)
  sanitize?: boolean; // Whether to sanitize string values to prevent XSS (default: true)
}
```

### Predefined Validation Schemas

The middleware includes some commonly used Joi validation schemas:

```typescript
import { ValidationSchemas } from '../middleware/validation.middleware';

// Email validation
const emailSchema = ValidationSchemas.email();

// Password validation (min 8 characters by default)
const passwordSchema = ValidationSchemas.password(); // min 8 characters
const passwordSchema12 = ValidationSchemas.password(12); // min 12 characters

// UUID validation
const idSchema = ValidationSchemas.uuid();

// Positive integer validation
const countSchema = ValidationSchemas.positiveInteger();
```

### Custom Joi Schemas

You can create custom Joi schemas for complex validation:

```typescript
import Joi from 'joi';

const customSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
  repeat_password: Joi.ref('password'),
  access_token: [Joi.string(), Joi.number()],
  birth_year: Joi.number().integer().min(1900).max(2023),
  email: Joi.string().email().required()
}).with('username', 'birth_year').without('password', 'access_token');
```

## Sanitization

Input sanitization is enabled by default to prevent XSS attacks. The middleware automatically escapes HTML characters in string values. This can be controlled using the `sanitize` option:

```typescript
// Sanitization enabled (default)
validateRequest(schema, { source: 'body', sanitize: true });

// Sanitization disabled
validateRequest(schema, { source: 'body', sanitize: false });
```

## Error Handling

Validation errors are thrown as `ValidationError` instances, which are handled by the global error handler middleware. The error response will include details about which validations failed.

## Examples

### User Registration Validation

```typescript
import { Router } from 'express';
import { validateRequest, ValidationSchemas } from '../middleware/validation.middleware';
import Joi from 'joi';

const router = Router();

const registrationSchema = Joi.object({
  email: ValidationSchemas.email().required(),
  password: ValidationSchemas.password(8).required(),
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required()
});

router.post('/register', validateRequest(registrationSchema, { source: 'body', sanitize: true }), registrationController);
```

### Event Creation Validation

```typescript
import { Router } from 'express';
import { validateRequest } from '../middleware/validation.middleware';
import Joi from 'joi';

const eventSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  description: Joi.string().min(1).max(1000).required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  start_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  end_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  total_tickets: Joi.number().integer().min(1).required(),
  price: Joi.number().min(0).required()
});

router.post('/events', validateRequest(eventSchema, { source: 'body', sanitize: true }), createEventController);
```

### Query Parameter Validation

```typescript
import { Router } from 'express';
import { validateRequest } from '../middleware/validation.middleware';
import Joi from 'joi';

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100),
  offset: Joi.number().integer().min(0).default(0)
});

router.get('/search', validateRequest(querySchema, { source: 'query', sanitize: true }), searchController);
```

### Route Parameter Validation

```typescript
import { Router } from 'express';
import { validateRequest, ValidationSchemas } from '../middleware/validation.middleware';

const idParamSchema = Joi.object({
  id: ValidationSchemas.uuid().required()
});

router.get('/users/:id', validateRequest(idParamSchema, { source: 'params', sanitize: true }), getUserController);
```