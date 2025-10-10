# Utility Functions

## Token Verification Utility

The token verification logic has been consolidated into a single utility function to avoid duplication across the codebase.

### extractAndVerifyToken

This function extracts and verifies JWT tokens from Express request objects.

**Location:** [token.util.ts](file:///c%3A/Users/ammer/Documents/OELAN/FrontRow/backend/src/utils/token.util.ts)

**Usage:**
```typescript
import { extractAndVerifyToken } from '../utils/token.util';

const tokenResult = extractAndVerifyToken(request);

if (tokenResult.success) {
  // Token is valid
  const { decoded } = tokenResult;
  // Use decoded token payload
} else {
  // Token is invalid or missing
  const { error } = tokenResult;
  // Handle error appropriately
}
```

**Returns:**
- On success: `{ success: true, decoded: JwtPayload }`
- On failure: `{ success: false, error: string }`

This utility is used by:
1. [auth.middleware.ts](file:///c%3A/Users/ammer/Documents/OELAN/FrontRow/backend/src/middleware/auth.middleware.ts) - For middleware-based authentication
2. [profile.controller.ts](file:///c%3A/Users/ammer/Documents/OELAN/FrontRow/backend/src/controllers/auth/profile.controller.ts) - For direct token verification in the profile endpoint

This consolidation ensures consistent token verification logic across the application and makes future updates easier to maintain.