const prisma = require('../prisma');
const { supabaseAdmin } = require('../lib/supabase');
const { getOfficeConfig } = require('../services/settingsService');
const {
    parseTimeToMinutes,
    getIstDateString,
    getIstCurrentMinutes,
} = require('../config/officeConfig');

const ATTENDANCE_STATUSES = new Set(['present', 'late', 'half_day', 'absent', 'leave']);

const isValidDateString = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));

const resolveDate = (value) => {
    if (!value) {
        return getIstDateString();
    }

    if (!isValidDateString(value)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    return value;
};

const mapAttendanceRow = (row) => {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        employeeId: row.employee_id,
        date: row.date,
        status: row.status,
        checkInTime: row.check_in_time,
        remarks: row.remarks,
        updatedBy: row.updated_by || null,
        updatedAt: row.updated_at || null,
    };
};

const determineAttendanceStatus = (currentMinutes, officeConfig) => {
    const startMinutes = parseTimeToMinutes(officeConfig.START_TIME);
    const lateThreshold = parseTimeToMinutes(officeConfig.LATE_THRESHOLD);
    const halfDayThreshold = parseTimeToMinutes(officeConfig.HALF_DAY_THRESHOLD);

    if (currentMinutes < startMinutes) {
        throw new Error(`Attendance marking opens at ${officeConfig.START_TIME}`);
    }

    if (currentMinutes > halfDayThreshold) {
        return 'half_day';
    }

    if (currentMinutes > lateThreshold) {
        return 'late';
    }

    return 'present';
};

const fetchAttendanceByDate = async (date) => {
    const { data, error } = await supabaseAdmin
        .from('attendance')
        .select('*')
        .eq('date', date)
        .order('employee_id', { ascending: true });

    if (error) {
        throw error;
    }

    return data || [];
};

const loadEmployeeMap = async (empIds) => {
    if (!empIds.length) {
        return new Map();
    }

    const users = await prisma.user.findMany({
        where: { empId: { in: empIds } },
        select: {
            id: true,
            empId: true,
            name: true,
            team: true,
        },
    });

    return new Map(users.map((user) => [user.empId, user]));
};

exports.getMyAttendance = async (req, res) => {
    try {
        const date = resolveDate(req.query.date);
        const { data, error } = await supabaseAdmin
            .from('attendance')
            .select('*')
            .eq('employee_id', req.user.empId)
            .eq('date', date)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!data) {
            return res.json({
                employeeId: req.user.empId,
                date,
                status: null,
                checkInTime: null,
                remarks: null,
            });
        }

        return res.json(mapAttendanceRow(data));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to fetch attendance' });
    }
};

exports.getMyAttendanceHistory = async (req, res) => {
    try {
        const limitRaw = Number.parseInt(req.query.limit, 10);
        const limit = Number.isNaN(limitRaw) ? 20 : Math.min(Math.max(limitRaw, 1), 100);

        const { data, error } = await supabaseAdmin
            .from('attendance')
            .select('*')
            .eq('employee_id', req.user.empId)
            .order('date', { ascending: false })
            .limit(limit);

        if (error) {
            throw error;
        }

        return res.json((data || []).map(mapAttendanceRow));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to fetch attendance history' });
    }
};

exports.markMyAttendance = async (req, res) => {
    try {
        const today = getIstDateString();
        const date = resolveDate(req.body?.date || today);
        if (date !== today) {
            return res.status(400).json({ message: 'Attendance can only be marked for today' });
        }

        const officeConfig = await getOfficeConfig();
        const currentMinutes = getIstCurrentMinutes();
        const status = determineAttendanceStatus(currentMinutes, officeConfig);

        const payload = {
            employee_id: req.user.empId,
            date,
            check_in_time: new Date().toISOString(),
            status,
            remarks: status === 'half_day' ? 'Late check-in (post half-day threshold)' : null,
            updated_by: req.user.empId,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabaseAdmin
            .from('attendance')
            .upsert(payload, { onConflict: 'employee_id,date' })
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return res.json(mapAttendanceRow(data));
    } catch (error) {
        if (error.message && error.message.includes('Attendance marking opens')) {
            return res.status(400).json({ message: error.message });
        }

        console.error(error);
        return res.status(500).json({ message: 'Failed to mark attendance' });
    }
};

exports.getAttendanceByDate = async (req, res) => {
    try {
        const date = resolveDate(req.query.date);
        const rows = await fetchAttendanceByDate(date);
        const employeeMap = await loadEmployeeMap(rows.map((row) => row.employee_id));

        const response = rows.map((row) => {
            const employee = employeeMap.get(row.employee_id);
            return {
                ...mapAttendanceRow(row),
                employeeName: employee?.name || row.employee_id,
                team: employee?.team || null,
                userId: employee?.id || null,
            };
        });

        return res.json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to fetch attendance list' });
    }
};

exports.overrideAttendance = async (req, res) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            return res.status(400).json({ message: 'Invalid attendance id' });
        }

        const { status, remarks } = req.body || {};
        if (!ATTENDANCE_STATUSES.has(status)) {
            return res.status(400).json({ message: 'Invalid attendance status' });
        }

        if (!remarks || !String(remarks).trim()) {
            return res.status(400).json({ message: 'remarks is required for overrides' });
        }

        const { data: oldRow, error: oldRowError } = await supabaseAdmin
            .from('attendance')
            .select('*')
            .eq('id', id)
            .single();

        if (oldRowError) {
            throw oldRowError;
        }

        const { data: updatedRow, error: updateError } = await supabaseAdmin
            .from('attendance')
            .update({
                status,
                remarks,
                updated_by: req.user.empId,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select('*')
            .single();

        if (updateError) {
            throw updateError;
        }

        const { error: auditError } = await supabaseAdmin
            .from('audit_logs')
            .insert({
                entity_type: 'attendance',
                entity_id: id,
                action: 'manual_override',
                old_value: {
                    status: oldRow.status,
                    remarks: oldRow.remarks,
                },
                new_value: {
                    status: updatedRow.status,
                    remarks: updatedRow.remarks,
                },
                performed_by: req.user.empId,
            });

        if (auditError) {
            throw auditError;
        }

        return res.json(mapAttendanceRow(updatedRow));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to override attendance' });
    }
};
