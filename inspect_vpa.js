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
const vpaIdx = header.indexOf('Customer_VPA');
const statusIdx = header.indexOf('Status');
const rrnIdx = header.indexOf('RRN');
const amtIdx = header.indexOf('Amount');
const custDetailsIdx = header.indexOf('Customer_Details');
const custNicknameIdx = header.indexOf('Customer_Nickname');
const custPhoneIdx = header.indexOf('Payment_Mobile_Number');

console.log('Columns:');
console.log({custDetailsIdx, custNicknameIdx, custPhoneIdx, vpaIdx});

for (let i = 1; i < Math.min(35, lines.length); i++) {
  const row = parseCsvLine(lines[i]);
  if (row[statusIdx] === 'SUCCESS') {
    console.log(`Row ${i}: Amount: ₹${row[amtIdx]} | RRN: ${row[rrnIdx]} | VPA: ${row[vpaIdx]} | CustDetails: ${row[custDetailsIdx]} | CustPhone: ${row[custPhoneIdx]}`);
  }
}
