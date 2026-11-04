const fs = require('fs');

let html = fs.readFileSync('C:/Users/immad/.gemini/antigravity/scratch/rareu-streetwear/statement.html', 'utf8');

// Replace Summary Box 2 & footer numbers to standard symmetric GST
html = html.replace(/Taxable Turnover \(Base\):<\/td>\s*<td[^>]*>[^<]+<\/td>/, 'Taxable Turnover (Base):</td>\n            <td style="font-weight:700; color:#0f172a; font-family:Consolas, monospace;">₹80,142.86</td>');
html = html.replace(/CGST Collected \(2\.5%\):<\/td>\s*<td[^>]*>[^<]+<\/td>/, 'CGST Collected (2.5%):</td>\n            <td style="font-weight:700; color:#0f172a; font-family:Consolas, monospace;">₹2,003.57</td>');
html = html.replace(/SGST Collected \(2\.5%\):<\/td>\s*<td[^>]*>[^<]+<\/td>/, 'SGST Collected (2.5%):</td>\n            <td style="font-weight:700; color:#0f172a; font-family:Consolas, monospace;">₹2,003.57</td>');
html = html.replace(/Total GST \(5\.0% Composite\):<\/td>\s*<td[^>]*>[^<]+<\/td>/, 'Total GST (5.0% Composite):</td>\n            <td style="font-weight:800; color:#0f172a; font-family:Consolas, monospace;">₹4,007.14</td>');

// Also in footer
html = html.replace(/GRAND RECONCILED TOTAL \(\d+ Invoices\):<\/td>\s*<td[^>]*>[^<]+<\/td>\s*<td[^>]*>[^<]+<\/td>\s*<td[^>]*>[^<]+<\/td>/,
  'GRAND RECONCILED TOTAL (187 Invoices):</td>\n            <td style="padding:7px 6px; text-align:right; font-family:Consolas, monospace; font-size:9px;">₹80,142.86</td>\n            <td style="padding:7px 6px; text-align:right; font-family:Consolas, monospace; font-size:9px;">₹2,003.57</td>\n            <td style="padding:7px 6px; text-align:right; font-family:Consolas, monospace; font-size:9px;">₹2,003.57</td>'
);

fs.writeFileSync('C:/Users/immad/.gemini/antigravity/scratch/rareu-streetwear/statement.html', html, 'utf8');
console.log('Updated statement.html with 100% symmetric standard GST!');
