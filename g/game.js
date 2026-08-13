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

class CustomHUD {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.time = 0;
  }

  formatSpeed(speed, maxSpeed) {
    const kmh = Math.floor((speed / maxSpeed) * 240);
    return kmh.toString().padStart(3, '0');
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    const ms = Math.floor((seconds % 1) * 100).toString().padStart(2, '0');
    return `${mins}'${secs}"${ms}`;
  }

  getCurrentGear(speed, maxSpeed) {
    const ratio = speed / maxSpeed;
    if (ratio === 0) return 1;
    if (ratio < 0.18) return 1;
    if (ratio < 0.38) return 2;
    if (ratio < 0.58) return 3;
    if (ratio < 0.78) return 4;
    if (ratio < 0.92) return 5;
    return 6;
  }

  render(speed, maxSpeed, dt = 0.016) {
    this.time += dt;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.save();

    const fontRetro = 'bold 22px "Courier New", monospace';
    const fontDigits = 'bold 36px "Courier New", monospace';

    const topRightX = width - 230;
    const topRightY = 20;

    const rpmPercent = Math.min(1, speed / maxSpeed);
    const totalBlocks = 18;
    const activeBlocks = Math.floor(rpmPercent * totalBlocks);

    ctx.save();
    ctx.lineWidth = 10;
    for (let i = 0; i < totalBlocks; i++) {
      const angleStart = Math.PI * 1.1 + (i * 0.035);
      const angleEnd = angleStart + 0.025;

      if (i < activeBlocks) {
        ctx.strokeStyle = i > 12 ? '#ff2222' : '#00ff44';
      } else {
        ctx.strokeStyle = '#223322';
      }

      ctx.beginPath();
      ctx.arc(topRightX + 110, topRightY + 80, 100, angleStart, angleEnd);
      ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = '#0a0000';
    ctx.fillRect(topRightX + 20, topRightY + 25, 170, 50);
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 2;
    ctx.strokeRect(topRightX + 20, topRightY + 25, 170, 50);

    ctx.font = fontDigits;
    ctx.fillStyle = '#220000';
    ctx.textAlign = 'right';
    ctx.fillText('888', topRightX + 130, topRightY + 62);

    const speedStr = this.formatSpeed(speed, maxSpeed);
    ctx.fillStyle = '#ff0000';
    ctx.fillText(speedStr, topRightX + 130, topRightY + 62);

    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillText('km/h', topRightX + 185, topRightY + 60);

    ctx.font = fontRetro;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.fillText(this.formatTime(this.time), topRightX + 185, topRightY + 105);
    ctx.shadowBlur = 0;

    const fuelX = width - 40;
    const fuelY = height - 190;
    const fuelHeight = 130;

    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('F', fuelX + 6, fuelY - 8);
    ctx.fillText('E', fuelX + 6, fuelY + fuelHeight + 20);

    ctx.fillStyle = '#111111';
    ctx.fillRect(fuelX, fuelY, 12, fuelHeight);

    const fuelBlocks = 16;
    const blockH = (fuelHeight / fuelBlocks) - 2;

    for (let i = 0; i < fuelBlocks; i++) {
      const blockY = fuelY + fuelHeight - ((i + 1) * (blockH + 2));
      ctx.fillStyle = i < 3 ? '#ff2222' : (i < 8 ? '#ffff00' : '#00ff00');
      ctx.fillRect(fuelX + 1, blockY, 10, blockH);
    }

    const currentGear = this.getCurrentGear(speed, maxSpeed);

    ctx.font = 'bold 26px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;

    ctx.fillText(`AUTO : ${currentGear}`, 30, height - 30);
    ctx.shadowBlur = 0;
    
    ctx.restore();
  }
}

let hud = null;

const ROAD_WIDTH = 500;
const SEGMENT_LENGTH = 200;
const CAM_DEPTH = 0.8;
const VISIBLE_SEGMENTS = 300;

const segments = [];
let totalSegmentsGenerated = 0;
let pendingSegments = [];

function generateNextBlock() {
  const enterLength = 30;
  const leaveLength = 30;
  const holdLength = Math.floor(Math.random() * 60) + 20;
  
  const isStraight = Math.random() < 0.35;
  const targetCurve = isStraight ? 0 : (Math.random() * 6 - 3);
  const isTunnel = Math.random() < 0.15;
  const type = isTunnel ? 'tunnel' : 'normal';

  const total = enterLength + holdLength + leaveLength;

  for (let i = 0; i < total; i++) {
    let curve = 0;

    if (targetCurve === 0) {
      curve = 0;
    } else if (i < enterLength) {
      curve = targetCurve * (i / enterLength);
    } else if (i < enterLength + holdLength) {
      curve = targetCurve;
    } else {
      const progress = (i - enterLength - holdLength) / leaveLength;
      curve = targetCurve * (1 - progress);
    }

    const globalIndex = totalSegmentsGenerated++;
    const hasSign = (globalIndex % 40 === 0) && type !== 'tunnel';
    const signSide = globalIndex % 80 === 0 ? 'left' : 'right';

    pendingSegments.push({
      index: globalIndex,
      curve: curve,
      type: type,
      hasSign: hasSign,
      signSide: signSide
    });
  }
}

function getNextSegment() {
  if (pendingSegments.length === 0) {
    generateNextBlock();
  }
  return pendingSegments.shift();
}

for (let i = 0; i < VISIBLE_SEGMENTS; i++) {
  if (i < 60) {
    const globalIndex = totalSegmentsGenerated++;
    segments.push({
      index: globalIndex,
      curve: 0,
      type: 'normal',
      hasSign: globalIndex % 40 === 0,
      signSide: 'left'
    });
  } else {
    segments.push(getNextSegment());
  }
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

  while (position >= SEGMENT_LENGTH) {
    position -= SEGMENT_LENGTH;
    segments.shift();
    segments.push(getNextSegment());
  }

  const currentCurve = segments[0].curve;
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

function drawPlayer(bottomRoadWidth) {
  const carWidth = bottomRoadWidth * 0.45; 
  const carHeight = carWidth * 0.55; 

  const carX = canvas.width / 2 + (playerX * bottomRoadWidth * 0.8) - (carWidth / 2);
  const carY = canvas.height - carHeight - 15;

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

function draw(dt) {
  if (gameState === 'menu') {
    drawMenu();
    return;
  }

  drawBackground();

  const percent = position / SEGMENT_LENGTH;
  let camX = -segments[0].curve * percent;
  const horizonY = canvas.height * 0.4;
  let bottomRoadWidth = ROAD_WIDTH;

  for (let n = 0; n < 100 && n < segments.length; n++) {
    const segment = segments[n];

    const z1 = n * SEGMENT_LENGTH - position;
    const z2 = (n + 1) * SEGMENT_LENGTH - position;

    if (z1 <= 0) continue;

    camX += segment.curve;

    const scale1 = CAM_DEPTH / (z1 / 1000);
    const scale2 = CAM_DEPTH / (z2 / 1000);

    const x1 = canvas.width / 2 - (camX - segment.curve) * scale1 * 20;
    const y1 = horizonY + (1 / z1) * 120000;
    const w1 = ROAD_WIDTH * scale1;

    const x2 = canvas.width / 2 - camX * scale2 * 20;
    const y2 = horizonY + (1 / z2) * 120000;
    const w2 = ROAD_WIDTH * scale2;

    if (n === 0) {
      bottomRoadWidth = w1;
    }

    const isEven = segment.index % 2 === 0;
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
      ctx.moveTo(x1 - w1 * 0.02, y1);
      ctx.lineTo(x1 + w1 * 0.02, y1);
      ctx.lineTo(x2 + w2 * 0.02, y2);
      ctx.lineTo(x2 - w2 * 0.02, y2);
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

  drawPlayer(bottomRoadWidth);

  if (!hud) {
    hud = new CustomHUD(canvas, ctx);
  }
  hud.render(speed, maxSpeed, dt);
}

let lastTime = 0;

function gameLoop(time) {
  const dt = Math.min((time - lastTime) / 1000, 0.1);
  lastTime = time;

  update(dt);
  draw(dt);

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);