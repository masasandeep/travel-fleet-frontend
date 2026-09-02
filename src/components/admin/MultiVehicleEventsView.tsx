'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { Booking, VehicleType } from '@/types';
import { formatINR, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/common/StatusBadge';
import { toast } from 'sonner';
import {
  Users,
  PlusCircle,
  Car,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';

export const MultiVehicleEventsView: React.FC = () => {
  const { refreshKey, triggerRefresh } = useApp();
  const [multiBookings, setMultiBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // New Event Modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [pickupLocation, setPickupLocation] = useState('Taj West End Hotel, Bangalore');
  const [dropLocation, setDropLocation] = useState('Palace Grounds Wedding Pavilion');
  const [pickupDate, setPickupDate] = useState(new Date().toISOString().split('T')[0]);
  const [pickupTime, setPickupTime] = useState('09:00 AM');
  const [innovaQty, setInnovaQty] = useState(2);
  const [sedanQty, setSedanQty] = useState(1);
  const [notes, setNotes] = useState('VIP Wedding Delegation — Placards and uniform required');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getBookings()
      .then((bList) => {
        setMultiBookings(bList.filter((b) => Boolean(b.is_multi_vehicle) || (b.vehicle_count ? b.vehicle_count > 1 : false)));
      })
      .catch(() => setMultiBookings([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleCreateEventBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone) return toast.error('Client name and phone required');

    setSubmitting(true);
    try {
      const requests = [];
      if (innovaQty > 0) {
        requests.push({
          vehicle_type: 'INNOVA' as VehicleType,
          quantity: Number(innovaQty),
          unit_price: 4500,
        });
      }
      if (sedanQty > 0) {
        requests.push({
          vehicle_type: 'SEDAN' as VehicleType,
          quantity: Number(sedanQty),
          unit_price: 3000,
        });
      }

      await api.createMultiVehicleBooking({
        guest_name: guestName,
        guest_phone: guestPhone,
        pickup_location: pickupLocation,
        drop_location: dropLocation,
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        notes,
        vehicle_requests: requests,
      });

      toast.success('Multi-vehicle delegation booking created with linked sub-trips!');
      setIsEventModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      toast.error('Failed to create multi-vehicle booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Multi-Vehicle & Event Delegation Bookings
            </h1>
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-indigo-500/20 text-blue-700 dark:text-indigo-400 border border-blue-200 dark:border-indigo-500/30 text-xs font-extrabold">
              Case 4 Feature
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage corporate delegations, wedding convoys, and multi-car events under consolidated master invoices.
          </p>
        </div>

        <button
          onClick={() => setIsEventModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ New Event Master Booking</span>
        </button>
      </div>

      {/* Main List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-xs bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            Loading event delegations...
          </div>
        ) : multiBookings.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-indigo-950/80 border border-blue-200 dark:border-indigo-700/50 flex items-center justify-center text-blue-600 dark:text-indigo-400 mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Multi-Vehicle Event Bookings Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Click <strong>+ New Event Master Booking</strong> to create a multi-car convoy for weddings or delegations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {multiBookings.map((bkg) => (
              <div
                key={bkg.id}
                className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm dark:shadow-xl hover:border-blue-400 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-700 dark:text-indigo-400">{bkg.booking_code}</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-indigo-950 text-blue-800 dark:text-indigo-300 text-[10px] font-extrabold uppercase border border-blue-200 dark:border-indigo-800">
                      Convoy: {bkg.vehicle_count || 3} Vehicles
                    </span>
                  </div>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{formatINR(bkg.estimated_price)}</span>
                </div>

                <div className="space-y-2 bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-800 dark:text-slate-200">{bkg.pickup_location}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                    <span className="text-slate-800 dark:text-slate-200">{bkg.drop_location}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <div>Client: <strong className="text-slate-900 dark:text-white">{bkg.guest_name || bkg.customer?.name}</strong></div>
                  <div>Schedule: <strong className="text-slate-700 dark:text-slate-300">{formatDate(bkg.pickup_date)} at {bkg.pickup_time}</strong></div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span>Linked Sub-Trips: <strong className="text-slate-900 dark:text-white">{bkg.booking_code}-A, {bkg.booking_code}-B, {bkg.booking_code}-C</strong></span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">1 Master Invoice</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Event Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title="Create Multi-Vehicle Master Booking"
        subtitle="Reserve multiple vehicles under a single master event delegation code"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateEventBooking} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-400 mb-1">Client / Organizer Name *</label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Aditi Rao (Wedding Planner)"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-400 mb-1">Contact Phone *</label>
              <input
                type="tel"
                required
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="+91 98888 77777"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-400 mb-1">Contact Email</label>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="events@techsummit.com"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-400 mb-1">Pickup Location *</label>
              <input
                type="text"
                required
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="e.g. ITC Gardenia, Bangalore"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-400 mb-1">Drop Location *</label>
              <input
                type="text"
                required
                value={dropLocation}
                onChange={(e) => setDropLocation(e.target.value)}
                placeholder="e.g. Kempegowda Airport, Terminal 2"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-400 mb-1">Event Date *</label>
              <input
                type="date"
                required
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-400 mb-1">Convoy Start Time *</label>
              <input
                type="text"
                required
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>
          </div>

          {/* Vehicle Allocation Quantities */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
              <span>Fleet Convoy Requirements</span>
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Toyota Innova Crysta (7-Seater)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={innovaQty}
                    onChange={(e) => setInnovaQty(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white shadow-inner"
                  />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">@ ₹4,500/car</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Executive Sedan (Honda City)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={sedanQty}
                    onChange={(e) => setSedanQty(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white shadow-inner"
                  />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">@ ₹3,000/car</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex justify-between">
              <span>Total Fleet Requested: <strong className="text-slate-900 dark:text-white">{innovaQty + sedanQty} Vehicles</strong></span>
              <span>Total Estimated Fare: <strong className="text-emerald-600 dark:text-emerald-400">{formatINR(innovaQty * 4500 + sedanQty * 3000)}</strong></span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-400 mb-1">Instructions / Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white shadow-inner"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEventModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || (innovaQty === 0 && sedanQty === 0)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all"
            >
              {submitting ? 'Creating Event...' : 'Create Convoy & Linked Sub-Trips'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
