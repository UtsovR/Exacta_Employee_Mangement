import clsx from 'clsx';
import { HelpCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtext, progress, tooltip }) => {
    const colorStyles = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        red: 'bg-red-50 text-red-600',
        gray: 'bg-gray-50 text-gray-600',
    };

    return (
        <div className="bg-white rounded-xl border border-brand-gray-border p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm font-medium text-brand-gray-text flex items-center gap-1">
                        {title}
                        {tooltip && (
                            <div className="group/tooltip relative">
                                <HelpCircle size={14} className="cursor-help opacity-50 hover:opacity-100" />
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 bg-brand-dark text-white text-xs p-2 rounded shadow-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-10">
                                    {tooltip}
                                </div>
                            </div>
                        )}
                    </h3>
                    <div className="text-2xl font-bold text-brand-dark mt-1">{value}</div>
                </div>
                <div className={clsx('p-3 rounded-lg', colorStyles[color])}>
                    <Icon size={24} strokeWidth={1.5} />
                </div>
            </div>

            {(progress !== undefined) && (
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div
                        className={clsx("h-full rounded-full transition-all duration-500",
                            progress > 100 ? 'bg-red-500' :
                                progress > 80 ? 'bg-yellow-500' : 'bg-blue-500'
                        )}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
            )}

            {subtext && (
                <p className="text-xs text-brand-gray-text font-medium">{subtext}</p>
            )}
        </div>
    );
};

export default StatCard;
