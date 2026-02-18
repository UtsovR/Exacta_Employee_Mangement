const express = require('express');
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { validateEnv, getCorsOrigins } = require('./config/env');

validateEnv();

const app = express();
const server = http.createServer(app);
const allowedOrigins = getCorsOrigins();

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'PATCH'],
        credentials: true,
    },
});

io.use((socket, next) => {
    const rawAuth =
        socket.handshake.auth?.token || socket.handshake.headers?.authorization || '';

    if (!rawAuth) {
        return next(new Error('Unauthorized socket connection'));
    }

    const token = rawAuth.startsWith('Bearer ') ? rawAuth.slice(7) : rawAuth;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        return next();
    } catch (_error) {
        return next(new Error('Unauthorized socket connection'));
    }
});

app.set('io', io);

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (${socket.user?.empId || 'unknown'})`);

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

if (process.env.DISABLE_SCHEDULER !== 'true') {
    const scheduler = require('./services/scheduler')(io);
    app.set('scheduler', scheduler);
}

app.get('/', (_req, res) => {
    res.json({ message: 'Exacta Break Tracker API' });
});

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const breakRoutes = require('./routes/breakRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const supportRoutes = require('./routes/supportRoutes');
const settingRoutes = require('./routes/settingRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const reportRoutes = require('./routes/reportRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/breaks', breakRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 5000;

const startServer = (port = PORT) =>
    server.listen(port, () => {
        console.log('-----------------------------------------------');
        console.log(`Server running on port ${port}`);
        console.log(`API URL: http://localhost:${port}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log('-----------------------------------------------');
    });

if (require.main === module) {
    startServer();
}

module.exports = {
    app,
    server,
    startServer,
};
