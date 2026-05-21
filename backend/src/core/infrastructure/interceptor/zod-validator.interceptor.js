import { ZodError } from 'zod';
import { BadRequestException } from 'packages/httpException';

export class ZodValidatorInterceptor {
    schema;

    source;

    constructor(schema, source = 'auto') {
        this.schema = schema;
        this.source = source;
    }

    getValueToValidate(req) {
        if (this.source === 'body') return req.body;
        if (this.source === 'query') return req.query;
        if (this.source === 'params') return req.params;

        switch (req.method) {
            case 'POST':
            case 'PUT':
            case 'PATCH':
            case 'DELETE':
                return req.body;
            case 'GET':
            default:
                return req.query;
        }
    }

    intercept = async (req, res, next) => {
        try {
            const parsed = await this.schema.parseAsync(this.getValueToValidate(req));
            if (this.source === 'params') {
                req.params = parsed;
            } else if (this.source === 'query') {
                req.query = parsed;
            } else if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
                req.body = parsed;
            } else {
                req.query = parsed;
            }
            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                const message = error.issues
                    .map(issue => `${issue.path.join('.') || 'body'}: ${issue.message}`)
                    .join('; ');
                return next(new BadRequestException(message));
            }
            return next(error);
        }
    };
}
