const { execSync } = require('child_process');
const path = require('path');

try {
    console.log('Cleaning port 5000...');
    try {
        const stdout = execSync('netstat -ano | findstr :5000').toString();
        const pid = stdout.trim().split(/\s+/).pop();
        if (pid && pid !== '0') {
            console.log(`Killing PID ${pid}`);
            execSync(`taskkill /F /PID ${pid} /T`);
        }
    } catch (e) {
        console.log('Port 5000 is already free.');
    }

    console.log('Starting server...');
    const { spawn } = require('child_process');
    const server = spawn('node', ['src/app.js'], { stdio: 'inherit', cwd: __dirname });

    server.on('error', (err) => {
        console.error('Failed to start server:', err);
    });

} catch (error) {
    console.error('Setup failed:', error);
}
