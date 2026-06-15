# 🚀 Frontend-Backend Integration Guide (Enterprise Grade)

**Last Updated**: May 21, 2026  
**Version**: 1.0.0 (Production Ready)

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Setup & Configuration](#setup--configuration)
3. [API Client & Interceptors](#api-client--interceptors)
4. [Service Layer Pattern](#service-layer-pattern)
5. [Custom Hooks Pattern](#custom-hooks-pattern)
6. [Component Integration](#component-integration)
7. [Error Handling](#error-handling)
8. [Authentication & Security](#authentication--security)
9. [Caching & Performance](#caching--performance)
10. [Testing](#testing)
11. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
12. [Deployment Checklist](#deployment-checklist)

---

## Architecture Overview

### Three-Layer Integration Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                    React Components                          │
│        (CandidateProfile.tsx, JobList.tsx, etc.)            │
├─────────────────────────────────────────────────────────────┤
│                   Custom Hooks Layer                         │
│     (useCandidateProfile, useJobList, etc.)                 │
│     - Manages async state (loading, error, data)            │
│     - Handles side effects (useEffect)                      │
│     - Provides refetch/reset actions                        │
├─────────────────────────────────────────────────────────────┤
│                   Service Layer                              │
│     (candidate.service.ts, job.service.ts, etc.)           │
│     - Pure functions (no React dependencies)                │
│     - Type-safe parameter & return values                   │
│     - Error handling & validation                           │
├─────────────────────────────────────────────────────────────┤
│              API Client (with Interceptors)                  │
│                    (apiClient.ts)                            │
│     - Centralized axios instance                            │
│     - Request interceptor (token injection)                 │
│     - Response interceptor (error handling)                 │
│     - Retry logic & offline detection                       │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
   ┌──────────────────┐
   │   Backend API    │
   │  (Express/Node)  │
   └──────────────────┘
```

### File Structure

```
frontend/src/
├── core/
│   ├── services/
│   │   ├── api/
│   │   │   ├── apiClient.ts      ← Main API client
│   │   │   └── errors.ts         ← Error classes
│   │   ├── candidate.service.ts  ← Service functions
│   │   └── job.service.ts
│   └── store/
│       └── auth.store.ts         ← Auth state (Zustand)
├── hooks/
│   └── useCandidateProfile.ts    ← Custom hooks
├── components/
│   ├── candidate/
│   │   └── CandidateProfile.tsx  ← UI Components
│   └── loaders/
│       └── ProfileSkeleton.tsx   ← Loading states
├── pages/
│   └── candidate/
│       └── profile.tsx            ← Page component
└── __tests__/
    └── components/
        └── CandidateProfile.test.tsx
```

---

## Setup & Configuration

### 1. Install Dependencies

```bash
npm install axios zustand
npm install --save-dev @types/axios
```

### 2. Environment Variables

Create `.env.local`:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Features
VITE_DEBUG_API=true
VITE_LOG_REQUESTS=true
```

### 3. Configure Vite (vite.config.ts)

```typescript
export default defineConfig({
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
  },
})
```

---

## API Client & Interceptors

### Understanding Request Interceptor

**Purpose**: Automatically inject JWT token into every request

```typescript
// Before: Manual token injection (❌ WRONG)
const headers = {
  Authorization: `Bearer ${localStorage.getItem('token')}`,
}
const response = await axios.get('/api/profile', { headers })

// After: Automatic injection (✅ RIGHT)
const response = await apiClient.get('/profile')
// Token is injected automatically by interceptor
```

### Understanding Response Interceptor

**Purpose**: Handle errors globally, prevent duplicated error handling

```typescript
// Response cases:
// 1. 2xx Success: Extract data and return
// 2. 401 Unauthorized: Clear session, redirect to login
// 3. 429 Rate Limited: Show "try again later"
// 4. 5xx Server Error: Retry with backoff
```

### Request/Response Flow

```
User Action
    ↓
Component calls hook (useCandidateProfile)
    ↓
Hook calls service (getCandidateProfile)
    ↓
Service calls apiClient.get(...)
    ↓
Request Interceptor
  - Inject token
  - Add request ID
  - Log request
    ↓
Axios HTTP Request → Backend
    ↓
Backend Response
    ↓
Response Interceptor
  - Extract data
  - Handle errors
  - Retry if needed
    ↓
Service returns data
    ↓
Hook updates state
    ↓
Component re-renders
    ↓
User sees data
```

---

## Service Layer Pattern

### Anatomy of a Service Function

```typescript
/**
 * GET /api/candidate/profile
 * 
 * Brief description of what this does
 * 
 * @returns Promise resolving to CandidateProfile
 * @throws ApiError with specific codes
 * 
 * @example
 * const profile = await getCandidateProfile()
 */
export async function getCandidateProfile(): Promise<CandidateProfile> {
  try {
    // Call API through centralized client
    const response = await apiClient.get('/candidate/profile')

    // Type assertion
    if (!response.data) {
      throw new ApiError({...})
    }

    return response.data as CandidateProfile
  } catch (error: any) {
    // Convert generic errors to ApiError
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError({
      code: 'FETCH_ERROR',
      message: 'Failed to fetch profile',
      statusCode: 500,
    })
  }
}
```

### Key Rules

1. **No React hooks** - Services must be pure functions
2. **Full type safety** - Parameters and return values typed
3. **Error handling** - Always throw ApiError
4. **JSDoc comments** - Every function must have docs
5. **Single responsibility** - One function = one API endpoint

---

## Custom Hooks Pattern

### The 5-State Pattern

Every hook managing async data must handle these 5 states:

```typescript
const { data, isLoading, isValidating, error, isSuccess } = useData()

// State: IDLE       | isLoading=true | Show spinner
// State: LOADING    | isLoading=true | Show skeleton
// State: ERROR      | error !== null | Show error UI
// State: EMPTY      | data === null  | Show empty state
// State: SUCCESS    | data !== null  | Show data
```

### Anatomy of a Custom Hook

```typescript
export function useCandidateProfile(): UseCandidateProfileReturn {
  // 1. State declarations
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  // 2. Fetch function
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getCandidateProfile()
      setProfile(data)
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(...))
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 3. Effect for initial fetch
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // 4. Return state + actions
  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
    reset: () => { /* reset state */ },
  }
}
```

---

## Component Integration

### The 5-State Rendering Pattern

```typescript
export const CandidateProfile: React.FC = () => {
  const { profile, isLoading, error, refetch } = useCandidateProfile()

  // STATE 1: LOADING
  if (isLoading) {
    return <ProfileSkeleton />
  }

  // STATE 2: ERROR
  if (error) {
    return (
      <div className="error-card">
        <p>{error.getUserMessage()}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    )
  }

  // STATE 3: EMPTY
  if (!profile) {
    return (
      <div className="empty-state">
        <p>No profile found</p>
        <button>Create Profile</button>
      </div>
    )
  }

  // STATE 4: SUCCESS
  return (
    <div className="profile-card">
      <h1>{profile.fullName}</h1>
      {/* Render data */}
    </div>
  )
}
```

### Using the Component

```typescript
// In a page
import CandidateProfile from '@/components/candidate/CandidateProfile'

export const ProfilePage = () => {
  return (
    <div>
      <CandidateProfile />
    </div>
  )
}
```

---

## Error Handling

### ApiError Class

```typescript
// Creating errors
throw new ApiError({
  code: 'VALIDATION_ERROR',
  message: 'Email is invalid',
  statusCode: 422,
  details: { fields: { email: 'Invalid email format' } },
})

// Using errors
try {
  const profile = await getCandidateProfile()
} catch (error) {
  if (error.isCode('UNAUTHORIZED')) {
    // Handle unauthorized
  } else if (error.isCode('VALIDATION_ERROR')) {
    // Show validation errors
    const fieldErrors = error.getFieldErrors()
  } else {
    // Show generic error
    showErrorToast(error.getUserMessage())
  }
}
```

### Global Error Boundary

```typescript
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div>
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

export const App = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Router />
    </ErrorBoundary>
  )
}
```

---

## Authentication & Security

### Token Management

```typescript
// Token is stored in Zustand store (NOT localStorage)
const { accessToken } = useAuthStore()

// Injected automatically by request interceptor
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-logout on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### CSRF Protection

```typescript
// If backend requires CSRF token
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content

apiClient.interceptors.request.use((config) => {
  if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase() || '')) {
    config.headers['X-CSRF-Token'] = csrfToken
  }
  return config
})
```

---

## Caching & Performance

### Request Deduplication

```typescript
// Prevent duplicate in-flight requests
const requestCache = new Map<string, Promise<any>>()

export async function getCandidateProfile(): Promise<CandidateProfile> {
  const key = '/candidate/profile'
  
  // Return cached promise if already in-flight
  if (requestCache.has(key)) {
    return requestCache.get(key)!
  }

  // Make request
  const promise = apiClient.get(key)
  requestCache.set(key, promise)

  try {
    return await promise
  } finally {
    requestCache.delete(key)
  }
}
```

### Stale-While-Revalidate

```typescript
export function useCandidateProfile() {
  const [profile, setProfile] = useState(null)
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    // Load from cache
    const cached = sessionStorage.getItem('profile')
    if (cached) {
      setProfile(JSON.parse(cached))
    }

    // Revalidate in background
    setIsValidating(true)
    getCandidateProfile()
      .then((data) => {
        setProfile(data)
        sessionStorage.setItem('profile', JSON.stringify(data))
      })
      .finally(() => setIsValidating(false))
  }, [])

  return { profile, isValidating }
}
```

---

## Testing

### Testing API Client

```typescript
describe('apiClient', () => {
  it('injects authorization header', async () => {
    const mockAxios = jest.spyOn(axios, 'create')
    
    useAuthStore.setState({ accessToken: 'test-token' })
    
    await apiClient.get('/profile')
    
    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    )
  })

  it('handles 401 by clearing auth', async () => {
    jest.spyOn(apiClient, 'get').mockRejectedValueOnce({
      response: { status: 401 },
    })

    try {
      await apiClient.get('/profile')
    } catch (error) {
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    }
  })
})
```

### Testing Custom Hooks

```typescript
describe('useCandidateProfile', () => {
  it('fetches profile on mount', async () => {
    const { result } = renderHook(() => useCandidateProfile())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.profile).toBeDefined()
    })
  })

  it('handles errors', async () => {
    jest.spyOn(candidateService, 'getCandidateProfile')
      .mockRejectedValueOnce(new Error('Failed'))

    const { result } = renderHook(() => useCandidateProfile())

    await waitFor(() => {
      expect(result.current.error).toBeDefined()
      expect(result.current.error?.message).toBe('Failed')
    })
  })
})
```

---

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Direct API Calls in Components

```typescript
// ❌ WRONG - Direct API calls
const MyComponent = () => {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    axios.get('/api/profile').then(setData)
  }, [])
}

// ✅ RIGHT - Use service + hook
const MyComponent = () => {
  const { profile } = useCandidateProfile()
}
```

### ❌ Pitfall 2: Token in localStorage

```typescript
// ❌ WRONG
localStorage.setItem('token', token)

// ✅ RIGHT
useAuthStore.setState({ accessToken: token })
```

### ❌ Pitfall 3: No Error Handling

```typescript
// ❌ WRONG
const data = await apiClient.get('/profile')

// ✅ RIGHT
try {
  const data = await getCandidateProfile()
} catch (error) {
  if (error instanceof ApiError) {
    handleError(error)
  }
}
```

### ❌ Pitfall 4: Hardcoded API URLs

```typescript
// ❌ WRONG
const response = await axios.get('http://localhost:3000/api/profile')

// ✅ RIGHT
const response = await apiClient.get('/profile')
```

### ❌ Pitfall 5: Missing Loading States

```typescript
// ❌ WRONG - No loading/error UI
const MyComponent = () => {
  const { profile } = useCandidateProfile()
  return <div>{profile.name}</div>
}

// ✅ RIGHT - Handle all states
const MyComponent = () => {
  const { profile, isLoading, error } = useCandidateProfile()
  
  if (isLoading) return <Skeleton />
  if (error) return <Error error={error} />
  if (!profile) return <Empty />
  return <div>{profile.name}</div>
}
```

---

## Deployment Checklist

Before deploying to production, verify:

- [ ] API URL is correctly set in `.env.production`
- [ ] JWT tokens are not stored in localStorage
- [ ] Error interceptor handles all 4xx/5xx codes
- [ ] 401 errors trigger login redirect
- [ ] Loading states prevent double-clicks
- [ ] Empty states provide helpful CTAs
- [ ] Error messages are user-friendly
- [ ] No `console.log` in production code
- [ ] API requests include request ID for tracking
- [ ] Response time is < 2 seconds (LCP)
- [ ] Retry logic works for failed requests
- [ ] CORS policies are aligned with backend
- [ ] Rate limiting UI is shown
- [ ] Network tab shows bearer tokens in headers
- [ ] All TypeScript types are non-any

---

## Real-World Example: Complete Flow

### 1. User clicks "View My Profile"

```typescript
<button onClick={() => navigate('/profile')}>View Profile</button>
```

### 2. Page loads and mounts component

```typescript
const ProfilePage = () => {
  return <CandidateProfile /> // Render component
}
```

### 3. Component uses custom hook

```typescript
const CandidateProfile = () => {
  const { profile, isLoading, error, refetch } = useCandidateProfile()
  // Hook triggers fetch on mount
}
```

### 4. Hook calls service function

```typescript
// In useCandidateProfile hook
const data = await getCandidateProfile()
```

### 5. Service calls API client

```typescript
// In getCandidateProfile service
const response = await apiClient.get('/candidate/profile')
```

### 6. Request interceptor adds token

```typescript
// Automatically injected
config.headers.Authorization = `Bearer ${token}`
```

### 7. Backend processes request and responds

```javascript
// Backend response
res.json({
  status: 'success',
  data: { fullName: 'John', email: '...' }
})
```

### 8. Response interceptor extracts data

```typescript
// Returns response.data (profile object)
```

### 9. Hook updates state

```typescript
setProfile(data)
setIsLoading(false)
```

### 10. Component re-renders with data

```typescript
return (
  <div>
    <h1>{profile.fullName}</h1>
    ...
  </div>
)
```

---

## Quick Reference

### Common Commands

```bash
# Start development server
npm run dev

# Run tests
npm test

# Check types
npx tsc --noEmit

# Format code
npx prettier --write .

# Lint
npx eslint .
```

### Common Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| `UNAUTHORIZED` | Token invalid/expired | Redirect to login |
| `FORBIDDEN` | No permission | Show error message |
| `VALIDATION_ERROR` | Form validation failed | Show field errors |
| `NOT_FOUND` | Resource doesn't exist | Show empty state |
| `RATE_LIMIT` | Too many requests | Show "try later" |
| `NETWORK_ERROR` | No internet | Show offline UI |

### Debugging Tips

```typescript
// Enable detailed logging
if (import.meta.env.DEV) {
  console.log('[API]', method, url, params, response)
}

// Check network tab
// Chrome DevTools → Network → Filter by XHR

// Check token
console.log(useAuthStore.getState().accessToken)

// Manually test service
getCandidateProfile().then(console.log).catch(console.error)
```

---

## Further Reading

- [Axios Documentation](https://axios-http.com/)
- [React Hooks Guide](https://react.dev/reference/react/hooks)
- [Zustand Store](https://github.com/pmndrs/zustand)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [REST API Best Practices](https://restfulapi.net/)

---

**Questions?** Check the example files in `/src/components/` and `/src/hooks/`

**Last Updated**: May 21, 2026
