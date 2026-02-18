import { useState, useEffect, useCallback } from 'react';
import { Calendar, Edit2, Check, X, AlertCircle } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { ATTENDANCE_STATUS } from '@/constants/config';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';

const AdminAttendanceManager = () => {
    const { token } = useAuth();
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ status: '', remarks: '' });

    const fetchAttendanceByDate = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiRequest('/api/attendance', {
                token,
                query: { date: selectedDate },
            });
            setAttendanceData(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching attendance:', error);
            setAttendanceData([]);
        } finally {
            setLoading(false);
        }
    }, [selectedDate, token]);

    useEffect(() => {
        fetchAttendanceByDate();
    }, [fetchAttendanceByDate]);

    const handleEditClick = (record) => {
        setEditingId(record.id);
        setEditForm({ status: record.status, remarks: record.remarks || '' });
    };

    const handleSaveEdit = async (record) => {
        try {
            await apiRequest(`/api/attendance/${record.id}`, {
                method: 'PATCH',
                token,
                body: {
                    status: editForm.status,
                    remarks: editForm.remarks,
                },
            });
            setEditingId(null);
            await fetchAttendanceByDate();
        } catch (error) {
            console.error('Error saving attendance edit:', error);
        }
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-brand-gray-border bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-brand-gray-border bg-gray-50/50 p-6 md:flex-row md:items-center">
                <h3 className="flex items-center gap-2 font-bold text-brand-dark">
                    <Calendar className="text-brand-blue-DEFAULT" size={20} />
                    Daily Attendance Tracking
                </h3>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-brand-gray-text">View Date:</label>
                    <input
                        type="date"
                        className="rounded-lg border border-brand-gray-border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
                        value={selectedDate}
                        onChange={(event) => setSelectedDate(event.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 text-xs font-bold uppercase tracking-wider text-brand-gray-text">
                        <tr>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Check-in</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Remarks</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-gray-border">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="p-12 text-center text-brand-gray-text animate-pulse">
                                    Loading attendance data...
                                </td>
                            </tr>
                        ) : attendanceData.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-12 text-center italic text-brand-gray-text">
                                    No attendance records for this date.
                                </td>
                            </tr>
                        ) : (
                            attendanceData.map((record) => (
                                <tr key={record.id} className="transition-colors hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-brand-dark">{record.employeeName}</div>
                                        <div className="text-xs text-brand-gray-text">{record.employeeId}</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm text-brand-gray-text">
                                        {record.checkInTime
                                            ? new Date(record.checkInTime).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })
                                            : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === record.id ? (
                                            <select
                                                className="rounded border border-brand-gray-border bg-white px-2 py-1 text-sm"
                                                value={editForm.status}
                                                onChange={(event) =>
                                                    setEditForm({ ...editForm, status: event.target.value })
                                                }
                                            >
                                                {Object.entries(ATTENDANCE_STATUS).map(([key, value]) => (
                                                    <option key={key} value={value}>
                                                        {value.replace('_', ' ')}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <Badge
                                                variant={
                                                    record.status === 'present'
                                                        ? 'working'
                                                        : record.status === 'late'
                                                            ? 'break'
                                                            : 'neutral'
                                                }
                                                className="capitalize"
                                            >
                                                {record.status?.replace('_', ' ')}
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-brand-gray-text">
                                        {editingId === record.id ? (
                                            <input
                                                type="text"
                                                className="w-full rounded border border-brand-gray-border bg-white px-2 py-1 text-sm"
                                                placeholder="Mandatory manual override reason..."
                                                value={editForm.remarks}
                                                onChange={(event) =>
                                                    setEditForm({ ...editForm, remarks: event.target.value })
                                                }
                                            />
                                        ) : (
                                            record.remarks || '-'
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {editingId === record.id ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="rounded-lg p-1.5 text-brand-gray-text transition-colors hover:bg-gray-200"
                                                >
                                                    <X size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleSaveEdit(record)}
                                                    disabled={!editForm.remarks}
                                                    className="rounded-lg bg-brand-blue-DEFAULT p-1.5 text-white transition-all hover:bg-brand-blue-dark disabled:opacity-50"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEditClick(record)}
                                                className="rounded-lg p-2 text-brand-gray-text transition-all hover:bg-brand-blue-highlight hover:text-brand-blue-DEFAULT"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="flex items-center gap-2 border-t border-yellow-100 bg-yellow-50 p-4 text-xs text-yellow-800">
                <AlertCircle size={14} className="shrink-0" />
                All manual overrides are logged in audit logs for security and transparency.
            </div>
        </div>
    );
};

export default AdminAttendanceManager;
