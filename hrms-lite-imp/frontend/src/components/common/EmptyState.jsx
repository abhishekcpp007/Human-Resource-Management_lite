const EmptyState = ({
    icon,
    title,
    description,
    action,
    actionLabel,
    onAction
}) => {
    return (
        <div className="empty-state">
            {icon && (
                <div className="w-16 h-16 rounded-2xl bg-dark-800/50 border border-dark-700/50 flex items-center justify-center mb-4 text-dark-500">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-medium text-dark-200 mb-2">{title}</h3>
            {description && (
                <p className="text-dark-400 text-sm max-w-sm mb-6">{description}</p>
            )}
            {action && (
                <div>{action}</div>
            )}
            {actionLabel && onAction && (
                <button onClick={onAction} className="btn btn-primary">
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
