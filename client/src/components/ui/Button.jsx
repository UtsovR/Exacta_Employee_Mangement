import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className,
    isLoading,
    disabled,
    icon: Icon,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm';

    const variants = {
        primary: 'bg-brand-blue-DEFAULT text-white hover:bg-brand-blue-dark active:bg-brand-blue-dark',
        secondary: 'bg-white text-brand-dark border border-brand-gray-border hover:bg-brand-gray-light hover:text-brand-blue-DEFAULT',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        ghost: 'bg-transparent text-brand-gray-text hover:bg-brand-gray-light hover:text-brand-dark shadow-none',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            className={clsx(baseStyles, variants[variant], sizes[size], className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {!isLoading && Icon && <Icon className="w-4 h-4 mr-2" />}
            {children}
        </button>
    );
};

export default Button;
