const SERVER_URL = 'http://duynm2310.com:8000'; // Địa chỉ API FastAPI
const LOCAL_URL = 'http://localhost:8000'; // Địa chỉ API FastAPI
const API_URL = SERVER_URL+'/predict'; // Địa chỉ API FastAPI

// Setup context menu on extension installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'check-comment',
    title: 'Check Comment: %s',
    contexts: ['selection'],
  });
});

// Handle context menu actions
chrome.contextMenus.onClicked.addListener(async (info) => {
  const selectedText = info.selectionText;

  if (!selectedText) return;

  try {
    
    const result = await fetchPrediction(selectedText);

    if (result?.prediction !== undefined) {
      // Save result in session storage
      chrome.storage.session.set({
        lastWord: selectedText,
        prediction: result.prediction,
        probability: result.probability,
      });

      if (info.menuItemId === 'check-comment') {
        chrome.action.openPopup();
      }

    } else {
      console.error('API response missing prediction:', result);
    }
  } catch (error) {
    console.error('Error fetching prediction:', error);
  }
});

async function fetchPrediction(text) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }), // Send the input text in JSON format
    });

    // Check if the response is OK (status 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse and return the JSON response
    const data = await response.json();
    console.log('data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching prediction:', error);
  }
}