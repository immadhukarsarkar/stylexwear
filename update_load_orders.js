const fs = require('fs');

function updateLoadOrders(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  const oldTarget = `// Merge with local orders fallback
      const localOrders = JSON.parse(localStorage.getItem('StyleXWear_orders') || '[]');
      const orderMap = new Map();
      orders.forEach(o => { if (o && o.orderId) orderMap.set(o.orderId, o); });
      localOrders.forEach(o => { if (o && o.orderId && !orderMap.has(o.orderId)) orderMap.set(o.orderId, o); });
      orders = Array.from(orderMap.values());
      try { localStorage.setItem('StyleXWear_orders', JSON.stringify(orders)); } catch(e) {}`;

  const newCode = `// Authoritative sync & deduplication
      if (orders.length > 0) {
        const seenKeys = new Set();
        orders = orders.filter(o => {
          if (!o || !o.orderId) return false;
          // Filter out legacy manual test orders
          if (o.orderId === 'SXW-PAYTM-971201') return false;
          const dedupKey = o.rrn || o.paytmTxnId || o.orderId;
          if (seenKeys.has(dedupKey)) return false;
          seenKeys.add(dedupKey);
          return true;
        });
        try { localStorage.setItem('StyleXWear_orders', JSON.stringify(orders)); } catch(e) {}
      } else {
        // Fallback to local only if network fails
        const local = JSON.parse(localStorage.getItem('StyleXWear_orders') || '[]');
        const seenKeys = new Set();
        orders = local.filter(o => {
          if (!o || !o.orderId) return false;
          if (o.orderId === 'SXW-PAYTM-971201') return false;
          const dedupKey = o.rrn || o.paytmTxnId || o.orderId;
          if (seenKeys.has(dedupKey)) return false;
          seenKeys.add(dedupKey);
          return true;
        });
      }`;

  if (content.includes(oldTarget)) {
    content = content.replace(oldTarget, newCode);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully updated loadOrders in ${filePath}`);
  } else {
    console.log(`Target not found in ${filePath}`);
  }
}

updateLoadOrders('C:/Users/immad/.gemini/antigravity/scratch/rareu-streetwear/admin.html');
updateLoadOrders('C:/Users/immad/.gemini/antigravity/scratch/rareu-streetwear/_x9mq.html');
