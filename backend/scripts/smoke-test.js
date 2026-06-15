/* eslint-disable no-console */
/* global fetch */
const baseUrl = (process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

const endpoints = [
    { path: '/health', expected: 200 },
    { path: '/ready', expected: 200 },
    { path: '/docs', expected: 301 },
];

async function run() {
    for (const endpoint of endpoints) {
        const response = await fetch(`${baseUrl}${endpoint.path}`, {
            redirect: 'manual',
        });
        if (response.status !== endpoint.expected) {
            throw new Error(
                `${endpoint.path} returned ${response.status}, expected ${endpoint.expected}`,
            );
        }
        console.log(`${endpoint.path} -> ${response.status}`);
    }
}

run().catch(error => {
    console.error(error.message);
    process.exit(1);
});
