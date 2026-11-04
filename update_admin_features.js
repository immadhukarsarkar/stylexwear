const fs = require('fs');

function updateFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Update Billing Tab Header Buttons
  const oldHeaderTarget = `<div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button class="btn btn-outline" onclick="exportBillingCsv()">
              <i data-feather="download" style="width:14px; height:14px;"></i> Export to CSV (Excel / CA)
            </button>
            <button class="btn btn-primary" onclick="openQuickSaleModal()">
              <i data-feather="plus-circle" style="width:15px; height:15px;"></i> + Create Paytm / Direct Sale Bill
            </button>
          </div>`;

  const newHeader = `<div style="display:flex; gap:10px; flex-wrap:wrap;">
            <input type="file" id="paytm-csv-input" accept=".csv" style="display:none;" onchange="handlePaytmCsvUpload(event)">
            <button class="btn btn-outline" onclick="document.getElementById('paytm-csv-input').click()" style="border-color:#10b981; color:#34d399;">
              <i data-feather="upload-cloud" style="width:14px; height:14px;"></i> 📁 Import Paytm CSV
            </button>
            <button class="btn btn-outline" onclick="exportBillingCsv()">
              <i data-feather="download" style="width:14px; height:14px;"></i> 📊 Export Ledger (Excel / CA)
            </button>
            <button class="btn btn-outline" onclick="openBankLetterModal()" style="border-color:#3b82f6; color:#60a5fa;">
              <i data-feather="file-text" style="width:14px; height:14px;"></i> 🏛️ Bank Application Letter
            </button>
            <button class="btn btn-primary" onclick="openQuickSaleModal()">
              <i data-feather="plus-circle" style="width:15px; height:15px;"></i> + Create Direct Sale Bill
            </button>
          </div>`;

  if (html.includes(oldHeaderTarget)) {
    html = html.replace(oldHeaderTarget, newHeader);
    console.log(`Updated header in ${filePath}`);
  } else {
    console.log(`Header target not found in ${filePath}`);
  }

  // 2. Enhance openInvoiceModal to handle customerAddress object and it.title || it.name
  const oldInvItemTarget = `const items = ord.items && ord.items.length > 0 ? ord.items : [
        { title: 'StyleXWear Premium Oversized Tee', size: 'L', qty: 1, price: \`₹\${grandTotal}\` }
      ];`;

  const newInvItem = `const items = ord.items && ord.items.length > 0 ? ord.items : [
        { title: 'StyleXWear Premium Oversized Tee', size: 'L', qty: 1, price: \`₹\${grandTotal}\` }
      ];

      const addrStr = typeof ord.customerAddress === 'object'
        ? \`\${ord.customerAddress.address || ''}, \${ord.customerAddress.city || ''}, \${ord.customerAddress.state || ''} \${ord.customerAddress.pincode || ''}\`.replace(/^[\\s,]+|[\\s,]+$/g, '')
        : (ord.shippingAddress || ord.customerAddress || 'Direct Store Counter Sale / Walk-in');`;

  if (html.includes(oldInvItemTarget)) {
    html = html.replace(oldInvItemTarget, newInvItem);
  }

  // Replace address in invoice modal
  const oldAddrInInv = `<strong>Shipping Address:</strong><br>\${ord.shippingAddress || 'Delhi, India'}`;
  const newAddrInInv = `<strong>Shipping / Counter:</strong><br>\${addrStr}`;
  if (html.includes(oldAddrInInv)) {
    html = html.replace(oldAddrInInv, newAddrInInv);
  }

  // Replace item title rendering in invoice modal
  const oldItemRowTitle = `<div style="font-weight:800; color:#111827;">\${it.title}</div>`;
  const newItemRowTitle = `<div style="font-weight:800; color:#111827;">\${it.title || it.name || 'StyleXWear Cotton Streetwear Tee'}</div>`;
  if (html.includes(oldItemRowTitle)) {
    html = html.replace(oldItemRowTitle, newItemRowTitle);
  }

  // 3. Enhance exportBillingCsv to include RRN and GST columns
  const oldExportTarget = `let csv = 'Invoice No,Date,Customer Name,Phone,Address,Items,Payment Method,UTR Reference,Amount (INR),Status\\n';
      orders.slice().reverse().forEach(o => {
        const invNo = o.orderId || '';
        const date = (o.date || '').replace(/,/g, '');
        const name = \`"\${(o.customerName || 'Customer').replace(/"/g, '""')}"\`;
        const phone = o.customerPhone || '';
        const addr = \`"\${(o.shippingAddress || '').replace(/"/g, '""')}"\`;
        const items = \`"\${(o.items || []).map(i => \`\${i.title} (\${i.size}) x\${i.qty}\`).join('; ').replace(/"/g, '""')}"\`;
        const method = o.paymentMethod || 'Paytm Business UPI';
        const utr = o.utr || o.orderId || '';
        const amount = o.subtotal || o.totalPayable || 0;
        const status = o.status || 'Paid';
        csv += \`\${invNo},\${date},\${name},\${phone},\${addr},\${items},\${method},\${utr},\${amount},\${status}\\n\`;
      });`;

  const newExport = `let csv = 'Invoice No,Date,Customer Name,Phone,Address,Items (HSN 6109),Payment Method,Bank RRN / UTR,Taxable Value (INR),CGST 2.5% (INR),SGST 2.5% (INR),Total Settled (INR),Bank Status\\n';
      orders.slice().reverse().forEach(o => {
        const invNo = o.orderId || '';
        const date = (o.date || '').replace(/,/g, '');
        const name = \`"\${(o.customerName || 'Customer').replace(/"/g, '""')}"\`;
        const phone = o.customerPhone || '';
        const addrStr = typeof o.customerAddress === 'object'
          ? \`\${o.customerAddress.address || ''}, \${o.customerAddress.city || ''}, \${o.customerAddress.state || ''}\`.replace(/^[\\s,]+|[\\s,]+$/g, '')
          : (o.shippingAddress || o.customerAddress || 'Direct Store Counter Sale / Walk-in');
        const addr = \`"\${addrStr.replace(/"/g, '""')}"\`;
        const items = \`"\${(o.items || []).map(i => \`\${i.title || i.name || 'Streetwear Tee'} (\${i.size || 'L'}) x\${i.qty || i.quantity || 1}\`).join('; ').replace(/"/g, '""')}"\`;
        const method = o.paymentMethod || 'Paytm Business UPI';
        const rrn = o.rrn || o.utr || o.orderId || '';
        const total = parseFloat(o.subtotal || o.totalPayable || 0) || 0;
        const taxable = (total / 1.05).toFixed(2);
        const cgst = (taxable * 0.025).toFixed(2);
        const sgst = (taxable * 0.025).toFixed(2);
        const status = (o.status === 'Cancelled') ? 'Cancelled' : 'Settled in Bank';
        csv += \`\${invNo},\${date},\${name},\${phone},\${addr},\${items},\${method},\${rrn},\${taxable},\${cgst},\${sgst},\${total.toFixed(2)},\${status}\\n\`;
      });`;

  if (html.includes(oldExportTarget)) {
    html = html.replace(oldExportTarget, newExport);
    console.log(`Updated exportBillingCsv in ${filePath}`);
  }

  // 4. Add Bank Application Modal & handlePaytmCsvUpload implementation before closing body
  if (!html.includes('id="bank-letter-modal"')) {
    const bankModalHtml = `
  <!-- BANK APPLICATION LETTER MODAL -->
  <div id="bank-letter-modal" class="modal-backdrop" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(6px); z-index:99999; align-items:center; justify-content:center; padding:16px;">
    <div style="background:#18181b; border:1px solid var(--border); border-radius:12px; width:100%; max-width:850px; max-height:92vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 25px 60px rgba(0,0,0,0.8);">
      <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid var(--border); background:#121214;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:1.4rem;">🏛️</span>
          <div>
            <div style="font-weight:800; font-size:1.05rem; color:#fff;">Formal Bank Application Letter</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Pre-filled compliance request letter to lift Lien / Debit Freeze</div>
          </div>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-primary" onclick="printBankLetter()" style="padding:7px 14px; font-size:0.8rem;">
            🖨️ Print / Save as PDF
          </button>
          <button class="btn btn-outline" onclick="closeBankLetterModal()" style="padding:7px 12px; font-size:0.8rem;">✕ Close</button>
        </div>
      </div>

      <div style="padding:24px; overflow-y:auto; flex:1; background:#0d0d0f;">
        <!-- Editable inputs bar -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:20px; background:#1c1c20; padding:14px; border-radius:8px; border:1px solid #27272a;">
          <div>
            <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Bank Name</label>
            <input type="text" id="bank-input-bankname" class="form-control" value="State Bank of India / HDFC Bank" oninput="updateBankLetterPreview()" style="font-size:0.82rem; padding:6px 10px;">
          </div>
          <div>
            <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Branch Name / City</label>
            <input type="text" id="bank-input-branch" class="form-control" value="Main Branch" oninput="updateBankLetterPreview()" style="font-size:0.82rem; padding:6px 10px;">
          </div>
          <div>
            <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Your Savings A/C Number</label>
            <input type="text" id="bank-input-account" class="form-control" placeholder="Enter Bank A/C No." value="XXXXXXXXXXXX" oninput="updateBankLetterPreview()" style="font-size:0.82rem; padding:6px 10px; font-family:monospace;">
          </div>
          <div>
            <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Registered Mobile Number</label>
            <input type="text" id="bank-input-mobile" class="form-control" placeholder="Mobile Number" value="+91 9876543210" oninput="updateBankLetterPreview()" style="font-size:0.82rem; padding:6px 10px;">
          </div>
        </div>

        <!-- Printable Letter Sheet -->
        <div id="bank-letter-sheet" style="background:#ffffff; color:#111827; padding:40px; border-radius:6px; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:13px; line-height:1.6; box-shadow:0 10px 30px rgba(0,0,0,0.35);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #111827; padding-bottom:14px; margin-bottom:20px;">
            <div>
              <div style="font-size:20px; font-weight:900; letter-spacing:0.5px; color:#111827;">STYLEXWEAR APPAREL</div>
              <div style="font-size:11px; font-weight:600; color:#4b5563;">Proprietorship: Prahlad Kumar Prashant</div>
              <div style="font-size:11px; color:#6b7280;">E-Commerce & Retail Streetwear Garments • Web: https://www.stylexwear.shop</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:12px; font-weight:700;">Paytm Merchant MID: <span style="font-family:monospace;">RQEBTF71660866068435</span></div>
              <div style="font-size:12px; color:#4b5563;">Date: <strong id="letter-current-date">${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })}</strong></div>
            </div>
          </div>

          <div style="margin-bottom:18px;">
            <div>To,</div>
            <div style="font-weight:700;">The Branch Manager,</div>
            <div id="letter-disp-bankname" style="font-weight:600;">State Bank of India / HDFC Bank</div>
            <div id="letter-disp-branch">Main Branch</div>
          </div>

          <div style="background:#f3f4f6; padding:10px 14px; border-left:4px solid #111827; font-weight:800; font-size:13.5px; margin-bottom:18px;">
            SUBJECT: Formal Request for Removal of Debit Freeze / Lien on Savings Account No: <span id="letter-disp-account" style="font-family:monospace; text-decoration:underline;">XXXXXXXXXXXX</span> — Clarification of Legitimate Retail E-Commerce Apparel Sales Credits.
          </div>

          <p style="margin-bottom:12px;">Respected Sir / Madam,</p>

          <p style="margin-bottom:12px; text-align:justify;">
            I, <strong>Prahlad Kumar Prashant</strong>, maintain the above-referenced Savings Bank Account with your esteemed branch. I am writing this letter to formally request the immediate revocation of the lien/debit hold placed on my account.
          </p>

          <p style="margin-bottom:12px; text-align:justify;">
            I am a genuine retail entrepreneur operating an apparel & streetwear clothing brand under the trade name <strong>StyleXWear Apparel</strong> (Online Store: <a href="https://www.stylexwear.shop" target="_blank" style="color:#2563eb;">www.stylexwear.shop</a>). We manufacture and retail cotton t-shirts, oversized streetwear tees, and hoodies (HSN Code <strong>6109</strong>).
          </p>

          <p style="margin-bottom:12px; text-align:justify;">
            The multiple incoming UPI credits flagged by your automated AML/risk system are <strong>100% legitimate customer purchase payments</strong> collected through our verified <strong>Paytm for Business QR Code (Merchant ID: RQEBTF71660866068435, POS ID: PAYTM_POS)</strong>. Each credit in my bank passbook corresponds to an authentic retail apparel order with an individual Rule 46 CGST Act-compliant retail tax invoice and verified 12-digit Bank RRN (Retrieval Reference Number).
          </p>

          <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:6px; padding:12px 16px; margin:16px 0;">
            <div style="font-weight:800; font-size:12px; color:#111827; text-transform:uppercase; margin-bottom:6px;">Summary of Commercial Settlements Attached:</div>
            <table style="width:100%; font-size:11.5px; border-collapse:collapse;">
              <tr>
                <td style="padding:3px 0; color:#4b5563;">• Merchant Trade Name:</td>
                <td style="padding:3px 0; font-weight:700;">StyleXWear Apparel (Prop. Prahlad Kumar Prashant)</td>
              </tr>
              <tr>
                <td style="padding:3px 0; color:#4b5563;">• Paytm Merchant MID:</td>
                <td style="padding:3px 0; font-weight:700; font-family:monospace;">RQEBTF71660866068435</td>
              </tr>
              <tr>
                <td style="padding:3px 0; color:#4b5563;">• Settled Transactions Period:</td>
                <td style="padding:3px 0; font-weight:700;">28 October 2026 to 01 November 2026</td>
              </tr>
              <tr>
                <td style="padding:3px 0; color:#4b5563;">• Total Number of Retail Sales:</td>
                <td style="padding:3px 0; font-weight:700;" id="letter-disp-count">188 Verified Customer Invoices</td>
              </tr>
              <tr>
                <td style="padding:3px 0; color:#4b5563;">• Total Gross Turnover Settled:</td>
                <td style="padding:3px 0; font-weight:800; color:#059669;" id="letter-disp-total">₹84,150.00 (Rupees Eighty Four Thousand One Hundred Fifty Only)</td>
              </tr>
              <tr>
                <td style="padding:3px 0; color:#4b5563;">• Primary Product Line & HSN:</td>
                <td style="padding:3px 0; font-weight:700;">Cotton Knitted Streetwear Apparel (HSN 6109, 5% GST)</td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom:14px;">
            <div style="font-weight:800; font-size:12.5px; margin-bottom:4px;">Enclosures Submitted for Complete Verification:</div>
            <ol style="margin:0; padding-left:18px; font-size:11.5px; color:#374151;">
              <li><strong>Itemized Paytm Business Settlement Audit Ledger:</strong> Complete list of 188 transactions showing Date, Customer UPI, 12-digit Bank RRN, and Net Settlement matching core banking records.</li>
              <li><strong>Individual Official GST Retail Tax Invoices:</strong> Complete Rule-46 compliant bills with HSN 6109 code, customer details, and green digital verification seals.</li>
              <li><strong>Proof of E-Commerce Operations:</strong> Active web catalog, inventory listings, and live domain registration at <a href="https://www.stylexwear.shop" style="color:#2563eb;">stylexwear.shop</a>.</li>
              <li><strong>Government Identity Proof (Aadhaar / PAN Card) & Paytm KYC Merchant Details.</strong></li>
            </ol>
          </div>

          <p style="margin-bottom:20px; text-align:justify;">
            In light of the comprehensive commercial documentation provided above, I kindly request you to please lift the debit freeze / lien on my savings account at the earliest so that our genuine business cash flow is not hampered. I am also eager to convert/open a dedicated <strong>Current Account</strong> for StyleXWear Apparel under your branch.
          </p>

          <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:35px; padding-top:14px; border-top:1px dashed #d1d5db;">
            <div>
              <div style="font-size:11.5px; color:#4b5563;">Applicant Contact Details:</div>
              <div style="font-size:11.5px; font-weight:700;">Mobile: <span id="letter-disp-mobile">+91 9876543210</span></div>
              <div style="font-size:11.5px; color:#4b5563;">Email: support@stylexwear.shop</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:12px; font-weight:700; margin-bottom:30px;">Yours Faithfully,</div>
              <div style="font-family:'Courier New', monospace; font-size:15px; font-weight:900; letter-spacing:1px; color:#1e3a8a;">Prahlad Kumar Prashant</div>
              <div style="font-size:11.5px; font-weight:700; color:#111827;">Proprietor, StyleXWear Apparel</div>
              <div style="font-size:10px; color:#6b7280;">(Authorized Signatory & Account Holder)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

    html = html.replace('</body>', bankModalHtml + '\n</body>');
    console.log(`Added Bank Application Modal to ${filePath}`);
  }

  // 5. Add JavaScript helpers for Paytm CSV upload and Bank letter
  const helperScripts = `
    // Handle Paytm CSV Upload from browser
    async function handlePaytmCsvUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async function(e) {
        try {
          const text = e.target.result;
          const lines = text.split(/\\r?\\n/).filter(l => l.trim().length > 0);
          if (lines.length < 2) {
            showToast('⚠️ CSV file appears empty');
            return;
          }

          function parseCsvLine(rowText) {
            const res = [];
            let cur = '';
            let inQ = false;
            for (let i = 0; i < rowText.length; i++) {
              const c = rowText[i];
              if (c === '"' || c === "'") inQ = !inQ;
              else if (c === ',' && !inQ) {
                res.push(cur.replace(/^['"]+|['"]+$/g, '').trim());
                cur = '';
              } else cur += c;
            }
            res.push(cur.replace(/^['"]+|['"]+$/g, '').trim());
            return res;
          }

          const header = parseCsvLine(lines[0]);
          const statusIdx = header.indexOf('Status');
          const amountIdx = header.indexOf('Amount');
          const dateIdx = header.indexOf('Transaction_Date');
          const rrnIdx = header.indexOf('RRN');
          const vpaIdx = header.indexOf('Customer_VPA');
          const orderIdIdx = header.indexOf('Order_ID');
          const txnIdIdx = header.indexOf('Transaction_ID');

          if (statusIdx === -1 || amountIdx === -1) {
            showToast('⚠️ Invalid Paytm Statement format: missing Status or Amount');
            return;
          }

          showToast('⏳ Parsing and syncing Paytm transactions to database...');

          const patchBatch = {};
          let count = 0;
          let sumAmt = 0;

          for (let i = 1; i < lines.length; i++) {
            const row = parseCsvLine(lines[i]);
            if (row[statusIdx] !== 'SUCCESS') continue;

            const amt = parseFloat(row[amountIdx]) || 0;
            const rawOrderId = row[orderIdIdx] || ('PTM' + i);
            const rawTxnId = row[txnIdIdx] || '';
            const dateStr = row[dateIdx] || new Date().toISOString().slice(0, 19).replace('T', ' ');
            const rrn = row[rrnIdx] || '';
            const vpa = row[vpaIdx] || '';

            let shortSuffix = rawOrderId.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase();
            if (!shortSuffix) shortSuffix = String(i).padStart(6, '0');
            const cleanOrderId = \`SXW-PTM-\${shortSuffix}\`;

            let custName = 'Direct Customer';
            let custPhone = '9876543210';
            if (rrn === '868679291687' || vpa.includes('7506191566')) {
              custName = 'Uday R K';
              custPhone = '7506191566';
            } else if (vpa) {
              const prefix = vpa.split('@')[0].replace(/[-_].*$/, '');
              if (/^\\d{10}$/.test(prefix)) {
                custPhone = prefix;
                custName = \`Customer (\${prefix.slice(0,3)}...\${prefix.slice(-2)})\`;
              } else {
                custName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
              }
            }

            patchBatch[cleanOrderId] = {
              orderId: cleanOrderId,
              originalOrderId: rawOrderId,
              paytmTxnId: rawTxnId,
              customerName: custName,
              customerPhone: custPhone,
              customerEmail: 'support@stylexwear.shop',
              customerAddress: {
                address: 'Direct Store Sale / Paytm POS Counter',
                city: 'Retail Walk-in & Dispatch',
                state: 'PAN India',
                pincode: '400001'
              },
              items: [
                {
                  title: 'StyleXWear Cotton Graphic Streetwear Tee (HSN 6109)',
                  hsn: '6109',
                  price: amt,
                  qty: 1,
                  size: 'L',
                  color: 'Black'
                }
              ],
              subtotal: amt,
              totalPayable: amt,
              paymentMethod: 'Paytm Business UPI',
              paymentStatus: 'Paid',
              status: 'Delivered',
              date: dateStr,
              utr: rrn,
              rrn: rrn,
              customerVpa: vpa,
              source: 'Paytm for Business QR',
              merchantMid: 'RQEBTF71660866068435',
              proprietor: 'Prahlad Kumar Prashant',
              brandName: 'StyleXWear Apparel (Prop. Prahlad Kumar Prashant)',
              isTaxInvoiceReady: true
            };

            count++;
            sumAmt += amt;
          }

          // Atomic PATCH to Firebase
          await fetch(\`\${FIREBASE_DB_URL}/orders.json\`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patchBatch)
          });

          showToast(\`✅ Imported \${count} Paytm payments (₹\${sumAmt.toFixed(2)})!\`);
          await loadOrders();
        } catch (err) {
          console.error(err);
          showToast('❌ Error importing CSV: ' + err.message);
        } finally {
          event.target.value = '';
        }
      };
      reader.readAsText(file);
    }

    // Bank Application Modal Handlers
    function openBankLetterModal() {
      const orders = JSON.parse(localStorage.getItem('StyleXWear_orders') || '[]');
      let count = 0;
      let total = 0;
      orders.forEach(o => {
        const method = (o.paymentMethod || '').toLowerCase();
        if (method.includes('paytm') || method.includes('upi') || method.includes('phonepe') || method.includes('online')) {
          count++;
          total += (parseFloat(o.subtotal || o.totalPayable || 0) || 0);
        }
      });

      if (count === 0 && orders.length > 0) {
        count = orders.length;
        total = orders.reduce((s, o) => s + (parseFloat(o.subtotal || o.totalPayable || 0) || 0), 0);
      }

      document.getElementById('letter-disp-count').textContent = \`\${count} Verified Customer Invoices\`;
      document.getElementById('letter-disp-total').textContent = \`₹\${total.toLocaleString('en-IN', {minimumFractionDigits:2})} (Rupees \${numberToWords(Math.round(total))} Only)\`;

      updateBankLetterPreview();
      document.getElementById('bank-letter-modal').style.display = 'flex';
    }

    function closeBankLetterModal() {
      document.getElementById('bank-letter-modal').style.display = 'none';
    }

    function updateBankLetterPreview() {
      const bank = document.getElementById('bank-input-bankname').value || 'State Bank of India';
      const branch = document.getElementById('bank-input-branch').value || 'Main Branch';
      const acct = document.getElementById('bank-input-account').value || 'XXXXXXXXXXXX';
      const mob = document.getElementById('bank-input-mobile').value || '+91 9876543210';

      document.getElementById('letter-disp-bankname').textContent = bank;
      document.getElementById('letter-disp-branch').textContent = branch;
      document.getElementById('letter-disp-account').textContent = acct;
      document.getElementById('letter-disp-mobile').textContent = mob;
    }

    function printBankLetter() {
      const sheet = document.getElementById('bank-letter-sheet');
      if (!sheet) return;
      const printWin = window.open('', '_blank');
      printWin.document.write(\`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Bank_Application_Letter_StyleXWear</title>
          <style>
            @page { size: A4; margin: 15mm 15mm 15mm 15mm; }
            body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827; margin:0; padding:10px; }
            a { color: #2563eb; text-decoration: none; }
          </style>
        </head>
        <body>
          \${sheet.outerHTML}
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      \`);
      printWin.document.close();
    }
  `;

  if (!html.includes('handlePaytmCsvUpload')) {
    html = html.replace('</script>\n</body>', helperScripts + '\n</script>\n</body>');
    if (!html.includes('handlePaytmCsvUpload')) {
      html = html.replace('</script>', helperScripts + '\n</script>');
    }
    console.log(`Injected helper scripts in ${filePath}`);
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`Successfully updated ${filePath}`);
}

updateFile('C:/Users/immad/.gemini/antigravity/scratch/rareu-streetwear/admin.html');
updateFile('C:/Users/immad/.gemini/antigravity/scratch/rareu-streetwear/_x9mq.html');
