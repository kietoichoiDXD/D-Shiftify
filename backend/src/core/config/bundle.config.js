// @ts-check
import * as express from 'express';
import cors from 'cors';
import methodOverride from 'method-override';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import connection, { connectDatabase } from 'core/database';
import { InvalidResolver, InvalidFilter } from '../common/exceptions/system';
import { logger } from '../../packages/logger';
import { NODE_ENV } from '../env';

/**
 * @typedef Filter
 * @property {(req, res, next) => {}} filter
 */

export class AppBundle {
    static logger = logger;

    BASE_PATH = '/api/v1';

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

    applyHealthChecks() {
        this.app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
        this.app.get('/ready', async (req, res) => {
            try {
                await connection.raw('select 1');
                res.status(200).json({ status: 'ready', database: 'connected' });
            } catch (error) {
                res.status(503).json({ status: 'not_ready', database: 'disconnected' });
            }
        });
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
        this.app.use(
            cors({
                origin: true,
                credentials: true,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
                allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
            })
        );
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(cookieParser());
        this.app.use(express.urlencoded({ extended: false, limit: '50mb' }));

        /**
         * Setup method override method to use PUT, PATCH,...
         */
        this.app.use(methodOverride('X-HTTP-Method-Override'));
        this.app.use(
            methodOverride(req => {
                if (
                    req.body &&
                    typeof req.body === 'object' &&
                    '_method' in req.body
                ) {
                    const method = req.body._method;
                    delete req.body._method;

                    return method;
                }

                return undefined;
            }),
        );
        AppBundle.logger.info('Building initial config');

        return this;
    }

    /*
    Setup asynchronous config here
     */
    async run() {
        AppBundle.logger.info('Building asynchronous config');
        await connectDatabase();
    }
}
