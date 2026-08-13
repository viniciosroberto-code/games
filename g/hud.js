class HUD {
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

  drawMinimap(ctx, x, y) {
    ctx.save();
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(x + 20, y + 160);
    ctx.lineTo(x + 20, y + 70);
    ctx.bezierCurveTo(x + 20, y + 20, x + 70, y + 20, x + 80, y + 50);
    ctx.bezierCurveTo(x + 90, y + 80, x + 110, y + 110, x + 130, y + 80);
    ctx.bezierCurveTo(x + 150, y + 60, x + 120, y + 20, x + 160, y + 20);
    ctx.bezierCurveTo(x + 200, y + 20, x + 210, y + 80, x + 190, y + 130);
    ctx.bezierCurveTo(x + 180, y + 170, x + 130, y + 180, x + 110, y + 150);
    ctx.bezierCurveTo(x + 90, y + 120, x + 70, y + 180, x + 20, y + 160);
    ctx.closePath();
    ctx.stroke();

    const progress = (this.time * 0.05) % 1;
    const dotAngle = progress * Math.PI * 2;
    const dotX = x + 110 + Math.cos(dotAngle) * 55;
    const dotY = y + 100 + Math.sin(dotAngle) * 55;

    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(dotX, dotY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  }

  render(speed, maxSpeed, dt = 0.016) {
    this.time += dt;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.save();

    const fontRetro = 'bold 36px "Courier New", monospace';
    const fontDigits = 'bold 60px "Courier New", monospace';

    this.drawMinimap(ctx, 40, 30);

    const topRightX = width - 400;
    const topRightY = 30;

    const rpmPercent = Math.min(1, speed / maxSpeed);
    const totalBlocks = 18;
    const activeBlocks = Math.floor(rpmPercent * totalBlocks);

    ctx.save();
    ctx.lineWidth = 18;
    for (let i = 0; i < totalBlocks; i++) {
      const angleStart = Math.PI * 1.1 + (i * 0.035);
      const angleEnd = angleStart + 0.025;

      if (i < activeBlocks) {
        ctx.strokeStyle = i > 12 ? '#ff2222' : '#00ff44';
      } else {
        ctx.strokeStyle = '#223322';
      }

      ctx.beginPath();
      ctx.arc(topRightX + 200, topRightY + 130, 170, angleStart, angleEnd);
      ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = '#0a0000';
    ctx.fillRect(topRightX + 40, topRightY + 40, 280, 85);
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 4;
    ctx.strokeRect(topRightX + 40, topRightY + 40, 280, 85);

    ctx.font = fontDigits;
    ctx.fillStyle = '#220000';
    ctx.textAlign = 'right';
    ctx.fillText('888', topRightX + 220, topRightY + 105);

    const speedStr = this.formatSpeed(speed, maxSpeed);
    ctx.fillStyle = '#ff0000';
    ctx.fillText(speedStr, topRightX + 220, topRightY + 105);

    ctx.font = 'bold 26px "Courier New", monospace';
    ctx.fillText('km/h', topRightX + 305, topRightY + 100);

    ctx.font = fontRetro;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 6;
    ctx.fillText(this.formatTime(this.time), topRightX + 310, topRightY + 175);
    ctx.shadowBlur = 0;

    const fuelX = width - 60;
    const fuelY = height - 320;
    const fuelHeight = 220;

    ctx.font = 'bold 30px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('F', fuelX + 11, fuelY - 15);
    ctx.fillText('E', fuelX + 11, fuelY + fuelHeight + 35);

    ctx.fillStyle = '#111111';
    ctx.fillRect(fuelX, fuelY, 22, fuelHeight);

    const fuelBlocks = 16;
    const blockH = (fuelHeight / fuelBlocks) - 4;

    for (let i = 0; i < fuelBlocks; i++) {
      const blockY = fuelY + fuelHeight - ((i + 1) * (blockH + 4));
      ctx.fillStyle = i < 3 ? '#ff2222' : (i < 8 ? '#ffff00' : '#00ff00');
      ctx.fillRect(fuelX + 2, blockY, 18, blockH);
    }

    const currentGear = this.getCurrentGear(speed, maxSpeed);

    ctx.font = 'bold 44px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 6;

    ctx.fillText(`AUTO : ${currentGear}`, 50, height - 50);
    ctx.shadowBlur = 0;

    ctx.restore();
  }
}