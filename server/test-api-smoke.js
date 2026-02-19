process.env.DISABLE_SCHEDULER = 'true';
process.env.PORT = process.env.PORT || '5110';
process.env.DATABASE_URL =
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres?schema=public';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'test_service_role_key';

const { startServer, server } = require('./src/app');

const run = async () => {
    const port = Number.parseInt(process.env.PORT, 10);
    startServer(port);

    try {
        const baseUrl = `http://127.0.0.1:${port}`;

        const root = await fetch(`${baseUrl}/`);
        const settings = await fetch(`${baseUrl}/api/settings`);
        const attendance = await fetch(`${baseUrl}/api/attendance/me`);

        console.log('Smoke Results:');
        console.log(`GET / -> ${root.status}`);
        console.log(`GET /api/settings (no token) -> ${settings.status}`);
        console.log(`GET /api/attendance/me (no token) -> ${attendance.status}`);
    } finally {
        await new Promise((resolve) => server.close(resolve));
    }
};

run()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
