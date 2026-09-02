'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { ValidationSummary, ParsedCsvRow } from '@/types';
import { formatINR } from '@/lib/utils';
import { toast } from 'sonner';
import { FileSpreadsheet, UploadCloud, CheckCircle, AlertTriangle, ArrowRight, Download } from 'lucide-react';

const SAMPLE_CSV = `Customer Name,Phone,Pickup Location,Drop Location,Date,Time,Vehicle,Driver,Price,Notes
Wipro Corporate,+919888877771,Wipro Gate 5 Sarjapur,BLR Airport Terminal 1,2026-08-25,06:00 AM,KA-01-AB-1001,DRV-001,1600,VIP Client Airport Drop
TCS Executive,+919888877772,TCS Think Campus Electronic City,Mysore City,2026-08-25,08:30 AM,KA-01-MJ-2020,DRV-002,4500,Full Day Client Transfer
Flipkart Desk,+919888877773,Flipkart Bellandur,Koramangala,2026-08-25,07:00 PM,KA-05-EQ-7788,DRV-003,1200,Evening executive shuttle`;

export const BulkImportView: React.FC = () => {
  const { triggerRefresh, setAdminTab } = useApp();

  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [validationResult, setValidationResult] = useState<ValidationSummary | null>(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleValidate = async () => {
    if (!csvText.trim()) return toast.error('Please paste or upload CSV content');

    setValidating(true);
    try {
      const summary = await api.validateCSV(csvText);
      setValidationResult(summary);
      toast.success(`Validated ${summary.total_rows} rows: ${summary.valid_rows_count} valid, ${summary.invalid_rows_count} invalid.`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to validate CSV');
    } finally {
      setValidating(false);
    }
  };

  const handleCommit = async () => {
    if (!validationResult || validationResult.valid_rows_count === 0) {
      return toast.error('No valid rows available to import');
    }

    const validRows = validationResult.rows.filter((r) => r.is_valid);

    setImporting(true);
    try {
      const createdTrips = await api.commitBulkImport(validRows);
      toast.success(`Successfully imported and dispatched ${createdTrips.length} trips!`);
      triggerRefresh();
      setAdminTab('trips');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Bulk import commit failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Bulk CSV Trip Import & Validation</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Row-level syntax, license expiry, and vehicle maintenance conflict validation before commit.
          </p>
        </div>

        <button
          onClick={() => setCsvText(SAMPLE_CSV)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-white border border-slate-200 dark:border-transparent transition-colors"
        >
          <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Load Pre-formatted Sample</span>
        </button>
      </div>

      {/* CSV Input Panel */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase text-slate-300 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>CSV Raw Data Stream</span>
          </label>
          <span className="text-[11px] text-slate-500">Columns: Customer, Phone, Pickup, Drop, Date, Time, Vehicle, Driver, Price, Notes</span>
        </div>

        <textarea
          rows={6}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder="Paste CSV rows here..."
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={handleValidate}
            disabled={validating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{validating ? 'Validating CSV...' : 'Parse & Validate Rows'}</span>
          </button>
        </div>
      </div>

      {/* Live Validation Results Table */}
      {validationResult && (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase text-white">Validation Preview</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                {validationResult.valid_rows_count} Valid
              </span>
              {validationResult.invalid_rows_count > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-700">
                  {validationResult.invalid_rows_count} Invalid
                </span>
              )}
            </div>

            <button
              onClick={handleCommit}
              disabled={importing || validationResult.valid_rows_count === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{importing ? 'Importing Trips...' : `Commit & Dispatch (${validationResult.valid_rows_count}) Trips`}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Route</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Vehicle</th>
                  <th className="py-3 px-3">Driver</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Validation Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {validationResult.rows.map((row) => (
                  <tr
                    key={row.row_number}
                    className={row.is_valid ? 'hover:bg-slate-900/40' : 'bg-rose-950/20 hover:bg-rose-950/30'}
                  >
                    <td className="py-3 px-3 font-mono text-slate-500">{row.row_number}</td>

                    <td className="py-3 px-3">
                      {row.is_valid ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle className="w-3.5 h-3.5" /> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" /> Error
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-semibold text-white">
                      {row.customer_name}
                      <div className="text-[10px] text-slate-400">{row.phone}</div>
                    </td>

                    <td className="py-3 px-3">
                      {row.pickup} → {row.drop}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {row.date} {row.time}
                    </td>

                    <td className="py-3 px-3 font-mono text-indigo-300">
                      {row.vehicle_registration_or_type}
                    </td>

                    <td className="py-3 px-3">{row.driver_code_or_name}</td>

                    <td className="py-3 px-3 font-bold text-white">{formatINR(row.price)}</td>

                    <td className="py-3 px-3">
                      {row.is_valid ? (
                        <span className="text-emerald-400 text-[11px]">Ready for batch import</span>
                      ) : (
                        <span className="text-rose-300 text-[11px] font-semibold">
                          {row.errors.join(', ')}
                        </span>
                      )}
                    </td>
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
