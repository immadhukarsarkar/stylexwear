const fs = require('fs');

function parseCSVLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"' || c === "'") {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result.map(s => s.replace(/^['"]|['"]$/g, '').trim());
}

// 1. Read User Uploaded CSV
const userCsvFile = 'C:/Users/immad/.gemini/antigravity/brain/4386de08-52e6-4199-b712-e350e471404e/.user_uploaded/media_1793779927762_cd18f45c.csv';
const lines = fs.readFileSync(userCsvFile, 'utf8').split(/\r?\n/).filter(l => l.trim().length > 0);
const headers = parseCSVLine(lines[0]);

const userRows = [];
for (let i = 1; i < lines.length; i++) {
  const vals = parseCSVLine(lines[i]);
  const obj = {};
  headers.forEach((h, idx) => { obj[h] = vals[idx] || ''; });
  userRows.push(obj);
}

const userSuccess = userRows.filter(r => r.Status === 'SUCCESS');
const userFailure = userRows.filter(r => r.Status !== 'SUCCESS');

console.log('=== USER UPLOADED CSV STATS ===');
console.log('Total rows:', userRows.length);
console.log('SUCCESS rows:', userSuccess.length);
console.log('FAILURE rows:', userFailure.length);

// 2. Read statement.html and extract table rows
const statementHtml = fs.readFileSync('C:/Users/immad/.gemini/antigravity/scratch/rareu-streetwear/statement.html', 'utf8');

// Parse rows from statement.html
// Looking for table rows inside tbody
const rowRegex = /<tr style="background:[^"]*">\s*<td[^>]*>(\d+)<\/td>\s*<td[^>]*>([^<]+)<\/td>\s*<td[^>]*>([^<]+)<\/td>\s*<td[^>]*>([^<]+)<\/td>\s*<td[^>]*>([^<]+)<\/td>\s*<td[^>]*>([^<]+)<\/td>\s*<td[^>]*>₹([^<]+)<\/td>\s*<td[^>]*>₹([^<]+)<\/td>\s*<td[^>]*>₹([^<]+)<\/td>\s*<td[^>]*>₹([^<]+)<\/td>\s*<\/tr>/g;

const stmtRows = [];
let m;
while ((m = rowRegex.exec(statementHtml)) !== null) {
  stmtRows.push({
    sr: m[1],
    date: m[2].trim(),
    customer: m[3].trim(),
    phone: m[4].trim(),
    product: m[5].trim(),
    rrn: m[6].trim(),
    taxable: parseFloat(m[7].replace(/,/g, '')),
    cgst: parseFloat(m[8].replace(/,/g, '')),
    sgst: parseFloat(m[9].replace(/,/g, '')),
    total: parseFloat(m[10].replace(/,/g, ''))
  });
}

console.log('\n=== STATEMENT.HTML ROWS STATS ===');
console.log('Total rows parsed from statement.html:', stmtRows.length);

// Check total in statement.html
let stmtTotal = stmtRows.reduce((sum, r) => sum + r.total, 0);
console.log('Statement Total Sum: Rs.' + stmtTotal.toFixed(2));

// 3. Read our audit CSV StyleXWear_Tax_Settlement_Audit_20261104.csv
const auditCsvPath = 'C:/Users/immad/.gemini/antigravity/scratch/rareu-streetwear/StyleXWear_Tax_Settlement_Audit_20261104.csv';
let auditRows = [];
if (fs.existsSync(auditCsvPath)) {
  const aLines = fs.readFileSync(auditCsvPath, 'utf8').split(/\r?\n/).filter(l => l.trim().length > 0);
  const aHeaders = parseCSVLine(aLines[0]);
  for (let i = 1; i < aLines.length; i++) {
    const vals = parseCSVLine(aLines[i]);
    const obj = {};
    aHeaders.forEach((h, idx) => { obj[h] = vals[idx] || ''; });
    auditRows.push(obj);
  }
}
console.log('\n=== AUDIT CSV STATS ===');
console.log('Total rows in StyleXWear_Tax_Settlement_Audit_20261104.csv:', auditRows.length);

// 4. Compare User Success Rows with Statement Rows
// We match on RRN / Bank Transaction ID or Amount + Date
const userRRNs = new Set(userSuccess.map(r => r.Bank_Transaction_ID || r.RRN).filter(Boolean));
console.log('User SUCCESS unique Bank RRNs:', userRRNs.size);

const stmtRRNs = new Set(stmtRows.map(r => r.rrn));
console.log('Statement unique Bank RRNs:', stmtRRNs.size);

// Check matches
let matchedCount = 0;
let missingInStmt = [];
userSuccess.forEach((ur, idx) => {
  const rrn = ur.Bank_Transaction_ID || ur.RRN;
  if (stmtRRNs.has(rrn)) {
    matchedCount++;
  } else {
    missingInStmt.push({
      idx: idx + 1,
      date: ur.Transaction_Date,
      orderId: ur.Order_ID,
      rrn: rrn,
      amount: ur.Amount
    });
  }
});

console.log('\n=== MATCH RESULTS ===');
console.log(`Matched RRNs between User CSV and statement.html: ${matchedCount} / ${userSuccess.length}`);
if (missingInStmt.length > 0) {
  console.log('Missing in statement:', missingInStmt);
} else {
  console.log('PERFECT 100% 1-TO-1 MATCH! Every single SUCCESS transaction is present in statement.html!');
}

// 5. Date-wise cross check
const userDateMap = {};
userSuccess.forEach(r => {
  const d = (r.Transaction_Date || '').split(' ')[0];
  userDateMap[d] = (userDateMap[d] || 0) + parseFloat(r.Amount);
});

// Month map for statement dates like '28 Oct 2026' -> '2026-10-28'
const monthMap = { 'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12' };
const stmtDateMap = {};
stmtRows.forEach(r => {
  // r.date is e.g. "28 Oct 2026"
  const parts = r.date.split(' ');
  const iso = parts[2] + '-' + monthMap[parts[1]] + '-' + parts[0].padStart(2, '0');
  stmtDateMap[iso] = (stmtDateMap[iso] || 0) + r.total;
});

console.log('\n=== DATE-WISE RECONCILIATION COMPARISON ===');
const allDates = Array.from(new Set([...Object.keys(userDateMap), ...Object.keys(stmtDateMap)])).sort();
allDates.forEach(d => {
  const uAmt = userDateMap[d] || 0;
  const sAmt = stmtDateMap[d] || 0;
  const diff = Math.abs(uAmt - sAmt);
  console.log(`Date ${d}: User CSV = Rs.${uAmt.toFixed(2)} | Statement = Rs.${sAmt.toFixed(2)} | Diff: Rs.${diff.toFixed(2)} ${diff < 0.01 ? '✔ MATCH' : '❌ MISMATCH'}`);
});
