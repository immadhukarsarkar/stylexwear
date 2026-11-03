require('dotenv').config();
const https = require('https');

async function notifyTelegram(payload, qikinkStatus) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  const itemsText = payload.line_items.map(item => `• ${item.quantity}x Product ID: ${item.product_id} (Size: ${item.size}, Color: ${item.color})`).join('\n');
  const address = payload.shipping_address;
  
  const text = `🔔 *NEW ORDER RECEIVED!*\n\n` +
    `*Order ID:* ${payload.order_number}\n` +
    `*Amount:* ₹${payload.total_order_value}\n` +
    `*Payment:* ${payload.gateway}\n` +
    `*Status:* ${qikinkStatus}\n\n` +
    `*Customer Details:*\n` +
    `• *Name:* ${address.name}\n` +
    `• *Phone:* ${address.phone}\n` +
    `• *Address:* ${address.address}, ${address.city}, ${address.state} - ${address.pincode}\n\n` +
    `*Order Items:*\n${itemsText}`;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const urlObj = new URL(url);
  const options = {
    hostname: urlObj.hostname,
    port: 443,
    path: urlObj.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      res.on('data', () => {});
      res.on('end', () => resolve(true));
    });
    
    req.setTimeout(4000, () => {
      req.destroy();
      resolve(false);
    });
    
    req.on('error', () => resolve(false));
    req.write(JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    }));
    req.end();
  });
}

async function sendEmailAlert(payload, qikinkStatus) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const address = payload.shipping_address;
  const itemsHtml = payload.line_items.map(item => 
    `<li><strong>${item.quantity}x</strong> Product ID: ${item.product_id} (Size: ${item.size}, Color: ${item.color})</li>`
  ).join('');

  const emailBody = {
    from: 'StyleXWear Orders <onboarding@resend.dev>',
    to: 'immadhukarsarkar@gmail.com',
    subject: `🔔 New Order Received: ${payload.order_number}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #111;">
        <h2 style="color: #7c3aed; margin-bottom: 20px;">New Order Confirmed!</h2>
        <p><strong>Order ID:</strong> ${payload.order_number}</p>
        <p><strong>Amount:</strong> ₹${payload.total_order_value}</p>
        <p><strong>Payment Gateway:</strong> ${payload.gateway}</p>
        <p><strong>Status:</strong> ${qikinkStatus}</p>
        
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 8px;">Customer Details:</h3>
        <p>
          • <strong>Name:</strong> ${address.name}<br>
          • <strong>Phone:</strong> ${address.phone}<br>
          • <strong>Address:</strong> ${address.address}, ${address.city}, ${address.state} - ${address.pincode}
        </p>
        
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 8px;">Order Items:</h3>
        <ul>
          ${itemsHtml}
        </ul>
      </div>
    `
  };

  const options = {
    hostname: 'api.resend.com',
    port: 443,
    path: '/emails',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      res.on('data', () => {});
      res.on('end', () => resolve(true));
    });
    
    req.setTimeout(4000, () => {
      req.destroy();
      resolve(false);
    });
    
    req.on('error', () => resolve(false));
    req.write(JSON.stringify(emailBody));
    req.end();
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payload = req.body;
    
    // Qikink API is disabled as per user instruction.
    const statusText = '⏸️ Manual Processing (Qikink Disabled)';

    // Instantly trigger notifications in the background
    await Promise.all([
      notifyTelegram(payload, statusText).catch(err => console.error('Telegram Notify Error:', err)),
      sendEmailAlert(payload, statusText).catch(err => console.error('Email Send Error:', err))
    ]);

    // Return instant success response to the client
    return res.status(200).json({
      success: true,
      status: 'success',
      order_id: payload.order_number,
      message: 'Order created successfully. Merchant notified.'
    });

  } catch (err) {
    console.error('[Qikink Bypass Serverless Error]', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
