import { useState } from 'react';
import clsx from 'clsx';
import { Calendar, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';

const LeaveApplicationModal = ({ isOpen, onClose, onSuccess }) => {
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        type: 'full_day',
        reason: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            await apiRequest('/api/leaves', {
                method: 'POST',
                token,
                body: formData,
            });
            onSuccess();
            onClose();
        } catch (requestError) {
            console.error('Error applying for leave:', requestError);
            setError(requestError.message || 'Failed to apply for leave. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md animate-in zoom-in rounded-2xl border border-brand-gray-border bg-white p-8 shadow-2xl duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 rounded-full p-2 text-brand-gray-text transition-colors hover:bg-gray-100 hover:text-brand-dark"
                >
                    <X size={20} />
                </button>

                <div className="mb-6">
                    <h2 className="flex items-center gap-2 text-2xl font-bold text-brand-dark">
                        <Calendar className="text-brand-blue-DEFAULT" />
                        Apply for Leave
                    </h2>
                    <p className="text-sm text-brand-gray-text">Submit your leave request for approval.</p>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-100 bg-red-50 p-3 text-sm italic text-red-600">
                        Warning: {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-brand-dark">Leave Date</label>
                        <input
                            type="date"
                            required
                            className="w-full rounded-lg border border-brand-gray-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
                            value={formData.date}
                            onChange={(event) => setFormData({ ...formData, date: event.target.value })}
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-brand-dark">Leave Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'full_day' })}
                                className={clsx(
                                    'rounded-lg border px-4 py-2 text-sm font-medium transition-all',
                                    formData.type === 'full_day'
                                        ? 'border-brand-blue-DEFAULT bg-brand-blue-highlight text-brand-blue-dark'
                                        : 'border-brand-gray-border text-brand-gray-text hover:bg-gray-50'
                                )}
                            >
                                Full Day
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'half_day' })}
                                className={clsx(
                                    'rounded-lg border px-4 py-2 text-sm font-medium transition-all',
                                    formData.type === 'half_day'
                                        ? 'border-brand-blue-DEFAULT bg-brand-blue-highlight text-brand-blue-dark'
                                        : 'border-brand-gray-border text-brand-gray-text hover:bg-gray-50'
                                )}
                            >
                                Half Day
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-brand-dark">Reason</label>
                        <textarea
                            required
                            rows={3}
                            placeholder="Briefly explain the reason for leave..."
                            className="w-full rounded-lg border border-brand-gray-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
                            value={formData.reason}
                            onChange={(event) => setFormData({ ...formData, reason: event.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button type="submit" className="flex-1 justify-center" isLoading={loading}>
                            Submit Request
                        </Button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-brand-gray-border px-4 py-2.5 text-sm font-semibold text-brand-gray-text transition-colors hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LeaveApplicationModal;
