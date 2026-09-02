'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string | undefined | null;
  className?: string;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, showDot = true }) => {
  if (!status) return null;

  const s = status.toUpperCase();

  let colorClasses = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  let dotColor = 'bg-slate-400';
  let pulse = false;

  if (s === 'COMPLETED' || s === 'AVAILABLE' || s === 'APPROVED' || s === 'ACTIVE' || s === 'PAID' || s === 'SETTLED') {
    colorClasses = 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60';
    dotColor = 'bg-emerald-500';
  } else if (s === 'STARTED' || s === 'ON_TRIP' || s === 'IN_PROGRESS') {
    colorClasses = 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700/60 shadow-sm';
    dotColor = 'bg-blue-500';
    pulse = true;
  } else if (s === 'SCHEDULED' || s === 'DRIVER_ASSIGNED' || s === 'DRIVER_ACCEPTED' || s === 'CONFIRMED' || s === 'BOOKED') {
    colorClasses = 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700/60';
    dotColor = 'bg-indigo-500';
  } else if (s === 'PENDING' || s === 'UNASSIGNED' || s === 'PARTIAL' || s === 'WAITING_ASSIGNMENT') {
    colorClasses = 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60';
    dotColor = 'bg-amber-500';
    pulse = true;
  } else if (s === 'CANCELLED' || s === 'MAINTENANCE' || s === 'UNAVAILABLE' || s === 'EXPIRED' || s === 'REJECTED' || s === 'DEFAULTED' || s === 'INACTIVE') {
    colorClasses = 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700/60';
    dotColor = 'bg-rose-500';
  }

  const label = s.replace(/_/g, ' ');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide transition-colors',
        colorClasses,
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            dotColor,
            pulse && 'animate-ping'
          )}
        />
      )}
      <span>{label}</span>
    </span>
  );
};
