const MAX_SECONDS = 60 * 60;
const TWO_PI = Math.PI * 2;

let timerCanvas;
let ctx;
let colorPicker;
let timeText;
let statusText;
let startButton;
let pauseButton;
let resetButton;
let ding;

let remainingSeconds = 0;
let durationSeconds = 0;
let deadlineMs = 0;
let timerInterval = null;
let timerColor = '#d71920';
let isDragging = false;
let isRunning = false;

function angleForMinute(minute) {
  return -Math.PI / 2 - (minute / 60) * TWO_PI;
}

window.addEventListener('DOMContentLoaded', () => {
  timerCanvas = document.getElementById('timerCanvas');
  ctx = timerCanvas.getContext('2d');
  colorPicker = document.getElementById('colorPicker');
  timeText = document.getElementById('timeText');
  statusText = document.getElementById('statusText');
  startButton = document.getElementById('startButton');
  pauseButton = document.getElementById('pauseButton');
  resetButton = document.getElementById('resetButton');
  ding = document.getElementById('ding');

  colorPicker.addEventListener('input', (event) => {
    timerColor = event.target.value;
    drawTimer();
  });

  startButton.addEventListener('click', startTimer);
  pauseButton.addEventListener('click', pauseTimer);
  resetButton.addEventListener('click', resetTimer);

  timerCanvas.addEventListener('pointerdown', beginDrag);
  timerCanvas.addEventListener('pointermove', dragTimer);
  timerCanvas.addEventListener('pointerup', endDrag);
  timerCanvas.addEventListener('pointercancel', endDrag);
  timerCanvas.addEventListener('lostpointercapture', endDrag);

  window.addEventListener('resize', drawTimer);

  updateUi();
});

function beginDrag(event) {
  if (isRunning) return;
  isDragging = true;
  timerCanvas.setPointerCapture(event.pointerId);
  setTimeFromPointer(event);
}

function dragTimer(event) {
  if (!isDragging || isRunning) return;
  setTimeFromPointer(event);
}

function endDrag() {
  isDragging = false;
}

function setTimeFromPointer(event) {
  const rect = timerCanvas.getBoundingClientRect();
  const scaleX = timerCanvas.width / rect.width;
  const scaleY = timerCanvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX - timerCanvas.width / 2;
  const y = (event.clientY - rect.top) * scaleY - timerCanvas.height / 2;
  const angle = Math.atan2(y, x);
  const counterClockwiseFromTop = (-angle - Math.PI / 2 + TWO_PI) % TWO_PI;
  const minutes = Math.round((counterClockwiseFromTop / TWO_PI) * 60);

  remainingSeconds = minutes === 60 ? MAX_SECONDS : minutes * 60;
  durationSeconds = remainingSeconds;
  updateUi();
}

function startTimer() {
  if (isRunning || remainingSeconds <= 0) return;
  isRunning = true;
  deadlineMs = Date.now() + remainingSeconds * 1000;
  timerInterval = setInterval(tick, 250);
  tick();
}

function pauseTimer() {
  if (!isRunning) return;
  stopInterval();
  remainingSeconds = Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000));
  durationSeconds = Math.max(durationSeconds, remainingSeconds);
  updateUi();
}

function resetTimer() {
  stopInterval();
  remainingSeconds = 0;
  durationSeconds = 0;
  updateUi();
}

function tick() {
  remainingSeconds = Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000));

  if (remainingSeconds === 0) {
    stopInterval();
    playDing();
  }

  updateUi();
}

function stopInterval() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  isRunning = false;
}

function playDing() {
  ding.currentTime = 0;
  ding.play().catch(() => {
    statusText.textContent = 'Done';
  });
}

function updateUi() {
  const hasTime = remainingSeconds > 0;
  timeText.textContent = formatTime(remainingSeconds);
  statusText.textContent = isRunning ? 'Running' : hasTime ? 'Ready' : 'Set timer';
  startButton.disabled = isRunning || !hasTime;
  pauseButton.disabled = !isRunning;
  resetButton.disabled = !hasTime && !isRunning;
  drawTimer();
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function drawTimer() {
  if (!ctx) return;

  const width = timerCanvas.width;
  const height = timerCanvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = width * 0.475;
  const diskRadius = width * 0.35;
  const fraction = remainingSeconds / MAX_SECONDS;

  ctx.clearRect(0, 0, width, height);
  drawFace(centerX, centerY, outerRadius, diskRadius);
  drawDisk(centerX, centerY, diskRadius, fraction);
  drawPointer(centerX, centerY, diskRadius, fraction);
  drawHub(centerX, centerY);
}

function drawFace(centerX, centerY, outerRadius, diskRadius) {
  ctx.save();
  ctx.translate(centerX, centerY);

  ctx.beginPath();
  ctx.arc(0, 0, outerRadius, 0, TWO_PI);
  ctx.fillStyle = '#fffef6';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, diskRadius + 12, 0, TWO_PI);
  ctx.strokeStyle = '#050505';
  ctx.lineWidth = 4;
  ctx.stroke();

  for (let minute = 0; minute < 60; minute++) {
    const major = minute % 5 === 0;
    const angle = angleForMinute(minute);
    const tickOuter = diskRadius + (major ? 58 : 42);
    const tickInner = tickOuter - (major ? 31 : 13);

    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * tickInner, Math.sin(angle) * tickInner);
    ctx.lineTo(Math.cos(angle) * tickOuter, Math.sin(angle) * tickOuter);
    ctx.strokeStyle = '#050505';
    ctx.lineWidth = major ? 6 : 2;
    ctx.lineCap = 'butt';
    ctx.stroke();

    if (major) {
      const labelRadius = diskRadius + 92;
      ctx.fillStyle = '#050505';
      ctx.font = '800 32px "Arial Rounded MT Bold", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        String(minute),
        Math.cos(angle) * labelRadius,
        Math.sin(angle) * labelRadius
      );
    }
  }

  ctx.restore();
}

function drawDisk(centerX, centerY, radius, fraction) {
  if (fraction <= 0) return;

  const startAngle = -Math.PI / 2;
  const endAngle = startAngle - TWO_PI * fraction;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, startAngle, endAngle, true);
  ctx.closePath();
  ctx.fillStyle = timerColor;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(
    centerX + Math.cos(endAngle) * radius,
    centerY + Math.sin(endAngle) * radius
  );
  ctx.strokeStyle = '#050505';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function drawPointer(centerX, centerY, radius, fraction) {
  if (isRunning || fraction <= 0) return;

  const angle = -Math.PI / 2 - TWO_PI * fraction;
  const x = centerX + Math.cos(angle) * radius;
  const y = centerY + Math.sin(angle) * radius;

  ctx.beginPath();
  ctx.arc(x, y, 18, 0, TWO_PI);
  ctx.fillStyle = '#050505';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#fffef6';
  ctx.stroke();
}

function drawHub(centerX, centerY) {
  const gradient = ctx.createRadialGradient(centerX - 8, centerY - 10, 4, centerX, centerY, 46);
  gradient.addColorStop(0, '#fffef8');
  gradient.addColorStop(1, '#eadfca');

  ctx.beginPath();
  ctx.arc(centerX, centerY, 44, 0, TWO_PI);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = '#050505';
  ctx.lineWidth = 4;
  ctx.stroke();
}
