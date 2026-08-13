class HUD {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  render(speed, maxSpeed) {
    const ctx = this.ctx;
    
    const baseX = this.canvas.width - 220;
    const baseY = this.canvas.height - 220;

    ctx.save();

    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'right';

    const rpmRatio = Math.min(speed / maxSpeed, 1);
    const totalBars = 12;
    const activeBars = Math.floor(rpmRatio * totalBars);

    for (let i = 0; i < totalBars; i++) {
      const angle = -Math.PI * 0.8 + (i * 0.08);
      const radius = 130;
      const x = baseX + Math.cos(angle) * radius + 80;
      const y = baseY + Math.sin(angle) * radius + 110;

      if (i < activeBars) {
        if (i < 7) ctx.fillStyle = '#00ff00';
        else if (i < 10) ctx.fillStyle = '#ff9900';
        else ctx.fillStyle = '#ff0000';
      } else {
        ctx.fillStyle = '#222222';
      }

      ctx.fillRect(x, y, 10, 16);
    }

    const displaySpeed = Math.floor((speed / maxSpeed) * 180);

    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(displaySpeed.toString().padStart(3, ' '), baseX + 130, baseY + 60);

    ctx.font = 'bold 16px monospace';
    ctx.fillText('MPH', baseX + 130, baseY + 80);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('AUTO', baseX + 110, baseY + 105);

    let gear = '1';
    if (speed === 0) gear = '1';
    else if (displaySpeed < 40) gear = '1';
    else if (displaySpeed < 80) gear = '2';
    else if (displaySpeed < 130) gear = '3';
    else gear = '4';

    const gears = ['R', '1', '2', '3', '4'];
    let gearX = baseX + 30;
    gears.forEach((g) => {
      if (g === gear) {
        ctx.fillStyle = '#ff9900';
      } else {
        ctx.fillStyle = '#666666';
      }
      ctx.fillText(g, gearX, baseY + 125);
      gearX += 20;
    });

    const carX = baseX + 40;
    const carY = baseY + 135;

    ctx.fillStyle = '#00ff00';
    ctx.fillRect(carX, carY, 60, 30);
    ctx.fillStyle = '#000000';
    ctx.fillRect(carX + 15, carY + 5, 30, 20);
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(carX + 20, carY + 8, 10, 14);

    const fuelY = baseY + 180;
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('E', baseX - 10, fuelY + 12);

    ctx.fillStyle = '#00ff00';
    ctx.fillText('F', baseX + 150, fuelY + 12);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(baseX, fuelY, 130, 14);

    ctx.fillStyle = '#ff9900';
    ctx.fillRect(baseX + 2, fuelY + 2, 126, 10);

    ctx.restore();
  }
}