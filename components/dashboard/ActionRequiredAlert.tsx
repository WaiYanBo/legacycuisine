import React, { useState, useEffect } from 'react';
import { ProductMaster } from '../../types/dashboard';
import { getDictionary, Locale } from '../../lib/i18n';

interface ActionRequiredAlertProps {
  onReconciliationTrigger?: () => void;
  lang?: Locale;
}

export const ActionRequiredAlert: React.FC<ActionRequiredAlertProps> = ({ onReconciliationTrigger, lang = 'en' }) => {
  const dict = getDictionary(lang).dashboard.alerts;
  const [items, setItems] = useState<ProductMaster[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [prices, setPrices] = useState<{ [key: string]: string }>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch products needing review
  const fetchNeedsReview = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products/needs-review');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setItems(data);
          const initialPrices: { [key: string]: string } = {};
          data.forEach((item: any) => {
            if (item.restaurantBasePrice) {
              initialPrices[item.id] = item.restaurantBasePrice.toString();
            }
          });
          setPrices(initialPrices);
        } else {
          setItems([]);
        }
      } else {
        setItems([]);
      }
      setError(null);
    } catch (err: any) {
      // Graceful fallback to zero pending items
      setItems([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNeedsReview();
  }, []);

  const handlePriceChange = (id: string, value: string) => {
    setPrices(prev => ({ ...prev, [id]: value }));
  };

  const handleVerifyPrice = async (id: string) => {
    const updatedPrice = parseFloat(prices[id]);
    if (isNaN(updatedPrice) || updatedPrice <= 0) {
      alert('Please enter a valid positive base price.');
      return;
    }

    try {
      setUpdatingId(id);
      const res = await fetch(`/api/products/${id}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ restaurantBasePrice: updatedPrice }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update price');
      }

      // Remove from list
      setItems(prev => prev.filter(item => item.id !== id));
      
      // Optionally trigger parent update (refresh chart metrics)
      if (onReconciliationTrigger) {
        onReconciliationTrigger();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update item price. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return null;
  }

  // Clear state: Queue is clear
  if (items.length === 0) {
    return (
      <div className="w-full bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 text-slate-800 dark:text-slate-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm transition-all duration-300">
        <div className="bg-emerald-500 rounded-xl p-2.5 text-white shadow-md shadow-emerald-500/20">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base">{dict.allReconciledTitle}</h4>
          <p className="text-slate-600 dark:text-slate-400 text-xs">{dict.allReconciledDesc}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/40 text-slate-900 dark:text-white rounded-2xl p-6 shadow-sm shadow-red-500/5">
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-xl p-2.5 text-white flex-shrink-0 shadow-md shadow-red-500/20">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h4 className="font-extrabold text-slate-900 dark:text-white text-lg">
            {dict.actionRequiredTitle.replace('{count}', items.length.toString())}
          </h4>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            {dict.actionRequiredDesc}
          </p>
        </div>
      </div>

      <div className="mt-4 max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400 bg-rose-50 dark:bg-red-950/50 px-2.5 py-1 rounded-md border border-rose-200 dark:border-red-900/50">{dict.sku}: {item.sku}</span>
              <p className="font-bold text-slate-900 dark:text-white mt-1.5 text-sm">{item.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {dict.grabExpectedPrice}: {item.grabExpectedPrice !== null && item.grabExpectedPrice !== undefined
                  ? `RM ${parseFloat(item.grabExpectedPrice.toString()).toFixed(2)}`
                  : 'N/A'}
              </p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative rounded-xl shadow-sm w-36">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-xs font-semibold">RM</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={prices[item.id] || ''}
                  onChange={(e) => handlePriceChange(item.id, e.target.value)}
                  disabled={updatingId === item.id}
                  className="block w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
                  placeholder={dict.basePricePlaceholder}
                />
              </div>
              <button
                onClick={() => handleVerifyPrice(item.id)}
                disabled={updatingId === item.id}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-red-600/20 disabled:opacity-50 flex items-center justify-center min-w-[105px]"
              >
                {updatingId === item.id ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  dict.verifyAndSave
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
