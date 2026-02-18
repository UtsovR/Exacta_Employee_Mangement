import { useEffect, useState } from 'react';
import { Save, Clock, Coffee, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { DEFAULT_OFFICE_CONFIG } from '@/constants/config';

const SettingsPage = () => {
    const { token, officeConfig, refreshSettings } = useAuth();
    const [config, setConfig] = useState(officeConfig || DEFAULT_OFFICE_CONFIG);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        setConfig(officeConfig || DEFAULT_OFFICE_CONFIG);
        setLoading(false);
    }, [officeConfig]);

    useEffect(() => {
        refreshSettings(token).catch((error) => {
            console.error('Failed to refresh settings:', error);
        });
    }, [refreshSettings, token]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiRequest('/api/settings', {
                method: 'POST',
                token,
                body: { key: 'OFFICE_CONFIG', value: config },
            });
            await refreshSettings(token);
            setToast({ message: 'Settings saved successfully!', type: 'success' });
        } catch (error) {
            setToast({ message: error.message, type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-10 w-48 rounded bg-gray-200" />
                <div className="h-64 rounded-2xl border border-gray-100 bg-white" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-brand-dark">Office Configuration</h1>
                    <p className="text-brand-gray-text">Manage shift timings, break windows, and thresholds.</p>
                </div>
                <Button icon={Save} onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4 rounded-2xl border border-brand-gray-border bg-white p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 border-b pb-3 font-bold text-brand-dark">
                        <Clock className="text-brand-blue-DEFAULT" size={18} />
                        Shift and Attendance
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-xs font-bold uppercase text-brand-gray-text">Shift Start Time</label>
                            <input
                                type="text"
                                className="w-full rounded-xl border border-brand-gray-border bg-gray-50 px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue-light"
                                value={config.START_TIME}
                                onChange={(e) => setConfig({ ...config, START_TIME: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-bold uppercase text-brand-gray-text">Grace Period (Mins)</label>
                            <input
                                type="number"
                                className="w-full rounded-xl border border-brand-gray-border bg-gray-50 px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue-light"
                                value={config.LATE_GRACE_MINUTES}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        LATE_GRACE_MINUTES: Number.parseInt(e.target.value || '0', 10),
                                    })
                                }
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-bold uppercase text-brand-gray-text">Late Threshold</label>
                            <input
                                type="text"
                                className="w-full rounded-xl border border-brand-gray-border bg-gray-50 px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue-light"
                                value={config.LATE_THRESHOLD}
                                onChange={(e) => setConfig({ ...config, LATE_THRESHOLD: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-bold uppercase text-brand-gray-text">Half Day Threshold</label>
                            <input
                                type="text"
                                className="w-full rounded-xl border border-brand-gray-border bg-gray-50 px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue-light"
                                value={config.HALF_DAY_THRESHOLD}
                                onChange={(e) => setConfig({ ...config, HALF_DAY_THRESHOLD: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-bold uppercase text-brand-gray-text">Shift End Time</label>
                            <input
                                type="text"
                                className="w-full rounded-xl border border-brand-gray-border bg-gray-50 px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue-light"
                                value={config.WORK_END_TIME}
                                onChange={(e) => setConfig({ ...config, WORK_END_TIME: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-bold uppercase text-brand-gray-text">Auto-Absent Time</label>
                            <input
                                type="text"
                                className="w-full rounded-xl border border-brand-gray-border bg-gray-50 px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue-light"
                                value={config.AUTO_ABSENT_TIME}
                                onChange={(e) => setConfig({ ...config, AUTO_ABSENT_TIME: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-brand-gray-border bg-white p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 border-b pb-3 font-bold text-brand-dark">
                        <Coffee className="text-brand-blue-DEFAULT" size={18} />
                        Break and Lunch Windows
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-xs font-bold uppercase text-brand-gray-text">Lunch Start</label>
                                <input
                                    type="text"
                                    className="w-full rounded-xl border border-brand-gray-border bg-gray-50 px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue-light"
                                    value={config.BREAK_WINDOW.START}
                                    onChange={(e) =>
                                        setConfig({
                                            ...config,
                                            BREAK_WINDOW: { ...config.BREAK_WINDOW, START: e.target.value },
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-bold uppercase text-brand-gray-text">Lunch End</label>
                                <input
                                    type="text"
                                    className="w-full rounded-xl border border-brand-gray-border bg-gray-50 px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue-light"
                                    value={config.BREAK_WINDOW.END}
                                    onChange={(e) =>
                                        setConfig({
                                            ...config,
                                            BREAK_WINDOW: { ...config.BREAK_WINDOW, END: e.target.value },
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs text-brand-blue-dark">
                            <AlertCircle size={16} className="shrink-0" />
                            <p>Use 12-hour format (example: 2:30 PM). Changes are applied to the scheduler automatically.</p>
                        </div>
                    </div>
                </div>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default SettingsPage;
