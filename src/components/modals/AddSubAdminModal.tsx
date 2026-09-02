'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import {
  UserPlus,
  X,
  ShieldCheck,
  CheckCircle2,
  Mail,
  KeyRound,
  Phone,
  User,
  Copy,
  Check,
  Sparkles,
  Dice5,
  Clock,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';

interface AddSubAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddSubAdminModal: React.FC<AddSubAdminModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [designation, setDesignation] = useState('Shift Operations Dispatcher');
  const [loading, setLoading] = useState(false);

  // Success view state
  const [createdStaff, setCreatedStaff] = useState<{
    name: string;
    email: string;
    phone: string;
    password: string;
    designation: string;
    shareableMessage: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pwd);
    toast.info('Generated temporary staff password');
  };

  const handleReset = () => {
    setCreatedStaff(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setDesignation('Shift Operations Dispatcher');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      toast.error('Please enter the staff member name, email, and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.createSubAdmin({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password,
        designation: designation.trim(),
      });

      if (res && res.success) {
        toast.success(`🎉 Sub-Admin "${name}" added successfully!`);

        const welcomeMessage =
          `👋 *Welcome to Fleet Operations!*\n\n` +
          `You have been added as an Operations Sub-Admin / Staff Manager:\n` +
          `👤 *Name:* ${name}\n` +
          `💼 *Designation:* ${designation}\n` +
          `📧 *Login Email:* ${email}\n` +
          `🔑 *Temporary Password:* ${password}\n\n` +
          `Please sign in via the Admin Login tab to manage live dispatches, trips, and driver assignments.`;

        setCreatedStaff({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password: password,
          designation: designation,
          shareableMessage: welcomeMessage,
        });

        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add sub-admin staff member.');
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    if (!createdStaff) return;
    navigator.clipboard.writeText(createdStaff.shareableMessage);
    setCopied(true);
    toast.success('Staff credentials copied! Ready to send via WhatsApp or Email.');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  {createdStaff ? 'Sub-Admin Account Ready' : 'Add Operations Sub-Admin'}
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                  Shift Staff
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {createdStaff
                  ? 'Send these login credentials to your shift manager or dispatcher.'
                  : 'Grant operational access to assign trips and manage fleet when you are away.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View 1: Success / Share Credentials */}
        {createdStaff ? (
          <div className="p-6 space-y-5">
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3 text-emerald-300 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Sub-Admin Added to Your Fleet!</span>
                <span>This staff member can now log in under the Admin tab to manage daily dispatches.</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Staff Login Credentials</span>
              </h4>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Staff Name</span>
                  <span className="text-white font-bold">{createdStaff.name}</span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Designation</span>
                  <span className="text-blue-400 font-bold">{createdStaff.designation}</span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Login Email</span>
                  <span className="text-amber-400 font-mono font-bold">{createdStaff.email}</span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Temporary Password</span>
                  <span className="text-emerald-400 font-mono font-bold">{createdStaff.password}</span>
                </div>
              </div>

              {/* Ready-to-Send Template */}
              <div className="space-y-1 pt-1">
                <label className="block text-[11px] font-semibold text-slate-400">
                  💬 Ready-to-Send Message:
                </label>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono whitespace-pre-line leading-relaxed select-all">
                  {createdStaff.shareableMessage}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={copyCredentials}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied Message!' : '📋 Copy WhatsApp Template'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="py-2.5 px-5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* View 2: Add Sub-Admin Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Staff Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kiran Varma"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Work Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kiran@yourfleet.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mobile Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98888 33333"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Initial Password *
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Dice5 className="w-3 h-3" />
                  <span>Random</span>
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Staff Role & Responsibility
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Shift Operations Dispatcher', label: 'Dispatcher', desc: 'Trip & driver assign' },
                  { id: 'Fleet Supervisor', label: 'Supervisor', desc: 'Vehicles & fuel' },
                  { id: 'Accounts Manager', label: 'Accounts', desc: 'Tolls & driver advances' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setDesignation(item.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      designation === item.id
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-[11px] text-white">{item.label}</div>
                    <div className="text-[9px] text-slate-500 leading-tight mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Creating Account...' : 'Create Sub-Admin'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
