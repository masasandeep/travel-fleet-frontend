'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { VehicleLoan, VehicleInvestment } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatINR, formatDate } from '@/lib/utils';
import { PlusCircle, CreditCard, Landmark, DollarSign, Calendar, TrendingDown } from 'lucide-react';

export const FinanceView: React.FC = () => {
  const { refreshKey, openRecordEmi, openCreateLoan } = useApp();

  const [loans, setLoans] = useState<VehicleLoan[]>([]);
  const [investments, setInvestments] = useState<VehicleInvestment[]>([]);
  const [activeTab, setActiveTab] = useState<'loans' | 'investments'>('loans');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getLoans().catch(() => []),
      api.getInvestments().catch(() => []),
    ])
      .then(([loansData, investmentsData]) => {
        setLoans(loansData);
        setInvestments(investmentsData);
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const totalOutstanding = loans.reduce((acc, l) => acc + (l.outstanding_principal || 0), 0);
  const totalPrincipalPaid = loans.reduce((acc, l) => acc + (l.principal_paid || 0), 0);
  const totalInterestPaid = loans.reduce((acc, l) => acc + (l.interest_paid || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Fleet Finance, Loans & Capital Investments</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Separates Principal (Liability Reduction) from Interest (Financing Expense).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center transition-colors">
            <button
              onClick={() => setActiveTab('loans')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'loans' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Vehicle Loans ({loans.length})
            </button>
            <button
              onClick={() => setActiveTab('investments')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'investments' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Capital Investments ({investments.length})
            </button>
          </div>

          <button
            onClick={openCreateLoan}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Loan</span>
          </button>

          <button
            onClick={() => openRecordEmi('')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>Record EMI</span>
          </button>
        </div>
      </div>

      {/* Upcoming EMI Payment Reminders Banner */}
      {loans.filter((l) => l.status === 'ACTIVE' && l.outstanding_principal > 0).length > 0 && (
        <div className="bg-amber-50 dark:bg-gradient-to-r dark:from-amber-950/40 dark:via-slate-900 dark:to-indigo-950/40 p-4 sm:p-5 rounded-2xl border border-amber-200 dark:border-amber-800/60 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs sm:text-sm">
              <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Upcoming Vehicle Loan EMI Payment Reminders</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {loans.filter((l) => l.status === 'ACTIVE').length} Active Loan Contracts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {loans
              .filter((l) => l.status === 'ACTIVE' && l.outstanding_principal > 0)
              .slice(0, 3)
              .map((l) => (
                <div
                  key={l.id}
                  className="bg-white dark:bg-slate-950/90 p-3.5 rounded-xl border border-amber-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                      {l.vehicle?.model} ({l.vehicle?.registration_number})
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
                      {l.bank_name} • EMI: <strong className="text-emerald-600 dark:text-emerald-400">{formatINR(l.monthly_emi)}</strong>
                    </div>
                    <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                      Next Due: {l.next_emi_date ? formatDate(l.next_emi_date) : 'Upcoming'}
                    </div>
                  </div>

                  <button
                    onClick={() => openRecordEmi(l.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shrink-0 shadow active:scale-95 transition-all"
                  >
                    Pay EMI
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm transition-colors">
          <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">Total Outstanding Principal</span>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">{formatINR(totalOutstanding)}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-500">Current liability on fleet balance sheet</p>
        </div>
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm transition-colors">
          <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">Total Principal Repaid</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{formatINR(totalPrincipalPaid)}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-500">Fleet equity accumulated</p>
        </div>
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm transition-colors">
          <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">Cumulative Interest Expense</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">{formatINR(totalInterestPaid)}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-500">Financing cost logged to P&L</p>
        </div>
      </div>

      {activeTab === 'loans' ? (
        /* Loans Table */
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-xl transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Bank / Account</th>
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Original Loan</th>
                  <th className="py-3.5 px-4">Monthly EMI</th>
                  <th className="py-3.5 px-4">Principal Paid</th>
                  <th className="py-3.5 px-4">Interest Paid</th>
                  <th className="py-3.5 px-4">Outstanding</th>
                  <th className="py-3.5 px-4">Next Due Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{loan.bank_name}</div>
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{loan.account_number || '-'}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-indigo-700 dark:text-indigo-300">
                        {loan.vehicle?.model} ({loan.vehicle?.registration_number})
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{loan.interest_rate}% p.a. • {loan.tenure_months} Mo</div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {formatINR(loan.original_loan_amount)}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {formatINR(loan.monthly_emi)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {formatINR(loan.principal_paid)}
                    </td>

                    <td className="py-3.5 px-4 text-amber-700 dark:text-amber-400 font-medium">
                      {formatINR(loan.interest_paid)}
                    </td>

                    <td className="py-3.5 px-4 font-black text-rose-600 dark:text-rose-400">
                      {formatINR(loan.outstanding_principal)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                      {formatDate(loan.next_emi_date)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openRecordEmi(loan.id)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white dark:bg-indigo-600/20 dark:hover:bg-indigo-600 dark:text-indigo-300 dark:hover:text-white border border-indigo-200 dark:border-indigo-500/40 text-xs font-bold transition-all"
                      >
                        Pay EMI
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Capital Investments Table */
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-xl transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Purchase Type</th>
                  <th className="py-3.5 px-4">Purchase Price</th>
                  <th className="py-3.5 px-4">Registration</th>
                  <th className="py-3.5 px-4">Insurance</th>
                  <th className="py-3.5 px-4">Accessories & Setup</th>
                  <th className="py-3.5 px-4">Total Capital Investment</th>
                  <th className="py-3.5 px-4">Down Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {investments.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {inv.vehicle_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                        {inv.purchase_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-medium">{formatINR(inv.purchase_price)}</td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{formatINR(inv.registration_cost)}</td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{formatINR(inv.insurance_cost)}</td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{formatINR(inv.accessories_cost + inv.initial_setup_cost)}</td>
                    <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400">{formatINR(inv.total_investment)}</td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{formatINR(inv.down_payment)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
