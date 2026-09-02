'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { Booking, Trip, Vehicle, Driver } from '@/types';
import { formatINR, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/common/StatusBadge';
import { toast } from 'sonner';
import {
  Inbox,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Car,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Ban,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Layers,
  Phone,
  User,
  Zap,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';

export const UnassignedQueueView: React.FC = () => {
  const { refreshKey, openAssignTrip, openQuickTrip, triggerRefresh } = useApp();

  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [unassignedTrips, setUnassignedTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'BOOKINGS' | 'TRIPS'>('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const topRef = useRef<HTMLDivElement>(null);

  // Assign Modal states
  const [assigningItem, setAssigningItem] = useState<{ type: 'BOOKING' | 'TRIP'; data: any } | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [agreedPrice, setAgreedPrice] = useState<number>(2500);
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getUnassignedQueue().catch(() => ({ pending_bookings: [], unassigned_trips: [] })),
      api.getVehicles({ status: 'AVAILABLE' }).catch(() => []),
      api.getDrivers({ status: 'AVAILABLE' }).catch(() => []),
    ])
      .then(([queueRes, vList, dList]) => {
        setPendingBookings(queueRes.pending_bookings || []);
        setUnassignedTrips(queueRes.unassigned_trips || []);
        setVehicles(vList);
        setDrivers(dList);
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleOpenAssignModal = (item: { type: 'BOOKING' | 'TRIP'; data: any }) => {
    setAssigningItem(item);
    setSelectedVehicleId('');
    setSelectedDriverId('');
    setAgreedPrice(item.data.estimated_price || item.data.trip_price || 2500);
  };

  const handleConfirmAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningItem || !selectedVehicleId || !selectedDriverId) {
      return toast.error('Please select both a vehicle and a driver partner.');
    }

    setAssignSubmitting(true);
    try {
      if (assigningItem.type === 'BOOKING') {
        await api.assignBooking(assigningItem.data.id, {
          vehicle_id: selectedVehicleId,
          driver_id: selectedDriverId,
          trip_price: Number(agreedPrice),
        });
        toast.success(`Booking ${assigningItem.data.booking_code} assigned! Driver partner and vehicle dispatched.`);
      } else {
        await api.assignTrip(assigningItem.data.id, {
          vehicle_id: selectedVehicleId,
          driver_id: selectedDriverId,
          driver_payment_amount: 800,
        });
        toast.success(`Trip ${assigningItem.data.trip_code} successfully assigned!`);
      }

      setAssigningItem(null);
      triggerRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to assign trip');
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleRejectBooking = async (b: Booking) => {
    const reason = prompt(
      `Decline / Reject Booking ${b.booking_code} (Do Not Assign)?\nEnter reason:`,
      'No operational vehicles or licensed driver partners available in corridor'
    );
    if (reason === null) return;

    try {
      await api.rejectBooking(b.id, reason);
      toast.success(`Booking ${b.booking_code} rejected and marked as Do Not Assign.`);
      triggerRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to reject booking');
    }
  };

  const handleQuickAutoAssign = async (bkg: Booking) => {
    try {
      const validVehicles = vehicles.filter((v) => v.status !== 'MAINTENANCE');
      const validDrivers = drivers.filter((d) => !d.is_license_expired);

      if (validVehicles.length === 0 || validDrivers.length === 0) {
        return toast.error('No operational vehicles or licensed driver partners available for auto-dispatch.');
      }

      const chosenVeh = validVehicles.find((v) => v.vehicle_type === bkg.vehicle_type) || validVehicles[0];
      const chosenDrv = validDrivers[0];

      await api.assignBooking(bkg.id, {
        vehicle_id: chosenVeh.id,
        driver_id: chosenDrv.id,
        trip_price: bkg.estimated_price || 2500,
      });

      toast.success(`Booking ${bkg.booking_code} auto-assigned to ${chosenDrv.name} (${chosenVeh.registration_number})!`);
      triggerRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to auto-assign booking');
    }
  };

  // Merge and filter queue items
  const unifiedItems: Array<{ id: string; type: 'BOOKING' | 'TRIP'; data: any }> = [];

  if (filterType === 'ALL' || filterType === 'BOOKINGS') {
    pendingBookings.forEach((b) => unifiedItems.push({ id: b.id, type: 'BOOKING', data: b }));
  }
  if (filterType === 'ALL' || filterType === 'TRIPS') {
    unassignedTrips.forEach((t) => unifiedItems.push({ id: t.id, type: 'TRIP', data: t }));
  }

  const filteredItems = unifiedItems.filter(({ data }) => {
    const q = searchTerm.toLowerCase();
    const code = (data.booking_code || data.trip_code || '').toLowerCase();
    const pickup = (data.pickup_location || '').toLowerCase();
    const drop = (data.drop_location || '').toLowerCase();
    const guest = (data.guest_name || data.customer?.name || '').toLowerCase();
    return code.includes(q) || pickup.includes(q) || drop.includes(q) || guest.includes(q);
  });

  // Pagination calculation
  const totalItems = filteredItems.length;
  const effectivePageSize = pageSize === 0 ? totalItems || 1 : pageSize;
  const totalPages = Math.ceil(totalItems / effectivePageSize) || 1;
  const startIndex = (currentPage - 1) * effectivePageSize;
  const paginatedItems = pageSize === 0 ? filteredItems : filteredItems.slice(startIndex, startIndex + effectivePageSize);

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={topRef} className="space-y-6 relative">
      {/* Header Banner - Dual Theme for Light & Dark Modes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Inbox className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Trips to be Assigned Queue
            </h1>
            <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-black">
              {pendingBookings.length + unassignedTrips.length} Pending Dispatch
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl">
            Incoming customer reservations and unassigned trips requiring vehicle and driver partner allocation. Select a trip to choose options or decline.
          </p>
        </div>

        <button
          onClick={openQuickTrip}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <span>+ Create Manual Trip</span>
        </button>
      </div>

      {/* Sticky Filter & Search Bar - Always Available When Scrolling */}
      <div className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md py-3 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => { setFilterType('ALL'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all shrink-0 ${
              filterType === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Pending ({pendingBookings.length + unassignedTrips.length})
          </button>
          <button
            onClick={() => { setFilterType('BOOKINGS'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all shrink-0 ${
              filterType === 'BOOKINGS'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Customer Bookings ({pendingBookings.length})
          </button>
          <button
            onClick={() => { setFilterType('TRIPS'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all shrink-0 ${
              filterType === 'TRIPS'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Scheduled Trips ({unassignedTrips.length})
          </button>
        </div>

        {/* Search & Page Size */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search code, guest, route..."
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm w-full md:w-64"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[11px] font-medium hidden sm:inline">Cards:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-transparent font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="10">10</option>
              <option value="16">16</option>
              <option value="30">30</option>
              <option value="0">All</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Unassigned List - Cards with Full Light/Dark Dual Theme */}
      <div>
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-xs bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            Scanning dispatch queue...
          </div>
        ) : totalItems === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">All Clear! Zero Unassigned Trips</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Every customer booking and scheduled trip currently has a verified driver partner and vehicle assigned.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedItems.map(({ type, data }) => {
              const isBooking = type === 'BOOKING';
              const code = isBooking ? data.booking_code : data.trip_code;
              const price = isBooking ? data.estimated_price : data.trip_price;
              const dateVal = isBooking ? data.pickup_date : data.scheduled_date;
              const timeVal = isBooking ? data.pickup_time : data.scheduled_time;
              const guestVal = data.guest_name || data.customer?.name || 'Guest Passenger';
              const phoneVal = data.guest_phone || data.customer?.phone || '-';

              return (
                <div
                  key={data.id}
                  className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm dark:shadow-xl hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Row: Code & Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">{code}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${
                            isBooking
                              ? 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                          }`}
                        >
                          {isBooking ? 'Customer Request' : 'Unassigned Trip'}
                        </span>
                      </div>
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatINR(price)}</span>
                    </div>

                    {/* Route Block */}
                    <div className="space-y-2 bg-slate-50 dark:bg-slate-900/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{data.pickup_location}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{data.drop_location}</span>
                      </div>
                    </div>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <div>Passenger: <strong className="text-slate-900 dark:text-white">{guestVal}</strong></div>
                      <div>Phone: <strong className="text-slate-700 dark:text-slate-300">{phoneVal}</strong></div>
                      <div>Date: <strong className="text-slate-700 dark:text-slate-300">{formatDate(dateVal)}</strong></div>
                      <div>Time: <strong className="text-blue-600 dark:text-blue-400">{timeVal || '09:00 AM'}</strong></div>
                      {isBooking && (
                        <>
                          <div>Requested: <strong className="text-amber-700 dark:text-amber-300">{data.vehicle_type}</strong></div>
                          <div>Pax Count: <strong className="text-slate-700 dark:text-slate-300">{data.passenger_count || 1} Seat(s)</strong></div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Multiple Card Actions - Selectable Options */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2">
                    {/* Option 1: Assign & Select Specific Fleet */}
                    <button
                      type="button"
                      onClick={() => handleOpenAssignModal({ type, data })}
                      className="flex-1 min-w-[150px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Assign Driver Partner & Vehicle</span>
                    </button>

                    {/* Option 2: Quick Auto-Dispatch (Bookings only) */}
                    {isBooking && (
                      <button
                        type="button"
                        onClick={() => handleQuickAutoAssign(data)}
                        title="Auto-match first available vehicle and driver"
                        className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Auto</span>
                      </button>
                    )}

                    {/* Option 3: Reject / Do Not Assign (Bookings only) */}
                    {isBooking && (
                      <button
                        type="button"
                        onClick={() => handleRejectBooking(data)}
                        title="Decline / Reject Booking"
                        className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Footer Controls */}
      {pageSize > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
          <div>
            Showing <strong className="text-slate-900 dark:text-white">{startIndex + 1}</strong> to{' '}
            <strong className="text-slate-900 dark:text-white">
              {Math.min(startIndex + effectivePageSize, totalItems)}
            </strong>{' '}
            of <strong className="text-slate-900 dark:text-white">{totalItems}</strong> unassigned requests
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              title="First Page"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              title="Previous Page"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-bold text-slate-900 dark:text-white">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              title="Next Page"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              title="Last Page"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Scroll to Top Button */}
      <button
        type="button"
        onClick={scrollToTop}
        title="Scroll to Top of Queue"
        className="fixed bottom-6 right-6 p-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-2xl z-30 flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 hover:shadow-blue-600/50"
      >
        <ArrowUp className="w-4 h-4" />
        <span className="hidden sm:inline">Back to Top</span>
      </button>

      {/* Selection Modal: Choose Driver Partner & Vehicle */}
      {assigningItem && (
        <Modal
          isOpen={!!assigningItem}
          onClose={() => setAssigningItem(null)}
          title={`Dispatch Fleet for ${assigningItem.data.booking_code || assigningItem.data.trip_code}`}
          subtitle={`Route: ${assigningItem.data.pickup_location} → ${assigningItem.data.drop_location}`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmAssignment} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Available Vehicle *
              </label>
              <select
                required
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              >
                <option value="">-- Choose Fleet Vehicle --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registration_number} ({v.model} - {v.vehicle_type}) [{v.status}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Available Driver Partner *
              </label>
              <select
                required
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              >
                <option value="">-- Choose Driver Partner --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.phone}) [{d.status}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Trip Agreed Fare (₹) *
              </label>
              <input
                type="number"
                required
                value={agreedPrice}
                onChange={(e) => setAgreedPrice(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-[11px] text-blue-800 dark:text-blue-300">
              ⚡ Allocating will convert this unassigned request into an active dispatch trip and notify the driver partner.
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAssigningItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={assignSubmitting}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all"
              >
                {assignSubmitting ? 'Dispatching...' : 'Confirm Assignment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
