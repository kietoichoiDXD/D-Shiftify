import { z } from 'zod';
import { BadRequestException } from 'packages/httpException';

export const PaginationQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sort: z.string().trim().regex(/^[a-zA-Z0-9_]+:(asc|desc)$/).default('created_at:desc'),
}).strict();

export const paginationMiddleware = (req, res, next) => {
    try {
        const parsed = PaginationQuerySchema.parse(req.query);
        const [sortBy, sortOrder] = parsed.sort.split(':');

        req.pagination = {
            page: parsed.page,
            limit: parsed.limit,
            offset: (parsed.page - 1) * parsed.limit,
            sortBy,
            sortOrder,
        };

        req.query = {
            ...req.query,
            ...parsed,
        };

        return next();
    } catch (error) {
        const message = error.issues
            ? error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ')
            : 'Invalid pagination query';
        return next(new BadRequestException(message));
    }
};
