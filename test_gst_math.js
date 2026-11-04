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

let totalGross = 0;
let totalTaxable = 0;
let totalCgst = 0;
let totalSgst = 0;

for (let i = 1; i < lines.length; i++) {
  const row = parseCsvLine(lines[i]);
  if (row[statusIdx] !== 'SUCCESS') continue;

  const gross = parseFloat(row[amountIdx]) || 0;
  // Exact 2 decimal rounding
  const taxable = Math.round((gross / 1.05) * 100) / 100;
  const totalGst = Math.round((gross - taxable) * 100) / 100;
  const cgst = Math.round((totalGst / 2) * 100) / 100;
  const sgst = Math.round((totalGst - cgst) * 100) / 100;

  totalGross += gross;
  totalTaxable += taxable;
  totalCgst += cgst;
  totalSgst += sgst;
}

console.log('Total Gross:', totalGross.toFixed(2));
console.log('Total Taxable:', totalTaxable.toFixed(2));
console.log('Total CGST (2.5%):', totalCgst.toFixed(2));
console.log('Total SGST (2.5%):', totalSgst.toFixed(2));
console.log('Taxable + CGST + SGST:', (totalTaxable + totalCgst + totalSgst).toFixed(2));
console.log('Difference:', (totalGross - (totalTaxable + totalCgst + totalSgst)).toFixed(4));
