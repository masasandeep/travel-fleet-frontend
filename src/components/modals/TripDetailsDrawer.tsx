'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatINR, formatDate, formatDateTime } from '@/lib/utils';
import { X, MapPin, Calendar, Clock, Car, User, Fuel, DollarSign, TrendingUp, ShieldCheck } from 'lucide-react';

export const TripDetailsDrawer: React.FC = () => {
  const { isTripDrawerOpen, closeTripDrawer, selectedTripForDrawer } = useApp();

  if (!isTripDrawerOpen || !selectedTripForDrawer) return null;

  const t = selectedTripForDrawer;
  const financials = t.financials;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={closeTripDrawer}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl p-6 overflow-y-auto z-10 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">{t.trip_code}</h2>
                <StatusBadge status={t.status} />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Source: <span className="font-semibold text-slate-300">{t.trip_source}</span> | Created:{' '}
                {formatDate(t.created_at)}
              </p>
            </div>
            <button
              onClick={closeTripDrawer}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Route & Schedule Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold uppercase text-slate-400">Route & Passenger</div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-400">Pickup Location</div>
                  <div className="text-xs font-semibold text-white">{t.pickup_location}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-400">Drop Location</div>
                  <div className="text-xs font-semibold text-white">{t.drop_location}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{formatDate(t.scheduled_date)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.scheduled_time}</span>
              </div>
            </div>
          </div>

          {/* Customer, Fleet & Driver Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-1">
                <User className="w-3.5 h-3.5" /> Customer
              </div>
              <div className="font-semibold text-white truncate">
                {t.customer?.name || t.guest_name || 'Guest'}
              </div>
              <div className="text-[11px] text-slate-400">{t.customer?.phone || t.guest_phone || '-'}</div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-1">
                <Car className="w-3.5 h-3.5" /> Vehicle
              </div>
              <div className="font-semibold text-white truncate">{t.vehicle?.model || '-'}</div>
              <div className="text-[11px] text-indigo-400">{t.vehicle?.registration_number || '-'}</div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Driver
              </div>
              <div className="font-semibold text-white truncate">{t.driver?.name || '-'}</div>
              <div className="text-[11px] text-slate-400">{t.driver?.driver_code || '-'}</div>
            </div>
          </div>

          {/* Odometer & Distance */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-bold uppercase text-slate-400">Odometer & Distance (Rule 23)</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Start Odo</div>
                <div className="text-xs font-bold text-white">{t.start_odometer ? `${t.start_odometer} km` : '-'}</div>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">End Odo</div>
                <div className="text-xs font-bold text-white">{t.end_odometer ? `${t.end_odometer} km` : '-'}</div>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-emerald-400 uppercase font-bold">Total Run</div>
                <div className="text-xs font-bold text-emerald-400">{t.distance_km ? `${t.distance_km} km` : '-'}</div>
              </div>
            </div>
          </div>

          {/* Profitability & Financial Statement */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Trip Financials (Rule 30)</span>
              </div>
              <div className="text-sm font-extrabold text-emerald-400">
                Operating Profit: {formatINR(financials?.operating_profit || 0)}
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300 font-semibold py-1 border-b border-slate-800">
                <span>Trip Gross Revenue</span>
                <span className="text-white font-bold">{formatINR(t.trip_price)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>- Fuel Expense</span>
                <span>{formatINR(financials?.fuel_expense || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>- Toll Plaza Charges</span>
                <span>{formatINR(financials?.toll_expense || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>- Parking Fee</span>
                <span>{formatINR(financials?.parking_expense || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>- Driver Trip Settlement</span>
                <span>{formatINR(financials?.driver_expense || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>- Other Expenses</span>
                <span>{formatINR(financials?.other_expenses || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-300 font-bold pt-2 border-t border-slate-800">
                <span>Total Operating Expenses</span>
                <span className="text-rose-400">{formatINR(financials?.total_expenses || 0)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-extrabold text-sm pt-1">
                <span>Net Margin (%)</span>
                <span>{financials?.profit_margin_pct || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={closeTripDrawer}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
