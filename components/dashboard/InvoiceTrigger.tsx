import React, { useState } from 'react';

export const InvoiceTrigger: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      setStatus('error');
      setMessage('Please select both start and end dates.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setStatus('error');
      setMessage('Start date cannot be after end date.');
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
        body: JSON.stringify({ startDate, endDate }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to trigger statement generation.');
      }

      const result = await res.json();
      setStatus('success');
      setMessage(result.message || `Successfully generated statements for date range.`);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Server error occurred during invoice compilation.');
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-bold text-slate-800">Statement Generation</h3>
        <p className="text-xs text-slate-400">Compile payouts, apply commissions, and generate sequential PDF invoices for restaurant owners.</p>
      </div>

      <form onSubmit={handleGenerate} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start-date" className="block text-xs font-semibold text-slate-500 uppercase mb-1">Start Date</label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={status === 'loading'}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-xs font-semibold text-slate-500 uppercase mb-1">End Date</label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={status === 'loading'}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
            />
          </div>
        </div>

        {status === 'success' && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3 text-sm flex items-start gap-2">
            <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="font-semibold">Generation Triggered:</span> {message}
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-3 text-sm flex items-start gap-2">
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
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-6 py-2.5 rounded-md shadow-sm transition-all flex items-center justify-center min-w-[150px] disabled:opacity-50"
          >
            {status === 'loading' ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Generate Invoices'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
