import React, { useState, useEffect } from 'react';

interface Storefront {
  id: string;
  name: string;
  grabEmail: string;
  isActive: boolean;
  _count?: {
    grabOrders: number;
  };
}

interface Vendor {
  id: string;
  name: string;
  businessName: string;
  contactEmail: string;
  contactPhone: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  storefronts: Storefront[];
}

export const VendorsView: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [showVendorModal, setShowVendorModal] = useState<boolean>(false);
  const [showStorefrontModal, setShowStorefrontModal] = useState<boolean>(false);

  // Form State
  const [vendorForm, setVendorForm] = useState({ name: '', businessName: '', contactEmail: '', contactPhone: '' });
  const [storefrontForm, setStorefrontForm] = useState({ vendorId: '', name: '', grabEmail: '' });
  
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/vendors');
      if (!res.ok) throw new Error('Failed to retrieve vendors');
      const data = await res.json();
      setVendors(data);
    } catch (err: any) {
      setError(err.message || 'Error loading vendors list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorForm),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to register vendor.');
      }

      setVendorForm({ name: '', businessName: '', contactEmail: '', contactPhone: '' });
      setShowVendorModal(false);
      fetchVendors();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStorefrontSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch('/api/vendors/storefronts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storefrontForm),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to map storefront.');
      }

      setStorefrontForm({ vendorId: '', name: '', grabEmail: '' });
      setShowStorefrontModal(false);
      fetchVendors();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 h-52"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Restaurant Vendors Registry</h3>
          <p className="text-xs text-slate-400">Manage client restaurant contracts and map Grab storefront accounts.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowVendorModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all"
          >
            + Add Vendor
          </button>
          <button
            onClick={() => setShowStorefrontModal(true)}
            className="bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm hover:shadow border border-slate-700 dark:border-slate-700 transition-all"
          >
            + Map Storefront
          </button>
        </div>
      </div>

      {/* Vendors List Cards */}
      {vendors.length === 0 ? (
        <div className="text-center py-20 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
          No registered vendors found. Get started by clicking "+ Add Vendor"!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="text-lg font-bold text-slate-850 dark:text-slate-100">{vendor.businessName}</h4>
                    <span className="text-xs font-semibold text-slate-400">Owned by: {vendor.name}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    vendor.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : 'bg-rose-50 text-rose-600'
                  }`}>
                    {vendor.status}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Contact Email:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{vendor.contactEmail}</span>
                  </div>
                  {vendor.contactPhone && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contact Phone:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{vendor.contactPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Linked Storefronts Section */}
              <div className="mt-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 rounded-lg p-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Linked Grab Storefronts</h5>
                
                {vendor.storefronts.length === 0 ? (
                  <div className="text-[11px] text-slate-400 italic">No storefront emails linked yet. Map one below.</div>
                ) : (
                  <div className="space-y-3">
                    {vendor.storefronts.map((sf) => (
                      <div key={sf.id} className="flex items-center justify-between text-xs border-b border-slate-100/50 dark:border-slate-800/30 pb-2 last:border-b-0 last:pb-0">
                        <div>
                          <div className="font-semibold text-slate-700 dark:text-slate-200">{sf.name}</div>
                          <div className="text-[11px] text-slate-400">{sf.grabEmail}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-450">{sf._count?.grabOrders || 0} orders</div>
                          <span className="text-[10px] text-slate-400">reconciled</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: ADD VENDOR */}
      {showVendorModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 animate-scaleUp">
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Register New Vendor</h4>
            
            <form onSubmit={handleVendorSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-500 mb-1">Owner Name</label>
                <input
                  type="text"
                  required
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-md text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1">Business/Restaurant Name</label>
                <input
                  type="text"
                  required
                  value={vendorForm.businessName}
                  onChange={(e) => setVendorForm({ ...vendorForm, businessName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-md text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g., Legacy Cuisine Central"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1">Contact Email</label>
                <input
                  type="email"
                  required
                  value={vendorForm.contactEmail}
                  onChange={(e) => setVendorForm({ ...vendorForm, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-md text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g., contact@restaurant.com"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1">Contact Phone (Optional)</label>
                <input
                  type="text"
                  value={vendorForm.contactPhone}
                  onChange={(e) => setVendorForm({ ...vendorForm, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-md text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g., +60123456789"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVendorModal(false)}
                  className="px-4 py-2 border border-slate-350 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold"
                >
                  {submitting ? 'Registering...' : 'Save Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MAP STOREFRONT */}
      {showStorefrontModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 animate-scaleUp">
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Link Grab Storefront Account</h4>
            
            <form onSubmit={handleStorefrontSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-500 mb-1">Select Restaurant Vendor</label>
                <select
                  required
                  value={storefrontForm.vendorId}
                  onChange={(e) => setStorefrontForm({ ...storefrontForm, vendorId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-md text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">-- Choose Vendor --</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.businessName} ({v.name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1">Storefront Name</label>
                <input
                  type="text"
                  required
                  value={storefrontForm.name}
                  onChange={(e) => setStorefrontForm({ ...storefrontForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-md text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g., Central Kitchen"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1">Grab Email / Partner ID Name</label>
                <input
                  type="text"
                  required
                  value={storefrontForm.grabEmail}
                  onChange={(e) => setStorefrontForm({ ...storefrontForm, grabEmail: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-md text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g., partner123 or store@domain.com"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStorefrontModal(false)}
                  className="px-4 py-2 border border-slate-350 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold"
                >
                  {submitting ? 'Linking...' : 'Link Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
