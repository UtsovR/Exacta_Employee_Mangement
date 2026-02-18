import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import clsx from 'clsx';
import Button from '@/components/ui/Button';
import { isWithinMarkPresentWindow } from "@/lib/timeUtils";
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';

const getTodayIsoDate = () => new Date().toISOString().split('T')[0];

const AttendanceCard = ({ onStatusChange }) => {
    const { token, officeConfig } = useAuth();
    const [attendance, setAttendance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);

    const fetchTodayAttendance = useCallback(async () => {
        try {
            const data = await apiRequest('/api/attendance/me', {
                token,
                query: { date: getTodayIsoDate() },
            });
            if (data?.status) {
                setAttendance(data);
            } else {
                setAttendance(null);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchTodayAttendance();
    }, [fetchTodayAttendance]);

    const handleMarkPresent = async () => {
        setMarking(true);
        try {
            const data = await apiRequest('/api/attendance/mark', {
                method: 'POST',
                token,
            });
            setAttendance(data);
            if (onStatusChange) {
                onStatusChange(data);
            }
        } catch (error) {
            console.error('Error marking attendance:', error);
        } finally {
            setMarking(false);
        }
    };

    if (loading) {
        return <div className="h-32 animate-pulse rounded-2xl border border-brand-gray-border bg-white p-6" />;
    }

    const isWindowOpen = isWithinMarkPresentWindow(officeConfig);
    const hasMarked = !!attendance;

    return (
        <div className="rounded-2xl border border-brand-gray-border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold text-brand-dark">
                    <Clock size={20} className="text-brand-blue-DEFAULT" />
                    Today&apos;s Attendance
                </h3>
                {hasMarked && (
                    <span
                        className={clsx(
                            'rounded-full px-3 py-1 text-xs font-bold uppercase',
                            attendance.status === 'present'
                                ? 'bg-green-100 text-green-700'
                                : attendance.status === 'late'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                        )}
                    >
                        {attendance.status.replace('_', ' ')}
                    </span>
                )}
            </div>

            {!hasMarked ? (
                <div className="space-y-4">
                    <p className="text-sm text-brand-gray-text">
                        {isWindowOpen
                            ? `Office started at ${officeConfig.START_TIME}. Please mark your presence.`
                            : `Attendance window is ${officeConfig.START_TIME} - ${officeConfig.AUTO_ABSENT_TIME}.`}
                    </p>
                    <Button
                        onClick={handleMarkPresent}
                        disabled={!isWindowOpen || marking}
                        isLoading={marking}
                        className="w-full justify-center"
                        icon={CheckCircle}
                    >
                        Mark Present
                    </Button>
                </div>
            ) : (
                <div className="flex items-center gap-3 rounded-xl border border-brand-blue-highlight bg-brand-blue-highlight/30 p-3">
                    <CheckCircle className="text-brand-blue-DEFAULT" size={24} />
                    <div>
                        <p className="text-sm font-bold text-brand-blue-dark">Attendance Recorded</p>
                        <p className="text-xs text-brand-blue-dark/70">
                            Check-in:{' '}
                            {attendance.checkInTime
                                ? new Date(attendance.checkInTime).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })
                                : '-'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceCard;
