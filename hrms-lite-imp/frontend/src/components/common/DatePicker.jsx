import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const DatePicker = ({ value, onChange, max, min, label, placeholder = 'Select date' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if click is on the container
            if (containerRef.current && containerRef.current.contains(event.target)) {
                return;
            }
            // Check if click is on the portal calendar
            const portalCalendar = document.getElementById('datepicker-calendar-portal');
            if (portalCalendar && portalCalendar.contains(event.target)) {
                return;
            }
            setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            const calendarHeight = 400;
            const calendarWidth = 288;
            const margin = 8;

            const spaceBelow = window.innerHeight - rect.bottom - margin;
            const spaceAbove = rect.top - margin;

            let top, left;

            if (spaceBelow < calendarHeight && spaceAbove > calendarHeight) {
                top = rect.top - calendarHeight - margin;
            } else if (spaceBelow < calendarHeight) {
                top = Math.max(margin, window.innerHeight - calendarHeight - margin);
            } else {
                top = rect.bottom + margin;
            }

            left = rect.left;
            if (left + calendarWidth > window.innerWidth - margin) {
                left = window.innerWidth - calendarWidth - margin;
            }
            left = Math.max(margin, left);

            setDropdownPosition({ top, left });
        }
    }, [isOpen]);

    const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        return days;
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const isDateDisabled = (day) => {
        if (!day) return true;
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateStr = formatDate(date);
        if (max && dateStr > max) return true;
        if (min && dateStr < min) return true;
        return false;
    };

    const isToday = (day) => {
        if (!day) return false;
        const today = new Date();
        return (
            today.getDate() === day &&
            today.getMonth() === currentMonth.getMonth() &&
            today.getFullYear() === currentMonth.getFullYear()
        );
    };

    const isSelected = (day) => {
        if (!day || !value) return false;
        const selectedDate = new Date(value);
        return (
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === currentMonth.getMonth() &&
            selectedDate.getFullYear() === currentMonth.getFullYear()
        );
    };

    const handleDateClick = (day) => {
        if (!day || isDateDisabled(day)) return;
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        onChange(formatDate(date));
        setIsOpen(false);
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const clearDate = (e) => {
        e.stopPropagation();
        onChange('');
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className="relative">
            {label && <label className="label">{label}</label>}

            <div
                ref={inputRef}
                onClick={() => setIsOpen(!isOpen)}
                className="input flex items-center justify-between cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className={value ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>
                        {value ? formatDisplayDate(value) : placeholder}
                    </span>
                </div>
                {value && (
                    <button
                        onClick={clearDate}
                        className="p-1 hover:bg-[var(--interactive-hover)] rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {isOpen && createPortal(
                <div
                    id="datepicker-calendar-portal"
                    className="datepicker-dropdown fixed w-72 rounded-xl shadow-2xl p-4 z-[9999] animate-scale-in"
                    style={{
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        maxWidth: 'calc(100vw - 32px)'
                    }}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={prevMonth}
                            className="p-2 hover:bg-[var(--interactive-hover)] rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="font-medium text-[var(--text-primary)]">
                            {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </span>
                        <button
                            onClick={nextMonth}
                            className="p-2 hover:bg-[var(--interactive-hover)] rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Days of week */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {daysOfWeek.map((day) => (
                            <div key={day} className="text-center text-xs font-medium text-[var(--text-muted)] py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 gap-1">
                        {getDaysInMonth(currentMonth).map((day, index) => (
                            <button
                                key={index}
                                onClick={() => handleDateClick(day)}
                                disabled={isDateDisabled(day)}
                                className={`
                  w-9 h-9 rounded-lg text-sm font-medium transition-all
                  ${!day ? 'invisible' : ''}
                  ${isDateDisabled(day) ? 'text-[var(--text-muted)] opacity-40 cursor-not-allowed' : 'hover:bg-[var(--interactive-hover)] cursor-pointer'}
                  ${isSelected(day) ? 'bg-primary-600 text-white hover:bg-primary-500' : ''}
                  ${isToday(day) && !isSelected(day) ? 'border border-primary-500 text-primary-500' : 'text-[var(--text-secondary)]'}
                `}
                            >
                                {day}
                            </button>
                        ))}
                    </div>

                    {/* Quick actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--border-primary)]">
                        <button
                            onClick={() => handleDateClick(new Date().getDate())}
                            className="flex-1 py-2 text-sm font-medium text-primary-500 hover:bg-primary-500/10 rounded-lg transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={clearDate}
                            className="flex-1 py-2 text-sm font-medium text-[var(--text-tertiary)] hover:bg-[var(--interactive-hover)] rounded-lg transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default DatePicker;
