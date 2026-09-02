'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value: string; // ISO date format 'YYYY-MM-DD'
  onChange: (date: string) => void;
  minDate?: string; // Optional minimum selectable date 'YYYY-MM-DD'
  label?: string;
  hideLabel?: boolean;
  className?: string;
  triggerClassName?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate = new Date().toISOString().split('T')[0],
  label = 'Travel Date',
  hideLabel = false,
  className,
  triggerClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Parse initial selected date
  const parsedValue = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(parsedValue.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedValue.getMonth());
  const [tempSelectedDate, setTempSelectedDate] = useState(value);

  useEffect(() => {
    if (value) {
      setTempSelectedDate(value);
      const d = new Date(value + 'T00:00:00');
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Fixed 6-week (42 cells) grid computation for 100% constant height across all months
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

interface CalendarCell {
  day: number;
  isCurrentMonth: boolean;
  isNextMonth: boolean;
  isPrevMonth: boolean;
  iso: string;
}

// Generate exact 42 cells (6 rows * 7 columns)
  const calendarCells: CalendarCell[] = [];

  // 1. Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    calendarCells.push({
      day,
      isCurrentMonth: false,
      isNextMonth: false,
      isPrevMonth: true,
      iso: `${viewMonth === 0 ? viewYear - 1 : viewYear}-${String(viewMonth === 0 ? 12 : viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    });
  }

  // 2. Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      isNextMonth: false,
      isPrevMonth: false,
      iso: `${viewYear}-${mm}-${dd}`,
    });
  }

  // 3. Next month leading days to complete exactly 42 cells (6 rows * 7 columns)
  const remainingCells = 42 - calendarCells.length;
  for (let n = 1; n <= remainingCells; n++) {
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
    const nextM = viewMonth === 11 ? '01' : String(viewMonth + 2).padStart(2, '0');
    const nextD = String(n).padStart(2, '0');
    calendarCells.push({
      day: n,
      isCurrentMonth: false,
      isNextMonth: true,
      isPrevMonth: false,
      iso: `${nextY}-${nextM}-${nextD}`,
    });
  }

  const handleCellClick = (cell: CalendarCell) => {
    const isPast = minDate ? cell.iso < minDate : false;
    if (isPast) return;

    setTempSelectedDate(cell.iso);
    onChange(cell.iso);
    setIsOpen(false);
  };

  const formatDisplay = (iso: string) => {
    if (!iso) return 'Select date';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className={className}>
      {!hideLabel && label && (
        <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
          <CalendarIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>{label}</span>
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl px-3.5 py-3 text-xs text-left font-bold text-slate-900 dark:text-white flex items-center justify-between transition-all focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm',
          isOpen && 'border-blue-500 ring-2 ring-blue-500/20',
          triggerClassName
        )}
      >
        <span className="truncate">{formatDisplay(value)}</span>
        <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 ml-2" />
      </button>

      {/* Floating Centered Calendar Dialog with FIXED, STABLE height (42-cell layout) */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-slate-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>Select Travel Date</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Selected: <strong className="text-emerald-600 dark:text-emerald-400">{formatDisplay(tempSelectedDate)}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Month & Year Navigation */}
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-950 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-sm font-black text-slate-900 dark:text-white">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>

              <button
                type="button"
                onClick={nextMonth}
                className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-extrabold text-indigo-600 dark:text-indigo-300 uppercase py-1">
              {DAYS_OF_WEEK.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Fixed 6-Row (42 cells) Grid: Dimensions & Height NEVER change across any month */}
            <div className="grid grid-cols-7 gap-1 text-center h-[216px]">
              {calendarCells.map((cell, idx) => {
                const isSelected = cell.iso === tempSelectedDate;
                const isPast = minDate ? cell.iso < minDate : false;

                return (
                  <button
                    key={`${cell.iso}-${idx}`}
                    type="button"
                    disabled={isPast || !cell.isCurrentMonth}
                    onClick={() => handleCellClick(cell)}
                    className={cn(
                      'h-8 w-full rounded-xl text-xs font-bold transition-all flex items-center justify-center',
                      isSelected && cell.isCurrentMonth
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/40 ring-2 ring-emerald-300 scale-105'
                        : !cell.isCurrentMonth
                        ? 'text-slate-300 dark:text-slate-700 opacity-20 cursor-default'
                        : isPast
                        ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-30'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange(tempSelectedDate);
                  setIsOpen(false);
                }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Date</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
