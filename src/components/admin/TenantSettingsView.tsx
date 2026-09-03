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
  MessageSquare,
  Shield,
  UserPlus,
  Users,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { AddSubAdminModal } from '@/components/modals/AddSubAdminModal';

export const TenantSettingsView: React.FC = () => {
  const { tenant, updateTenantSettings, refreshKey, triggerRefresh } = useApp();

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

  // Sub-Admins & Staff Members
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);

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
    loadStaffMembers();
  }, [tenant, refreshKey]);

  const loadStaffMembers = async () => {
    try {
      setLoadingStaff(true);
      const staff = await api.getStaffMembers();
      setStaffMembers(staff || []);
    } catch (err) {
      // Handled silently
    } finally {
      setLoadingStaff(false);
    }
  };

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
      toast.success('Organization branding and helpline settings saved successfully!');
    } catch (err) {
      // Error handled in context
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove sub-admin "${name}"?`)) return;
    try {
      await api.deleteStaffMember(id);
      toast.success(`Sub-admin "${name}" removed successfully`);
      loadStaffMembers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to remove staff member');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Fleet Organization & Helplines
            </h1>
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold">
              {tenant.plan || 'PRO'} Plan
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Manage company branding, dispatch helpline numbers, WhatsApp booking links, and operations sub-admins.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddStaffModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Shift Sub-Admin</span>
        </button>
      </div>

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
                Company / Fleet Brand Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. LA Travels"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tagline / Subtitle
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Better journeys begin here"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Brand Logo URL
              </label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="/logo.png or https://example.com/logo.png"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                GST / Tax Registration Number
              </label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                placeholder="29AAAAA0000A1Z5"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Helplines & WhatsApp */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <PhoneCall className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Customer Support & Dispatch Helplines</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Primary 24/7 Helpline *
              </label>
              <input
                type="text"
                required
                value={primaryPhone}
                onChange={(e) => setPrimaryPhone(e.target.value)}
                placeholder="+91 98888 00001"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Secondary Helpline (Optional)
              </label>
              <input
                type="text"
                value={secondaryPhone}
                onChange={(e) => setSecondaryPhone(e.target.value)}
                placeholder="+91 97777 00002"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp Direct Link
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+91 98888 00001"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Support Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@latravels.com"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
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
                placeholder="100 Feet Road, Indiranagar, Bangalore"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Organization & Helpline Settings'}</span>
          </button>
        </div>
      </form>

      {/* Section 3: Operations Sub-Admins & Shift Dispatchers */}
      <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Operations Team & Shift Sub-Admins
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setIsAddStaffModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold hover:bg-blue-100 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Staff Member</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Sub-admins can log in during night shifts or operational hours to assign drivers, start trips, and manage live dispatches when the main fleet owner is offline.
        </p>

        {loadingStaff ? (
          <div className="py-6 text-center text-xs text-slate-500">Loading operations staff...</div>
        ) : staffMembers.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 space-y-2">
            <Shield className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
            <div>No sub-admins added yet</div>
            <p className="text-[11px] text-slate-500">
              Click "+ Add Shift Sub-Admin" to create credentials for your dispatch staff.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            {staffMembers.map((member) => (
              <div key={member.id} className="p-3.5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs ${
                    member.role === 'ADMIN' || member.role === 'SUPERADMIN' ? 'bg-amber-600' : 'bg-blue-600'
                  }`}>
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{member.name}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        member.role === 'ADMIN' || member.role === 'SUPERADMIN'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-400'
                      }`}>
                        {member.role === 'ADMIN' || member.role === 'SUPERADMIN' ? 'Primary Owner' : 'Operations Sub-Admin'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-0.5">
                      <span>{member.email}</span>
                      {member.phone && <span>• {member.phone}</span>}
                    </div>
                  </div>
                </div>

                {member.role === 'SUB_ADMIN' && (
                  <button
                    type="button"
                    onClick={() => handleDeleteStaff(member.id, member.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Remove Sub-Admin"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Sub-Admin Modal */}
      <AddSubAdminModal
        isOpen={isAddStaffModalOpen}
        onClose={() => setIsAddStaffModalOpen(false)}
        onSuccess={loadStaffMembers}
      />
    </div>
  );
};
