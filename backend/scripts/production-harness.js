/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const readJson = relativePath => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const readText = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

const checks = [];

const check = (name, passed, detail = '') => {
    checks.push({ name, passed, detail });
};

const packageJson = readJson('package.json');
const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
const bundleConfig = readText('src/core/config/bundle.config.js');
const envExample = readText('.env.example');
const productionChecklist = readText('PRODUCTION_BACKEND_CHECKLIST.md');

check('Security headers middleware is installed', Boolean(deps.helmet), 'helmet dependency');
check('Compression middleware is installed', Boolean(deps.compression), 'compression dependency');
check('Express fingerprinting is disabled', bundleConfig.includes("disable('x-powered-by')"));
check('Readiness endpoint exists', bundleConfig.includes("this.app.get('/ready'"));
check('Liveness endpoint exists', bundleConfig.includes("this.app.get('/health'"));
check('CORS wildcard is not present in env example', !/CORS_(ALLOW|ORIGIN|ORIGINS)=\*/.test(envExample));
check('JWT refresh secret is documented', envExample.includes('JWT_REFRESH_SECRET='));
check('Production checklist exists and references OWASP', productionChecklist.includes('OWASP API Security'));
check('Release gate documents npm audit', productionChecklist.includes('npm audit --audit-level=moderate'));
check('Production harness script is registered', Boolean(packageJson.scripts['production:harness']));

const failed = checks.filter(item => !item.passed);

for (const item of checks) {
    const prefix = item.passed ? '[PASS]' : '[FAIL]';
    console.log(`${prefix} ${item.name}${item.detail ? ` - ${item.detail}` : ''}`);
}

if (failed.length > 0) {
    console.error(`Production harness failed ${failed.length} check(s).`);
    process.exit(1);
}

console.log('Production harness passed.');
