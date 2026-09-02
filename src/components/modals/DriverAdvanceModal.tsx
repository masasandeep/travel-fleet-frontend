'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { DollarSign, HandCoins } from 'lucide-react';

export const DriverAdvanceModal: React.FC = () => {
  const { isDriverAdvanceOpen, closeDriverAdvance, selectedDriverForAdvance, triggerRefresh } = useApp();

  const [amount, setAmount] = useState<number>(3000);
  const [reason, setReason] = useState('Medical & Emergency expense advance');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriverForAdvance) return;

    if (amount <= 0) return toast.error('Please enter a valid advance amount');

    setLoading(true);
    try {
      await api.createDriverAdvance({
        driver_id: selectedDriverForAdvance.id,
        amount: Number(amount),
        reason,
      });

      toast.success(`Advance of ₹${amount} issued to ${selectedDriverForAdvance.name}! Auto-deducted from future trips.`);
      triggerRefresh();
      closeDriverAdvance();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to issue advance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isDriverAdvanceOpen}
      onClose={closeDriverAdvance}
      title="Issue Driver Cash Advance"
      subtitle={`Record emergency loan/advance for ${selectedDriverForAdvance?.name || ''} (${selectedDriverForAdvance?.driver_code || ''})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Advance Amount (₹) *</label>
          <div className="relative">
            <DollarSign className="w-4 h-4 absolute left-3 top-3 text-amber-400" />
            <input
              type="number"
              required
              min="100"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-amber-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Advances are automatically deducted up to 30% per completed trip until fully repaid.
          </p>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Reason / Purpose *</label>
          <input
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Festival advance, Family medical emergency"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={closeDriverAdvance}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20"
          >
            <HandCoins className="w-4 h-4" />
            <span>{loading ? 'Issuing...' : 'Issue Advance'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
