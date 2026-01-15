const Pagination = ({ page, totalPages, onPageChange, total, limit, showInfo = true }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const showEllipsis = totalPages > 7;

        if (!showEllipsis) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            if (page > 3) {
                pages.push('...');
            }

            for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
                if (!pages.includes(i)) {
                    pages.push(i);
                }
            }

            if (page < totalPages - 2) {
                pages.push('...');
            }

            if (!pages.includes(totalPages)) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            {showInfo && (
                <p className="text-sm text-dark-400">
                    Showing <span className="font-medium text-dark-200">{startItem}</span> to{' '}
                    <span className="font-medium text-dark-200">{endItem}</span> of{' '}
                    <span className="font-medium text-dark-200">{total}</span> results
                </p>
            )}

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="p-2 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {getPageNumbers().map((pageNum, index) => (
                    pageNum === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-dark-400">...</span>
                    ) : (
                        <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            className={`
                w-10 h-10 rounded-lg text-sm font-medium transition-all
                ${page === pageNum
                                    ? 'bg-primary-600 text-white'
                                    : 'text-dark-300 hover:bg-dark-700 hover:text-dark-100'}
              `}
                        >
                            {pageNum}
                        </button>
                    )
                ))}

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Pagination;
