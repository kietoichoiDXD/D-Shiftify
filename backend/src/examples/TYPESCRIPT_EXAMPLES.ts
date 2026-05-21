/**
 * Example: HttpException in TypeScript
 * 
 * This is a sample of how to convert JavaScript to TypeScript
 * Uncomment and move to src/packages/httpException/HttpException.ts
 * when ready to migrate
 */

export class HttpException extends Error {
    public readonly code: string;
    public readonly status: number;

    constructor(msg: string, code: string, status: number) {
        super(msg);
        this.code = code;
        this.status = status;

        // Ensures proper prototype chain for instanceof checks
        Object.setPrototypeOf(this, HttpException.prototype);
    }
}

/**
 * Example: ForbiddenException in TypeScript
 */
import { FORBIDDEN } from 'http-status';

export const ERROR_CODE = {
    FORBIDDEN: 'FORBIDDEN',
} as const;

export type ErrorCodeType = typeof ERROR_CODE[keyof typeof ERROR_CODE];

export class ForbiddenException extends HttpException {
    constructor(msg: string = 'You do not have permission to access this resource') {
        super(msg, ERROR_CODE.FORBIDDEN, FORBIDDEN);
        Object.setPrototypeOf(this, ForbiddenException.prototype);
    }
}

/**
 * Example: API Versioning Middleware in TypeScript
 */
import { Request, Response, NextFunction } from 'express';

declare global {
    namespace Express {
        interface Request {
            apiVersion: string;
        }
    }
}

export enum ApiVersion {
    V1 = 'v1',
    V2 = 'v2',
}

export const DEFAULT_API_VERSION = ApiVersion.V1;

export const detectApiVersion = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const versionMatch = req.path.match(/^\/v(\d+)\//);

    if (versionMatch) {
        req.apiVersion = `v${versionMatch[1]}`;
    } else {
        req.apiVersion = DEFAULT_API_VERSION;
    }

    next();
};

/**
 * Example: User Service in TypeScript
 */

interface UserDTO {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

interface CreateUserDTO {
    email: string;
    name: string;
    password: string;
}

interface UpdateUserDTO {
    email?: string;
    name?: string;
}

export class UserService {
    async createUser(dto: CreateUserDTO): Promise<UserDTO> {
        // Implementation here
        return {
            id: '1',
            email: dto.email,
            name: dto.name,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    async getUserById(id: string): Promise<UserDTO | null> {
        // Implementation here
        return null;
    }

    async getAllUsers(): Promise<UserDTO[]> {
        // Implementation here
        return [];
    }

    async updateUser(id: string, updates: UpdateUserDTO): Promise<UserDTO> {
        // Implementation here
        return {
            id,
            email: updates.email || '',
            name: updates.name || '',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    async deleteUser(id: string): Promise<boolean> {
        // Implementation here
        return true;
    }
}

/**
 * Example: Logger Service in TypeScript
 */

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
}

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: Date;
    context?: Record<string, unknown>;
}

export class Logger {
    private logs: LogEntry[] = [];

    log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date(),
            context,
        };

        this.logs.push(entry);
        console.log(`[${entry.timestamp.toISOString()}] ${level.toUpperCase()}: ${message}`, context);
    }

    debug(message: string, context?: Record<string, unknown>): void {
        this.log(LogLevel.DEBUG, message, context);
    }

    info(message: string, context?: Record<string, unknown>): void {
        this.log(LogLevel.INFO, message, context);
    }

    warn(message: string, context?: Record<string, unknown>): void {
        this.log(LogLevel.WARN, message, context);
    }

    error(message: string, context?: Record<string, unknown>): void {
        this.log(LogLevel.ERROR, message, context);
    }

    getLogs(): LogEntry[] {
        return this.logs;
    }

    clearLogs(): void {
        this.logs = [];
    }
}
