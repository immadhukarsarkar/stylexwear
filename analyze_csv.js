const fs = require('fs');
const csvPath = 'C:/Users/immad/.gemini/antigravity/brain/4386de08-52e6-4199-b712-e350e471404e/.user_uploaded/media_1793773191825_f79e9a5a.csv';
const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
console.log('Total lines:', lines.length);

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
console.log('Header length:', header.length);
const statusIdx = header.indexOf('Status');
const amountIdx = header.indexOf('Amount');
const dateIdx = header.indexOf('Transaction_Date');
const rrnIdx = header.indexOf('RRN');
const vpaIdx = header.indexOf('Customer_VPA');
const orderIdIdx = header.indexOf('Order_ID');
const txnIdIdx = header.indexOf('Transaction_ID');
const merchantIdx = header.indexOf('Merchant_Name');

console.log({statusIdx, amountIdx, dateIdx, rrnIdx, vpaIdx, orderIdIdx, txnIdIdx, merchantIdx});

let successCount = 0;
let successTotal = 0;
let failCount = 0;

const successTxns = [];

for (let i = 1; i < lines.length; i++) {
  const row = parseCsvLine(lines[i]);
  const status = row[statusIdx];
  const amt = parseFloat(row[amountIdx]) || 0;
  if (status === 'SUCCESS') {
    successCount++;
    successTotal += amt;
    successTxns.push({
      index: i,
      date: row[dateIdx],
      amount: amt,
      orderId: row[orderIdIdx],
      txnId: row[txnIdIdx],
      rrn: row[rrnIdx],
      vpa: row[vpaIdx],
      merchant: row[merchantIdx]
    });
  } else {
    failCount++;
  }
}

console.log(`Success Count: ${successCount}, Total Amount: ₹${successTotal.toFixed(2)}, Fail/Declined: ${failCount}`);

const uday = successTxns.find(t => (t.rrn && t.rrn.includes('868')) || (t.vpa && t.vpa.includes('7506191566')) || (t.orderId && t.orderId.includes('971201')));
console.log('Uday transaction found:', JSON.stringify(uday, null, 2));

console.log('\nFirst 5 transactions:');
console.log(JSON.stringify(successTxns.slice(0, 5), null, 2));

console.log('\nLast 5 transactions:');
console.log(JSON.stringify(successTxns.slice(-5), null, 2));
