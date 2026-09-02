'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, PhoneCall, Mail, MapPin, Lock, Map, MessageSquare } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const CustomerFooter: React.FC = () => {
  const { currentUser, tenant } = useApp();

  return (
    <footer className="w-full bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-200 dark:border-slate-800/80">
        {/* Brand */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-sm">
              <img src={tenant.logo_url || '/logo.png'} alt="Fleet Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col justify-center leading-none">
              <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight block">
                {(() => {
                  const name = tenant.company_name || 'LA Travels';
                  const parts = name.split(' ');
                  if (parts.length > 1) {
                    const firstPart = parts.slice(0, -1).join(' ');
                    const lastWord = parts[parts.length - 1];
                    return (
                      <>
                        {firstPart} <span className="text-blue-600 dark:text-blue-400 font-black">{lastWord}</span>
                      </>
                    );
                  }
                  return <span className="text-blue-600 dark:text-blue-400 font-black">{name}</span>;
                })()}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1 block">
                {tenant.tagline || 'Better journeys begin here'}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Executive travel services, airport transfers, intercity corridors, and corporate delegation convoys across India.
          </p>
        </div>

        {/* Links */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] tracking-wider">Quick Navigation</h4>
          <ul className="space-y-1.5 text-[11px]">
            <li><Link href="/" className="hover:text-slate-950 dark:hover:text-white transition-colors">Book a Ride</Link></li>
            <li><Link href="/track" className="hover:text-slate-950 dark:hover:text-white transition-colors">Track Live Booking</Link></li>
            <li><a href="#coverage-routes" className="hover:text-slate-950 dark:hover:text-white transition-colors">Popular Routes & Coverage</a></li>
          </ul>
        </div>

        {/* Support & Concierge */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] tracking-wider">24/7 VIP Concierge</h4>
          <ul className="space-y-1.5 text-[11px]">
            <li className="flex items-center gap-2">
              <PhoneCall className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <a href={`tel:${tenant.primary_phone || '+91 98888 00001'}`} className="hover:underline">
                {tenant.primary_phone || '+91 98888 00001'}
              </a>
            </li>
            {tenant.secondary_phone && (
              <li className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <a href={`tel:${tenant.secondary_phone}`} className="hover:underline">
                  {tenant.secondary_phone}
                </a>
              </li>
            )}
            {tenant.whatsapp_number && (
              <li className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <a href={`https://wa.me/${tenant.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  WhatsApp Support
                </a>
              </li>
            )}
            {tenant.support_email && (
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <a href={`mailto:${tenant.support_email}`} className="hover:underline">
                  {tenant.support_email}
                </a>
              </li>
            )}
            {tenant.address && (
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
                <span className="truncate max-w-[200px]">{tenant.address}</span>
              </li>
            )}
          </ul>
        </div>

        {/* Staff & Partner Portal: Only shown if Admin or Driver */}
        <div className="space-y-3 bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
            <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-indigo-400" />
            <span>Staff & Partner Portal</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {currentUser?.role === 'ADMIN'
              ? 'Authorized access for fleet managers, dispatchers, and registered driver partners.'
              : 'Driver partner mobile cockpit access.'}
          </p>
          <div className="flex flex-col gap-2">
            {currentUser?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="w-full text-center py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold transition-colors"
              >
                🏢 Admin Fleet ERP
              </Link>
            )}
            <Link
              href="/driver"
              className="w-full text-center py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-800 dark:text-indigo-300 text-xs font-bold transition-colors"
            >
              📱 Driver Mobile Web App
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
        <p>© 2026 {tenant.company_name || 'LA Travels'}. All rights reserved.</p>
        <p>{tenant.tagline || 'Better journeys begin here'} — Multi-Tenant Fleet ERP</p>
      </div>
    </footer>
  );
};
