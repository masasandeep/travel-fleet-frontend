'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Compass,
  PlusCircle,
  Bell,
  Car,
  Smartphone,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Role } from '@/types';
import { cn } from '@/lib/utils';

export const TopNav: React.FC = () => {
  const { portal, setPortal, openQuickTrip, refreshKey, triggerRefresh } = useApp();
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    api.getAlerts()
      .then((alerts) => {
        setAlertCount(alerts.length);
      })
      .catch(() => setAlertCount(3)); // fallback mock
  }, [refreshKey]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-lg shadow-indigo-500/20">
            <img src="/logo.png" alt="LA Travels Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col justify-center leading-none">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">
                LA <span className="text-blue-400 font-black">Travels</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                ERP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide mt-1 hidden sm:block">
              Better journeys begin here
            </p>
          </div>
        </div>

        {/* Portal Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl shadow-inner">
          <button
            onClick={() => setPortal('ADMIN')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
              portal === 'ADMIN'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            )}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Admin ERP</span>
          </button>

          <button
            onClick={() => setPortal('DRIVER')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
              portal === 'DRIVER'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            )}
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Driver Portal</span>
          </button>

          <button
            onClick={() => setPortal('CUSTOMER')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
              portal === 'CUSTOMER'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            )}
          >
            <Car className="w-4 h-4" />
            <span className="hidden sm:inline">Book Vehicle</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={triggerRefresh}
            title="Refresh Data"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Alerts Counter */}
          <div className="relative">
            <div className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors cursor-pointer">
              <Bell className="w-4 h-4" />
            </div>
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white border-2 border-slate-950 animate-pulse">
                {alertCount}
              </span>
            )}
          </div>

          {/* Prominent + Quick Trip Button */}
          {portal === 'ADMIN' && (
            <button
              onClick={openQuickTrip}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all duration-150 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Quick Trip</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
