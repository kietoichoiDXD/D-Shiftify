const fs = require('fs');
const path = require('path');

const distPath = path.resolve(__dirname, '..', 'dist');

function chmodWritable(target) {
    if (!fs.existsSync(target)) return;

    const stats = fs.lstatSync(target);
    fs.chmodSync(target, 0o666);

    if (!stats.isDirectory()) return;

    fs.readdirSync(target).forEach(child => {
        chmodWritable(path.join(target, child));
    });
}

try {
    chmodWritable(distPath);
    fs.rmSync(distPath, {
        recursive: true,
        force: true,
        maxRetries: 5,
        retryDelay: 200,
    });
    fs.mkdirSync(distPath, { recursive: true });
} catch (error) {
    console.warn(`Unable to fully clean ${distPath}: ${error.message}`);
    fs.mkdirSync(distPath, { recursive: true });
}
