const prisma = require('../prisma');
const { supabaseAdmin } = require('../lib/supabase');
const { getIstDateString } = require('../config/officeConfig');

const isValidDateString = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));

const buildSummary = (rows) => {
    const summary = {
        total: rows.length,
        present: 0,
        late: 0,
        half_day: 0,
        absent: 0,
        leave: 0,
    };

    for (const row of rows) {
        if (Object.prototype.hasOwnProperty.call(summary, row.status)) {
            summary[row.status] += 1;
        }
    }

    return summary;
};

exports.getAttendanceReport = async (req, res) => {
    try {
        const end = req.query.end || getIstDateString();
        const start = req.query.start || end;

        if (!isValidDateString(start) || !isValidDateString(end)) {
            return res.status(400).json({ message: 'start and end must use YYYY-MM-DD format' });
        }

        if (start > end) {
            return res.status(400).json({ message: 'start date cannot be after end date' });
        }

        const { data, error } = await supabaseAdmin
            .from('attendance')
            .select('*')
            .gte('date', start)
            .lte('date', end)
            .order('date', { ascending: false });

        if (error) {
            throw error;
        }

        const rows = data || [];
        const empIds = [...new Set(rows.map((row) => row.employee_id))];

        const users = await prisma.user.findMany({
            where: { empId: { in: empIds } },
            select: { empId: true, name: true, team: true },
        });

        const userMap = new Map(users.map((user) => [user.empId, user]));
        const teamStatsMap = new Map();

        const reportRows = rows.map((row) => {
            const user = userMap.get(row.employee_id);
            const teamName = user?.team || 'UNASSIGNED';

            if (!teamStatsMap.has(teamName)) {
                teamStatsMap.set(teamName, {
                    name: teamName,
                    present: 0,
                    late: 0,
                    half_day: 0,
                    absent: 0,
                    leave: 0,
                });
            }

            const stats = teamStatsMap.get(teamName);
            if (Object.prototype.hasOwnProperty.call(stats, row.status)) {
                stats[row.status] += 1;
            }

            return {
                id: row.id,
                employeeId: row.employee_id,
                employeeName: user?.name || row.employee_id,
                team: user?.team || null,
                date: row.date,
                status: row.status,
                checkInTime: row.check_in_time,
                remarks: row.remarks,
            };
        });

        return res.json({
            range: { start, end },
            summary: buildSummary(rows),
            teamStats: [...teamStatsMap.values()],
            rows: reportRows,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to build attendance report' });
    }
};
