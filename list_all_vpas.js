const https = require('https');

https.get('https://stylexwear-5ed64-default-rtdb.firebaseio.com/orders.json', (res) => {
  let d = '';
  res.on('data', chunk => d += chunk);
  res.on('end', () => {
    const ordersObj = JSON.parse(d);
    const orders = Object.values(ordersObj).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    
    orders.forEach((o, idx) => {
      const vpa = (o.customerVpa || o.vpa || '').trim();
      const rrn = (o.rrn || o.utr || '').trim();
      console.log(`[${idx+1}] Date: ${o.date} | Rs.${o.subtotal} | VPA: ${vpa} | RRN: ${rrn}`);
    });
  });
});
