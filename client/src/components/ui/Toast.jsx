import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import clsx from 'clsx';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={clsx(
            "fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border transition-all duration-300 transform",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            type === 'success' ? "bg-white border-green-100 text-brand-dark" : "bg-white border-red-100 text-brand-dark"
        )}>
            <div className={clsx(
                "p-2 rounded-full",
                type === 'success' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
            )}>
                {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            </div>
            <div className="flex-1 mr-4">
                <p className="text-sm font-semibold">{type === 'success' ? 'Success' : 'Error'}</p>
                <p className="text-xs text-brand-gray-text">{message}</p>
            </div>
            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                className="text-brand-gray-text hover:text-brand-dark transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;
