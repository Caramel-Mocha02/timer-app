const DURATION_MS = 5 * 60 * 1000;
const WARNING_SECONDS = 10;

const timerEl = document.getElementById('timer');
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const finalScreen = document.getElementById('final-screen');
const appShell = document.querySelector('.app-shell') || document.body;
const timerPanel = document.querySelector('.timer-panel') || document.body;
const controlsPanel = document.querySelector('.controls') || document.body;
const timer = document.querySelector('.timer') || document.body;

let isRunning = false;
let endTime = 0;
let timerId = null;
let finishTimeoutId = null;
let warningStarted = false;

function formatTime(ms) {
  const remainingSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function setDisplayTime(ms) {
  timerEl.textContent = formatTime(ms);
}

function resetVisualState() {
  document.body.classList.remove('warning-phase', 'exploded');
  document.body.style.setProperty('--warning-level', '0');
  finalScreen.hidden = true;
  finalScreen.classList.remove('visible');

  [appShell, timerPanel, controlsPanel, timer].forEach((element) => {
    if (!element || !element.style) {
      return;
    }
    element.style.removeProperty('--burst-x');
    element.style.removeProperty('--burst-y');
    element.style.removeProperty('--burst-r');
    element.style.removeProperty('--burst-scale');
  });

  startButton.disabled = false;
  stopButton.disabled = false;
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  if (finishTimeoutId) {
    clearTimeout(finishTimeoutId);
    finishTimeoutId = null;
  }

  isRunning = false;
  warningStarted = false;
  resetVisualState();
  setDisplayTime(DURATION_MS);
}

function triggerWarningPhase() {
  if (warningStarted) {
    return;
  }

  warningStarted = true;
  document.body.classList.add('warning-phase');
}

function updateTimerDisplay() {
  const now = Date.now();
  const remainingMs = endTime - now;

  if (remainingMs <= 0) {
    setDisplayTime(0);
    finishSequence();
    return;
  }

  const secondsLeft = Math.ceil(remainingMs / 1000);
  setDisplayTime(remainingMs);

  if (secondsLeft <= WARNING_SECONDS) {
    triggerWarningPhase();
    const intensity = 1 - secondsLeft / WARNING_SECONDS;
    document.body.style.setProperty('--warning-level', intensity.toFixed(3));
  } else {
    document.body.style.setProperty('--warning-level', '0');
    document.body.classList.remove('warning-phase');
  }
}

function applyExplosionVectors() {
  const elements = [appShell, timerPanel, controlsPanel, timer].filter(Boolean);

  elements.forEach((element, index) => {
    const angle = (Math.PI * 2 * index) / elements.length + (Math.random() * 0.8 - 0.4);
    const force = index === elements.length - 1 ? 220 + Math.random() * 280 : 260 + Math.random() * 460;
    const x = Math.cos(angle) * force;
    const y = Math.sin(angle) * force - (index === elements.length - 1 ? 28 : 18);
    const rotation = (Math.random() * 480 - 240) * (index % 2 === 0 ? 1 : -1);
    const scale = index === elements.length - 1 ? 1.7 + Math.random() * 0.9 : 1.3 + Math.random() * 1.1;

    element.style.setProperty('--burst-x', `${x}px`);
    element.style.setProperty('--burst-y', `${y}px`);
    element.style.setProperty('--burst-r', `${rotation}deg`);
    element.style.setProperty('--burst-scale', `${scale}`);
  });
}

function finishSequence() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  isRunning = false;
  warningStarted = false;
  document.body.classList.remove('warning-phase');
  document.body.style.setProperty('--warning-level', '1');
  document.body.classList.add('exploded');
  applyExplosionVectors();
  startButton.disabled = true;
  stopButton.disabled = false;

  finishTimeoutId = window.setTimeout(() => {
    finalScreen.hidden = false;
    finalScreen.classList.add('visible');
    finalScreen.setAttribute('aria-hidden', 'false');
  }, 700);
}

function startTimer() {
  if (isRunning) {
    return;
  }

  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  if (finishTimeoutId) {
    clearTimeout(finishTimeoutId);
    finishTimeoutId = null;
  }

  warningStarted = false;
  document.body.classList.remove('exploded', 'warning-phase');
  finalScreen.hidden = true;
  finalScreen.classList.remove('visible');
  finalScreen.setAttribute('aria-hidden', 'true');
  setDisplayTime(0);
  startButton.disabled = true;
  stopButton.disabled = false;

  window.setTimeout(() => {
    finishSequence();
  }, 120);
}

startButton.addEventListener('click', startTimer);
stopButton.addEventListener('click', () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  if (finishTimeoutId) {
    clearTimeout(finishTimeoutId);
    finishTimeoutId = null;
  }

  isRunning = false;
  warningStarted = false;
  document.body.classList.remove('warning-phase', 'exploded');
  document.body.style.setProperty('--warning-level', '0');
  finalScreen.hidden = true;
  finalScreen.classList.remove('visible');
  finalScreen.setAttribute('aria-hidden', 'true');
  setDisplayTime(DURATION_MS);
  startButton.disabled = false;
  stopButton.disabled = false;
});

setDisplayTime(DURATION_MS);
resetVisualState();
