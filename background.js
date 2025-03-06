// Set up periodic price checks
chrome.runtime.onInstalled.addListener(() => {
  // Check prices every 6 hours
  chrome.alarms.create('checkPrices', { periodInMinutes: 360 });
  
  // Add a context menu item for manually checking prices
  chrome.contextMenus.create({
    id: 'checkPricesNow',
    title: 'Check Prices Now',
    contexts: ['action']
  });
});

// Listen for alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkPrices') {
    checkAllPrices();
  }
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'checkPricesNow') {
    checkAllPrices();
  }
});

// Check prices for all tracked products
function checkAllPrices() {
  chrome.storage.local.get('trackedProducts', (result) => {
    const trackedProducts = result.trackedProducts || [];
    
    if (trackedProducts.length === 0) {
      console.log('No products to check');
      return;
    }
    
    console.log('Checking prices for tracked products...');
    
    // Process each product
    trackedProducts.forEach((product, index) => {
      setTimeout(() => {
        checkProductPrice(product, index, trackedProducts);
      }, index * 2000); // Stagger requests to avoid overloading
    });
  });
}

// Check price for a single product
function checkProductPrice(product, index, trackedProducts) {
  console.log(`Checking price for ${product.title}`);
  
  // Use fetch to get the product page
  fetch(product.url)
    .then(response => response.text())
    .then(html => {
      // Process the HTML based on the site
      let newPrice = 'Price not available';
      
      if (product.site === 'Amazon') {
        newPrice = extractAmazonPrice(html);
      } else if (product.site === 'Flipkart') {
        newPrice = extractFlipkartPrice(html);
      } else if (product.site === 'Myntra') {
        newPrice = extractMyntraPrice(html);
      }
      
      console.log(`New price for ${product.title}: ${newPrice}`);
      
      // If we got a valid price and it's different
      if (newPrice !== 'Price not available' && newPrice !== product.price) {
        // Update the product
        updateProductPrice(product, newPrice, index, trackedProducts);
      }
    })
    .catch(error => {
      console.log(`Error checking price for ${product.title}: ${error}`);
    });
}

// Extract price from Amazon HTML
function extractAmazonPrice(html) {
  try {
    // Simple regex pattern to find Amazon price
    const pricePattern = /<span class="a-price"[^>]*>[^<]*<span class="a-offscreen">([^<]+)<\/span>/;
    const match = html.match(pricePattern);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    
    // Fallback pattern
    const fallbackPattern = /id="priceblock_ourprice"[^>]*>([^<]+)</;
    const fallbackMatch = html.match(fallbackPattern);
    
    if (fallbackMatch && fallbackMatch[1]) {
      return fallbackMatch[1].trim();
    }
    
    return 'Price not available';
  } catch (error) {
    console.error('Error extracting Amazon price:', error);
    return 'Price not available';
  }
}

// Extract price from Flipkart HTML
function extractFlipkartPrice(html) {
  try {
    // Simple regex pattern for Flipkart price
    const pricePattern = /<div class="_30jeq3[^"]*">([^<]+)<\/div>/;
    const match = html.match(pricePattern);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    
    return 'Price not available';
  } catch (error) {
    console.error('Error extracting Flipkart price:', error);
    return 'Price not available';
  }
}

// Extract price from Myntra HTML
function extractMyntraPrice(html) {
  try {
    // Simple regex pattern for Myntra price
    const pricePattern = /<span class="pdp-price"[^>]*>([^<]+)<\/span>/;
    const match = html.match(pricePattern);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    
    return 'Price not available';
  } catch (error) {
    console.error('Error extracting Myntra price:', error);
    return 'Price not available';
  }
}

// Update product price in storage
function updateProductPrice(product, newPrice, index, trackedProducts) {
  // Add to price history
  product.priceHistory.push({
    price: newPrice,
    date: new Date().toISOString()
  });
  
  // Update current price
  product.price = newPrice;
  
  // Update the product in the array
  trackedProducts[index] = product;
  
  // Save back to storage
  chrome.storage.local.set({trackedProducts: trackedProducts}, () => {
    console.log(`Updated price for ${product.title}`);
    
    // Show notification
    const priceNum = parseFloat(newPrice.replace(/[^0-9.]/g, ''));
    const oldPriceNum = parseFloat(product.priceHistory[product.priceHistory.length - 2].price.replace(/[^0-9.]/g, ''));
    
    let priceChange = "unchanged";
    if (priceNum < oldPriceNum) {
      priceChange = "decreased";
    } else if (priceNum > oldPriceNum) {
      priceChange = "increased";
    }
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Price Update',
      message: `The price of ${product.title.substring(0, 40)}... has ${priceChange} to ${newPrice}`,
      priority: 2
    });
  });
}

// Listen for install
chrome.runtime.onInstalled.addListener(() => {
  // Set a flag for testing - will be removed in production
  chrome.storage.local.set({testMode: true}, () => {
    console.log('Price tracker installed. Test mode enabled.');
  });
  
  // Add a message for the user to know about test mode
  console.log('Price modified for testing. Click "Check Prices Now"');
});