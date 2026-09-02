'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { Trip, Vehicle, TimeAwareDriverOption } from '@/types';
import { Modal } from '@/components/common/Modal';
import { formatINR, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  UserCheck,
  Car,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MapPin,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export const AssignTripModal: React.FC = () => {
  const {
    isAssignTripOpen,
    closeAssignTrip,
    selectedTripForAssign,
    triggerRefresh,
  } = useApp();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [driverOptions, setDriverOptions] = useState<TimeAwareDriverOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [driverPayAmount, setDriverPayAmount] = useState<number>(700);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isAssignTripOpen && selectedTripForAssign) {
      setLoading(true);
      const dateStr = selectedTripForAssign.scheduled_date ? new Date(selectedTripForAssign.scheduled_date).toISOString().split('T')[0] : '';
      const timeStr = selectedTripForAssign.scheduled_time || '08:00 AM';

      Promise.all([
        api.getVehicles(),
        api.getTimeAwareDrivers(dateStr, timeStr),
      ])
        .then(([vList, dOptions]) => {
          setVehicles(vList);
          setDriverOptions(dOptions);

          // Pre-select first non-maintenance vehicle
          const validVehicles = vList.filter((v) => v.status !== 'MAINTENANCE');
          if (validVehicles.length > 0) {
            setSelectedVehicleId(validVehicles[0].id);
          } else if (vList.length > 0) {
            setSelectedVehicleId(vList[0].id);
          }

          // Pre-select driver
          const availableDriver = dOptions.find((d) => d.availability_type === 'AVAILABLE_NOW' || d.availability_type === 'UPCOMING_FREE');
          if (availableDriver) {
            setSelectedDriverId(availableDriver.driver_id);
          } else if (dOptions.length > 0) {
            setSelectedDriverId(dOptions[0].driver_id);
          }
        })
        .catch(() => {
          toast.error('Failed to load fleet availability');
        })
        .finally(() => setLoading(false));
    }
  }, [isAssignTripOpen, selectedTripForAssign]);

  if (!selectedTripForAssign) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId || !selectedDriverId) {
      return toast.error('Please select both a Vehicle and a Driver');
    }

    setSubmitting(true);
    try {
      await api.assignTrip(selectedTripForAssign.id, {
        vehicle_id: selectedVehicleId,
        driver_id: selectedDriverId,
        driver_payment_amount: Number(driverPayAmount),
        notes: notes || `Dispatched by Admin on ${new Date().toLocaleTimeString()}`,
      });

      toast.success(`Driver and Vehicle assigned to ${selectedTripForAssign.trip_code}!`);
      closeAssignTrip();
      triggerRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign trip');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDriver = driverOptions.find((d) => d.driver_id === selectedDriverId);

  return (
    <Modal
      isOpen={isAssignTripOpen}
      onClose={closeAssignTrip}
      title="Assign Driver Partner & Vehicle"
      subtitle={`Dispatch Fleet for Trip ${selectedTripForAssign.trip_code}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Trip Overview Banner */}
        <div className="bg-slate-50 dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">{selectedTripForAssign.trip_code}</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Fare: {formatINR(selectedTripForAssign.trip_price)}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate font-medium">From: {selectedTripForAssign.pickup_location}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
              <span className="truncate font-medium">To: {selectedTripForAssign.drop_location}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-[11px] pt-1 border-t border-slate-200 dark:border-slate-800">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(selectedTripForAssign.scheduled_date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {selectedTripForAssign.scheduled_time}
            </span>
            <span>Passenger: <strong className="text-slate-900 dark:text-white">{selectedTripForAssign.guest_name || selectedTripForAssign.customer?.name}</strong></span>
          </div>
        </div>

        {/* Vehicle Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Select Available Vehicle *
          </label>
          {vehicles.length === 0 ? (
            <div className="p-3 text-xs text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
              No vehicles currently marked AVAILABLE. Please free a vehicle or adjust maintenance.
            </div>
          ) : (
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id} disabled={v.status === 'MAINTENANCE'}>
                  {v.model} ({v.registration_number}) — {v.vehicle_type} [{v.status}] • Odo: {v.current_odometer.toLocaleString()} km
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Intelligent Time-Aware Driver Selection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-indigo-400" />
              <span>Select Driver Partner (Time-Aware Availability) *</span>
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {driverOptions.filter((d) => d.availability_type === 'AVAILABLE_NOW').length} Idle •{' '}
              {driverOptions.filter((d) => d.availability_type === 'UPCOMING_FREE').length} Finishing Soon
            </span>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {driverOptions.map((d) => {
              const isSelected = selectedDriverId === d.driver_id;
              const isBlocked = d.availability_type === 'CONFLICT_BLOCKED' || d.availability_type === 'LICENSE_EXPIRED';

              return (
                <div
                  key={d.driver_id}
                  onClick={() => !isBlocked && setSelectedDriverId(d.driver_id)}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    isBlocked
                      ? 'bg-slate-100 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 opacity-50 cursor-not-allowed'
                      : isSelected
                      ? 'bg-blue-50 dark:bg-indigo-950/80 border-blue-500 dark:border-indigo-500 shadow-md shadow-blue-500/10 cursor-pointer'
                      : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {d.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-white">{d.name}</span>
                        <span className="ml-2 font-mono text-[10px] text-slate-500 dark:text-slate-400">{d.driver_code}</span>
                      </div>
                    </div>

                    {/* Badge */}
                    {d.availability_type === 'AVAILABLE_NOW' && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 text-[10px] font-bold">
                        Available Now
                      </span>
                    )}
                    {d.availability_type === 'UPCOMING_FREE' && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 text-[10px] font-bold">
                        Free by {d.available_at_time}
                      </span>
                    )}
                    {d.availability_type === 'CONFLICT_BLOCKED' && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-bold">
                        Busy on Trip
                      </span>
                    )}
                    {d.availability_type === 'LICENSE_EXPIRED' && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-bold flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> DL Expired
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-8">
                    {d.reason_message} • Plan: <strong className="text-slate-700 dark:text-slate-300">{d.payment_model}</strong>
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Driver Payment Setting */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-400 mb-1">
              Driver Payment for this Trip (₹)
            </label>
            <input
              type="number"
              min="0"
              value={driverPayAmount}
              onChange={(e) => setDriverPayAmount(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-400 mb-1">
              Dispatcher Notes / Special Instructions
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. VIP passenger, placard required"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={closeAssignTrip}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !selectedVehicleId || !selectedDriverId}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{submitting ? 'Dispatching...' : 'Confirm Dispatch & Assign'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
