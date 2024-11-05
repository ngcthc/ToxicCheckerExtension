// const API_URL = 'http://localhost:5000/predict'; // Địa chỉ API Flask

// function setupContextMenu() {
//   chrome.contextMenus.create({
//     id: 'define-word-1',
//     title: 'Define',
//     contexts: ['selection']
//   });
// }

// chrome.runtime.onInstalled.addListener(() => {
//   setupContextMenu();
// });

// chrome.contextMenus.onClicked.addListener(async (data) => {
//   const selectedText = data.selectionText;

//   if (selectedText) {
//     try {
//       // Gửi yêu cầu đến API Flask
//       const response = await fetch(API_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ text: selectedText })
//       });

//       const result = await response.json();

//       if (result.prediction !== undefined) {
//         // Lưu kết quả vào chrome.storage.session
//         chrome.storage.session.set({ lastWord: selectedText, prediction: result.prediction });
//         // Hiển thị kết quả bằng alert
//         // alert(`Prediction: ${result.prediction}`);
//       } else {
//         console.error('No prediction in API response:', result);
//       }
//     } catch (error) {
//       console.error('Error fetching prediction:', error);
//     }
//   }

// //   // Mở side panel để hiển thị kết quả
// //   // chrome.sidePanel.open({ tabId: tab.id });

//   // Mở popup để hiển thị kết quả
//   chrome.action.openPopup();
// });

// chrome.runtime.onMessage.addListener( data => {
//   if ( data.type === 'notification' ) {
//     notify( data.message );
//   }
// });

// chrome.runtime.onInstalled.addListener( () => {
//   chrome.contextMenus.create({
//     id: 'notify',
//     title: "Notify!: %s", 
//     contexts:[ "selection" ]
//   });
// });

// chrome.contextMenus.onClicked.addListener( ( info, tab ) => {
//   if ( 'notify' === info.menuItemId ) {
//     notify( info.selectionText );
//   }
// } );

// const notify = message => {
//   return chrome.notifications.create(
//     '',
//     {
//       type: 'basic',
//       title: 'Notify!',
//       message: message || 'Notify!',
//       iconUrl: './assets/icons/128.png',
//     }
//   );
// };

// const API_URL = 'http://localhost:5000/predict'; // Flask API URL
const API_URL = 'http://localhost:8000/predict'; // Địa chỉ API FastAPI

// Setup context menu on extension installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'define-word',
    title: 'Define',
    contexts: ['selection'],
  });

  chrome.contextMenus.create({
    id: 'notify',
    title: 'Notify!: %s',
    contexts: ['selection'],
  });
});

// Handle context menu actions
chrome.contextMenus.onClicked.addListener(async (info) => {
  const selectedText = info.selectionText;

  if (selectedText) {
    const result = await fetchPrediction(selectedText);

    if (result?.prediction !== undefined) {
      // Save result in session storage
      chrome.storage.session.set({
        lastWord: selectedText,
        prediction: result.prediction,
      });

      if (info.menuItemId === 'define-word') {
        // Open popup for 'Define' action
        chrome.action.openPopup();
      } else if (info.menuItemId === 'notify') {
        // Show notification for 'Notify' action
        notify(`${selectedText} Prediction: ${result.prediction}`);
      }
    } else {
      console.error('No prediction in API response:', result);
    }
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
    console.log('Prediction:', data);
    return data;
  } catch (error) {
    console.error('Error fetching prediction:', error);
  }
}


// Notification function
function notify(message) {
  chrome.notifications.create('', {
    type: 'basic',
    title: 'Notify!',
    message: message || 'No message provided.',
    iconUrl: './assets/icon128.png',
  });
}

// Optional: Handle runtime messages
chrome.runtime.onMessage.addListener((data) => {
  if (data.type === 'notification') {
    notify(data.message);
  }
});
