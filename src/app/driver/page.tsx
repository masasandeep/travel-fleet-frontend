'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DriverPortalView } from '@/components/driver/DriverPortalView';
import { StartTripModal } from '@/components/modals/StartTripModal';
import { CompleteTripModal } from '@/components/modals/CompleteTripModal';
import {
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Compass,
  LogOut,
  User,
  KeyRound,
  ArrowLeft,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { Driver } from '@/types';
import { toast } from 'sonner';

export default function DriverPage() {
  const { currentDriver, currentUser, loginAsDriver, driverLogout, openEditProfile } = useApp();
  const [driversList, setDriversList] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [pin, setPin] = useState('password123');
  const [loading, setLoading] = useState(false);

  // Fetch registered drivers for login options
  useEffect(() => {
    api.getDrivers()
      .then((dList) => {
        if (dList && dList.length > 0) {
          setDriversList(dList);
          setSelectedDriverId(dList[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleLoginSubmit = (e?: React.FormEvent, driverOverride?: Driver) => {
    if (e) e.preventDefault();
    const target = driverOverride || driversList.find((d) => d.id === selectedDriverId) || driversList[0];

    if (!target) {
      toast.error('Please select a registered driver partner');
      return;
    }

    loginAsDriver(target);
    toast.success(`Welcome Driver Partner ${target.name}! Mobile Cockpit active.`);
  };

  const handleLogout = () => {
    driverLogout();
    toast.success('Driver Partner logged out of Cockpit');
  };

  // If driver is not logged in, render dedicated Driver Partner Sign In screen
  if (!currentDriver) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-sm">
              <img src="/logo.png" alt="LA Travels Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col justify-center leading-none">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                LA <span className="text-blue-600 dark:text-blue-400 font-black">Travels</span> Driver Partner
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-0.5">Better journeys begin here</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Link
              href="/"
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
          </div>
        </header>

        {/* Driver Partner Sign In Body */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-xl transition-colors">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto shadow-inner">
                <Smartphone className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">Driver Partner Cockpit Sign In</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authenticate to access assigned trips, telemetry logging, and fuel claims.
              </p>
            </div>

            {/* Quick 1-Click Driver Profiles */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select Registered Driver Partner
              </label>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {driversList.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleLoginSubmit(undefined, d)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-950 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white transition-all group hover:border-blue-300 dark:hover:border-blue-700"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                        {d.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {d.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {d.driver_code} • {d.payment_model} • {d.phone}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-bold">
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual PIN Sign In */}
            <form onSubmit={(e) => handleLoginSubmit(e)} className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Driver Partner PIN / Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all"
              >
                Sign In to Selected Driver Profile
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // Render Logged In Driver Mobile Portal
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white transition-colors">
      {/* Mobile Driver Partner App Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={openEditProfile}
            title="Click to view & edit driver profile"
            className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity group"
          >
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-sm">
              <img src="/logo.png" alt="LA Travels Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate max-w-[120px] sm:max-w-none group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {currentDriver.name}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {currentDriver.driver_code}
                </span>
              </div>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">● Active Shift ⚙ Profile</p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Driver Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              title="Log Out of Driver Cockpit"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Driver Partner View */}
      <main className="flex-1 p-4 overflow-y-auto">
        <DriverPortalView />
      </main>

      {/* Driver Operational Modals */}
      <StartTripModal />
      <CompleteTripModal />
    </div>
  );
}
