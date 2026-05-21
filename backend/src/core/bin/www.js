#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Module dependencies.
 */

import debug from 'debug';
import http from 'http';
import app from '../index';
import { PORT } from '../env';
import { initSocket } from '../socket';
import { closeDatabase } from '../database';
import { logger } from '../../packages/logger';

const dubugHelper = debug('mongoose:server');

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    const parsePort = parseInt(val, 10);

    if (Number.isNaN(parsePort)) {
        // named pipe
        return val;
    }

    if (parsePort >= 0) {
        // port number
        return parsePort;
    }

    return false;
}

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(PORT);
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);
const io = initSocket(server);
/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    dubugHelper(`Listening on ${bind}`);
}

const closeHttpServer = () => new Promise((resolve, reject) => {
    server.close(error => {
        if (error) return reject(error);
        logger.info('HTTP server closed');
        return resolve();
    });
});

const closeSocketServer = () => new Promise(resolve => {
    io.close(() => {
        logger.info('Socket.io server closed');
        resolve();
    });
});

let isShuttingDown = false;

async function gracefulShutdown(signal) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`${signal} received. Starting graceful shutdown`);

    try {
        await closeSocketServer();
        await closeHttpServer();
        await closeDatabase();
        process.exit(0);
    } catch (error) {
        logger.error(`Graceful shutdown failed: ${error.message}`);
        process.exit(1);
    }
}

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, () => {
    logger.info(`Server is listening on ${port}`);
});
server.on('error', onError);
server.on('listening', onListening);
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
