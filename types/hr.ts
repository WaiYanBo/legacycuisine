export interface StaffHrProfile {
  id: string; // matches user.id
  employeeId: string; // e.g. LC-EMP-001
  username: string;
  fullName: string;
  email: string;
  phone: string;
  icPassportNo: string;
  department: string;
  position: string;
  reportingTo: string;
  employmentType: 'FULL_TIME' | 'CONTRACT' | 'PROBATION' | 'INTERN' | 'COMMISSION_AGENT';
  joinDate: string; // DD/MM/YYYY
  baseSalary: number; // RM
  commissionRate: number; // % or fixed per deal
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  epfNumber: string;
  socsoNumber: string;
  taxNumber: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  role: string;
  permissions: string[];
  isActive: boolean;
  status: 'ACTIVE' | 'ON_LEAVE' | 'PROBATION' | 'RESIGNED';
}

export interface PaycheckRecord {
  id: string;
  paycheckNo: string; // e.g. LC-PAY-202610-001
  staffId: string;
  staffName: string;
  employeeId: string;
  department: string;
  position: string;
  month: string; // e.g. "2026-10"
  periodStart: string; // DD/MM/YYYY
  periodEnd: string; // DD/MM/YYYY
  paymentDate: string; // DD/MM/YYYY
  baseSalary: number;
  allowances: number;
  commissionsEarned: number;
  grossPay: number;
  epfEmployee: number; // 11%
  socsoEmployee: number; // 0.5%
  eisEmployee: number; // 0.2%
  pcbTax: number;
  totalDeductions: number;
  netPay: number;
  epfEmployer: number; // 12% - 13%
  socsoEmployer: number; // 1.75%
  eisEmployer: number; // 0.2%
  bankName: string;
  bankAccountNumber: string;
  status: 'DRAFT' | 'APPROVED' | 'PAID' | 'VOIDED';
  paymentReference?: string;
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
}

export interface CommissionRecord {
  id: string;
  claimNo: string; // e.g. LC-COM-2026-001
  staffId: string;
  staffName: string;
  employeeId: string;
  department: string;
  merchantName: string;
  merchantRef?: string;
  activityType: 'MERCHANT_ONBOARDING' | 'SALES_MILESTONE' | 'RENEWAL' | 'BONUS';
  amount: number;
  date: string; // DD/MM/YYYY
  status: 'PENDING' | 'VERIFIED' | 'PAID_IN_PAYROLL' | 'REJECTED';
  verifiedBy?: string;
  verifiedAt?: string;
  paycheckMonth?: string;
  notes?: string;
}

export interface AuditLogRecord {
  id: string;
  auditHash: string; // SHA-256 immutable digest
  timestamp: string; // DD/MM/YYYY HH:mm:ss
  action: 
    | 'STAFF_ONBOARDED'
    | 'ACCESS_PROMOTED'
    | 'ACCESS_REVOKED'
    | 'PERMISSIONS_UPDATED'
    | 'DEPARTMENT_POLICY_SYNC'
    | 'STAFF_ASSIGNMENT_UPDATED'
    | 'PAYROLL_BATCH_GENERATED'
    | 'PAYCHECK_APPROVED'
    | 'PAYCHECK_DISBURSED'
    | 'COMMISSION_RECORDED'
    | 'COMMISSION_VERIFIED'
    | 'STATUS_CHANGED';
  actorUsername: string;
  actorRole: string;
  actorIp?: string;
  targetId: string;
  targetName: string;
  department: string;
  reason: string;
  details: {
    previousState?: any;
    newState?: any;
    changesSummary?: string;
  };
  integrityVerified: boolean;
}

export interface DepartmentPolicy {
  department: string;
  headOfDepartment: string;
  standardRole: string;
  standardPermissions: string[];
  description: string;
  descriptionMs: string;
}

export const DEFAULT_DEPARTMENT_POLICIES: DepartmentPolicy[] = [
  {
    department: 'Executive Management',
    headOfDepartment: 'Mohd Shahril Bin Abd Rani (CEO)',
    standardRole: 'SUPER_ADMIN',
    standardPermissions: [
      'admin:all',
      'dashboard:view',
      'analytics:view',
      'reconciliation:process',
      'invoices:generate',
      'products:edit',
      'forms:submit',
      'forms:review',
      'users:manage',
      'hr:view',
      'hr:manage',
      'finance:payout',
      'audit:view',
    ],
    description: 'Executive leadership with unrestricted strategic oversight and authority.',
    descriptionMs: 'Kepimpinan eksekutif dengan akses penuh dan pengawasan strategik.',
  },
  {
    department: 'IT & Systems Administration',
    headOfDepartment: 'Wai Yan Bo (IT Lead)',
    standardRole: 'SUPER_ADMIN',
    standardPermissions: [
      'admin:all',
      'dashboard:view',
      'analytics:view',
      'reconciliation:process',
      'invoices:generate',
      'products:edit',
      'forms:submit',
      'forms:review',
      'users:manage',
      'hr:view',
      'hr:manage',
      'finance:payout',
      'audit:view',
    ],
    description: 'Core infrastructure, security engineering, and system administration.',
    descriptionMs: 'Infrastruktur sistem, keselamatan perisian, dan pentadbiran sistem.',
  },
  {
    department: 'Human Resources',
    headOfDepartment: 'HR Operations Lead',
    standardRole: 'MANAGER',
    standardPermissions: [
      'hr:view',
      'hr:manage',
      'users:manage',
      'audit:view',
      'dashboard:view',
      'forms:submit',
      'forms:review',
    ],
    description: 'Talent management, staff onboarding, payroll processing, and audit compliance.',
    descriptionMs: 'Pengurusan bakat, kemasukan staf, lejar gaji dan audit pematuhan.',
  },
  {
    department: 'Finance & Accounts',
    headOfDepartment: 'Hafiz (CFO) / Finance Lead',
    standardRole: 'MANAGER',
    standardPermissions: [
      'dashboard:view',
      'analytics:view',
      'invoices:generate',
      'reconciliation:process',
      'finance:payout',
      'hr:view',
      'audit:view',
    ],
    description: 'Financial ledger reconciliations, billing generation, and payout disbursements.',
    descriptionMs: 'Rekonsiliasi lejar kewangan, penjanaan invois peniaga, dan lejar pembayaran.',
  },
  {
    department: 'Operations & Reconciliation',
    headOfDepartment: 'Operations Coordinator',
    standardRole: 'STAFF',
    standardPermissions: [
      'dashboard:view',
      'reconciliation:process',
      'invoices:generate',
      'products:edit',
      'forms:review',
    ],
    description: 'Daily order reconciliations, merchant storefront sync, and price ledger audits.',
    descriptionMs: 'Rekonsiliasi pesanan harian Grab, semakan harga produk dan audit pendaftaran.',
  },
  {
    department: 'Field Recruitment',
    headOfDepartment: 'Field Recruitment Supervisor',
    standardRole: 'AGENT',
    standardPermissions: [
      'forms:submit',
      'forms:review',
      'dashboard:view',
    ],
    description: 'On-ground merchant onboarding, restaurant verification, and commission tracking.',
    descriptionMs: 'Perekrutan peniaga lapangan, semakan premis makanan, dan penjejakan komisen.',
  },
  {
    department: 'Customer Support & Logistics',
    headOfDepartment: 'Support Specialist',
    standardRole: 'STAFF',
    standardPermissions: [
      'dashboard:view',
      'forms:submit',
    ],
    description: 'Helpdesk inquiries, merchant issue resolution, and operational communications.',
    descriptionMs: 'Meja bantuan, penyelesaian masalah operasi peniaga dan sokongan teknikal.',
  },
];
