const LoadingSpinner = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4 border',
        md: 'w-8 h-8 border-2',
        lg: 'w-12 h-12 border-2',
    };

    return (
        <div className={`${sizeClasses[size]} border-dark-600 border-t-primary-500 rounded-full animate-spin ${className}`} />
    );
};

const LoadingState = ({ message = 'Loading...' }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-dark-400 text-sm">{message}</p>
        </div>
    );
};

export { LoadingSpinner, LoadingState };
