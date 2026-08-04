import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

async function generateSamplePdf() {
  console.log('Generating sample GrabFood receipt PDF...');

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>GrabFood Merchant Order Receipt</title>
    <style>
      body {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        color: #1c1e21;
        padding: 40px;
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
      }
      .header {
        border-bottom: 2px solid #00b14f;
        padding-bottom: 15px;
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .logo {
        font-size: 26px;
        font-weight: bold;
        color: #00b14f;
        letter-spacing: -0.5px;
      }
      .receipt-title {
        font-size: 14px;
        color: #65676b;
        text-transform: uppercase;
        font-weight: 600;
      }
      .details-box {
        background-color: #f7f8fa;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 25px;
        font-size: 13px;
        line-height: 1.6;
      }
      .details-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
      }
      .details-label {
        color: #65676b;
      }
      .details-value {
        font-weight: 600;
        color: #050505;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 25px;
        font-size: 13px;
      }
      th {
        text-align: left;
        padding: 10px 8px;
        background-color: #f0f2f5;
        color: #4b4c4e;
        font-size: 12px;
        text-transform: uppercase;
      }
      td {
        padding: 12px 8px;
        border-bottom: 1px solid #e4e6eb;
      }
      .price-col {
        text-align: right;
        font-weight: 500;
      }
      .totals {
        width: 100%;
        font-size: 13px;
        margin-top: 10px;
      }
      .totals-row {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
      }
      .totals-grand {
        font-size: 16px;
        font-weight: bold;
        border-top: 2px dashed #ccd0d5;
        padding-top: 12px;
        margin-top: 6px;
        color: #00b14f;
      }
      .footer {
        margin-top: 40px;
        text-align: center;
        font-size: 11px;
        color: #8a8d91;
        border-top: 1px solid #e4e6eb;
        padding-top: 15px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="logo">GrabFood</div>
      <div class="receipt-title">Official Merchant Statement</div>
    </div>

    <div class="details-box">
      <div class="details-row">
        <span class="details-label">Store Identifier:</span>
        <span class="details-value">112121212</span>
      </div>
      <div class="details-row">
        <span class="details-label">Store Name:</span>
        <span class="details-value">Legacy Cuisine Test</span>
      </div>
      <div class="details-row">
        <span class="details-label">Grab Order ID:</span>
        <span class="details-value">GF-88392014</span>
      </div>
      <div class="details-row">
        <span class="details-label">Order Date & Time:</span>
        <span class="details-value">27 Jul 2026, 02:30 PM</span>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item Description</th>
          <th style="text-align: center;">Qty</th>
          <th class="price-col">Unit Price (RM)</th>
          <th class="price-col">Total (RM)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Signature Legacy Nasi Lemak</strong></td>
          <td style="text-align: center;">2</td>
          <td class="price-col">18.00</td>
          <td class="price-col">36.00</td>
        </tr>
        <tr>
          <td><strong>Special Herbal Chicken Soup</strong></td>
          <td style="text-align: center;">1</td>
          <td class="price-col">22.00</td>
          <td class="price-col">22.00</td>
        </tr>
        <tr>
          <td><strong>Iced Pandan Cendol</strong></td>
          <td style="text-align: center;">2</td>
          <td class="price-col">8.50</td>
          <td class="price-col">17.00</td>
        </tr>
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <span>Items Subtotal:</span>
        <span>RM 75.00</span>
      </div>
      <div class="totals-row">
        <span>Delivery Fee Collected:</span>
        <span>RM 4.00</span>
      </div>
      <div class="totals-row">
        <span>Grab Platform Commission (20%):</span>
        <span>-RM 15.00</span>
      </div>
      <div class="totals-row totals-grand">
        <span>Total Collected by Grab:</span>
        <span>RM 79.00</span>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for partnering with GrabFood Malaysia.</p>
      <p>Legacy Cuisine F&B Management System • Automated Reconciliation Service</p>
    </div>
  </body>
  </html>
  `;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  const outputPdfPath = path.join(process.cwd(), 'sample_grabfood_receipt.pdf');
  await page.pdf({
    path: outputPdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
  });

  await browser.close();
  console.log(`✅ PDF generated successfully: ${outputPdfPath}`);
}

generateSamplePdf().catch(console.error);
