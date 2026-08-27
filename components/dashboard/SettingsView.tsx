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
  department?: string;
  position?: string;
  permissions?: string[];
  role?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
}

interface SettingsViewProps {
  initialLang?: 'en' | 'ms';
}

type TabType = 'staff' | 'profile' | 'rbac';

export const STANDARD_DEPARTMENTS = [
  'Executive Management',
  'Finance & Accounts',
  'Operations & Reconciliation',
  'Field Recruitment',
  'IT & Systems Administration',
  'Customer Support & Logistics',
];

export const AVAILABLE_PERMISSIONS = [
  { key: 'dashboard:view', label: '📊 View Dashboard & Storefront Ledger', desc: 'Can view daily orders & summary metrics' },
  { key: 'analytics:view', label: '📈 View Margin & Financial Analytics', desc: 'Can view gross profit & revenue breakdown' },
  { key: 'reconciliation:process', label: '💰 Process Order Reconciliations', desc: 'Can perform order reconciliations & adjustments' },
  { key: 'invoices:generate', label: '🧾 Generate Merchant Invoices', desc: 'Can create billing invoices & download PDFs' },
  { key: 'products:edit', label: '🏷️ Edit Product Base Prices', desc: 'Can update price ledger & Grab expected prices' },
  { key: 'forms:submit', label: '📝 Submit Checklists & Agent Forms', desc: 'Can fill & submit recruitment forms' },
  { key: 'forms:review', label: '📋 Review & Audit Registrations', desc: 'Can review & approve merchant registrations' },
  { key: 'users:manage', label: '👥 Manage Staff & Permissions', desc: 'Can create users & grant permissions' },
  { key: 'admin:all', label: '👑 Full Root Administrator (All Access)', desc: 'Full unrestricted master access' },
];

export function SettingsView({ initialLang = 'en' }: SettingsViewProps) {
  const [lang, setLang] = useState<'en' | 'ms'>(initialLang);
  const [activeTab, setActiveTab] = useState<TabType>('staff');

  useEffect(() => {
    if (initialLang) setLang(initialLang);
  }, [initialLang]);

  const handleLangToggle = (newLang: 'en' | 'ms') => {
    setLang(newLang);
    localStorage.setItem('lc_lang', newLang);
  };

  const dict = lang === 'ms' ? msDictionary.settings : enDictionary.settings;

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // 1. Current Session
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.success && meData.user) {
        setCurrentUser(meData.user);
      }

      // 2. All Users
      const staffRes = await fetch('/api/auth/users', { cache: 'no-store' });
      const staffData = await staffRes.json();
      if (staffData.success && Array.isArray(staffData.users)) {
        setStaffList(staffData.users);
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

      const matchDept = departmentFilter === 'ALL' || u.department === departmentFilter;

      return matchSearch && matchDept;
    });
  }, [staffList, searchQuery, departmentFilter]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);
    if (newPassword !== confirmPassword) {
      setPassMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setPassMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
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
      setPassMessage({ type: 'success', text: 'Password updated successfully!' });
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
      alert(`Password for ${resetTarget.fullName} reset successfully.`);
      setResetTarget(null);
      setResetPass('');
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (!window.confirm(`Are you sure you want to delete account for "${user.fullName}"?`)) return;
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
              Staff & Access Management
            </h1>
            <p className="text-xs text-slate-500">
              Manage team members by Department, Job Title, and Custom Permissions.
            </p>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => handleLangToggle('en')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                lang === 'en' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => handleLangToggle('ms')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                lang === 'ms' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              BM
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-bold text-xs shadow-md shadow-red-600/30 transition-all flex items-center gap-2"
          >
            <span>➕</span>
            <span>Add New Staff</span>
          </button>
        </div>
      </div>

      {/* 🧭 SIMPLE TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-5 py-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'staff'
              ? 'border-red-600 text-red-600 bg-red-50/40 dark:bg-red-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>👥 All Staff & Agents</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {staffList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-red-600 text-red-600 bg-red-50/40 dark:bg-red-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>🔒 Change Password</span>
        </button>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 👥 TAB 1: ALL STAFF LIST                                             */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          {/* Simple Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-[#0d1117] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1 w-full">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
              <input
                type="text"
                placeholder="Search staff by name, username, department, or job title..."
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
              <option value="ALL">All Departments ({staffList.length})</option>
              {STANDARD_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept} ({staffList.filter((u) => u.department === dept).length})
                </option>
              ))}
            </select>
          </div>

          {/* Clean Staff Table */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading staff records...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <div className="text-3xl">👥</div>
                <div className="font-bold text-sm text-slate-700 dark:text-slate-300">No staff found</div>
                <p className="text-xs text-slate-400">Click "Add New Staff" above to create your first team member.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Name & Username</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Job Title</th>
                    <th className="py-3 px-4">Permissions</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredUsers.map((user) => {
                    const perms = Array.isArray(user.permissions) ? user.permissions : [];
                    const isRoot = perms.includes('admin:all') || user.role === 'SUPER_ADMIN';

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-xs">
                              {user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                                {user.fullName}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                @{user.username} {user.email ? `• ${user.email}` : ''}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getDeptColor(user.department)}`}>
                            {user.department || 'Operations'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                          {user.position || 'Staff Member'}
                        </td>

                        <td className="py-3.5 px-4">
                          {isRoot ? (
                            <span className="px-2.5 py-0.5 rounded-md bg-red-600 text-white font-bold text-[10px]">
                              👑 Full Access (Admin)
                            </span>
                          ) : perms.length === 0 ? (
                            <span className="text-slate-400 italic text-[11px]">No access granted</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                              {perms.length} Permissions Active
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              user.isActive
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
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
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setResetTarget(user);
                                setResetPass('');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 hover:text-amber-600 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                            >
                              Reset Pass
                            </button>
                            {user.id !== currentUser?.id && (
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="p-1 px-2 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-600 hover:text-white text-red-600 font-bold text-xs transition-colors"
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
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1">Change Your Password</h2>
          <p className="text-xs text-slate-500 mb-5">Update your personal login password for Legacy Cuisine portal.</p>

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
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">New Password (min. 8 characters)</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
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
              {passSubmitting ? 'Updating Password...' : 'Save New Password'}
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
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">➕ Add New Staff / Agent</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                  ✕
                </button>
              </div>

              {addError && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold">⚠️ {addError}</div>}

              <form onSubmit={handleAddUser} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
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
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Username (Login ID) *</label>
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
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department *</label>
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
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Job Title / Position *</label>
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
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="ahmad@legacycuisine.com"
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Password *</label>
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
                    <label className="font-bold text-slate-700 dark:text-slate-300">Grant Permissions:</label>
                    <button
                      type="button"
                      onClick={() =>
                        setAddPermissions(
                          addPermissions.length === AVAILABLE_PERMISSIONS.length
                            ? []
                            : AVAILABLE_PERMISSIONS.map((p) => p.key)
                        )
                      }
                      className="text-red-600 font-bold hover:underline"
                    >
                      {addPermissions.length === AVAILABLE_PERMISSIONS.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {AVAILABLE_PERMISSIONS.map((p) => {
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
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addSubmitting}
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md disabled:opacity-50"
                  >
                    {addSubmitting ? 'Registering...' : 'Register Staff'}
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
                  ✏️ Edit Staff: {editTarget.fullName}
                </h3>
                <button onClick={() => setEditTarget(null)} className="text-slate-400 hover:text-white font-bold">
                  ✕
                </button>
              </div>

              {editError && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold">⚠️ {editError}</div>}

              <form onSubmit={handleUpdateUser} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
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
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Job Title / Position</label>
                    <input
                      type="text"
                      required
                      value={editPosition}
                      onChange={(e) => setEditPosition(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
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
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Account Status</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input
                        type="radio"
                        name="activeStatus"
                        checked={editActive === true}
                        onChange={() => setEditActive(true)}
                      />
                      <span className="text-emerald-600">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input
                        type="radio"
                        name="activeStatus"
                        checked={editActive === false}
                        onChange={() => setEditActive(false)}
                      />
                      <span className="text-slate-400">Inactive</span>
                    </label>
                  </div>
                </div>

                {/* Permissions Checkboxes */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Grant Permissions:</label>
                    <button
                      type="button"
                      onClick={() =>
                        setEditPermissions(
                          editPermissions.length === AVAILABLE_PERMISSIONS.length
                            ? []
                            : AVAILABLE_PERMISSIONS.map((p) => p.key)
                        )
                      }
                      className="text-red-600 font-bold hover:underline"
                    >
                      {editPermissions.length === AVAILABLE_PERMISSIONS.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {AVAILABLE_PERMISSIONS.map((p) => {
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
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md disabled:opacity-50"
                  >
                    {editSubmitting ? 'Saving...' : 'Save Changes'}
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
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">🔑 Reset Password</h3>
                <button onClick={() => setResetTarget(null)} className="text-slate-400 hover:text-white font-bold">
                  ✕
                </button>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400">
                Resetting password for: <strong className="text-slate-900 dark:text-white">{resetTarget.fullName}</strong>
              </div>

              {resetError && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold">⚠️ {resetError}</div>}

              <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">New Password (min. 8 chars)</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
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
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetSubmitting}
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md disabled:opacity-50"
                  >
                    {resetSubmitting ? 'Resetting...' : 'Reset Password'}
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
