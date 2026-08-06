import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface LineItemInput {
  itemName: string;
  quantity: number;
  unitPrice: number;
}

interface ParsedBatchOrder {
  storeIdentifier: string;
  grabOrderId: string;
  orderDate: string;
  rawSubtotal: number;
  rawDeliveryFee: number;
  rawTax: number;
  rawGrabCommission: number;
  totalCollectedByGrab: number;
  voucherBarcode?: string;
  orderLineItems: Array<{
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

interface ManualOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ManualOrderModal: React.FC<ManualOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'single' | 'excel'>('single');

  // Single Order State
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendorEmail, setSelectedVendorEmail] = useState<string>('');
  const [customStoreIdentifier, setCustomStoreIdentifier] = useState<string>('');
  
  const [grabOrderId, setGrabOrderId] = useState<string>('');
  const [orderDate, setOrderDate] = useState<string>('');
  const [rawSubtotal, setRawSubtotal] = useState<string>('0.00');
  const [rawDeliveryFee, setRawDeliveryFee] = useState<string>('0.00');
  const [rawTax, setRawTax] = useState<string>('0.00');
  const [rawGrabCommission, setRawGrabCommission] = useState<string>('0.00');
  const [totalCollectedByGrab, setTotalCollectedByGrab] = useState<string>('0.00');
  const [voucherBarcode, setVoucherBarcode] = useState<string>('');

  const [lineItems, setLineItems] = useState<LineItemInput[]>([
    { itemName: '', quantity: 1, unitPrice: 0 }
  ]);

  // Excel / CSV Batch State
  const [pasteContent, setPasteContent] = useState<string>('');
  const [parsedBatchOrders, setParsedBatchOrders] = useState<ParsedBatchOrder[]>([]);
  const [batchParseError, setBatchParseError] = useState<string>('');
  const [batchResultSummary, setBatchResultSummary] = useState<any>(null);

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Fetch registered vendors to easily pick store email
  useEffect(() => {
    if (!isOpen) return;

    // Reset date to current time
    const now = new Date();
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setOrderDate(localIso);

    // Auto-generate a default manual order ID
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setGrabOrderId(`MANUAL-GF-${randomNum}`);

    const fetchVendors = async () => {
      try {
        const res = await fetch('/api/vendors');
        if (res.ok) {
          const data = await res.json();
          setVendors(data);
          if (data.length > 0 && data[0].storefronts?.length > 0) {
            setSelectedVendorEmail(data[0].storefronts[0].grabEmail);
          }
        }
      } catch (err) {
        console.error('Failed to load vendors for manual entry', err);
      }
    };

    fetchVendors();
  }, [isOpen]);

  // Recalculate subtotal from line items when line items change
  const lineItemsSum = lineItems.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );

  const handleLineItemChange = (index: number, field: keyof LineItemInput, value: any) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      [field]: field === 'itemName' ? value : parseFloat(value) || 0
    };
    setLineItems(updated);

    const newSum = updated.reduce((s, item) => s + (item.quantity || 0) * (item.unitPrice || 0), 0);
    setRawSubtotal(newSum.toFixed(2));
    
    const delFee = parseFloat(rawDeliveryFee) || 0;
    const comm = parseFloat(rawGrabCommission) || 0;
    const tax = parseFloat(rawTax) || 0;
    setTotalCollectedByGrab((newSum + delFee + tax - comm).toFixed(2));
  };

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { itemName: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    const updated = lineItems.filter((_, i) => i !== index);
    setLineItems(updated);

    const newSum = updated.reduce((s, item) => s + (item.quantity || 0) * (item.unitPrice || 0), 0);
    setRawSubtotal(newSum.toFixed(2));
  };

  const handleFillSample = () => {
    if (vendors.length > 0 && vendors[0].storefronts?.length > 0) {
      setSelectedVendorEmail(vendors[0].storefronts[0].grabEmail);
    }
    const sampleId = `MANUAL-GF-${Math.floor(100000 + Math.random() * 900000)}`;
    setGrabOrderId(sampleId);
    setLineItems([
      { itemName: 'Legacy Nasi Lemak Deluxe', quantity: 2, unitPrice: 16.50 },
      { itemName: 'Special Hainanese Chicken Rice', quantity: 1, unitPrice: 18.00 },
      { itemName: 'Fresh Iced Pandan Tea', quantity: 2, unitPrice: 4.50 }
    ]);
    setRawSubtotal('60.00');
    setRawDeliveryFee('4.00');
    setRawTax('0.00');
    setRawGrabCommission('12.00');
    setTotalCollectedByGrab('52.00');
    setVoucherBarcode('MANUAL-FALLBACK-PROMO');
  };

  // Single Order Submit
  const handleSubmitSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const storeIdentifier = selectedVendorEmail || customStoreIdentifier;

    if (!storeIdentifier) {
      setStatus('error');
      setErrorMessage('Please select or specify a Storefront Email / Identifier.');
      return;
    }

    if (!grabOrderId.trim()) {
      setStatus('error');
      setErrorMessage('Please enter a valid Grab Order ID.');
      return;
    }

    if (lineItems.some((item) => !item.itemName.trim())) {
      setStatus('error');
      setErrorMessage('All line items must have a non-empty name.');
      return;
    }

    const payload = {
      storeIdentifier,
      grabOrderId: grabOrderId.trim(),
      orderDate,
      rawSubtotal: parseFloat(rawSubtotal) || 0,
      rawDeliveryFee: parseFloat(rawDeliveryFee) || 0,
      rawTax: parseFloat(rawTax) || 0,
      rawGrabCommission: parseFloat(rawGrabCommission) || 0,
      totalCollectedByGrab: parseFloat(totalCollectedByGrab) || 0,
      voucherBarcode: voucherBarcode.trim() || undefined,
      orderLineItems: lineItems.map((item) => ({
        itemName: item.itemName.trim(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice
      }))
    };

    try {
      const res = await fetch('/api/webhooks/manual-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.details || result.error || 'Failed to submit manual order.');
      }

      setStatus('success');
      setTimeout(() => {
        onSuccess();
        onClose();
        setStatus('idle');
      }, 800);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Server error occurred during manual data entry.');
    }
  };

  // -------------------------------------------------------------
  // EXCEL / CSV BATCH IMPORT HELPERS & PARSERS
  // -------------------------------------------------------------

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Store Identifier': vendors[0]?.storefronts[0]?.grabEmail || 'legacy.kl@grabfood.com',
        'Grab Order ID': 'GF-BATCH-001',
        'Order Date': '2026-08-05 12:30:00',
        'Item Name': 'Legacy Nasi Lemak Special',
        'Quantity': 2,
        'Unit Price': 16.50,
        'Subtotal': 48.00,
        'Delivery Fee': 4.00,
        'Tax': 0.00,
        'Grab Commission': 9.60,
        'Total Collected': 42.40,
        'Voucher Code': 'PROMO-KL'
      },
      {
        'Store Identifier': vendors[0]?.storefronts[0]?.grabEmail || 'legacy.kl@grabfood.com',
        'Grab Order ID': 'GF-BATCH-001',
        'Order Date': '2026-08-05 12:30:00',
        'Item Name': 'Iced Teh Tarik Kaw',
        'Quantity': 3,
        'Unit Price': 5.00,
        'Subtotal': 48.00,
        'Delivery Fee': 4.00,
        'Tax': 0.00,
        'Grab Commission': 9.60,
        'Total Collected': 42.40,
        'Voucher Code': 'PROMO-KL'
      },
      {
        'Store Identifier': vendors[0]?.storefronts[0]?.grabEmail || 'legacy.kl@grabfood.com',
        'Grab Order ID': 'GF-BATCH-002',
        'Order Date': '2026-08-05 13:15:00',
        'Item Name': 'Hainanese Chicken Rice Bowl',
        'Quantity': 1,
        'Unit Price': 18.00,
        'Subtotal': 18.00,
        'Delivery Fee': 3.00,
        'Tax': 0.00,
        'Grab Commission': 3.60,
        'Total Collected': 17.40,
        'Voucher Code': ''
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Manual Orders');
    XLSX.writeFile(workbook, 'Grab_Manual_Orders_Template.xlsx');
  };

  // Convert Raw Objects Array to Grouped ParsedBatchOrder[]
  const processRawRows = (rawRows: any[]) => {
    setBatchParseError('');
    setBatchResultSummary(null);

    if (!Array.isArray(rawRows) || rawRows.length === 0) {
      setBatchParseError('Uploaded file or pasted text contains no readable order rows.');
      setParsedBatchOrders([]);
      return;
    }

    const orderMap: { [key: string]: ParsedBatchOrder } = {};

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];

      // Flexible header key lookup (case insensitive / spaces stripped)
      const getVal = (possibleKeys: string[]) => {
        for (const k of Object.keys(row)) {
          const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          for (const pk of possibleKeys) {
            if (cleanK === pk.toLowerCase().replace(/[^a-z0-9]/g, '')) {
              return row[k];
            }
          }
        }
        return undefined;
      };

      const storeIdentifier = String(
        getVal(['storeidentifier', 'storeemail', 'store', 'vendor', 'email']) ||
        selectedVendorEmail ||
        vendors[0]?.storefronts[0]?.grabEmail ||
        ''
      ).trim();

      const grabOrderId = String(getVal(['graborderid', 'orderid', 'order', 'id']) || '').trim();
      const orderDateRaw = getVal(['orderdate', 'date', 'datetime', 'time']) || new Date().toISOString();
      const itemName = String(getVal(['itemname', 'item', 'description', 'product']) || '').trim();
      const quantity = parseInt(String(getVal(['quantity', 'qty']) || '1')) || 1;
      const unitPrice = parseFloat(String(getVal(['unitprice', 'price', 'rate']) || '0')) || 0;
      const rawSubtotal = parseFloat(String(getVal(['subtotal', 'rawsubtotal']) || '0')) || 0;
      const rawDeliveryFee = parseFloat(String(getVal(['deliveryfee', 'delivery', 'rawdeliveryfee']) || '0')) || 0;
      const rawTax = parseFloat(String(getVal(['tax', 'sst', 'rawtax']) || '0')) || 0;
      const rawGrabCommission = parseFloat(String(getVal(['grabcommission', 'commission', 'rawgrabcommission']) || '0')) || 0;
      const totalCollectedByGrab = parseFloat(String(getVal(['totalcollected', 'totalcollectedbygrab', 'total']) || '0')) || 0;
      const voucherBarcode = String(getVal(['vouchercode', 'voucher', 'barcode', 'promo']) || '').trim();

      if (!grabOrderId || !itemName) {
        continue; // Skip invalid header/footer empty rows
      }

      if (!orderMap[grabOrderId]) {
        orderMap[grabOrderId] = {
          storeIdentifier,
          grabOrderId,
          orderDate: new Date(orderDateRaw).toISOString(),
          rawSubtotal: rawSubtotal || (quantity * unitPrice),
          rawDeliveryFee,
          rawTax,
          rawGrabCommission,
          totalCollectedByGrab: totalCollectedByGrab || (rawSubtotal + rawDeliveryFee + rawTax - rawGrabCommission),
          voucherBarcode: voucherBarcode || undefined,
          orderLineItems: []
        };
      }

      orderMap[grabOrderId].orderLineItems.push({
        itemName,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice
      });
    }

    const parsedList = Object.values(orderMap);
    if (parsedList.length === 0) {
      setBatchParseError('Could not identify valid Grab Order ID or Item Name columns in the file.');
      setParsedBatchOrders([]);
      return;
    }

    setParsedBatchOrders(parsedList);
  };

  // Handle Drag & Drop / File Input Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonRows = XLSX.utils.sheet_to_json(worksheet);
        processRawRows(jsonRows);
      } catch (err: any) {
        setBatchParseError(`Failed to parse Excel file: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle Excel Copy-Paste Text Box Parsing
  const handleParsePastedText = () => {
    if (!pasteContent.trim()) {
      setBatchParseError('Please paste rows copied from Excel or Google Sheets into the box above.');
      return;
    }

    try {
      const workbook = XLSX.read(pasteContent, { type: 'string' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonRows = XLSX.utils.sheet_to_json(worksheet);
      processRawRows(jsonRows);
    } catch (err: any) {
      setBatchParseError(`Failed to parse pasted text: ${err.message}`);
    }
  };

  // Batch Submit to /api/webhooks/batch-orders
  const handleSubmitBatch = async () => {
    if (parsedBatchOrders.length === 0) return;

    setStatus('loading');
    setBatchParseError('');
    setBatchResultSummary(null);

    try {
      const res = await fetch('/api/webhooks/batch-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: parsedBatchOrders })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.details || result.error || 'Failed to submit batch orders.');
      }

      setStatus('success');
      setBatchResultSummary(result);
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (err: any) {
      setStatus('error');
      setBatchParseError(err.message || 'Error executing batch order ingestion.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 p-2 rounded-xl border border-amber-500/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold">Manual Order Entry (n8n Offline Fallback)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Directly ingest Grab receipts when n8n automation is down or unreachable.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'single' && (
              <button
                type="button"
                onClick={handleFillSample}
                className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-900/40 px-3 py-1.5 rounded-lg transition-all"
              >
                ⚡ Fill Sample Order
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/40 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t border-x ${
              activeTab === 'single'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border-slate-200 dark:border-slate-800 border-b-transparent shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            ✏️ Single Order Entry
          </button>
          
          <button
            onClick={() => setActiveTab('excel')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x ${
              activeTab === 'excel'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-slate-200 dark:border-slate-800 border-b-transparent shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <span>📊 Excel / CSV Bulk Importer</span>
            <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-extrabold uppercase animate-pulse">
              Fast
            </span>
          </button>
        </div>

        {/* TAB 1: SINGLE ORDER FORM */}
        {activeTab === 'single' && (
          <form onSubmit={handleSubmitSingle} className="flex-1 overflow-y-auto p-6 space-y-6">
            {status === 'error' && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-400 text-sm p-3.5 rounded-xl flex items-center gap-2">
                <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {status === 'success' && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-sm p-3.5 rounded-xl flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Manual order successfully ingested and reconciled!</span>
              </div>
            )}

            {/* Section 1: Storefront & Order Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Storefront & Basic Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Select Registered Storefront
                  </label>
                  <select
                    value={selectedVendorEmail}
                    onChange={(e) => setSelectedVendorEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">-- Custom Identifier --</option>
                    {vendors.flatMap((v) =>
                      (v.storefronts || []).map((sf: any) => (
                        <option key={sf.id} value={sf.grabEmail}>
                          {sf.name} ({sf.grabEmail}) - {v.businessName}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {!selectedVendorEmail && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                      Custom Store Identifier / Email
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. store@grabfood.com"
                      value={customStoreIdentifier}
                      onChange={(e) => setCustomStoreIdentifier(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Grab Order ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GF-998271"
                    value={grabOrderId}
                    onChange={(e) => setGrabOrderId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Order Date & Time (DD/MM/YYYY)
                  </label>
                  <input
                    type="datetime-local"
                    lang="en-GB"
                    placeholder="dd/mm/yyyy hh:mm"
                    required
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    onFocus={(e) => e.currentTarget.showPicker()}
                    onClick={(e) => e.currentTarget.showPicker()}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Order Line Items */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Purchased Items</h3>
                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  + Add Item
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                {lineItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Item Name (e.g. Nasi Lemak)"
                        value={item.itemName}
                        onChange={(e) => handleLineItemChange(index, 'itemName', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 text-center"
                      />
                    </div>

                    <div className="w-28 relative">
                      <span className="absolute left-2.5 top-2 text-[11px] font-semibold text-slate-400 pointer-events-none">RM</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Unit Price"
                        value={item.unitPrice}
                        onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value)}
                        className="w-full pl-9 pr-2 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div className="w-24 text-right pr-1">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        RM {((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                      </span>
                    </div>

                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(index)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                        title="Remove item"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-right text-xs font-medium text-slate-500">
                Line Items Calculated Sum: <span className="font-bold text-slate-800 dark:text-slate-100">RM {lineItemsSum.toFixed(2)}</span>
              </div>
            </div>

            {/* Section 3: Financial Totals Breakdown */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">3. Grab Financial Totals Breakdown</h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Subtotal (RM)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={rawSubtotal}
                    onChange={(e) => setRawSubtotal(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Delivery Fee (RM)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={rawDeliveryFee}
                    onChange={(e) => setRawDeliveryFee(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tax / SST (RM)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={rawTax}
                    onChange={(e) => setRawTax(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Grab Commission (RM)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={rawGrabCommission}
                    onChange={(e) => setRawGrabCommission(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">Total Collected by Grab (RM)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={totalCollectedByGrab}
                    onChange={(e) => setTotalCollectedByGrab(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-800 dark:text-emerald-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Voucher / Promo Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. BARCODE-PROMO-50"
                  value={voucherBarcode}
                  onChange={(e) => setVoucherBarcode(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Form Submit Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={status === 'loading'}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center min-w-[140px]"
              >
                {status === 'loading' ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Submit Order'
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: EXCEL / CSV BULK IMPORTER & COPY-PASTE GRID */}
        {activeTab === 'excel' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Header info & Template Download */}
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-sm">Batch Import from Excel or CSV</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Upload an Excel spreadsheet or copy-paste rows directly from Excel to ingest dozens of orders simultaneously.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow transition-all flex items-center gap-1.5 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>📥 Download Excel Template</span>
              </button>
            </div>

            {batchParseError && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-400 text-sm p-3.5 rounded-xl flex items-center gap-2">
                <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{batchParseError}</span>
              </div>
            )}

            {batchResultSummary && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-sm p-4 rounded-xl space-y-2">
                <div className="font-bold flex items-center gap-2 text-base">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Batch Ingestion Completed!</span>
                </div>
                <div className="text-xs space-x-4">
                  <span>Total Orders: <strong>{batchResultSummary.total}</strong></span>
                  <span className="text-emerald-600 font-bold">Succeeded: {batchResultSummary.succeeded}</span>
                  {batchResultSummary.failed > 0 && (
                    <span className="text-rose-600 font-bold">Skipped/Failed: {batchResultSummary.failed}</span>
                  )}
                </div>
              </div>
            )}

            {/* Upload Modes: File Drop vs Direct Paste */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Option A: Dropzone */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-emerald-500 rounded-xl p-5 text-center transition-all bg-slate-50/50 dark:bg-slate-950/40 flex flex-col items-center justify-center min-h-[160px]">
                <svg className="w-8 h-8 text-emerald-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Option A: Upload Excel / CSV File</p>
                <p className="text-[11px] text-slate-400 mb-3">Drag & drop your .xlsx, .xls or .csv file here</p>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-950/40 dark:file:text-emerald-300"
                />
              </div>

              {/* Option B: Copy Paste Text Block */}
              <div className="space-y-2 flex flex-col">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Option B: Copy-Paste Rows directly from Excel
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste rows copied (Ctrl+C) from Excel or Sheets here..."
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  className="w-full flex-1 px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleParsePastedText}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-1.5 rounded-lg transition-all"
                >
                  Parse Copied Text
                </button>
              </div>
            </div>

            {/* Parsed Batch Orders Preview Table */}
            {parsedBatchOrders.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Parsed Batch Orders Preview ({parsedBatchOrders.length} Unique Orders)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setParsedBatchOrders([])}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    Clear Preview
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl shadow-inner divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
                  {parsedBatchOrders.map((order, idx) => (
                    <div key={idx} className="p-3.5 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{order.grabOrderId}</span>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 font-mono">
                            {order.storeIdentifier || 'No Email Specified'}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                          {order.orderLineItems.length} line items: {order.orderLineItems.map(i => `${i.quantity}x ${i.itemName}`).join(', ')}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="block font-bold text-emerald-600 dark:text-emerald-400">
                          RM {order.totalCollectedByGrab.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Subtotal: RM {order.rawSubtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Batch Submit Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-medium">
                {parsedBatchOrders.length > 0 ? `Ready to import ${parsedBatchOrders.length} orders` : 'No orders loaded yet'}
              </span>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleSubmitBatch}
                  disabled={status === 'loading' || parsedBatchOrders.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center min-w-[160px] disabled:opacity-50"
                >
                  {status === 'loading' ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    `Import ${parsedBatchOrders.length} Orders`
                  )}
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
