'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import enDictionary from '../../locales/en.json';
import msDictionary from '../../locales/ms.json';

interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  department?: string;
  position?: string;
  permissions?: string[];
  role?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
}

interface SettingsViewProps {
  lang?: 'en' | 'ms';
  initialLang?: 'en' | 'ms';
  onLangChange?: (lang: 'en' | 'ms') => void;
}

type TabType = 'staff' | 'profile';

export const STANDARD_DEPARTMENTS = [
  'Executive Management',
  'Finance & Accounts',
  'Operations & Reconciliation',
  'Field Recruitment',
  'IT & Systems Administration',
  'Customer Support & Logistics',
];

export function SettingsView({ lang: propLang, initialLang = 'en', onLangChange }: SettingsViewProps) {
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>(propLang || initialLang);
  const [activeTab, setActiveTab] = useState<TabType>('staff');

  // React to prop changes from Parent / Sidebar
  useEffect(() => {
    if (propLang && propLang !== currentLang) {
      setCurrentLang(propLang);
    }
  }, [propLang]);

  // Synchronize language toggling globally
  const handleLangToggle = (newLang: 'en' | 'ms') => {
    setCurrentLang(newLang);
    localStorage.setItem('lc_lang', newLang);
    if (onLangChange) {
      onLangChange(newLang);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lc_lang_changed', { detail: newLang }));
    }
  };

  const isMs = currentLang === 'ms';
  const dict = isMs ? msDictionary.settings : enDictionary.settings;

  // Localized Permissions Definition
  const permissionsList = useMemo(() => [
    {
      key: 'dashboard:view',
      label: isMs ? '📊 Lihat Papan Pemuka & Lejar Cawangan' : '📊 View Dashboard & Storefront Ledger',
      desc: isMs ? 'Boleh melihat pesanan harian & ringkasan metrik' : 'Can view daily orders & summary metrics',
    },
    {
      key: 'analytics:view',
      label: isMs ? '📈 Lihat Analitik Margin & Kewangan' : '📈 View Margin & Financial Analytics',
      desc: isMs ? 'Boleh melihat untung kasar & pecahan hasil' : 'Can view gross profit & revenue breakdown',
    },
    {
      key: 'reconciliation:process',
      label: isMs ? '💰 Proses Rekonsiliasi Pesanan' : '💰 Process Order Reconciliations',
      desc: isMs ? 'Boleh membuat rekonsiliasi pesanan & pelarasan harga' : 'Can perform order reconciliations & adjustments',
    },
    {
      key: 'invoices:generate',
      label: isMs ? '🧾 Jana Penyata Invois Peniaga' : '🧾 Generate Merchant Invoices',
      desc: isMs ? 'Boleh mencipta invois & memuat turun PDF' : 'Can create billing invoices & download PDFs',
    },
    {
      key: 'products:edit',
      label: isMs ? '🏷️ Kemaskini Harga Asas Produk' : '🏷️ Edit Product Base Prices',
      desc: isMs ? 'Boleh mengemaskini lejar harga & harga jangkaan Grab' : 'Can update price ledger & Grab expected prices',
    },
    {
      key: 'forms:submit',
      label: isMs ? '📝 Hantar Borang & Senarai Semak' : '📝 Submit Checklists & Agent Forms',
      desc: isMs ? 'Boleh mengisi & menghantar borang pendaftaran' : 'Can fill & submit recruitment forms',
    },
    {
      key: 'forms:review',
      label: isMs ? '📋 Semak & Luluskan Pendaftaran' : '📋 Review & Audit Registrations',
      desc: isMs ? 'Boleh menyemak & meluluskan pendaftaran peniaga' : 'Can review & approve merchant registrations',
    },
    {
      key: 'users:manage',
      label: isMs ? '👥 Urus Staf & Hak Akses' : '👥 Manage Staff & Permissions',
      desc: isMs ? 'Boleh menambah pengguna & menetapkan kebenaran' : 'Can create users & grant permissions',
    },
    {
      key: 'admin:all',
      label: isMs ? '👑 Akses Penuh Pentadbir Utama' : '👑 Full Root Administrator (All Access)',
      desc: isMs ? 'Akses master tanpa sekatan' : 'Full unrestricted master access',
    },
  ], [isMs]);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [staffList, setStaffList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSubmitting, setPassSubmitting] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Staff Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFullName, setAddFullName] = useState('');
  const [addUsername, setAddUsername] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addDepartment, setAddDepartment] = useState('Operations & Reconciliation');
  const [addPosition, setAddPosition] = useState('Staff Member');
  const [addPassword, setAddPassword] = useState('');
  const [addPermissions, setAddPermissions] = useState<string[]>(['dashboard:view', 'forms:submit']);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit Staff Modal
  const [editTarget, setEditTarget] = useState<UserProfile | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDepartment, setEditDepartment] = useState('Operations & Reconciliation');
  const [editPosition, setEditPosition] = useState('Staff Member');
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editActive, setEditActive] = useState(true);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  // Reset Password Modal
  const [resetTarget, setResetTarget] = useState<UserProfile | null>(null);
  const [resetPass, setResetPass] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState('');

  const isIT = (currentUser?.department || '').trim() === 'IT & Systems Administration' || (currentUser?.department || '').trim() === 'IT Department';
  const isIntern = (currentUser?.position || '').toLowerCase().includes('intern');
  const canManageStaff = Boolean((isIT && !isIntern) || currentUser?.permissions?.includes('admin:all') || currentUser?.permissions?.includes('users:manage') || currentUser?.role === 'SUPER_ADMIN');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.success && meData.user) {
        setCurrentUser(meData.user);

        const userIsIT = (meData.user.department || '').trim() === 'IT & Systems Administration' || (meData.user.department || '').trim() === 'IT Department';
        const userIsIntern = (meData.user.position || '').toLowerCase().includes('intern');
        const userCanManage = Boolean((userIsIT && !userIsIntern) || meData.user.permissions?.includes('admin:all') || meData.user.permissions?.includes('users:manage') || meData.user.role === 'SUPER_ADMIN');

        if (!userCanManage) {
          setActiveTab('profile');
        } else {
          const staffRes = await fetch('/api/auth/users', { cache: 'no-store' });
          const staffData = await staffRes.json();
          if (staffData.success && Array.isArray(staffData.users)) {
            setStaffList(staffData.users);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered list
  const filteredUsers = useMemo(() => {
    return staffList.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q)) ||
        (u.position && u.position.toLowerCase().includes(q));

      const matchDept = departmentFilter === 'ALL' || (u.department || '').trim() === departmentFilter;

      return matchSearch && matchDept;
    });
  }, [staffList, searchQuery, departmentFilter]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);
    if (newPassword !== confirmPassword) {
      setPassMessage({
        type: 'error',
        text: isMs ? 'Kata laluan baharu dan pengesahan tidak sepadan.' : 'New password and confirmation do not match.',
      });
      return;
    }
    if (newPassword.length < 8) {
      setPassMessage({
        type: 'error',
        text: isMs ? 'Kata laluan mesti sekurang-kurangnya 8 aksara.' : 'Password must be at least 8 characters long.',
      });
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
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to change password');
      setPassMessage({
        type: 'success',
        text: isMs ? 'Kata laluan berjaya dikemaskini!' : 'Password updated successfully!',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassMessage({ type: 'error', text: err.message });
    } finally {
      setPassSubmitting(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSubmitting(true);
    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: addUsername.trim(),
          fullName: addFullName.trim(),
          email: addEmail.trim() || undefined,
          department: addDepartment,
          position: addPosition.trim(),
          permissions: addPermissions,
          password: addPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create user');
      setIsAddModalOpen(false);
      setAddFullName('');
      setAddUsername('');
      setAddEmail('');
      setAddPassword('');
      setAddDepartment('Operations & Reconciliation');
      setAddPosition('Staff Member');
      setAddPermissions(['dashboard:view', 'forms:submit']);
      fetchUsers();
    } catch (err: any) {
      setAddError(err.message);
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditError('');
    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/auth/users/${editTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editFullName.trim(),
          email: editEmail.trim() || null,
          department: editDepartment,
          position: editPosition.trim(),
          permissions: editPermissions,
          isActive: editActive,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update user');
      setEditTarget(null);
      fetchUsers();
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    setResetError('');
    setResetSubmitting(true);
    try {
      const res = await fetch(`/api/auth/users/${resetTarget.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: resetPass }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to reset password');
      alert(isMs ? `Kata laluan untuk ${resetTarget.fullName} berjaya diset semula.` : `Password for ${resetTarget.fullName} reset successfully.`);
      setResetTarget(null);
      setResetPass('');
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    const confirmPrompt = isMs
      ? `Adakah anda pasti ingin memadamkan akaun untuk "${user.fullName}"?`
      : `Are you sure you want to delete account for "${user.fullName}"?`;
    if (!window.confirm(confirmPrompt)) return;
    try {
      const res = await fetch(`/api/auth/users/${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete user');
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const togglePerm = (permKey: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(permKey)) {
      setList(list.filter((k) => k !== permKey));
    } else {
      setList([...list, permKey]);
    }
  };

  const getDeptColor = (dept?: string) => {
    switch (dept) {
      case 'Executive Management':
        return 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300 border-red-300 dark:border-red-800';
      case 'Finance & Accounts':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'Field Recruitment':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'IT & Systems Administration':
        return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/70 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300 dark:border-blue-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-fadeIn">
      {/* 🧭 HEADER & NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-red-600/30">
            👥
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isMs ? 'Pengurusan Staf & Kawalan Akses' : 'Staff & Access Management'}
            </h1>
            <p className="text-xs text-slate-500">
              {isMs
                ? 'Urus ahli pasukan mengikut Jabatan, Jawatan, dan Kebenaran Khusus.'
                : 'Manage team members by Department, Job Title, and Custom Permissions.'}
            </p>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-3">
          {/* Synchronized 2-Button Language Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-sm">
            <button
              onClick={() => handleLangToggle('en')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                currentLang === 'en'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🇬🇧</span>
              <span>EN</span>
            </button>
            <button
              onClick={() => handleLangToggle('ms')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                currentLang === 'ms'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🇲🇾</span>
              <span>BM</span>
            </button>
          </div>

          {canManageStaff && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-bold text-xs shadow-md shadow-red-600/30 transition-all flex items-center gap-2"
            >
              <span>➕</span>
              <span>{isMs ? 'Tambah Staf Baharu' : 'Add New Staff'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 🧭 SIMPLE TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        {canManageStaff && (
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-5 py-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'staff'
                ? 'border-red-600 text-red-600 bg-red-50/40 dark:bg-red-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>👥 {isMs ? 'Semua Staf & Ejen' : 'All Staff & Agents'}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {staffList.length}
            </span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-red-600 text-red-600 bg-red-50/40 dark:bg-red-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>🔒 {isMs ? 'Tukar Kata Laluan' : 'Change Password'}</span>
        </button>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 👥 TAB 1: ALL STAFF LIST                                             */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {canManageStaff && activeTab === 'staff' && (
        <div className="space-y-4">
          {/* Simple Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-[#0d1117] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1 w-full">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
              <input
                type="text"
                placeholder={
                  isMs
                    ? 'Cari staf mengikut nama, pengguna, jabatan, atau jawatan...'
                    : 'Search staff by name, username, department, or job title...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="ALL">
                {isMs ? 'Semua Jabatan' : 'All Departments'} ({staffList.length})
              </option>
              {STANDARD_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept} ({staffList.filter((u) => (u.department || '').trim() === dept).length})
                </option>
              ))}
            </select>
          </div>

          {/* Clean Staff Table */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">
                {isMs ? 'Memuatkan rekod staf...' : 'Loading staff records...'}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <div className="text-3xl">👥</div>
                <div className="font-bold text-sm text-slate-700 dark:text-slate-300">
                  {isMs ? 'Tiada staf ditemui' : 'No staff found'}
                </div>
                <p className="text-xs text-slate-400">
                  {isMs
                    ? 'Klik "Tambah Staf Baharu" di atas untuk mendaftarkan ahli pasukan pertama anda.'
                    : 'Click "Add New Staff" above to create your first team member.'}
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[900px] text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3.5 px-5 whitespace-nowrap">
                      {isMs ? 'Nama & Pengguna' : 'Name & Username'}
                    </th>
                    <th className="py-3.5 px-4 whitespace-nowrap">
                      {isMs ? 'Jabatan' : 'Department'}
                    </th>
                    <th className="py-3.5 px-4 whitespace-nowrap">
                      {isMs ? 'Jawatan / Posisi' : 'Job Title / Position'}
                    </th>
                    <th className="py-3.5 px-4 whitespace-nowrap">
                      {isMs ? 'Hak Akses' : 'Permissions'}
                    </th>
                    <th className="py-3.5 px-4 text-center whitespace-nowrap">
                      {isMs ? 'Status' : 'Status'}
                    </th>
                    <th className="py-3.5 px-5 text-right whitespace-nowrap">
                      {isMs ? 'Tindakan' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredUsers.map((user) => {
                    const perms = Array.isArray(user.permissions) ? user.permissions : [];
                    const isIT = user.department === 'IT & Systems Administration' || user.department === 'IT Department';
                    const isIntern = user.position?.toLowerCase().includes('intern');
                    const isFullAccess = (isIT && !isIntern) || perms.includes('admin:all') || user.role === 'SUPER_ADMIN';

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="py-4 px-5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-xs flex-shrink-0">
                              {user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm whitespace-nowrap">
                                {user.fullName}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                                @{user.username} {user.email ? `• ${user.email}` : ''}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-extrabold border ${getDeptColor(user.department)}`}>
                            {user.department || 'Operations'}
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap font-bold text-slate-800 dark:text-slate-200">
                          {user.position || 'Staff Member'}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {isFullAccess ? (
                            <span className="inline-flex items-center whitespace-nowrap px-3 py-1 rounded-full bg-red-600 text-white font-bold text-[10px] shadow-sm">
                              👑 {isMs ? 'Akses Penuh' : 'Full Access'} {isIT && !isIntern ? '(IT)' : ''}
                            </span>
                          ) : perms.length === 0 ? (
                            <span className="text-slate-400 italic text-[11px] whitespace-nowrap">
                              {isMs ? 'Tiada kebenaran diberikan' : 'No permissions granted'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                              {perms.length} {isMs ? 'Kebenaran Aktif' : 'Permissions Active'}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold ${
                              user.isActive
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {user.isActive ? (isMs ? 'Aktif' : 'Active') : (isMs ? 'Nyahaktif' : 'Inactive')}
                          </span>
                        </td>

                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditTarget(user);
                                setEditFullName(user.fullName);
                                setEditEmail(user.email || '');
                                setEditDepartment(user.department || 'Operations & Reconciliation');
                                setEditPosition(user.position || 'Staff Member');
                                setEditPermissions(Array.isArray(user.permissions) ? [...user.permissions] : []);
                                setEditActive(user.isActive);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                            >
                              {isMs ? 'Edit' : 'Edit'}
                            </button>
                            <button
                              onClick={() => {
                                setResetTarget(user);
                                setResetPass('');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 hover:text-amber-600 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                            >
                              {isMs ? 'Set Laluan' : 'Reset Pass'}
                            </button>
                            {user.id !== currentUser?.id && (
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="p-1.5 px-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-600 hover:text-white text-red-600 font-bold text-xs transition-colors"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 🔒 TAB 2: CHANGE PASSWORD                                            */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'profile' && (
        <div className="max-w-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1">
            {isMs ? 'Tukar Kata Laluan Anda' : 'Change Your Password'}
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            {isMs
              ? 'Kemaskini kata laluan akaun log masuk peribadi anda.'
              : 'Update your personal login password for Legacy Cuisine portal.'}
          </p>

          <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
            {passMessage && (
              <div
                className={`p-3 rounded-xl font-bold ${
                  passMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {passMessage.text}
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMs ? 'Kata Laluan Semasa' : 'Current Password'}
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMs ? 'Kata Laluan Baharu (min. 8 aksara)' : 'New Password (min. 8 characters)'}
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMs ? 'Sahkan Kata Laluan Baharu' : 'Confirm New Password'}
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={passSubmitting}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {passSubmitting
                ? isMs
                  ? 'Mengemaskini Kata Laluan...'
                  : 'Updating Password...'
                : isMs
                ? 'Simpan Kata Laluan Baharu'
                : 'Save New Password'}
            </button>
          </form>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ➕ MODAL 1: ADD NEW STAFF                                            */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {isAddModalOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  ➕ {isMs ? 'Tambah Staf / Ejen Baharu' : 'Add New Staff / Agent'}
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                  ✕
                </button>
              </div>

              {addError && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold">⚠️ {addError}</div>}

              <form onSubmit={handleAddUser} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isMs ? 'Nama Penuh *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ahmad Razak"
                      value={addFullName}
                      onChange={(e) => setAddFullName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isMs ? 'Nama Pengguna (ID Log Masuk) *' : 'Username (Login ID) *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ahmad_razak"
                      value={addUsername}
                      onChange={(e) => setAddUsername(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isMs ? 'Jabatan *' : 'Department *'}
                    </label>
                    <select
                      value={addDepartment}
                      onChange={(e) => setAddDepartment(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                    >
                      {STANDARD_DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isMs ? 'Jawatan / Posisi *' : 'Job Title / Position *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Field Agent, Accountant"
                      value={addPosition}
                      onChange={(e) => setAddPosition(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isMs ? 'Emel (Pilihan)' : 'Email (Optional)'}
                    </label>
                    <input
                      type="email"
                      placeholder="ahmad@legacycuisine.com"
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isMs ? 'Kata Laluan Awal *' : 'Initial Password *'}
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 8 characters"
                      value={addPassword}
                      onChange={(e) => setAddPassword(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Permissions Checkboxes */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      {isMs ? 'Berikan Hak Akses (Permissions):' : 'Grant Permissions:'}
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setAddPermissions(
                          addPermissions.length === permissionsList.length
                            ? []
                            : permissionsList.map((p) => p.key)
                        )
                      }
                      className="text-red-600 font-bold hover:underline"
                    >
                      {addPermissions.length === permissionsList.length
                        ? isMs
                          ? 'Nyahpilih Semua'
                          : 'Deselect All'
                        : isMs
                        ? 'Pilih Semua'
                        : 'Select All'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {permissionsList.map((p) => {
                      const isChecked = addPermissions.includes(p.key);
                      return (
                        <label
                          key={p.key}
                          className={`flex items-start gap-2 p-2 rounded-xl cursor-pointer transition-all ${
                            isChecked ? 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-sm' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePerm(p.key, addPermissions, setAddPermissions)}
                            className="mt-0.5 rounded text-red-600"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-[11px]">{p.label}</div>
                            <div className="text-[10px] text-slate-400">{p.desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    {isMs ? 'Batal' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={addSubmitting}
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md disabled:opacity-50"
                  >
                    {addSubmitting
                      ? isMs
                        ? 'Mendaftar...'
                        : 'Registering...'
                      : isMs
                      ? 'Daftar Staf'
                      : 'Register Staff'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ✏️ MODAL 2: EDIT STAFF & PERMISSIONS                                 */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {editTarget &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  ✏️ {isMs ? 'Kemaskini Staf:' : 'Edit Staff:'} {editTarget.fullName}
                </h3>
                <button onClick={() => setEditTarget(null)} className="text-slate-400 hover:text-white font-bold">
                  ✕
                </button>
              </div>

              {editError && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold">⚠️ {editError}</div>}

              <form onSubmit={handleUpdateUser} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isMs ? 'Nama Penuh' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isMs ? 'Jabatan' : 'Department'}
                    </label>
                    <select
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                    >
                      {STANDARD_DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isMs ? 'Jawatan / Posisi' : 'Job Title / Position'}
                    </label>
                    <input
                      type="text"
                      required
                      value={editPosition}
                      onChange={(e) => setEditPosition(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isMs ? 'Emel' : 'Email'}
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Status Toggle */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isMs ? 'Status Akaun' : 'Account Status'}
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input
                        type="radio"
                        name="activeStatus"
                        checked={editActive === true}
                        onChange={() => setEditActive(true)}
                      />
                      <span className="text-emerald-600">{isMs ? 'Aktif' : 'Active'}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input
                        type="radio"
                        name="activeStatus"
                        checked={editActive === false}
                        onChange={() => setEditActive(false)}
                      />
                      <span className="text-slate-400">{isMs ? 'Nyahaktif' : 'Inactive'}</span>
                    </label>
                  </div>
                </div>

                {/* Permissions Checkboxes */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      {isMs ? 'Berikan Hak Akses (Permissions):' : 'Grant Permissions:'}
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setEditPermissions(
                          editPermissions.length === permissionsList.length
                            ? []
                            : permissionsList.map((p) => p.key)
                        )
                      }
                      className="text-red-600 font-bold hover:underline"
                    >
                      {editPermissions.length === permissionsList.length
                        ? isMs
                          ? 'Nyahpilih Semua'
                          : 'Deselect All'
                        : isMs
                        ? 'Pilih Semua'
                        : 'Select All'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {permissionsList.map((p) => {
                      const isChecked = editPermissions.includes(p.key);
                      return (
                        <label
                          key={p.key}
                          className={`flex items-start gap-2 p-2 rounded-xl cursor-pointer transition-all ${
                            isChecked ? 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-sm' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePerm(p.key, editPermissions, setEditPermissions)}
                            className="mt-0.5 rounded text-red-600"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-[11px]">{p.label}</div>
                            <div className="text-[10px] text-slate-400">{p.desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditTarget(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    {isMs ? 'Batal' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md disabled:opacity-50"
                  >
                    {editSubmitting
                      ? isMs
                        ? 'Menyimpan...'
                        : 'Saving...'
                      : isMs
                      ? 'Simpan Kemaskini'
                      : 'Save Changes'}
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
      {resetTarget &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  🔑 {isMs ? 'Set Semula Kata Laluan' : 'Reset Password'}
                </h3>
                <button onClick={() => setResetTarget(null)} className="text-slate-400 hover:text-white font-bold">
                  ✕
                </button>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400">
                {isMs ? 'Menetapkan semula kata laluan untuk:' : 'Resetting password for:'}{' '}
                <strong className="text-slate-900 dark:text-white">{resetTarget.fullName}</strong>
              </div>

              {resetError && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold">⚠️ {resetError}</div>}

              <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isMs ? 'Kata Laluan Baharu (min. 8 aksara)' : 'New Password (min. 8 chars)'}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder={isMs ? 'Masukkan kata laluan baharu' : 'Enter new password'}
                    value={resetPass}
                    onChange={(e) => setResetPass(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setResetTarget(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    {isMs ? 'Batal' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={resetSubmitting}
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md disabled:opacity-50"
                  >
                    {resetSubmitting
                      ? isMs
                        ? 'Menetapkan...'
                        : 'Resetting...'
                      : isMs
                      ? 'Set Semula'
                      : 'Reset Password'}
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
