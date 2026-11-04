const fs = require('fs');

const csvPath = 'C:/Users/immad/.gemini/antigravity/brain/4386de08-52e6-4199-b712-e350e471404e/.user_uploaded/media_1793773191825_f79e9a5a.csv';
const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);

function parseCsvLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"' || c === "'") {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cur.replace(/^['"]+|['"]+$/g, '').trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.replace(/^['"]+|['"]+$/g, '').trim());
  return result;
}

const header = parseCsvLine(lines[0]);
const statusIdx = header.indexOf('Status');
const amountIdx = header.indexOf('Amount');
const dateIdx = header.indexOf('Transaction_Date');
const rrnIdx = header.indexOf('RRN');
const vpaIdx = header.indexOf('Customer_VPA');
const orderIdIdx = header.indexOf('Order_ID');
const txnIdIdx = header.indexOf('Transaction_ID');
const merchantIdx = header.indexOf('Merchant_Name');

console.log('Total raw lines (including header):', lines.length);

const txnIdSet = new Set();
const rrnMap = new Map();
const orderIdSet = new Set();

const csvSuccessRows = [];
const csvDuplicates = [];
let totalSuccessAmount = 0;

for (let i = 1; i < lines.length; i++) {
  const row = parseCsvLine(lines[i]);
  const status = row[statusIdx];
  if (status !== 'SUCCESS') continue;

  const txnId = row[txnIdIdx];
  const orderId = row[orderIdIdx];
  const rrn = row[rrnIdx];
  const amt = parseFloat(row[amountIdx]) || 0;

  let isDup = false;
  if (txnId && txnIdSet.has(txnId)) {
    isDup = true;
    csvDuplicates.push({ type: 'txnId', val: txnId, line: i, amt });
  }
  if (orderId && orderIdSet.has(orderId)) {
    isDup = true;
    csvDuplicates.push({ type: 'orderId', val: orderId, line: i, amt });
  }
  if (rrn && rrnMap.has(rrn)) {
    // Note: Sometimes different transactions might have RRN or blank
    const prev = rrnMap.get(rrn);
    console.log(`Notice: RRN ${rrn} seen on line ${prev} and line ${i}`);
  } else if (rrn) {
    rrnMap.set(rrn, i);
  }

  if (txnId) txnIdSet.add(txnId);
  if (orderId) orderIdSet.add(orderId);

  if (!isDup) {
    csvSuccessRows.push({
      line: i,
      txnId,
      orderId,
      rrn,
      date: row[dateIdx],
      amount: amt,
      vpa: row[vpaIdx]
    });
    totalSuccessAmount += amt;
  }
}

console.log('Unique SUCCESS transactions in CSV:', csvSuccessRows.length);
console.log('Total Unique SUCCESS Amount: ₹' + totalSuccessAmount.toFixed(2));
console.log('CSV duplicates within file:', csvDuplicates.length);
