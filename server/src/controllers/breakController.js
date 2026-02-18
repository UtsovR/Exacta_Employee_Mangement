const prisma = require('../prisma');

// @desc    Start technical/tea break
// @route   POST /api/breaks/start
// @access  Private
exports.startBreak = async (req, res) => {
    const userId = req.user.id;
    const team = req.user.team;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user.currentStatus !== 'WORKING') {
            return res.status(400).json({ message: 'Cannot start break unless status is WORKING' });
        }

        // CALLER Optimization: Check concurrency
        if (team === 'CALLER') {
            const activeCallersOnBreak = await prisma.user.count({
                where: {
                    team: 'CALLER',
                    currentStatus: 'ON_BREAK'
                }
            });

            const MAX_CALLERS_ON_BREAK = 2; // Configurable
            if (activeCallersOnBreak >= MAX_CALLERS_ON_BREAK) {
                return res.status(400).json({ message: 'Maximum concurrent breaks reached for Callers. Please wait.' });
            }
        }

        // DEV Team Warning (Soft Limit)
        let warning = null;
        if (team === 'DEVELOPMENT') {
            // Calculate today's usage
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const logs = await prisma.breakLog.findMany({
                where: {
                    userId,
                    date: { gte: today },
                    type: 'BREAK'
                }
            });
            const used = logs.reduce((acc, log) => acc + (log.duration || 0), 0);
            if (used >= 60) {
                warning = 'You have exceeded your daily break limit of 60 minutes.';
            }
        }

        // Start Break
        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { currentStatus: 'ON_BREAK' }
            }),
            prisma.breakLog.create({
                data: {
                    userId,
                    type: 'BREAK',
                    status: 'ACTIVE',
                    startTime: new Date(),
                }
            })
        ]);

        // Emit socket event
        const io = req.app.get('io');
        io.emit('statusUpdate', { userId, status: 'ON_BREAK' });

        res.json({ message: 'Break started', status: 'ON_BREAK', warning });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    End break
// @route   POST /api/breaks/end
// @access  Private
exports.endBreak = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user.currentStatus !== 'ON_BREAK' && user.currentStatus !== 'BREAK_OVERDUE') {
            // Allow ending if overdue as well
            if (user.currentStatus === 'WORKING') {
                return res.status(400).json({ message: 'Not currently on break' });
            }
        }

        // Find active log
        const activeLog = await prisma.breakLog.findFirst({
            where: {
                userId,
                status: 'ACTIVE',
                NOT: { type: 'LUNCH' } // This endpoint is for non-lunch breaks usually
            },
            orderBy: { startTime: 'desc' }
        });

        if (!activeLog) {
            // Fallback or error?
            // Just reset status if no log found
        }

        const endTime = new Date();
        const duration = activeLog ? Math.floor((endTime - new Date(activeLog.startTime)) / 60000) : 0;

        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { currentStatus: 'WORKING' }
            }),
            activeLog ? prisma.breakLog.update({
                where: { id: activeLog.id },
                data: {
                    endTime,
                    status: 'COMPLETED',
                    duration
                }
            }) : prisma.$queryRaw`SELECT 1` // No-op
        ]);

        // Emit socket
        const io = req.app.get('io');
        io.emit('statusUpdate', { userId, status: 'WORKING' });

        res.json({ message: 'Break ended', status: 'WORKING', duration });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get current status and today's stats
// @route   GET /api/breaks/status
// @access  Private
exports.getMyStatus = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        // Calculate today's usage
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const logs = await prisma.breakLog.findMany({
            where: {
                userId: req.user.id,
                date: { gte: today },
                type: 'BREAK'
            }
        });

        const totalUsed = logs.reduce((acc, log) => acc + (log.duration || 0), 0);

        res.json({
            status: user.currentStatus,
            totalBreakUsed: totalUsed
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}
