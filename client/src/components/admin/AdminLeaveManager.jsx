import { useState, useEffect, useCallback } from 'react';
import { Check, X, Calendar, User, MessageSquare } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';

const AdminLeaveManager = () => {
    const { token } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const fetchPendingLeaves = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiRequest('/api/leaves/pending', { token });
            setLeaves(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching pending leaves:', error);
            setLeaves([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchPendingLeaves();
    }, [fetchPendingLeaves]);

    const handleReview = async (leaveId, newStatus) => {
        setProcessingId(leaveId);
        try {
            await apiRequest(`/api/leaves/${leaveId}/review`, {
                method: 'PATCH',
                token,
                body: { status: newStatus },
            });
            setLeaves((previous) => previous.filter((leave) => leave.id !== leaveId));
        } catch (error) {
            console.error('Error reviewing leave:', error);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return <div className="h-64 animate-pulse rounded-2xl border border-brand-gray-border bg-white p-8" />;
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-brand-gray-border bg-white shadow-sm">
            <div className="border-b border-brand-gray-border bg-gray-50/50 p-6">
                <h3 className="flex items-center gap-2 font-bold text-brand-dark">
                    <Calendar className="text-brand-blue-DEFAULT" size={20} />
                    Pending Leave Requests
                </h3>
            </div>

            <div className="divide-y divide-brand-gray-border">
                {leaves.length === 0 ? (
                    <div className="p-12 text-center italic text-brand-gray-text">
                        No pending leave requests to review.
                    </div>
                ) : (
                    leaves.map((leave) => (
                        <div key={leave.id} className="p-6 transition-colors hover:bg-gray-50">
                            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue-highlight font-bold text-brand-blue-dark">
                                            {leave.employeeName?.charAt(0) || <User size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-brand-dark">
                                                {leave.employeeName || 'Unknown Employee'}
                                            </p>
                                            <p className="text-xs text-brand-gray-text">
                                                Applied on {new Date(leave.appliedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center gap-1.5 font-medium text-brand-dark">
                                            <Calendar size={14} className="text-brand-gray-text" />
                                            {new Date(leave.date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </div>
                                        <Badge variant="neutral" className="capitalize">
                                            {leave.type.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <div className="flex items-start gap-2 rounded-lg border border-brand-gray-border bg-white p-3">
                                        <MessageSquare size={14} className="mt-1 shrink-0 text-brand-gray-text" />
                                        <p className="text-sm leading-relaxed text-brand-gray-text">
                                            <span className="font-semibold text-brand-dark">Reason:</span> {leave.reason}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-3">
                                    <button
                                        onClick={() => handleReview(leave.id, 'rejected')}
                                        disabled={!!processingId}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-600 transition-all hover:bg-red-50 md:flex-none"
                                    >
                                        <X size={16} /> Reject
                                    </button>
                                    <button
                                        onClick={() => handleReview(leave.id, 'approved')}
                                        disabled={!!processingId}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-green-100 transition-all hover:bg-green-700 md:flex-none"
                                    >
                                        <Check size={16} /> Approve
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminLeaveManager;
