'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorScheme?: 'emerald' | 'blue' | 'indigo' | 'amber' | 'rose' | 'slate';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'indigo',
  className,
}) => {
  const colorMap = {
    emerald: 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-500/5 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/40 text-blue-600 dark:text-blue-400',
    indigo: 'bg-indigo-500/5 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400',
    amber: 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400',
    slate: 'bg-slate-500/5 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/50 text-slate-600 dark:text-slate-400',
  };

  const iconBgMap = {
    emerald: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/50',
    blue: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700/50',
    indigo: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700/50',
    amber: 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700/50',
    rose: 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-700/50',
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  return (
    <div
      className={cn(
        'p-5 rounded-2xl bg-white dark:bg-slate-950 border shadow-sm dark:shadow-xl transition-all duration-200 hover:shadow-md dark:hover:border-slate-700',
        colorMap[colorScheme],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</span>
        <div className={cn('p-2.5 rounded-xl border', iconBgMap[colorScheme])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">{value}</div>
        {(subtitle || trend) && (
          <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            {subtitle && <span>{subtitle}</span>}
            {trend && (
              <span className={cn('font-bold', trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
