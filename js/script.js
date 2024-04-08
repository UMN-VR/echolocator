// Declare variables
let audioContext;
let isAudioStarted = false; // Flag for AudioContext initialization
let isClicking = false; // Flag for active clicking
let lastClickTime = 0; // Timestamp of the last click
let clickRateRange = { min: 1, max: 10 }; // Click rate range in Hz
let frequencyRange = { min: 6000, max: 16000 }; // Frequency range in Hz
let volume = 0.5; // Default volume

const startButton = document.getElementById('startButton');
const touchArea = document.getElementById('touchArea');
const feedbackCircle = document.getElementById('feedbackCircle');
const infoText = document.getElementById('infoText');
const minClickRateInput = document.getElementById('minClickRate');
const maxClickRateInput = document.getElementById('maxClickRate');
const minFrequencyInput = document.getElementById('minFrequency');
const maxFrequencyInput = document.getElementById('maxFrequency');
const volumeControl = document.getElementById('volumeControl');

startButton.addEventListener('click', initializeAudioContext);
minClickRateInput.addEventListener('change', updateSettings);
maxClickRateInput.addEventListener('change', updateSettings);
minFrequencyInput.addEventListener('change', updateSettings);
maxFrequencyInput.addEventListener('change', updateSettings);
volumeControl.addEventListener('input', updateVolume);

// Timing control
let clickTimer; // Timer ID for click generation

function initializeAudioContext() {
  if (!isAudioStarted) {
    audioContext = new AudioContext();
    touchArea.style.display = 'block';
    startButton.style.display = 'none';
    isAudioStarted = true;
  }
}

function updateSettings() {
  clickRateRange.min = parseFloat(minClickRateInput.value) || 1;
  clickRateRange.max = parseFloat(maxClickRateInput.value) || 10;
  frequencyRange.min = (parseFloat(minFrequencyInput.value) || 6) * 1000;
  frequencyRange.max = (parseFloat(maxFrequencyInput.value) || 16) * 1000;
}

function updateVolume() {
  volume = parseFloat(volumeControl.value);
}

touchArea.addEventListener('touchstart', handleTouchStart, false);
touchArea.addEventListener('touchmove', handleTouchMove, false);
touchArea.addEventListener('touchend', handleTouchEnd, false);
touchArea.addEventListener('mousedown', handleTouchStart, false); // For non-touch devices
touchArea.addEventListener('mousemove', handleTouchMove, false);
touchArea.addEventListener('mouseup', handleTouchEnd, false);

function handleTouchStart(event) {
  event.preventDefault();
  isClicking = true;
  lastClickTime = performance.now();
  feedbackCircle.style.display = 'block';
  clickTimer = setInterval(generateClickIfDue, 1);
}

function handleTouchMove(event) {
  if (isClicking) {
    event.preventDefault();
    updateTouchPosition(event);
  }
}

function handleTouchEnd() {
  clearInterval(clickTimer);
  isClicking = false;
  feedbackCircle.style.display = 'none';
  infoText.textContent += " | Touch released.";
}

function updateTouchPosition(event) {
  const x = event.touches ? event.touches[0].clientX : event.clientX;
  const y = event.touches ? event.touches[0].clientY : event.clientY;
  
  setPositionFeedback(x, y);
}

function generateClickIfDue() {
  const currentClickRateRange = clickRateRange.max - clickRateRange.min;
  const currentFrequencyRange = frequencyRange.max - frequencyRange.min;
  
  const currentTime = performance.now();
  if (currentTime - lastClickTime >= (1000 / currentClickRateRange)) {
    const x = (feedbackCircle.offsetLeft + feedbackCircle.clientWidth / 2) / touchArea.clientWidth;
    const y = (feedbackCircle.offsetTop + feedbackCircle.clientHeight / 2) / touchArea.clientHeight;
    
    const clickFrequency = y * currentFrequencyRange + frequencyRange.min;
    const clickRate = x * currentClickRateRange + clickRateRange.min;
    const clickIntervalMs = 1000 / clickRate;
    
    if (currentTime - lastClickTime >= clickIntervalMs) {
      generateClick(clickFrequency);
      lastClickTime = currentTime;
    }
    
    infoText.textContent = `X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}, Frequency: ${clickFrequency.toFixed(0)} Hz, Click every: ${clickIntervalMs.toFixed(0)} ms, Volume: ${Math.round(volume * 100)}%`;
  }
}


function generateClick(frequency) {
  // Create an oscillator for each click
  const oscillator = audioContext.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  
  // Create a gain node to control the volume
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueCurveAtTime([volume, 0], audioContext.currentTime, 0.01); // Click lasts for 10ms
  
  // Connect and play the oscillator for a single click
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.01); // Stop after 10ms
}

// function generateClick(frequency) {
//   const oscillator = audioContext.createOscillator();
//   oscillator.type = 'sine';
//   oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

//   const gainNode = audioContext.createGain();
//   // Set gain to max (1 for 100%) for loudest click possible
//   gainNode.gain.setValueAtTime(1, audioContext.currentTime); 
//   // Volume is controlled by the slider and can be adjusted in real time
//   gainNode.gain.value *= volume;

//   gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.01);

//   oscillator.connect(gainNode);
//   gainNode.connect(audioContext.destination);

//   oscillator.start();
//   oscillator.stop(audioContext.currentTime + 0.01); // Stop oscillator after 10ms
// }


// function generateClick(frequency) {
//   const oscillator = audioContext.createOscillator();
//   oscillator.type = 'sine';
//   oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

//   const gainNode = audioContext.createGain();
//   gainNode.gain.setValueAtTime(volume, audioContext.currentTime); // Set volume
//   gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.01); // Ramp to almost 0 in 10 ms

//   oscillator.connect(gainNode);
//   gainNode.connect(audioContext.destination);

//   oscillator.start();
//   oscillator.stop(audioContext.currentTime + 0.01); // Stop oscillator after 10ms
// }

function setPositionFeedback(x, y) {
  feedbackCircle.style.left = `${x}px`;
  feedbackCircle.style.top = `${y}px`;
}