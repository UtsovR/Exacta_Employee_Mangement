const cron = require('node-cron');
const prisma = require('../prisma');
const { supabaseAdmin } = require('../lib/supabase');
const { getOfficeConfig } = require('./settingsService');
const {
    getIstDateString,
    normalizeOfficeConfig,
    timeToCronExpression,
} = require('../config/officeConfig');

const closeAllActiveBreakLogs = async (status, now) => {
    const activeBreaks = await prisma.breakLog.findMany({
        where: { status: 'ACTIVE' },
    });

    for (const log of activeBreaks) {
        await prisma.breakLog.update({
            where: { id: log.id },
            data: {
                status,
                endTime: now,
                duration: Math.floor((now - new Date(log.startTime)) / 60000),
            },
        });
    }
};

const startLunch = async (io) => {
    console.log('[Scheduler] Running lunch START job');

    const now = new Date();
    await closeAllActiveBreakLogs('FORCED_END', now);

    await prisma.user.updateMany({
        where: { role: 'EMPLOYEE', isActive: true },
        data: { currentStatus: 'LUNCH' },
    });

    const employees = await prisma.user.findMany({
        where: { role: 'EMPLOYEE', isActive: true },
        select: { id: true },
    });

    if (employees.length > 0) {
        await prisma.breakLog.createMany({
            data: employees.map((employee) => ({
                userId: employee.id,
                type: 'LUNCH',
                status: 'ACTIVE',
                startTime: now,
            })),
        });
    }

    io.emit('globalStatusUpdate', { status: 'LUNCH', message: 'Lunch Break Started' });
};

const endLunch = async (io) => {
    console.log('[Scheduler] Running lunch END job');

    const now = new Date();
    const activeLunchLogs = await prisma.breakLog.findMany({
        where: { type: 'LUNCH', status: 'ACTIVE' },
    });

    for (const log of activeLunchLogs) {
        await prisma.breakLog.update({
            where: { id: log.id },
            data: {
                status: 'COMPLETED',
                endTime: now,
                duration: Math.floor((now - new Date(log.startTime)) / 60000),
            },
        });
    }

    await prisma.user.updateMany({
        where: { role: 'EMPLOYEE', currentStatus: 'LUNCH' },
        data: { currentStatus: 'WORKING' },
    });

    io.emit('globalStatusUpdate', { status: 'WORKING', message: 'Lunch Break Ended' });
};

const markAbsentees = async () => {
    console.log('[Scheduler] Running auto-absent job');

    const date = getIstDateString();
    const employees = await prisma.user.findMany({
        where: { role: 'EMPLOYEE', isActive: true },
        select: { empId: true },
    });

    if (employees.length === 0) {
        return;
    }

    const { data: existingRows, error: fetchError } = await supabaseAdmin
        .from('attendance')
        .select('employee_id')
        .eq('date', date);

    if (fetchError) {
        throw fetchError;
    }

    const existingIds = new Set((existingRows || []).map((item) => item.employee_id));
    const absentRows = employees
        .filter((employee) => !existingIds.has(employee.empId))
        .map((employee) => ({
            employee_id: employee.empId,
            date,
            status: 'absent',
            remarks: 'Auto-marked absent by scheduler',
            updated_by: 'SYSTEM',
            updated_at: new Date().toISOString(),
        }));

    if (absentRows.length === 0) {
        return;
    }

    const { error: insertError } = await supabaseAdmin.from('attendance').insert(absentRows);
    if (insertError) {
        throw insertError;
    }
};

module.exports = (io) => {
    const tasks = new Map();

    const clearTasks = () => {
        for (const task of tasks.values()) {
            task.stop();
            if (typeof task.destroy === 'function') {
                task.destroy();
            }
        }
        tasks.clear();
    };

    const registerTask = (name, expression, job) => {
        const task = cron.schedule(
            expression,
            async () => {
                try {
                    await job();
                } catch (error) {
                    console.error(`[Scheduler] ${name} failed`, error);
                }
            },
            { timezone: 'Asia/Kolkata' }
        );
        tasks.set(name, task);
        console.log(`[Scheduler] Registered ${name}: ${expression}`);
    };

    const reschedule = async () => {
        clearTasks();

        const rawConfig = await getOfficeConfig();
        const officeConfig = normalizeOfficeConfig(rawConfig);
        const lunchStartCron = timeToCronExpression(officeConfig.BREAK_WINDOW.START);
        const lunchEndCron = timeToCronExpression(officeConfig.BREAK_WINDOW.END);
        const autoAbsentCron = timeToCronExpression(officeConfig.AUTO_ABSENT_TIME);

        registerTask('lunch-start', lunchStartCron, () => startLunch(io));
        registerTask('lunch-end', lunchEndCron, () => endLunch(io));
        registerTask('auto-absent', autoAbsentCron, markAbsentees);
    };

    reschedule().catch((error) => {
        console.error('[Scheduler] Initial scheduling failed', error);
    });

    return {
        reschedule,
        runLunchStart: () => startLunch(io),
        runLunchEnd: () => endLunch(io),
        runAutoAbsent: markAbsentees,
    };
};
