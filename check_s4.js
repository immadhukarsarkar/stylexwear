const fs = require('fs');
const html = fs.readFileSync('C:/Users/immad/.gemini/antigravity/scratch/rareu-streetwear/admin.html', 'utf8');
const scriptMatches = html.match(/<script[\s\S]*?<\/script>/gi);
const s4 = scriptMatches[4];
console.log('Length of script 4:', s4.length);
console.log('Last 800 characters of script 4:\n', s4.slice(-800));
