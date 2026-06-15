module.exports = {
    apps: [
        {
            name: 'shiftify-backend',
            script: './dist/core/bin/www.js',
            cwd: '.',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            max_memory_restart: '512M',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
        },
    ],
};
