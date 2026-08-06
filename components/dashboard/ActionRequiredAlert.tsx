import React, { useState, useEffect } from 'react';
import { ProductMaster } from '../../types/dashboard';

interface ActionRequiredAlertProps {
  onReconciliationTrigger?: () => void;
}

export const ActionRequiredAlert: React.FC<ActionRequiredAlertProps> = ({ onReconciliationTrigger }) => {
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
      if (!res.ok) {
        throw new Error(`Failed to load review items: ${res.statusText}`);
      }
      const data: ProductMaster[] = await res.json();
      setItems(data);
      
      // Initialize price inputs
      const initialPrices: { [key: string]: string } = {};
      data.forEach(item => {
        initialPrices[item.id] = item.restaurantBasePrice.toString();
      });
      setPrices(initialPrices);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error loading actions queue');
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
    return (
      <div className="w-full bg-white dark:bg-black border border-[#b0712d] rounded-lg p-4 animate-pulse">
        <div className="h-4 w-40 bg-[#b0712d] rounded mb-2"></div>
        <div className="h-8 w-full bg-[#b0712d]/30 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white dark:bg-black border border-[#aa0505] text-black dark:text-white rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-[#aa0505] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-medium text-black dark:text-white">{error}</span>
        </div>
        <button onClick={fetchNeedsReview} className="text-sm underline font-medium text-[#b0712d] hover:text-[#aa0505]">Retry</button>
      </div>
    );
  }

  // Clear state: Queue is clear
  if (items.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-black border border-[#b0712d] text-black dark:text-white rounded-xl p-5 flex items-center gap-4 shadow-sm transition-all duration-300">
        <div className="bg-[#b0712d] rounded-full p-2 text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h4 className="font-bold text-black dark:text-white text-lg">All Systems Reconciled</h4>
          <p className="text-[#b0712d] text-sm">All Product Master entries have confirmed pricing. Payout balances are consistent.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-black border border-[#aa0505] text-black dark:text-white rounded-xl p-5 shadow-sm">
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-[#aa0505] rounded-full p-2 text-white flex-shrink-0">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h4 className="font-bold text-black dark:text-white text-lg">Action Required ({items.length} Pending Review)</h4>
          <p className="text-[#b0712d] text-sm">
            GrabFood imported transactions for unregistered items. Please define the restaurant's actual base price (what they expect to be paid) to correct margin allocations.
          </p>
        </div>
      </div>

      <div className="mt-3 max-h-60 overflow-y-auto divide-y divide-[#b0712d] bg-white dark:bg-black border border-[#b0712d] rounded-lg">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#b0712d] bg-[#b0712d]/15 px-2 py-0.5 rounded border border-[#b0712d]">SKU: {item.sku}</span>
              <p className="font-bold text-black dark:text-white mt-1">{item.name}</p>
              <p className="text-xs text-[#b0712d]">
                Grab expected price: {item.grabExpectedPrice !== null && item.grabExpectedPrice !== undefined
                  ? `RM ${parseFloat(item.grabExpectedPrice.toString()).toFixed(2)}`
                  : 'N/A'}
              </p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative rounded-md shadow-sm w-36">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-[#b0712d] text-sm font-semibold">RM</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={prices[item.id] || ''}
                  onChange={(e) => handlePriceChange(item.id, e.target.value)}
                  disabled={updatingId === item.id}
                  className="block w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-black border border-[#b0712d] rounded-md focus:outline-none focus:border-[#aa0505] text-black dark:text-white"
                  placeholder="Base Price"
                />
              </div>
              <button
                onClick={() => handleVerifyPrice(item.id)}
                disabled={updatingId === item.id}
                className="bg-[#aa0505] hover:bg-[#b0712d] text-white text-sm font-semibold px-4 py-2 rounded-md transition-all disabled:opacity-50 flex items-center justify-center min-w-[100px]"
              >
                {updatingId === item.id ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Verify & Save'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
