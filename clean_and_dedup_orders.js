const https = require('https');

https.get('https://stylexwear-5ed64-default-rtdb.firebaseio.com/orders.json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const orders = JSON.parse(data);
      if (!orders) {
        console.log('No orders in Firebase');
        return;
      }
      const keys = Object.keys(orders);
      console.log('Total orders in Firebase:', keys.length);

      // Check duplicates by RRN / paytmTxnId / originalOrderId
      const rrnMap = new Map();
      const duplicates = [];
      const nonPaytmOrders = [];

      keys.forEach(k => {
        const ord = orders[k];
        const rrn = ord.rrn || ord.utr;
        const txnId = ord.paytmTxnId || ord.txnId;
        const origId = ord.originalOrderId;

        // Check if this is an extra/test order or non-csv order
        if (!ord.source || !ord.source.includes('Paytm')) {
          nonPaytmOrders.push({ key: k, ord });
        }

        const dedupKey = rrn ? `RRN_${rrn}` : (txnId ? `TXN_${txnId}` : (origId ? `ORIG_${origId}` : k));

        if (rrnMap.has(dedupKey)) {
          duplicates.push({
            existingKey: rrnMap.get(dedupKey),
            duplicateKey: k,
            dedupKey,
            amount: ord.subtotal || ord.totalPayable,
            customer: ord.customerName
          });
        } else {
          rrnMap.set(dedupKey, k);
        }
      });

      console.log('Duplicates found:', duplicates.length);
      console.log(JSON.stringify(duplicates, null, 2));

      console.log('Non-Paytm or test orders count:', nonPaytmOrders.length);
      if (nonPaytmOrders.length > 0) {
        console.log('Non-Paytm sample:', JSON.stringify(nonPaytmOrders.slice(0, 5), null, 2));
      }

    } catch(e) {
      console.log('Error parsing:', e.message);
    }
  });
}).on('error', err => console.log('Err:', err.message));
