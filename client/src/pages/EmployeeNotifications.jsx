import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, Clock, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import clsx from 'clsx';
import { apiRequest } from '@/lib/api';

const EmployeeNotifications = () => {
    const { token } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiRequest('/api/notifications', { token });
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAllAsRead = async () => {
        try {
            await apiRequest('/api/notifications/read', {
                method: 'PUT',
                token,
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle className="text-green-500" size={20} />;
            case 'ALERT': return <AlertTriangle className="text-red-500" size={20} />;
            case 'LEAVE': return <Clock className="text-blue-500" size={20} />;
            default: return <Info className="text-brand-blue-DEFAULT" size={20} />;
        }
    };

    if (loading) return (
        <div className="max-w-3xl mx-auto space-y-4 animate-pulse pt-8">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-gray-100 rounded-2xl border border-gray-200"></div>
            ))}
        </div>
    );

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="max-w-3xl mx-auto space-y-6 pt-8 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 text-brand-blue-DEFAULT rounded-xl flex items-center justify-center">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-brand-dark">Notifications</h1>
                        <p className="text-brand-gray-text text-sm">
                            {unreadCount > 0 ? `You have ${unreadCount} unread messages` : 'Up to date'}
                        </p>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <Button variant="secondary" size="sm" icon={Check} onClick={markAllAsRead}>
                        Mark all as read
                    </Button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="bg-white p-20 rounded-2xl border border-brand-gray-border text-center">
                    <div className="w-16 h-16 bg-gray-50 flex items-center justify-center rounded-full mx-auto mb-4 text-brand-gray-text">
                        <Bell size={32} />
                    </div>
                    <h3 className="text-brand-dark font-bold mb-1">No notifications</h3>
                    <p className="text-brand-gray-text text-sm">System updates and leave alerts will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((n) => (
                        <div
                            key={n.id}
                            className={clsx(
                                "p-5 rounded-2xl border transition-all flex items-start gap-4",
                                n.isRead ? "bg-white border-brand-gray-border opacity-75" : "bg-blue-50/30 border-brand-blue-light shadow-sm"
                            )}
                        >
                            <div className="mt-1">{getIcon(n.type)}</div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-brand-dark">{n.title}</h4>
                                    <span className="text-xs text-brand-gray-text">
                                        {new Date(n.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-brand-gray-text text-sm leading-relaxed">{n.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EmployeeNotifications;
