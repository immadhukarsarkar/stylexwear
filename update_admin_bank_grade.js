const fs = require('fs');

const adminPath = 'C:/Users/immad/.gemini/antigravity/scratch/rareu-streetwear/admin.html';
let admin = fs.readFileSync(adminPath, 'utf8');

// 1. Add Export Excel (.xlsx) button
if (!admin.includes('StyleXWear_Bank_Settlement_Statement.xlsx')) {
  admin = admin.replace(
    '<button class="btn btn-outline" onclick="exportStatementCsv()" style="padding:7px 12px; font-size:0.8rem;">\n            📊 Export CSV\n          </button>',
    `<a href="StyleXWear_Bank_Settlement_Statement.xlsx" download class="btn btn-outline" style="padding:7px 12px; font-size:0.8rem; text-decoration:none; display:inline-flex; align-items:center; gap:5px; color:#fff; border-color:#3f3f46;">
            📗 Export Excel (.xlsx)
          </a>
          <button class="btn btn-outline" onclick="exportStatementCsv()" style="padding:7px 12px; font-size:0.8rem;">
            📊 Export CSV
          </button>`
  );
}

// 2. Replace the declaration block inside the modal
const oldDecl = `<!-- STATUTORY DECLARATION & FORMAL SIGN-OFF -->
          <div style="border-top:1px solid #cbd5e1; padding-top:10px; margin-top:12px;">
            <table style="width:100%; border-collapse:collapse;">
              <tr>
                <td style="vertical-align:top; width:65%; font-size:8.5px; color:#475569; line-height:1.45;">
                  <strong>DECLARATION &amp; STATUTORY COMPLIANCE NOTE:</strong><br>
                  This official commercial statement certifies bona fide consumer retail sales of knitted cotton apparel (HSN Code 6109) conducted by <strong>StyleXWear Apparel</strong> (Proprietor: Prahlad Kumar Prashant). Every transaction listed corresponds to a genuine authorized purchase processed through Paytm for Business gateway (MID: <strong>RQEBTF71660866068435</strong>, POS: <strong>PAYTM_POS</strong>) and settled into our linked bank account against the listed 12-digit Banking Retrieval Reference Numbers (RRN). There are zero chargebacks and zero pending disputes. Issued for official Banking Verification and Tax Audit Compliance under Rule 46 of the CGST Act, 2017.
                  <div style="margin-top:4px; color:#15803d; font-weight:700;">
                    ✔ 100% RECONCILED WITH CORE BANKING SETTLEMENT RRN LOGS
                  </div>
                </td>
                <td style="vertical-align:top; text-align:right; width:35%;">
                  <div style="font-size:9px; color:#64748b; margin-bottom:28px;">For <strong>StyleXWear Apparel</strong></div>
                  <div style="font-size:11px; font-weight:800; color:#0f172a;">Prahlad Kumar Prashant</div>
                  <div style="font-size:9px; color:#475569;">Proprietor &amp; Authorized Signatory</div>
                  <div style="font-size:8px; color:#64748b;">(Bank Account Holder • Paytm Merchant)</div>
                </td>
              </tr>
            </table>
          </div>`;

const newDecl = `<!-- STATUTORY DECLARATION & FORMAL SIGN-OFF -->
          <div style="border-top:1.5px solid #0f172a; padding-top:12px; margin-top:14px;">
            <table style="width:100%; border-collapse:collapse;">
              <tr>
                <td style="vertical-align:top; width:65%; font-size:8.5px; color:#334155; line-height:1.5;">
                  <div style="font-weight:700; color:#0f172a; text-transform:uppercase; margin-bottom:3px; letter-spacing:0.3px;">
                    Statutory Compliance &amp; Banking Audit Certificate
                  </div>
                  This electronic commercial statement certifies authorized consumer retail sales of knitted cotton streetwear apparel (HSN Code 6109) transacted by <strong>StyleXWear Apparel</strong> (Proprietor: Prahlad Kumar Prashant). Every entry itemized herein corresponds to a confirmed digital payment routed through Paytm for Business nodal gateway (MID: <strong>RQEBTF71660866068435</strong>, POS Terminal: <strong>PAYTM_POS</strong>) and settled into the merchant's linked operative bank account against the respective 12-digit Core Banking Retrieval Reference Numbers (RRN). There are zero chargebacks, zero reversals, and zero pending disputes against these transactions. Issued under Rule-46 of the CGST Rules, 2017 for official Bank Credit Assessment, KYC Review, and Statutory Tax Compliance.
                  <div style="margin-top:6px; font-family:Consolas, monospace; font-size:8px; color:#475569;">
                    Authenticity: Core Banking RRN Reconciled • Automated Sweep Settlement Advice
                  </div>
                </td>
                <td style="vertical-align:top; text-align:right; width:35%;">
                  <div style="font-size:9px; color:#64748b; margin-bottom:30px;">For <strong>StyleXWear Apparel</strong></div>
                  <div style="font-size:11px; font-weight:800; color:#0f172a; letter-spacing:0.3px;">Prahlad Kumar Prashant</div>
                  <div style="font-size:9px; color:#334155; font-weight:600;">Proprietor &amp; Authorized Signatory</div>
                  <div style="font-size:8px; color:#64748b;">(Merchant MID: RQEBTF71660866068435)</div>
                </td>
              </tr>
            </table>
          </div>`;

if (admin.includes(oldDecl)) {
  admin = admin.replace(oldDecl, newDecl);
  console.log('Replaced statutory declaration in admin.html!');
}

fs.writeFileSync(adminPath, admin, 'utf8');
console.log('Saved admin.html updates!');
