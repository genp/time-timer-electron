let timerCanvas = null;
let ctx = null;
let totalSeconds = 60 * 60;
let remainingSeconds = 0;
let timerInterval = null;
let timerColor = '#ff5555';
let isDragging = false;
let isRunning = false;

window.onload = () => {
  timerCanvas = document.getElementById('timerCanvas');
  ctx = timerCanvas.getContext('2d');
  drawTimer(0);

  document.getElementById('colorPicker').addEventListener('input', (e) => {
    timerColor = e.target.value;
    drawTimer(remainingSeconds / totalSeconds);
  });

  timerCanvas.addEventListener('mousedown', (e) => {
    if (!isRunning) {
      isDragging = true;
      updateFromMouse(e);
    }
  });

  timerCanvas.addEventListener('mousemove', (e) => {
    if (isDragging && !isRunning) updateFromMouse(e);
  });

  timerCanvas.addEventListener('mouseup', () => isDragging = false);
  timerCanvas.addEventListener('mouseleave', () => isDragging = false);
};

function drawTicks() {
  const centerX = timerCanvas.width / 2;
  const centerY = timerCanvas.height / 2;
  const radius = 140;

  ctx.save();
  ctx.translate(centerX, centerY);

  for (let i = 0; i < 60; i++) {
    ctx.beginPath();
    ctx.rotate((2 * Math.PI) / 60);
    ctx.moveTo(0, -radius);
    ctx.lineTo(0, -(radius - (i % 5 === 0 ? 15 : 7)));
    ctx.strokeStyle = '#888';
    ctx.lineWidth = i % 5 === 0 ? 2 : 1;
    ctx.stroke();
  }

  ctx.restore();
}

function drawTimer(fraction) {
  ctx.clearRect(0, 0, timerCanvas.width, timerCanvas.height);
  drawTicks();

  const centerX = timerCanvas.width / 2;
  const centerY = timerCanvas.height / 2;
  const radius = 110;
  const endAngle = -Math.PI / 2 + 2 * Math.PI * fraction;

  // Rounded wedge
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle, false);
  ctx.lineTo(centerX, centerY);
  ctx.closePath();
  ctx.fillStyle = timerColor;
  ctx.fill();

  // Wedge handle (drag circle)
  if (!isRunning && fraction > 0) {
    const handleAngle = endAngle;
    const handleRadius = 10;
    const hx = centerX + Math.cos(handleAngle) * radius;
    const hy = centerY + Math.sin(handleAngle) * radius;
    ctx.beginPath();
    ctx.arc(hx, hy, handleRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Time text
  ctx.fillStyle = '#000';
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const minutesLeft = Math.ceil(remainingSeconds / 60);
  ctx.fillText(`${minutesLeft} min`, centerX, centerY);
}

function updateFromMouse(e) {
  const rect = timerCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left - timerCanvas.width / 2;
  const y = e.clientY - rect.top - timerCanvas.height / 2;
  const angle = Math.atan2(y, x);
  const angleFromTop = (angle + Math.PI * 2.5) % (2 * Math.PI);
  const minutes = Math.round((angleFromTop / (2 * Math.PI)) * 60);

  remainingSeconds = minutes * 60;
  drawTimer(remainingSeconds / totalSeconds);
}

function startTimer() {
  if (timerInterval || remainingSeconds <= 0) return;
  isRunning = true;
  timerInterval = setInterval(() => {
    remainingSeconds--;
    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      document.getElementById('ding').play();
      isRunning = false;
    }
    drawTimer(remainingSeconds / totalSeconds);
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
  }
}

function resetTimer() {
  stopTimer();
  remainingSeconds = 0;
  drawTimer(0);
}
