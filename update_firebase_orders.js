const https = require('https');

function deleteOrder(orderKey) {
  return new Promise((resolve, reject) => {
    const req = https.request(`https://stylexwear-5ed64-default-rtdb.firebaseio.com/orders/${orderKey}.json`, {
      method: 'DELETE'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.end();
  });
}

function updateOrder(orderKey, patchData) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(patchData);
    const req = https.request(`https://stylexwear-5ed64-default-rtdb.firebaseio.com/orders/${orderKey}.json`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('1. Deleting 1rs order SXW-PTM-F078E25F...');
  const delRes = await deleteOrder('SXW-PTM-F078E25F');
  console.log('Deleted 1rs order result:', delRes);

  console.log('2. Updating 1999rs order SXW-PTM-69518582 to 2000...');
  const patchRes = await updateOrder('SXW-PTM-69518582', {
    subtotal: 2000,
    totalPayable: 2000,
    items: [
      {
        color: 'Black / Acid Wash',
        hsn: '6109',
        name: 'StyleXWear Winter Drop Streetwear Hoodie + Tee Pack (HSN 6109)',
        price: 1000,
        quantity: 2,
        size: 'L'
      }
    ]
  });
  console.log('Updated order result:', patchRes.orderId, 'subtotal:', patchRes.subtotal, 'totalPayable:', patchRes.totalPayable);

  // Verify total count and total amount in Firebase
  https.get('https://stylexwear-5ed64-default-rtdb.firebaseio.com/orders.json', (res) => {
    let d = '';
    res.on('data', chunk => d += chunk);
    res.on('end', () => {
      const orders = JSON.parse(d);
      const keys = Object.keys(orders);
      let totalSum = 0;
      let has1 = false;
      let has1999 = false;
      let has2000 = false;
      keys.forEach(k => {
        const o = orders[k];
        const amt = parseFloat(o.subtotal || o.totalPayable || 0);
        totalSum += amt;
        if (amt === 1) has1 = true;
        if (amt === 1999) has1999 = true;
        if (amt === 2000) has2000 = true;
      });
      console.log('\n--- FIREBASE VERIFICATION ---');
      console.log('Total orders in Firebase:', keys.length);
      console.log('Total sum in Firebase: Rs.' + totalSum.toFixed(2));
      console.log('Contains 1rs order?', has1);
      console.log('Contains 1999rs order?', has1999);
      console.log('Contains updated 2000rs order?', has2000);
    });
  });
}

run().catch(console.error);
