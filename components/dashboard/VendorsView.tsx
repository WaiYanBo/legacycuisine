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
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white dark:bg-black p-6 border border-[#b0712d] rounded-xl shadow-sm text-black dark:text-white">
        <div>
          <h3 className="text-lg font-bold text-black dark:text-white">Restaurant Vendors Registry</h3>
          <p className="text-xs text-[#b0712d]">Manage client restaurant contracts and map Grab storefront accounts.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowVendorModal(true)}
            className="bg-[#aa0505] hover:bg-[#b0712d] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all"
          >
            + Add Vendor
          </button>
          <button
            onClick={() => setShowStorefrontModal(true)}
            className="bg-white dark:bg-black hover:bg-[#b0712d]/10 text-black dark:text-white text-xs font-bold px-4 py-2.5 rounded-lg border border-[#b0712d] transition-all"
          >
            + Map Storefront
          </button>
        </div>
      </div>

      {/* Vendors List Cards */}
      {vendors.length === 0 ? (
        <div className="text-center py-20 text-[#b0712d] border border-dashed border-[#b0712d] rounded-xl bg-white dark:bg-black">
          No registered vendors found. Get started by clicking "+ Add Vendor"!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="bg-white dark:bg-black border border-[#b0712d] rounded-xl p-6 shadow-sm flex flex-col justify-between text-black dark:text-white">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="text-lg font-bold text-black dark:text-white">{vendor.businessName}</h4>
                    <span className="text-xs font-semibold text-[#b0712d]">Owned by: {vendor.name}</span>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    vendor.status === 'ACTIVE'
                      ? 'bg-[#b0712d]/15 text-black dark:text-white border-[#b0712d]'
                      : 'bg-[#aa0505]/15 text-[#aa0505] border-[#aa0505]'
                  }`}>
                    {vendor.status}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-[#b0712d] border-t border-[#b0712d] pt-3">
                  <div className="flex justify-between">
                    <span className="text-[#b0712d]">Contact Email:</span>
                    <span className="font-semibold text-black dark:text-white">{vendor.contactEmail}</span>
                  </div>
                  {vendor.contactPhone && (
                    <div className="flex justify-between">
                      <span className="text-[#b0712d]">Contact Phone:</span>
                      <span className="font-semibold text-black dark:text-white">{vendor.contactPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Linked Storefronts Section */}
              <div className="mt-5 bg-white dark:bg-black border border-[#b0712d] rounded-lg p-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#b0712d] mb-3">Linked Grab Storefronts</h5>
                
                {vendor.storefronts.length === 0 ? (
                  <div className="text-[11px] text-[#b0712d] italic">No storefront emails linked yet. Map one below.</div>
                ) : (
                  <div className="space-y-3">
                    {vendor.storefronts.map((sf) => (
                      <div key={sf.id} className="flex items-center justify-between text-xs border-b border-[#b0712d]/40 pb-2 last:border-b-0 last:pb-0">
                        <div>
                          <div className="font-semibold text-black dark:text-white">{sf.name}</div>
                          <div className="text-[11px] text-[#b0712d]">{sf.grabEmail}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] font-bold text-black dark:text-white">{sf._count?.grabOrders || 0} orders</div>
                          <span className="text-[10px] text-[#b0712d]">reconciled</span>
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black border border-[#b0712d] rounded-xl shadow-xl w-full max-w-md p-6 text-black dark:text-white">
            <h4 className="text-lg font-bold text-black dark:text-white mb-4">Register New Vendor</h4>
            
            <form onSubmit={handleVendorSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#b0712d] mb-1">Owner Name</label>
                <input
                  type="text"
                  required
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#b0712d] bg-white dark:bg-black rounded-md text-black dark:text-white focus:outline-none focus:border-[#aa0505]"
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#b0712d] mb-1">Business/Restaurant Name</label>
                <input
                  type="text"
                  required
                  value={vendorForm.businessName}
                  onChange={(e) => setVendorForm({ ...vendorForm, businessName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#b0712d] bg-white dark:bg-black rounded-md text-black dark:text-white focus:outline-none focus:border-[#aa0505]"
                  placeholder="e.g., Legacy Cuisine Central"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#b0712d] mb-1">Contact Email</label>
                <input
                  type="email"
                  required
                  value={vendorForm.contactEmail}
                  onChange={(e) => setVendorForm({ ...vendorForm, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#b0712d] bg-white dark:bg-black rounded-md text-black dark:text-white focus:outline-none focus:border-[#aa0505]"
                  placeholder="e.g., contact@restaurant.com"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#b0712d] mb-1">Contact Phone (Optional)</label>
                <input
                  type="text"
                  value={vendorForm.contactPhone}
                  onChange={(e) => setVendorForm({ ...vendorForm, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#b0712d] bg-white dark:bg-black rounded-md text-black dark:text-white focus:outline-none focus:border-[#aa0505]"
                  placeholder="e.g., +60123456789"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#b0712d]">
                <button
                  type="button"
                  onClick={() => setShowVendorModal(false)}
                  className="px-4 py-2 border border-[#b0712d] rounded-md hover:bg-[#b0712d]/10 font-semibold text-black dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#aa0505] hover:bg-[#b0712d] text-white rounded-md font-semibold"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black border border-[#b0712d] rounded-xl shadow-xl w-full max-w-md p-6 text-black dark:text-white">
            <h4 className="text-lg font-bold text-black dark:text-white mb-4">Link Grab Storefront Account</h4>
            
            <form onSubmit={handleStorefrontSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#b0712d] mb-1">Select Restaurant Vendor</label>
                <select
                  required
                  value={storefrontForm.vendorId}
                  onChange={(e) => setStorefrontForm({ ...storefrontForm, vendorId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#b0712d] bg-white dark:bg-black rounded-md text-black dark:text-white focus:outline-none focus:border-[#aa0505]"
                >
                  <option value="">-- Choose Vendor --</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.businessName} ({v.name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#b0712d] mb-1">Storefront Name</label>
                <input
                  type="text"
                  required
                  value={storefrontForm.name}
                  onChange={(e) => setStorefrontForm({ ...storefrontForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#b0712d] bg-white dark:bg-black rounded-md text-black dark:text-white focus:outline-none focus:border-[#aa0505]"
                  placeholder="e.g., Central Kitchen"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#b0712d] mb-1">Grab Email / Partner ID Name</label>
                <input
                  type="text"
                  required
                  value={storefrontForm.grabEmail}
                  onChange={(e) => setStorefrontForm({ ...storefrontForm, grabEmail: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#b0712d] bg-white dark:bg-black rounded-md text-black dark:text-white focus:outline-none focus:border-[#aa0505]"
                  placeholder="e.g., partner123 or store@domain.com"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#b0712d]">
                <button
                  type="button"
                  onClick={() => setShowStorefrontModal(false)}
                  className="px-4 py-2 border border-[#b0712d] rounded-md hover:bg-[#b0712d]/10 font-semibold text-black dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#aa0505] hover:bg-[#b0712d] text-white rounded-md font-semibold"
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
