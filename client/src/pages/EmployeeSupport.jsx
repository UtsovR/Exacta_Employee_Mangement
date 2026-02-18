import { useState, useEffect, useCallback } from 'react';
import { HelpCircle, Send, Clock, CheckCircle, MessageSquare, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';

const EmployeeSupport = () => {
    const { token } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ subject: '', message: '', priority: 'NORMAL' });
    const [toast, setToast] = useState(null);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiRequest('/api/support/my-tickets', { token });
            setTickets(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        try {
            const newTicket = await apiRequest('/api/support', {
                method: 'POST',
                token,
                body: formData,
            });
            setTickets([newTicket, ...tickets]);
            setFormData({ subject: '', message: '', priority: 'NORMAL' });
            setToast({ message: 'Support ticket submitted successfully!', type: 'success' });
        } catch (error) {
            setToast({ message: error.message, type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-8 pb-20 pt-8">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-brand-blue-DEFAULT">
                    <HelpCircle size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-brand-dark">Help and Support</h1>
                    <p className="text-sm text-brand-gray-text">
                        Need assistance? Submit a ticket or contact HR at extension 101.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <div className="sticky top-8 rounded-2xl border border-brand-gray-border bg-white p-6 shadow-sm">
                        <h3 className="mb-4 border-b pb-4 font-bold text-brand-dark">Submit a Ticket</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-bold uppercase text-brand-gray-text">Subject</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full rounded-xl border border-brand-gray-border bg-gray-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-blue-light"
                                    placeholder="e.g., Login issues, Break timer bug"
                                    value={formData.subject}
                                    onChange={(event) => setFormData({ ...formData, subject: event.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-bold uppercase text-brand-gray-text">Priority</label>
                                <select
                                    className="w-full rounded-xl border border-brand-gray-border bg-gray-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-blue-light"
                                    value={formData.priority}
                                    onChange={(event) => setFormData({ ...formData, priority: event.target.value })}
                                >
                                    <option value="LOW">Low</option>
                                    <option value="NORMAL">Normal</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-bold uppercase text-brand-gray-text">Message</label>
                                <textarea
                                    required
                                    rows="4"
                                    className="w-full resize-none rounded-xl border border-brand-gray-border bg-gray-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-blue-light"
                                    placeholder="Describe your issue in detail..."
                                    value={formData.message}
                                    onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full shadow-lg"
                                icon={submitting ? null : Send}
                                disabled={submitting}
                            >
                                {submitting ? 'Submitting...' : 'Send Ticket'}
                            </Button>
                        </form>
                    </div>
                </div>

                <div className="space-y-4 lg:col-span-2">
                    <h3 className="mb-2 flex items-center gap-2 font-bold text-brand-dark">
                        <Clock size={20} className="text-brand-blue-DEFAULT" />
                        My Tickets
                    </h3>

                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            {[1, 2, 3].map((item) => (
                                <div key={item} className="h-24 rounded-2xl border border-gray-200 bg-gray-100" />
                            ))}
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-brand-gray-border bg-white p-12 text-center">
                            <MessageSquare className="mx-auto mb-2 text-brand-gray-text/30" size={40} />
                            <p className="text-brand-gray-text">You haven&apos;t submitted any tickets yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="flex flex-col gap-3 rounded-2xl border border-brand-gray-border bg-white p-5 shadow-sm transition-all hover:border-brand-blue-light"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-bold text-brand-dark">{ticket.subject}</h4>
                                            <div className="mt-1 flex items-center gap-2">
                                                <span
                                                    className={clsx(
                                                        'rounded px-2 py-0.5 text-[10px] font-bold uppercase',
                                                        ticket.priority === 'HIGH'
                                                            ? 'bg-red-100 text-red-600'
                                                            : ticket.priority === 'NORMAL'
                                                                ? 'bg-blue-100 text-blue-600'
                                                                : 'bg-gray-100 text-gray-600'
                                                    )}
                                                >
                                                    {ticket.priority}
                                                </span>
                                                <span className="text-xs text-brand-gray-text">
                                                    Applied on {new Date(ticket.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            className={clsx(
                                                'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold',
                                                ticket.status === 'OPEN'
                                                    ? 'border border-yellow-100 bg-yellow-50 text-yellow-600'
                                                    : ticket.status === 'IN_PROGRESS'
                                                        ? 'border border-blue-100 bg-blue-50 text-blue-600'
                                                        : 'border border-green-100 bg-green-50 text-green-600'
                                            )}
                                        >
                                            {ticket.status === 'CLOSED' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                            {ticket.status}
                                        </div>
                                    </div>
                                    <p className="line-clamp-2 text-sm text-brand-gray-text">{ticket.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default EmployeeSupport;
