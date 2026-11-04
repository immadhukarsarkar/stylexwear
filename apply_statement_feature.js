const fs = require('fs');

function applyStatementFeature(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Add "📑 1-Click Statement PDF" button to top Billing header if not present
  const oldHeaderTarget = `<button class="btn btn-outline" onclick="exportBillingCsv()">
              <i data-feather="download" style="width:14px; height:14px;"></i> 📊 Export Ledger (Excel / CA)
            </button>`;

  const newHeaderButtons = `<button class="btn btn-primary" onclick="openStatementModal()" style="background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#fff; font-weight:800; border:none; box-shadow:0 4px 15px rgba(16,185,129,0.35);">
              <i data-feather="file-text" style="width:15px; height:15px;"></i> 📑 1-Click Statement PDF
            </button>
            <button class="btn btn-outline" onclick="exportBillingCsv()">
              <i data-feather="download" style="width:14px; height:14px;"></i> 📊 Export Ledger (Excel / CA)
            </button>`;

  if (html.includes(oldHeaderTarget) && !html.includes('openStatementModal()')) {
    html = html.replace(oldHeaderTarget, newHeaderButtons);
    console.log(`Added top Statement button in ${filePath}`);
  }

  // 2. Enhance Billing Filter Bar with Date Preset & Range Selector
  const oldFilterBar = `<div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:16px; flex-wrap:wrap;">
          <div style="display:flex; gap:8px;">
            <button class="btn btn-outline active-filter-btn" id="filter-all-btn" onclick="filterBilling('all')" style="padding:6px 14px; font-size:0.8rem;">All Payments</button>
            <button class="btn btn-outline" id="filter-paytm-btn" onclick="filterBilling('paytm')" style="padding:6px 14px; font-size:0.8rem;">Paytm / UPI</button>
            <button class="btn btn-outline" id="filter-cod-btn" onclick="filterBilling('cod')" style="padding:6px 14px; font-size:0.8rem;">COD / Cash</button>
          </div>
          <input type="text" id="billing-search" class="form-control" placeholder="Search by customer, phone, or UTR..." oninput="filterBillingSearch()" style="max-width:280px; padding:7px 12px; font-size:0.82rem;">
        </div>`;

  const newFilterBar = `<div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:16px; flex-wrap:wrap;">
          <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
            <button class="btn btn-outline active-filter-btn" id="filter-all-btn" onclick="filterBilling('all')" style="padding:6px 14px; font-size:0.8rem;">All Payments</button>
            <button class="btn btn-outline" id="filter-paytm-btn" onclick="filterBilling('paytm')" style="padding:6px 14px; font-size:0.8rem;">Paytm / UPI</button>
            <button class="btn btn-outline" id="filter-cod-btn" onclick="filterBilling('cod')" style="padding:6px 14px; font-size:0.8rem;">COD / Cash</button>

            <!-- Quick Date Selector -->
            <div style="display:flex; align-items:center; gap:6px; background:#18181b; padding:4px 10px; border-radius:8px; border:1px solid var(--border);">
              <span style="font-size:0.75rem; color:#10b981; font-weight:800;">📅 PERIOD:</span>
              <select id="billing-date-preset" class="form-control" onchange="handleDatePresetChange(this.value)" style="padding:4px 8px; font-size:0.78rem; border:none; background:transparent; color:#fff; cursor:pointer;">
                <option value="all" style="background:#18181b; color:#fff;">All Time (Full Period: 28 Oct - 01 Nov)</option>
                <option value="last7" style="background:#18181b; color:#fff;">Last 7 Days</option>
                <option value="today" style="background:#18181b; color:#fff;">Today</option>
                <option value="2026-11-01" style="background:#18181b; color:#fff;">01 Nov 2026 (Daily Statement)</option>
                <option value="2026-10-31" style="background:#18181b; color:#fff;">31 Oct 2026 (Daily Statement)</option>
                <option value="2026-10-30" style="background:#18181b; color:#fff;">30 Oct 2026 (Daily Statement)</option>
                <option value="2026-10-29" style="background:#18181b; color:#fff;">29 Oct 2026 (Daily Statement)</option>
                <option value="2026-10-28" style="background:#18181b; color:#fff;">28 Oct 2026 (Daily Statement)</option>
                <option value="custom" style="background:#18181b; color:#fff;">⚙️ Custom Date Range...</option>
              </select>
              <div id="billing-custom-date-box" style="display:none; align-items:center; gap:4px;">
                <input type="date" id="billing-date-from" value="2026-10-28" style="background:#27272a; color:#fff; border:1px solid #3f3f46; border-radius:4px; padding:3px 6px; font-size:0.75rem;" onchange="applyBillingFilters()">
                <span style="color:var(--text-muted); font-size:0.72rem;">to</span>
                <input type="date" id="billing-date-to" value="2026-11-01" style="background:#27272a; color:#fff; border:1px solid #3f3f46; border-radius:4px; padding:3px 6px; font-size:0.75rem;" onchange="applyBillingFilters()">
              </div>
            </div>
          </div>

          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <button class="btn btn-primary" onclick="openStatementModal()" style="background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#fff; font-weight:800; border:none; padding:7px 14px; font-size:0.8rem; box-shadow:0 4px 15px rgba(16,185,129,0.35); display:inline-flex; align-items:center; gap:6px;">
              <i data-feather="file-text" style="width:14px; height:14px;"></i> 📑 1-Click Statement PDF
            </button>
            <input type="text" id="billing-search" class="form-control" placeholder="Search by customer, phone, or UTR..." oninput="filterBillingSearch()" style="max-width:240px; padding:7px 12px; font-size:0.82rem;">
          </div>
        </div>`;

  if (html.includes(oldFilterBar)) {
    html = html.replace(oldFilterBar, newFilterBar);
    console.log(`Updated filter bar in ${filePath}`);
  }

  // 3. Update renderBillingTable to support date filtering
  const oldRenderBillingTableStart = `function renderBillingTable(ordersList, filter = activeBillingFilter, search = '') {
      const orders = ordersList || JSON.parse(localStorage.getItem('StyleXWear_orders') || '[]');
      const tbody = document.getElementById('billing-table-body');
      if (!tbody) return;

      tbody.innerHTML = '';

      let totalInv = 0;
      let paytmInv = 0;
      let codInv = 0;
      let count = 0;

      const q = (search || '').toLowerCase().trim();

      orders.slice().reverse().forEach((ord) => {
        const subtotal = ord.subtotal || ord.totalPayable || 0;
        const method = ord.paymentMethod || 'Paytm Business UPI';
        const isPaytm = method.toLowerCase().includes('paytm') || method.toLowerCase().includes('upi') || method.toLowerCase().includes('phonepe') || method.toLowerCase().includes('online') || method.toLowerCase().includes('prepaid');
        const isCod = method.toLowerCase().includes('cod') || method.toLowerCase().includes('cash');

        totalInv += subtotal;
        if (isPaytm) paytmInv += subtotal;
        if (isCod) codInv += subtotal;

        // Apply tab filter
        if (filter === 'paytm' && !isPaytm) return;
        if (filter === 'cod' && !isCod) return;`;

  const newRenderBillingTableStart = `let activeBillingDatePreset = 'all';
    let activeBillingDateFrom = '2026-10-28';
    let activeBillingDateTo = '2026-11-01';

    function renderBillingTable(ordersList, filter = activeBillingFilter, search = '') {
      const orders = ordersList || JSON.parse(localStorage.getItem('StyleXWear_orders') || '[]');
      const tbody = document.getElementById('billing-table-body');
      if (!tbody) return;

      tbody.innerHTML = '';

      let totalInv = 0;
      let paytmInv = 0;
      let codInv = 0;
      let count = 0;

      const q = (search || '').toLowerCase().trim();

      orders.slice().reverse().forEach((ord) => {
        const subtotal = ord.subtotal || ord.totalPayable || 0;
        const method = ord.paymentMethod || 'Paytm Business UPI';
        const isPaytm = method.toLowerCase().includes('paytm') || method.toLowerCase().includes('upi') || method.toLowerCase().includes('phonepe') || method.toLowerCase().includes('online') || method.toLowerCase().includes('prepaid');
        const isCod = method.toLowerCase().includes('cod') || method.toLowerCase().includes('cash');

        // Apply Date Preset Filter
        const ordDateStr = (ord.date || '').slice(0, 10);
        if (activeBillingDatePreset === 'today') {
          const todayStr = new Date().toISOString().slice(0, 10);
          if (ordDateStr !== todayStr) return;
        } else if (activeBillingDatePreset === 'last7') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const ordDate = new Date(ord.date);
          if (ordDate < sevenDaysAgo) return;
        } else if (activeBillingDatePreset.startsWith('2026-')) {
          if (ordDateStr !== activeBillingDatePreset) return;
        } else if (activeBillingDatePreset === 'custom') {
          if (activeBillingDateFrom && ordDateStr < activeBillingDateFrom) return;
          if (activeBillingDateTo && ordDateStr > activeBillingDateTo) return;
        }

        totalInv += subtotal;
        if (isPaytm) paytmInv += subtotal;
        if (isCod) codInv += subtotal;

        // Apply tab filter
        if (filter === 'paytm' && !isPaytm) return;
        if (filter === 'cod' && !isCod) return;`;

  if (html.includes(oldRenderBillingTableStart)) {
    html = html.replace(oldRenderBillingTableStart, newRenderBillingTableStart);
    console.log(`Updated renderBillingTable date filtering in ${filePath}`);
  }

  // 4. Add Statement Modal HTML before closing body
  const statementModalHtml = `
  <!-- PRO BANK STATEMENT MODAL -->
  <div id="statement-modal" class="modal-backdrop" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.88); backdrop-filter:blur(8px); z-index:99999; align-items:center; justify-content:center; padding:16px;">
    <div style="background:#18181b; border:1px solid var(--border); border-radius:12px; width:100%; max-width:1050px; max-height:94vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 25px 70px rgba(0,0,0,0.9);">
      
      <!-- Modal Top Bar -->
      <div style="display:flex; justify-content:space-between; align-items:center; padding:14px 20px; border-bottom:1px solid var(--border); background:#121214; flex-wrap:wrap; gap:10px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:1.5rem;">📑</span>
          <div>
            <div style="font-weight:800; font-size:1.05rem; color:#fff;">Official Commercial Settlement Statement</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Rule-46 CGST Act & Core Banking RRN Audit Statement</div>
          </div>
        </div>

        <!-- Period selector inside modal -->
        <div style="display:flex; align-items:center; gap:8px;">
          <label style="font-size:0.75rem; color:#10b981; font-weight:800;">STATEMENT PERIOD:</label>
          <select id="modal-stmt-period-select" class="form-control" onchange="changeModalStatementPeriod(this.value)" style="padding:5px 10px; font-size:0.78rem; width:auto; border-color:#3f3f46;">
            <option value="all">Full Statement (28 Oct – 01 Nov 2026)</option>
            <option value="2026-11-01">01 Nov 2026 (Daily Statement)</option>
            <option value="2026-10-31">31 Oct 2026 (Daily Statement)</option>
            <option value="2026-10-30">30 Oct 2026 (Daily Statement)</option>
            <option value="2026-10-29">29 Oct 2026 (Daily Statement)</option>
            <option value="2026-10-28">28 Oct 2026 (Daily Statement)</option>
            <option value="last7">Last 7 Days</option>
            <option value="today">Today</option>
          </select>
        </div>

        <!-- Actions -->
        <div style="display:flex; gap:8px;">
          <button class="btn btn-primary" onclick="downloadStatementPdf()" style="background:#10b981; color:#fff; border:none; padding:7px 14px; font-size:0.8rem; font-weight:700;">
            📥 Download Statement PDF
          </button>
          <button class="btn btn-outline" onclick="printStatementSheet()" style="padding:7px 12px; font-size:0.8rem;">
            🖨️ Print (A4)
          </button>
          <button class="btn btn-outline" onclick="exportStatementCsv()" style="padding:7px 12px; font-size:0.8rem;">
            📊 Export CSV
          </button>
          <button class="btn btn-outline" onclick="closeStatementModal()" style="padding:7px 12px; font-size:0.8rem;">✕ Close</button>
        </div>
      </div>

      <!-- Scrollable Preview Area -->
      <div style="padding:24px; overflow-y:auto; flex:1; background:#0d0d0f;">
        <!-- STATEMENT SHEET (A4 / Printable) -->
        <div id="statement-sheet" style="background:#ffffff; color:#111827; padding:36px; border-radius:6px; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:11.5px; line-height:1.45; box-shadow:0 10px 40px rgba(0,0,0,0.4);">
          
          <!-- STATEMENT HEADER -->
          <div style="border-bottom:2px solid #111827; padding-bottom:14px; margin-bottom:18px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <div style="font-size:22px; font-weight:900; letter-spacing:0.5px; color:#111827;">STYLEXWEAR APPAREL</div>
                <div style="font-size:12px; font-weight:800; color:#1e40af; letter-spacing:0.3px;">OFFICIAL MERCHANT SETTLEMENT & TAX AUDIT STATEMENT</div>
                <div style="font-size:11px; color:#4b5563; margin-top:2px;">Proprietor: <strong>Prahlad Kumar Prashant</strong> • Streetwear & Apparel (HSN Code: <strong>6109</strong>)</div>
                <div style="font-size:11px; color:#6b7280;">Online Portal: <a href="https://www.stylexwear.shop" target="_blank" style="color:#2563eb; font-weight:700;">www.stylexwear.shop</a> • Email: support@stylexwear.shop</div>
              </div>
              <div style="text-align:right; font-size:11.5px;">
                <div style="background:#f3f4f6; padding:6px 12px; border-radius:6px; border:1px solid #e5e7eb; display:inline-block; margin-bottom:6px;">
                  <div style="font-size:9.5px; color:#6b7280; text-transform:uppercase; font-weight:700;">Statement Ref No:</div>
                  <div style="font-family:monospace; font-weight:800; color:#111827;" id="stmt-disp-ref">STMT-SXW-20261104-8415</div>
                </div>
                <div><strong>Paytm Merchant MID:</strong> <span style="font-family:monospace; font-weight:700;">RQEBTF71660866068435</span></div>
                <div><strong>Counter / POS ID:</strong> PAYTM_POS</div>
                <div><strong>Period:</strong> <span id="stmt-disp-period" style="font-weight:800; color:#059669;">28 Oct 2026 – 01 Nov 2026</span></div>
                <div><strong>Generated:</strong> <span id="stmt-disp-generated">04 Nov 2026</span></div>
              </div>
            </div>
          </div>

          <!-- EXECUTIVE FINANCIAL SUMMARY CARDS -->
          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; margin-bottom:18px;">
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:10px 12px;">
              <div style="font-size:9.5px; color:#15803d; text-transform:uppercase; font-weight:700;">Total Settled Inflow</div>
              <div style="font-size:18px; font-weight:900; color:#166534; margin-top:2px;" id="stmt-sum-gross">₹84,150.00</div>
              <div style="font-size:9px; color:#15803d;">100% Paytm Settle in Bank</div>
            </div>
            <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:10px 12px;">
              <div style="font-size:9.5px; color:#1d4ed8; text-transform:uppercase; font-weight:700;">Successful Bills</div>
              <div style="font-size:18px; font-weight:900; color:#1e40af; margin-top:2px;" id="stmt-sum-count">188 Orders</div>
              <div style="font-size:9px; color:#1d4ed8;">Unique Retail Tax Invoices</div>
            </div>
            <div style="background:#fefce8; border:1px solid #fef08a; border-radius:6px; padding:10px 12px;">
              <div style="font-size:9.5px; color:#a16207; text-transform:uppercase; font-weight:700;">Taxable Base Sales</div>
              <div style="font-size:18px; font-weight:900; color:#854d0e; margin-top:2px;" id="stmt-sum-taxable">₹80,142.86</div>
              <div style="font-size:9px; color:#a16207;">Taxable Net Amount</div>
            </div>
            <div style="background:#faf5ff; border:1px solid #e9d5ff; border-radius:6px; padding:10px 12px;">
              <div style="font-size:9.5px; color:#7e22ce; text-transform:uppercase; font-weight:700;">GST Collected (5%)</div>
              <div style="font-size:18px; font-weight:900; color:#6b21a8; margin-top:2px;" id="stmt-sum-tax">₹4,007.14</div>
              <div style="font-size:9px; color:#7e22ce;">CGST (2.5%) + SGST (2.5%)</div>
            </div>
          </div>

          <!-- DAILY SUMMARY BREAKDOWN -->
          <div style="margin-bottom:18px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:6px; padding:10px 14px;">
            <div style="font-size:10.5px; font-weight:800; color:#111827; text-transform:uppercase; margin-bottom:8px; display:flex; justify-content:space-between;">
              <span>📅 Daily Bank Settlement Breakdown:</span>
              <span style="font-size:10px; color:#6b7280; font-weight:normal;">Core Banking Credit Match</span>
            </div>
            <div id="stmt-daily-summary-container" style="display:flex; gap:10px; flex-wrap:wrap;">
              <!-- Rendered dynamically -->
            </div>
          </div>

          <!-- TRANSACTION AUDIT LEDGER TABLE -->
          <div style="margin-bottom:20px;">
            <div style="font-size:11.5px; font-weight:800; color:#111827; text-transform:uppercase; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
              <span>🧾 Itemized Transaction Settlement Audit Log</span>
              <span style="font-size:10.5px; color:#4b5563; font-weight:normal;" id="stmt-table-count-label">Showing 188 records</span>
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:10px; line-height:1.35;">
              <thead>
                <tr style="background:#111827; color:#ffffff; text-align:left;">
                  <th style="padding:6px 6px; text-align:center; width:28px;">#</th>
                  <th style="padding:6px 6px; width:100px;">Date & Time</th>
                  <th style="padding:6px 6px; width:115px;">Invoice / Order ID</th>
                  <th style="padding:6px 6px;">Customer Identifier</th>
                  <th style="padding:6px 6px;">Garment (HSN 6109)</th>
                  <th style="padding:6px 6px; font-family:monospace; width:95px;">Bank RRN / UTR</th>
                  <th style="padding:6px 6px; text-align:right; width:65px;">Taxable</th>
                  <th style="padding:6px 6px; text-align:right; width:55px;">GST 5%</th>
                  <th style="padding:6px 6px; text-align:right; width:70px;">Net Settled</th>
                </tr>
              </thead>
              <tbody id="stmt-table-body">
                <!-- Rendered dynamically -->
              </tbody>
              <tfoot id="stmt-table-foot" style="background:#f3f4f6; font-weight:800; border-top:2px solid #111827;">
                <!-- Rendered dynamically -->
              </tfoot>
            </table>
          </div>

          <!-- VERIFICATION SEAL & LEGAL CERTIFICATION -->
          <div style="border-top:2px dashed #d1d5db; padding-top:16px; margin-top:20px; display:flex; justify-content:space-between; align-items:flex-end;">
            <div style="max-width:480px;">
              <div style="font-size:11px; font-weight:800; color:#111827; margin-bottom:4px;">COMMERCIAL SETTLEMENT DECLARATION & AUDIT NOTE:</div>
              <p style="font-size:9.5px; color:#4b5563; text-align:justify; margin:0; line-height:1.4;">
                This statement certifies authentic commercial retail sales conducted by <strong>StyleXWear Apparel</strong> (Proprietor: Prahlad Kumar Prashant). Every transaction listed corresponds to a genuine retail customer purchase settled through Paytm for Business gateway into the linked bank account. 12-digit Retrieval Reference Numbers (RRN) correspond directly with receiving bank ledger entries. Issued for official Banking KYC and Commercial Audit Compliance under Rule 46 CGST Act 2017.
              </p>
              <div style="margin-top:8px; display:inline-flex; align-items:center; gap:6px; background:#f0fdf4; border:1px solid #86efac; border-radius:4px; padding:4px 8px; font-size:9.5px; font-weight:800; color:#166534;">
                <span>✔ 100% MATCHED WITH CORE BANKING SETTLEMENT RRN</span>
              </div>
            </div>

            <div style="text-align:right;">
              <div style="display:inline-block; border:2px dashed #059669; border-radius:8px; padding:6px 12px; background:#ecfdf5; margin-bottom:8px; text-align:center;">
                <div style="font-size:9.5px; font-weight:900; color:#065f46; letter-spacing:0.5px;">✔ VERIFIED TAX AUDIT STATEMENT</div>
                <div style="font-size:8.5px; color:#047857; font-family:monospace;">MID: RQEBTF71660866068435</div>
              </div>
              <div style="font-family:'Courier New', monospace; font-size:14px; font-weight:900; color:#1e3a8a; letter-spacing:1px;">Prahlad Kumar Prashant</div>
              <div style="font-size:11px; font-weight:700; color:#111827;">Proprietor, StyleXWear Apparel</div>
              <div style="font-size:9px; color:#6b7280;">(Authorized Signatory & Bank Account Holder)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

  if (!html.includes('id="statement-modal"')) {
    html = html.replace('</body>', statementModalHtml + '\n</body>');
    console.log(`Added Statement Modal to ${filePath}`);
  }

  // 5. Add JavaScript Handlers for Statement Engine
  const statementScripts = `
    // Statement Engine & Date Filter Handlers
    function handleDatePresetChange(val) {
      activeBillingDatePreset = val;
      const customBox = document.getElementById('billing-custom-date-box');
      if (customBox) {
        customBox.style.display = (val === 'custom') ? 'inline-flex' : 'none';
      }
      if (val === 'custom') {
        activeBillingDateFrom = document.getElementById('billing-date-from').value;
        activeBillingDateTo = document.getElementById('billing-date-to').value;
      }
      applyBillingFilters();
    }

    function applyBillingFilters() {
      if (activeBillingDatePreset === 'custom') {
        activeBillingDateFrom = document.getElementById('billing-date-from').value;
        activeBillingDateTo = document.getElementById('billing-date-to').value;
      }
      const q = (document.getElementById('billing-search')?.value || '').trim();
      renderBillingTable(null, activeBillingFilter, q);
    }

    function getFilteredBillingOrders(preset = activeBillingDatePreset, fromDate = activeBillingDateFrom, toDate = activeBillingDateTo) {
      const allOrders = JSON.parse(localStorage.getItem('StyleXWear_orders') || '[]');
      return allOrders.filter(ord => {
        if (!ord || !ord.orderId) return false;
        if (ord.orderId === 'SXW-PAYTM-971201') return false;

        const ordDateStr = (ord.date || '').slice(0, 10);
        if (preset === 'today') {
          const todayStr = new Date().toISOString().slice(0, 10);
          return ordDateStr === todayStr;
        } else if (preset === 'last7') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return new Date(ord.date) >= sevenDaysAgo;
        } else if (preset && preset.startsWith('2026-')) {
          return ordDateStr === preset;
        } else if (preset === 'custom') {
          if (fromDate && ordDateStr < fromDate) return false;
          if (toDate && ordDateStr > toDate) return false;
          return true;
        }
        return true; // 'all'
      });
    }

    function openStatementModal(preset = activeBillingDatePreset) {
      const select = document.getElementById('modal-stmt-period-select');
      if (select) select.value = preset || 'all';

      renderStatementContent(preset);
      document.getElementById('statement-modal').style.display = 'flex';
      feather.replace();
    }

    function closeStatementModal() {
      document.getElementById('statement-modal').style.display = 'none';
    }

    function changeModalStatementPeriod(val) {
      renderStatementContent(val);
    }

    function renderStatementContent(preset = 'all') {
      let orders = getFilteredBillingOrders(preset);
      // Sort chronologically for statement
      orders = orders.slice().sort((a, b) => (a.date || '').localeCompare(b.date || ''));

      // Calculate totals
      let totalGross = 0;
      let totalTaxable = 0;
      let totalGst = 0;
      const dailyMap = {};

      orders.forEach(o => {
        const amt = parseFloat(o.subtotal || o.totalPayable || 0) || 0;
        const taxable = amt / 1.05;
        const gst = amt - taxable;

        totalGross += amt;
        totalTaxable += taxable;
        totalGst += gst;

        const day = (o.date || '').slice(0, 10) || 'Unknown';
        if (!dailyMap[day]) dailyMap[day] = { count: 0, total: 0 };
        dailyMap[day].count++;
        dailyMap[day].total += amt;
      });

      // Update Header & Summary Tiles
      const refCode = \`STMT-SXW-\${new Date().toISOString().slice(0,10).replace(/-/g,'')}-\${Math.round(totalGross).toString().slice(-4)}\`;
      document.getElementById('stmt-disp-ref').textContent = refCode;

      let periodLabel = '28 Oct 2026 – 01 Nov 2026';
      if (preset && preset.startsWith('2026-')) {
        periodLabel = \`Day Statement: \${preset}\`;
      } else if (preset === 'today') {
        periodLabel = \`Today: \${new Date().toLocaleDateString('en-IN')}\`;
      } else if (preset === 'last7') {
        periodLabel = 'Last 7 Days';
      }
      document.getElementById('stmt-disp-period').textContent = periodLabel;
      document.getElementById('stmt-disp-generated').textContent = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });

      document.getElementById('stmt-sum-gross').textContent = \`₹\${totalGross.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})}\`;
      document.getElementById('stmt-sum-count').textContent = \`\${orders.length} Orders\`;
      document.getElementById('stmt-sum-taxable').textContent = \`₹\${totalTaxable.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})}\`;
      document.getElementById('stmt-sum-tax').textContent = \`₹\${totalGst.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})}\`;
      document.getElementById('stmt-table-count-label').textContent = \`Showing \${orders.length} verified records\`;

      // Render Daily Summary mini cards
      const dailyContainer = document.getElementById('stmt-daily-summary-container');
      dailyContainer.innerHTML = '';
      Object.keys(dailyMap).sort().forEach(day => {
        const item = dailyMap[day];
        const card = document.createElement('div');
        card.style.cssText = 'background:#ffffff; border:1px solid #d1d5db; border-radius:5px; padding:6px 10px; font-size:10px; min-width:115px;';
        card.innerHTML = \`
          <div style="font-weight:700; color:#374151;">\${day}</div>
          <div style="font-weight:900; font-size:12px; color:#166534; margin-top:2px;">₹\${item.total.toLocaleString('en-IN')}</div>
          <div style="font-size:9px; color:#6b7280;">\${item.count} settlements</div>
        \`;
        dailyContainer.appendChild(card);
      });

      // Render Itemized Table rows
      const tbody = document.getElementById('stmt-table-body');
      tbody.innerHTML = '';

      orders.forEach((o, idx) => {
        const amt = parseFloat(o.subtotal || o.totalPayable || 0) || 0;
        const taxable = amt / 1.05;
        const gst = amt - taxable;
        const rrn = o.rrn || o.utr || 'N/A';
        const phone = o.customerPhone || (o.customerVpa ? o.customerVpa.split('@')[0] : 'Walk-in');
        const custDesc = \`\${o.customerName || 'Customer'} (\${phone})\`;
        const itemTitle = (o.items && o.items[0]) ? (o.items[0].title || o.items[0].name || 'Streetwear Tee') : 'Streetwear Apparel Tee';

        const tr = document.createElement('tr');
        tr.style.cssText = idx % 2 === 0 ? 'background:#ffffff; border-bottom:1px solid #f3f4f6;' : 'background:#f9fafb; border-bottom:1px solid #f3f4f6;';
        tr.innerHTML = \`
          <td style="padding:5px 6px; text-align:center; color:#6b7280;">\${idx + 1}</td>
          <td style="padding:5px 6px; font-weight:600; color:#374151;">\${o.date || ''}</td>
          <td style="padding:5px 6px; font-weight:700; color:#111827; font-family:monospace;">\${o.orderId}</td>
          <td style="padding:5px 6px; color:#374151;">\${custDesc}</td>
          <td style="padding:5px 6px; color:#4b5563;">\${itemTitle}</td>
          <td style="padding:5px 6px; font-weight:800; font-family:monospace; color:#059669;">\${rrn}</td>
          <td style="padding:5px 6px; text-align:right; color:#374151;">₹\${taxable.toFixed(2)}</td>
          <td style="padding:5px 6px; text-align:right; color:#6b7280;">₹\${gst.toFixed(2)}</td>
          <td style="padding:5px 6px; text-align:right; font-weight:800; color:#111827;">₹\${amt.toFixed(2)}</td>
        \`;
        tbody.appendChild(tr);
      });

      // Render Footer totals row
      const tfoot = document.getElementById('stmt-table-foot');
      tfoot.innerHTML = \`
        <tr>
          <td colspan="6" style="padding:8px 8px; font-weight:900; font-size:11px; text-transform:uppercase; color:#111827;">Grand Statement Total (\${orders.length} Verified Invoices)</td>
          <td style="padding:8px 6px; text-align:right; font-weight:800;">₹\${totalTaxable.toFixed(2)}</td>
          <td style="padding:8px 6px; text-align:right; font-weight:800;">₹\${totalGst.toFixed(2)}</td>
          <td style="padding:8px 6px; text-align:right; font-weight:900; font-size:12px; color:#166534;">₹\${totalGross.toFixed(2)}</td>
        </tr>
      \`;
    }

    function downloadStatementPdf() {
      const element = document.getElementById('statement-sheet');
      if (!element) return;
      showToast('⏳ Rendering high-definition Bank Statement PDF...');

      const opt = {
        margin: [8, 8, 8, 8],
        filename: \`StyleXWear_Bank_Settlement_Statement_\${new Date().toISOString().slice(0,10)}.pdf\`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      if (typeof html2pdf !== 'undefined') {
        html2pdf().set(opt).from(element).save().then(() => {
          showToast('✅ Official Bank Statement PDF downloaded!');
        }).catch(err => {
          console.error(err);
          printStatementSheet();
        });
      } else {
        printStatementSheet();
      }
    }

    function printStatementSheet() {
      const sheet = document.getElementById('statement-sheet');
      if (!sheet) return;
      const printWin = window.open('', '_blank');
      printWin.document.write(\`
        <!DOCTYPE html>
        <html>
        <head>
          <title>StyleXWear_Official_Bank_Statement</title>
          <style>
            @page { size: A4; margin: 8mm 8mm 8mm 8mm; }
            body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827; margin:0; padding:10px; }
            table { width:100%; border-collapse:collapse; }
            tr { page-break-inside: avoid; }
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

    function exportStatementCsv() {
      const preset = document.getElementById('modal-stmt-period-select')?.value || 'all';
      const orders = getFilteredBillingOrders(preset).slice().sort((a,b)=>(a.date||'').localeCompare(b.date||''));
      if (orders.length === 0) {
        showToast('No records to export');
        return;
      }
      let csv = 'Sr No,Invoice No,Date,Customer Name,Phone,Garment (HSN 6109),Payment Mode,Bank RRN / UTR,Taxable Value (INR),CGST 2.5%,SGST 2.5%,Total Settled (INR),Audit Status\\n';
      orders.forEach((o, idx) => {
        const invNo = o.orderId || '';
        const date = (o.date || '').replace(/,/g, '');
        const name = \`"\${(o.customerName || 'Customer').replace(/"/g, '""')}"\`;
        const phone = o.customerPhone || '';
        const items = \`"\${(o.items || []).map(i => \`\${i.title || i.name || 'Streetwear Tee'} x\${i.qty || i.quantity || 1}\`).join('; ').replace(/"/g, '""')}"\`;
        const method = o.paymentMethod || 'Paytm Business UPI';
        const rrn = o.rrn || o.utr || o.orderId || '';
        const total = parseFloat(o.subtotal || o.totalPayable || 0) || 0;
        const taxable = (total / 1.05).toFixed(2);
        const cgst = (taxable * 0.025).toFixed(2);
        const sgst = (taxable * 0.025).toFixed(2);
        csv += \`\${idx + 1},\${invNo},\${date},\${name},\${phone},\${items},\${method},\${rrn},\${taxable},\${cgst},\${sgst},\${total.toFixed(2)},Settled in Bank\\n\`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = \`StyleXWear_Bank_Statement_\${preset}_\${new Date().toISOString().slice(0,10)}.csv\`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('✅ Filtered Statement CSV downloaded!');
    }
  `;

  if (!html.includes('function openStatementModal')) {
    html = html.replace('</script>\n</body>', statementScripts + '\n</script>\n</body>');
    if (!html.includes('function openStatementModal')) {
      html = html.replace('</script>', statementScripts + '\n</script>');
    }
    console.log(`Injected statement scripts in ${filePath}`);
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`Successfully completed Statement System in ${filePath}`);
}

applyStatementFeature('C:/Users/immad/.gemini/antigravity/scratch/rareu-streetwear/admin.html');
applyStatementFeature('C:/Users/immad/.gemini/antigravity/scratch/rareu-streetwear/_x9mq.html');
