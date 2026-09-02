'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { VehicleLoan } from '@/types';
import { formatINR } from '@/lib/utils';
import { toast } from 'sonner';
import { CreditCard, DollarSign, Calendar, Landmark } from 'lucide-react';

export const RecordEmiModal: React.FC = () => {
  const { isRecordEmiOpen, closeRecordEmi, selectedLoanIdForEmi, triggerRefresh } = useApp();

  const [loans, setLoans] = useState<VehicleLoan[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [emiAmount, setEmiAmount] = useState<number>(49980);
  const [principalComponent, setPrincipalComponent] = useState<number>(46500);
  const [interestComponent, setInterestComponent] = useState<number>(3480);
  const [paymentMethod, setPaymentMethod] = useState('AUTO_DEBIT');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isRecordEmiOpen) {
      api.getLoans().then((data) => {
        setLoans(data);
        if (selectedLoanIdForEmi) {
          setSelectedLoanId(selectedLoanIdForEmi);
          const l = data.find((x) => x.id === selectedLoanIdForEmi);
          if (l) {
            setEmiAmount(l.monthly_emi);
            // Default 90% principal, 10% interest estimate
            setPrincipalComponent(Math.round(l.monthly_emi * 0.92));
            setInterestComponent(Math.round(l.monthly_emi * 0.08));
          }
        }
      });
    }
  }, [isRecordEmiOpen, selectedLoanIdForEmi]);

  const handleLoanChange = (loanId: string) => {
    setSelectedLoanId(loanId);
    const l = loans.find((x) => x.id === loanId);
    if (l) {
      setEmiAmount(l.monthly_emi);
      setPrincipalComponent(Math.round(l.monthly_emi * 0.92));
      setInterestComponent(Math.round(l.monthly_emi * 0.08));
    }
  };

  const handlePrincipalChange = (val: number) => {
    setPrincipalComponent(val);
    setInterestComponent(Math.max(0, emiAmount - val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanId) return toast.error('Please select a loan');

    if (Math.abs(principalComponent + interestComponent - emiAmount) > 5) {
      return toast.error('Principal component + Interest component must equal total EMI amount');
    }

    setLoading(true);
    try {
      await api.recordEMIPayment({
        loan_id: selectedLoanId,
        payment_date: paymentDate,
        emi_amount: Number(emiAmount),
        principal_component: Number(principalComponent),
        interest_component: Number(interestComponent),
        payment_method: paymentMethod,
        reference_number: referenceNumber || undefined,
      });

      toast.success('EMI payment recorded with explicit Principal & Interest accounting split!');
      triggerRefresh();
      closeRecordEmi();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to record EMI payment');
    } finally {
      setLoading(false);
    }
  };

  const currentLoan = loans.find((l) => l.id === selectedLoanId);

  return (
    <Modal
      isOpen={isRecordEmiOpen}
      onClose={closeRecordEmi}
      title="Record Vehicle Loan EMI Payment"
      subtitle="Critical Accounting Rule 29: Separates Principal (liability reduction) vs. Interest (financing expense)"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Select Vehicle Loan *</label>
          <div className="relative">
            <Landmark className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <select
              required
              value={selectedLoanId}
              onChange={(e) => handleLoanChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Choose Active Loan --</option>
              {loans.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.bank_name} - {l.vehicle?.model} ({l.vehicle?.registration_number}) [Outstanding: {formatINR(l.outstanding_principal)}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentLoan && (
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-[10px] text-slate-400">Monthly EMI</span>
              <div className="font-bold text-white">{formatINR(currentLoan.monthly_emi)}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Interest Rate</span>
              <div className="font-bold text-indigo-400">{currentLoan.interest_rate}% p.a.</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Outstanding</span>
              <div className="font-bold text-rose-400">{formatINR(currentLoan.outstanding_principal)}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Payment Date *</label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Total EMI Amount (₹) *</label>
            <input
              type="number"
              required
              min="100"
              value={emiAmount}
              onChange={(e) => setEmiAmount(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Principal vs Interest Split */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
          <span className="text-xs font-bold uppercase text-slate-300">Accounting Component Breakdown</span>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-emerald-400 mb-1">
                1. Principal Component (₹)
              </label>
              <input
                type="number"
                required
                min="0"
                value={principalComponent}
                onChange={(e) => handlePrincipalChange(Number(e.target.value))}
                className="w-full bg-slate-900 border border-emerald-700/60 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Reduces loan liability balance</p>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-amber-400 mb-1">
                2. Interest Component (₹)
              </label>
              <input
                type="number"
                required
                min="0"
                value={interestComponent}
                onChange={(e) => setInterestComponent(Number(e.target.value))}
                className="w-full bg-slate-900 border border-amber-700/60 rounded-xl px-3 py-2 text-xs font-bold text-amber-400 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Logged as financing expense</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="AUTO_DEBIT">Bank Auto-Debit</option>
              <option value="NET_BANKING">Net Banking / NEFT</option>
              <option value="UPI">UPI Transfer</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Reference / UTR Number</label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. HDFC-TXN-9982"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={closeRecordEmi}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20"
          >
            {loading ? 'Recording...' : 'Record EMI Payment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
