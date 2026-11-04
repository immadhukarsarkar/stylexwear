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

const file = 'C:/Users/immad/.gemini/antigravity/brain/4386de08-52e6-4199-b712-e350e471404e/.user_uploaded/media_1793779927762_cd18f45c.csv';
const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(l => l.trim().length > 0);
const headers = parseCSVLine(lines[0]);
console.log('Headers count:', headers.length);

const rows = [];
for (let i = 1; i < lines.length; i++) {
  const vals = parseCSVLine(lines[i]);
  const obj = {};
  headers.forEach((h, idx) => { obj[h] = vals[idx] || ''; });
  rows.push(obj);
}

console.log('Total data rows in uploaded CSV:', rows.length);

// Status counts
const statusCounts = {};
rows.forEach(r => {
  statusCounts[r.Status] = (statusCounts[r.Status] || 0) + 1;
});
console.log('Status breakdown:', statusCounts);

// Duplicate check
const seenTxn = new Map();
const dups = [];
rows.forEach((r, idx) => {
  const txn = r.Transaction_ID;
  if (seenTxn.has(txn)) {
    dups.push({ rowNumber: idx + 2, txnId: txn, firstSeenRow: seenTxn.get(txn) });
  } else {
    seenTxn.set(txn, idx + 2);
  }
});
console.log('Duplicates detected:', dups.length === 0 ? 'None (0 duplicates)' : dups);

// Filter SUCCESS
const successRows = rows.filter(r => r.Status === 'SUCCESS');
console.log('\n--- SUCCESS TRANSACTIONS ANALYSIS ---');
console.log('Count:', successRows.length);

let totalSuccessAmount = 0;
const dateBreakdown = {};
successRows.forEach(r => {
  const amt = parseFloat(r.Amount) || 0;
  totalSuccessAmount += amt;
  const d = (r.Transaction_Date || '').split(' ')[0];
  dateBreakdown[d] = dateBreakdown[d] || { count: 0, amount: 0 };
  dateBreakdown[d].count++;
  dateBreakdown[d].amount += amt;
});

console.log('Total SUCCESS Amount: Rs.' + totalSuccessAmount.toFixed(2));
console.log('Date breakdown for SUCCESS:');
Object.keys(dateBreakdown).sort().forEach(d => {
  console.log(`  ${d}: ${dateBreakdown[d].count} transactions, Rs.${dateBreakdown[d].amount.toFixed(2)}`);
});

// Non success rows
const nonSuccess = rows.filter(r => r.Status !== 'SUCCESS');
console.log(`\n--- NON-SUCCESS TRANSACTIONS (${nonSuccess.length}) ---`);
nonSuccess.forEach((r, i) => {
  console.log(`${i+1}. Date: ${r.Transaction_Date} | Order ID: ${r.Order_ID} | Status: ${r.Status} | Amount: Rs.${r.Amount} | Reason: ${r.Response_message}`);
});
