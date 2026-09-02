'use client';

import React from 'react';
import { useApp, CustomerTab } from '@/context/AppContext';
import {
  Compass,
  Car,
  Search,
  History,
  Sparkles,
  Building2,
  PhoneCall,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const CustomerNav: React.FC = () => {
  const { customerTab, setCustomerTab, tenant, currentUser } = useApp();

  const navLinks: { id: CustomerTab; label: string; icon: React.ElementType }[] = [
    { id: 'book', label: 'Book a Ride', icon: Car },
    { id: 'track', label: 'Track Booking', icon: Search },
    { id: 'history', label: 'My Rides', icon: History },
    { id: 'fleet', label: 'Luxury Fleet', icon: Sparkles },
    { id: 'corporate', label: 'Corporate Accounts', icon: Building2 },
  ];

  return (
    <nav className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-16 z-30 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 h-14 overflow-x-auto">
        {/* Customer Nav Links */}
        <div className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = customerTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCustomerTab(item.id)}
                className={cn(
                  'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* 24/7 VIP Concierge Hotline */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>24/7 VIP Helpline: <strong>{tenant.primary_phone || '+91 98888 00001'}</strong></span>
          </div>
          {currentUser && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-700/50 text-[11px] font-semibold text-indigo-300">
              <User className="w-3.5 h-3.5" />
              <span>{currentUser.name}</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
