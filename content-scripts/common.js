// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getProductInfo") {
    console.log("Received request to extract product info");
    const productInfo = extractProductInfo();
    console.log("Extracted product info:", productInfo);
    sendResponse({success: !!productInfo, data: productInfo || {
      title: "Failed to extract product info",
      price: "N/A",
      url: window.location.href,
      site: getSiteName()
    }});
  }
  return true; // Required for async response
});

// Helper function to get the site name
function getSiteName() {
  const url = window.location.href;
  if (url.includes('amazon')) return 'Amazon';
  if (url.includes('flipkart')) return 'Flipkart';
  if (url.includes('myntra')) return 'Myntra';
  return 'Unknown';
}

// Placeholder function to be overridden by specific site scripts
function extractProductInfo() {
  return null;
}