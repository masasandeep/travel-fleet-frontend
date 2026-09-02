'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useApp();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative inline-flex items-center gap-2 p-2 rounded-xl border transition-all duration-200 active:scale-95 ${
        isDark
          ? 'bg-slate-900/90 border-slate-700/80 text-amber-400 hover:bg-slate-800 hover:border-amber-400/50 hover:text-amber-300'
          : 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-100 hover:border-indigo-400/50 shadow-sm'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}

      {showLabel && (
        <span className="text-xs font-semibold select-none text-slate-700 dark:text-slate-200">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};
