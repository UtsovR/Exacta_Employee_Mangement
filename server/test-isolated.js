console.log('Testing isolated requirements...');

try {
    console.log('1. Requiring Prisma...');
    require('./src/prisma');
    console.log('   OK');
} catch (e) {
    console.error('FAILED AT PRISMA');
    console.error(e);
}

try {
    console.log('2. Requiring authMiddleware...');
    require('./src/middleware/authMiddleware');
    console.log('   OK');
} catch (e) {
    console.error('FAILED AT AUTHMIDDLEWARE');
    console.error(e);
}

try {
    console.log('3. Requiring notificationController...');
    require('./src/controllers/notificationController');
    console.log('   OK');
} catch (e) {
    console.error('FAILED AT NOTIFICATIONCONTROLLER');
}

try {
    console.log('4. Requiring supportController...');
    require('./src/controllers/supportController');
    console.log('   OK');
} catch (e) {
    console.error('FAILED AT SUPPORTCONTROLLER');
}

try {
    console.log('5. Requiring settingController...');
    require('./src/controllers/settingController');
    console.log('   OK');
} catch (e) {
    console.error('FAILED AT SETTINGCONTROLLER');
}

try {
    console.log('6. Requiring attendance/leave/report controllers...');
    require('./src/controllers/attendanceController');
    require('./src/controllers/leaveController');
    require('./src/controllers/reportController');
    console.log('   OK');
} catch (e) {
    console.error('FAILED AT NEW CONTROLLERS');
    console.error(e);
}

try {
    console.log('7. Requiring all Routes...');
    require('./src/routes/authRoutes');
    require('./src/routes/userRoutes');
    require('./src/routes/breakRoutes');
    require('./src/routes/notificationRoutes');
    require('./src/routes/supportRoutes');
    require('./src/routes/settingRoutes');
    require('./src/routes/attendanceRoutes');
    require('./src/routes/leaveRoutes');
    require('./src/routes/reportRoutes');
    console.log('   OK');
} catch (e) {
    console.error('FAILED AT ROUTES');
    console.error(e);
}

try {
    console.log('8. Requiring Scheduler...');
    require('./src/services/scheduler');
    console.log('   OK');
} catch (e) {
    console.error('FAILED AT SCHEDULER');
}
