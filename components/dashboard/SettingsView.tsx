'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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

type TabType = 'staff' | 'profile' | 'rbac';

export function SettingsView({ initialLang = 'en' }: SettingsViewProps) {
  // Language State - Default Strictly to English 'en'
  const [lang, setLang] = useState<'en' | 'ms'>(initialLang);
  const [activeTab, setActiveTab] = useState<TabType>('staff');

  useEffect(() => {
    if (initialLang) {
      setLang(initialLang);
    }
  }, [initialLang]);

  const handleLangToggle = (newLang: 'en' | 'ms') => {
    setLang(newLang);
    localStorage.setItem('lc_lang', newLang);
  };

  const dict = lang === 'ms' ? msDictionary.settings : enDictionary.settings;

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [staffList, setStaffList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'SUPER_ADMIN' | 'MANAGER' | 'STAFF' | 'AGENT'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

      // 2. Get Staff list with no-store cache control
      const staffRes = await fetch('/api/auth/users', { cache: 'no-store' });
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

  // Filtered & Paginated Staff Calculations
  const filteredStaff = useMemo(() => {
    return staffList.filter((user) => {
      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        user.fullName.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        (user.email && user.email.toLowerCase().includes(query)) ||
        user.role.toLowerCase().includes(query);

      // Role match
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

      // Status match
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && user.isActive) ||
        (statusFilter === 'INACTIVE' && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [staffList, searchQuery, roleFilter, statusFilter]);

  // Metric counts
  const totalCount = staffList.length;
  const activeCount = staffList.filter((u) => u.isActive).length;
  const agentCount = staffList.filter((u) => u.role === 'AGENT').length;
  const managementCount = staffList.filter((u) => u.role === 'SUPER_ADMIN' || u.role === 'MANAGER').length;

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const paginatedStaff = filteredStaff.slice(startIndex, startIndex + itemsPerPage);

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
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            SUPER ADMIN
          </span>
        );
      case 'MANAGER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            MANAGER
          </span>
        );
      case 'STAFF':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            STAFF / OPERATOR
          </span>
        );
      case 'AGENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            FIELD AGENT
          </span>
        );
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{role}</span>;
    }
  };

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn pb-16">
      {/* 📄 TOP HEADER & LANGUAGE SWITCHER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-red-700 text-white flex items-center justify-center font-black text-sm shadow-md shadow-red-600/30">
              ⚙️
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {dict.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {dict.subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 🌐 Clean Two-Language Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
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
            <div className="flex items-center gap-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1.5 px-3 rounded-2xl shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-red-700 text-white flex items-center justify-center font-black text-xs shadow-md shadow-red-600/25">
                {currentUser.fullName.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{currentUser.fullName}</div>
                <div className="mt-0.5">{getRoleBadge(currentUser.role)}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🧭 NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto select-none">
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-extrabold rounded-t-2xl border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'staff'
              ? 'border-red-600 text-red-600 bg-red-50/50 dark:bg-red-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/40'
          }`}
        >
          <span>👥</span>
          <span>{dict.tabs?.staff || 'Staff & Agent Access Directory'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'staff' ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}>
            {staffList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-extrabold rounded-t-2xl border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-red-600 text-red-600 bg-red-50/50 dark:bg-red-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/40'
          }`}
        >
          <span>👤</span>
          <span>{dict.tabs?.profile || 'My Profile & Security'}</span>
        </button>

        <button
          onClick={() => setActiveTab('rbac')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-extrabold rounded-t-2xl border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'rbac'
              ? 'border-red-600 text-red-600 bg-red-50/50 dark:bg-red-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/40'
          }`}
        >
          <span>🛡️</span>
          <span>{dict.tabs?.rbac || 'Access Permissions (RBAC)'}</span>
        </button>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 👥 TAB 1: ENTERPRISE STAFF & AGENT DIRECTORY                         */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'staff' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 📊 KPI SUMMARY CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {dict.metrics?.totalPersonnel || 'Total Personnel'}
                </span>
                <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs">👥</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
                {totalCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">All registered accounts</p>
            </div>

            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {dict.metrics?.activePersonnel || 'Active Accounts'}
                </span>
                <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs">🟢</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                {activeCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Enabled & authorized</p>
            </div>

            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {dict.metrics?.fieldAgents || 'Field Agents'}
                </span>
                <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs">🎯</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                {agentCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Recruitment & form auditors</p>
            </div>

            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {dict.metrics?.management || 'Admins & Managers'}
                </span>
                <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 text-xs">🛡️</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 mt-2">
                {managementCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Executive & management tier</p>
            </div>
          </div>

          {/* 🔍 FILTER & ACTION TOOLBAR */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder={dict.filters?.searchPlaceholder || 'Search by name, username, email, or role...'}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-600 transition-all placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Role & Status Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="ALL">{dict.filters?.allRoles || 'All Roles'} ({staffList.length})</option>
                  <option value="SUPER_ADMIN">Super Admin ({staffList.filter(u => u.role === 'SUPER_ADMIN').length})</option>
                  <option value="MANAGER">Manager ({staffList.filter(u => u.role === 'MANAGER').length})</option>
                  <option value="STAFF">Staff / Operator ({staffList.filter(u => u.role === 'STAFF').length})</option>
                  <option value="AGENT">Field Agent ({staffList.filter(u => u.role === 'AGENT').length})</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="ALL">{dict.filters?.allStatuses || 'All Statuses'}</option>
                  <option value="ACTIVE">{dict.filters?.activeOnly || 'Active Only'}</option>
                  <option value="INACTIVE">{dict.filters?.inactiveOnly || 'Inactive Only'}</option>
                </select>

                {isSuperAdmin && (
                  <button
                    onClick={() => setIsAddStaffOpen(true)}
                    className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-bold text-xs shadow-md shadow-red-600/30 transition-all flex items-center gap-2 ml-auto"
                  >
                    <span>➕</span>
                    <span>{dict.staffManagement.addStaffBtn}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Filter Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Quick Filter:</span>
              {[
                { label: 'All', value: 'ALL' },
                { label: 'Agents', value: 'AGENT' },
                { label: 'Staff', value: 'STAFF' },
                { label: 'Managers', value: 'MANAGER' },
                { label: 'Super Admins', value: 'SUPER_ADMIN' },
              ].map((pill) => (
                <button
                  key={pill.value}
                  onClick={() => {
                    setRoleFilter(pill.value as any);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    roleFilter === pill.value
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* 📋 PAGINATED STAFF DIRECTORY TABLE */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-16 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-semibold">{dict.staffManagement.loading}</p>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <div className="text-4xl">🔍</div>
                <div className="font-extrabold text-sm text-slate-700 dark:text-slate-300">
                  {dict.filters?.noMatching || 'No personnel matching your search'}
                </div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try adjusting your search query or reset role filters to view all staff records.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setRoleFilter('ALL');
                    setStatusFilter('ALL');
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3.5 px-5">Personnel & Account</th>
                        <th className="py-3.5 px-4">{dict.staffManagement.table.role}</th>
                        <th className="py-3.5 px-4 text-center">{dict.staffManagement.table.status}</th>
                        <th className="py-3.5 px-4">{dict.staffManagement.table.lastLogin}</th>
                        {isSuperAdmin && <th className="py-3.5 px-5 text-right">{dict.staffManagement.table.actions}</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                      {paginatedStaff.map((staf) => (
                        <tr key={staf.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-slate-800 dark:text-slate-200 text-xs shadow-inner">
                                {staf.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                                  {staf.fullName}
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                  <span className="font-mono text-slate-600 dark:text-slate-400">@{staf.username}</span>
                                  {staf.email && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate max-w-[200px]">{staf.email}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {getRoleBadge(staf.role)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                staf.isActive
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${staf.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {staf.isActive ? dict.staffManagement.statusActive : dict.staffManagement.statusInactive}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                            {staf.lastLogin ? formatDateToDDMMYYYY(staf.lastLogin) : dict.staffManagement.table.never}
                          </td>
                          {isSuperAdmin && (
                            <td className="py-3.5 px-5 text-right">
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
                                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 text-xs font-bold transition-all shadow-sm"
                                >
                                  ✏️ {dict.staffManagement.actions.edit}
                                </button>
                                <button
                                  onClick={() => {
                                    setResetTargetUser(staf);
                                    setAdminResetPass('');
                                  }}
                                  title={dict.staffManagement.actions.resetPass}
                                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 text-xs font-bold transition-all shadow-sm"
                                >
                                  🔑 {dict.staffManagement.actions.resetPass}
                                </button>
                                {staf.id !== currentUser?.id && (
                                  <button
                                    onClick={() => handleDeleteStaff(staf)}
                                    title={dict.staffManagement.actions.delete}
                                    className="p-1.5 px-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-600 hover:text-white text-xs font-bold transition-all shadow-sm"
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

                {/* 📄 PAGINATION CONTROLS */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span>
                      {dict.filters?.showing
                        ?.replace('{start}', String(filteredStaff.length === 0 ? 0 : startIndex + 1))
                        ?.replace('{end}', String(Math.min(startIndex + itemsPerPage, filteredStaff.length)))
                        ?.replace('{total}', String(filteredStaff.length)) ||
                        `Showing ${startIndex + 1} to ${Math.min(startIndex + itemsPerPage, filteredStaff.length)} of ${filteredStaff.length} personnel`}
                    </span>
                    <div className="flex items-center gap-1.5 ml-2">
                      <span className="text-[11px] font-semibold">{dict.filters?.perPage || 'Per page'}:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={validCurrentPage <= 1}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold disabled:opacity-30 transition-all hover:border-red-600"
                    >
                      «
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={validCurrentPage <= 1}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold disabled:opacity-30 transition-all hover:border-red-600"
                    >
                      {dict.filters?.prev || 'Previous'}
                    </button>

                    <span className="px-3 py-1.5 font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800 rounded-lg">
                      {validCurrentPage} / {totalPages}
                    </span>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={validCurrentPage >= totalPages}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold disabled:opacity-30 transition-all hover:border-red-600"
                    >
                      {dict.filters?.next || 'Next'}
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={validCurrentPage >= totalPages}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold disabled:opacity-30 transition-all hover:border-red-600"
                    >
                      »
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 👤 TAB 2: MY PROFILE & CHANGE PASSWORD                              */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-200">
          {/* User Profile Card */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-red-600 to-red-700 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-red-600/30">
                {currentUser?.fullName.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">{currentUser?.fullName}</h2>
                <div className="text-xs text-slate-500 font-mono mt-0.5">@{currentUser?.username}</div>
                <div className="mt-2">{currentUser && getRoleBadge(currentUser.role)}</div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Account ID</span>
                <span className="font-mono text-slate-900 dark:text-white text-[11px]">{currentUser?.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Email Address</span>
                <span className="font-semibold text-slate-900 dark:text-white">{currentUser?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Account Status</span>
                <span className="text-emerald-600 font-bold">🟢 Active & Verified</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 font-medium">Last Login</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {currentUser?.lastLogin ? formatDateToDDMMYYYY(currentUser.lastLogin) : 'Current Session'}
                </span>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center font-bold">
                🔒
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{dict.changePassword.title}</h3>
                <p className="text-xs text-slate-500">{dict.changePassword.subtitle}</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
              {passMessage && (
                <div
                  className={`p-3.5 rounded-2xl font-semibold ${
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
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-red-600 pr-10"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-red-600 pr-10"
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
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-red-600"
                />
              </div>

              <button
                type="submit"
                disabled={passSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {passSubmitting ? dict.changePassword.submittingBtn : dict.changePassword.submitBtn}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 🛡️ TAB 3: ACCESS PERMISSIONS MATRIX (RBAC)                           */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'rbac' && (
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">{dict.rbacMatrix.title}</h2>
            <p className="text-xs text-slate-500 mt-1">Hierarchical Role-Based Access Control configuration & capability matrix.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-red-700 dark:text-red-300 font-black text-sm">SUPER_ADMIN</strong>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white">Tier 1 • Root</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {dict.rbacMatrix.superAdmin.replace('SUPER_ADMIN: ', '')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-purple-700 dark:text-purple-300 font-black text-sm">MANAGER</strong>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-600 text-white">Tier 2 • Executive</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {dict.rbacMatrix.manager.replace('MANAGER: ', '')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-blue-700 dark:text-blue-300 font-black text-sm">STAFF / OPERATOR</strong>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white">Tier 3 • Operations</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {dict.rbacMatrix.staff.replace('STAFF / OPERATOR: ', '')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-emerald-700 dark:text-emerald-300 font-black text-sm">AGENT</strong>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white">Tier 4 • Field</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {dict.rbacMatrix.agent.replace('AGENT: ', '')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 🚀 MODAL 1: ADD NEW STAFF / AGENT                                    */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {isAddStaffOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                    ➕
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {dict.modals.addStaff.title}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddStaffOpen(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {addStaffError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 text-xs font-semibold border border-red-200 dark:border-red-800">
                  ⚠️ {addStaffError}
                </div>
              )}

              <form onSubmit={handleAddStaff} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {dict.modals.addStaff.fullName}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={dict.modals.addStaff.fullNamePlaceholder}
                    value={newStaffFullName}
                    onChange={(e) => setNewStaffFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {dict.modals.addStaff.username}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={dict.modals.addStaff.usernamePlaceholder}
                    value={newStaffUsername}
                    onChange={(e) => setNewStaffUsername(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {dict.modals.addStaff.email}
                  </label>
                  <input
                    type="email"
                    placeholder={dict.modals.addStaff.emailPlaceholder}
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {dict.modals.addStaff.initialPassword}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder={dict.modals.addStaff.initialPasswordPlaceholder}
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {dict.modals.addStaff.role}
                  </label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-red-600"
                  >
                    <option value="AGENT">AGENT (Field Agent / Borang Audit)</option>
                    <option value="STAFF">STAFF (Operations / Submission Review)</option>
                    <option value="MANAGER">MANAGER (Financials & Approvals)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Full Root Authority)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddStaffOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    {dict.modals.addStaff.cancelBtn}
                  </button>
                  <button
                    type="submit"
                    disabled={addStaffSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold shadow-md shadow-red-600/30 disabled:opacity-50"
                  >
                    {addStaffSubmitting ? dict.modals.addStaff.submittingBtn : dict.modals.addStaff.submitBtn}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ✏️ MODAL 2: EDIT STAFF                                               */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {editTargetUser &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {dict.modals.editStaff.title}
                </h3>
                <button
                  onClick={() => setEditTargetUser(null)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {editError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 text-xs font-semibold border border-red-200 dark:border-red-800">
                  ⚠️ {editError}
                </div>
              )}

              <form onSubmit={handleUpdateStaff} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {dict.modals.editStaff.fullName}
                  </label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {dict.modals.editStaff.email}
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {dict.modals.editStaff.role}
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-red-600"
                  >
                    <option value="AGENT">AGENT</option>
                    <option value="STAFF">STAFF</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {dict.modals.editStaff.accountStatus}
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                      <input
                        type="radio"
                        name="activeStatus"
                        checked={editActive === true}
                        onChange={() => setEditActive(true)}
                        className="text-red-600 focus:ring-red-600"
                      />
                      <span className="text-emerald-600 font-extrabold">🟢 {dict.modals.editStaff.active}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                      <input
                        type="radio"
                        name="activeStatus"
                        checked={editActive === false}
                        onChange={() => setEditActive(false)}
                        className="text-red-600 focus:ring-red-600"
                      />
                      <span className="text-slate-500 font-extrabold">⚪ {dict.modals.editStaff.inactive}</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditTargetUser(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    {dict.modals.editStaff.cancelBtn}
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold shadow-md shadow-red-600/30 disabled:opacity-50"
                  >
                    {editSubmitting ? dict.modals.editStaff.submittingBtn : dict.modals.editStaff.submitBtn}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 🔑 MODAL 3: RESET PASSWORD                                           */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {resetTargetUser &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {dict.modals.resetPassword.title}
                </h3>
                <button
                  onClick={() => setResetTargetUser(null)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 font-semibold">
                👤 {dict.modals.resetPassword.forUser.replace('{name}', resetTargetUser.fullName).replace('{username}', resetTargetUser.username)}
              </div>

              {resetError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 text-xs font-semibold border border-red-200 dark:border-red-800">
                  ⚠️ {resetError}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {dict.modals.resetPassword.newPassword}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder={dict.modals.resetPassword.newPasswordPlaceholder}
                    value={adminResetPass}
                    onChange={(e) => setAdminResetPass(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setResetTargetUser(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    {dict.modals.resetPassword.cancelBtn}
                  </button>
                  <button
                    type="submit"
                    disabled={resetSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold shadow-md shadow-red-600/30 disabled:opacity-50"
                  >
                    {resetSubmitting ? dict.modals.resetPassword.submittingBtn : dict.modals.resetPassword.submitBtn}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
