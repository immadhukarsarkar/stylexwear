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
const dateIdx = header.indexOf('Transaction_Date');
const rrnIdx = header.indexOf('RRN');
const vpaIdx = header.indexOf('Customer_VPA');
const orderIdIdx = header.indexOf('Order_ID');

const dailyMap = {};

for (let i = 1; i < lines.length; i++) {
  const row = parseCsvLine(lines[i]);
  if (row[statusIdx] !== 'SUCCESS') continue;

  const dateStr = row[dateIdx] || '';
  const day = dateStr.slice(0, 10);
  const amt = parseFloat(row[amountIdx]) || 0;

  if (!dailyMap[day]) {
    dailyMap[day] = { count: 0, total: 0 };
  }
  dailyMap[day].count++;
  dailyMap[day].total += amt;
}

console.log('Daily Settlement Breakdown:');
Object.keys(dailyMap).sort().forEach(day => {
  console.log(`${day}: ${dailyMap[day].count} orders, ₹${dailyMap[day].total.toFixed(2)}`);
});
