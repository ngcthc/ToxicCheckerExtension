const resultDiv = document.getElementById('prediction-result');
const countdownDiv = document.getElementById('countdown-timer');
const container = document.getElementById('container'); // For changing background color

// Mapping of prediction values to colors
const predictionColors = {
  1: '#c9262d',  // Light Red (negative)
  0: '#11805b',  // Light Green (positive)
  default: '#FFFFFF',  // White (default)
};

// Display stored data from session storage
async function displayStoredData() {
  try {
    const { prediction, probability } = await chrome.storage.session.get(['prediction', 'probability']);

    // Update result text based on prediction
    resultDiv.innerText = prediction === 0
      ? 'Normal comment'
      : prediction !== undefined
      ? `Toxic comment detected: ${(probability * 100).toFixed(2)}%`
      : 'No prediction available.';

    // Change background color based on prediction
    container.style.backgroundColor = predictionColors[prediction] || predictionColors.default;
  } catch (error) {
    console.error('Error retrieving data from storage:', error);
    resultDiv.innerText = 'Error loading prediction.';
    container.style.backgroundColor = predictionColors.default;
  }
}

// Countdown logic to close the popup after 5 seconds
function startCountdown() {
  let timeLeft = 5; // 5-second countdown
  const interval = setInterval(() => {
    timeLeft -= 1;
    // countdownDiv.innerText = `Closing in ${timeLeft} seconds`;
    if (timeLeft <= 0) {
      clearInterval(interval);
      window.close(); // Close the popup
    }
  }, 1000);
}

// Initialize popup: display data and start countdown
displayStoredData();
startCountdown();