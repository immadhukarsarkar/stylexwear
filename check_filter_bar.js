const fs = require('fs');
const content = fs.readFileSync('C:/Users/immad/.gemini/antigravity/scratch/rareu-streetwear/admin.html', 'utf8');

const pos = content.indexOf('id="filter-all-btn"');
console.log(content.slice(pos - 200, pos + 800));
