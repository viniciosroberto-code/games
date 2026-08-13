class HUD {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.time = 0; // Tempo de corrida acumulado
  }

  // Converte a velocidade do jogo para km/h (0 a 240)
  formatSpeed(speed, maxSpeed) {
    const kmh = Math.floor((speed / maxSpeed) * 240);
    return kmh.toString().padStart(3, '0');
  }

  // Formata o cronômetro no estilo retro: 00'00"00
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    const ms = Math.floor((seconds % 1) * 100).toString().padStart(2, '0');
    return `${mins}'${secs}"${ms}`;
  }

  // Lógica de cálculo da marcha automática de 1 a 6
  getCurrentGear(speed, maxSpeed) {
    const ratio = speed / maxSpeed;
    if (ratio === 0) return 1;
    if (ratio < 0.20) return 1;
    if (ratio < 0.40) return 2;
    if (ratio < 0.60) return 3;
    if (ratio < 0.80) return 4;
    if (ratio < 0.95) return 5;
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

    // ==========================================
    // 1. CANTO SUPERIOR DIREITO: VELOCÍMETRO & RPM
    // ==========================================
    const topRightX = width - 220;
    const topRightY = 20;

    // --- BARRA ARQUEADA DE RPM ---
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

    // --- PAINEL DIGITAL (Display LED) ---
    ctx.fillStyle = '#0a0000';
    ctx.fillRect(topRightX + 20, topRightY + 25, 170, 50);
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 2;
    ctx.strokeRect(topRightX + 20, topRightY + 25, 170, 50);

    // Efeito de números apagados ao fundo ("888")
    ctx.font = fontDigits;
    ctx.fillStyle = '#220000';
    ctx.textAlign = 'right';
    ctx.fillText('888', topRightX + 130, topRightY + 62);

    // Velocidade em LED Vermelho
    const speedStr = this.formatSpeed(speed, maxSpeed);
    ctx.fillStyle = '#ff0000';
    ctx.fillText(speedStr, topRightX + 130, topRightY + 62);

    // Unidade "km/h"
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillText('km/h', topRightX + 180, topRightY + 60);

    // --- CRONÔMETRO ---
    ctx.font = fontRetro;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.fillText(this.formatTime(this.time), topRightX + 185, topRightY + 105);
    ctx.shadowBlur = 0;


    // ==========================================
    // 2. CANTO INFERIOR DIREITO: COMBUSTÍVEL (F / E)
    // ==========================================
    const fuelX = width - 35;
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

    // Posição no canto inferior direito
    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText('12TH', width - 60, height - 25);


    // ==========================================
    // 3. CANTO INFERIOR ESQUERDO: APENAS MARCHA AUTOMÁTICA
    // ==========================================
    const currentGear = this.getCurrentGear(speed, maxSpeed);

    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;

    // Exibe apenas AUTO : X (variando de 1 a 6)
    ctx.fillText(`AUTO : ${currentGear}`, 30, height - 30);
    ctx.shadowBlur = 0;


    // ==========================================
    // 4. POSIÇÃO CENTRAL
    // ==========================================
    ctx.font = 'bold 32px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 6;
    ctx.fillText('12TH', width / 2, height * 0.35);
    ctx.shadowBlur = 0;

    ctx.restore();
  }
}