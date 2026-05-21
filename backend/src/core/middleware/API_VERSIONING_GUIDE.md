# API Versioning Guide

## Overview
This backend implements API versioning to support multiple API versions simultaneously, allowing for smooth transitions and backward compatibility.

## Version Structure

```
/api/v1/...   → Version 1 endpoints (legacy)
/api/v2/...   → Version 2 endpoints (current)
/api/...      → Defaults to V1 for backward compatibility
```

## How It Works

### 1. Version Detection
The `detectApiVersion` middleware automatically detects the version from the request URL:
- `/api/v1/users` → `req.apiVersion = 'v1'`
- `/api/v2/users` → `req.apiVersion = 'v2'`
- `/api/users` → `req.apiVersion = 'v1'` (default)

### 2. Route Setup Example
```javascript
// In your API routes
import express from 'express';
import { detectApiVersion } from 'core/middleware/api-versioning.middleware';

const router = express.Router();

// V1 specific endpoints
router.get('/v1/users', (req, res) => {
    res.json({ version: 'v1', users: [] });
});

// V2 endpoints (with new features)
router.get('/v2/users', (req, res) => {
    res.json({ 
        version: 'v2', 
        users: [],
        metadata: { total: 0, page: 1 }
    });
});

export default router;
```

### 3. Deprecation Management
Notify clients about deprecated versions:
```javascript
import { deprecationHeader } from 'core/middleware/api-versioning.middleware';

// Add deprecation header to V1 responses
app.use('/api/v1', deprecationHeader('v1', '2026-12-31'));
```

Response headers will include:
```
Deprecation: true
Sunset: Fri, 31 Dec 2026 00:00:00 GMT
Warning: 299 - "API version v1 is deprecated. Sunset date: 2026-12-31"
```

### 4. Version Compatibility Check
Enforce minimum version requirements:
```javascript
import { versionCompatibility } from 'core/middleware/api-versioning.middleware';

// Only allow V2 and above
router.use(versionCompatibility('v2'));
```

## Best Practices

### Version Planning
1. **New Feature** → Add to current/next version
2. **Bug Fix** → Apply to all supported versions
3. **Breaking Change** → Create new version
4. **Deprecation Timeline** → Announce 6-12 months before sunset

### Response Format
Keep consistent response structure across versions:
```javascript
// V1 Response
{
  "status": "success",
  "data": { /* ... */ }
}

// V2 Response (backward compatible + enhanced)
{
  "status": "success",
  "data": { /* ... */ },
  "metadata": { /* new fields */ }
}
```

### Backward Compatibility
- Default routes (`/api/...`) should use latest V1 behavior
- Avoid breaking changes in V1 (use V2 instead)
- Use feature flags for gradual rollouts

## Versioning Timeline Example

```
v1: 2024-01-01 → 2026-12-31 (sunset)
    └─ Deprecated: 2026-09-01
    
v2: 2025-06-01 → 2028-12-31 (sunset)
    └─ Deprecated: 2028-09-01
    
v3: 2026-12-01 → (future)
```

## Migration Guide for Clients

### From V1 to V2
```javascript
// Before
GET /api/users

// After
GET /api/v2/users
```

## Monitoring
Track API version usage:
```javascript
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} [${req.apiVersion}]`);
    next();
});
```

## Future Versions
To add V3:
1. Create V3 routes
2. Add `V3: 'v3'` to `API_VERSIONS`
3. Test thoroughly
4. Announce deprecation for V1
5. Set sunset date 12 months away
