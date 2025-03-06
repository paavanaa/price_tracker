// work in progress i would suggest ignoring this for now






// Override the extractProductInfo function for Myntra
function extractProductInfo() {
    try {
      // Get product title
      const titleElement = document.querySelector('.pdp-title') || 
                           document.querySelector('.pdp-name') ||
                           document.querySelector('h1.pdp-title') ||
                           document.querySelector('h1.pdp-name');
      const title = titleElement ? titleElement.textContent.trim() : 'Unknown Product';
      
      // Get product brand
      const brandElement = document.querySelector('.pdp-product-brand-title') ||
                           document.querySelector('.pdp-title');
      const brand = brandElement ? brandElement.textContent.trim() : '';
      
      // Get product price
      const priceElement = document.querySelector('.pdp-price strong') || 
                           document.querySelector('.pdp-discount-container .pdp-price') ||
                           document.querySelector('.pdp-price') ||
                           document.querySelector('span.pdp-discountedPrice');
      const price = priceElement ? priceElement.textContent.trim() : 'Price not available';
      
      // Get product image
      const imageElement = document.querySelector('.image-grid-image') || 
                           document.querySelector('.image-grid-containerImg') ||
                           document.querySelector('.image-grid-imageContainer img');
      const imageUrl = imageElement ? imageElement.src : '';
      
      console.log("Myntra extraction:", { title, price, brand, imageUrl });
      
      // Combine brand and title if both exist
      const fullTitle = brand && title ? `${brand} - ${title}` : title;
      
      return {
        title: fullTitle,
        price: price,
        imageUrl: imageUrl,
        url: window.location.href,
        site: 'Myntra'
      };
    } catch (error) {
      console.error('Error extracting Myntra product info:', error);
      return null;
    }
  }