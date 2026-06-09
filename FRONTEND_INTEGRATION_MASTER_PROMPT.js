/**
 * ============================================================
 * FRONTEND INTEGRATION MASTER PROMPT
 * ============================================================
 *
 * Copy toàn bộ text này vào AI (Cursor, Copilot, ChatGPT)
 * mỗi khi bạn cần tích hợp API mới.
 *
 * Version: 1.0.0 (Enterprise Grade)
 * Last Updated: May 21, 2026
 */

/*
Act as a Principal Frontend Engineer specializing in enterprise-grade API integration.
I'm working on the "Shiftify" full-stack application and need your help building
production-ready API integration with comprehensive error handling, caching, and UX states.

=========================================
[1. PROJECT CONTEXT & TECH STACK]
- Framework: React 18 + TypeScript (or ES6+)
- HTTP Client: Axios with interceptors
- State Management: React Hooks + Context API / TanStack Query
- Form Handling: React Hook Form + Zod validation
- Styling: Tailwind CSS v3+
- Build Tool: Vite
- Backend: Node.js/Express + PostgreSQL

Project Repository: https://github.com/dscdut/D-Shiftify
Current Branch: backend-production-foundation

=========================================
[2. STRICT ENTERPRISE INTEGRATION RULES]

You MUST adhere to these architectural best practices:

1. CENTRALIZED API CLIENT
   - Never use raw fetch() or local axios.get()
   - Always use pre-configured `apiClient` instance from `src/core/services/api/apiClient.ts`
   - This instance MUST contain Request/Response/Error interceptors

2. REQUEST INTERCEPTORS (Mandatory)
   - Auto-inject JWT token from localStorage/sessionStorage to Authorization header
   - Format: "Authorization: Bearer <token>"
   - Add request timestamp and request ID for tracing
   - Add Content-Type and Accept headers
   - Handle token refresh flow automatically

3. RESPONSE INTERCEPTORS (Mandatory)
   - Parse response and extract `data` field (standardized format)
   - Handle standardized error responses (code, message, details)
   - 401 Unauthorized: Clear session → Redirect to /login
   - 403 Forbidden: Show permission denied UI
   - 5xx Server Errors: Retry with exponential backoff (max 3 times)
   - Network errors: Offline detection and retry queue

4. SEPARATION OF CONCERNS (STRICT)
   - `src/core/services/`: API call functions (pure, no React hooks)
   - `src/hooks/`: Custom React hooks managing async state
   - `src/components/`: UI components consuming hooks (no direct API calls)
   - `src/models/`: TypeScript interfaces/types
   - `src/store/`: State management (Zustand or Context)

5. API SERVICE LAYER PATTERN
   Each service function MUST:
   - Accept typed parameters
   - Return Promise<TypedResponse>
   - Throw standardized errors with error codes
   - Include JSDoc comments with:
     * Purpose
     * Parameters with types
     * Return type
     * Possible error codes
     * Usage example

6. CUSTOM HOOK PATTERN (React)
   Each hook MUST handle 5 states simultaneously:
   - isLoading: boolean (initial fetch or refetch)
   - isValidating: boolean (background revalidation)
   - data: T | null (typed data or null)
   - error: ApiError | null (typed error with code/message)
   - isSuccess: boolean (fetch completed successfully)

   Additionally provide methods:
   - refetch(): void (manual data refresh)
   - reset(): void (clear all state)
   - mutate(data): void (optimistic update)

7. ERROR HANDLING STRATEGY
   - Create custom ApiError class extending Error
   - Include: code (string), message (string), details (object), statusCode (number)
   - Handle specific error codes:
     * 'VALIDATION_ERROR': Show field-level errors
     * 'RATE_LIMIT': Show "Try again later" with retry time
     * 'UNAUTHORIZED': Clear session and redirect
     * 'NETWORK_ERROR': Show offline UI, queue requests
   - Use Error Boundary component for UI error catching

8. UI RESILIENCE (THE 5 STATES)
   Every data-fetching component MUST render these 5 states:

   a) IDLE STATE (Before first load):
      - Empty placeholder or nothing

   b) LOADING STATE (Fetching data):
      - Show Skeleton screen matching exact layout
      - Or Spinner with "Loading..." text
      - Duration: 300ms fade-in to avoid flashing

   c) ERROR STATE (Fetch failed):
      - Show error icon (red background)
      - Display user-friendly error message
      - Provide "Retry" button
      - Optional: Show error details in dev mode

   d) EMPTY STATE (No data returned):
      - Show appropriate illustration
      - Display helpful text
      - Provide CTA (e.g., "Create your first item")
      - Example: "No candidates found. Apply for a job!"

   e) SUCCESS STATE (Data loaded):
      - Render actual data with animations
      - Show count/pagination info
      - Smooth fade-in (150ms animation)

9. CACHING & PERFORMANCE
   - Implement cache busting with request version numbers
   - Use SWR or React Query for automatic cache management
   - Set appropriate stale times (30s for profiles, 5m for lists)
   - Implement request deduplication (no duplicate in-flight requests)
   - Show stale-while-revalidate indicators

10. SECURITY BEST PRACTICES
    - NEVER store sensitive data (tokens, passwords) in localStorage
    - Use httpOnly cookies when available
    - Validate response data shape before rendering
    - Sanitize user-generated content
    - Implement CSRF token handling for POST/PUT/DELETE
    - Add rate limit detection and user feedback

=========================================
[3. REQUIRED DELIVERABLES]

For connecting to backend endpoint: [SPECIFY: GET /api/candidate/profile]

Generate these ES6+/TypeScript code blocks:

1. API CLIENT SETUP
   File: `src/core/services/api/apiClient.ts`
   Requirements:
   - Axios instance with timeout (10s)
   - Request interceptor (token injection)
   - Response interceptor (error handling)
   - Retry logic with exponential backoff
   - Request/response logging

2. CUSTOM ERROR CLASS
   File: `src/core/services/api/errors.ts`
   Requirements:
   - Extend native Error class
   - Include: code, message, details, statusCode
   - toString() for logging

3. SERVICE FUNCTION
   File: `src/core/services/candidate.service.ts`
   Requirements:
   - Typed parameters and return values
   - JSDoc documentation
   - Error handling
   - No React dependencies

4. CUSTOM REACT HOOK
   File: `src/hooks/useCandidateProfile.ts`
   Requirements:
   - Handle 5-state pattern
   - useEffect for fetching
   - Cleanup function
   - Dependency array optimization
   - Refetch/reset methods

5. UI COMPONENT
   File: `src/components/CandidateProfile.tsx`
   Requirements:
   - 5-state rendering (idle, loading, error, empty, success)
   - Tailwind CSS styling
   - Skeleton screen for loading
   - Error boundary integration
   - Accessibility (aria-labels, semantic HTML)

6. PAGE/LAYOUT INTEGRATION
   File: `src/pages/candidate/profile.tsx`
   Requirements:
   - Use the custom hook
   - Pass data to component
   - Handle navigation
   - Breadcrumb/header

=========================================
[4. CODE QUALITY STANDARDS]

- ESLint enabled with airbnb-typescript config
- TypeScript strict mode enabled
- Prettier formatting (80 character line length)
- 100% TypeScript coverage (no `any` unless justified)
- JSDoc on all exported functions
- Comments on complex logic
- Component prop types fully specified
- Error messages are i18n-ready

=========================================
[5. TESTING REQUIREMENTS]

Provide unit test examples using Jest + React Testing Library:
- Test successful data fetch
- Test error handling
- Test loading state
- Test empty state
- Test refetch functionality

=========================================
[6. DEPLOYMENT CHECKLIST]

Before marking as complete, verify:
- ✓ API calls respect CORS policies
- ✓ Bearer token is injected correctly
- ✓ Errors are handled gracefully
- ✓ Loading states prevent UI flashing
- ✓ Empty states guide user action
- ✓ Error retry works properly
- ✓ No console errors/warnings
- ✓ Responsive on mobile
- ✓ Accessibility requirements met
- ✓ Performance: LCP < 2.5s

=========================================

Now, please generate production-ready code for the integration task specified.
Include inline comments explaining enterprise patterns.
Format as complete, ready-to-use files.
*/
