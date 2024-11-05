
// const form = document.getElementById('news-form');


// form.addEventListener('submit', async (event) => {

//   event.preventDefault();


//   const input = document.getElementById('news-text').value;
  
//   try {
    
//     // console.log(JSON.stringify({text: input}));
//     const response = await fetch('http://localhost:5000/predict', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({text: input}),
//     });




//     if (response.ok) {
//       const prediction = (await response.json()).prediction;
//       const resultDiv = document.getElementById('prediction-result');
//       resultDiv.innerText = prediction===1 ? 'Toxic' : 'Non-Toxic';
//     } else {
//       console.error('Request failed:', response.status);
//     }
//   } catch (error) {
//     console.error('Request failed:', error);
//   }
// });
const selectedText = document.getElementById('selected-text');
const resultDiv = document.getElementById('prediction-result');
const countdownTimer = document.getElementById('countdown-timer');
const body = document.body; // To change background color

// Mapping of prediction values to colors
const predictionColors = {
  1: '#F8D7DA',  // Light Red (negative)
  0: '#D4EDDA',  // Light Green (positive)
  default: '#FFFFFF',  // White (default)
};

// Retrieve 'lastWord' and 'prediction' from session storage
async function displayStoredData() {
  try {
    const { lastWord } = await chrome.storage.session.get('lastWord');
    const { prediction } = await chrome.storage.session.get('prediction');

    // Set text content
    selectedText.innerText = lastWord 
      ? `Selected text: ${lastWord}` 
      : 'No text selected.';

    resultDiv.innerText = prediction !== undefined
      ? `Prediction: ${prediction}` 
      : 'No prediction available.';

    // Change background color based on prediction
    const bgColor = predictionColors[prediction] || predictionColors.default;
    body.style.backgroundColor = bgColor;
  } catch (error) {
    console.error('Error retrieving data from storage:', error);
    selectedText.innerText = 'Error loading selected text.';
    resultDiv.innerText = 'Error loading prediction.';
    body.style.backgroundColor = predictionColors.default;
  }
}

// Countdown logic
let timeLeft = 5; // 5-second countdown

function startCountdown() {
  const interval = setInterval(() => {
    timeLeft -= 1;
    countdownTimer.innerText = `${timeLeft}s remaining`;

    if (timeLeft <= 0) {
      clearInterval(interval);
      window.close(); // Close the popup after 5 seconds
    }
  }, 1000);
}

// Call the function to display data and start the timer on popup load
displayStoredData();
startCountdown();
