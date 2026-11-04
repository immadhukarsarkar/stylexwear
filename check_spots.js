const fs = require('fs');

const adminHtml = fs.readFileSync('C:/Users/immad/.gemini/antigravity/scratch/rareu-streetwear/admin.html', 'utf8');

console.log('Includes bank-letter-modal?', adminHtml.includes('id="bank-letter-modal"'));
console.log('Includes invoice-modal?', adminHtml.includes('id="invoice-modal"'));
console.log('Includes filter-all-btn?', adminHtml.includes('id="filter-all-btn"'));
