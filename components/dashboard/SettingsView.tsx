'use client';

import React, { useState, useEffect } from 'react';
import { formatDateToDDMMYYYY } from '../../lib/dateUtils';
import enDictionary from '../../locales/en.json';
import msDictionary from '../../locales/ms.json';

interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'STAFF' | 'AGENT';
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
}

interface SettingsViewProps {
  initialLang?: 'en' | 'ms';
}

export function SettingsView({ initialLang = 'en' }: SettingsViewProps) {
  // Language State - Default Strictly to English 'en'
  const [lang, setLang] = useState<'en' | 'ms'>(initialLang);

  useEffect(() => {
    const savedLang = (localStorage.getItem('lc_lang') as 'en' | 'ms') || initialLang || 'en';
    setLang(savedLang);
  }, [initialLang]);

  const handleLangToggle = (newLang: 'en' | 'ms') => {
    setLang(newLang);
    localStorage.setItem('lc_lang', newLang);
  };

  const dict = lang === 'ms' ? msDictionary.settings : enDictionary.settings;

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [staffList, setStaffList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passSubmitting, setPassSubmitting] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Staff Modal State
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffFullName, setNewStaffFullName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'SUPER_ADMIN' | 'MANAGER' | 'STAFF' | 'AGENT'>('STAFF');
  const [addStaffSubmitting, setAddStaffSubmitting] = useState(false);
  const [addStaffError, setAddStaffError] = useState('');

  // Reset Password Modal State
  const [resetTargetUser, setResetTargetUser] = useState<UserProfile | null>(null);
  const [adminResetPass, setAdminResetPass] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState('');

  // Edit Staff Modal State
  const [editTargetUser, setEditTargetUser] = useState<UserProfile | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'SUPER_ADMIN' | 'MANAGER' | 'STAFF' | 'AGENT'>('STAFF');
  const [editActive, setEditActive] = useState(true);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetchSessionAndStaff();
  }, []);

  const fetchSessionAndStaff = async () => {
    setLoading(true);
    try {
      // 1. Get Me
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.success && meData.user) {
        setCurrentUser(meData.user);
        localStorage.setItem('lc_user', JSON.stringify(meData.user));
      }

      // 2. Get Staff list if admin/manager
      const staffRes = await fetch('/api/auth/users');
      const staffData = await staffRes.json();
      if (staffData.success && staffData.users) {
        setStaffList(staffData.users);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passStrength = getPasswordStrength(newPassword);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);

    if (newPassword !== confirmPassword) {
      setPassMessage({ type: 'error', text: dict.changePassword.mismatchError });
      return;
    }

    if (newPassword.length < 8) {
      setPassMessage({ type: 'error', text: dict.changePassword.lengthError });
      return;
    }

    setPassSubmitting(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to change password');
      }

      setPassMessage({ type: 'success', text: dict.changePassword.successMsg });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassMessage({ type: 'error', text: err.message || 'Failed to change password' });
    } finally {
      setPassSubmitting(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddStaffError('');
    setAddStaffSubmitting(true);

    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newStaffUsername.trim(),
          fullName: newStaffFullName.trim(),
          email: newStaffEmail.trim() || undefined,
          password: newStaffPassword,
          role: newStaffRole,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add staff');
      }

      setIsAddStaffOpen(false);
      setNewStaffUsername('');
      setNewStaffFullName('');
      setNewStaffEmail('');
      setNewStaffPassword('');
      setNewStaffRole('STAFF');
      fetchSessionAndStaff();
    } catch (err: any) {
      setAddStaffError(err.message || 'Failed to register staff');
    } finally {
      setAddStaffSubmitting(false);
    }
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTargetUser) return;
    setEditError('');
    setEditSubmitting(true);

    try {
      const res = await fetch(`/api/auth/users/${editTargetUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editFullName.trim(),
          email: editEmail.trim() || null,
          role: editRole,
          isActive: editActive,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update staff');
      }

      setEditTargetUser(null);
      fetchSessionAndStaff();
    } catch (err: any) {
      setEditError(err.message || 'Error updating staff');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    setResetError('');
    setResetSubmitting(true);

    try {
      const res = await fetch(`/api/auth/users/${resetTargetUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: adminResetPass }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reset password');
      }

      const successMsg = dict.modals.resetPassword.successMsg.replace('{name}', resetTargetUser.fullName);
      setResetTargetUser(null);
      setAdminResetPass('');
      alert(successMsg);
    } catch (err: any) {
      setResetError(err.message || 'Error resetting password');
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleDeleteStaff = async (user: UserProfile) => {
    const confirmPrompt = dict.staffManagement.deleteConfirm.replace('{name}', user.fullName);
    if (!window.confirm(confirmPrompt)) {
      return;
    }

    try {
      const res = await fetch(`/api/auth/users/${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete account');
      }
      fetchSessionAndStaff();
    } catch (err: any) {
      alert(err.message || 'Error deleting staff');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800">SUPER ADMIN</span>;
      case 'MANAGER':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">MANAGER</span>;
      case 'STAFF':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">STAFF / OPERATOR</span>;
      case 'AGENT':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">AGENT</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{role}</span>;
    }
  };

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* 📄 PAGE TITLE & LANGUAGE SWITCHER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{dict.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {dict.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* 🌐 Clean Two-Language Switcher (Default English) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => handleLangToggle('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                lang === 'en'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-red-600'
              }`}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>
            <button
              onClick={() => handleLangToggle('ms')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                lang === 'ms'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-red-600'
              }`}
            >
              <span>🇲🇾</span>
              <span>Bahasa Melayu</span>
            </button>
          </div>

          {currentUser && (
            <div className="flex items-center gap-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-2 px-3.5 rounded-2xl shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-red-700 text-white flex items-center justify-center font-black text-xs shadow-md shadow-red-600/25">
                {currentUser.fullName.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{currentUser.fullName}</div>
                <div className="mt-0.5">{getRoleBadge(currentUser.role)}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 🔐 SECTION 1: PROFILE & CHANGE PASSWORD */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center font-bold">
                🔒
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{dict.changePassword.title}</h3>
                <p className="text-[11px] text-slate-500">{dict.changePassword.subtitle}</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
              {passMessage && (
                <div
                  className={`p-3 rounded-xl font-semibold ${
                    passMessage.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                  }`}
                >
                  {passMessage.type === 'success' ? '✅ ' : '⚠️ '}
                  {passMessage.text}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {dict.changePassword.currentPassword}
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    placeholder={dict.changePassword.currentPasswordPlaceholder}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-red-600 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    {showCurrentPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {dict.changePassword.newPassword}
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    placeholder={dict.changePassword.newPasswordPlaceholder}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-red-600 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    {showNewPass ? '🙈' : '👁️'}
                  </button>
                </div>

                {newPassword.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1 h-1.5 w-full">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-full flex-1 rounded-full ${
                            passStrength >= level
                              ? passStrength <= 2
                                ? 'bg-red-500'
                                : passStrength <= 4
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                              : 'bg-slate-200 dark:bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 block text-right">
                      {passStrength <= 2
                        ? dict.changePassword.strengthWeak
                        : passStrength <= 4
                        ? dict.changePassword.strengthModerate
                        : dict.changePassword.strengthStrong}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {dict.changePassword.confirmPassword}
                </label>
                <input
                  type="password"
                  required
                  placeholder={dict.changePassword.confirmPasswordPlaceholder}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-red-600"
                />
              </div>

              <button
                type="submit"
                disabled={passSubmitting}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {passSubmitting ? dict.changePassword.submittingBtn : dict.changePassword.submitBtn}
              </button>
            </form>
          </div>

          {/* 🛡️ PERMISSIONS REFERENCE MATRIX */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm text-xs space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              {dict.rbacMatrix.title}
            </h3>
            <div className="space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
              <div>
                <strong className="text-red-600 font-bold">SUPER_ADMIN: </strong>
                {dict.rbacMatrix.superAdmin.replace('SUPER_ADMIN: ', '')}
              </div>
              <div>
                <strong className="text-purple-600 font-bold">MANAGER: </strong>
                {dict.rbacMatrix.manager.replace('MANAGER: ', '')}
              </div>
              <div>
                <strong className="text-blue-600 font-bold">STAFF / OPERATOR: </strong>
                {dict.rbacMatrix.staff.replace('STAFF / OPERATOR: ', '')}
              </div>
              <div>
                <strong className="text-emerald-600 font-bold">AGENT: </strong>
                {dict.rbacMatrix.agent.replace('AGENT: ', '')}
              </div>
            </div>
          </div>
        </div>

        {/* 👥 SECTION 2: STAFF ACCESS CONTROL & MANAGEMENT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{dict.staffManagement.title}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {dict.staffManagement.subtitle}
                </p>
              </div>

              {isSuperAdmin && (
                <button
                  onClick={() => setIsAddStaffOpen(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-bold text-xs shadow-md shadow-red-600/25 transition-all flex items-center gap-2 self-start sm:self-auto"
                >
                  <span>➕</span>
                  <span>{dict.staffManagement.addStaffBtn}</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">{dict.staffManagement.loading}</div>
            ) : staffList.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">{dict.staffManagement.empty}</div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">{dict.staffManagement.table.staffName}</th>
                      <th className="py-3 px-4">{dict.staffManagement.table.role}</th>
                      <th className="py-3 px-4 text-center">{dict.staffManagement.table.status}</th>
                      <th className="py-3 px-4">{dict.staffManagement.table.lastLogin}</th>
                      {isSuperAdmin && <th className="py-3 px-4 text-right">{dict.staffManagement.table.actions}</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {staffList.map((staf) => (
                      <tr key={staf.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-xs">
                              {staf.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">{staf.fullName}</div>
                              <div className="text-[11px] text-slate-500">@{staf.username} {staf.email ? `• ${staf.email}` : ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{getRoleBadge(staf.role)}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              staf.isActive
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {staf.isActive ? dict.staffManagement.statusActive : dict.staffManagement.statusInactive}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {staf.lastLogin ? formatDateToDDMMYYYY(staf.lastLogin) : dict.staffManagement.table.never}
                        </td>
                        {isSuperAdmin && (
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditTargetUser(staf);
                                  setEditFullName(staf.fullName);
                                  setEditEmail(staf.email || '');
                                  setEditRole(staf.role);
                                  setEditActive(staf.isActive);
                                }}
                                title={dict.staffManagement.actions.edit}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 text-[11px] font-semibold transition-colors"
                              >
                                {dict.staffManagement.actions.edit}
                              </button>
                              <button
                                onClick={() => {
                                  setResetTargetUser(staf);
                                  setAdminResetPass('');
                                }}
                                title={dict.staffManagement.actions.resetPass}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 text-[11px] font-semibold transition-colors"
                              >
                                {dict.staffManagement.actions.resetPass}
                              </button>
                              {staf.id !== currentUser?.id && (
                                <button
                                  onClick={() => handleDeleteStaff(staf)}
                                  title={dict.staffManagement.actions.delete}
                                  className="px-2 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-600 hover:text-white text-[11px] font-bold transition-colors"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ➕ MODAL: ADD NEW STAFF */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-xs text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{dict.modals.addStaff.title}</h3>
              <button onClick={() => setIsAddStaffOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-base">✕</button>
            </div>

            {addStaffError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl font-medium">
                ⚠️ {addStaffError}
              </div>
            )}

            <form onSubmit={handleAddStaff} className="space-y-3.5">
              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">{dict.modals.addStaff.fullName}</label>
                <input
                  type="text"
                  required
                  placeholder={dict.modals.addStaff.fullNamePlaceholder}
                  value={newStaffFullName}
                  onChange={(e) => setNewStaffFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">{dict.modals.addStaff.username}</label>
                <input
                  type="text"
                  required
                  placeholder={dict.modals.addStaff.usernamePlaceholder}
                  value={newStaffUsername}
                  onChange={(e) => setNewStaffUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">{dict.modals.addStaff.email}</label>
                <input
                  type="email"
                  placeholder={dict.modals.addStaff.emailPlaceholder}
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">{dict.modals.addStaff.initialPassword}</label>
                <input
                  type="password"
                  required
                  placeholder={dict.modals.addStaff.initialPasswordPlaceholder}
                  value={newStaffPassword}
                  onChange={(e) => setNewStaffPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">{dict.modals.addStaff.role}</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs focus:ring-2 focus:ring-red-600"
                >
                  <option value="STAFF">STAFF / OPERATOR</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="SUPER_ADMIN">SUPER ADMIN</option>
                  <option value="AGENT">AGENT</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200"
                >
                  {dict.modals.addStaff.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={addStaffSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold shadow-md shadow-red-600/20 hover:from-red-700 hover:to-red-800 disabled:opacity-50"
                >
                  {addStaffSubmitting ? dict.modals.addStaff.submittingBtn : dict.modals.addStaff.submitBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✏️ MODAL: EDIT STAFF DETAILS & ROLE */}
      {editTargetUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-xs text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{dict.modals.editStaff.title}</h3>
              <button onClick={() => setEditTargetUser(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-base">✕</button>
            </div>

            {editError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl font-medium">
                ⚠️ {editError}
              </div>
            )}

            <form onSubmit={handleUpdateStaff} className="space-y-3.5">
              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">{dict.modals.editStaff.fullName}</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">{dict.modals.editStaff.email}</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">{dict.modals.editStaff.role}</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs focus:ring-2 focus:ring-red-600"
                >
                  <option value="STAFF">STAFF / OPERATOR</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="SUPER_ADMIN">SUPER ADMIN</option>
                  <option value="AGENT">AGENT</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">{dict.modals.editStaff.accountStatus}</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="editActive"
                      checked={editActive === true}
                      onChange={() => setEditActive(true)}
                      className="accent-red-600"
                    />
                    <span>{dict.modals.editStaff.active}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="editActive"
                      checked={editActive === false}
                      onChange={() => setEditActive(false)}
                      className="accent-red-600"
                    />
                    <span>{dict.modals.editStaff.inactive}</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditTargetUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200"
                >
                  {dict.modals.editStaff.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold shadow-md shadow-red-600/20 hover:from-red-700 hover:to-red-800 disabled:opacity-50"
                >
                  {editSubmitting ? dict.modals.editStaff.submittingBtn : dict.modals.editStaff.submitBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔑 MODAL: RESET STAFF PASSWORD */}
      {resetTargetUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-xs text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{dict.modals.resetPassword.title}</h3>
                <p className="text-slate-400 text-[11px]">
                  {dict.modals.resetPassword.forUser.replace('{name}', resetTargetUser.fullName).replace('{username}', resetTargetUser.username)}
                </p>
              </div>
              <button onClick={() => setResetTargetUser(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-base">✕</button>
            </div>

            {resetError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl font-medium">
                ⚠️ {resetError}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">{dict.modals.resetPassword.newPassword}</label>
                <input
                  type="password"
                  required
                  placeholder={dict.modals.resetPassword.newPasswordPlaceholder}
                  value={adminResetPass}
                  onChange={(e) => setAdminResetPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200"
                >
                  {dict.modals.resetPassword.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold shadow-md shadow-red-600/20 hover:from-red-700 hover:to-red-800 disabled:opacity-50"
                >
                  {resetSubmitting ? dict.modals.resetPassword.submittingBtn : dict.modals.resetPassword.submitBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
