// @ts-check
import * as express from 'express';
import methodOverride from 'method-override';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { connectDatabase } from 'core/database';
import { InvalidResolver, InvalidFilter } from '../common/exceptions/system';
import { SecurityRateLimitMiddleware } from '../middleware';
import { httpLoggerStream, logger } from '../../packages/logger';
import { NODE_ENV } from '../env';

/**
 * @typedef Filter
 * @property {(req, res, next) => {}} filter
 */

export class AppBundle {
    static logger = logger;

    BASE_PATH = '/api';

    BASE_PATH_SWAGGER = '/docs';

    static builder() {
        AppBundle.logger.info('App is starting bundling');
        return new AppBundle();
    }

    /**
     * @param {import("express-serve-static-core").Express} app
     */
    applyAppContext(app) {
        this.app = app;
        return this;
    }

    applyResolver(resolver) {
        if (!resolver['resolve']) {
            throw new InvalidResolver(resolver);
        }
        this.app.use(this.BASE_PATH, resolver.resolve());
        return this;
    }

    applySentryError(sentry) {
        this.app.use(sentry.Handlers.errorHandler());
        return this;
    }

    /**
     *
     * @param {[Filter]} filters
     * @returns {AppBundle}
     */
    applyGlobalFilters(filters) {
        filters.forEach(filter => {
            if (filter['filter']) {
                this.app.use(filter.filter);
            } else {
                throw new InvalidFilter(filter);
            }
        });
        return this;
    }

    applySwagger(swaggerBuilder) {
        this.app.use(
            this.BASE_PATH_SWAGGER,
            swaggerUi.serve,
            swaggerUi.setup(swaggerBuilder.instance),
        );
        logger.info('Building swagger');

        return this;
    }

    /**
     * Default config
     */
    init() {
        AppBundle.logger.info(`Application is in mode ${NODE_ENV}`);
        /**
         * Setup basic express
         */
        this.app.use(express.json({ limit: '2mb' }));
        this.app.use(express.urlencoded({ extended: false, limit: '2mb' }));
        this.app.use(SecurityRateLimitMiddleware);
        this.app.use(morgan('combined', { stream: httpLoggerStream }));

        /**
         * Setup method override method to use PUT, PATCH,...
         */
        this.app.use(methodOverride('X-HTTP-Method-Override'));
        AppBundle.logger.info('Building initial config');

        return this;
    }

    /*
    Setup asynchronous config here
     */
    async run() {
        AppBundle.logger.info('Building asynchronous config');
        await connectDatabase();

        // MongoDB for AI profile persistence
        if (process.env.MONGO_URL) {
            const mongoose = (await import('mongoose')).default;
            await mongoose.connect(process.env.MONGO_URL);
            AppBundle.logger.info('MongoDB connected');
        }

        // Redis for AI session memory
        if (process.env.REDIS_URL) {
            const { getRedisClient } = await import('core/infrastructure/session.store');
            await getRedisClient();
            AppBundle.logger.info('Redis session store connected');
        }
    }
}
