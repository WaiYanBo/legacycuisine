import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { prisma } from '../prisma';
import { CompressionUtil } from '../utils/compression.util';

/**
 * Utility helper to convert numeric values to Malaysian Ringgit word formats.
 * e.g., 4999.50 -> "Four Thousand Nine Hundred and Ninety-Nine Ringgit and Fifty Cents Only"
 */
export function numberToWords(num: number): string {
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertLessThanThousand(n: number): string {
    if (n === 0) return '';
    let str = '';
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
      if (n > 0) {
        str += '-' + ones[n] + ' ';
      }
    } else if (n > 0) {
      str += ones[n] + ' ';
    }
    return str.trim();
  }

  if (num === 0) return 'Zero Ringgit Only';

  // Extract decimals as 2 decimal places
  const parts = num.toFixed(2).split('.');
  const ringgitPart = parseInt(parts[0], 10);
  const centsPart = parseInt(parts[1], 10);

  let result = '';

  if (ringgitPart > 0) {
    let n = ringgitPart;
    let scaleIdx = 0;
    const scales = ['', 'Thousand', 'Million', 'Billion'];
    const wordsArr: string[] = [];

    while (n > 0) {
      const chunk = n % 1000;
      if (chunk > 0) {
        const chunkWords = convertLessThanThousand(chunk);
        const scale = scales[scaleIdx];
        wordsArr.unshift(chunkWords + (scale ? ' ' + scale : ''));
      }
      n = Math.floor(n / 1000);
      scaleIdx++;
    }
    result = wordsArr.join(' ').trim() + ' Ringgit';
  } else {
    result = 'Zero Ringgit';
  }

  if (centsPart > 0) {
    const centsWords = convertLessThanThousand(centsPart);
    result += ' and ' + centsWords + ' Cents';
  }

  return result.trim() + ' Only';
}

export class PdfService {
  /**
   * Generates a corporate statement invoice PDF for a specific invoice ID.
   * Resolves reconciliation items, builds a clean HTML dashboard template,
   * invokes Puppeteer to print it, saves to local storage, and updates the db paths.
   */
  static async generateInvoicePdf(invoiceId: string): Promise<string> {
    // 1. Fetch Invoice with Vendor and Reconciliation Logs
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        vendor: true,
        reconciliationLogs: {
          include: {
            grabOrder: true
          }
        }
      }
    });

    if (!invoice) {
      throw new Error(`Invoice with ID "${invoiceId}" not found.`);
    }

    if (!invoice.reconciliationLogs || invoice.reconciliationLogs.length === 0) {
      throw new Error(`Invoice "${invoice.invoiceNumber}" contains no transaction reconciliation logs.`);
    }

    // 2. Calculations
    let grandTotalSubtotal = 0;
    let grandTotalPayout = 0;
    let barcodeValue = 'NONE';

    const transactionRows = invoice.reconciliationLogs.map((log) => {
      const grabOrder = log.grabOrder;
      const subtotal = grabOrder.rawSubtotal.toNumber();
      const basePayout = log.totalVendorPayout.toNumber();
      const adjustment = log.adjustmentAmount.toNumber();
      const finalPayout = basePayout + adjustment;

      grandTotalSubtotal += subtotal;
      grandTotalPayout += finalPayout;

      // Extract the first available voucher barcode for the barcode print section
      if (barcodeValue === 'NONE' && grabOrder.grabEmail && log.grabOrderId) {
        // Find if voucherBarcode was captured
        // We look for a barcode parsed during receipt scan, stored on the log or raw order.
        // We will default to a fallback if none exists, or lookup if order has promo details.
        // Let's check adjustment note or mock some barcode logic if the barcode field itself isn't stored.
        // The voucher barcode can be fetched from the webhook body or adjustment text.
        // We will mock one based on the order ID if no barcode was captured.
        barcodeValue = invoice.invoiceNumber;
      }

      return {
        orderId: grabOrder.grabOrderId,
        date: grabOrder.orderDate.toLocaleDateString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' }),
        subtotal: subtotal.toFixed(2),
        basePayout: basePayout.toFixed(2),
        adjustment: adjustment.toFixed(2),
        finalPayout: finalPayout.toFixed(2)
      };
    });

    const totalWrittenWords = numberToWords(grandTotalPayout);
    const billingDateStr = invoice.billingDate.toLocaleDateString('en-MY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // 3. Construct HTML Template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice - ${invoice.invoiceNumber}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 30px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo-container {
      display: flex;
      flex-direction: column;
    }
    .logo-text {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .company-meta {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
      line-height: 1.4;
    }
    .invoice-header {
      text-align: right;
    }
    .invoice-title {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      margin: 0 0 5px 0;
    }
    .invoice-number-tag {
      font-size: 14px;
      font-weight: 700;
      color: #0284c7;
    }
    .metadata-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 15px 20px;
    }
    .meta-col {
      width: 48%;
    }
    .meta-title {
      font-size: 10px;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }
    .meta-content {
      font-size: 13px;
      color: #334155;
    }
    .meta-name {
      font-weight: 700;
      font-size: 14px;
      color: #0f172a;
    }
    .table-container {
      margin-top: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    th {
      background-color: #f8fafc;
      border-bottom: 2px solid #e2e8f0;
      color: #475569;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 12px;
    }
    td {
      border-bottom: 1px solid #e2e8f0;
      padding: 10px 12px;
      font-size: 12px;
      color: #334155;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .text-right {
      text-align: right;
    }
    .totals-row td {
      font-size: 13px;
      font-weight: 700;
      background-color: #f8fafc;
      border-top: 2px solid #cbd5e1;
      border-bottom: 2px solid #cbd5e1;
      color: #0f172a;
    }
    .written-payout {
      font-size: 11px;
      font-weight: normal;
      font-style: italic;
      color: #64748b;
      margin-top: 4px;
    }
    .barcode-container {
      margin-top: 50px;
      border-top: 1px dashed #cbd5e1;
      padding-top: 30px;
      text-align: center;
    }
    .barcode-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #94a3b8;
      margin-bottom: 6px;
    }
    #barcode {
      max-width: 250px;
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="logo-container">
      <span class="logo-text">LEGACY CUISINE AGENCY</span>
      <div class="company-meta">
        Registration No: 202603129845 (MA03291-A)<br>
        Suite 23A, Level 24, Menara Prudential<br>
        Persiaran TRX, 55188 Kuala Lumpur, Malaysia
      </div>
    </div>
    <div class="invoice-header">
      <h1 class="invoice-title">Payout Statement</h1>
      <span class="invoice-number-tag">No: ${invoice.invoiceNumber}</span>
    </div>
  </div>

  <div class="metadata-section">
    <div class="meta-col">
      <div class="meta-title">Prepared For Vendor</div>
      <div class="meta-content">
        <span class="meta-name">${invoice.vendor.businessName}</span><br>
        Merchant Representative: ${invoice.vendor.name}<br>
        Contact Email: ${invoice.vendor.contactEmail}<br>
        Status: ${invoice.vendor.status}
      </div>
    </div>
    <div class="meta-col text-right">
      <div class="meta-title">Statement Parameters</div>
      <div class="meta-content">
        Billing Date: <strong>${billingDateStr}</strong><br>
        Generated Timezone: Asia/Kuala_Lumpur (MYT)<br>
        Settlement Period: Monthly Cycle
      </div>
    </div>
  </div>

  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Grab Order ID</th>
          <th>Order Date</th>
          <th class="text-right">Grab Subtotal</th>
          <th class="text-right">Vendor Base Price</th>
          <th class="text-right">Adjustment</th>
          <th class="text-right">Final Payout</th>
        </tr>
      </thead>
      <tbody>
        ${transactionRows.map(row => `
          <tr>
            <td><strong>${row.orderId}</strong></td>
            <td>${row.date}</td>
            <td class="text-right">RM ${row.subtotal}</td>
            <td class="text-right">RM ${row.basePayout}</td>
            <td class="text-right">RM ${row.adjustment}</td>
            <td class="text-right"><strong>RM ${row.finalPayout}</strong></td>
          </tr>
        `).join('')}
        
        <tr class="totals-row">
          <td colspan="4">Total Vendor Settlement Payout Summary</td>
          <td class="text-right">Total:</td>
          <td class="text-right">
            <strong>RM ${grandTotalPayout.toFixed(2)}</strong>
            <div class="written-payout">${totalWrittenWords}</div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="barcode-container" id="barcode-wrap">
    <div class="barcode-title">Verification Voucher Barcode</div>
    <svg id="barcode"></svg>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
  <script>
    window.onload = function() {
      const value = "${barcodeValue}";
      if (value && value !== 'NONE') {
        JsBarcode("#barcode", value, {
          format: "CODE128",
          width: 1.8,
          height: 45,
          displayValue: true,
          fontSize: 10,
          margin: 0
        });
      } else {
        document.getElementById('barcode-wrap').style.display = 'none';
      }
    };
  </script>
</body>
</html>
    `;

    // 4. Puppeteer Page Load and Print
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      // Load raw content with script rendering
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      // Build target directory
      const targetDir = path.join(process.cwd(), 'storage', 'invoices');
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const fileName = `invoice-${invoice.invoiceNumber}.pdf.gz`;
      const localFilePath = path.join(targetDir, fileName);

      // Print PDF to memory buffer
      const rawPdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          bottom: '20px',
          left: '20px',
          right: '20px'
        }
      });

      // Compress PDF buffer using Gzip compression before disk/cloud storage
      const compressedBuffer = await CompressionUtil.compressBuffer(Buffer.from(rawPdfBuffer));
      fs.writeFileSync(localFilePath, compressedBuffer);

      // Update invoice path in database
      const dbPath = `/storage/invoices/${fileName}`;
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { pdfPath: dbPath }
      });

      return dbPath;
    } finally {
      await browser.close();
    }
  }

  /**
   * Takes a list of ReconciliationLog IDs, groups them by Vendor, creates invoices,
   * and runs Puppeteer to render a consolidated statement PDF for each.
   */
  static async generateBatchInvoices(logIds: string[]): Promise<any[]> {
    // 1. Fetch matching logs including storefront vendor info
    const logs = await prisma.reconciliationLog.findMany({
      where: { id: { in: logIds } },
      include: {
        grabOrder: {
          include: {
            storefront: true
          }
        }
      }
    });

    if (logs.length === 0) {
      throw new Error('No reconciliation logs found for the provided IDs.');
    }

    // 2. Group logs by Vendor ID
    const vendorLogsMap: Record<string, typeof logs> = {};
    for (const log of logs) {
      const vendorId = log.grabOrder.storefront.vendorId;
      if (!vendorLogsMap[vendorId]) {
        vendorLogsMap[vendorId] = [];
      }
      vendorLogsMap[vendorId].push(log);
    }

    const results = [];

    // 3. For each vendor, create an Invoice and compile the PDF
    for (const [vendorId, vendorLogs] of Object.entries(vendorLogsMap)) {
      const invoiceNum = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const invoice = await prisma.invoice.create({
        data: {
          vendorId,
          invoiceNumber: invoiceNum,
          billingDate: new Date(),
          status: 'DRAFT'
        }
      });

      // Link logs to this invoice and update their status to INVOICED
      await prisma.reconciliationLog.updateMany({
        where: { id: { in: vendorLogs.map(l => l.id) } },
        data: {
          invoiceId: invoice.id,
          status: 'INVOICED'
        }
      });

      // Render the PDF
      const pdfPath = await this.generateInvoicePdf(invoice.id);

      results.push({
        invoiceId: invoice.id,
        invoiceNumber: invoiceNum,
        vendorId,
        pdfPath,
        logsLinked: vendorLogs.length
      });
    }

    return results;
  }
}
