const https = require('https');

https.get('https://stylexwear-5ed64-default-rtdb.firebaseio.com/orders.json', (res) => {
  let d = '';
  res.on('data', chunk => d += chunk);
  res.on('end', () => {
    const ordersObj = JSON.parse(d);
    const orders = Object.values(ordersObj).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    console.log('Total orders in Firebase:', orders.length);

    const vpaMap = {};
    orders.forEach((o, i) => {
      const vpa = (o.customerVpa || o.vpa || '').toLowerCase();
      vpaMap[vpa] = (vpaMap[vpa] || 0) + 1;
    });

    console.log('Unique VPAs:', Object.keys(vpaMap).length);
    const dupVPAs = Object.entries(vpaMap).filter(([v, c]) => c > 1);
    console.log('VPAs appearing more than once:', dupVPAs.length);
    dupVPAs.forEach(([v, c]) => console.log('  ', v, ':', c, 'times'));
  });
});
