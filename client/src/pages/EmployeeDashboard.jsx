import { useState, useEffect, useRef, useCallback } from 'react';
import { Coffee, Briefcase, Utensils, Clock, AlertTriangle, Smile, Calendar } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import { timeToMinutes, getCurrentMinutes } from '@/lib/timeUtils';
import StatCard from '@/components/dashboard/StatCard';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';
import AttendanceCard from '@/components/dashboard/AttendanceCard';
import LeaveApplicationModal from '@/components/dashboard/LeaveApplicationModal';
import LeaveStatusCard from '@/components/dashboard/LeaveStatusCard';
import Container from '@/components/ui/Container';

const EmployeeDashboard = () => {
    const { user, token, officeConfig } = useAuth();

    const [status, setStatus] = useState('WORKING');
    const [breakUsed, setBreakUsed] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [logs, setLogs] = useState([]);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leaveRefreshTrigger, setLeaveRefreshTrigger] = useState(0);
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [activeTimer, setActiveTimer] = useState(0);

    const timerRef = useRef(null);
    const uiRef = useRef(null);

    const DAILY_LIMIT = 60;
    const LUNCH_START_MINUTES = timeToMinutes(officeConfig.BREAK_WINDOW.START);
    const LUNCH_END_MINUTES = timeToMinutes(officeConfig.BREAK_WINDOW.END);

    const fetchStatus = useCallback(async () => {
        try {
            const breakData = await apiRequest('/api/breaks/status', { token });
            const attendanceData = await apiRequest('/api/attendance/me', {
                token,
                query: { date: new Date().toISOString().split('T')[0] },
            });

            setStatus(breakData.status);
            setBreakUsed(breakData.totalBreakUsed);
            setTodayAttendance(attendanceData?.status ? attendanceData : null);
            setLogs([
                { id: 1, type: 'LOGIN', title: 'Logged In', subtitle: 'Office Login', time: new Date().setHours(9, 0) },
            ]);
        } catch (requestError) {
            console.error(requestError);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const checkTimeBasedRules = useCallback(() => {
        const currentMins = getCurrentMinutes();
        if (currentMins >= LUNCH_START_MINUTES && currentMins < LUNCH_END_MINUTES) {
            if (status !== 'LUNCH') {
                // Lunch status is server-driven by scheduler.
            }
        }
    }, [LUNCH_END_MINUTES, LUNCH_START_MINUTES, status]);

    useEffect(() => {
        fetchStatus();
        uiRef.current = setInterval(checkTimeBasedRules, 10000);

        return () => {
            if (uiRef.current) {
                clearInterval(uiRef.current);
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [checkTimeBasedRules, fetchStatus]);

    useEffect(() => {
        if (status === 'ON_BREAK' || status === 'LUNCH') {
            if (!timerRef.current) {
                timerRef.current = setInterval(() => {
                    setActiveTimer((value) => value + 1);
                }, 1000);
            }
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            setActiveTimer(0);
        }
    }, [status]);

    const handleStartBreak = async () => {
        setError('');

        if (breakUsed >= DAILY_LIMIT) {
            setError('Daily break limit reached (60 mins).');
            return;
        }

        const currentMins = getCurrentMinutes();
        if (currentMins >= LUNCH_START_MINUTES && currentMins < LUNCH_END_MINUTES) {
            setError('It is currently lunch time. Please wait for lunch flow.');
            return;
        }

        try {
            await apiRequest('/api/breaks/start', { method: 'POST', token });
            setStatus('ON_BREAK');
            setLogs((previous) => [
                {
                    id: Date.now(),
                    type: 'BREAK',
                    title: 'Break Started',
                    subtitle: 'Short Break',
                    time: new Date(),
                },
                ...previous,
            ]);
        } catch (requestError) {
            setError(requestError.message);
        }
    };

    const handleEndBreak = async () => {
        setError('');
        try {
            const data = await apiRequest('/api/breaks/end', { method: 'POST', token });
            setStatus('WORKING');
            setBreakUsed(data.duration ? breakUsed + data.duration : breakUsed);
            setLogs((previous) => [
                {
                    id: Date.now(),
                    type: 'BREAK_END',
                    title: 'Break Ended',
                    subtitle: 'Back to Work',
                    time: new Date(),
                },
                ...previous,
            ]);
            await fetchStatus();
        } catch (requestError) {
            setError(requestError.message);
        }
    };

    const isLunchTime = (() => {
        const minutes = getCurrentMinutes();
        return minutes >= LUNCH_START_MINUTES && minutes < LUNCH_END_MINUTES;
    })();

    const remainingBreak = Math.max(0, DAILY_LIMIT - breakUsed);
    const breakProgress = (breakUsed / DAILY_LIMIT) * 100;

    const formatTimer = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const todayDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    if (loading) {
        return (
            <div className="flex min-h-full items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-brand-blue-DEFAULT" />
            </div>
        );
    }

    return (
        <Container className="space-y-8 py-8 animate-in fade-in">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <h1 className="flex items-center gap-2 text-3xl font-bold text-brand-dark">
                        Good Morning, {user.name.split(' ')[0]}
                    </h1>
                    <p className="mt-1 font-medium text-brand-gray-text">
                        {user.role} • {user.team || 'General Team'}
                    </p>
                </div>
                <div className="hidden text-right md:block">
                    <p className="font-medium text-brand-gray-text">{todayDate}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="md:col-span-1">
                    <AttendanceCard onStatusChange={(newAttendance) => setTodayAttendance(newAttendance)} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-brand-gray-border bg-white p-6 md:col-span-2">
                    <div>
                        <h3 className="mb-1 font-bold text-brand-dark">Company Policy</h3>
                        <p className="text-sm text-brand-gray-text">
                            Office starts at {officeConfig.START_TIME}. Grace period is {officeConfig.LATE_GRACE_MINUTES} mins.
                        </p>
                        <p className="text-sm text-brand-gray-text">
                            Lunch break is fixed from {officeConfig.BREAK_WINDOW.START} to {officeConfig.BREAK_WINDOW.END}.
                        </p>
                    </div>
                    <div className="hidden text-brand-blue-DEFAULT opacity-20 sm:block">
                        <Briefcase size={64} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 pb-2 md:grid-cols-2">
                <LeaveStatusCard refreshTrigger={leaveRefreshTrigger} />
                <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-blue-DEFAULT to-brand-blue-dark p-6 text-center text-white shadow-lg">
                    <Calendar className="absolute -bottom-4 -right-4 opacity-10" size={120} />
                    <div className="z-10">
                        <h3 className="mb-2 text-xl font-bold">Need a day off?</h3>
                        <p className="mb-6 max-w-xs text-sm text-brand-blue-highlight">
                            Apply for full or half-day leaves and track their approval status.
                        </p>
                        <button
                            onClick={() => setShowLeaveModal(true)}
                            className="rounded-xl bg-white px-6 py-2.5 font-bold text-brand-blue-DEFAULT shadow-md transition-all hover:bg-brand-blue-highlight"
                        >
                            Apply for Leave
                        </button>
                    </div>
                </div>
            </div>

            <LeaveApplicationModal
                isOpen={showLeaveModal}
                onClose={() => setShowLeaveModal(false)}
                onSuccess={() => {
                    setLeaveRefreshTrigger((value) => value + 1);
                    setLogs((previous) => [
                        {
                            id: Date.now(),
                            type: 'LEAVE',
                            title: 'Leave Applied',
                            subtitle: 'Pending Approval',
                            time: new Date(),
                        },
                        ...previous,
                    ]);
                }}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Current Status"
                    value={status === 'WORKING' ? 'Working' : status === 'LUNCH' ? 'Lunch Break' : 'On Break'}
                    icon={status === 'WORKING' ? Briefcase : Coffee}
                    color={status === 'WORKING' ? 'green' : status === 'LUNCH' ? 'blue' : 'yellow'}
                    subtext={status === 'WORKING' ? 'Focused and Active' : 'Enjoy your time off'}
                />
                <StatCard
                    title="Break Usage"
                    value={`${breakUsed} / 60 min`}
                    icon={Clock}
                    color="blue"
                    progress={breakProgress}
                    subtext={`${remainingBreak} minutes remaining`}
                    tooltip="Includes all short breaks and lunch time."
                />
                <StatCard
                    title="Lunch Window"
                    value={officeConfig.BREAK_WINDOW.START}
                    icon={Utensils}
                    color="gray"
                    subtext={`Until ${officeConfig.BREAK_WINDOW.END} (Fixed)`}
                />
                <StatCard
                    title="Attendance"
                    value={
                        todayAttendance
                            ? todayAttendance.status === 'present'
                                ? 'Present'
                                : todayAttendance.status === 'late'
                                    ? 'Late'
                                    : todayAttendance.status === 'half_day'
                                        ? 'Half Day'
                                        : todayAttendance.status === 'leave'
                                            ? 'On Leave'
                                            : 'Absent'
                            : 'Not Marked'
                    }
                    icon={Smile}
                    color={todayAttendance ? (todayAttendance.status === 'present' ? 'green' : 'yellow') : 'gray'}
                    subtext={
                        todayAttendance?.checkInTime
                            ? `Check-in: ${new Date(todayAttendance.checkInTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}`
                            : 'Mark your arrival'
                    }
                />
            </div>

            <div className="grid h-full grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-brand-blue-highlight bg-gradient-to-br from-white to-blue-50/50 p-8 text-center shadow-sm lg:col-span-2">
                    <div className="pointer-events-none absolute right-0 top-0 p-12 opacity-5">
                        <Coffee size={200} />
                    </div>

                    <div className="z-10 w-full max-w-md space-y-6">
                        {status === 'WORKING' ? (
                            <>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-brand-dark">Ready for a break?</h2>
                                    <p className="text-brand-gray-text">
                                        You have{' '}
                                        <span className="font-bold text-brand-blue-dark">{remainingBreak} minutes</span>{' '}
                                        of break time remaining today.
                                    </p>
                                </div>

                                {error && (
                                    <div className="animate-in fade-in slide-in-from-top-2 flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                                        <AlertTriangle size={16} />
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleStartBreak}
                                    disabled={remainingBreak <= 0 || isLunchTime}
                                    className={clsx(
                                        'flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-blue-DEFAULT py-5 text-xl font-bold text-white shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 hover:bg-brand-blue-dark active:translate-y-0 disabled:cursor-not-allowed disabled:transform-none disabled:opacity-50'
                                    )}
                                >
                                    <Coffee size={28} />
                                    {isLunchTime ? 'Lunch Time Active' : 'Start Break'}
                                </button>

                                {isLunchTime && (
                                    <p className="inline-block rounded-lg bg-brand-blue-highlight px-4 py-2 text-sm text-brand-blue-dark">
                                        Lunch break is fixed from {officeConfig.BREAK_WINDOW.START} to {officeConfig.BREAK_WINDOW.END}.
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="relative mx-auto mb-6 flex h-48 w-48 items-center justify-center rounded-full border-4 border-yellow-100 bg-white shadow-inner">
                                    <div className="absolute inset-0 animate-spin rounded-full border-t-4 border-yellow-400 opacity-50" />
                                    <div className="z-10 font-mono text-5xl font-bold tabular-nums text-brand-dark">
                                        {formatTimer(activeTimer)}
                                    </div>
                                </div>

                                <h2 className="mb-4 text-2xl font-bold text-brand-dark">You are on break</h2>

                                <button
                                    onClick={handleEndBreak}
                                    className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-red-100 bg-white py-5 text-xl font-bold text-red-600 shadow-lg shadow-gray-100 transition-all hover:bg-red-50"
                                >
                                    <Briefcase size={28} />
                                    I&apos;m Back to Work
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="h-full min-h-[400px] lg:col-span-1">
                    <ActivityTimeline logs={logs} />
                </div>
            </div>
        </Container>
    );
};

export default EmployeeDashboard;
