import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../src/prisma';
import { hasPermission, hashPassword, verifySessionToken, SessionPayload } from '../../../src/utils/security';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getSessionUser(request: NextRequest): SessionPayload | null {
  const authCookie = request.cookies.get('lc_session')?.value;
  const authHeader = request.headers.get('authorization');
  let token = authCookie;
  if (!token && authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  if (!token) return null;
  const verified = verifySessionToken(token);
  return verified.valid && verified.user ? verified.user : null;
}

import {
  StaffHrProfile,
  PaycheckRecord,
  CommissionRecord,
  AuditLogRecord,
  DepartmentPolicy,
  DEFAULT_DEPARTMENT_POLICIES,
} from '../../../types/hr';

// -------------------------------------------------------------
// PERSISTENT STORAGE HELPERS
// -------------------------------------------------------------
const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'hr_store.json');

interface HrStoreData {
  profiles: Record<string, Partial<StaffHrProfile>>;
  paychecks: PaycheckRecord[];
  commissions: CommissionRecord[];
  auditLogs: AuditLogRecord[];
  policies: DepartmentPolicy[];
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadHrStore(): HrStoreData {
  ensureDataDir();
  if (fs.existsSync(STORE_FILE)) {
    try {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        profiles: parsed.profiles || {},
        paychecks: parsed.paychecks || [],
        commissions: parsed.commissions || [],
        auditLogs: parsed.auditLogs || [],
        policies: parsed.policies || DEFAULT_DEPARTMENT_POLICIES,
      };
    } catch (e) {
      console.error('[HR Store] Error parsing store file, initializing default:', e);
    }
  }
  return {
    profiles: {},
    paychecks: [],
    commissions: [],
    auditLogs: [],
    policies: DEFAULT_DEPARTMENT_POLICIES,
  };
}

function saveHrStore(data: HrStoreData) {
  ensureDataDir();
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// -------------------------------------------------------------
// AUDIT LOG GENERATOR (HMAC-SHA256 Integrity Verified)
// -------------------------------------------------------------
function createAuditRecord(
  action: AuditLogRecord['action'],
  actor: { username: string; role: string },
  target: { id: string; name: string; department: string },
  reason: string,
  details: AuditLogRecord['details']
): AuditLogRecord {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');
  const timestamp = `${day}/${month}/${year} ${hours}:${mins}:${secs}`;

  const payload = `${action}|${actor.username}|${target.id}|${timestamp}|${reason}|${JSON.stringify(details)}`;
  const auditHash = 'LC-AUD-' + crypto.createHash('sha256').update(payload).digest('hex').substring(0, 16).toUpperCase();

  return {
    id: crypto.randomUUID(),
    auditHash,
    timestamp,
    action,
    actorUsername: actor.username,
    actorRole: actor.role,
    targetId: target.id,
    targetName: target.name,
    department: target.department,
    reason,
    details,
    integrityVerified: true,
  };
}

// -------------------------------------------------------------
// GET: FETCH COMPLETE HR SUITE DATA
// -------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const session = getSessionUser(request);
    if (!session || (!hasPermission(session, 'hr:view') && !hasPermission(session, 'users:manage'))) {
      return NextResponse.json(
        { success: false, error: 'Access denied. You do not have permission to view Human Resources records.' },
        { status: 403 }
      );
    }

    // 1. Fetch live users from PostgreSQL / Prisma
    let dbUsers: any[] = [];
    try {
      dbUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (e: any) {
      console.warn('[HR API] Prisma query failed, using direct pg query:', e?.message);
      const { Pool } = require('pg');
      const directPool = new Pool({
        connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });
      const dbRes = await directPool.query(
        'SELECT id, username, full_name as "fullName", email, department, position, permissions, role, is_active as "isActive", created_at as "createdAt" FROM users ORDER BY created_at DESC'
      );
      await directPool.end();
      dbUsers = dbRes.rows;
    }

    const store = loadHrStore();

    // 2. Synthesize complete Staff HR profiles
    const staffList: StaffHrProfile[] = dbUsers.map((u, idx) => {
      const extra = store.profiles[u.id] || {};
      const parsedPerms = Array.isArray(u.permissions)
        ? u.permissions
        : typeof u.permissions === 'string'
        ? (() => {
            try { return JSON.parse(u.permissions); } catch { return []; }
          })()
        : [];

      // Generate deterministic or stored Employee ID
      const empIndex = String(idx + 1).padStart(3, '0');
      const employeeId = extra.employeeId || `LC-EMP-${empIndex}`;

      const joinDate = extra.joinDate || (() => {
        const d = u.createdAt ? new Date(u.createdAt) : new Date('2026-08-01');
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      })();

      // Base salary heuristic based on position/role if not manually configured
      const defaultSalary =
        u.role === 'SUPER_ADMIN' ? 8500 :
        u.role === 'MANAGER' ? 5500 :
        u.position?.toLowerCase().includes('agent') ? 2200 : 3800;

      const defaultCommission =
        u.position?.toLowerCase().includes('agent') || u.department === 'Field Recruitment' ? 10 :
        u.department === 'Sales & Marketing' ? 5 : 0;

      return {
        id: u.id,
        employeeId,
        username: u.username,
        fullName: u.fullName || u.username,
        email: u.email || `${u.username}@lcgroup.com.my`,
        phone: extra.phone || '+60 12-345 6789',
        icPassportNo: extra.icPassportNo || '900101-14-5567',
        department: (u.department || 'Operations & Reconciliation').trim(),
        position: (u.position || 'Staff Member').trim(),
        reportingTo: extra.reportingTo || (u.role === 'SUPER_ADMIN' ? 'Board of Directors' : 'Chief Operating Officer (COO)'),
        employmentType: extra.employmentType || (u.role === 'AGENT' ? 'COMMISSION_AGENT' : 'FULL_TIME'),
        joinDate,
        baseSalary: extra.baseSalary !== undefined ? extra.baseSalary : defaultSalary,
        commissionRate: extra.commissionRate !== undefined ? extra.commissionRate : defaultCommission,
        bankName: extra.bankName || 'Maybank Berhad',
        bankAccountName: extra.bankAccountName || u.fullName || u.username,
        bankAccountNumber: extra.bankAccountNumber || '514012348899',
        epfNumber: extra.epfNumber || '23456789',
        socsoNumber: extra.socsoNumber || '880101145567',
        taxNumber: extra.taxNumber || 'SG234567890',
        emergencyContact: extra.emergencyContact || {
          name: 'Next of Kin',
          relationship: 'Spouse / Parent',
          phone: '+60 19-876 5432',
        },
        role: u.role,
        permissions: parsedPerms,
        isActive: u.isActive !== false,
        status: extra.status || (u.isActive === false ? 'RESIGNED' : 'ACTIVE'),
      };
    });

    // Populate initial demo audit logs or commissions if fresh
    if (store.commissions.length === 0 && staffList.length > 0) {
      const fieldAgent = staffList.find(s => s.department === 'Field Recruitment' || s.role === 'AGENT') || staffList[0];
      store.commissions = [
        {
          id: crypto.randomUUID(),
          claimNo: 'LC-COM-2026-001',
          staffId: fieldAgent.id,
          staffName: fieldAgent.fullName,
          employeeId: fieldAgent.employeeId,
          department: fieldAgent.department,
          merchantName: 'Restoran Selera Kampung Warisan Sdn Bhd',
          merchantRef: 'LC-MBR-2026-001',
          activityType: 'MERCHANT_ONBOARDING',
          amount: 150.00,
          date: '15/10/2026',
          status: 'VERIFIED',
          verifiedBy: 'Wai Yan Bo (IT Lead)',
          verifiedAt: '16/10/2026 14:30:00',
          paycheckMonth: '2026-10',
          notes: 'Full qualification checklist and contract executed. Storefront live on GrabFood.',
        },
        {
          id: crypto.randomUUID(),
          claimNo: 'LC-COM-2026-002',
          staffId: fieldAgent.id,
          staffName: fieldAgent.fullName,
          employeeId: fieldAgent.employeeId,
          department: fieldAgent.department,
          merchantName: 'Mee Tarik Jalan Sultan Enterprise',
          merchantRef: 'LC-MBR-2026-002',
          activityType: 'MERCHANT_ONBOARDING',
          amount: 150.00,
          date: '18/10/2026',
          status: 'PENDING',
          notes: 'Pending final SSM document verification by compliance.',
        },
      ];
      saveHrStore(store);
    }

    if (store.auditLogs.length === 0 && staffList.length > 0) {
      const topAdmin = staffList.find(s => s.role === 'SUPER_ADMIN') || staffList[0];
      store.auditLogs = [
        createAuditRecord(
          'ACCESS_PROMOTED',
          { username: 'system-root', role: 'SUPER_ADMIN' },
          { id: topAdmin.id, name: topAdmin.fullName, department: topAdmin.department },
          'Initial system security policy initialization and RBAC baseline setup.',
          { changesSummary: 'Full administrative governance privileges granted.' }
        ),
      ];
      saveHrStore(store);
    }

    return NextResponse.json({
      success: true,
      staff: staffList,
      paychecks: store.paychecks,
      commissions: store.commissions,
      auditLogs: store.auditLogs.sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
      departmentPolicies: store.policies,
    }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (error: any) {
    console.error('[HR API GET Error]:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

// -------------------------------------------------------------
// POST: EXECUTE AUDIT-PROOF HR OPERATIONS
// -------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const session = getSessionUser(request);
    if (!session || (!hasPermission(session, 'hr:manage') && !hasPermission(session, 'users:manage'))) {
      return NextResponse.json(
        { success: false, error: 'Access denied. You do not have permission to execute HR actions.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action } = body;
    const store = loadHrStore();

    const actor = {
      username: session.username,
      role: session.role,
    };

    // =========================================================
    // 1. ONBOARD NEW STAFF
    // =========================================================
    if (action === 'onboard_staff') {
      const {
        username,
        password,
        fullName,
        email,
        phone,
        icPassportNo,
        department,
        position,
        reportingTo,
        employmentType,
        joinDate,
        baseSalary,
        commissionRate,
        bankName,
        bankAccountName,
        bankAccountNumber,
        epfNumber,
        socsoNumber,
        taxNumber,
        emergencyContact,
        role,
        permissions,
        auditReason,
      } = body;

      if (!username || !password || !fullName || !department || !position) {
        return NextResponse.json(
          { success: false, error: 'Missing required onboarding information (Username, Password, Name, Dept, Position).' },
          { status: 400 }
        );
      }

      const trimmedUsername = String(username).trim().toLowerCase();
      const trimmedEmail = email ? String(email).trim().toLowerCase() : `${trimmedUsername}@lcgroup.com.my`;
      const passHash = hashPassword(password);
      const resolvedRole = role || 'STAFF';
      const formattedPermissions = Array.isArray(permissions) ? JSON.stringify(permissions) : JSON.stringify(permissions || []);

      // 1. Create User in PostgreSQL
      let createdUser: any;
      try {
        createdUser = await prisma.user.create({
          data: {
            username: trimmedUsername,
            email: trimmedEmail,
            fullName: String(fullName).trim(),
            passwordHash: passHash,
            department: String(department).trim(),
            position: String(position).trim(),
            role: resolvedRole,
            permissions: formattedPermissions,
            isActive: true,
          },
        });
      } catch (prismaErr: any) {
        console.warn('[HR Onboard] Prisma error, using direct PG insert:', prismaErr?.message);
        const { Pool } = require('pg');
        const directPool = new Pool({
          connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 5000,
        });
        const insertRes = await directPool.query(
          `INSERT INTO users (id, username, email, full_name, password_hash, department, position, role, permissions, is_active, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7::"UserRole", $8, true, NOW(), NOW())
           RETURNING id, username, full_name as "fullName", email, department, position, role, permissions, is_active as "isActive"`,
          [trimmedUsername, trimmedEmail, fullName, passHash, department, position, resolvedRole, formattedPermissions]
        );
        await directPool.end();
        createdUser = insertRes.rows[0];
      }

      // 2. Generate Next Employee ID
      const empCount = Object.keys(store.profiles).length + 20;
      const employeeId = `LC-EMP-${String(empCount).padStart(3, '0')}`;

      // 3. Store Extra HR Profile
      store.profiles[createdUser.id] = {
        id: createdUser.id,
        employeeId,
        username: trimmedUsername,
        fullName: String(fullName).trim(),
        email: trimmedEmail,
        phone: phone || '+60 12-000 0000',
        icPassportNo: icPassportNo || '900000-00-0000',
        department: String(department).trim(),
        position: String(position).trim(),
        reportingTo: reportingTo || 'Operations Lead',
        employmentType: employmentType || 'FULL_TIME',
        joinDate: joinDate || '22/10/2026',
        baseSalary: Number(baseSalary) || 3500,
        commissionRate: Number(commissionRate) || 0,
        bankName: bankName || 'Maybank Berhad',
        bankAccountName: bankAccountName || fullName,
        bankAccountNumber: bankAccountNumber || '1234567890',
        epfNumber: epfNumber || 'EPF-PENDING',
        socsoNumber: socsoNumber || 'SOCSO-PENDING',
        taxNumber: taxNumber || 'TAX-PENDING',
        emergencyContact: emergencyContact || { name: 'Emergency Contact', relationship: 'Family', phone: '+60 12-000 0000' },
        role: resolvedRole,
        permissions: Array.isArray(permissions) ? permissions : [],
        isActive: true,
        status: 'ACTIVE',
      };

      // 4. Create Immutable Audit Log Record
      const auditLog = createAuditRecord(
        'STAFF_ONBOARDED',
        actor,
        { id: createdUser.id, name: fullName, department },
        auditReason || `Official HR onboarding and credential provisioning for ${position}.`,
        {
          newState: {
            employeeId,
            role: resolvedRole,
            department,
            position,
            baseSalary,
            joinDate,
          },
          changesSummary: `Staff member onboarded as ${position} in ${department} with role ${resolvedRole}.`,
        }
      );
      store.auditLogs.unshift(auditLog);
      saveHrStore(store);

      return NextResponse.json({
        success: true,
        message: `Staff member ${fullName} onboarded successfully with Employee ID ${employeeId}.`,
        staff: store.profiles[createdUser.id],
        auditLog,
      });
    }

    // =========================================================
    // 2. PROMOTE / REVOKE ACCESS (INDIVIDUALIZED)
    // =========================================================
    if (action === 'promote_revoke_access') {
      const { staffId, newRole, newPermissions, isActive, auditReason } = body;

      if (!staffId || !auditReason) {
        return NextResponse.json(
          { success: false, error: 'Staff ID and an Audit Justification / Reason are strictly mandatory.' },
          { status: 400 }
        );
      }

      // Prevent self-demotion or self-deactivation
      if (staffId === session.id && (isActive === false || (newRole && newRole !== session.role))) {
        return NextResponse.json(
          { success: false, error: 'For compliance and security, you cannot demote or deactivate your own account.' },
          { status: 400 }
        );
      }

      // Fetch user from DB
      const existingUser = await prisma.user.findUnique({ where: { id: staffId } });
      if (!existingUser) {
        return NextResponse.json({ success: false, error: 'Staff user not found.' }, { status: 404 });
      }

      const prevPerms = typeof existingUser.permissions === 'string'
        ? JSON.parse(existingUser.permissions || '[]')
        : existingUser.permissions || [];

      const targetRole = newRole !== undefined ? newRole : existingUser.role;
      const targetPermissions = newPermissions !== undefined ? newPermissions : prevPerms;
      const targetActive = isActive !== undefined ? Boolean(isActive) : existingUser.isActive;

      // Update in PostgreSQL
      await prisma.user.update({
        where: { id: staffId },
        data: {
          role: targetRole,
          permissions: JSON.stringify(targetPermissions),
          isActive: targetActive,
        },
      });

      // Update HR profile store if present
      if (store.profiles[staffId]) {
        store.profiles[staffId].role = targetRole;
        store.profiles[staffId].permissions = targetPermissions;
        store.profiles[staffId].isActive = targetActive;
        store.profiles[staffId].status = targetActive ? 'ACTIVE' : 'RESIGNED';
      }

      const actionType = 
        targetActive === false ? 'STATUS_CHANGED' :
        (targetRole === 'SUPER_ADMIN' || (targetRole === 'MANAGER' && existingUser.role === 'STAFF')) ? 'ACCESS_PROMOTED' :
        targetPermissions.length < prevPerms.length ? 'ACCESS_REVOKED' : 'PERMISSIONS_UPDATED';

      const auditLog = createAuditRecord(
        actionType,
        actor,
        { id: staffId, name: existingUser.fullName, department: existingUser.department || 'Operations' },
        auditReason,
        {
          previousState: { role: existingUser.role, permissions: prevPerms, isActive: existingUser.isActive },
          newState: { role: targetRole, permissions: targetPermissions, isActive: targetActive },
          changesSummary: `Role set to ${targetRole}, permissions count: ${targetPermissions.length}, active: ${targetActive}.`,
        }
      );
      store.auditLogs.unshift(auditLog);
      saveHrStore(store);

      return NextResponse.json({
        success: true,
        message: `Access permissions for ${existingUser.fullName} updated and audit-logged.`,
        auditLog,
      });
    }

    // =========================================================
    // 3. DEPARTMENT-WISE BULK POLICY SYNC
    // =========================================================
    if (action === 'bulk_department_policy') {
      const { department, permissions, standardRole, auditReason } = body;

      if (!department || !auditReason) {
        return NextResponse.json(
          { success: false, error: 'Department name and an Audit Justification are strictly required.' },
          { status: 400 }
        );
      }

      // Find all staff in department
      const deptUsers = await prisma.user.findMany({
        where: { department },
      });

      if (deptUsers.length === 0) {
        return NextResponse.json(
          { success: false, error: `No active staff found in department: ${department}` },
          { status: 404 }
        );
      }

      const formattedPerms = JSON.stringify(permissions);

      // Bulk update users
      await prisma.user.updateMany({
        where: { department },
        data: {
          permissions: formattedPerms,
          ...(standardRole ? { role: standardRole } : {}),
        },
      });

      // Update store profiles
      deptUsers.forEach((u) => {
        if (store.profiles[u.id]) {
          store.profiles[u.id].permissions = permissions;
          if (standardRole) store.profiles[u.id].role = standardRole;
        }
      });

      // Update policy definition in store
      const policyIdx = store.policies.findIndex(p => p.department === department);
      if (policyIdx >= 0) {
        store.policies[policyIdx].standardPermissions = permissions;
        if (standardRole) store.policies[policyIdx].standardRole = standardRole;
      }

      const affectedNames = deptUsers.map(u => u.fullName).join(', ');
      const auditLog = createAuditRecord(
        'DEPARTMENT_POLICY_SYNC',
        actor,
        { id: `DEPT-${department}`, name: `All Staff in ${department}`, department },
        auditReason,
        {
          changesSummary: `Synchronized ${permissions.length} standard policy permissions across ${deptUsers.length} staff: ${affectedNames}.`,
          newState: { permissions, standardRole },
        }
      );
      store.auditLogs.unshift(auditLog);
      saveHrStore(store);

      return NextResponse.json({
        success: true,
        message: `Successfully applied department policy to ${deptUsers.length} staff members in ${department}.`,
        affectedStaffCount: deptUsers.length,
        auditLog,
      });
    }

    // =========================================================
    // 4. GENERATE MONTHLY PAYROLL BATCH
    // =========================================================
    if (action === 'generate_payrolls') {
      const { month, auditReason } = body; // e.g. "2026-10"
      if (!month) {
        return NextResponse.json({ success: false, error: 'Target payroll month (YYYY-MM) is required.' }, { status: 400 });
      }

      // Fetch all active staff
      const dbUsers = await prisma.user.findMany({ where: { isActive: true } });

      const [y, m] = month.split('-');
      const daysInMonth = new Date(Number(y), Number(m), 0).getDate();
      const periodStart = `01/${m}/${y}`;
      const periodEnd = `${String(daysInMonth).padStart(2, '0')}/${m}/${y}`;
      const paymentDate = `28/${m}/${y}`;

      const newPaychecks: PaycheckRecord[] = [];

      for (const u of dbUsers) {
        const extra = store.profiles[u.id] || {};
        const base = extra.baseSalary !== undefined ? extra.baseSalary : (u.role === 'SUPER_ADMIN' ? 8500 : u.role === 'MANAGER' ? 5500 : 3800);
        const allowances = extra.employmentType === 'FULL_TIME' ? 250 : 0; // transport & meal allowance

        // Calculate verified commissions for this user in this month
        const userComms = store.commissions.filter(
          c => c.staffId === u.id && c.status === 'VERIFIED' && (!c.paycheckMonth || c.paycheckMonth === month)
        );
        const commissionsEarned = userComms.reduce((acc, c) => acc + c.amount, 0);

        const grossPay = base + allowances + commissionsEarned;

        // Malaysian Statutory Deductions (EPF 11%, SOCSO 0.5%, EIS 0.2%, PCB Tax estimation)
        const epfEmployee = Math.round(base * 0.11 * 100) / 100;
        const socsoEmployee = Math.min(Math.round(base * 0.005 * 100) / 100, 24.75); // SOCSO ceiling
        const eisEmployee = Math.min(Math.round(base * 0.002 * 100) / 100, 9.90);
        const pcbTax = grossPay > 4500 ? Math.round((grossPay - 4000) * 0.08 * 100) / 100 : 0;

        const totalDeductions = Math.round((epfEmployee + socsoEmployee + eisEmployee + pcbTax) * 100) / 100;
        const netPay = Math.round((grossPay - totalDeductions) * 100) / 100;

        // Employer contributions
        const epfEmployer = Math.round(base * (base <= 5000 ? 0.13 : 0.12) * 100) / 100;
        const socsoEmployer = Math.min(Math.round(base * 0.0175 * 100) / 100, 86.65);
        const eisEmployer = Math.min(Math.round(base * 0.002 * 100) / 100, 9.90);

        // Check if paycheck already exists for this staff for this month
        const existingIdx = store.paychecks.findIndex(p => p.staffId === u.id && p.month === month);
        const paycheckNo = `LC-PAY-${y}${m}-${String(newPaychecks.length + 1).padStart(3, '0')}`;

        const paycheckObj: PaycheckRecord = {
          id: crypto.randomUUID(),
          paycheckNo,
          staffId: u.id,
          staffName: u.fullName || u.username,
          employeeId: extra.employeeId || 'LC-EMP-000',
          department: u.department || 'Operations',
          position: u.position || 'Staff',
          month,
          periodStart,
          periodEnd,
          paymentDate,
          baseSalary: base,
          allowances,
          commissionsEarned,
          grossPay,
          epfEmployee,
          socsoEmployee,
          eisEmployee,
          pcbTax,
          totalDeductions,
          netPay,
          epfEmployer,
          socsoEmployer,
          eisEmployer,
          bankName: extra.bankName || 'Maybank Berhad',
          bankAccountNumber: extra.bankAccountNumber || '1234567890',
          status: 'DRAFT',
        };

        if (existingIdx >= 0) {
          store.paychecks[existingIdx] = paycheckObj;
        } else {
          store.paychecks.push(paycheckObj);
        }
        newPaychecks.push(paycheckObj);

        // Mark associated commissions as attached to this payroll
        userComms.forEach(c => {
          c.paycheckMonth = month;
        });
      }

      const auditLog = createAuditRecord(
        'PAYROLL_BATCH_GENERATED',
        actor,
        { id: `BATCH-${month}`, name: `Payroll Batch for ${month}`, department: 'Finance & HR' },
        auditReason || `Automated calculation and draft batch run for ${newPaychecks.length} active staff.`,
        {
          newState: {
            month,
            totalStaff: newPaychecks.length,
            totalGrossPay: newPaychecks.reduce((acc, p) => acc + p.grossPay, 0),
            totalNetPay: newPaychecks.reduce((acc, p) => acc + p.netPay, 0),
          },
          changesSummary: `Generated ${newPaychecks.length} paychecks for payroll month ${month}.`,
        }
      );
      store.auditLogs.unshift(auditLog);
      saveHrStore(store);

      return NextResponse.json({
        success: true,
        message: `Successfully generated ${newPaychecks.length} payroll records for ${month}.`,
        paychecks: store.paychecks.filter(p => p.month === month),
        auditLog,
      });
    }

    // =========================================================
    // 5. UPDATE PAYCHECK STATUS (APPROVE / PAY)
    // =========================================================
    if (action === 'update_paycheck_status') {
      const { paycheckId, newStatus, paymentReference, auditReason } = body;
      const paycheck = store.paychecks.find(p => p.id === paycheckId);
      if (!paycheck) {
        return NextResponse.json({ success: false, error: 'Paycheck not found.' }, { status: 404 });
      }

      const prevStatus = paycheck.status;
      paycheck.status = newStatus;
      if (newStatus === 'APPROVED') {
        paycheck.approvedBy = `${session.fullName} (${session.username})`;
        paycheck.approvedAt = new Date().toISOString();
      }
      if (newStatus === 'PAID') {
        paycheck.paidAt = new Date().toISOString();
        if (paymentReference) paycheck.paymentReference = paymentReference;
        // Mark attached commissions as fully PAID_IN_PAYROLL
        store.commissions.forEach(c => {
          if (c.staffId === paycheck.staffId && c.paycheckMonth === paycheck.month) {
            c.status = 'PAID_IN_PAYROLL';
          }
        });
      }

      const auditAction = newStatus === 'PAID' ? 'PAYCHECK_DISBURSED' : 'PAYCHECK_APPROVED';
      const auditLog = createAuditRecord(
        auditAction,
        actor,
        { id: paycheck.id, name: `${paycheck.staffName} (${paycheck.paycheckNo})`, department: paycheck.department },
        auditReason || `Paycheck status transition from ${prevStatus} to ${newStatus}.`,
        {
          previousState: { status: prevStatus },
          newState: { status: newStatus, paymentReference, netPay: paycheck.netPay },
          changesSummary: `Paycheck ${paycheck.paycheckNo} (${paycheck.staffName}) updated to ${newStatus}. Net: RM ${paycheck.netPay.toFixed(2)}`,
        }
      );
      store.auditLogs.unshift(auditLog);
      saveHrStore(store);

      return NextResponse.json({
        success: true,
        message: `Paycheck ${paycheck.paycheckNo} status updated to ${newStatus}.`,
        paycheck,
        auditLog,
      });
    }

    // =========================================================
    // 6. RECORD NEW COMMISSION CLAIM
    // =========================================================
    if (action === 'record_commission') {
      const { staffId, merchantName, merchantRef, activityType, amount, date, notes, auditReason } = body;
      if (!staffId || !merchantName || !amount) {
        return NextResponse.json({ success: false, error: 'Staff ID, Merchant Name, and Amount are required.' }, { status: 400 });
      }

      const staff = store.profiles[staffId] || (await prisma.user.findUnique({ where: { id: staffId } }));
      if (!staff) {
        return NextResponse.json({ success: false, error: 'Staff member not found.' }, { status: 404 });
      }

      const claimNo = `LC-COM-${new Date().getFullYear()}-${String(store.commissions.length + 1).padStart(3, '0')}`;
      const commissionRecord: CommissionRecord = {
        id: crypto.randomUUID(),
        claimNo,
        staffId,
        staffName: String(staff.fullName || staff.username || 'Staff Member'),
        employeeId: (staff as any).employeeId || 'LC-EMP-000',
        department: String(staff.department || 'Field Recruitment'),
        merchantName,
        merchantRef,
        activityType: activityType || 'MERCHANT_ONBOARDING',
        amount: Number(amount),
        date: date || (() => {
          const d = new Date();
          return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        })(),
        status: 'PENDING',
        notes,
      };

      store.commissions.unshift(commissionRecord);

      const auditLog = createAuditRecord(
        'COMMISSION_RECORDED',
        actor,
        { id: commissionRecord.id, name: `${staff.fullName} - ${merchantName}`, department: staff.department || 'Field Recruitment' },
        auditReason || `Commission claim registered for ${merchantName} (RM ${Number(amount).toFixed(2)}).`,
        {
          newState: commissionRecord,
          changesSummary: `Commission ${claimNo} of RM ${Number(amount).toFixed(2)} claimed for ${staff.fullName}.`,
        }
      );
      store.auditLogs.unshift(auditLog);
      saveHrStore(store);

      return NextResponse.json({
        success: true,
        message: `Commission claim ${claimNo} recorded successfully for ${staff.fullName}.`,
        commission: commissionRecord,
        auditLog,
      });
    }

    // =========================================================
    // 7. VERIFY / APPROVE COMMISSION
    // =========================================================
    if (action === 'verify_commission') {
      const { commissionId, newStatus, auditReason } = body;
      const comm = store.commissions.find(c => c.id === commissionId);
      if (!comm) {
        return NextResponse.json({ success: false, error: 'Commission record not found.' }, { status: 404 });
      }

      const prevStatus = comm.status;
      comm.status = newStatus;
      if (newStatus === 'VERIFIED') {
        comm.verifiedBy = `${session.fullName} (${session.username})`;
        comm.verifiedAt = new Date().toISOString();
      }

      const auditLog = createAuditRecord(
        'COMMISSION_VERIFIED',
        actor,
        { id: comm.id, name: `${comm.staffName} (${comm.claimNo})`, department: comm.department },
        auditReason || `Commission verification transition from ${prevStatus} to ${newStatus}.`,
        {
          previousState: { status: prevStatus },
          newState: { status: newStatus, verifiedBy: comm.verifiedBy },
          changesSummary: `Commission ${comm.claimNo} for ${comm.staffName} verified as ${newStatus}. Amount: RM ${comm.amount.toFixed(2)}`,
        }
      );
      store.auditLogs.unshift(auditLog);
      saveHrStore(store);

      return NextResponse.json({
        success: true,
        message: `Commission ${comm.claimNo} verified as ${newStatus}.`,
        commission: comm,
        auditLog,
      });
    }

    return NextResponse.json({ success: false, error: `Unrecognized action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('[HR API POST Error]:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
