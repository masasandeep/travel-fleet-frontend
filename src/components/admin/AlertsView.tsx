'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { Alert, AlertSeverity } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { AlertTriangle, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';

export const AlertsView: React.FC = () => {
  const { refreshKey, triggerRefresh } = useApp();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getAlerts()
      .then(setAlerts)
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleResolve = async (id: string) => {
    try {
      await api.resolveAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      toast.success('Alert resolved and dismissed');
      triggerRefresh();
    } catch (e: any) {
      toast.error('Failed to resolve alert');
    }
  };

  const filtered = severityFilter ? alerts.filter((a) => a.severity === severityFilter) : alerts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">System Alert & Compliance Center</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time proactive scanners for upcoming loan EMIs, expired driver licenses, and vehicle service targets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 shadow-sm"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical (Blocking)</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs bg-slate-950 rounded-2xl border border-slate-800">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
            <span>All systems healthy! Zero pending warnings or compliance alerts.</span>
          </div>
        ) : (
          filtered.map((alert) => (
            <div
              key={alert.id}
              className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 shadow-sm dark:shadow-lg hover:border-blue-400 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-rose-600 dark:text-rose-400 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{alert.title}</h3>
                    <StatusBadge status={alert.severity} />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{alert.message}</p>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Category: <span className="font-semibold text-slate-700 dark:text-slate-300">{alert.alert_type}</span> • Detected:{' '}
                    {formatDate(alert.created_at)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleResolve(alert.id)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-slate-900 dark:hover:bg-emerald-950/70 text-slate-700 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300 text-xs font-semibold border border-slate-200 hover:border-emerald-300 dark:border-slate-800 dark:hover:border-emerald-700 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Resolved</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
