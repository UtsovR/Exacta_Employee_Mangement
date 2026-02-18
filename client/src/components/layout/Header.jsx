import { useState, useEffect } from 'react';
import { Clock, RotateCcw } from 'lucide-react';

const Header = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleRefresh = () => {
        window.location.reload();
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata' // IST Timezone
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Kolkata'
        });
    };

    return (
        <header className="h-16 bg-white border-b border-brand-gray-border flex items-center justify-end px-8 sticky top-0 z-40">
            <div className="flex items-center space-x-6">
                <div className="flex items-center text-right">
                    <div className="mr-3">
                        <p className="text-sm font-bold text-brand-dark tabular-nums">{formatTime(time)}</p>
                        <p className="text-xs text-brand-gray-text">{formatDate(time)}</p>
                    </div>
                    <div className="p-2 bg-brand-blue-highlight rounded-full text-brand-blue-dark">
                        <Clock size={18} />
                    </div>
                </div>

                <div className="h-8 w-px bg-brand-gray-border mx-2"></div>

                <button
                    onClick={handleRefresh}
                    className="p-2 hover:bg-brand-gray-light rounded-full text-brand-gray-text hover:text-brand-blue-DEFAULT transition-all active:rotate-180 duration-500"
                    title="Refresh Dashboard"
                >
                    <RotateCcw size={20} />
                </button>
            </div>
        </header>
    );
};

export default Header;
