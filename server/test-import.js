try {
    console.log('Testing requirements...');
    process.env.DATABASE_URL =
        process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres?schema=public';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
    process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
    process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY =
        process.env.SUPABASE_SERVICE_ROLE_KEY || 'test_service_role_key';

    console.log('1. Requiring Prisma client...');
    require('./src/prisma');
    console.log('   OK');

    console.log('2. Requiring Middlewares...');
    require('./src/middleware/authMiddleware');
    console.log('   OK');

    console.log('3. Requiring Controllers...');
    require('./src/controllers/notificationController');
    require('./src/controllers/supportController');
    require('./src/controllers/settingController');
    require('./src/controllers/attendanceController');
    require('./src/controllers/leaveController');
    require('./src/controllers/reportController');
    console.log('   OK');

    console.log('4. Requiring Routes...');
    require('./src/routes/notificationRoutes');
    require('./src/routes/supportRoutes');
    require('./src/routes/settingRoutes');
    require('./src/routes/attendanceRoutes');
    require('./src/routes/leaveRoutes');
    require('./src/routes/reportRoutes');
    console.log('   OK');

    console.log('5. Requiring App...');
    process.env.DISABLE_SCHEDULER = 'true';
    require('./src/app');
    console.log('   OK');

    console.log('ALL IMPORTS PASSED');
    process.exit(0);
} catch (error) {
    console.error('FAILED AT STEP:');
    console.error(error);
    process.exit(1);
}
