import { useState, useEffect, useCallback } from 'react';
import { Clock, Coffee, Briefcase, FileText } from 'lucide-react';
import clsx from 'clsx';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';

const EmployeeActivity = () => {
    const { token } = useAuth();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchActivityHistory = useCallback(async () => {
        setLoading(true);
        try {
            const attendance = await apiRequest('/api/attendance/me/history', {
                token,
                query: { limit: 20 },
            });

            const mappedAttendance = (attendance || []).map((row) => ({
                id: `att-${row.id}`,
                type: 'ATTENDANCE',
                title:
                    row.status === 'present'
                        ? 'Marked Present'
                        : row.status === 'late'
                            ? 'Marked Late'
                            : row.status === 'half_day'
                                ? 'Half Day recorded'
                                : row.status === 'leave'
                                    ? 'Leave marked'
                                    : 'Absent',
                subtitle: row.checkInTime
                    ? `Check-in: ${new Date(row.checkInTime).toLocaleTimeString()}`
                    : 'No check-in',
                date: row.date,
                status: row.status,
                color: row.status === 'present' ? 'green' : 'yellow',
            }));

            setActivities(mappedAttendance);
        } catch (error) {
            console.error('Error fetching activity:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchActivityHistory();
    }, [fetchActivityHistory]);

    if (loading) {
        return (
            <div className="mx-auto max-w-4xl space-y-4 animate-pulse">
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="h-24 rounded-2xl border border-gray-200 bg-gray-100" />
                ))}
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-brand-dark">
                    <Clock className="text-brand-blue-DEFAULT" />
                    Activity History
                </h1>
                <p className="text-sm text-brand-gray-text">Last 20 updates</p>
            </div>

            {activities.length === 0 ? (
                <div className="rounded-2xl border border-brand-gray-border bg-white p-20 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-brand-gray-text">
                        <FileText size={32} />
                    </div>
                    <h3 className="mb-1 font-bold text-brand-dark">No activity yet</h3>
                    <p className="text-sm text-brand-gray-text">Your attendance and work logs will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="group flex items-center justify-between rounded-2xl border border-brand-gray-border bg-white p-6 shadow-sm transition-all hover:border-brand-blue-DEFAULT"
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className={clsx(
                                        'flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110',
                                        activity.color === 'green'
                                            ? 'bg-green-50 text-green-600'
                                            : 'bg-yellow-50 text-yellow-600'
                                    )}
                                >
                                    {activity.type === 'ATTENDANCE' ? <Briefcase size={24} /> : <Coffee size={24} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-brand-dark">{activity.title}</h3>
                                    <p className="text-sm text-brand-gray-text">{activity.subtitle}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-brand-dark">
                                    {new Date(activity.date).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </p>
                                <Badge
                                    variant={
                                        activity.status === 'present'
                                            ? 'working'
                                            : activity.status === 'late'
                                                ? 'break'
                                                : 'neutral'
                                    }
                                >
                                    {activity.status}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EmployeeActivity;
