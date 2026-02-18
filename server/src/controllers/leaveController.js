const prisma = require('../prisma');
const { supabaseAdmin } = require('../lib/supabase');

const LEAVE_TYPES = new Set(['full_day', 'half_day']);
const REVIEW_STATUSES = new Set(['approved', 'rejected']);

const isValidDateString = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));

const mapLeaveRow = (row) => {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        employeeId: row.employee_id,
        date: row.date,
        type: row.type,
        reason: row.reason,
        status: row.status,
        appliedAt: row.applied_at || row.created_at || null,
        reviewedBy: row.reviewed_by || null,
        reviewedAt: row.reviewed_at || null,
        reviewNote: row.review_note || null,
    };
};

const loadUserMapByEmpId = async (empIds) => {
    if (!empIds.length) {
        return new Map();
    }

    const users = await prisma.user.findMany({
        where: { empId: { in: empIds } },
        select: { id: true, empId: true, name: true, team: true },
    });

    return new Map(users.map((user) => [user.empId, user]));
};

exports.createLeave = async (req, res) => {
    try {
        const { date, type, reason } = req.body || {};
        if (!isValidDateString(date)) {
            return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
        }

        if (!LEAVE_TYPES.has(type)) {
            return res.status(400).json({ message: 'Invalid leave type' });
        }

        if (!reason || !String(reason).trim()) {
            return res.status(400).json({ message: 'reason is required' });
        }

        const { data, error } = await supabaseAdmin
            .from('leaves')
            .insert({
                employee_id: req.user.empId,
                date,
                type,
                reason: String(reason).trim(),
                status: 'pending',
            })
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return res.status(201).json(mapLeaveRow(data));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to create leave request' });
    }
};

exports.getMyLeaves = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('leaves')
            .select('*')
            .eq('employee_id', req.user.empId)
            .order('date', { ascending: false })
            .limit(50);

        if (error) {
            throw error;
        }

        return res.json((data || []).map(mapLeaveRow));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to fetch leave requests' });
    }
};

exports.getPendingLeaves = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('leaves')
            .select('*')
            .eq('status', 'pending')
            .order('applied_at', { ascending: true });

        if (error) {
            throw error;
        }

        const rows = data || [];
        const userMap = await loadUserMapByEmpId(rows.map((row) => row.employee_id));

        const response = rows.map((row) => {
            const user = userMap.get(row.employee_id);
            return {
                ...mapLeaveRow(row),
                employeeName: user?.name || row.employee_id,
                team: user?.team || null,
                userId: user?.id || null,
            };
        });

        return res.json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to fetch pending leaves' });
    }
};

exports.reviewLeave = async (req, res) => {
    try {
        const leaveId = Number.parseInt(req.params.id, 10);
        if (Number.isNaN(leaveId)) {
            return res.status(400).json({ message: 'Invalid leave id' });
        }

        const { status, reviewNote } = req.body || {};
        if (!REVIEW_STATUSES.has(status)) {
            return res.status(400).json({ message: 'status must be approved or rejected' });
        }

        const { data: oldLeave, error: oldLeaveError } = await supabaseAdmin
            .from('leaves')
            .select('*')
            .eq('id', leaveId)
            .single();

        if (oldLeaveError) {
            throw oldLeaveError;
        }

        const { data: updatedLeave, error: updateError } = await supabaseAdmin
            .from('leaves')
            .update({
                status,
                reviewed_by: req.user.empId,
                reviewed_at: new Date().toISOString(),
                review_note: reviewNote || null,
            })
            .eq('id', leaveId)
            .select('*')
            .single();

        if (updateError) {
            throw updateError;
        }

        if (status === 'approved') {
            const { error: attendanceError } = await supabaseAdmin
                .from('attendance')
                .upsert(
                    {
                        employee_id: oldLeave.employee_id,
                        date: oldLeave.date,
                        status: 'leave',
                        remarks: 'Approved leave',
                        updated_by: req.user.empId,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: 'employee_id,date' }
                );

            if (attendanceError) {
                throw attendanceError;
            }
        }

        const { error: auditError } = await supabaseAdmin
            .from('audit_logs')
            .insert({
                entity_type: 'leave',
                entity_id: leaveId,
                action: `leave_${status}`,
                old_value: {
                    status: oldLeave.status,
                    review_note: oldLeave.review_note,
                },
                new_value: {
                    status: updatedLeave.status,
                    review_note: updatedLeave.review_note,
                },
                performed_by: req.user.empId,
            });

        if (auditError) {
            throw auditError;
        }

        const user = await prisma.user.findUnique({
            where: { empId: oldLeave.employee_id },
            select: { id: true },
        });

        if (user) {
            await prisma.notification.create({
                data: {
                    userId: user.id,
                    title: `Leave ${status}`,
                    message:
                        status === 'approved'
                            ? `Your leave for ${oldLeave.date} has been approved.`
                            : `Your leave for ${oldLeave.date} has been rejected.`,
                    type: status === 'approved' ? 'SUCCESS' : 'ALERT',
                },
            });
        }

        return res.json(mapLeaveRow(updatedLeave));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to review leave request' });
    }
};
