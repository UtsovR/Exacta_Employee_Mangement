const { execSync } = require('child_process');

const ports = [5000, 5173];

console.log('Cleaning up ports:', ports.join(', '));

ports.forEach(port => {
    try {
        // Windows command to find PID on port
        const stdout = execSync(`netstat -ano | findstr :${port}`).toString();
        const lines = stdout.split('\n');

        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length > 4 && (parts[1].endsWith(`:${port}`) || parts[1] === `0.0.0.0:${port}`)) {
                const pid = parts[parts.length - 1];
                if (pid && pid !== '0') {
                    console.log(`Killing process ${pid} on port ${port}`);
                    try {
                        execSync(`taskkill /F /PID ${pid} /T`);
                    } catch (e) {
                        // Ignore if already dead
                    }
                }
            }
        });
    } catch (error) {
        // No process found on this port, ignore
    }
});

console.log('Port cleanup complete.');
