const fs = require('fs');
const path = require('path');
const content = fs.readFileSync(path.join(__dirname, 'admin_53624f7.html'), 'utf8');

console.log('admin_53624f7.html size:', content.length, 'lines:', content.split('\n').length);
// Let's see lines 1-30 in admin_53624f7.html
console.log('First 25 lines of admin_53624f7.html:');
console.log(content.split('\n').slice(0, 25).join('\n'));
