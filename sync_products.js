const fs = require('fs');
const path = require('path');
const https = require('https');

const SCRIPTS_PATH = path.join(__dirname, 'scripts.js');
const PRODUCTS_OUTPUT_PATH = path.join(__dirname, 'products.js');
const CSV_INPUT_PATH = path.join(__dirname, 'qikink_products.csv');

// Helper to parse scripts.js and extract QIKINK_CONFIG values dynamically
function extractQikinkConfig() {
  try {
    const scriptsContent = fs.readFileSync(SCRIPTS_PATH, 'utf8');
    
    const clientIdMatch = scriptsContent.match(/CLIENT_ID:\s*['"]([^'"]+)['"]/);
    const tokenMatch = scriptsContent.match(/ACCESS_TOKEN:\s*['"]([^'"]+)['"]/);
    const apiUrlMatch = scriptsContent.match(/API_URL:\s*['"]([^'"]+)['"]/);

    if (!clientIdMatch || !tokenMatch) {
      throw new Error("Could not find CLIENT_ID or ACCESS_TOKEN in scripts.js");
    }

    const clientId = clientIdMatch[1];
    const accessToken = tokenMatch[1];
    const apiUrl = apiUrlMatch ? apiUrlMatch[1] : 'https://sandbox.qikink.com/api/order/create';
    
    // Extract base URL from API_URL (e.g. sandbox.qikink.com or api.qikink.com)
    const urlObj = new URL(apiUrl);
    const apiBase = `${urlObj.protocol}//${urlObj.host}`;

    return { clientId, accessToken, apiBase };
  } catch (err) {
    console.error("Error reading scripts.js for Qikink configuration:", err.message);
    return null;
  }
}

// Function to make API calls using native https module
function makeRequest(url, headers, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP Status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Helper to map and write raw Qikink products list into products.js
function writeProductsFile(productsList) {
  const formattedProducts = productsList.map(prod => {
    const saleNum = parseFloat(prod.price) || 899;
    const mrpNum = parseFloat(prod.original_price || prod.mrp) || Math.round(saleNum * 2.18);
    const title = prod.name || prod.title || 'Streetwear Article';
    const cleanHandle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Process images
    let imgArray = ['stylexwear_logo.png'];
    if (prod.images) {
      if (Array.isArray(prod.images) && prod.images.length > 0) {
        imgArray = prod.images;
      } else if (typeof prod.images === 'string') {
        imgArray = prod.images.split(',').map(img => img.trim()).filter(Boolean);
      }
    } else if (prod.image_url) {
      imgArray = [prod.image_url];
    }

    return {
      id: (prod.product_id || prod.id || Date.now()).toString(),
      title: title,
      price: `₹${saleNum}`,
      originalPrice: `₹${mrpNum}`,
      description: prod.description || 'Premium drop-shoulder luxury streetwear article, crafted for a boxy relaxed drape and high density print detail.',
      category: prod.category || 'Oversized Premium',
      handle: cleanHandle,
      images: imgArray
    };
  });

  const fileContent = `/* 
 * StyleXWear - Auto-generated Products Database
 * Synced on: ${new Date().toLocaleString()}
 */
const PRODUCTS = ${JSON.stringify(formattedProducts, null, 2)};
`;

  fs.writeFileSync(PRODUCTS_OUTPUT_PATH, fileContent, 'utf8');
  console.log(`\nSUCCESS: Synced ${formattedProducts.length} products to products.js successfully!`);
}

// Fallback CSV Parser
function parseProductsCSV() {
  if (!fs.existsSync(CSV_INPUT_PATH)) {
    console.log(`\nCSV Fallback Notice: No 'qikink_products.csv' file found in your project folder.`);
    return false;
  }

  console.log("Parsing 'qikink_products.csv'...");
  try {
    const csvContent = fs.readFileSync(CSV_INPUT_PATH, 'utf8');
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) return false;

    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    
    const idIdx = headers.findIndex(h => h.includes('id') || h.includes('sku'));
    const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('title'));
    const priceIdx = headers.findIndex(h => h.includes('price') || h.includes('cost') || h.includes('sale'));
    const mrpIdx = headers.findIndex(h => h.includes('mrp') || h.includes('original') || h.includes('retail'));
    const imgIdx = headers.findIndex(h => h.includes('image') || h.includes('img') || h.includes('url'));
    const descIdx = headers.findIndex(h => h.includes('description') || h.includes('desc'));
    const catIdx = headers.findIndex(h => h.includes('category') || h.includes('type'));

    const parsedList = [];

    for (let i = 1; i < lines.length; i++) {
      // Basic CSV cell extraction supporting simple quotes
      const cells = [];
      let currentCell = '';
      let inQuotes = false;
      const line = lines[i];

      for (let charIdx = 0; charIdx < line.length; charIdx++) {
        const char = line[charIdx];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cells.push(currentCell.trim().replace(/^["']|["']$/g, ''));
          currentCell = '';
        } else {
          currentCell += char;
        }
      }
      cells.push(currentCell.trim().replace(/^["']|["']$/g, ''));

      if (cells.length < 2) continue;

      parsedList.push({
        product_id: idIdx !== -1 ? cells[idIdx] : `CSV-${i}`,
        name: nameIdx !== -1 ? cells[nameIdx] : 'Streetwear Product',
        price: priceIdx !== -1 ? cells[priceIdx] : '899',
        original_price: mrpIdx !== -1 ? cells[mrpIdx] : null,
        images: imgIdx !== -1 ? [cells[imgIdx]] : null,
        description: descIdx !== -1 ? cells[descIdx] : null,
        category: catIdx !== -1 ? cells[catIdx] : null
      });
    }

    if (parsedList.length > 0) {
      writeProductsFile(parsedList);
      return true;
    }
  } catch (err) {
    console.error("Error reading CSV file:", err.message);
  }
  return false;
}

// Main Execution Flow
async function main() {
  console.log("================================================");
  console.log("     QIKINK PRODUCT SYNC FOR STYLEXWEAR         ");
  console.log("================================================");
  
  const config = extractQikinkConfig();
  if (!config) {
    console.log("Using CSV fallback...");
    if (!parseProductsCSV()) {
      console.log("\nFAILED: No Qikink API config and no CSV products file found.");
    }
    return;
  }

  const { clientId, accessToken, apiBase } = config;
  const listEndpoint = `${apiBase}/api/products/list`;
  console.log(`Connecting to Qikink API at: ${listEndpoint}...`);

  try {
    const headers = {
      'ClientId': clientId,
      'Accesstoken': accessToken
    };

    // Attempt to call Qikink product list endpoint
    const response = await makeRequest(listEndpoint, headers, 'POST', { page: 1, limit: 100 });
    
    if (response && response.status === 'success' && Array.isArray(response.data)) {
      writeProductsFile(response.data);
    } else {
      throw new Error(response.message || 'API response format invalid');
    }
  } catch (err) {
    console.log(`\nAPI Connection failed: ${err.message}`);
    console.log("Attempting CSV backup sync...");
    
    if (!parseProductsCSV()) {
      console.log("\n------------------------------------------------");
      console.log("💡 HOW TO SYNC PRODUCTS MANUALLY:");
      console.log("1. Go to your Qikink Reseller Dashboard.");
      console.log("2. Click on 'Products' tab and choose 'Export Products' (CSV).");
      console.log("3. Rename the downloaded file to 'qikink_products.csv'.");
      console.log("4. Place it in this project folder.");
      console.log("5. Re-run this sync script!");
      console.log("------------------------------------------------");
    }
  }
}

main();
