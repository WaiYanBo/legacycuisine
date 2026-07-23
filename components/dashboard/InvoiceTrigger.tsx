import React, { useState, useEffect } from 'react';

export const InvoiceTrigger: React.FC = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [billingDate, setBillingDate] = useState<string>('');
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const fetchVendorsList = async () => {
      try {
        const res = await fetch('/api/vendors');
        if (res.ok) {
          const data = await res.json();
          setVendors(data);
        }
      } catch (err) {
        console.error('Failed to load vendors list', err);
      }
    };
    fetchVendorsList();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVendorId) {
      setStatus('error');
      setMessage('Please select a restaurant vendor.');
      return;
    }

    if (!billingDate) {
      setStatus('error');
      setMessage('Please select an invoice billing date.');
      return;
    }

    try {
      setStatus('loading');
      setMessage('');
      
      const res = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vendorId: selectedVendorId, billingDate }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to trigger statement generation.');
      }

      setStatus('success');
      setMessage(result.message || `Successfully generated invoice statements.`);
      setSelectedVendorId('');
      setBillingDate('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Server error occurred during invoice compilation.');
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-880 rounded-xl p-6 shadow-sm text-slate-900 dark:text-slate-100">
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Statement Generation</h3>
        <p className="text-xs text-slate-450 dark:text-slate-500">Select a vendor to compile all outstanding reconciled orders into a corporate statement invoice.</p>
      </div>

      <form onSubmit={handleGenerate} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="vendor-select" className="block text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase mb-1">Select Vendor</label>
            <select
              id="vendor-select"
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              disabled={status === 'loading'}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 dark:text-slate-100"
            >
              <option value="">-- Choose Vendor Restaurant --</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.businessName} ({v.name})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="billing-date" className="block text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase mb-1">Invoice Billing Date</label>
            <input
              type="date"
              id="billing-date"
              value={billingDate}
              onChange={(e) => setBillingDate(e.target.value)}
              onFocus={(e) => e.currentTarget.showPicker()}
              onClick={(e) => e.currentTarget.showPicker()}
              disabled={status === 'loading'}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {status === 'success' && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-lg p-3 text-sm flex items-start gap-2">
            <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="font-semibold text-emerald-900 dark:text-emerald-300">Success:</span> {message}
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-450 rounded-lg p-3 text-sm flex items-start gap-2">
            <svg className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <span className="font-semibold">Error:</span> {message}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full sm:w-auto bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-sm font-semibold px-6 py-2.5 rounded-md shadow-sm transition-all flex items-center justify-center min-w-[150px] disabled:opacity-50"
          >
            {status === 'loading' ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Generate Invoice'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
