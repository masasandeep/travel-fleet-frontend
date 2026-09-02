'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { Vehicle, Driver, Customer, VehicleType } from '@/types';
import { formatINR } from '@/lib/utils';
import { toast } from 'sonner';
import { User, Phone, MapPin, Calendar, Clock, Car, Shield, DollarSign, FileText } from 'lucide-react';

export const QuickTripModal: React.FC = () => {
  const { isQuickTripOpen, closeQuickTrip, triggerRefresh } = useApp();

  const [customerMode, setCustomerMode] = useState<'EXISTING' | 'GUEST'>('GUEST');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('09:00 AM');
  const [passengerCount, setPassengerCount] = useState(1);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [tripPrice, setTripPrice] = useState<number>(3000);
  const [driverPaymentAmount, setDriverPaymentAmount] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isQuickTripOpen) {
      api.getCustomers().then(setCustomers).catch(() => {});
      api.getVehicles().then(setVehicles).catch(() => {});
      api.getDrivers().then(setDrivers).catch(() => {});
    }
  }, [isQuickTripOpen]);

  // Auto-quote price when pickup/drop/vehicle changes
  const handleAutoQuote = async (vehId: string) => {
    setSelectedVehicleId(vehId);
    const veh = vehicles.find((v) => v.id === vehId);
    if (veh && pickupLocation && dropLocation) {
      try {
        const quote = await api.calculateQuote({
          pickup_location: pickupLocation,
          drop_location: dropLocation,
          vehicle_type: veh.vehicle_type,
          travel_time: scheduledTime,
        });
        if (quote && quote.total_estimated_price) {
          setTripPrice(quote.total_estimated_price);
        }
      } catch (e) {
        // silent fallback
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId) return toast.error('Please select a vehicle');
    if (!selectedDriverId) return toast.error('Please select a driver');
    if (!pickupLocation || !dropLocation) return toast.error('Pickup and Drop locations are required');

    setLoading(true);
    try {
      await api.createQuickTrip({
        customer_id: customerMode === 'EXISTING' ? selectedCustomerId || null : null,
        guest_name: customerMode === 'GUEST' ? guestName : null,
        guest_phone: customerMode === 'GUEST' ? guestPhone : null,
        guest_email: customerMode === 'GUEST' ? guestEmail : null,
        vehicle_id: selectedVehicleId,
        driver_id: selectedDriverId,
        pickup_location: pickupLocation,
        drop_location: dropLocation,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        passenger_count: Number(passengerCount),
        trip_price: Number(tripPrice),
        driver_payment_amount: driverPaymentAmount ? Number(driverPaymentAmount) : undefined,
        notes: notes || 'Admin Direct Trip',
      });

      toast.success('Trip created and scheduled successfully!');
      triggerRefresh();
      closeQuickTrip();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  const selectedDriver = drivers.find((d) => d.id === selectedDriverId);
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  return (
    <Modal
      isOpen={isQuickTripOpen}
      onClose={closeQuickTrip}
      title="+ Quick Trip Dispatch"
      subtitle="Direct operational trip creation for walk-in, phone, or corporate bookings (No booking required)"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Customer Type Switcher */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Customer Details</span>
            <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-900 p-1 rounded-xl border border-slate-300 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCustomerMode('GUEST')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  customerMode === 'GUEST' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Guest / Phone
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode('EXISTING')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  customerMode === 'EXISTING' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Existing VIP / Corp
              </button>
            </div>
          </div>

          {customerMode === 'GUEST' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Guest Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Kishore Reddy"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+91 99440 01122"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="guest@gmail.com"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Select Customer *</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              >
                <option value="">-- Choose Existing Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) - {c.customer_type}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Route & Schedule */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Pickup Location *</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-emerald-600 dark:text-emerald-400" />
              <input
                type="text"
                required
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="e.g. Bangalore Airport / Indiranagar"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Drop Location *</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-rose-600 dark:text-rose-400" />
              <input
                type="text"
                required
                value={dropLocation}
                onChange={(e) => setDropLocation(e.target.value)}
                placeholder="e.g. Mysore Palace / Electronic City"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Travel Date *</label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Travel Time *</label>
            <div className="relative">
              <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                placeholder="09:00 AM"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Passengers</label>
            <input
              type="number"
              min="1"
              max="50"
              value={passengerCount}
              onChange={(e) => setPassengerCount(Number(e.target.value))}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
            />
          </div>
        </div>

        {/* Fleet & Driver Partner Assignment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Vehicle *</label>
            <select
              required
              value={selectedVehicleId}
              onChange={(e) => handleAutoQuote(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
            >
              <option value="">-- Choose Vehicle --</option>
              {vehicles.map((v) => (
                <option
                  key={v.id}
                  value={v.id}
                  disabled={v.status === 'MAINTENANCE' || v.status === 'INACTIVE'}
                >
                  {v.registration_number} - {v.model} ({v.vehicle_type}) [{v.status}]
                </option>
              ))}
            </select>
            {selectedVehicle?.status === 'MAINTENANCE' && (
              <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 font-semibold">⚠️ Vehicle is in maintenance</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Driver Partner *</label>
            <select
              required
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
            >
              <option value="">-- Choose Driver Partner --</option>
              {drivers.map((d) => (
                <option
                  key={d.id}
                  value={d.id}
                  disabled={d.is_license_expired || d.status === 'ON_LEAVE'}
                >
                  {d.name} ({d.driver_code}) - {d.payment_model} {d.is_license_expired ? '[EXPIRED DL]' : `[${d.status}]`}
                </option>
              ))}
            </select>
            {selectedDriver?.is_license_expired && (
              <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 font-semibold">❌ Driver partner license is expired. Cannot assign!</p>
            )}
          </div>
        </div>

        {/* Pricing & Financials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Trip Revenue Price (₹) *</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 absolute left-3 top-3 text-emerald-600 dark:text-emerald-400" />
              <input
                type="number"
                required
                min="100"
                value={tripPrice}
                onChange={(e) => setTripPrice(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-black text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Driver Partner Pay Rate (Optional override)
            </label>
            <input
              type="number"
              value={driverPaymentAmount || ''}
              onChange={(e) => setDriverPaymentAmount(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Auto-calculated from driver model"
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Trip Notes & Instructions</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. VIP client, luggage assistance, AC on highway"
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={closeQuickTrip}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || selectedDriver?.is_license_expired}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 transition-all"
          >
            {loading ? 'Creating Trip...' : 'Create & Dispatch Trip'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
