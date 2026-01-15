import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Select = ({
    value,
    onChange,
    options = [],
    placeholder = 'Select an option',
    label,
    error,
    disabled = false,
    name,
    searchable = true
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const searchInputRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                const portalDropdown = document.getElementById('select-dropdown-portal');
                if (portalDropdown && portalDropdown.contains(event.target)) {
                    return;
                }
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const dropdownHeight = 280;

            if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
                setDropdownPosition({
                    top: rect.top - dropdownHeight - 8,
                    left: rect.left,
                    width: rect.width
                });
            } else {
                setDropdownPosition({
                    top: rect.bottom + 8,
                    left: rect.left,
                    width: rect.width
                });
            }

            if (searchable && searchInputRef.current) {
                setTimeout(() => searchInputRef.current?.focus(), 100);
            }
        }
    }, [isOpen, searchable]);

    const selectedOption = options.find(opt =>
        typeof opt === 'object' ? String(opt.value) === String(value) : String(opt) === String(value)
    );

    const getDisplayValue = () => {
        if (!selectedOption) return placeholder;
        return typeof selectedOption === 'object' ? selectedOption.label : selectedOption;
    };

    const filteredOptions = options.filter(option => {
        if (!searchTerm) return true;
        const label = typeof option === 'object' ? option.label : option;
        return String(label).toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleSelect = (option) => {
        const newValue = typeof option === 'object' ? option.value : option;
        onChange({
            target: {
                name: name,
                value: newValue
            }
        });
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            if (isOpen) setSearchTerm('');
        }
    };

    return (
        <div ref={containerRef} className="relative">
            {label && <label className="label">{label}</label>}

            <button
                ref={inputRef}
                type="button"
                onClick={handleToggle}
                disabled={disabled}
                className={`
                    w-full px-4 py-3 rounded-xl text-left
                    flex items-center justify-between gap-2
                    transition-all duration-200
                    bg-[var(--surface-tertiary)] border
                    ${error ? 'border-error-500/50' : 'border-[var(--border-primary)]'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[var(--text-muted)]'}
                    ${isOpen ? 'border-primary-500 ring-2 ring-primary-500/20' : ''}
                `}
            >
                <span className={selectedOption ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>
                    {getDisplayValue()}
                </span>
                <svg
                    className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && createPortal(
                <div
                    id="select-dropdown-portal"
                    className="select-dropdown-portal fixed rounded-xl shadow-2xl overflow-hidden z-[9999] animate-scale-in"
                    style={{
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        width: dropdownPosition.width,
                        minWidth: '200px'
                    }}
                >
                    {/* Search Input */}
                    {searchable && (
                        <div className="p-3 border-b border-[var(--border-primary)]">
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full pl-9 pr-3 py-2 bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-primary-500"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                    )}

                    {/* Options List */}
                    <div className="max-h-52 overflow-y-auto scrollbar-thin">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-3 text-[var(--text-muted)] text-sm text-center">
                                No options found
                            </div>
                        ) : (
                            filteredOptions.map((option, index) => {
                                const optionValue = typeof option === 'object' ? option.value : option;
                                const optionLabel = typeof option === 'object' ? option.label : option;
                                const isSelected = String(optionValue) === String(value);

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className={`
                                            w-full px-4 py-3 text-left transition-colors text-sm
                                            flex items-center justify-between
                                            ${isSelected
                                                ? 'bg-primary-500/15 text-primary-500'
                                                : 'text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)]'
                                            }
                                        `}
                                    >
                                        <span>{optionLabel}</span>
                                        {isSelected && (
                                            <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>,
                document.body
            )}

            {error && <p className="text-error-400 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default Select;
