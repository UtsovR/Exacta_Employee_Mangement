import clsx from 'clsx';

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtext }) => {
    const colorStyles = {
        blue: 'bg-blue-50 text-brand-blue-DEFAULT',
        yellow: 'bg-yellow-50 text-brand-yellow-dark',
        red: 'bg-red-50 text-red-600',
        green: 'bg-green-50 text-green-600',
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-gray-border flex items-center hover:shadow-md transition-shadow">
            <div className={clsx('p-4 rounded-full mr-5', colorStyles[color])}>
                <Icon size={28} />
            </div>
            <div>
                <p className="text-sm font-medium text-brand-gray-text uppercase tracking-wide">{title}</p>
                <h3 className="text-2xl font-bold text-brand-dark mt-1">{value}</h3>
                {subtext && <p className="text-xs text-brand-gray-text mt-1">{subtext}</p>}
            </div>
        </div>
    );
};

export default StatCard;
