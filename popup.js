// Global variables
let currentTab = null;
let currentProductData = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  // Set up event listeners
  document.getElementById('track-button').addEventListener('click', trackCurrentProduct);
  
  // Get current tab info
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    currentTab = tabs[0];
    checkIfProductPage(currentTab.url);
  });
  
  // Load tracked products
  loadTrackedProducts();
});

// Check if the current page is a product page
function checkIfProductPage(url) {
  const currentProductSection = document.getElementById('current-product');
  
  if (isProductUrl(url)) {
    currentProductSection.classList.remove('hidden');
    getCurrentProductInfo();
  } else {
    currentProductSection.classList.add('hidden');
  }
}

// Check if URL is from a supported product page
function isProductUrl(url) {
  return (
    (url.includes('amazon') && (url.includes('/dp/') || url.includes('/gp/'))) ||
    (url.includes('flipkart.com') && url.includes('/p/')) ||
    (url.includes('myntra.com') && url.includes('/p/'))
  );
}

// Get current product information
function getCurrentProductInfo() {
  chrome.tabs.sendMessage(currentTab.id, {action: "getProductInfo"}, (response) => {
    if (response && response.success) {
      currentProductData = response.data;
      displayCurrentProduct(currentProductData);
    } else {
      document.getElementById('product-info').innerHTML = 
        '<p>Unable to extract product information. Please try reloading the page.</p>';
    }
  });
}

// Display current product
function displayCurrentProduct(product) {
  const productInfoDiv = document.getElementById('product-info');
  productInfoDiv.innerHTML = `
    <div class="product-card">
      <div class="product-title">${product.title}</div>
      <div class="product-price">Current: ${product.price}</div>
      <div class="product-site">Site: ${product.site}</div>
    </div>
  `;
}

// Track the current product
function trackCurrentProduct() {
  if (!currentProductData) return;
  
  // Add current date and add history array
  currentProductData.dateAdded = new Date().toISOString();
  currentProductData.priceHistory = [{
    price: currentProductData.price,
    date: new Date().toISOString()
  }];
  
  // Get existing products
  chrome.storage.local.get('trackedProducts', (result) => {
    let trackedProducts = result.trackedProducts || [];
    
    // Check if product already exists
    const existingIndex = trackedProducts.findIndex(p => p.url === currentProductData.url);
    
    if (existingIndex !== -1) {
      // Update existing product
      trackedProducts[existingIndex].price = currentProductData.price;
      trackedProducts[existingIndex].priceHistory.push({
        price: currentProductData.price,
        date: new Date().toISOString()
      });
    } else {
      // Add new product
      trackedProducts.push(currentProductData);
    }
    
    // Save back to storage
    chrome.storage.local.set({trackedProducts: trackedProducts}, () => {
      document.getElementById('track-button').textContent = 'Product Tracked!';
      setTimeout(() => {
        document.getElementById('track-button').textContent = 'Track This Product';
      }, 2000);
      
      // Refresh the list
      loadTrackedProducts();
    });
  });
}

// Load tracked products
function loadTrackedProducts() {
  chrome.storage.local.get('trackedProducts', (result) => {
    const trackedProducts = result.trackedProducts || [];
    displayTrackedProducts(trackedProducts);
  });
}

// Display tracked products
function displayTrackedProducts(products) {
  const productListDiv = document.getElementById('product-list');
  const noProductsElement = document.getElementById('no-products');
  
  if (products.length === 0) {
    noProductsElement.style.display = 'block';
    productListDiv.innerHTML = '';
    return;
  }
  
  noProductsElement.style.display = 'none';
  
  let html = '';
  products.forEach((product, index) => {
    const priceHistory = product.priceHistory || [];
    const lowestPrice = priceHistory.reduce((min, p) => 
      parseFloat(p.price.replace(/[^0-9.]/g, '')) < parseFloat(min.replace(/[^0-9.]/g, '')) 
        ? p.price : min, priceHistory[0].price);
        
    html += `
      <div class="product-card">
        <button class="delete-button" data-index="${index}">X</button>
        <div class="product-title">${product.title}</div>
        <div class="product-price">Current: ${product.price}</div>
        <div class="price-history">Lowest: ${lowestPrice}</div>
        <div class="product-site">Site: ${product.site}</div>
        <a href="${product.url}" target="_blank">View Product</a>
      </div>
    `;
  });
  
  productListDiv.innerHTML = html;
  
  // Add event listeners to delete buttons
  document.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      deleteProduct(index);
    });
  });
}

// Delete a tracked product
function deleteProduct(index) {
  chrome.storage.local.get('trackedProducts', (result) => {
    let trackedProducts = result.trackedProducts || [];
    trackedProducts.splice(index, 1);
    chrome.storage.local.set({trackedProducts: trackedProducts}, () => {
      loadTrackedProducts();
    });
  });
}
// Add event listener for the check prices button
document.addEventListener('DOMContentLoaded', () => {
  const checkPricesButton = document.getElementById('check-prices-button');
  if (checkPricesButton) {
    checkPricesButton.addEventListener('click', () => {
      checkPricesButton.textContent = 'Checking...';
      checkPricesButton.disabled = true;
      
      chrome.runtime.sendMessage({action: "checkPrices"}, (response) => {
        setTimeout(() => {
          checkPricesButton.textContent = 'Check Prices Now';
          checkPricesButton.disabled = false;
        }, 2000);
      });
    });
  }
});