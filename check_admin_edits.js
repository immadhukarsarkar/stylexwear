const fs = require('fs');
const adminPath = 'C:/Users/immad/.gemini/antigravity/scratch/rareu-streetwear/admin.html';
const content = fs.readFileSync(adminPath, 'utf8');

console.log('admin.html total characters:', content.length);
console.log('Contains exportBillingCsv?', content.includes('function exportBillingCsv'));
console.log('Contains openInvoiceModal?', content.includes('function openInvoiceModal'));
console.log('Contains + Create Paytm / Direct Sale Bill?', content.includes('+ Create Paytm / Direct Sale Bill'));
