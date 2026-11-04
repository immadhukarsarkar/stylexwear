let oddCount = 0;
let grandCgst = 0;
let grandSgst = 0;
let grandTaxable = 0;
let grandGross = 0;

// Test with our amounts: 84 of 200, 1 of 250, 37 of 300, 44 of 500, 13 of 1000, 5 of 2000, 2 of 3000, 1 of 5000
const amounts = [
  ...Array(84).fill(200),
  250,
  ...Array(37).fill(300),
  ...Array(44).fill(500),
  ...Array(13).fill(1000),
  ...Array(5).fill(2000),
  ...Array(2).fill(3000),
  5000
];

amounts.forEach((amt, i) => {
  const taxable = Math.round((amt / 1.05) * 100) / 100;
  const lineGst = Math.round((amt - taxable) * 100) / 100;
  let cgst, sgst;
  const cents = Math.round(lineGst * 100);
  if (cents % 2 !== 0) {
    oddCount++;
    if (oddCount % 2 === 1) {
      cgst = Math.floor(cents / 2) / 100;
      sgst = (cents - Math.floor(cents / 2)) / 100;
    } else {
      cgst = Math.ceil(cents / 2) / 100;
      sgst = (cents - Math.ceil(cents / 2)) / 100;
    }
  } else {
    cgst = (cents / 2) / 100;
    sgst = (cents / 2) / 100;
  }
  grandGross += amt;
  grandTaxable += taxable;
  grandCgst += cgst;
  grandSgst += sgst;
});

console.log('Grand Gross:', grandGross.toFixed(2));
console.log('Grand Taxable:', grandTaxable.toFixed(2));
console.log('Grand CGST:', grandCgst.toFixed(2));
console.log('Grand SGST:', grandSgst.toFixed(2));
console.log('Total GST:', (grandCgst + grandSgst).toFixed(2));
console.log('Sum Taxable + GST:', (grandTaxable + grandCgst + grandSgst).toFixed(2));
