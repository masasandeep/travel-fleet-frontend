'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { Trip, TripStatus } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatINR, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Play,
  CheckCircle2,
  XCircle,
  Copy,
  PlusCircle,
  Search,
  Filter,
  Eye,
  UserCheck,
  FileSpreadsheet,
  Repeat,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Layers,
} from 'lucide-react';

export const TripsView: React.FC = () => {
  const {
    refreshKey,
    triggerRefresh,
    openTripDrawer,
    openStartTrip,
    openCompleteTrip,
    openDuplicateTrip,
    openQuickTrip,
    openAssignTrip,
    setAdminTab,
  } = useApp();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    const params: any = {};
    if (statusFilter) params.status = statusFilter;
    if (sourceFilter) params.source = sourceFilter;
    if (searchQuery) params.search = searchQuery;
    if (dateFilter) params.date = dateFilter;

    api.getTrips(params)
      .then(setTrips)
      .catch((e) => {
        toast.error('Failed to load trips');
        setTrips([]);
      })
      .finally(() => setLoading(false));
  }, [refreshKey, statusFilter, sourceFilter, searchQuery, dateFilter]);

  const handleCancelTrip = async (trip: Trip) => {
    const reason = prompt(`Cancel trip ${trip.trip_code}? Enter cancellation reason:`);
    if (!reason) return;

    try {
      await api.cancelTrip(trip.id, reason);
      toast.success(`Trip ${trip.trip_code} marked as CANCELLED`);
      triggerRefresh();
    } catch (e: any) {
      toast.error('Failed to cancel trip');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Trips Operations Command</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time itinerary tracking, driver odometer checks, live tolls and fare settlements.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAdminTab('bulk-import')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-white border border-slate-200 dark:border-transparent transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={() => setAdminTab('recurring')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-white border border-slate-200 dark:border-transparent transition-colors"
          >
            <Repeat className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>+ Recurring</span>
          </button>
          <button
            onClick={openQuickTrip}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Quick Trip</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 shadow-sm transition-colors">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code, guest name, location..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="STARTED">On Trip (Started)</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        {/* Source Filter */}
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Sources</option>
          <option value="ADMIN_QUICK_TRIP">Admin Quick Trip</option>
          <option value="CUSTOMER_BOOKING">Customer Booking</option>
          <option value="RECURRING_TRIP">Recurring Template</option>
          <option value="BULK_IMPORT">Bulk Import</option>
        </select>

        {/* Date Filter */}
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
        />

        {(statusFilter || sourceFilter || searchQuery || dateFilter) && (
          <button
            onClick={() => {
              setStatusFilter('');
              setSourceFilter('');
              setSearchQuery('');
              setDateFilter('');
            }}
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline px-2"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Trips Table */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl transition-colors max-h-[600px] overflow-auto relative">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
            <tr className="text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-3 px-4">Trip Code</th>
              <th className="py-3 px-4">Customer / Guest</th>
              <th className="py-3 px-4">Route</th>
              <th className="py-3 px-4">Schedule</th>
              <th className="py-3 px-4">Vehicle & Driver</th>
              <th className="py-3 px-4">Fare (₹)</th>
              <th className="py-3 px-4">Profit</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  Loading trips...
                </td>
              </tr>
            ) : trips.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  No trips match the current filter criteria. Click <strong>+ Quick Trip</strong> to create one.
                </td>
              </tr>
            ) : (
              (pageSize === 0 ? trips : trips.slice((currentPage - 1) * pageSize, currentPage * pageSize)).map((trip) => {
                const fin = trip.financials;
                return (
                  <tr key={trip.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-white">{trip.trip_code}</div>
                      <span className="text-[10px] text-slate-500 uppercase">{trip.trip_source}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {trip.customer?.name || trip.guest_name || 'Guest'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {trip.customer?.phone || trip.guest_phone || '-'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900 dark:text-slate-200">{trip.pickup_location}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">→ {trip.drop_location}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900 dark:text-slate-200">{formatDate(trip.scheduled_date)}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{trip.scheduled_time}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {trip.vehicle ? (
                        <div className="font-semibold text-slate-900 dark:text-white">{trip.vehicle.registration_number}</div>
                      ) : (
                        <span className="text-amber-500 dark:text-amber-400 text-[11px] font-semibold">Unassigned</span>
                      )}
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {trip.driver ? trip.driver.name : 'No Driver Partner'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {formatINR(trip.trip_price)}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {fin ? formatINR(fin.net_margin) : '-'}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={trip.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Drawer Details */}
                        <button
                          onClick={() => openTripDrawer(trip)}
                          title="View Ledger & Logs"
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Assign if Unassigned */}
                        {trip.status === 'UNASSIGNED' && (
                          <button
                            onClick={() => openAssignTrip(trip)}
                            title="Assign Vehicle & Driver"
                            className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/80 rounded-lg border border-amber-200 dark:border-amber-800/40 transition-colors"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}

                        {/* Start Trip */}
                        {(trip.status === 'SCHEDULED' || trip.status === 'DRIVER_ASSIGNED') && (
                          <button
                            onClick={() => openStartTrip(trip)}
                            title="Start Trip"
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/80 rounded-lg border border-blue-200 dark:border-blue-800/40 transition-colors"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}

                        {/* Complete Trip */}
                        {trip.status === 'STARTED' && (
                          <button
                            onClick={() => openCompleteTrip(trip)}
                            title="Complete & Settle Trip"
                            className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/80 rounded-lg border border-emerald-200 dark:border-emerald-800/40 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Duplicate Trip */}
                        <button
                          onClick={() => openDuplicateTrip(trip)}
                          title="Duplicate Trip"
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/80 rounded-lg border border-blue-200 dark:border-blue-800/40 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Cancel Trip */}
                        {(trip.status === 'SCHEDULED' || trip.status === 'STARTED') && (
                          <button
                            onClick={() => handleCancelTrip(trip)}
                            title="Cancel Trip"
                            className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/80 rounded-lg border border-rose-200 dark:border-rose-800/40 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
        <div>
          Showing <strong className="text-slate-900 dark:text-white">{trips.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
          <strong className="text-slate-900 dark:text-white">
            {pageSize === 0 ? trips.length : Math.min(currentPage * pageSize, trips.length)}
          </strong>{' '}
          of <strong className="text-slate-900 dark:text-white">{trips.length}</strong> trips
        </div>

        {pageSize > 0 && Math.ceil(trips.length / pageSize) > 1 && (
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-bold text-slate-900 dark:text-white">
              Page {currentPage} of {Math.ceil(trips.length / pageSize)}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(Math.ceil(trips.length / pageSize), p + 1))}
              disabled={currentPage === Math.ceil(trips.length / pageSize)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(Math.ceil(trips.length / pageSize))}
              disabled={currentPage === Math.ceil(trips.length / pageSize)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Floating Scroll to Top */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Scroll to Top"
        className="fixed bottom-6 right-6 p-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-2xl z-30 flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 hover:shadow-blue-600/50"
      >
        <ArrowUp className="w-4 h-4" />
        <span className="hidden sm:inline">Back to Top</span>
      </button>
    </div>
  );
};
