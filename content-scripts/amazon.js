// Override the extractProductInfo function for Amazon
function extractProductInfo() {
    try {
      // Get product title
      const titleElement = document.getElementById('productTitle') || 
                           document.querySelector('.product-title-word-break');
      const title = titleElement ? titleElement.textContent.trim() : 'Unknown Product';
      
      // Get product price
      const priceElement = document.querySelector('.a-price .a-offscreen') || 
                          document.querySelector('#priceblock_ourprice') ||
                          document.querySelector('#priceblock_dealprice');
      const price = priceElement ? priceElement.textContent.trim() : 'Price not available';
      
      // Get product image
      const imageElement = document.getElementById('landingImage') || 
                           document.querySelector('.a-dynamic-image');
      const imageUrl = imageElement ? imageElement.src : '';
      
      return {
        title: title,
        price: price,
        imageUrl: imageUrl,
        url: window.location.href,
        site: 'Amazon'
      };
    } catch (error) {
      console.error('Error extracting Amazon product info:', error);
      return null;
    }
  }