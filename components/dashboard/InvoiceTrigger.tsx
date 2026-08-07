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
    <div className="w-full bg-white dark:bg-black border border-[#b0712d] rounded-xl p-6 shadow-sm text-black dark:text-white">
      <div>
        <h3 className="text-lg font-bold text-black dark:text-white">Statement Generation</h3>
        <p className="text-xs text-[#b0712d]">Select a merchant to compile all outstanding reconciled orders into a corporate statement invoice.</p>
      </div>

      <form onSubmit={handleGenerate} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="vendor-select" className="block text-xs font-semibold text-[#b0712d] uppercase mb-1">Select Merchant</label>
            <select
              id="vendor-select"
              value={selectedMerchantId}
              onChange={(e) => setSelectedMerchantId(e.target.value)}
              disabled={status === 'loading'}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-black border border-[#b0712d] rounded-md focus:outline-none focus:border-[#aa0505] text-black dark:text-white"
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
            <label htmlFor="billing-date" className="block text-xs font-semibold text-[#b0712d] uppercase mb-1">Invoice Billing Date (DD/MM/YYYY)</label>
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
              className="w-full px-3 py-2 text-sm bg-white dark:bg-black border border-[#b0712d] rounded-md focus:outline-none focus:border-[#aa0505] text-black dark:text-white"
            />
          </div>
        </div>

        {status === 'success' && (
          <div className="bg-white dark:bg-black border border-[#b0712d] text-black dark:text-white rounded-lg p-3 text-sm flex items-start gap-2">
            <svg className="w-4 h-4 text-[#b0712d] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="font-semibold text-black dark:text-white">Success:</span> {message}
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-[#aa0505]/10 border border-[#aa0505] text-black dark:text-white rounded-lg p-3 text-sm flex items-start gap-2">
            <svg className="w-4 h-4 text-[#aa0505] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="w-full sm:w-auto bg-[#aa0505] hover:bg-[#b0712d] text-white text-sm font-semibold px-6 py-2.5 rounded-md shadow-sm transition-all flex items-center justify-center min-w-[150px] disabled:opacity-50"
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
