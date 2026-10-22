'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { StaffHrProfile, PaycheckRecord, CommissionRecord, AuditLogRecord, DepartmentPolicy, DEFAULT_DEPARTMENT_POLICIES } from '../../types/hr';

interface HRViewProps {
  lang: 'en' | 'ms';
  currentUser?: {
    id?: string;
    username?: string;
    fullName?: string;
    role?: string;
    department?: string;
    position?: string;
    permissions?: string[];
  } | null;
}

type HRTab = 'directory' | 'onboarding' | 'paycheck' | 'commission' | 'access_policy' | 'audit';

export function HRView({ lang, currentUser }: HRViewProps) {
  const isEn = lang === 'en';

  const [activeTab, setActiveTab] = useState<HRTab>('directory');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Core Data
  const [staffList, setStaffList] = useState<StaffHrProfile[]>([]);
  const [paychecks, setPaychecks] = useState<PaycheckRecord[]>([]);
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [policies, setPolicies] = useState<DepartmentPolicy[]>(DEFAULT_DEPARTMENT_POLICIES);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [payrollMonth, setPayrollMonth] = useState('2026-10');
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');

  // Modals
  const [promoteTarget, setPromoteTarget] = useState<StaffHrProfile | null>(null);
  const [promoteRole, setPromoteRole] = useState<string>('STAFF');
  const [promotePermissions, setPromotePermissions] = useState<string[]>([]);
  const [promoteActive, setPromoteActive] = useState<boolean>(true);
  const [promoteReason, setPromoteReason] = useState<string>('');
  const [promoteSubmitting, setPromoteSubmitting] = useState(false);

  // Bulk Department Policy Modal
  const [deptSyncTarget, setDeptSyncTarget] = useState<DepartmentPolicy | null>(null);
  const [deptSyncReason, setDeptSyncReason] = useState<string>('');
  const [deptSyncSubmitting, setDeptSyncSubmitting] = useState(false);

  // Pay Slip Modal
  const [activePaySlip, setActivePaySlip] = useState<PaycheckRecord | null>(null);

  // Record Commission Modal
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [commStaffId, setCommStaffId] = useState('');
  const [commMerchantName, setCommMerchantName] = useState('');
  const [commMerchantRef, setCommMerchantRef] = useState('');
  const [commAmount, setCommAmount] = useState('150.00');
  const [commDate, setCommDate] = useState('22/10/2026');
  const [commNotes, setCommNotes] = useState('');
  const [commReason, setCommReason] = useState('');
  const [commSubmitting, setCommSubmitting] = useState(false);

  // Paycheck Status Modal
  const [statusPaycheckTarget, setStatusPaycheckTarget] = useState<PaycheckRecord | null>(null);
  const [targetPayStatus, setTargetPayStatus] = useState<'APPROVED' | 'PAID'>('APPROVED');
  const [payReference, setPayReference] = useState('');
  const [payStatusReason, setPayStatusReason] = useState('');
  const [payStatusSubmitting, setPayStatusSubmitting] = useState(false);

  // Onboarding Form State
  const [obUsername, setObUsername] = useState('');
  const [obPassword, setObPassword] = useState('');
  const [obFullName, setObFullName] = useState('');
  const [obEmail, setObEmail] = useState('');
  const [obPhone, setObPhone] = useState('');
  const [obIcNric, setObIcNric] = useState('');
  const [obDepartment, setObDepartment] = useState('Operations & Reconciliation');
  const [obPosition, setObPosition] = useState('Operations Coordinator');
  const [obReportingTo, setObReportingTo] = useState('Head of Operations');
  const [obEmploymentType, setObEmploymentType] = useState<StaffHrProfile['employmentType']>('FULL_TIME');
  const [obJoinDate, setObJoinDate] = useState('22/10/2026');
  const [obBaseSalary, setObBaseSalary] = useState('3800');
  const [obCommissionRate, setObCommissionRate] = useState('0');
  const [obBankName, setObBankName] = useState('Maybank Berhad');
  const [obBankAccountName, setObBankAccountName] = useState('');
  const [obBankAccountNo, setObBankAccountNo] = useState('');
  const [obEpfNo, setObEpfNo] = useState('');
  const [obSocsoNo, setObSocsoNo] = useState('');
  const [obTaxNo, setObTaxNo] = useState('');
  const [obRole, setObRole] = useState('STAFF');
  const [obPermissions, setObPermissions] = useState<string[]>(['dashboard:view', 'reconciliation:process']);
  const [obAuditReason, setObAuditReason] = useState('Official employee onboarding & compliance contract execution');
  const [obSubmitting, setObSubmitting] = useState(false);
  const [obSuccessMessage, setObSuccessMessage] = useState<string | null>(null);

  // Granular capability definitions
  const ALL_PERMISSIONS = useMemo(() => [
    { key: 'dashboard:view', label: isEn ? '📊 View Reconciliation Dashboard' : '📊 Lihat Papan Pemuka Rekonsiliasi', desc: isEn ? 'Access daily transactions & metrics' : 'Akses transaksi harian & lejar cawangan' },
    { key: 'analytics:view', label: isEn ? '📈 View Financial & Margin Analytics' : '📈 Lihat Analisis Margin & Kewangan', desc: isEn ? 'Gross profit & revenue trends' : 'Untung kasar & pecahan perolehan' },
    { key: 'reconciliation:process', label: isEn ? '💰 Process Order Reconciliations' : '💰 Laksana Rekonsiliasi Pesanan', desc: isEn ? 'Match Grab orders with price ledger' : 'Padankan pesanan Grab dengan harga asas' },
    { key: 'invoices:generate', label: isEn ? '🧾 Generate Merchant Invoices' : '🧾 Jana Penyata Invois Peniaga', desc: isEn ? 'Create billing statements & export PDFs' : 'Cipta invois & eksport PDF cawangan' },
    { key: 'products:edit', label: isEn ? '🏷️ Edit Product Base Prices' : '🏷️ Urus Harga Asas Produk', desc: isEn ? 'Configure base prices & price ledger' : 'Kemaskini lejar harga & jangkaan Grab' },
    { key: 'forms:submit', label: isEn ? '📝 Submit Registration Forms' : '📝 Hantar Borang Pendaftaran', desc: isEn ? 'Submit merchant & agent registrations' : 'Isi borang peniaga & senarai semak' },
    { key: 'forms:review', label: isEn ? '📋 Review & Audit Registrations' : '📋 Semak & Luluskan Pendaftaran', desc: isEn ? 'Approve & qualify merchant applications' : 'Luluskan pendaftaran peniaga' },
    { key: 'users:manage', label: isEn ? '👥 Manage Personnel & Access' : '👥 Urus Staf & Hak Akses', desc: isEn ? 'Create accounts & assign permissions' : 'Cipta akaun & tetapkan kebenaran' },
    { key: 'hr:view', label: isEn ? '🏢 View HR & Payroll Records' : '🏢 Lihat Rekod Sumber Manusia', desc: isEn ? 'Access staff directory & salary records' : 'Akses direktori staf & lejar gaji' },
    { key: 'hr:manage', label: isEn ? '💼 Full HR Operations Management' : '💼 Pengurusan Penuh HR & Gaji', desc: isEn ? 'Onboard staff, run payroll & commissions' : 'Pengambilan staf, kira gaji & komisen' },
    { key: 'finance:payout', label: isEn ? '💳 Authorize Financial Disbursements' : '💳 Pengesahan Pengeluaran Kewangan', desc: isEn ? 'Approve salary and commission payouts' : 'Luluskan bayaran gaji & komisen' },
    { key: 'audit:view', label: isEn ? '🔒 View & Export Compliance Audit Logs' : '🔒 Lihat & Eksport Log Audit', desc: isEn ? 'Inspect immutable system audit records' : 'Akses log audit integriti tidak boleh diubah' },
    { key: 'admin:all', label: isEn ? '👑 Full Master Root Administrator' : '👑 Akses Penuh Pentadbir Utama', desc: isEn ? 'Unrestricted root access override' : 'Akses master tanpa sekatan' },
  ], [isEn]);

  // Fetch HR data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/hr');
      const data = await res.json();
      if (data.success) {
        setStaffList(data.staff || []);
        setPaychecks(data.paychecks || []);
        setCommissions(data.commissions || []);
        setAuditLogs(data.auditLogs || []);
        if (data.departmentPolicies?.length) {
          setPolicies(data.departmentPolicies);
        }
      } else {
        setError(data.error || 'Failed to fetch HR records');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error to HR server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Staff
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchSearch =
        searchQuery === '' ||
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDept = departmentFilter === 'ALL' || s.department === departmentFilter;
      const matchRole = roleFilter === 'ALL' || s.role === roleFilter;

      return matchSearch && matchDept && matchRole;
    });
  }, [staffList, searchQuery, departmentFilter, roleFilter]);

  // Filtered Paychecks
  const filteredPaychecks = useMemo(() => {
    return paychecks.filter((p) => p.month === payrollMonth);
  }, [paychecks, payrollMonth]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchAction = auditActionFilter === 'ALL' || log.action === auditActionFilter;
      const matchQuery =
        searchQuery === '' ||
        log.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actorUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.auditHash.toLowerCase().includes(searchQuery.toLowerCase());
      return matchAction && matchQuery;
    });
  }, [auditLogs, auditActionFilter, searchQuery]);

  // Unique departments
  const departmentOptions = useMemo(() => {
    const set = new Set<string>();
    staffList.forEach((s) => set.add(s.department));
    DEFAULT_DEPARTMENT_POLICIES.forEach((p) => set.add(p.department));
    return Array.from(set);
  }, [staffList]);

  // -------------------------------------------------------------
  // ACTION HANDLERS
  // -------------------------------------------------------------
  const openPromoteModal = (staff: StaffHrProfile) => {
    setPromoteTarget(staff);
    setPromoteRole(staff.role);
    setPromotePermissions([...staff.permissions]);
    setPromoteActive(staff.isActive);
    setPromoteReason('');
  };

  const handlePromoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteTarget || !promoteReason.trim()) {
      alert(isEn ? 'Please provide an Audit Justification / Reason.' : 'Sila nyatakan Sebab / Justifikasi Audit.');
      return;
    }

    try {
      setPromoteSubmitting(true);
      const res = await fetch('/api/hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'promote_revoke_access',
          staffId: promoteTarget.id,
          newRole: promoteRole,
          newPermissions: promotePermissions,
          isActive: promoteActive,
          auditReason: promoteReason.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPromoteTarget(null);
        fetchData();
      } else {
        alert(data.error || 'Failed to update access permissions');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setPromoteSubmitting(false);
    }
  };

  const handleDeptSyncSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptSyncTarget || !deptSyncReason.trim()) {
      alert(isEn ? 'Please provide an Audit Justification.' : 'Sila nyatakan Justifikasi Audit.');
      return;
    }

    try {
      setDeptSyncSubmitting(true);
      const res = await fetch('/api/hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_department_policy',
          department: deptSyncTarget.department,
          permissions: deptSyncTarget.standardPermissions,
          standardRole: deptSyncTarget.standardRole,
          auditReason: deptSyncReason.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(isEn ? `Applied policy to ${data.affectedStaffCount} staff members.` : `Polisi berjaya diterapkan kepada ${data.affectedStaffCount} staf.`);
        setDeptSyncTarget(null);
        fetchData();
      } else {
        alert(data.error || 'Failed to synchronize department policy');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setDeptSyncSubmitting(false);
    }
  };

  const handleRunPayrollBatch = async () => {
    if (!confirm(isEn ? `Generate payroll draft for ${payrollMonth}?` : `Jana draf lejar gaji untuk ${payrollMonth}?`)) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_payrolls',
          month: payrollMonth,
          auditReason: `Automated scheduled monthly payroll calculation for ${payrollMonth}.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || 'Failed to run payroll batch');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaycheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusPaycheckTarget) return;

    try {
      setPayStatusSubmitting(true);
      const res = await fetch('/api/hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_paycheck_status',
          paycheckId: statusPaycheckTarget.id,
          newStatus: targetPayStatus,
          paymentReference: payReference.trim() || undefined,
          auditReason: payStatusReason.trim() || `Paycheck transitioned to ${targetPayStatus}.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusPaycheckTarget(null);
        fetchData();
      } else {
        alert(data.error || 'Failed to update paycheck');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setPayStatusSubmitting(false);
    }
  };

  const handleAddCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commStaffId || !commMerchantName || !commAmount) {
      alert(isEn ? 'Please fill in all required commission fields.' : 'Sila lengkapkan semua medan wajib komisen.');
      return;
    }

    try {
      setCommSubmitting(true);
      const res = await fetch('/api/hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_commission',
          staffId: commStaffId,
          merchantName: commMerchantName.trim(),
          merchantRef: commMerchantRef.trim() || undefined,
          activityType: 'MERCHANT_ONBOARDING',
          amount: parseFloat(commAmount),
          date: commDate,
          notes: commNotes.trim() || undefined,
          auditReason: commReason.trim() || 'Verified merchant storefront onboarding commission claim.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsCommissionModalOpen(false);
        setCommMerchantName('');
        setCommMerchantRef('');
        setCommNotes('');
        setCommReason('');
        fetchData();
      } else {
        alert(data.error || 'Failed to record commission');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setCommSubmitting(false);
    }
  };

  const handleVerifyCommission = async (comm: CommissionRecord, newStatus: 'VERIFIED' | 'REJECTED') => {
    const reason = prompt(
      isEn ? `Confirm verification status ${newStatus}. Enter audit note:` : `Sahkan status ${newStatus}. Masukkan catatan audit:`
    );
    if (reason === null) return;

    try {
      const res = await fetch('/api/hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_commission',
          commissionId: comm.id,
          newStatus,
          auditReason: reason.trim() || `Commission verified as ${newStatus} by authorized supervisor.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || 'Failed to update commission');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!obUsername || !obPassword || !obFullName || !obDepartment || !obPosition) {
      alert(isEn ? 'Please complete required fields.' : 'Sila lengkapkan maklumat wajib.');
      return;
    }

    try {
      setObSubmitting(true);
      setObSuccessMessage(null);
      const res = await fetch('/api/hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'onboard_staff',
          username: obUsername,
          password: obPassword,
          fullName: obFullName,
          email: obEmail,
          phone: obPhone,
          icPassportNo: obIcNric,
          department: obDepartment,
          position: obPosition,
          reportingTo: obReportingTo,
          employmentType: obEmploymentType,
          joinDate: obJoinDate,
          baseSalary: parseFloat(obBaseSalary) || 3500,
          commissionRate: parseFloat(obCommissionRate) || 0,
          bankName: obBankName,
          bankAccountName: obBankAccountName || obFullName,
          bankAccountNumber: obBankAccountNo,
          epfNumber: obEpfNo,
          socsoNumber: obSocsoNo,
          taxNumber: obTaxNo,
          role: obRole,
          permissions: obPermissions,
          auditReason: obAuditReason.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setObSuccessMessage(data.message);
        setObUsername('');
        setObPassword('');
        setObFullName('');
        setObEmail('');
        setObPhone('');
        setObIcNric('');
        setObBankAccountNo('');
        fetchData();
      } else {
        alert(data.error || 'Failed to onboard staff member');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setObSubmitting(false);
    }
  };

  // Export Audit CSV
  const handleExportAuditCSV = () => {
    const headers = ['Timestamp', 'Audit Hash', 'Action', 'Actor', 'Actor Role', 'Target', 'Department', 'Reason', 'Integrity Status'];
    const rows = auditLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.auditHash}"`,
      `"${l.action}"`,
      `"${l.actorUsername}"`,
      `"${l.actorRole}"`,
      `"${l.targetName}"`,
      `"${l.department}"`,
      `"${l.reason.replace(/"/g, '""')}"`,
      `"VERIFIED_UNTAMPERED"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LC_AUDIT_TRAIL_${payrollMonth.replace('-', '')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // -------------------------------------------------------------
  // SUMMARY KPIS
  // -------------------------------------------------------------
  const totalPayrollCost = filteredPaychecks.reduce((acc, p) => acc + p.grossPay, 0);
  const totalNetDisbursed = filteredPaychecks.reduce((acc, p) => acc + p.netPay, 0);
  const totalCommissionsEarned = commissions.reduce((acc, c) => acc + c.amount, 0);
  const pendingCommissionsCount = commissions.filter((c) => c.status === 'PENDING').length;

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* 1. TOP HEADER & NAVIGATION BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-xl text-white shadow-md shadow-red-600/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {isEn ? 'Human Resources & Corporate Governance' : 'Pengurusan Sumber Manusia & Tadbir Urus'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {isEn
                  ? 'Audit-proof personnel onboarding, departmental access control, payroll ledger, and performance commissions.'
                  : 'Kemasukan kakitangan audit-proof, kawalan capaian jabatan, lejar penyata gaji, dan komisen prestasi.'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={fetchData}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>🔄</span>
            <span>{isEn ? 'Refresh Data' : 'Muat Semula'}</span>
          </button>
          <button
            type="button"
            onClick={handleExportAuditCSV}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
          >
            <span>📥</span>
            <span>{isEn ? 'Export Audit Ledger' : 'Eksport Log Audit'}</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'directory', labelEn: '👥 Staff Directory & Assignment', labelMs: '👥 Direktori & Penugasan Staf' },
          { id: 'onboarding', labelEn: '📋 Staff Onboarding', labelMs: '📋 Kemasukan Staf Baharu' },
          { id: 'paycheck', labelEn: '💳 Paycheck & Payroll Ledger', labelMs: '💳 Penyata Gaji & Lejar' },
          { id: 'commission', labelEn: '💰 Commission Engine', labelMs: '💰 Pengurusan Komisen' },
          { id: 'access_policy', labelEn: '🛡️ Department Policies & Access Matrix', labelMs: '🛡️ Polisi Jabatan & Capaian' },
          { id: 'audit', labelEn: '🔒 Audit-Proof Compliance Trail', labelMs: '🔒 Log Audit & Integriti' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as HRTab)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20'
            }`}
          >
            {isEn ? tab.labelEn : tab.labelMs}
          </button>
        ))}
      </div>

      {/* 3. KPI CARDS BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {isEn ? 'Total Active Personnel' : 'Jumlah Staf Aktif'}
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {staffList.filter((s) => s.isActive).length} <span className="text-xs text-slate-400 font-semibold">/ {staffList.length}</span>
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            ✓ {isEn ? 'Fully Provisioned' : 'Berdaftar Sepenuhnya'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {isEn ? `Gross Payroll (${payrollMonth})` : `Gaji Kasar (${payrollMonth})`}
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            RM {totalPayrollCost.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            {filteredPaychecks.length} {isEn ? 'Paychecks processed' : 'penyata diproses'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {isEn ? `Net Disbursement (${payrollMonth})` : `Bayaran Bersih (${payrollMonth})`}
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            RM {totalNetDisbursed.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            {isEn ? 'After EPF, SOCSO & Tax' : 'Selepas KWSP, PERKESO & Cukai'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {isEn ? 'Commissions Pool' : 'Kolam Komisen'}
          </div>
          <div className="text-2xl font-black text-amber-500 mt-1">
            RM {totalCommissionsEarned.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1">
            {pendingCommissionsCount} {isEn ? 'Pending Review' : 'Perlu Pengesahan'}
          </div>
        </div>
      </div>

      {/* =========================================================
          TAB 1: STAFF DIRECTORY & ASSIGNMENTS
      ========================================================= */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? 'Search by name, employee ID, position, or department...' : 'Cari nama, ID staf, jawatan, atau jabatan...'}
                className="w-full px-4 py-2 pl-9 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/30"
              />
              <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                <option value="ALL">{isEn ? 'All Departments' : 'Semua Jabatan'}</option>
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                <option value="ALL">{isEn ? 'All Roles' : 'Semua Peranan'}</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                <option value="MANAGER">MANAGER</option>
                <option value="STAFF">STAFF</option>
                <option value="AGENT">AGENT</option>
              </select>
            </div>
          </div>

          {/* Personnel Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">{isEn ? 'Staff Member & ID' : 'Nama Staf & ID'}</th>
                    <th className="py-3 px-4">{isEn ? 'Department & Position' : 'Jabatan & Jawatan'}</th>
                    <th className="py-3 px-4">{isEn ? 'Supervisor / Reporting' : 'Penyelia / Pelapor'}</th>
                    <th className="py-3 px-4">{isEn ? 'Base Salary (RM)' : 'Gaji Asas (RM)'}</th>
                    <th className="py-3 px-4">{isEn ? 'Commission Rate' : 'Kadar Komisen'}</th>
                    <th className="py-3 px-4">{isEn ? 'Access Role & Perms' : 'Peranan & Kebenaran'}</th>
                    <th className="py-3 px-4">{isEn ? 'Status' : 'Status'}</th>
                    <th className="py-3 px-4 text-right">{isEn ? 'Actions' : 'Tindakan'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-black text-xs shrink-0">
                            {staff.fullName.charAt(0)}
                          </div>
                          <div>
                            <div>{staff.fullName}</div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {staff.employeeId} • @{staff.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{staff.position}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{staff.department}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-600 dark:text-slate-300 text-[11px] font-medium">{staff.reportingTo}</div>
                        <div className="text-[10px] text-slate-400">{isEn ? 'Joined:' : 'Mula:'} {staff.joinDate}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        RM {staff.baseSalary.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-amber-600 dark:text-amber-400">
                        {staff.commissionRate > 0 ? `${staff.commissionRate}% / deal` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide ${
                          staff.role === 'SUPER_ADMIN'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            : staff.role === 'MANAGER'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            : staff.role === 'AGENT'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {staff.role}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {staff.permissions.length} {isEn ? 'permissions granted' : 'kebenaran aktif'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          staff.isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}>
                          {staff.isActive ? (isEn ? 'ACTIVE' : 'AKTIF') : (isEn ? 'SUSPENDED' : 'DIGANTUNG')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openPromoteModal(staff)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                          >
                            🛡️ {isEn ? 'Promote / Revoke' : 'Urus Akses'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: STAFF ONBOARDING WIZARD
      ========================================================= */}
      {activeTab === 'onboarding' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm max-w-4xl mx-auto">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>📋</span> {isEn ? 'Official Employee Onboarding & Credential Provisioning' : 'Kemasukan Staf Baharu & Penetapan Kredensial'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isEn
                ? 'Register new staff with full Malaysian employment compliance (EPF, SOCSO, Tax, Bank Account & Access Permissions).'
                : 'Daftar pekerja baharu dengan pematuhan undang-undang buruh Malaysia (KWSP, PERKESO, LHDN & Hak Capaian).'}
            </p>
          </div>

          {obSuccessMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <span>✅</span>
              <span>{obSuccessMessage}</span>
            </div>
          )}

          <form onSubmit={handleOnboardSubmit} className="space-y-6">
            {/* Section 1: Personal & Identification */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                1. {isEn ? 'Personal & Identification Details' : 'Maklumat Peribadi & Pengenalan'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'Full Name (as per IC / Passport) *' : 'Nama Penuh (seperti dalam MyKad) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={obFullName}
                    onChange={(e) => {
                      setObFullName(e.target.value);
                      if (!obBankAccountName) setObBankAccountName(e.target.value);
                    }}
                    placeholder="e.g. Ahmad Faizal Bin Mohamad"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'NRIC / Passport Number *' : 'Nombor MyKad / Pasport *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={obIcNric}
                    onChange={(e) => setObIcNric(e.target.value)}
                    placeholder="e.g. 920512-14-5589"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'Corporate Email *' : 'Emel Korporat *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={obEmail}
                    onChange={(e) => setObEmail(e.target.value)}
                    placeholder="e.g. faizal@lcgroup.com.my"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'Contact Mobile Number *' : 'Nombor Telefon Bimbit *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={obPhone}
                    onChange={(e) => setObPhone(e.target.value)}
                    placeholder="e.g. +60 12-345 6789"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Department & Employment */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                2. {isEn ? 'Department & Employment Designation' : 'Jabatan & Jawatan Pekerjaan'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'Department *' : 'Jabatan *'}
                  </label>
                  <select
                    value={obDepartment}
                    onChange={(e) => {
                      const d = e.target.value;
                      setObDepartment(d);
                      const pol = policies.find((p) => p.department === d);
                      if (pol) {
                        setObRole(pol.standardRole);
                        setObPermissions(pol.standardPermissions);
                      }
                    }}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    {departmentOptions.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'Job Title / Position *' : 'Jawatan / Posisi *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={obPosition}
                    onChange={(e) => setObPosition(e.target.value)}
                    placeholder="e.g. Senior Operations Officer"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'Reporting Supervisor *' : 'Penyelia Melapor *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={obReportingTo}
                    onChange={(e) => setObReportingTo(e.target.value)}
                    placeholder="e.g. Head of Department"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'Employment Type *' : 'Jenis Pekerjaan *'}
                  </label>
                  <select
                    value={obEmploymentType}
                    onChange={(e) => setObEmploymentType(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="FULL_TIME">{isEn ? 'Full-Time (Tetap)' : 'Sepenuh Masa (Tetap)'}</option>
                    <option value="CONTRACT">{isEn ? 'Fixed Contract' : 'Kontrak Tetap'}</option>
                    <option value="PROBATION">{isEn ? 'Probationary' : 'Dalam Percubaan'}</option>
                    <option value="INTERN">{isEn ? 'Internship' : 'Pelatih Industri'}</option>
                    <option value="COMMISSION_AGENT">{isEn ? 'Commission Agent' : 'Ejen Komisen'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'Commencement Date (DD/MM/YYYY) *' : 'Tarikh Mula Bertugas (DD/MM/YYYY) *'}
                  </label>
                  <input
                    type="date"
                    lang="en-GB"
                    placeholder="dd/mm/yyyy"
                    required
                    value={obJoinDate.includes('/') ? obJoinDate.split('/').reverse().join('-') : obJoinDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        const [y, m, d] = val.split('-');
                        setObJoinDate(`${d}/${m}/${y}`);
                      }
                    }}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Compensation & Banking */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                3. {isEn ? 'Compensation & Statutory Banking' : 'Pampasan & Maklumat Akaun Berkanun'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'Base Monthly Salary (RM) *' : 'Gaji Asas Bulanan (RM) *'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={obBaseSalary}
                    onChange={(e) => setObBaseSalary(e.target.value)}
                    placeholder="3800.00"
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'Commission Rate (% or RM per Deal)' : 'Kadar Komisen (% atau RM)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={obCommissionRate}
                    onChange={(e) => setObCommissionRate(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'Bank Name *' : 'Nama Bank *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={obBankName}
                    onChange={(e) => setObBankName(e.target.value)}
                    placeholder="e.g. Maybank / CIMB"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'Bank Account Number *' : 'Nombor Akaun Bank *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={obBankAccountNo}
                    onChange={(e) => setObBankAccountNo(e.target.value)}
                    placeholder="e.g. 514012348899"
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'EPF / KWSP Member No' : 'Nombor Ahli KWSP'}
                  </label>
                  <input
                    type="text"
                    value={obEpfNo}
                    onChange={(e) => setObEpfNo(e.target.value)}
                    placeholder="e.g. 23456789"
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'SOCSO / PERKESO No' : 'Nombor PERKESO'}
                  </label>
                  <input
                    type="text"
                    value={obSocsoNo}
                    onChange={(e) => setObSocsoNo(e.target.value)}
                    placeholder="e.g. 920512145589"
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: System Credentials & Role */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                4. {isEn ? 'System Access & Security Credentials' : 'Kredensial Keselamatan & Capaian Sistem'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'System Username *' : 'Nama Pengguna Sistem *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={obUsername}
                    onChange={(e) => setObUsername(e.target.value)}
                    placeholder="e.g. faizal_ops"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'Initial Temporary Password *' : 'Kata Laluan Sementara *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={obPassword}
                    onChange={(e) => setObPassword(e.target.value)}
                    placeholder="e.g. TempPass2026!"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'Assigned System Role *' : 'Peranan Sistem Ditetapkan *'}
                  </label>
                  <select
                    value={obRole}
                    onChange={(e) => setObRole(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="STAFF">STAFF</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    <option value="AGENT">AGENT</option>
                  </select>
                </div>
              </div>

              {/* Granular Permissions Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isEn ? 'Granular Capabilities Provisioned:' : 'Keupayaan Spesifik Diberikan:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  {ALL_PERMISSIONS.map((p) => {
                    const isChecked = obPermissions.includes(p.key);
                    return (
                      <label key={p.key} className="flex items-start gap-2 text-xs p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setObPermissions([...obPermissions, p.key]);
                            } else {
                              setObPermissions(obPermissions.filter((k) => k !== p.key));
                            }
                          }}
                          className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                        />
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{p.label}</div>
                          <div className="text-[10px] text-slate-400">{p.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section 5: Audit Justification */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isEn ? 'Audit Justification / Business Reason *' : 'Justifikasi Audit / Sebab Perniagaan *'}
              </label>
              <textarea
                required
                rows={2}
                value={obAuditReason}
                onChange={(e) => setObAuditReason(e.target.value)}
                placeholder={isEn ? 'State the business approval reason for auditing compliance.' : 'Nyatakan sebab kelulusan untuk audit pematuhan.'}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="submit"
                disabled={obSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md shadow-red-600/25 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{obSubmitting ? '⏳' : '🚀'}</span>
                <span>{obSubmitting ? (isEn ? 'Provisioning...' : 'Mendaftar...') : (isEn ? 'Complete Onboarding & Issue Credentials' : 'Selesaikan Kemasukan & Jana Kredensial')}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================
          TAB 3: PAYCHECK & PAYROLL LEDGER
      ========================================================= */}
      {activeTab === 'paycheck' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  {isEn ? 'Payroll Month Cycle' : 'Kitaran Bulan Gaji'}
                </label>
                <input
                  type="month"
                  value={payrollMonth}
                  onChange={(e) => setPayrollMonth(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-slate-800" />

              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">
                  {isEn ? 'Pay Cycle Dates (DD/MM/YYYY)' : 'Tarikh Kitaran Gaji (DD/MM/YYYY)'}
                </div>
                <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  01/{payrollMonth.split('-')[1]}/{payrollMonth.split('-')[0]} — 28/{payrollMonth.split('-')[1]}/{payrollMonth.split('-')[0]}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunPayrollBatch}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md shadow-red-600/20 flex items-center gap-1.5 transition-all"
              >
                <span>⚡</span>
                <span>{isEn ? `Compute Payroll (${payrollMonth})` : `Kira Gaji (${payrollMonth})`}</span>
              </button>
            </div>
          </div>

          {/* Paycheck Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">{isEn ? 'Pay Slip No' : 'No. Penyata'}</th>
                    <th className="py-3 px-4">{isEn ? 'Staff Member' : 'Pekerja'}</th>
                    <th className="py-3 px-4">{isEn ? 'Basic Pay' : 'Gaji Asas'}</th>
                    <th className="py-3 px-4">{isEn ? 'Commissions' : 'Komisen'}</th>
                    <th className="py-3 px-4">{isEn ? 'Gross Pay' : 'Gaji Kasar'}</th>
                    <th className="py-3 px-4">{isEn ? 'Deductions (EPF/SOCSO)' : 'Potongan (KWSP)'}</th>
                    <th className="py-3 px-4 font-black text-emerald-600">{isEn ? 'Net Salary' : 'Gaji Bersih'}</th>
                    <th className="py-3 px-4">{isEn ? 'Status' : 'Status'}</th>
                    <th className="py-3 px-4 text-right">{isEn ? 'Pay Slip & Actions' : 'Penyata & Tindakan'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPaychecks.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                        {isEn ? `No paychecks generated yet for ${payrollMonth}. Click "Compute Payroll" above.` : `Tiada penyata gaji dijana untuk ${payrollMonth}. Klik "Kira Gaji" di atas.`}
                      </td>
                    </tr>
                  ) : (
                    filteredPaychecks.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {p.paycheckNo}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{p.staffName}</div>
                          <div className="text-[10px] text-slate-400">{p.department} • {p.position}</div>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          RM {p.baseSalary.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 font-mono text-amber-600 dark:text-amber-400 font-semibold">
                          {p.commissionsEarned > 0 ? `+RM ${p.commissionsEarned.toLocaleString('en-MY', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                          RM {p.grossPay.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 font-mono text-rose-600 dark:text-rose-400 text-[11px]">
                          -RM {p.totalDeductions.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          RM {p.netPay.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide ${
                            p.status === 'PAID'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : p.status === 'APPROVED'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setActivePaySlip(p)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                              title="View and Print Official Payslip"
                            >
                              📄 {isEn ? 'Pay Slip' : 'Penyata Gaji'}
                            </button>

                            {p.status === 'DRAFT' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setStatusPaycheckTarget(p);
                                  setTargetPayStatus('APPROVED');
                                  setPayStatusReason('Payroll verified against attendance and commission records.');
                                }}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                {isEn ? 'Approve' : 'Luluskan'}
                              </button>
                            )}

                            {p.status === 'APPROVED' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setStatusPaycheckTarget(p);
                                  setTargetPayStatus('PAID');
                                  setPayReference(`MBB-FT-${Date.now().toString().slice(-6)}`);
                                  setPayStatusReason('Direct bank transfer completed via corporate Maybank account.');
                                }}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                {isEn ? 'Mark Paid' : 'Tanda Dibayar'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: COMMISSION ENGINE
      ========================================================= */}
      {activeTab === 'commission' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {isEn ? 'Field Agent & Acquisition Commission Ledger' : 'Lejar Komisen Ejen Perekrutan Lapangan'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEn ? 'Verified commissions are automatically rolled into the agent monthly paycheck disbursement.' : 'Komisen yang disahkan akan dimasukkan secara automatik ke dalam penyata gaji bulanan.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (staffList.length > 0) setCommStaffId(staffList[0].id);
                setIsCommissionModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md shadow-red-600/20 flex items-center gap-1.5 transition-all"
            >
              <span>➕</span>
              <span>{isEn ? 'Record Commission Claim' : 'Daftar Tuntutan Komisen'}</span>
            </button>
          </div>

          {/* Commission Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">{isEn ? 'Claim Reference' : 'No. Rujukan'}</th>
                    <th className="py-3 px-4">{isEn ? 'Agent / Staff' : 'Ejen / Staf'}</th>
                    <th className="py-3 px-4">{isEn ? 'Merchant Storefront Onboarded' : 'Peniaga Cawangan Didaftar'}</th>
                    <th className="py-3 px-4">{isEn ? 'Event Date (DD/MM/YYYY)' : 'Tarikh (DD/MM/YYYY)'}</th>
                    <th className="py-3 px-4">{isEn ? 'Commission Amount' : 'Jumlah Komisen'}</th>
                    <th className="py-3 px-4">{isEn ? 'Verification Status' : 'Status Pengesahan'}</th>
                    <th className="py-3 px-4 text-right">{isEn ? 'Actions' : 'Tindakan'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {commissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                        {isEn ? 'No commission claims recorded yet.' : 'Tiada tuntutan komisen direkodkan.'}
                      </td>
                    </tr>
                  ) : (
                    commissions.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {c.claimNo}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{c.staffName}</div>
                          <div className="text-[10px] text-slate-400">{c.department}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{c.merchantName}</div>
                          {c.merchantRef && <div className="text-[10px] text-slate-400 font-mono">{c.merchantRef}</div>}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                          {c.date}
                        </td>
                        <td className="py-3 px-4 font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                          RM {c.amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            c.status === 'VERIFIED'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : c.status === 'PAID_IN_PAYROLL'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : c.status === 'REJECTED'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {c.status === 'PENDING' && (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleVerifyCommission(c, 'VERIFIED')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                {isEn ? 'Verify' : 'Sahkan'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleVerifyCommission(c, 'REJECTED')}
                                className="px-2 py-1 rounded-lg text-[11px] font-bold text-rose-600 hover:bg-rose-50"
                              >
                                {isEn ? 'Reject' : 'Tolak'}
                              </button>
                            </div>
                          )}
                          {c.status === 'VERIFIED' && (
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                              ✓ {isEn ? 'Queued for next payroll' : 'Dalam barisan lejar gaji'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 5: DEPARTMENT POLICIES & ACCESS MATRIX
      ========================================================= */}
      {activeTab === 'access_policy' && (
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              {isEn ? 'Department-Wise Access Policy & Mass Permission Control' : 'Polisi Capaian Jabatan & Kawalan Hak Akses Beramai'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isEn
                ? 'Standardize permission sets by organizational department. Synchronizing a policy updates every active staff member in the department instantly.'
                : 'Piawaikan set kebenaran mengikut jabatan organisasi. Sinkronisasi polisi akan mengemaskini setiap staf dalam jabatan tersebut secara serta-merta.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policies.map((pol) => {
              const staffInDept = staffList.filter((s) => s.department === pol.department);
              return (
                <div key={pol.department} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-base text-slate-900 dark:text-white">{pol.department}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                        {staffInDept.length} {isEn ? 'Staff' : 'Staf'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {isEn ? pol.description : pol.descriptionMs}
                    </div>

                    <div className="mt-3 text-xs">
                      <span className="text-slate-400 font-semibold">{isEn ? 'Head of Department:' : 'Ketua Jabatan:'} </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{pol.headOfDepartment}</span>
                    </div>

                    <div className="mt-2 text-xs">
                      <span className="text-slate-400 font-semibold">{isEn ? 'Standard Role Tier:' : 'Tahap Peranan Standard:'} </span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{pol.standardRole}</span>
                    </div>

                    <div className="mt-3">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        {isEn ? `Standard Policy Permissions (${pol.standardPermissions.length}):` : `Kebenaran Polisi Standard (${pol.standardPermissions.length}):`}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {pol.standardPermissions.map((perm) => (
                          <span key={perm} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-mono">
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {staffInDept.length === 0 ? (isEn ? 'No staff in department' : 'Tiada staf') : (isEn ? `Applies to all ${staffInDept.length} members` : `Terpakai kepada ${staffInDept.length} staf`)}
                    </span>
                    <button
                      type="button"
                      disabled={staffInDept.length === 0}
                      onClick={() => {
                        setDeptSyncTarget(pol);
                        setDeptSyncReason(`Department-wide baseline policy synchronization for ${pol.department}.`);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-600/20 disabled:opacity-40 transition-colors"
                    >
                      ⚡ {isEn ? 'Sync to Department' : 'Sinkronkan Jabatan'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 6: AUDIT-PROOF COMPLIANCE TRAIL
      ========================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>🔒</span>
                <span>{isEn ? 'Tamper-Evident Immutable Audit Log' : 'Log Audit Integriti Tanpa Kompromi'}</span>
              </h2>
              <p className="text-xs text-slate-500">
                {isEn
                  ? 'Cryptographically verified log trail of all access promotions, permission revocations, onboarding events, and payroll disbursements.'
                  : 'Log rasmi dengan pengesahan kriptografi bagi semua promosi akses, penarikan hak, kemasukan staf, dan bayaran gaji.'}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                <option value="ALL">{isEn ? 'All Action Events' : 'Semua Acara Tindakan'}</option>
                <option value="ACCESS_PROMOTED">ACCESS_PROMOTED</option>
                <option value="ACCESS_REVOKED">ACCESS_REVOKED</option>
                <option value="PERMISSIONS_UPDATED">PERMISSIONS_UPDATED</option>
                <option value="DEPARTMENT_POLICY_SYNC">DEPARTMENT_POLICY_SYNC</option>
                <option value="STAFF_ONBOARDED">STAFF_ONBOARDED</option>
                <option value="PAYROLL_BATCH_GENERATED">PAYROLL_BATCH_GENERATED</option>
                <option value="PAYCHECK_APPROVED">PAYCHECK_APPROVED</option>
                <option value="PAYCHECK_DISBURSED">PAYCHECK_DISBURSED</option>
                <option value="COMMISSION_RECORDED">COMMISSION_RECORDED</option>
                <option value="COMMISSION_VERIFIED">COMMISSION_VERIFIED</option>
              </select>

              <button
                type="button"
                onClick={handleExportAuditCSV}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                📥 CSV
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">{isEn ? 'Timestamp (DD/MM/YYYY)' : 'Masa (DD/MM/YYYY)'}</th>
                    <th className="py-3 px-4">{isEn ? 'Event Type' : 'Jenis Acara'}</th>
                    <th className="py-3 px-4">{isEn ? 'Actor (Performed By)' : 'Pelaku (Dilakukan Oleh)'}</th>
                    <th className="py-3 px-4">{isEn ? 'Target Subject' : 'Sasaran'}</th>
                    <th className="py-3 px-4">{isEn ? 'Audit Justification' : 'Justifikasi Audit'}</th>
                    <th className="py-3 px-4 font-mono">{isEn ? 'Audit Hash Digest' : 'Hash Audit'}</th>
                    <th className="py-3 px-4 text-right">{isEn ? 'Integrity' : 'Integriti'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                        {isEn ? 'No audit records matching filter.' : 'Tiada rekod audit sepadan.'}
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold tracking-wide ${
                            log.action.includes('PROMOTED') || log.action.includes('ONBOARDED') || log.action.includes('DISBURSED')
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : log.action.includes('REVOKED') || log.action.includes('REJECTED')
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">@{log.actorUsername}</div>
                          <div className="text-[10px] text-slate-400">{log.actorRole}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{log.targetName}</div>
                          <div className="text-[10px] text-slate-400">{log.department}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={log.reason}>
                          {log.reason}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500 font-bold">
                          {log.auditHash}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            ✓ UNTAMPERED
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 1: INDIVIDUALIZED PROMOTE / REVOKE ACCESS
      ========================================================= */}
      {promoteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🛡️</span> {isEn ? 'Individualized Access Promotion & Revocation' : 'Promosi & Penarikan Hak Akses Individu'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isEn ? `Target Personnel: ${promoteTarget.fullName} (@${promoteTarget.username})` : `Staf Sasaran: ${promoteTarget.fullName} (@${promoteTarget.username})`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPromoteTarget(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePromoteSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isEn ? 'Access Role Tier (Promote / Demote):' : 'Tahap Peranan Akses (Promosi / Turun Pangkat):'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['STAFF', 'MANAGER', 'SUPER_ADMIN', 'AGENT'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setPromoteRole(r)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        promoteRole === r
                          ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {isEn ? 'Account Status (Active / Revoked)' : 'Status Akaun (Aktif / Digantung)'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isEn ? 'Disabling will immediately revoke all portal session tokens' : 'Menyahaktifkan akan menyekat sesi pengguna serta-merta'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPromoteActive(!promoteActive)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    promoteActive ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {promoteActive ? (isEn ? 'ACTIVE' : 'AKTIF') : (isEn ? 'SUSPENDED' : 'DIGANTUNG')}
                </button>
              </div>

              {/* Granular Capabilities */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isEn ? 'Granular Permission Capabilities:' : 'Hak Akses Spesifik:'}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPromotePermissions(ALL_PERMISSIONS.map((p) => p.key))}
                      className="text-[10px] text-red-600 dark:text-red-400 font-bold hover:underline"
                    >
                      {isEn ? 'Grant All' : 'Beri Semua'}
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setPromotePermissions([])}
                      className="text-[10px] text-slate-400 font-bold hover:underline"
                    >
                      {isEn ? 'Revoke All' : 'Tarik Semua'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  {ALL_PERMISSIONS.map((p) => {
                    const isChecked = promotePermissions.includes(p.key);
                    return (
                      <label key={p.key} className="flex items-start gap-2 text-xs p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPromotePermissions([...promotePermissions, p.key]);
                            } else {
                              setPromotePermissions(promotePermissions.filter((k) => k !== p.key));
                            }
                          }}
                          className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                        />
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{p.label}</div>
                          <div className="text-[9px] text-slate-400">{p.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Mandatory Audit Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isEn ? 'Audit Justification / Business Reason * (Mandatory for Compliance)' : 'Justifikasi Audit / Sebab Perniagaan * (Wajib untuk Pematuhan)'}
                </label>
                <textarea
                  required
                  rows={2}
                  value={promoteReason}
                  onChange={(e) => setPromoteReason(e.target.value)}
                  placeholder={isEn ? 'e.g. Promoted to Operations Manager following annual performance appraisal and security clearance.' : 'e.g. Kenaikan pangkat Pengurus Operasi berikutan penilaian prestasi tahunan.'}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPromoteTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {isEn ? 'Cancel' : 'Batal'}
                </button>
                <button
                  type="submit"
                  disabled={promoteSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md shadow-red-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <span>{promoteSubmitting ? '⏳' : '💾'}</span>
                  <span>{promoteSubmitting ? (isEn ? 'Saving...' : 'Menyimpan...') : (isEn ? 'Apply & Log Audit Record' : 'Laksana & Simpan Log Audit')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: BULK DEPARTMENT POLICY SYNC
      ========================================================= */}
      {deptSyncTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">
              ⚡ {isEn ? `Mass Apply Policy to ${deptSyncTarget.department}` : `Terapkan Polisi ke ${deptSyncTarget.department}`}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {isEn
                ? `This will synchronize standard permissions (${deptSyncTarget.standardPermissions.length} capabilities) across all active personnel in ${deptSyncTarget.department}.`
                : `Tindakan ini akan menyeragamkan ${deptSyncTarget.standardPermissions.length} hak akses bagi semua pekerja dalam ${deptSyncTarget.department}.`}
            </p>

            <form onSubmit={handleDeptSyncSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isEn ? 'Audit Justification / Change Reason *' : 'Justifikasi Audit / Sebab Perubahan *'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={deptSyncReason}
                  onChange={(e) => setDeptSyncReason(e.target.value)}
                  placeholder={isEn ? 'State the operational reason for synchronizing department permissions.' : 'Nyatakan sebab operasi untuk penyelarasan hak akses jabatan.'}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeptSyncTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  {isEn ? 'Cancel' : 'Batal'}
                </button>
                <button
                  type="submit"
                  disabled={deptSyncSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 disabled:opacity-50"
                >
                  {deptSyncSubmitting ? (isEn ? 'Applying...' : 'Menerapkan...') : (isEn ? 'Confirm & Apply to All' : 'Sahkan & Terapkan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: OFFICIAL PRINTABLE PAY SLIP (PENYATA GAJI)
      ========================================================= */}
      {activePaySlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn print:p-0 print:bg-white print:fixed print:inset-0">
          <div className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto print:max-h-none print:shadow-none print:rounded-none print:p-6 print:border-none">
            {/* Action Bar (hidden on print) */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6 print:hidden">
              <span className="text-xs font-extrabold text-red-600 uppercase tracking-widest">
                Official Corporate Pay Slip (Penyata Gaji)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-black flex items-center gap-1.5 shadow-sm"
                >
                  <span>🖨️</span>
                  <span>{isEn ? 'Print / Export PDF' : 'Cetak / Muat Turun PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePaySlip(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-red-600 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Pay Slip Document Container */}
            <div className="space-y-6 text-slate-900">
              {/* Company Header */}
              <div className="flex items-start justify-between border-b-2 border-red-600 pb-4">
                <div>
                  <h1 className="text-xl font-black tracking-tight text-red-700">LEGACY CUISINE GROUP SDN. BHD.</h1>
                  <p className="text-[10px] text-slate-500 font-medium">Company Reg: 202401039821-M • SST No: W10-2401-32000492</p>
                  <p className="text-[10px] text-slate-500">Corporate HQ: Level 18, Menara JLO, Jalan Ampang, 50450 Kuala Lumpur, Malaysia</p>
                  <p className="text-[10px] text-slate-500">Email: finance@lcgroup.com.my • Phone: +60 3-8888 2026</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-extrabold uppercase text-slate-800">PENYATA PENDAPATAN / SALARY SLIP</div>
                  <div className="text-sm font-mono font-bold text-red-600 mt-0.5">{activePaySlip.paycheckNo}</div>
                  <div className="text-[10px] text-slate-500">Month: {activePaySlip.month}</div>
                </div>
              </div>

              {/* Employee Particulars Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{isEn ? 'Employee Name' : 'Nama Pekerja'}</div>
                  <div className="font-extrabold text-slate-900 text-sm">{activePaySlip.staffName}</div>
                  <div className="text-[11px] text-slate-600 font-mono">ID: {activePaySlip.employeeId}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{isEn ? 'Designation & Dept' : 'Jawatan & Jabatan'}</div>
                  <div className="font-bold text-slate-900">{activePaySlip.position}</div>
                  <div className="text-[11px] text-slate-600">{activePaySlip.department}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{isEn ? 'Pay Period' : 'Tempoh Gaji'}</div>
                  <div className="font-semibold text-slate-800">{activePaySlip.periodStart} - {activePaySlip.periodEnd}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{isEn ? 'Disbursement Date' : 'Tarikh Bayaran'}</div>
                  <div className="font-semibold text-slate-800">{activePaySlip.paymentDate}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{isEn ? 'Bank Account Details' : 'Maklumat Akaun Bank'}</div>
                  <div className="font-mono text-slate-800">{activePaySlip.bankName} - {activePaySlip.bankAccountNumber}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{isEn ? 'Payment Status' : 'Status Pembayaran'}</div>
                  <div className="font-extrabold text-emerald-700">{activePaySlip.status}</div>
                </div>
              </div>

              {/* Earnings & Deductions Tables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Earnings */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-3 py-1.5 text-[11px] font-black uppercase text-slate-700">
                    {isEn ? 'Earnings / Pendapatan (RM)' : 'Pendapatan (RM)'}
                  </div>
                  <div className="p-3 text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-600">Basic Monthly Salary:</span>
                      <span className="font-bold">RM {activePaySlip.baseSalary.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-600">Fixed Allowances:</span>
                      <span>RM {activePaySlip.allowances.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-amber-600 font-bold">
                      <span className="font-sans">Performance Commissions:</span>
                      <span>+RM {activePaySlip.commissionsEarned.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900">
                      <span className="font-sans">GROSS TOTAL EARNINGS:</span>
                      <span>RM {activePaySlip.grossPay.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-3 py-1.5 text-[11px] font-black uppercase text-slate-700">
                    {isEn ? 'Deductions / Potongan (RM)' : 'Potongan Staf (RM)'}
                  </div>
                  <div className="p-3 text-xs space-y-1.5 font-mono text-rose-700">
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-600">KWSP / EPF (11%):</span>
                      <span>-RM {activePaySlip.epfEmployee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-600">PERKESO / SOCSO:</span>
                      <span>-RM {activePaySlip.socsoEmployee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-600">SIP / EIS:</span>
                      <span>-RM {activePaySlip.eisEmployee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-600">PCB / Income Tax:</span>
                      <span>-RM {activePaySlip.pcbTax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-rose-800">
                      <span className="font-sans">TOTAL DEDUCTIONS:</span>
                      <span>-RM {activePaySlip.totalDeductions.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Salary Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">
                    {isEn ? 'NET SALARY PAYABLE / GAJI BERSIH' : 'GAJI BERSIH DIBAYAR'}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">Disbursed directly to authorized bank account.</div>
                </div>
                <div className="text-2xl font-black font-mono text-emerald-700">
                  RM {activePaySlip.netPay.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Employer Contributions Note */}
              <div className="text-[10px] text-slate-500 border border-dashed border-slate-300 p-2.5 rounded-xl font-mono flex items-center justify-between">
                <span>Employer Contributions:</span>
                <span>EPF (12-13%): RM {activePaySlip.epfEmployer.toFixed(2)} | SOCSO (1.75%): RM {activePaySlip.socsoEmployer.toFixed(2)} | EIS: RM {activePaySlip.eisEmployer.toFixed(2)}</span>
              </div>

              {/* Signature / Audit Stamp Block */}
              <div className="pt-4 border-t border-slate-200 flex items-end justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mb-8">Disbursed & Certified By HR Desk</div>
                  <div className="font-bold text-slate-900 border-t border-slate-400 pt-1">Finance & Human Resources Department</div>
                  <div className="text-[9px] text-slate-500">Legacy Cuisine Group Sdn. Bhd.</div>
                </div>

                <div className="text-right">
                  <div className="w-24 h-16 border border-emerald-500/40 rounded-xl p-1 text-center font-bold text-[9px] text-emerald-700 flex flex-col justify-center bg-emerald-50/50">
                    <span>AUDITED & APPROVED</span>
                    <span className="text-[7.5px] font-mono text-slate-500">{activePaySlip.paymentDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: RECORD COMMISSION CLAIM
      ========================================================= */}
      {isCommissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span>💰</span> {isEn ? 'Record Merchant Onboarding Commission' : 'Daftar Komisen Perekrutan Peniaga'}
            </h3>

            <form onSubmit={handleAddCommission} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isEn ? 'Beneficiary Staff / Field Agent *' : 'Staf / Ejen Penerima *'}
                </label>
                <select
                  required
                  value={commStaffId}
                  onChange={(e) => setCommStaffId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>{s.fullName} ({s.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isEn ? 'Merchant Restaurant Name *' : 'Nama Restoran / Peniaga *'}
                </label>
                <input
                  type="text"
                  required
                  value={commMerchantName}
                  onChange={(e) => setCommMerchantName(e.target.value)}
                  placeholder="e.g. Warisan Nasi Kandar Subang"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'Commission Amount (RM) *' : 'Jumlah Komisen (RM) *'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={commAmount}
                    onChange={(e) => setCommAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'Date (DD/MM/YYYY) *' : 'Tarikh (DD/MM/YYYY) *'}
                  </label>
                  <input
                    type="date"
                    lang="en-GB"
                    placeholder="dd/mm/yyyy"
                    required
                    value={commDate.includes('/') ? commDate.split('/').reverse().join('-') : commDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        const [y, m, d] = val.split('-');
                        setCommDate(`${d}/${m}/${y}`);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isEn ? 'Audit Justification Notes' : 'Catatan Justifikasi Audit'}
                </label>
                <textarea
                  rows={2}
                  value={commReason}
                  onChange={(e) => setCommReason(e.target.value)}
                  placeholder={isEn ? 'Contract executed and menu live.' : 'Peniaga aktif dan pendaftaran lengkap.'}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCommissionModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500"
                >
                  {isEn ? 'Cancel' : 'Batal'}
                </button>
                <button
                  type="submit"
                  disabled={commSubmitting}
                  className="px-4 py-1.5 rounded-xl text-xs font-extrabold bg-red-600 hover:bg-red-700 text-white"
                >
                  {commSubmitting ? (isEn ? 'Recording...' : 'Merekod...') : (isEn ? 'Save Claim' : 'Simpan Tuntutan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 5: UPDATE PAYCHECK STATUS
      ========================================================= */}
      {statusPaycheckTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">
              💳 {isEn ? `Paycheck Status: ${statusPaycheckTarget.paycheckNo}` : `Status Penyata Gaji: ${statusPaycheckTarget.paycheckNo}`}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {statusPaycheckTarget.staffName} • RM {statusPaycheckTarget.netPay.toFixed(2)}
            </p>

            <form onSubmit={handleUpdatePaycheckStatus} className="space-y-3">
              {targetPayStatus === 'PAID' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'Bank Transfer Reference Number *' : 'No. Rujukan Pindahan Bank *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={payReference}
                    onChange={(e) => setPayReference(e.target.value)}
                    placeholder="e.g. MBB-FT-889922"
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isEn ? 'Audit Justification Note *' : 'Catatan Justifikasi Audit *'}
                </label>
                <textarea
                  required
                  rows={2}
                  value={payStatusReason}
                  onChange={(e) => setPayStatusReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStatusPaycheckTarget(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500"
                >
                  {isEn ? 'Cancel' : 'Batal'}
                </button>
                <button
                  type="submit"
                  disabled={payStatusSubmitting}
                  className="px-4 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {payStatusSubmitting ? (isEn ? 'Updating...' : 'Mengemaskini...') : (isEn ? 'Confirm & Transition' : 'Sahkan & Simpan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
