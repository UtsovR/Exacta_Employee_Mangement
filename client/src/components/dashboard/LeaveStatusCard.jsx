import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';

const LeaveStatusCard = ({ refreshTrigger }) => {
    const { token } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRecentLeaves = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiRequest('/api/leaves/me', { token });
            setLeaves((data || []).slice(0, 3));
        } catch (error) {
            console.error('Error fetching leaves:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchRecentLeaves();
    }, [fetchRecentLeaves, refreshTrigger]);

    if (loading) {
        return <div className="h-32 animate-pulse rounded-2xl border border-brand-gray-border bg-white p-6" />;
    }

    return (
        <div className="rounded-2xl border border-brand-gray-border bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-brand-dark">
                <Calendar size={20} className="text-brand-blue-DEFAULT" />
                Recent Leave Requests
            </h3>

            {leaves.length === 0 ? (
                <p className="text-sm italic text-brand-gray-text">No recent leave requests found.</p>
            ) : (
                <div className="space-y-3">
                    {leaves.map((leave) => (
                        <div
                            key={leave.id}
                            className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={clsx(
                                        'rounded-lg p-2',
                                        leave.status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-600'
                                            : leave.status === 'approved'
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-red-100 text-red-600'
                                    )}
                                >
                                    {leave.status === 'pending' ? (
                                        <Clock size={16} />
                                    ) : leave.status === 'approved' ? (
                                        <CheckCircle2 size={16} />
                                    ) : (
                                        <XCircle size={16} />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-brand-dark">
                                        {new Date(leave.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </p>
                                    <p className="text-xs capitalize text-brand-gray-text">
                                        {leave.type.replace('_', ' ')}
                                    </p>
                                </div>
                            </div>
                            <span
                                className={clsx(
                                    'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase',
                                    leave.status === 'pending'
                                        ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                                        : leave.status === 'approved'
                                            ? 'border-green-200 bg-green-50 text-green-700'
                                            : 'border-red-200 bg-red-50 text-red-700'
                                )}
                            >
                                {leave.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LeaveStatusCard;
