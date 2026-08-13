const carSprite = new Image();
carSprite.src = "skyli.png";

const menuBG = new Image();
menuBG.src = "MENU.png";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const fullscreenBtn = document.getElementById('fullscreenBtn');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      resizeCanvas();
    }).catch(() => {});
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', toggleFullscreen);
}

let hud = null;
if (typeof HUD !== 'undefined') {
  hud = new HUD(canvas, ctx);
}

const ROAD_WIDTH = 1200;
const SEGMENT_LENGTH = 200;
const CAM_DEPTH = 0.5;

const segments = [];
const TOTAL_SEGMENTS = 1000;

for (let i = 0; i < TOTAL_SEGMENTS; i++) {
  let curve = 0;
  let type = 'normal';
  let hasSign = false;
  let signSide = 'left';

  if (i > 150 && i <= 300) {
    curve = 2;
    type = 'mountain';
  } else if (i > 300 && i <= 450) {
    curve = -3;
    type = 'mountain';
  } else if (i > 500 && i <= 700) {
    curve = 1;
    type = 'tunnel';
  } else if (i > 750 && i <= 900) {
    curve = -2;
    type = 'mountain';
  }

  if (i % 40 === 0 && type !== 'tunnel') {
    hasSign = true;
    signSide = i % 80 === 0 ? 'left' : 'right';
  }

  segments.push({ curve, type, hasSign, signSide });
}

let speed = 0;
let maxSpeed = 6000;
let accel = 1500;
let decel = -2500;
let playerX = 0;
let position = 0;
let bgOffset = 0;

let gameState = 'menu';

const keys = {};
const gamepadKeys = {};

window.addEventListener('keydown', (e) => {
  keys[e.key] = true;

  if (gameState === 'menu' && (e.key === 'Enter' || e.key === ' ')) {
    gameState = 'playing';
  }
});

window.addEventListener('keyup', (e) => (keys[e.key] = false));

function pollGamepad() {
  gamepadKeys['ArrowUp'] = false;
  gamepadKeys['ArrowDown'] = false;
  gamepadKeys['ArrowLeft'] = false;
  gamepadKeys['ArrowRight'] = false;

  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  for (let i = 0; i < gamepads.length; i++) {
    const gp = gamepads[i];
    if (gp) {
      const btn = (index) => gp.buttons[index] && gp.buttons[index].pressed;

      if (gameState === 'menu' && (btn(0) || btn(9) || btn(7))) {
        gameState = 'playing';
      }

      const axisY = gp.axes[1] || 0;
      const axisX = gp.axes[0] || 0;

      if (btn(0) || btn(7) || axisY < -0.3) gamepadKeys['ArrowUp'] = true;
      if (btn(1) || btn(6) || axisY > 0.3) gamepadKeys['ArrowDown'] = true;

      if (axisX < -0.2 || btn(14)) gamepadKeys['ArrowLeft'] = true;
      if (axisX > 0.2 || btn(15)) gamepadKeys['ArrowRight'] = true;

      break;
    }
  }
}

function isPressed(key, altKey) {
  return keys[key] || keys[altKey] || gamepadKeys[key];
}

function update(dt) {
  pollGamepad();

  if (gameState !== 'playing') return;

  const pressingUp = isPressed('ArrowUp', 'w');
  const pressingDown = isPressed('ArrowDown', 's');
  const pressingLeft = isPressed('ArrowLeft', 'a');
  const pressingRight = isPressed('ArrowRight', 'd');

  if (pressingUp) speed += accel * dt;
  else if (pressingDown) speed += decel * dt;
  else speed += decel * 0.5 * dt;

  speed = Math.max(0, Math.min(speed, maxSpeed));

  if (pressingLeft) playerX -= 1.5 * dt;
  if (pressingRight) playerX += 1.5 * dt;

  position += speed * dt;
  const trackLength = TOTAL_SEGMENTS * SEGMENT_LENGTH;
  while (position >= trackLength) position -= trackLength;

  const currentSegmentIndex = Math.floor(position / SEGMENT_LENGTH) % TOTAL_SEGMENTS;
  const currentCurve = segments[currentSegmentIndex].curve;
  bgOffset -= currentCurve * (speed / maxSpeed) * 0.2;
}

function drawBackground() {
  const horizonY = canvas.height * 0.4;

  ctx.fillStyle = '#1b263b';
  ctx.fillRect(0, 0, canvas.width, horizonY);

  ctx.fillStyle = '#0d1b2a';
  ctx.beginPath();
  ctx.moveTo(0, horizonY);

  for (let x = 0; x <= canvas.width; x += 50) {
    const mountainHeight = Math.sin((x + bgOffset * 10) * 0.01) * 40 + 60;
    ctx.lineTo(x, horizonY - mountainHeight);
  }

  ctx.lineTo(canvas.width, horizonY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#1e381e';
  ctx.fillRect(0, horizonY, canvas.width, canvas.height - horizonY);
}

function drawPlayer() {
  const carWidth = 150;
  const carHeight = 100;
  const carX = canvas.width / 2 + playerX * 300 - carWidth / 2;
  const carY = canvas.height - carHeight - 20;

  if (carSprite.complete && carSprite.naturalWidth !== 0) {
    ctx.drawImage(carSprite, carX, carY, carWidth, carHeight);
  } else {
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(carX, carY, carWidth, carHeight);
  }
}

function drawMenu() {
  if (menuBG.complete && menuBG.naturalWidth !== 0) {
    ctx.drawImage(menuBG, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.font = 'bold 50px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('CARREGANDO...', canvas.width / 2, canvas.height / 2);
  }
}

function draw() {
  if (gameState === 'menu') {
    drawMenu();
    return;
  }

  drawBackground();

  const startPos = Math.floor(position / SEGMENT_LENGTH);
  let dx = 0;
  let camX = 0;

  const horizonY = canvas.height * 0.4;

  for (let n = 0; n < 100; n++) {
    const segmentIndex = (startPos + n) % TOTAL_SEGMENTS;
    const segment = segments[segmentIndex];

    const z1 = n * SEGMENT_LENGTH - (position % SEGMENT_LENGTH);
    const z2 = (n + 1) * SEGMENT_LENGTH - (position % SEGMENT_LENGTH);

    if (z1 <= 0) continue;

    dx += segment.curve;
    camX += dx;

    const scale1 = CAM_DEPTH / (z1 / 1000);
    const scale2 = CAM_DEPTH / (z2 / 1000);

    const x1 = canvas.width / 2 - (camX - segment.curve) * scale1 * 20;
    const y1 = horizonY + (1 / z1) * 120000;
    const w1 = ROAD_WIDTH * scale1;

    const x2 = canvas.width / 2 - camX * scale2 * 20;
    const y2 = horizonY + (1 / z2) * 120000;
    const w2 = ROAD_WIDTH * scale2;

    const isEven = segmentIndex % 2 === 0;
    const roadColor = isEven ? '#555555' : '#444444';
    const grassColor = isEven ? '#225522' : '#1e4b1e';

    ctx.fillStyle = grassColor;
    ctx.fillRect(0, y2, canvas.width, y1 - y2);

    ctx.fillStyle = roadColor;
    ctx.beginPath();
    ctx.moveTo(x1 - w1, y1);
    ctx.lineTo(x1 + w1, y1);
    ctx.lineTo(x2 + w2, y2);
    ctx.lineTo(x2 - w2, y2);
    ctx.closePath();
    ctx.fill();

    if (isEven && segment.type !== 'tunnel') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(x1 - w1 * 0.015, y1);
      ctx.lineTo(x1 + w1 * 0.015, y1);
      ctx.lineTo(x2 + w2 * 0.015, y2);
      ctx.lineTo(x2 - w2 * 0.015, y2);
      ctx.closePath();
      ctx.fill();
    }

    if (segment.hasSign && segment.type !== 'tunnel') {
      const signScale = scale1;
      const signWidth = 60 * signScale;
      const signHeight = 80 * signScale;
      const poleWidth = 8 * signScale;

      const signX = segment.signSide === 'left' ? x1 - w1 - signWidth * 1.5 : x1 + w1 + signWidth * 0.5;
      const signY = y1 - signHeight;

      ctx.fillStyle = '#888888';
      ctx.fillRect(signX + signWidth / 2 - poleWidth / 2, signY, poleWidth, signHeight);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(signX, signY, signWidth, signHeight * 0.7);

      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3 * signScale;
      ctx.strokeRect(signX, signY, signWidth, signHeight * 0.7);

      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(signX + signWidth / 2, signY + (signHeight * 0.7) / 2, signWidth * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }

    if (segment.type === 'tunnel') {
      const wallHeight1 = scale1 * 800;
      const wallHeight2 = scale2 * 800;

      ctx.fillStyle = isEven ? '#222222' : '#111111';

      ctx.beginPath();
      ctx.moveTo(x1 - w1, y1);
      ctx.lineTo(x1 - w1, y1 - wallHeight1);
      ctx.lineTo(x2 - w2, y2 - wallHeight2);
      ctx.lineTo(x2 - w2, y2);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x1 + w1, y1);
      ctx.lineTo(x1 + w1, y1 - wallHeight1);
      ctx.lineTo(x2 + w2, y2 - wallHeight2);
      ctx.lineTo(x2 + w2, y2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath();
      ctx.moveTo(x1 - w1, y1 - wallHeight1);
      ctx.lineTo(x1 + w1, y1 - wallHeight1);
      ctx.lineTo(x2 + w2, y2 - wallHeight2);
      ctx.lineTo(x2 - w2, y2 - wallHeight2);
      ctx.closePath();
      ctx.fill();
    }
  }

  drawPlayer();

  if (hud) {
    hud.render(speed, maxSpeed);
  }
}

let lastTime = 0;

function gameLoop(time) {
  const dt = Math.min((time - lastTime) / 1000, 0.1);
  lastTime = time;

  update(dt);
  draw();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);