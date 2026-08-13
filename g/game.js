const carSprite = new Image();
carSprite.src = "skyli.png";
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configurações da pista e física
const ROAD_WIDTH = 2000;
const SEGMENT_LENGTH = 200;
const CAM_DEPTH = 0.8;
const totalSegments = 500;

let speed = 0;
let maxSpeed = 12000;
let accel = 3000;
let decel = -4000;
let playerX = 0; // Posição lateral (-1 esquerda, 1 direita)
let position = 0; // Distância percorrida na pista

// Mapeamento de teclas
const keys = {};
window.addEventListener('keydown', (e) => (keys[e.key] = true));
window.addEventListener('keyup', (e) => (keys[e.key] = false));

// Atualização da física e controles
function update(dt) {
  // Aceleração / Freio
  if (keys['ArrowUp'] || keys['w']) speed += accel * dt;
  else if (keys['ArrowDown'] || keys['s']) speed += decel * dt;
  else speed += decel * 0.5 * dt;

  // Limite de velocidade
  speed = Math.max(0, Math.min(speed, maxSpeed));

  // Movimento lateral
  if (keys['ArrowLeft'] || keys['a']) playerX -= 1.5 * dt;
  if (keys['ArrowRight'] || keys['d']) playerX += 1.5 * dt;

  // Atualiza posição na pista
  position += speed * dt;
  const trackLength = totalSegments * SEGMENT_LENGTH;
  while (position >= trackLength) position -= trackLength;
}

// Projeção pseudo-3D e renderização
function draw() {
  // Céu
  ctx.fillStyle = '#0055aa';
  ctx.fillRect(0, 0, canvas.width, canvas.height / 2);

  // Grama de fundo
  ctx.fillStyle = '#008800';
  ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

  const startPos = Math.floor(position / SEGMENT_LENGTH);

  // Desenha os segmentos da pista de trás para frente
  for (let n = 0; n < 100; n++) {
    const segmentIndex = (startPos + n) % totalSegments;
    
    // Alturas projetadas na tela
    const z1 = n * SEGMENT_LENGTH - (position % SEGMENT_LENGTH);
    const z2 = (n + 1) * SEGMENT_LENGTH - (position % SEGMENT_LENGTH);

    if (z1 <= 0) continue;

    const scale1 = CAM_DEPTH / (z1 / 1000);
    const scale2 = CAM_DEPTH / (z2 / 1000);

    const x1 = canvas.width / 2;
    const y1 = canvas.height / 2 + (1 / z1) * 200000;
    const w1 = ROAD_WIDTH * scale1;

    const x2 = canvas.width / 2;
    const y2 = canvas.height / 2 + (1 / z2) * 200000;
    const w2 = ROAD_WIDTH * scale2;

    // Alterna cores da pista para dar efeito de movimento
    const isEven = segmentIndex % 2 === 0;
    const roadColor = isEven ? '#555555' : '#444444';
    const grassColor = isEven ? '#00aa00' : '#008800';

    // Desenha a grama nas laterais
    ctx.fillStyle = grassColor;
    ctx.fillRect(0, y2, canvas.width, y1 - y2);

    // Desenha a pista (Trapezóide)
    ctx.fillStyle = roadColor;
    ctx.beginPath();
    ctx.moveTo(x1 - w1, y1);
    ctx.lineTo(x1 + w1, y1);
    ctx.lineTo(x2 + w2, y2);
    ctx.lineTo(x2 - w2, y2);
    ctx.closePath();
    ctx.fill();

    // Faixa central amarela
    if (isEven) {
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.moveTo(x1 - w1 * 0.03, y1);
      ctx.lineTo(x1 + w1 * 0.03, y1);
      ctx.lineTo(x2 + w2 * 0.03, y2);
      ctx.lineTo(x2 - w2 * 0.03, y2);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Desenha o Carro do Jogador na base da tela
  const carX = canvas.width / 2 + playerX * (canvas.width / 3) - 40;
  const carY = canvas.height - 80;

  ctx.fillStyle = '#dd2222'; // Cor do carro (vermelho)
  ctx.fillRect(carX, carY, 80, 40);
  ctx.fillStyle = '#111111'; // Pneus/Janela
  ctx.fillRect(carX + 10, carY + 5, 60, 15);

  // Painel de Velocidade (HUD)
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px Arial';
  ctx.fillText(`Velocidade: ${Math.floor(speed / 100)} MPH`, 20, 40);
}

// Loop principal com delta time
let lastTime = performance.now();
function gameLoop(now) {
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  update(dt);
  draw();
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
