import clsx from 'clsx';

const Badge = ({ children, variant = 'neutral', className }) => {
    const variants = {
        working: 'bg-blue-100 text-brand-blue-dark border-brand-blue-light',
        break: 'bg-yellow-100 text-brand-yellow-dark border-brand-yellow-DEFAULT',
        overdue: 'bg-red-100 text-red-700 border-red-200',
        neutral: 'bg-gray-100 text-gray-600 border-gray-200',
        success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };

    return (
        <span
            className={clsx(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
};

export default Badge;
