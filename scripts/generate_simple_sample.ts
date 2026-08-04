import fs from 'fs';
import path from 'path';

function createSimplePdf() {
  const pdfPath = path.join(process.cwd(), 'sample_grabfood_receipt.pdf');
  
  // Create a clean formatted text statement file as test input
  const receiptContent = `=====================================================
            GRABFOOD MALAYSIA e-RECEIPT
=====================================================
Store Identifier : 112121212
Store Name       : Legacy Cuisine Test
Grab Order ID    : GF-88392014
Order Date       : 2026-07-27T14:30:00Z
Status           : DELIVERED

-----------------------------------------------------
ORDER ITEMS:
-----------------------------------------------------
1. Signature Legacy Nasi Lemak
   Qty: 2  | Unit Price: RM 18.00  | Total: RM 36.00

2. Special Herbal Chicken Soup
   Qty: 1  | Unit Price: RM 22.00  | Total: RM 22.00

3. Iced Pandan Cendol
   Qty: 2  | Unit Price: RM 8.50   | Total: RM 17.00

-----------------------------------------------------
FINANCIAL BREAKDOWN:
-----------------------------------------------------
Raw Subtotal             : RM 75.00
Delivery Fee             : RM 4.00
Tax (SST)                : RM 0.00
Grab Commission (20%)    : RM 15.00
Total Collected By Grab  : RM 79.00
=====================================================
`;

  fs.writeFileSync(pdfPath, receiptContent);
  console.log(`Sample receipt statement created at: ${pdfPath}`);
}

createSimplePdf();
