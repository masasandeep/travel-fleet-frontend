'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Copy, Calendar, Clock } from 'lucide-react';

export const DuplicateTripModal: React.FC = () => {
  const { isDuplicateTripOpen, closeDuplicateTrip, selectedTripForDuplicate, triggerRefresh } = useApp();

  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('09:00 AM');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripForDuplicate) return;

    setLoading(true);
    try {
      await api.duplicateTrip(selectedTripForDuplicate.id, scheduledDate, scheduledTime);
      toast.success(`Trip duplicated successfully from ${selectedTripForDuplicate.trip_code}!`);
      triggerRefresh();
      closeDuplicateTrip();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to duplicate trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isDuplicateTripOpen}
      onClose={closeDuplicateTrip}
      title="Duplicate Trip (Rule 22)"
      subtitle={`Create a clone of ${selectedTripForDuplicate?.trip_code || ''} with new scheduled time`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Customer:</span>
            <span className="font-semibold text-white">
              {selectedTripForDuplicate?.customer?.name || selectedTripForDuplicate?.guest_name || 'Guest'}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Route:</span>
            <span className="font-semibold text-indigo-400">
              {selectedTripForDuplicate?.pickup_location} → {selectedTripForDuplicate?.drop_location}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Vehicle:</span>
            <span className="font-semibold text-white">
              {selectedTripForDuplicate?.vehicle?.registration_number}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Driver:</span>
            <span className="font-semibold text-white">{selectedTripForDuplicate?.driver?.name}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Price:</span>
            <span className="font-semibold text-emerald-400">₹{selectedTripForDuplicate?.trip_price}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">New Date *</label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">New Time *</label>
            <div className="relative">
              <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                required
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                placeholder="09:00 AM"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={closeDuplicateTrip}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20"
          >
            <Copy className="w-4 h-4" />
            <span>{loading ? 'Duplicating...' : 'Duplicate & Schedule'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
