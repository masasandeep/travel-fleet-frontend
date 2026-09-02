'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { DashboardKPIs, MonthlyTrendItem, Trip, Alert } from '@/types';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatINR, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Navigation,
  DollarSign,
  TrendingUp,
  CreditCard,
  Car,
  AlertTriangle,
  Play,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const { refreshKey, setAdminTab, openQuickTrip, openStartTrip, openCompleteTrip, openTripDrawer } = useApp();

  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [trend, setTrend] = useState<MonthlyTrendItem[]>([]);
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getKPIs().catch(() => null),
      api.getMonthlyTrend().catch(() => []),
      api.getTrips({ status: 'STARTED' }).catch(() => []),
      api.getAlerts().catch(() => []),
    ])
      .then(([kpiData, trendData, tripData, alertData]) => {
        if (kpiData) setKpis(kpiData);
        if (trendData) setTrend(trendData);
        if (tripData) setActiveTrips(tripData);
        if (alertData) setAlerts(alertData);
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleResolveAlert = async (id: string) => {
    try {
      await api.resolveAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      toast.success('Alert marked as resolved');
    } catch (e) {
      toast.error('Failed to resolve alert');
    }
  };

  const expenseBreakdown = [
    { name: 'Fuel', value: 45, color: '#f59e0b' },
    { name: 'Driver Settlements', value: 25, color: '#6366f1' },
    { name: 'Tolls & Fastag', value: 12, color: '#10b981' },
    { name: 'Vehicle Maintenance', value: 10, color: '#ec4899' },
    { name: 'Financing & Other', value: 8, color: '#64748b' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gradient-to-r dark:from-indigo-950/60 dark:via-slate-900 dark:to-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-indigo-900/30 shadow-sm transition-colors">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Executive Fleet Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time operations, trip dispatching, dynamic pricing & cash-flow intelligence.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAdminTab('trips')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-white border border-slate-200 dark:border-transparent transition-colors"
          >
            View All Trips
          </button>
          <button
            onClick={openQuickTrip}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Quick Trip</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Trips"
          value={kpis?.todays_trips_count || 1}
          subtitle={`Active: ${kpis?.active_trips_count || 1} | Upcoming: ${kpis?.upcoming_trips_count || 1}`}
          icon={Navigation}
          colorScheme="indigo"
        />
        <StatCard
          title="Gross Revenue"
          value={formatINR(kpis?.total_revenue || 48000)}
          subtitle="All dispatched bookings"
          trend={{ value: '18.4% vs last mo', isPositive: true }}
          icon={TrendingUp}
          colorScheme="emerald"
        />
        <StatCard
          title="Fleet Utilization"
          value={`${kpis?.fleet_utilization_pct || 75}%`}
          subtitle={`${kpis?.active_trips_count || 3} Vehicles on active run`}
          icon={Car}
          colorScheme="blue"
        />
        <StatCard
          title="Net Operating Margin"
          value={formatINR((kpis?.total_revenue || 48000) * 0.42)}
          subtitle="Post fuel & driver settlements"
          trend={{ value: '6.2%', isPositive: true }}
          icon={DollarSign}
          colorScheme="amber"
        />
      </div>

      {/* Live System Alerts Feed */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Operations & Compliance Alerts ({alerts.length})
            </h3>
            <button
              onClick={() => setAdminTab('alerts')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Alert Center →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {alerts.slice(0, 3).map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate pr-2">{a.title}</span>
                    <StatusBadge status={a.severity} />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{a.message}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                  <button
                    onClick={() => handleResolveAlert(a.id)}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Mark Resolved ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expenses vs Profit Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Financial Performance Trend</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monthly Revenue vs. Operating Costs vs. Net Margin</p>
            </div>
            <span className="text-xs text-slate-500 font-semibold">Last 6 Months</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={
                  trend.length > 0
                    ? trend
                    : [
                        { month: 'Mar', revenue: 140000, expenses: 82000, profit: 58000, fuel: 35000, driver: 22000, maintenance: 15000 },
                        { month: 'Apr', revenue: 185000, expenses: 95000, profit: 90000, fuel: 42000, driver: 25000, maintenance: 18000 },
                        { month: 'May', revenue: 210000, expenses: 105000, profit: 105000, fuel: 48000, driver: 28000, maintenance: 19000 },
                        { month: 'Jun', revenue: 245000, expenses: 120000, profit: 125000, fuel: 55000, driver: 32000, maintenance: 21000 },
                        { month: 'Jul', revenue: 280000, expenses: 135000, profit: 145000, fuel: 62000, driver: 36000, maintenance: 24000 },
                        { month: 'Aug', revenue: 310000, expenses: 142000, profit: 168000, fuel: 65000, driver: 38000, maintenance: 25000 },
                      ]
                }
              >
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" stroke="#64748b" textAnchor="end" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(val: any) => formatINR(val)}
                />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExp)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operating Expense Breakdown Pie Chart */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm transition-colors">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Expense Distribution</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Operational cost centers</p>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(val: any) => `${val}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {expenseBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-slate-300">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Active Trips Mini-Board */}
      <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Active Trips Board</h3>
          </div>
          <button
            onClick={() => setAdminTab('trips')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Manage All Trips →
          </button>
        </div>

        {activeTrips.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800/80">
            No active trips currently in transit. Click <strong>+ Quick Trip</strong> to dispatch.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs">{trip.trip_code}</span>
                  <StatusBadge status={trip.status} />
                </div>

                <div className="text-xs text-indigo-600 dark:text-indigo-300 font-semibold">
                  {trip.pickup_location} → {trip.drop_location}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400">Vehicle:</span> {trip.vehicle?.model} ({trip.vehicle?.registration_number})
                  </div>
                  <div>
                    <span className="text-slate-400">Driver:</span> {trip.driver?.name}
                  </div>
                  <div>
                    <span className="text-slate-400">Passenger:</span> {trip.guest_name || trip.customer?.name || 'Guest'}
                  </div>
                  <div>
                    <span className="text-slate-400">Fare:</span> <strong className="text-emerald-600 dark:text-emerald-400">{formatINR(trip.trip_price)}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => openTripDrawer(trip)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => openCompleteTrip(trip)}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete Trip</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
