import { API_PUBLIC_URL, HOST, PORT } from 'core/env';
import { SwaggerBuilder } from '../../packages/swagger';

const options = {
    openapi: '3.0.1',
    info: {
        version: '1.0.0',
        title: 'Shiftify Backend API',
        description: 'Shiftify backend API for auth, recruitment, CV, chat, education, and AI modules.',
        termsOfService: '',
        contact: {
            name: 'Shiftify Team',
            email: 'backend@shiftify.local',
        },
    },
    servers: [
        {
            url: `${API_PUBLIC_URL}/api`,
            description: 'Production/Staging API',
            variables: {
                env: {
                    default: 'app-dev',
                    description: 'Dev Environment',
                },
                port: {
                    enum: ['8443', '5000', '443'],
                    default: PORT,
                },
                basePath: {
                    default: 'api',
                },
            },
        },
        {
            url: `http://localhost:${PORT}/api`,
            description: 'Dev Env',
        },
    ],
    basePath: '/api',
    auth: true,
};

export const ApiDocument = SwaggerBuilder.builder().addConfig(options);
