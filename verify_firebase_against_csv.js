const https = require('https');
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
    if (c === '"' || c === "'") inQuotes = !inQuotes;
    else if (c === ',' && !inQuotes) {
      result.push(cur.replace(/^['"]+|['"]+$/g, '').trim());
      cur = '';
    } else cur += c;
  }
  result.push(cur.replace(/^['"]+|['"]+$/g, '').trim());
  return result;
}

const header = parseCsvLine(lines[0]);
const statusIdx = header.indexOf('Status');
const amountIdx = header.indexOf('Amount');
const orderIdIdx = header.indexOf('Order_ID');
const txnIdIdx = header.indexOf('Transaction_ID');
const rrnIdx = header.indexOf('RRN');

const validTxnIds = new Set();
const validOrderIds = new Set();
const validRrns = new Set();

for (let i = 1; i < lines.length; i++) {
  const row = parseCsvLine(lines[i]);
  if (row[statusIdx] === 'SUCCESS') {
    if (row[txnIdIdx]) validTxnIds.add(row[txnIdIdx]);
    if (row[orderIdIdx]) validOrderIds.add(row[orderIdIdx]);
    if (row[rrnIdx]) validRrns.add(row[rrnIdx]);
  }
}

console.log(`Loaded ${validTxnIds.size} valid SUCCESS transactions from statement.`);

https.get('https://stylexwear-5ed64-default-rtdb.firebaseio.com/orders.json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const orders = JSON.parse(data);
      const keys = Object.keys(orders);
      console.log(`Total orders in Firebase: ${keys.length}`);

      const extraOrders = [];
      const matchedOrders = [];

      keys.forEach(k => {
        const ord = orders[k];
        const txnMatch = ord.paytmTxnId && validTxnIds.has(ord.paytmTxnId);
        const orderMatch = ord.originalOrderId && validOrderIds.has(ord.originalOrderId);
        const rrnMatch = ord.rrn && validRrns.has(ord.rrn);

        if (txnMatch || orderMatch || rrnMatch) {
          matchedOrders.push(k);
        } else {
          extraOrders.push({ key: k, ord });
        }
      });

      console.log(`Matched orders from statement: ${matchedOrders.length}`);
      console.log(`Extra / unverified orders: ${extraOrders.length}`);
      console.log(JSON.stringify(extraOrders, null, 2));

    } catch(e) {
      console.log('Error:', e.message);
    }
  });
});
