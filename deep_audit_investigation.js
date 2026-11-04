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

const rows = [];
for (let i = 1; i < lines.length; i++) {
  const row = parseCSVLine(lines[i]);
  const obj = {};
  headers.forEach((h, idx) => { obj[h] = row[idx] || ''; });
  if (obj.Status === 'SUCCESS') rows.push(obj);
}

console.log('SUCCESS rows in CSV:', rows.length);

// Analyze Customer_VPA
const vpaTypes = { phone: 0, named: 0, other: 0 };
const vpaList = [];
rows.forEach((r, idx) => {
  const vpa = r.Customer_VPA || '';
  const prefix = vpa.split('@')[0] || '';
  const isPhone = /^([6-9]\d{9})/.test(prefix);
  if (isPhone) vpaTypes.phone++;
  else if (/^[a-zA-Z]/.test(prefix)) vpaTypes.named++;
  else vpaTypes.other++;
  vpaList.push({ idx: idx+1, date: r.Transaction_Date, vpa, rrn: r.Bank_Transaction_ID || r.RRN, amt: r.Amount });
});

console.log('VPA analysis:', vpaTypes);
console.log('\nSample VPAs:');
vpaList.slice(0, 30).forEach(v => {
  console.log(`[${v.idx}] ${v.date} | Rs.${v.amt} | VPA: ${v.vpa} | RRN: ${v.rrn}`);
});
