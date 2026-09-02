'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import {
  Building2,
  PhoneCall,
  Mail,
  MapPin,
  FileText,
  Save,
  Sparkles,
  CheckCircle2,
  Globe,
  PlusCircle,
  MessageSquare,
  Shield,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/common/Modal';

export const TenantSettingsView: React.FC = () => {
  const { tenant, tenantsList, switchTenant, updateTenantSettings, refreshKey, triggerRefresh } = useApp();

  const [companyName, setCompanyName] = useState('');
  const [tagline, setTagline] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');

  const [saving, setSaving] = useState(false);

  // New Organization Modal
  const [isNewOrgModalOpen, setIsNewOrgModalOpen] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newSubmitting, setNewSubmitting] = useState(false);

  useEffect(() => {
    if (tenant) {
      setCompanyName(tenant.company_name || '');
      setTagline(tenant.tagline || '');
      setLogoUrl(tenant.logo_url || '/logo.png');
      setPrimaryPhone(tenant.primary_phone || '');
      setSecondaryPhone(tenant.secondary_phone || '');
      setWhatsappNumber(tenant.whatsapp_number || '');
      setSupportEmail(tenant.support_email || '');
      setAddress(tenant.address || '');
      setGstNumber(tenant.gst_number || '');
    }
  }, [tenant, refreshKey]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return toast.error('Company Name is required');
    if (!primaryPhone.trim()) return toast.error('Primary Helpline is required');

    setSaving(true);
    try {
      await updateTenantSettings({
        company_name: companyName.trim(),
        tagline: tagline.trim(),
        logo_url: logoUrl.trim(),
        primary_phone: primaryPhone.trim(),
        secondary_phone: secondaryPhone.trim() || undefined,
        whatsapp_number: whatsappNumber.trim() || undefined,
        support_email: supportEmail.trim() || undefined,
        address: address.trim() || undefined,
        gst_number: gstNumber.trim().toUpperCase() || undefined,
      });
    } catch (err) {
      // Error handled in context
    } finally {
      setSaving(false);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlug.trim() || !newName.trim() || !newPhone.trim()) {
      return toast.error('Organization Name, Slug, and Primary Helpline are required');
    }

    setNewSubmitting(true);
    try {
      const created = await api.registerTenant({
        slug: newSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        company_name: newName.trim(),
        primary_phone: newPhone.trim(),
        logo_url: '/logo.png',
        tagline: 'Better journeys begin here',
      });

      toast.success(`Organization "${created.company_name}" registered on SaaS platform!`);
      setIsNewOrgModalOpen(false);
      setNewSlug('');
      setNewName('');
      setNewPhone('');
      await switchTenant(created.slug);
      triggerRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to register organization');
    } finally {
      setNewSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Fleet Organization & Helpline Settings
            </h1>
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold">
              SaaS Multi-Tenant Mode
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Manage company branding, primary and secondary dispatch helpline numbers, and WhatsApp links.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewOrgModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Register New Organization</span>
        </button>
      </div>

      {/* Multi-Tenant Switcher Card */}
      {tenantsList.length > 0 && (
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Active SaaS Organizations on Platform ({tenantsList.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">Tap to switch active fleet</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {tenantsList.map((t) => {
              const isSelected = t.slug === tenant.slug;
              return (
                <button
                  key={t.id || t.slug}
                  type="button"
                  onClick={() => switchTenant(t.slug)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 ring-1 ring-blue-600/30 text-blue-950 dark:text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0 pr-2 space-y-0.5">
                    <div className="font-bold text-xs truncate">{t.company_name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      Helpline: {t.primary_phone}
                    </div>
                  </div>
                  {isSelected ? (
                    <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[9px] uppercase shrink-0">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold shrink-0">Switch →</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-5">
        {/* Section 1: Company Profile */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Company & Branding Identity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Company / Brand Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. LA Travels"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Brand Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Better journeys begin here"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Logo URL / Path
              </label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="/logo.png"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Organization Slug (Subdomain)
              </label>
              <input
                type="text"
                disabled
                value={tenant.slug || 'la-travels'}
                className="w-full bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-500 cursor-not-allowed shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Helpline Numbers & Customer Contact Desk */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <PhoneCall className="w-4 h-4 text-amber-500" />
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Helpline Numbers & Customer Dispatch Desk</h3>
              <p className="text-[11px] text-slate-500">
                Allows multiple operators/persons to manage customer calls during day/night shifts or separate lines.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Primary 24/7 Helpline Number * (Person 1 / Day Shift)
              </label>
              <div className="relative">
                <PhoneCall className="w-4 h-4 absolute left-3 top-2.5 text-emerald-500" />
                <input
                  type="text"
                  required
                  value={primaryPhone}
                  onChange={(e) => setPrimaryPhone(e.target.value)}
                  placeholder="+91 98888 00001"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Displayed in top navigation bar and booking receipts.</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Secondary Helpline (Person 2 / Night Dispatch / Escalation)
              </label>
              <div className="relative">
                <PhoneCall className="w-4 h-4 absolute left-3 top-2.5 text-blue-500" />
                <input
                  type="text"
                  value={secondaryPhone}
                  onChange={(e) => setSecondaryPhone(e.target.value)}
                  placeholder="+91 97777 00002"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Available in customer helpline popup menu.</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp Business Link Number
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 absolute left-3 top-2.5 text-emerald-500" />
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+91 98888 00001"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Powers 1-tap WhatsApp chat button for passengers.</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Customer Support Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-blue-500" />
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="support@latravels.com"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Legal & Invoicing */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Tax Invoicing & Headquarters Address</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                GSTIN / Tax Identification Number
              </label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                placeholder="29AAAAA0000A1Z5"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Headquarters Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="100 Feet Road, Indiranagar, Bangalore, Karnataka"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 active:scale-95 disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Organization & Helpline Settings'}</span>
          </button>
        </div>
      </form>

      {/* Register New Organization Modal */}
      <Modal
        isOpen={isNewOrgModalOpen}
        onClose={() => setIsNewOrgModalOpen(false)}
        title="Register New Fleet Organization"
        subtitle="Onboard a new independent travel company onto the SaaS platform"
        maxWidth="md"
      >
        <form onSubmit={handleCreateOrg} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Organization Name *
            </label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                if (!newSlug) {
                  setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                }
              }}
              placeholder="e.g. Apex Luxury Fleets"
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Organization Slug (URL identifier) *
            </label>
            <input
              type="text"
              required
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="e.g. apex-fleets"
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Primary Helpline Number *
            </label>
            <input
              type="text"
              required
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="+91 91234 56789"
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsNewOrgModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={newSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 transition-all"
            >
              {newSubmitting ? 'Registering...' : 'Register Organization'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
