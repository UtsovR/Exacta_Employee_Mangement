import clsx from 'clsx';
import { Circle, UserCheck, Coffee, Utensils, AlertCircle } from 'lucide-react';

const TimelineItem = ({ log, isLast }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'LOGIN': return UserCheck;
            case 'BREAK': return Coffee;
            case 'LUNCH': return Utensils;
            case 'BREAK_END':
            case 'LUNCH_END': return Circle; // Or a checkmark
            default: return Circle;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'LOGIN': return 'text-green-500 bg-green-50 border-green-200';
            case 'BREAK': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
            case 'LUNCH': return 'text-blue-500 bg-blue-50 border-blue-200';
            default: return 'text-gray-400 bg-gray-50 border-gray-200';
        }
    };

    const Icon = getIcon(log.type);

    // Format time
    const time = new Date(log.time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="relative pl-8 pb-8 last:pb-0">
            {/* Line */}
            {!isLast && (
                <div className="absolute left-[15px] top-8 bottom-0 w-px bg-gray-200" />
            )}

            {/* Icon Bubble */}
            <div className={clsx(
                "absolute left-0 top-0 w-8 h-8 rounded-full border flex items-center justify-center z-10",
                getColor(log.type)
            )}>
                <Icon size={14} />
            </div>

            {/* Content */}
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-sm font-semibold text-brand-dark">{log.title}</h4>
                    <p className="text-xs text-brand-gray-text mt-0.5">{log.subtitle}</p>
                </div>
                <span className="text-xs font-medium text-brand-gray-text bg-gray-50 px-2 py-1 rounded">
                    {time}
                </span>
            </div>
        </div>
    );
};

const ActivityTimeline = ({ logs = [] }) => {
    if (!logs || logs.length === 0) {
        return (
            <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="text-gray-400" size={24} />
                </div>
                <p className="text-sm text-brand-gray-text font-medium">No activity recorded today.</p>
            </div>
        );
    }

    return (
            <div className="bg-white rounded-xl border border-brand-gray-border p-6 shadow-sm h-full">
                <h3 className="font-bold text-lg text-brand-dark mb-6 flex items-center gap-2">
                    Today&apos;s Timeline
                </h3>
            <div className="relative">
                {logs.map((log, index) => (
                    <TimelineItem
                        key={log.id || index}
                        log={log}
                        isLast={index === logs.length - 1}
                    />
                ))}
            </div>
        </div>
    );
};

export default ActivityTimeline;
