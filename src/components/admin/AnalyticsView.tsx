'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatINR, formatNumber } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  Target,
  Users,
  Car,
  MapPin,
  Flame,
  Award,
  Zap,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'vehicles' | 'drivers' | 'routes'>('vehicles');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getVehicleProfitability().catch(() => []),
      api.getDriverPerformance().catch(() => []),
      api.getRouteAnalysis().catch(() => []),
    ])
      .then(([vData, dData, rData]) => {
        setVehicles(vData);
        setDrivers(dData);
        setRoutes(rData);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Profitability, ROI & Break-Even Analytics</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Deep financial return per vehicle, driver revenue efficiency, and route yield.
          </p>
        </div>

        <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center">
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'vehicles' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Vehicle Profitability & ROI
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'drivers' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Driver Performance
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'routes' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Route Analysis
          </button>
        </div>
      </div>

      {activeTab === 'vehicles' && (
        /* Vehicle Profitability & Break-even Table */
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-xl transition-colors">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold uppercase text-slate-900 dark:text-white">Vehicle Level Yield & Break-Even Target</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Formula: (EMI + Insurance) / Avg Profit Per Trip</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Trips</th>
                  <th className="py-3.5 px-4">Distance</th>
                  <th className="py-3.5 px-4">Revenue</th>
                  <th className="py-3.5 px-4">Oper. Costs</th>
                  <th className="py-3.5 px-4">Oper. Profit</th>
                  <th className="py-3.5 px-4">ROI %</th>
                  <th className="py-3.5 px-4">Rev / km</th>
                  <th className="py-3.5 px-4">Fuel Econ.</th>
                  <th className="py-3.5 px-4">Break-Even Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {vehicles.map((v) => (
                  <tr key={v.vehicle_id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-white">{v.model}</div>
                      <div className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">{v.registration_number}</div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{v.total_trips}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{formatNumber(v.total_distance_km)} km</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{formatINR(v.total_revenue)}</td>
                    <td className="py-3.5 px-4 text-rose-600 dark:text-rose-400 font-semibold">{formatINR(v.operating_expenses)}</td>

                    <td className="py-3.5 px-4">
                      <span className={v.operating_profit >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-rose-600 dark:text-rose-400 font-black'}>
                        {formatINR(v.operating_profit)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-indigo-400">{v.roi_pct}%</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">₹{v.revenue_per_km}/km</td>
                    <td className="py-3.5 px-4 text-amber-600 dark:text-amber-400 font-semibold">{v.fuel_efficiency_km_per_l} km/L</td>

                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-indigo-950/80 border border-blue-200 dark:border-indigo-700/50 text-blue-800 dark:text-indigo-300 font-semibold text-[11px]">
                        {v.break_even_message || `~${v.break_even_trips_month || 15} trips/month`}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'drivers' && (
        /* Driver Performance Table */
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-xl transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Driver</th>
                  <th className="py-3.5 px-4">Compensation Model</th>
                  <th className="py-3.5 px-4">Trips Done</th>
                  <th className="py-3.5 px-4">Distance Driven</th>
                  <th className="py-3.5 px-4">Revenue Generated</th>
                  <th className="py-3.5 px-4">Total Driver Earnings</th>
                  <th className="py-3.5 px-4">Outstanding Advances</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {drivers.map((d) => (
                  <tr key={d.driver_id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-white">{d.name}</div>
                      <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{d.driver_code}</div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-blue-700 dark:text-indigo-300">{d.payment_model}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{d.trips_completed}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{formatNumber(d.distance_travelled_km)} km</td>
                    <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400">{formatINR(d.revenue_generated)}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{formatINR(d.total_earnings)}</td>
                    <td className="py-3.5 px-4 text-amber-600 dark:text-amber-400 font-semibold">{formatINR(d.outstanding_advances)}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'routes' && (
        /* Route Yield Table */
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-xl transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Route</th>
                  <th className="py-3.5 px-4">Distance</th>
                  <th className="py-3.5 px-4">Toll Cost</th>
                  <th className="py-3.5 px-4">Total Trips</th>
                  <th className="py-3.5 px-4">Total Revenue</th>
                  <th className="py-3.5 px-4">Net Profit</th>
                  <th className="py-3.5 px-4">Avg Price</th>
                  <th className="py-3.5 px-4">Profit / km</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {routes.map((r) => (
                  <tr key={r.route_id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                      {r.origin} → {r.destination}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{r.distance_km} km</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">₹{r.toll_estimate}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{r.trip_count}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">{formatINR(r.total_revenue)}</td>
                    <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400">{formatINR(r.profit)}</td>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-semibold">₹{Math.round(r.avg_price)}</td>
                    <td className="py-3.5 px-4 text-blue-600 dark:text-indigo-400 font-bold">₹{r.profit_per_km}/km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
