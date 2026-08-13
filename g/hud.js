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

  drawTurnWarning(segments) {
    if (!segments || segments.length < 30) return;

    let aheadCurve = 0;
    for (let i = 10; i < 40; i++) {
      if (segments[i] && Math.abs(segments[i].curve) > 1.2) {
        aheadCurve = segments[i].curve;
        break;
      }
    }

    if (Math.abs(aheadCurve) > 1.2) {
      const ctx = this.ctx;
      const x = this.canvas.width / 2;
      const y = this.canvas.height * 0.22;

      ctx.save();
      ctx.fillStyle = '#ffcc00';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;

      ctx.beginPath();
      ctx.moveTo(x, y - 35);
      ctx.lineTo(x + 35, y + 25);
      ctx.lineTo(x - 35, y + 25);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const arrow = aheadCurve > 0 ? '➔' : '⬅';
      ctx.fillText(arrow, x, y + 3);

      ctx.restore();
    }
  }

  drawMinimap(segments, playerX) {
    if (!segments || segments.length === 0) return;

    const ctx = this.ctx;
    const mapWidth = 140;
    const mapHeight = 160;
    const mapX = 30;
    const mapY = 30;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.fillRect(mapX, mapY, mapWidth, mapHeight);
    ctx.strokeRect(mapX, mapY, mapWidth, mapHeight);

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.beginPath();

    let curX = mapX + mapWidth / 2;
    let curY = mapY + mapHeight - 15;

    ctx.moveTo(curX, curY);

    const stepY = (mapHeight - 30) / 60;

    for (let i = 0; i < 60 && i < segments.length; i++) {
      curX += segments[i].curve * 2.5;
      curY -= stepY;
      ctx.lineTo(curX, curY);
    }
    ctx.stroke();

    const playerMapX = mapX + mapWidth / 2 + (playerX * 15);
    const playerMapY = mapY + mapHeight - 15;

    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(playerMapX, playerMapY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  render(speed, maxSpeed, dt = 0.016, segments = [], playerX = 0) {
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

    this.drawTurnWarning(segments);
    this.drawMinimap(segments, playerX);
  }
}