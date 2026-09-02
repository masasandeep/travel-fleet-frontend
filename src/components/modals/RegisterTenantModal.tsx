'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import {
  Building2,
  X,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Mail,
  KeyRound,
  Phone,
  Globe,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

interface RegisterTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterTenantModal: React.FC<RegisterTenantModalProps> = ({ isOpen, onClose }) => {
  const { switchTenant, loginAsAdmin } = useApp();

  const [companyName, setCompanyName] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [plan, setPlan] = useState<'STARTER' | 'PRO' | 'ENTERPRISE'>('PRO');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Auto-generate slug from company name if slug is untouched
  const handleNameChange = (val: string) => {
    setCompanyName(val);
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(autoSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim() || !slug.trim() || !primaryPhone.trim() || !adminEmail.trim() || !adminPassword) {
      toast.error('Please fill in all required organization fields.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.onboardTenant({
        company_name: companyName.trim(),
        slug: slug.trim().toLowerCase(),
        tagline: tagline.trim() || 'Better journeys begin here',
        primary_phone: primaryPhone.trim(),
        whatsapp_number: whatsappNumber.trim() || primaryPhone.trim(),
        support_email: supportEmail.trim() || adminEmail.trim(),
        admin_name: adminName.trim() || companyName.trim() + ' Admin',
        admin_email: adminEmail.trim().toLowerCase(),
        admin_password: adminPassword,
        plan: plan,
      });

      if (res && res.success) {
        toast.success(`🎉 Organization "${companyName}" successfully registered! Logging into ERP.`);
        
        // Switch workspace and login as the newly provisioned Admin
        switchTenant(res.tenant.slug);
        loginAsAdmin({
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          phone: primaryPhone,
          role: 'ADMIN',
        });

        onClose();
        window.location.href = '/admin';
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to register fleet organization.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">Register Your Fleet Organization</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                  SaaS Provisioning
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Launch your own branded Fleet ERP with multi-dispatch, custom tariffs, and live tracking.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* 1. Fleet & Branding Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1. Company & Branding</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Company / Fleet Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Apex Executive Travels"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Workspace Subdomain Slug *
                </label>
                <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-400 focus-within:border-blue-500">
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    placeholder="apex-travels"
                    className="bg-transparent border-none text-white focus:outline-none w-full text-xs font-mono"
                  />
                  <span className="text-[11px] text-slate-500 shrink-0">.latravels.com</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tagline / Motto
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Premium Intercity Chauffeured Fleet"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* 2. Helplines & Customer Support */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>2. Helpline & Dispatch Contacts</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  24/7 Primary Dispatch Helpline *
                </label>
                <input
                  type="tel"
                  required
                  value={primaryPhone}
                  onChange={(e) => setPrimaryPhone(e.target.value)}
                  placeholder="+91 98888 12345"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  WhatsApp Support Number
                </label>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+91 98888 12345"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* 3. Owner / Admin Credentials */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>3. Fleet Administrator Account</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Owner / Admin Name *
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Vikram Mehta"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Admin Work Email *
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="owner@yourfleet.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Admin Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* 4. Plan Selection */}
          <div className="pt-4 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select SaaS Fleet Tier
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'STARTER', label: 'Starter', desc: 'Up to 5 Vehicles' },
                { id: 'PRO', label: 'Pro (Popular)', desc: 'Up to 25 Vehicles + Dual Dispatch' },
                { id: 'ENTERPRISE', label: 'Enterprise', desc: 'Unlimited Fleet & Custom Domain' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPlan(p.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    plan === p.id
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-extrabold text-xs text-white">{p.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{loading ? 'Provisioning Workspace...' : 'Launch Fleet Workspace'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
