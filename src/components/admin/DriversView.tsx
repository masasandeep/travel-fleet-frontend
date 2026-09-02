'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { Driver } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatINR, formatDate } from '@/lib/utils';
import { PlusCircle, HandCoins, ShieldAlert, Phone, Award } from 'lucide-react';

export const DriversView: React.FC = () => {
  const { refreshKey, openAddDriver, openDriverAdvance } = useApp();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getDrivers()
      .then(setDrivers)
      .catch(() => setDrivers([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Driver Operations & Settlements</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Driver partner profiles, license compliance, advances tracking, and multi-model payouts.
          </p>
        </div>

        <button
          onClick={openAddDriver}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Register Driver</span>
        </button>
      </div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-500 text-xs">Loading drivers...</div>
        ) : (
          drivers.map((d) => (
            <div
              key={d.id}
              className={`bg-white dark:bg-slate-950 rounded-2xl border ${
                d.is_license_expired ? 'border-rose-300 dark:border-rose-900/60' : 'border-slate-200 dark:border-slate-800'
              } p-5 shadow-sm dark:shadow-xl hover:border-blue-400 dark:hover:border-slate-700 flex flex-col justify-between space-y-4 transition-all`}
            >
              <div className="space-y-3">
                {/* Header Profile */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 dark:text-white">{d.name}</h3>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-blue-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-700">
                        {d.driver_code}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{d.phone}</span>
                    </div>
                  </div>
                  <StatusBadge status={d.status} />
                </div>

                {/* License Details & Expiry Warning */}
                <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>License No:</span>
                    <span className="font-mono text-slate-900 dark:text-white font-semibold">{d.license_number}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">License Expiry:</span>
                    <span
                      className={`font-semibold ${
                        d.is_license_expired ? 'text-rose-600 dark:text-rose-400 flex items-center gap-1' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {d.is_license_expired && <ShieldAlert className="w-3.5 h-3.5" />}
                      {formatDate(d.license_expiry)} {d.is_license_expired && '(EXPIRED)'}
                    </span>
                  </div>
                </div>

                {/* Compensation Model & Outstanding Advance */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Payout Model</span>
                    <div className="font-bold text-blue-700 dark:text-indigo-300 mt-0.5">{d.payment_model}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Active Advance</span>
                    <div className="font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                      {formatINR(d.outstanding_advance || 0)}
                    </div>
                  </div>
                </div>

                {d.notes && <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">&ldquo;{d.notes}&rdquo;</p>}
              </div>

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Trips Done: <strong className="text-slate-900 dark:text-white">{d.total_trips_completed || 0}</strong>
                </span>

                <button
                  onClick={() => openDriverAdvance(d)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/70 dark:hover:bg-amber-900/80 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-700/50 transition-colors"
                >
                  <HandCoins className="w-3.5 h-3.5" />
                  <span>Issue Advance</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
