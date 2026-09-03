'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Compass,
  PhoneCall,
  ShieldCheck,
  LogIn,
  Car,
  Search,
  Map,
  Bell,
  LogOut,
  User,
  CheckCheck,
  X,
  Building2,
  ChevronDown,
  MessageSquare,
  Mail,
  Check,
  ExternalLink,
} from 'lucide-react';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useApp } from '@/context/AppContext';

export const CustomerHeader: React.FC = () => {
  const {
    currentUser,
    logout,
    openEditProfile,
    notifications,
    unreadNotificationCount,
    markNotificationsAsRead,
    tenant,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isHelplineOpen, setIsHelplineOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const helplineRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on clicking outside or pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNotifOpen(false);
        setIsHelplineOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
      if (helplineRef.current && !helplineRef.current.contains(target)) {
        setIsHelplineOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 dark:border-slate-800 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all overflow-hidden p-1.5 shrink-0">
              <img src={tenant.logo_url || '/logo.png'} alt="Fleet Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white leading-none">
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
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1 truncate max-w-[200px] sm:max-w-none">
                {tenant.tagline || 'Better journeys begin here'}
              </span>
            </div>
          </Link>
        </div>

        {/* Consumer Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <Link href="/" className="hover:text-slate-950 dark:hover:text-white transition-colors flex items-center gap-1.5">
            <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Book a Ride</span>
          </Link>
          <Link href="/track" className="hover:text-slate-950 dark:hover:text-white transition-colors flex items-center gap-1.5">
            <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Track Booking</span>
          </Link>
          <a href="#coverage-routes" className="hover:text-slate-950 dark:hover:text-white transition-colors flex items-center gap-1.5">
            <Map className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>Popular Routes</span>
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Interactive Multi-Contact Helpline Popover */}
          <div ref={helplineRef} className="relative hidden lg:block">
            <button
              type="button"
              onClick={() => setIsHelplineOpen(!isHelplineOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-colors shadow-xs group"
              title="Click to view 24/7 Helpline & Support options"
            >
              <PhoneCall className="w-4 h-4 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform" />
              <span>24/7 Helpline: <strong className="text-slate-900 dark:text-white">{tenant.primary_phone || '+91 98888 00001'}</strong></span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Helpline Floating Popover */}
            {isHelplineOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl p-3.5 space-y-2.5 z-50 animate-in fade-in zoom-in-95 text-slate-900 dark:text-white">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
                    <span>{tenant.company_name} Support</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsHelplineOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Primary Desk */}
                <a
                  href={`tel:${tenant.primary_phone || '+91 98888 00001'}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-900 dark:hover:bg-blue-950/60 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700/60 transition-all text-xs group"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Primary Dispatch (24/7)</span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400">{tenant.primary_phone}</div>
                  </div>
                  <PhoneCall className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                </a>

                {/* Secondary / Night Desk */}
                {tenant.secondary_phone && (
                  <a
                    href={`tel:${tenant.secondary_phone}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-900 dark:hover:bg-blue-950/60 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700/60 transition-all text-xs group"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>Secondary / Night Dispatch</span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400">{tenant.secondary_phone}</div>
                    </div>
                    <PhoneCall className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  </a>
                )}

                {/* WhatsApp Chat */}
                {tenant.whatsapp_number && (
                  <a
                    href={`https://wa.me/${tenant.whatsapp_number.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 transition-all text-xs text-emerald-900 dark:text-emerald-300 group"
                  >
                    <div className="flex items-center gap-2 font-bold">
                      <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>WhatsApp Instant Support</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  </a>
                )}
              </div>
            )}
          </div>

          <ThemeToggle />

          {/* In-App Notifications Bell */}
          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                if (!isNotifOpen && unreadNotificationCount > 0) {
                  markNotificationsAsRead();
                }
              }}
              title="In-App Booking & Dispatch Notifications"
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white font-black text-[9px] flex items-center justify-center animate-pulse shadow-sm">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* In-App Notifications Dropdown */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-3 z-50 animate-in fade-in zoom-in-95 text-slate-900 dark:text-white">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Bell className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>In-App Notifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={markNotificationsAsRead}
                        className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>Mark all read</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsNotifOpen(false)}
                      title="Close Notifications"
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 divide-y divide-slate-100 dark:divide-slate-900">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">No active notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="pt-2 first:pt-0 space-y-0.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white text-[11px]">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{n.message}</p>
                        {n.bookingCode && (
                          <Link
                            href={`/track?code=${n.bookingCode}`}
                            onClick={() => setIsNotifOpen(false)}
                            className="inline-block text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline mt-1"
                          >
                            Track Live Status ({n.bookingCode}) →
                          </Link>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile or Login Trigger */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 pl-1">
              <button
                type="button"
                onClick={openEditProfile}
                title="Click to view & edit profile settings"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs transition-all shadow-xs group"
              >
                <div className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center text-white shadow-xs ${
                  currentUser.role === 'ADMIN' ? 'bg-amber-600' : 'bg-blue-600'
                }`}>
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-bold text-slate-900 dark:text-white max-w-[120px] truncate leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {currentUser.name}
                  </span>
                  <span className={`text-[9px] font-extrabold uppercase ${
                    currentUser.role === 'ADMIN' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
                  }`}>
                    {currentUser.role === 'ADMIN' ? 'Fleet Admin ⚙' : 'Passenger ⚙'}
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={logout}
                title="Log Out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login?redirect=/"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In</span>
            </Link>
          )}

          {/* Admin ERP Option: ONLY visible to users with ADMIN privilege */}
          {currentUser?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 dark:text-amber-300 dark:hover:text-white dark:border-amber-700/60 text-xs font-bold transition-all shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Admin ERP</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
