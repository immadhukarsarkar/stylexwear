const https = require('https');

const url = new URL('https://stylexwear-5ed64-default-rtdb.firebaseio.com/orders/SXW-PAYTM-971201.json');

const req = https.request({
  hostname: url.hostname,
  port: 443,
  path: url.pathname,
  method: 'DELETE'
}, (res) => {
  console.log('Delete status code:', res.statusCode);
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    console.log('Response:', body);
    console.log('Successfully deleted extra/duplicate order SXW-PAYTM-971201 from Firebase!');
  });
});

req.on('error', (e) => {
  console.error('Error deleting:', e.message);
});

req.end();
