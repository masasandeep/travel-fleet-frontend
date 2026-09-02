'use client';

import React, { Suspense } from 'react';
import { CustomerHeader } from '@/components/customer/CustomerHeader';
import { CustomerTrackRide } from '@/components/customer/CustomerTrackRide';
import { CustomerFooter } from '@/components/customer/CustomerFooter';

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 transition-colors">
      <CustomerHeader />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-slate-400 text-sm">Loading Ride Tracker...</div>}>
          <CustomerTrackRide />
        </Suspense>
      </main>
      <CustomerFooter />
    </div>
  );
}
