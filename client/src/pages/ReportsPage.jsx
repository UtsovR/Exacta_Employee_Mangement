import { useState, useEffect, useCallback } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { Download, Calendar, Filter, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';

const STATUS_COLORS = {
    present: '#10B981',
    late: '#F59E0B',
    half_day: '#6366F1',
    absent: '#EF4444',
    leave: '#2563EB',
};

const ReportsPage = () => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [reportRows, setReportRows] = useState([]);
    const [teamStats, setTeamStats] = useState([]);
    const [summary, setSummary] = useState({
        total: 0,
        present: 0,
        late: 0,
        half_day: 0,
        absent: 0,
        leave: 0,
    });
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });

    const fetchReportData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiRequest('/api/reports/attendance', {
                token,
                query: {
                    start: dateRange.start,
                    end: dateRange.end,
                },
            });

            setReportRows(data?.rows || []);
            setTeamStats(data?.teamStats || []);
            setSummary(
                data?.summary || {
                    total: 0,
                    present: 0,
                    late: 0,
                    half_day: 0,
                    absent: 0,
                    leave: 0,
                }
            );
        } catch (error) {
            console.error('Error fetching report data:', error);
            setReportRows([]);
            setTeamStats([]);
            setSummary({
                total: 0,
                present: 0,
                late: 0,
                half_day: 0,
                absent: 0,
                leave: 0,
            });
        } finally {
            setLoading(false);
        }
    }, [dateRange.end, dateRange.start, token]);

    useEffect(() => {
        fetchReportData();
    }, [fetchReportData]);

    const exportToCSV = () => {
        if (reportRows.length === 0) {
            return;
        }

        const headers = ['Employee ID', 'Employee Name', 'Date', 'Check-in', 'Status', 'Remarks'];
        const rows = reportRows.map((item) => [
            item.employeeId,
            item.employeeName,
            item.date,
            item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString() : '-',
            item.status,
            item.remarks || '',
        ]);

        const csvContent =
            'data:text/csv;charset=utf-8,' +
            headers.join(',') +
            '\n' +
            rows.map((row) => row.join(',')).join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `attendance_report_${dateRange.start}_to_${dateRange.end}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const pieData = [
        { name: 'Present', value: summary.present },
        { name: 'Late', value: summary.late },
        { name: 'Half Day', value: summary.half_day },
        { name: 'Absent', value: summary.absent },
        { name: 'Leave', value: summary.leave },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-brand-dark">Reports and Analytics</h1>
                    <p className="text-brand-gray-text">Analyze team performance and attendance patterns.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-lg border border-brand-gray-border bg-white px-3 py-1.5 transition-all focus-within:ring-2 focus-within:ring-brand-blue-DEFAULT">
                        <Calendar size={16} className="text-brand-gray-text" />
                        <input
                            type="date"
                            className="bg-transparent text-sm outline-none"
                            value={dateRange.start}
                            onChange={(event) => setDateRange({ ...dateRange, start: event.target.value })}
                        />
                        <span className="text-xs font-bold text-brand-gray-text">TO</span>
                        <input
                            type="date"
                            className="bg-transparent text-sm outline-none"
                            value={dateRange.end}
                            onChange={(event) => setDateRange({ ...dateRange, end: event.target.value })}
                        />
                    </div>
                    <Button variant="secondary" icon={Download} onClick={exportToCSV}>
                        Export CSV
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="h-48 animate-pulse rounded-2xl border border-brand-gray-border bg-white p-8" />
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="rounded-xl border border-brand-gray-border bg-white p-4 shadow-sm">
                            <p className="mb-1 text-xs font-bold uppercase text-brand-gray-text">Total Logs</p>
                            <p className="text-2xl font-bold text-brand-dark">{summary.total}</p>
                        </div>
                        <div className="rounded-xl border border-brand-gray-border bg-white p-4 shadow-sm">
                            <p className="mb-1 text-xs font-bold uppercase text-green-600">Present</p>
                            <p className="text-2xl font-bold text-brand-dark">{summary.present}</p>
                        </div>
                        <div className="rounded-xl border border-brand-gray-border bg-white p-4 shadow-sm">
                            <p className="mb-1 text-xs font-bold uppercase text-yellow-600">Late</p>
                            <p className="text-2xl font-bold text-brand-dark">{summary.late}</p>
                        </div>
                        <div className="rounded-xl border border-brand-gray-border bg-white p-4 shadow-sm">
                            <p className="mb-1 text-xs font-bold uppercase text-red-600">Half Day / Absent / Leave</p>
                            <p className="text-2xl font-bold text-brand-dark">
                                {summary.half_day + summary.absent + summary.leave}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 pb-8 lg:grid-cols-2">
                        <div className="rounded-xl border border-brand-gray-border bg-white p-6 shadow-sm">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-brand-dark">
                                <Users size={20} className="text-brand-blue-DEFAULT" />
                                Team-wise Attendance
                            </h3>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={teamStats}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                        <Tooltip
                                            cursor={{ fill: '#F8FAFC' }}
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            }}
                                        />
                                        <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
                                        <Bar dataKey="present" name="Present" fill={STATUS_COLORS.present} radius={[4, 4, 0, 0]} barSize={20} />
                                        <Bar dataKey="late" name="Late" fill={STATUS_COLORS.late} radius={[4, 4, 0, 0]} barSize={20} />
                                        <Bar dataKey="half_day" name="Half Day" fill={STATUS_COLORS.half_day} radius={[4, 4, 0, 0]} barSize={20} />
                                        <Bar dataKey="absent" name="Absent" fill={STATUS_COLORS.absent} radius={[4, 4, 0, 0]} barSize={20} />
                                        <Bar dataKey="leave" name="Leave" fill={STATUS_COLORS.leave} radius={[4, 4, 0, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="rounded-xl border border-brand-gray-border bg-white p-6 shadow-sm">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-brand-dark">
                                <Filter size={20} className="text-brand-blue-DEFAULT" />
                                Status Distribution
                            </h3>
                            <div className="flex h-80 w-full items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={80}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            <Cell fill={STATUS_COLORS.present} />
                                            <Cell fill={STATUS_COLORS.late} />
                                            <Cell fill={STATUS_COLORS.half_day} />
                                            <Cell fill={STATUS_COLORS.absent} />
                                            <Cell fill={STATUS_COLORS.leave} />
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            }}
                                        />
                                        <Legend layout="vertical" align="right" verticalAlign="middle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ReportsPage;
