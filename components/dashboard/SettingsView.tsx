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
  role: 'SUPER_ADMIN' | 'MANAGER' | 'STAFF' | 'AGENT';
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
  {
    key: 'dashboard:view',
    label: '📊 View Storefront Dashboard',
    desc: 'Access to Storefront Reconciliation & Margin Overview',
    category: 'Operations',
  },
  {
    key: 'analytics:view',
    label: '📈 View Margin & Financial Analytics',
    desc: 'Access to Financial Analytics & Gross Margin breakdowns',
    category: 'Finance',
  },
  {
    key: 'reconciliation:process',
    label: '💰 Reconcile Orders & Adjust Base Prices',
    desc: 'Perform Grab order reconciliations & margin adjustments',
    category: 'Operations',
  },
  {
    key: 'invoices:generate',
    label: '🧾 Generate & Approve Merchant Invoices',
    desc: 'Generate merchant billing statements & export invoice PDFs',
    category: 'Finance',
  },
  {
    key: 'products:edit',
    label: '🏷️ Manage Menu Price Ledger',
    desc: 'Edit base restaurant prices & expected Grab prices',
    category: 'Operations',
  },
  {
    key: 'forms:submit',
    label: '📝 Submit Checklists & Agent Forms',
    desc: 'Access to Agent Recruitment & Merchant Checklist forms',
    category: 'Field Agents',
  },
  {
    key: 'forms:review',
    label: '📋 Review & Audit Registrations',
    desc: 'Review, approve, or reject merchant registration submissions',
    category: 'Field Agents',
  },
  {
    key: 'users:manage',
    label: '👥 Manage Personnel & Permissions',
    desc: 'Add/edit staff, assign departments, and grant specific permissions',
    category: 'Administration',
  },
  {
    key: 'admin:all',
    label: '👑 Full Root Administrator Override',
    desc: 'Master permission: bypasses all checks with full authority',
    category: 'Administration',
  },
];

export const PERMISSION_PRESETS = {
  FIELD_AGENT: {
    name: '🎯 Field Recruitment Agent',
    department: 'Field Recruitment',
    position: 'Field Recruitment Agent',
    permissions: ['forms:submit', 'forms:review'],
  },
  OPERATIONS: {
    name: '⚙️ Operations & Reconciliation Specialist',
    department: 'Operations & Reconciliation',
    position: 'Reconciliation Specialist',
    permissions: ['dashboard:view', 'reconciliation:process', 'products:edit', 'forms:review'],
  },
  FINANCE: {
    name: '💼 Finance & Invoicing Lead',
    department: 'Finance & Accounts',
    position: 'Finance Officer',
    permissions: ['dashboard:view', 'analytics:view', 'invoices:generate'],
  },
  EXECUTIVE: {
    name: '👑 Executive / Full Administrator',
    department: 'Executive Management',
    position: 'Managing Director',
    permissions: [
      'admin:all',
      'dashboard:view',
      'analytics:view',
      'reconciliation:process',
      'invoices:generate',
      'products:edit',
      'forms:submit',
      'forms:review',
      'users:manage',
    ],
  },
};

export function SettingsView({ initialLang = 'en' }: SettingsViewProps) {
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
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
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

  // Add Personnel Modal State
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffFullName, setNewStaffFullName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffDepartment, setNewStaffDepartment] = useState('Operations & Reconciliation');
  const [newStaffPosition, setNewStaffPosition] = useState('Staff Member');
  const [newStaffPermissions, setNewStaffPermissions] = useState<string[]>([
    'dashboard:view',
    'forms:submit',
  ]);
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [addStaffSubmitting, setAddStaffSubmitting] = useState(false);
  const [addStaffError, setAddStaffError] = useState('');

  // Reset Password Modal State
  const [resetTargetUser, setResetTargetUser] = useState<UserProfile | null>(null);
  const [adminResetPass, setAdminResetPass] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState('');

  // Edit Personnel Modal State
  const [editTargetUser, setEditTargetUser] = useState<UserProfile | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDepartment, setEditDepartment] = useState('Operations & Reconciliation');
  const [editPosition, setEditPosition] = useState('Staff Member');
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editActive, setEditActive] = useState(true);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetchSessionAndStaff();
  }, []);

  const fetchSessionAndStaff = async () => {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.success && meData.user) {
        setCurrentUser(meData.user);
        localStorage.setItem('lc_user', JSON.stringify(meData.user));
      }

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
      const query = searchQuery.toLowerCase().trim();
      const permsString = (user.permissions || []).join(' ').toLowerCase();

      const matchesSearch =
        !query ||
        user.fullName.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        (user.email && user.email.toLowerCase().includes(query)) ||
        (user.department && user.department.toLowerCase().includes(query)) ||
        (user.position && user.position.toLowerCase().includes(query)) ||
        permsString.includes(query);

      const matchesDepartment =
        departmentFilter === 'ALL' || (user.department || 'Operations') === departmentFilter;

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && user.isActive) ||
        (statusFilter === 'INACTIVE' && !user.isActive);

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [staffList, searchQuery, departmentFilter, statusFilter]);

  // Metric counts
  const totalCount = staffList.length;
  const activeCount = staffList.filter((u) => u.isActive).length;
  const agentCount = staffList.filter(
    (u) =>
      u.department === 'Field Recruitment' ||
      u.position?.toLowerCase().includes('agent') ||
      u.role === 'AGENT'
  ).length;
  const executiveCount = staffList.filter(
    (u) =>
      u.department === 'Executive Management' ||
      u.permissions?.includes('admin:all') ||
      u.role === 'SUPER_ADMIN'
  ).length;

  // Pagination calculations
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
          department: newStaffDepartment.trim(),
          position: newStaffPosition.trim(),
          permissions: newStaffPermissions,
          password: newStaffPassword,
          role:
            newStaffDepartment === 'Executive Management'
              ? 'SUPER_ADMIN'
              : newStaffDepartment === 'Field Recruitment'
              ? 'AGENT'
              : 'STAFF',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to register personnel');
      }

      setIsAddStaffOpen(false);
      setNewStaffUsername('');
      setNewStaffFullName('');
      setNewStaffEmail('');
      setNewStaffDepartment('Operations & Reconciliation');
      setNewStaffPosition('Staff Member');
      setNewStaffPermissions(['dashboard:view', 'forms:submit']);
      setNewStaffPassword('');
      fetchSessionAndStaff();
    } catch (err: any) {
      setAddStaffError(err.message || 'Failed to register personnel');
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
          department: editDepartment.trim(),
          position: editPosition.trim(),
          permissions: editPermissions,
          isActive: editActive,
          role:
            editDepartment === 'Executive Management'
              ? 'SUPER_ADMIN'
              : editDepartment === 'Field Recruitment'
              ? 'AGENT'
              : 'STAFF',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update personnel');
      }

      setEditTargetUser(null);
      fetchSessionAndStaff();
    } catch (err: any) {
      setEditError(err.message || 'Error updating personnel');
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

      const successMsg = dict.modals.resetPassword.successMsg.replace(
        '{name}',
        resetTargetUser.fullName
      );
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
      alert(err.message || 'Error deleting personnel');
    }
  };

  const togglePermission = (
    permKey: string,
    currentList: string[],
    setList: (val: string[]) => void
  ) => {
    if (currentList.includes(permKey)) {
      setList(currentList.filter((k) => k !== permKey));
    } else {
      setList([...currentList, permKey]);
    }
  };

  const applyPreset = (
    presetKey: keyof typeof PERMISSION_PRESETS,
    setDept: (d: string) => void,
    setPos: (p: string) => void,
    setPerms: (p: string[]) => void
  ) => {
    const preset = PERMISSION_PRESETS[presetKey];
    if (preset) {
      setDept(preset.department);
      setPos(preset.position);
      setPerms([...preset.permissions]);
    }
  };

  const getDepartmentBadge = (dept?: string) => {
    const d = dept || 'Operations';
    switch (d) {
      case 'Executive Management':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Executive
          </span>
        );
      case 'Finance & Accounts':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Finance
          </span>
        );
      case 'Field Recruitment':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Field Recruitment
          </span>
        );
      case 'IT & Systems Administration':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-100 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            IT & Systems
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {d}
          </span>
        );
    }
  };

  const isSuperAdmin =
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.permissions?.includes('admin:all') ||
    currentUser?.permissions?.includes('users:manage');

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn pb-16">
      {/* 📄 TOP HEADER & LANGUAGE SWITCHER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-red-700 text-white flex items-center justify-center font-black text-sm shadow-md shadow-red-600/30">
              🏢
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {dict.staffManagement.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {dict.staffManagement.subtitle}
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
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {currentUser.fullName}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold">
                  {currentUser.position || 'Staff Member'}
                </div>
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
          <span>{dict.tabs?.staff || 'Department & Personnel Directory'}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'staff'
                ? 'bg-red-600 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
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
          <span>{dict.tabs?.rbac || 'Permission Capabilities Matrix'}</span>
        </button>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 👥 TAB 1: DEPARTMENT & GRANULAR PERSONNEL DIRECTORY                  */}
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
                <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs">
                  👥
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
                {totalCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Across all company departments</p>
            </div>

            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {dict.metrics?.activePersonnel || 'Active Accounts'}
                </span>
                <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs">
                  🟢
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                {activeCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Authorized with active access</p>
            </div>

            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {dict.metrics?.fieldAgents || 'Field Recruitment'}
                </span>
                <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs">
                  🎯
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                {agentCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Dedicated onboarding agents</p>
            </div>

            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {dict.metrics?.management || 'Executive & Managers'}
                </span>
                <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 text-xs">
                  👑
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 mt-2">
                {executiveCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Management & administrative tier</p>
            </div>
          </div>

          {/* 🔍 FILTER & ACTION TOOLBAR */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder={
                    dict.filters?.searchPlaceholder ||
                    'Search by name, username, department, position, or permission...'
                  }
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

              {/* Department & Status Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={departmentFilter}
                  onChange={(e) => {
                    setDepartmentFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="ALL">
                    {dict.filters?.allDepartments || 'All Departments'} ({staffList.length})
                  </option>
                  {STANDARD_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept} ({staffList.filter((u) => u.department === dept).length})
                    </option>
                  ))}
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
                    <span>{dict.staffManagement.addStaffBtn || 'Add New Personnel'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Department Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Department:
              </span>
              <button
                onClick={() => {
                  setDepartmentFilter('ALL');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  departmentFilter === 'ALL'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              {STANDARD_DEPARTMENTS.map((dept) => (
                <button
                  key={dept}
                  onClick={() => {
                    setDepartmentFilter(dept);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    departmentFilter === dept
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {dept.replace(' & ', '/')}
                </button>
              ))}
            </div>
          </div>

          {/* 📋 PAGINATED PERSONNEL DIRECTORY TABLE */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-16 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-semibold">
                  {dict.staffManagement.loading}
                </p>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <div className="text-4xl">🔍</div>
                <div className="font-extrabold text-sm text-slate-700 dark:text-slate-300">
                  {dict.filters?.noMatching || 'No personnel matching your search or filters'}
                </div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try adjusting your search keywords or reset department filters to view all personnel.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setDepartmentFilter('ALL');
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
                        <th className="py-3.5 px-5">{dict.staffManagement.table.staffName}</th>
                        <th className="py-3.5 px-4">{dict.staffManagement.table.department || 'Department'}</th>
                        <th className="py-3.5 px-4">{dict.staffManagement.table.position || 'Position / Job Title'}</th>
                        <th className="py-3.5 px-4">{dict.staffManagement.table.permissions || 'Granted Permissions'}</th>
                        <th className="py-3.5 px-4 text-center">{dict.staffManagement.table.status}</th>
                        <th className="py-3.5 px-4">{dict.staffManagement.table.lastLogin}</th>
                        {isSuperAdmin && (
                          <th className="py-3.5 px-5 text-right">
                            {dict.staffManagement.table.actions}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                      {paginatedStaff.map((staf) => {
                        const perms = Array.isArray(staf.permissions) ? staf.permissions : [];
                        const isRootAdmin = perms.includes('admin:all') || staf.role === 'SUPER_ADMIN';

                        return (
                          <tr
                            key={staf.id}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                          >
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
                                    <span className="font-mono text-slate-600 dark:text-slate-400">
                                      @{staf.username}
                                    </span>
                                    {staf.email && (
                                      <>
                                        <span>•</span>
                                        <span className="truncate max-w-[180px]">
                                          {staf.email}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              {getDepartmentBadge(staf.department)}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 text-xs">
                              {staf.position || 'Staff Member'}
                            </td>
                            <td className="py-3.5 px-4">
                              {isRootAdmin ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white shadow-sm">
                                  👑 All Permissions (Full Root)
                                </span>
                              ) : perms.length === 0 ? (
                                <span className="text-[11px] text-slate-400 italic">None</span>
                              ) : (
                                <div className="flex flex-wrap gap-1 max-w-[260px]">
                                  {perms.slice(0, 2).map((pKey) => {
                                    const pObj = AVAILABLE_PERMISSIONS.find((x) => x.key === pKey);
                                    return (
                                      <span
                                        key={pKey}
                                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[10px]"
                                      >
                                        {pObj?.label.split(' ')[0]} {pKey.split(':')[0]}
                                      </span>
                                    );
                                  })}
                                  {perms.length > 2 && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[10px]">
                                      +{perms.length - 2} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  staf.isActive
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    staf.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                                  }`}
                                />
                                {staf.isActive
                                  ? dict.staffManagement.statusActive
                                  : dict.staffManagement.statusInactive}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                              {staf.lastLogin
                                ? formatDateToDDMMYYYY(staf.lastLogin)
                                : dict.staffManagement.table.never}
                            </td>
                            {isSuperAdmin && (
                              <td className="py-3.5 px-5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setEditTargetUser(staf);
                                      setEditFullName(staf.fullName);
                                      setEditEmail(staf.email || '');
                                      setEditDepartment(staf.department || 'Operations & Reconciliation');
                                      setEditPosition(staf.position || 'Staff Member');
                                      setEditPermissions(Array.isArray(staf.permissions) ? [...staf.permissions] : []);
                                      setEditActive(staf.isActive);
                                    }}
                                    title={dict.staffManagement.actions.edit}
                                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 text-xs font-bold transition-all shadow-sm"
                                  >
                                    ✏️ {dict.staffManagement.actions.edit || 'Edit'}
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 📄 PAGINATION CONTROLS */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span>
                      {dict.filters?.showing
                        ?.replace(
                          '{start}',
                          String(filteredStaff.length === 0 ? 0 : startIndex + 1)
                        )
                        ?.replace(
                          '{end}',
                          String(Math.min(startIndex + itemsPerPage, filteredStaff.length))
                        )
                        ?.replace('{total}', String(filteredStaff.length)) ||
                        `Showing ${startIndex + 1} to ${Math.min(
                          startIndex + itemsPerPage,
                          filteredStaff.length
                        )} of ${filteredStaff.length} personnel`}
                    </span>
                    <div className="flex items-center gap-1.5 ml-2">
                      <span className="text-[11px] font-semibold">
                        {dict.filters?.perPage || 'Per page'}:
                      </span>
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
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {currentUser?.fullName}
                </h2>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  @{currentUser?.username}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {getDepartmentBadge(currentUser?.department)}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {currentUser?.position || 'Staff Member'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Department</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {currentUser?.department || 'Operations'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Job Title / Position</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {currentUser?.position || 'Staff Member'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Email Address</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {currentUser?.email || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Account Status</span>
                <span className="text-emerald-600 font-bold">🟢 Active & Authorized</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 font-medium">Granted Capabilities</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {currentUser?.permissions?.includes('admin:all') || currentUser?.role === 'SUPER_ADMIN'
                    ? '👑 Root Full Access'
                    : `${currentUser?.permissions?.length || 0} Capabilities Active`}
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
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {dict.changePassword.title}
                </h3>
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
      {/* 🛡️ TAB 3: PERMISSION CAPABILITIES MATRIX (GRANULAR)                   */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'rbac' && (
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {dict.tabs?.rbac || 'Permission Capabilities Matrix'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Every employee or agent can be granted specific permission switches tailored to their job responsibilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AVAILABLE_PERMISSIONS.map((perm) => (
              <div
                key={perm.key}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                    {perm.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {perm.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {perm.desc}
                </p>
                <div className="pt-1">
                  <span className="font-mono text-[9px] text-slate-400">{perm.key}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 🚀 MODAL 1: ADD NEW PERSONNEL (DEPARTMENT & GRANULAR PERMISSIONS)    */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {isAddStaffOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                    ➕
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {dict.modals.addStaff.title || 'Register New Personnel'}
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

              {/* ⚡ Quick Preset Buttons */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  {dict.modals.addStaff.presets || '⚡ Apply Role Preset:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset(
                        'FIELD_AGENT',
                        setNewStaffDepartment,
                        setNewStaffPosition,
                        setNewStaffPermissions
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-all"
                  >
                    🎯 Field Agent
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset(
                        'OPERATIONS',
                        setNewStaffDepartment,
                        setNewStaffPosition,
                        setNewStaffPermissions
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold hover:bg-blue-100 transition-all"
                  >
                    ⚙️ Operations & Reconcile
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset(
                        'FINANCE',
                        setNewStaffDepartment,
                        setNewStaffPosition,
                        setNewStaffPermissions
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold hover:bg-purple-100 transition-all"
                  >
                    💼 Finance & Invoicing
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset(
                        'EXECUTIVE',
                        setNewStaffDepartment,
                        setNewStaffPosition,
                        setNewStaffPermissions
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-bold hover:bg-red-100 transition-all"
                  >
                    👑 Full Admin
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                      {dict.modals.addStaff.department || 'Department *'}
                    </label>
                    <select
                      value={newStaffDepartment}
                      onChange={(e) => setNewStaffDepartment(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-red-600"
                    >
                      {STANDARD_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      {dict.modals.addStaff.position || 'Position / Job Title *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={
                        dict.modals.addStaff.positionPlaceholder ||
                        'e.g. Field Recruitment Agent, Accountant'
                      }
                      value={newStaffPosition}
                      onChange={(e) => setNewStaffPosition(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600"
                    />
                  </div>
                </div>

                {/* 🔒 Granular Permissions Checkboxes */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    {dict.modals.addStaff.permissions || 'Specific Granted Permissions:'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {AVAILABLE_PERMISSIONS.map((perm) => {
                      const isChecked = newStaffPermissions.includes(perm.key);
                      return (
                        <label
                          key={perm.key}
                          className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-sm'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-900/40 border border-transparent'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              togglePermission(
                                perm.key,
                                newStaffPermissions,
                                setNewStaffPermissions
                              )
                            }
                            className="mt-0.5 rounded text-red-600 focus:ring-red-600"
                          />
                          <div>
                            <div className="font-extrabold text-[11px] text-slate-900 dark:text-white">
                              {perm.label}
                            </div>
                            <div className="text-[10px] text-slate-500 leading-tight">
                              {perm.desc}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
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
                    {addStaffSubmitting
                      ? dict.modals.addStaff.submittingBtn
                      : dict.modals.addStaff.submitBtn}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ✏️ MODAL 2: EDIT PERSONNEL (DEPARTMENT & GRANULAR PERMISSIONS)       */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {editTargetUser &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    ✏️
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {dict.modals.editStaff.title || 'Update Personnel & Permissions'}
                  </h3>
                </div>
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

              {/* ⚡ Quick Preset Buttons */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  {dict.modals.editStaff.presets || '⚡ Apply Role Preset:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset(
                        'FIELD_AGENT',
                        setEditDepartment,
                        setEditPosition,
                        setEditPermissions
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-all"
                  >
                    🎯 Field Agent
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset(
                        'OPERATIONS',
                        setEditDepartment,
                        setEditPosition,
                        setEditPermissions
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold hover:bg-blue-100 transition-all"
                  >
                    ⚙️ Operations & Reconcile
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset(
                        'FINANCE',
                        setEditDepartment,
                        setEditPosition,
                        setEditPermissions
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold hover:bg-purple-100 transition-all"
                  >
                    💼 Finance & Invoicing
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset(
                        'EXECUTIVE',
                        setEditDepartment,
                        setEditPosition,
                        setEditPermissions
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-bold hover:bg-red-100 transition-all"
                  >
                    👑 Full Admin
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpdateStaff} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                      {dict.modals.editStaff.department || 'Department'}
                    </label>
                    <select
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-red-600"
                    >
                      {STANDARD_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      {dict.modals.editStaff.position || 'Position / Job Title'}
                    </label>
                    <input
                      type="text"
                      required
                      value={editPosition}
                      onChange={(e) => setEditPosition(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600"
                    />
                  </div>
                </div>

                {/* 🔒 Granular Permissions Checkboxes */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    {dict.modals.editStaff.permissions || 'Specific Granted Permissions:'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {AVAILABLE_PERMISSIONS.map((perm) => {
                      const isChecked = editPermissions.includes(perm.key);
                      return (
                        <label
                          key={perm.key}
                          className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-sm'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-900/40 border border-transparent'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              togglePermission(perm.key, editPermissions, setEditPermissions)
                            }
                            className="mt-0.5 rounded text-red-600 focus:ring-red-600"
                          />
                          <div>
                            <div className="font-extrabold text-[11px] text-slate-900 dark:text-white">
                              {perm.label}
                            </div>
                            <div className="text-[10px] text-slate-500 leading-tight">
                              {perm.desc}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
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
                      <span className="text-emerald-600 font-extrabold">
                        🟢 {dict.modals.editStaff.active}
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                      <input
                        type="radio"
                        name="activeStatus"
                        checked={editActive === false}
                        onChange={() => setEditActive(false)}
                        className="text-red-600 focus:ring-red-600"
                      />
                      <span className="text-slate-500 font-extrabold">
                        ⚪ {dict.modals.editStaff.inactive}
                      </span>
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
                    {editSubmitting
                      ? dict.modals.editStaff.submittingBtn
                      : dict.modals.editStaff.submitBtn}
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
                👤{' '}
                {dict.modals.resetPassword.forUser
                  .replace('{name}', resetTargetUser.fullName)
                  .replace('{username}', resetTargetUser.username)}
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
                    {resetSubmitting
                      ? dict.modals.resetPassword.submittingBtn
                      : dict.modals.resetPassword.submitBtn}
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
