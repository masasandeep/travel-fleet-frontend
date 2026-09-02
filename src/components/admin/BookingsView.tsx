'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { Booking, Vehicle, Driver } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatINR, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  CalendarCheck,
  Car,
  ShieldCheck,
  User,
  Phone,
  CheckCircle,
  Search,
  Filter,
  Ban,
  XCircle,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Layers,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';

export const BookingsView: React.FC = () => {
  const { refreshKey, triggerRefresh } = useApp();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination states to prevent huge scrolling of 81+ items
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const topRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Assign Modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [assignVehicleId, setAssignVehicleId] = useState('');
  const [assignDriverId, setAssignDriverId] = useState('');
  const [assignPrice, setAssignPrice] = useState(0);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getBookings(),
      api.getVehicles({ status: 'AVAILABLE' }),
      api.getDrivers({ status: 'AVAILABLE' }),
    ])
      .then(([b, v, d]) => {
        setBookings(b);
        setVehicles(v);
        setDrivers(d);
      })
      .catch((err) => {
        toast.error('Failed to load bookings or available fleet');
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleOpenAssign = (booking: Booking) => {
    setSelectedBooking(booking);
    setAssignPrice(booking.estimated_price || 2500);
    setAssignVehicleId('');
    setAssignDriverId('');
  };

  const handleConfirmAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !assignVehicleId || !assignDriverId) {
      toast.error('Please select both vehicle and driver partner');
      return;
    }

    setAssigning(true);
    try {
      await api.assignBooking(selectedBooking.id, {
        vehicle_id: assignVehicleId,
        driver_id: assignDriverId,
        trip_price: Number(assignPrice),
      });

      toast.success(`Booking ${selectedBooking.booking_code} assigned! Confirmed trip dispatched.`);
      setSelectedBooking(null);
      triggerRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to assign trip');
    } finally {
      setAssigning(false);
    }
  };

  const handleRejectBooking = async (b: Booking) => {
    const reason = prompt(
      `Decline / Reject Booking ${b.booking_code} (Do not assign)?\nEnter reason:`,
      'No operational vehicles or driver partners available in this corridor'
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

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.booking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.pickup_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.drop_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.customer?.name && b.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.guest_name && b.guest_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || b.booking_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination calculation
  const totalItems = filteredBookings.length;
  const effectivePageSize = pageSize === 0 ? totalItems || 1 : pageSize;
  const totalPages = Math.ceil(totalItems / effectivePageSize) || 1;
  const startIndex = (currentPage - 1) * effectivePageSize;
  const paginatedBookings = pageSize === 0 ? filteredBookings : filteredBookings.slice(startIndex, startIndex + effectivePageSize);

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div ref={topRef} className="space-y-4 relative">
      {/* Sticky Header with Search, Filter & Quick Jump Controls */}
      <div className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md py-3 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">Customer Booking Queue</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold">
              {totalItems} Requests
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Paginated queue with instant search, dispatch, and decline options.
          </p>
        </div>

        {/* Filter & Page Size Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search code, guest, route..."
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 shadow-sm"
          >
            <option value="ALL">All Statuses ({bookings.length})</option>
            <option value="WAITING_ASSIGNMENT">Waiting Assignment</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected (Do Not Assign)</option>
          </select>

          {/* Page Size Selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[11px] font-medium hidden sm:inline">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-transparent font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="0">All</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table with Scrollable Container & Sticky Columns Header */}
      <div
        ref={tableContainerRef}
        className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl transition-colors max-h-[600px] overflow-auto relative"
      >
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
            <tr className="text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-3 px-4">Booking Code</th>
              <th className="py-3 px-4">Guest / Customer</th>
              <th className="py-3 px-4">Route</th>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Vehicle Pref.</th>
              <th className="py-3 px-4">Estimated Fare</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            {paginatedBookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  No customer bookings found matching criteria.
                </td>
              </tr>
            ) : (
              paginatedBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{b.booking_code}</td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{b.customer?.name || b.guest_name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{b.customer?.phone || b.guest_phone || '-'}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900 dark:text-slate-200">{b.pickup_location}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">→ {b.drop_location}</div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900 dark:text-slate-200">{formatDate(b.pickup_date)}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{b.pickup_time}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-slate-900 border border-blue-200 dark:border-slate-700 text-blue-700 dark:text-blue-300 font-semibold uppercase text-[10px]">
                      {b.vehicle_type}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">{formatINR(b.estimated_price)}</td>

                  <td className="py-3 px-4">
                    <StatusBadge status={b.booking_status} />
                  </td>

                  <td className="py-3 px-4 text-right">
                    {b.trip ? (
                      <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                        Assigned ({b.trip.trip_code})
                      </span>
                    ) : b.booking_status === 'REJECTED' ? (
                      <span className="text-[11px] text-rose-600 dark:text-rose-400 font-bold">
                        Declined (Do Not Assign)
                      </span>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenAssign(b)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all"
                        >
                          Assign & Dispatch
                        </button>
                        <button
                          onClick={() => handleRejectBooking(b)}
                          title="Do Not Assign / Reject Booking"
                          className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
        <div>
          Showing <strong className="text-slate-900 dark:text-white">{totalItems === 0 ? 0 : startIndex + 1}</strong> to{' '}
          <strong className="text-slate-900 dark:text-white">
            {pageSize === 0 ? totalItems : Math.min(startIndex + effectivePageSize, totalItems)}
          </strong>{' '}
          of <strong className="text-slate-900 dark:text-white">{totalItems}</strong> bookings
        </div>

        {pageSize > 0 && totalPages > 1 && (
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
        )}
      </div>

      {/* Floating Quick Action: Scroll to Top button */}
      <button
        type="button"
        onClick={scrollToTop}
        title="Scroll to Top of Queue"
        className="fixed bottom-6 right-6 p-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-2xl z-30 flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 hover:shadow-blue-600/50"
      >
        <ArrowUp className="w-4 h-4" />
        <span className="hidden sm:inline">Back to Top</span>
      </button>

      {/* Assignment Modal */}
      {selectedBooking && (
        <Modal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title={`Assign Fleet to Booking ${selectedBooking.booking_code}`}
          subtitle={`Route: ${selectedBooking.pickup_location} → ${selectedBooking.drop_location}`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmAssign} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Select Available Vehicle *</label>
              <select
                required
                value={assignVehicleId}
                onChange={(e) => setAssignVehicleId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              >
                <option value="">-- Choose Vehicle --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registration_number} ({v.model} - {v.vehicle_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Select Available Driver Partner *</label>
              <select
                required
                value={assignDriverId}
                onChange={(e) => setAssignDriverId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              >
                <option value="">-- Choose Driver Partner --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Trip Final Agreed Fare (₹) *</label>
              <input
                type="number"
                required
                value={assignPrice}
                onChange={(e) => setAssignPrice(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-[11px] text-blue-800 dark:text-blue-300">
              ⚡ Confirming assignment will convert this customer reservation into an active dispatch trip and notify the driver partner.
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={assigning}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all"
              >
                {assigning ? 'Dispatching...' : 'Confirm Assignment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
