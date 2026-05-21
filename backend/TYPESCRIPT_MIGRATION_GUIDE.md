# TypeScript Migration Guide

## Overview
This guide provides a gradual migration path from JavaScript to TypeScript. You don't need to convert the entire project at once - TypeScript and JavaScript can coexist.

## Current Setup
- ✅ `tsconfig.json` configured
- ✅ `ts-node` installed for development
- ✅ `ts-jest` configured for testing
- ✅ Type checking enabled but not enforced for `.js` files

## Phase 1: Setup (DONE ✅)

### Installation
```bash
npm install --save-dev typescript ts-node ts-jest @types/node @types/express
```

### Configuration Files
- `tsconfig.json` - TypeScript compiler options
- `jest.config.js` updated to use `ts-jest` transformer

## Phase 2: Gradual Migration (START HERE)

### Step 1: Create Type Definitions
Start by creating `.d.ts` files for existing JavaScript modules:

```typescript
// src/packages/httpException/types.d.ts
export interface HttpExceptionOptions {
    message: string;
    code: string;
    status: number;
}
```

### Step 2: Convert One File at a Time
Pick a small, isolated file with no dependencies:

**Before (JavaScript):**
```javascript
// src/core/env/index.js
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 3000;
```

**After (TypeScript):**
```typescript
// src/core/env/index.ts
export const NODE_ENV: string = process.env.NODE_ENV || 'development';
export const PORT: number = parseInt(process.env.PORT || '3000', 10);
```

### Step 3: Add Types to Middleware
```typescript
// src/core/middleware/rate-limiter.middleware.ts
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: 'Too many requests',
});
```

### Step 4: Create Service Types
```typescript
// src/core/modules/auth/types.ts
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    refreshToken: string;
    user: UserData;
}

export interface UserData {
    id: string;
    email: string;
    name: string;
}
```

## Recommended Migration Order

1. **Utility Functions** (lowest dependencies)
   - `src/core/utils/**`
   - `src/core/env/**`

2. **Config Files**
   - `src/core/config/**`
   - `src/core/database/**`

3. **Middleware**
   - `src/core/middleware/**`

4. **Exception Classes**
   - `src/packages/httpException/**`

5. **Services**
   - `src/core/modules/*/service/**`

6. **Controllers/Resolvers**
   - `src/core/api/**`

7. **Main Application**
   - `src/core/index.ts`

## Phase 3: Full TypeScript

Once migration is complete, update scripts:

```json
{
  "scripts": {
    "dev": "ts-node src/core/bin/www.ts",
    "build": "tsc",
    "start": "node dist/core/bin/www.js"
  }
}
```

## Example TypeScript Files

### Exception Class (TypeScript)
```typescript
// src/packages/httpException/HttpException.ts
export class HttpException extends Error {
    public readonly code: string;
    public readonly status: number;

    constructor(msg: string, code: string, status: number) {
        super(msg);
        this.code = code;
        this.status = status;
        Object.setPrototypeOf(this, HttpException.prototype);
    }
}
```

### Middleware (TypeScript)
```typescript
// src/core/middleware/api-versioning.middleware.ts
import { Request, Response, NextFunction } from 'express';

declare global {
    namespace Express {
        interface Request {
            apiVersion: string;
        }
    }
}

export const detectApiVersion = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const versionMatch = req.path.match(/^\/v(\d+)\//);
    req.apiVersion = versionMatch ? `v${versionMatch[1]}` : 'v1';
    next();
};
```

### Service (TypeScript)
```typescript
// src/core/modules/user/user.service.ts
import { User } from './user.types';

interface CreateUserDTO {
    email: string;
    name: string;
    password: string;
}

export class UserService {
    async createUser(dto: CreateUserDTO): Promise<User> {
        // Implementation
        return {} as User;
    }

    async getUserById(id: string): Promise<User | null> {
        // Implementation
        return null;
    }

    async updateUser(id: string, updates: Partial<User>): Promise<User> {
        // Implementation
        return {} as User;
    }

    async deleteUser(id: string): Promise<boolean> {
        // Implementation
        return true;
    }
}
```

## Type Definitions for External Libraries

Install type definitions:
```bash
npm install --save-dev @types/express @types/node @types/bcrypt @types/multer
```

## Best Practices

### 1. Use Strict Mode
```typescript
// tsconfig.json
"strict": true,
"noImplicitAny": true,
```

### 2. Define Interfaces for DTOs
```typescript
interface UserDTO {
    id: string;
    email: string;
    createdAt: Date;
}
```

### 3. Use Enums for Constants
```typescript
enum ErrorCode {
    BAD_REQUEST = 'BAD_REQUEST',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
}
```

### 4. Extend Express Request Type
```typescript
declare global {
    namespace Express {
        interface Request {
            user: UserPayload;
            apiVersion: string;
        }
    }
}
```

### 5. Create Domain Models
```typescript
// src/core/modules/user/user.model.ts
export interface User {
    id: string;
    email: string;
    name: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}
```

## Testing with TypeScript

### Jest Configuration
```typescript
// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src', '<rootDir>/__tests__'],
    testMatch: ['**/*.test.ts'],
    moduleNameMapper: {
        '^core/(.*)$': '<rootDir>/src/core/$1',
        '^packages/(.*)$': '<rootDir>/src/packages/$1',
    },
};

export default config;
```

### Writing Tests in TypeScript
```typescript
// __tests__/unit/user.service.unit.test.ts
import { UserService } from '../../src/core/modules/user/user.service';

describe('UserService', () => {
    let service: UserService;

    beforeEach(() => {
        service = new UserService();
    });

    test('should create user', async () => {
        const user = await service.createUser({
            email: 'test@example.com',
            name: 'Test',
            password: 'pass123',
        });
        expect(user.id).toBeDefined();
    });
});
```

## Troubleshooting

### Module Not Found
```typescript
// Ensure tsconfig.json has correct paths
"paths": {
    "core/*": ["core/*"],
    "packages/*": ["packages/*"]
}
```

### Type Errors
- Use `any` temporarily: `const x: any = ...` (then fix later)
- Use type guards: `if (typeof x === 'string') { ... }`
- Create `.d.ts` files for untyped libraries

### Build Issues
```bash
# Clear and rebuild
rm -rf dist
npx tsc --noEmit  # Check for errors
npm run build
```

## Checklist for Full Migration

- [ ] Install TypeScript packages
- [ ] Configure `tsconfig.json`
- [ ] Convert 10% of codebase (utilities)
- [ ] Fix type errors
- [ ] Add integration tests
- [ ] Convert 50% of codebase
- [ ] Performance testing
- [ ] Convert remaining 50%
- [ ] Update build scripts
- [ ] Update CI/CD pipeline

## Timeline Estimate

- **Phase 1 (Setup)**: 1 day ✅
- **Phase 2 (Gradual Migration)**: 2-4 weeks
- **Phase 3 (Full TypeScript)**: 1-2 weeks

Total: 3-6 weeks for complete migration

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express TypeScript Guide](https://expressjs.com/)
- [ts-node Documentation](https://typestrong.org/ts-node/)
- [Jest + TypeScript](https://jestjs.io/docs/getting-started#using-typescript)

## Questions?

Refer to the TypeScript documentation or check existing `.ts` examples in the project.
