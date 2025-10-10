# API Versioning

This document explains the API versioning strategy implemented for this application.

## Versioning Strategy

We use URI versioning where the version is included in the URL path. This approach makes it easy to identify which version of the API is being used.

Current API version: v1

## API Endpoints

All API endpoints are now available under the versioned URL structure:

### Versioned Endpoints (Current and Only Supported)
```
http://localhost:3000/api/v1/auth/[endpoint]
http://localhost:3000/api/v1/events/[endpoint]
http://localhost:3000/api/v1/orders/[endpoint]
```

### Legacy Endpoints (Removed)
```
http://localhost:3000/api/auth/[endpoint]
http://localhost:3000/api/events/[endpoint]
http://localhost:3000/api/orders/[endpoint]
```

**Note:** The legacy endpoints have been removed to eliminate duplication and reduce maintenance overhead. All applications must use the versioned endpoints.

## Implementation Details

### Backend Changes
- Removed legacy routes to eliminate duplication
- All routes now use the versioned `/api/v1/` prefix
- Both route sets previously pointed to the same controller implementations

### Frontend Changes
- Updated `frontend/src/utils/api.ts` to use versioned endpoints by default
- Authentication refresh endpoint updated to use versioned API
- All API calls now go through the versioned endpoints

## Migration Guide

### For New Development
All new features should use the versioned API endpoints.

### For Existing Applications
All applications must use the versioned endpoints as the legacy endpoints are no longer available.

## Future Versions
When introducing breaking changes, a new version (v2, v3, etc.) will be created following the same pattern.