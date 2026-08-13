const carSprite = new Image();
carSprite.src = "skyli.png";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ROAD_WIDTH = 1200;
const SEGMENT_LENGTH = 200;
const CAM_DEPTH = 0.5;
const totalSegments = 500;

let speed = 0;
let maxSpeed = 12000;
let accel = 3000;
let decel = -4000;
let playerX = 0;
let position = 0;

const keys = {};
window.addEventListener('keydown', (e) => (keys[e.key] = true));
window.addEventListener('keyup', (e) => (keys[e.key] = false));

function update(dt) {
  if (keys['ArrowUp'] || keys['w']) speed += accel * dt;
  else if (keys['ArrowDown'] || keys['s']) speed += decel * dt;
  else speed += decel * 0.5 * dt;

  speed = Math.max(0, Math.min(speed, maxSpeed));

  if (keys['ArrowLeft'] || keys['a']) playerX -= 1.5 * dt;
  if (keys['ArrowRight'] || keys['d']) playerX += 1.5 * dt;

  position += speed * dt;
  const trackLength = totalSegments * SEGMENT_LENGTH;
  while (position >= trackLength) position -= trackLength;
}

function draw() {
  ctx.fillStyle = '#0055aa';
  ctx.fillRect(0, 0, canvas.width, canvas.height * 0.4);

  ctx.fillStyle = '#008800';
  ctx.fillRect(0, canvas.height * 0.4, canvas.width, canvas.height * 0.6);

  const startPos = Math.floor(position / SEGMENT_LENGTH);

  for (let n = 0; n < 120; n++) {
    const segmentIndex = (startPos + n) % totalSegments;
    
    const z1 = n * SEGMENT_LENGTH - (position % SEGMENT_LENGTH);
    const z2 = (n + 1) * SEGMENT_LENGTH - (position % SEGMENT_LENGTH);

    if (z1 <= 0) continue;

    const scale1 = CAM_DEPTH / (z1 / 1000);
    const scale2 = CAM_DEPTH / (z2 / 1000);

    const x1 = canvas.width / 2;
    const y1 = canvas.height * 0.4 + (1 / z1) * 120000;
    const w1 = ROAD_WIDTH * scale1;

    const x2 = canvas.width / 2;
    const y2 = canvas.height * 0.4 + (1 / z2) * 120000;
    const w2 = ROAD_WIDTH * scale2;

    const isEven = segmentIndex % 2 === 0;
    const roadColor = isEven ? '#666666' : '#555555';
    const grassColor = isEven ? '#00aa00' : '#008800';

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

    if (isEven) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(x1 - w1 * 0.015, y1);
      ctx.lineTo(x1 + w1 * 0.015, y1);
      ctx.lineTo(x2 + w2 * 0.015, y2);
      ctx.lineTo(x2 - w2 * 0.015, y2);
      ctx.closePath();
      ctx.fill();
    }
  }

  const carWidth = 260;
  const carHeight = 110;

  const carX = canvas.width / 2 + playerX * (canvas.width * 0.45) - (carWidth / 2);
  const carY = canvas.height - carHeight - 10;

  ctx.drawImage(carSprite, carX, carY, carWidth, carHeight);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Arial';
  ctx.fillText(`Velocidade: ${Math.floor(speed / 100)} MPH`, 20, 40);
}

let lastTime = performance.now();
function gameLoop(now) {
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  update(dt);
  draw();
  requestAnimationFrame(gameLoop);
}

carSprite.onload = () => {
  requestAnimationFrame(gameLoop);
};