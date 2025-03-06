// Override the extractProductInfo function for Flipkart
function extractProductInfo() {
    try {
      // Get product title
      const titleElement = document.querySelector('.B_NuCI') || 
                           document.querySelector('._35KyD6') ||
                           document.querySelector('h1.yhB1nd') ||
                           document.querySelector('h1');
      const title = titleElement ? titleElement.textContent.trim() : 'Unknown Product';
      
      // Direct approach to get price from the page
      let price = 'Price not available';
      
      // Method 1: Try to get the main price directly from the page content
      const allElements = document.querySelectorAll('*');
      for (const element of allElements) {
        const text = element.textContent.trim();
        // Look for ₹ followed by numbers (and possibly commas)
        if (text.match(/^₹[\d,]+$/) && !text.includes('Upto') && !text.includes('off')) {
          price = text;
          console.log("Found price with pattern match:", price);
          break;
        }
      }
      
      // Method 2: If still not found, look for specific price region
      if (price === 'Price not available') {
        const priceSection = document.querySelector('div[class*="CEmiEU"]') || 
                            document.querySelector('div[class*="_30jeq3"]');
        if (priceSection) {
          price = priceSection.textContent.trim();
          console.log("Found price in price section:", price);
        }
      }
      
      // Get product image
      const imageElement = document.querySelector('._396cs4 img') || 
                           document.querySelector('._3BTv9X img') ||
                           document.querySelector('img._396cs4') ||
                           document.querySelector('img[class*="q6DClP"]');
      const imageUrl = imageElement ? imageElement.src : '';
      
      // Log what we found for debugging
      console.log("Flipkart extraction:", { title, price, imageUrl });
      
      return {
        title: title,
        price: price,
        imageUrl: imageUrl,
        url: window.location.href,
        site: 'Flipkart'
      };
    } catch (error) {
      console.error('Error extracting Flipkart product info:', error);
      return null;
    }
  }