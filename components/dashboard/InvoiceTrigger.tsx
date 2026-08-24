import React, { useState, useEffect } from 'react';

export const InvoiceTrigger: React.FC = () => {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('');
  const [billingDate, setBillingDate] = useState<string>('');
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const fetchMerchantsList = async () => {
      try {
        const res = await fetch('/api/merchants');
        if (res.ok) {
          const data = await res.json();
          setMerchants(data);
        }
      } catch (err) {
        console.error('Failed to load merchants list', err);
      }
    };
    fetchMerchantsList();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMerchantId) {
      setStatus('error');
      setMessage('Please select a restaurant merchant.');
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
      
      const res = await fetch('/api/dashboard/invoices/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ merchantId: selectedMerchantId, billingDate }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to trigger statement generation.');
      }

      setStatus('success');
      setMessage(result.message || `Successfully generated invoice statements.`);
      setSelectedMerchantId('');
      setBillingDate('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Server error occurred during invoice compilation.');
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm text-slate-900 dark:text-white">
      <div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Statement Generation</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Select a merchant to compile all outstanding reconciled orders into a corporate statement invoice.</p>
      </div>

      <form onSubmit={handleGenerate} className="mt-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="merchant-select" className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Select Merchant</label>
            <select
              id="merchant-select"
              value={selectedMerchantId}
              onChange={(e) => setSelectedMerchantId(e.target.value)}
              disabled={status === 'loading'}
              className="w-full px-4 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white transition-all"
            >
              <option value="">-- Choose Merchant Restaurant --</option>
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.businessName} ({m.name})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="billing-date" className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Invoice Billing Date (DD/MM/YYYY)</label>
            <input
              type="date"
              lang="en-GB"
              placeholder="dd/mm/yyyy"
              id="billing-date"
              value={billingDate}
              onChange={(e) => setBillingDate(e.target.value)}
              onFocus={(e) => e.currentTarget.showPicker()}
              onClick={(e) => e.currentTarget.showPicker()}
              disabled={status === 'loading'}
              className="w-full px-4 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white transition-all"
            />
          </div>
        </div>

        {status === 'success' && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-200 rounded-xl p-4 text-xs font-medium flex items-start gap-2.5 shadow-sm">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="font-bold">Success:</span> {message}
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-rose-50 dark:bg-red-950/30 border border-rose-200 dark:border-red-900/40 text-red-800 dark:text-red-200 rounded-xl p-4 text-xs font-medium flex items-start gap-2.5 shadow-sm">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <span className="font-bold">Error:</span> {message}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-extrabold px-6 py-3 rounded-xl shadow-md shadow-red-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center min-w-[160px] disabled:opacity-50"
          >
            {status === 'loading' ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Generate Invoice'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
