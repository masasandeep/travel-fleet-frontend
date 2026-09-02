'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Gauge, Play } from 'lucide-react';

export const StartTripModal: React.FC = () => {
  const { isStartTripOpen, closeStartTrip, selectedTripForStart, triggerRefresh } = useApp();
  const [startOdometer, setStartOdometer] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (selectedTripForStart?.vehicle) {
      setStartOdometer(selectedTripForStart.vehicle.current_odometer || 0);
    }
  }, [selectedTripForStart]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripForStart) return;

    if (startOdometer <= 0) {
      return toast.error('Please enter a valid start odometer reading');
    }

    setLoading(true);
    try {
      await api.startTrip(selectedTripForStart.id, Number(startOdometer));
      toast.success(`Trip ${selectedTripForStart.trip_code} started! Vehicle & Driver marked ON TRIP.`);
      triggerRefresh();
      closeStartTrip();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to start trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isStartTripOpen}
      onClose={closeStartTrip}
      title="Start Trip Execution"
      subtitle={`Begin trip ${selectedTripForStart?.trip_code || ''} and record starting odometer`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Vehicle:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {selectedTripForStart?.vehicle?.model} ({selectedTripForStart?.vehicle?.registration_number})
            </span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Assigned Driver:</span>
            <span className="font-bold text-slate-900 dark:text-white">{selectedTripForStart?.driver?.name}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Route:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {selectedTripForStart?.pickup_location} → {selectedTripForStart?.drop_location}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Starting Odometer (km) *
          </label>
          <div className="relative">
            <Gauge className="w-5 h-5 absolute left-3.5 top-3 text-blue-600 dark:text-blue-400" />
            <input
              type="number"
              required
              min="0"
              value={startOdometer}
              onChange={(e) => setStartOdometer(Number(e.target.value))}
              placeholder="e.g. 45820"
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
            Verify the vehicle odometer reading on the dashboard before starting your trip.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={closeStartTrip}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{loading ? 'Starting...' : 'Confirm & Start Trip'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
