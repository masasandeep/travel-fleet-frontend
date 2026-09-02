'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { Vehicle } from '@/types';
import { formatINR } from '@/lib/utils';
import { toast } from 'sonner';
import { Landmark, Car, Calculator, Calendar, DollarSign, Percent, ShieldCheck } from 'lucide-react';

export const CreateLoanModal: React.FC = () => {
  const { isCreateLoanOpen, closeCreateLoan, triggerRefresh } = useApp();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [loanAmount, setLoanAmount] = useState<number>(800000);
  const [interestRate, setInterestRate] = useState<number>(9.5);
  const [tenureMonths, setTenureMonths] = useState<number>(48);
  const [loanStartDate, setLoanStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isCreateLoanOpen) {
      api.getVehicles().then((data) => {
        setVehicles(data);
        if (data.length > 0) {
          setVehicleId((prev) => prev || data[0].id);
        }
      });
    }
  }, [isCreateLoanOpen]);

  // Live EMI calculation
  const calculateEMI = (principal: number, annualRate: number, tenure: number): number => {
    if (principal <= 0 || annualRate <= 0 || tenure <= 0) return 0;
    const monthlyRate = annualRate / 12 / 100;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi);
  };

  const monthlyEMI = calculateEMI(loanAmount, interestRate, tenureMonths);
  const totalRepayment = monthlyEMI * tenureMonths;
  const totalInterest = Math.max(0, totalRepayment - loanAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) return toast.error('Please select a vehicle');
    if (!bankName.trim()) return toast.error('Bank Name is required');
    if (loanAmount <= 0) return toast.error('Loan amount must be greater than 0');

    setSubmitting(true);
    try {
      await api.createLoan({
        vehicle_id: vehicleId,
        bank_name: bankName.trim(),
        account_number: accountNumber.trim(),
        original_loan_amount: Number(loanAmount),
        interest_rate: Number(interestRate),
        tenure_months: Number(tenureMonths),
        loan_start_date: loanStartDate,
      });

      toast.success('Vehicle Loan registered successfully with amortization schedule!');
      triggerRefresh();
      closeCreateLoan();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create loan');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  return (
    <Modal
      isOpen={isCreateLoanOpen}
      onClose={closeCreateLoan}
      title="Add Vehicle Financing / Bank Loan"
      subtitle="Track principal liability, interest amortization, and automated EMI reminders"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vehicle Selection */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Select Financed Vehicle *</label>
          <div className="relative">
            <Car className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <select
              required
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Choose Vehicle --</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.model} ({v.registration_number}) — {v.vehicle_type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bank Name & Agreement Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Lender / Bank Name *</label>
            <div className="relative">
              <Landmark className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. HDFC Bank, SBI, ICICI"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Loan / Account Agreement No.</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g. LON-HDFC-2026-99"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Loan Amount & Interest Rate */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Loan Amount (₹) *</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 absolute left-3 top-3 text-emerald-400" />
              <input
                type="number"
                required
                min={10000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Annual Interest Rate (%) *</label>
            <div className="relative">
              <Percent className="w-4 h-4 absolute left-3 top-3 text-indigo-400" />
              <input
                type="number"
                step="0.05"
                required
                min={1}
                max={30}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Tenure (Months) *</label>
            <input
              type="number"
              required
              min={6}
              max={120}
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Disbursement / Start Date *</label>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="date"
              required
              value={loanStartDate}
              onChange={(e) => setLoanStartDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Real-time Amortization Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/80 to-slate-950 border border-indigo-800/60 space-y-2">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
            <Calculator className="w-4 h-4" />
            <span>Automatic EMI Calculation Preview</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center pt-1">
            <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Monthly EMI</span>
              <div className="text-base font-black text-emerald-400">{formatINR(monthlyEMI)}</div>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Interest</span>
              <div className="text-base font-black text-amber-400">{formatINR(totalInterest)}</div>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Repayment</span>
              <div className="text-base font-black text-white">{formatINR(totalRepayment)}</div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 text-center">
            Amortized at {interestRate}% p.a. over {tenureMonths} months for {selectedVehicle?.model || 'selected vehicle'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={closeCreateLoan}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
          >
            {submitting ? 'Registering Loan...' : 'Register Vehicle Loan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
