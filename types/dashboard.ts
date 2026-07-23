export interface ProductMaster {
  id: string;
  storefrontId: string;
  sku: string;
  name: string;
  restaurantBasePrice: number;
  grabExpectedPrice: number | null;
  needsReview: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GrabOrder {
  id: string;
  storefrontId: string;
  grabOrderId: string;
  grabEmail: string;
  orderDate: string;
  rawSubtotal: number;
  rawDeliveryFee: number;
  rawTax: number;
  rawGrabCommission: number;
  totalCollectedByGrab: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReconciliationLog {
  id: string;
  grabOrderId: string;
  totalGrabAmount: number;
  totalVendorPayout: number;
  clientGrossProfit: number;
  adjustmentAmount: number;
  adjustmentNote: string | null;
  status: 'PENDING' | 'RECONCILED' | 'INVOICED' | 'PAID';
  invoiceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalPayouts: number;
  netProfit: number;
  chartData: ChartDataPoint[];
  storefrontsPerformance?: StorefrontPerformance[];
}

export interface StorefrontPerformance {
  name: string;
  email: string;
  revenue: number;
  payout: number;
  profit: number;
  count: number;
}

export interface ChartDataPoint {
  date: string; // YYYY-MM-DD
  vendorPayouts: number;
  clientProfit: number;
}
