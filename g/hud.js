class HUD {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  render(speed, maxSpeed) {
    const ctx = this.ctx;
    
    const width = 240;
    const height = 200;
    const baseX = this.canvas.width - width - 20;
    const baseY = this.canvas.height - height - 20;

    ctx.save();

    const rpmRatio = Math.min(speed / maxSpeed, 1);
    const totalBars = 12;
    const activeBars = Math.floor(rpmRatio * totalBars);

    for (let i = 0; i < totalBars; i++) {
      const angle = -Math.PI * 0.75 + (i * 0.08);
      const radius = 110;
      const x = baseX + 120 + Math.cos(angle) * radius;
      const y = baseY + 120 + Math.sin(angle) * radius;

      if (i < activeBars) {
        if (i < 7) ctx.fillStyle = '#00ff00';
        else if (i < 10) ctx.fillStyle = '#ff9900';
        else ctx.fillStyle = '#ff0000';
      } else {
        ctx.fillStyle = '#222222';
      }

      ctx.fillRect(x, y, 8, 14);
    }

    const displaySpeed = Math.floor((speed / maxSpeed) * 180);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 32px monospace';
    ctx.fillText(displaySpeed.toString().padStart(3, '0'), baseX + 190, baseY + 50);

    ctx.font = 'bold 14px monospace';
    ctx.fillText('MPH', baseX + 190, baseY + 68);

    ctx.fillText('AUTO', baseX + 190, baseY + 90);

    let gear = '1';
    if (speed === 0) gear = '1';
    else if (displaySpeed < 40) gear = '1';
    else if (displaySpeed < 80) gear = '2';
    else if (displaySpeed < 130) gear = '3';
    else gear = '4';

    const gears = ['R', '1', '2', '3', '4'];
    let gearX = baseX + 40;
    ctx.textAlign = 'center';
    gears.forEach((g) => {
      if (g === gear) {
        ctx.fillStyle = '#ff9900';
      } else {
        ctx.fillStyle = '#555555';
      }
      ctx.font = 'bold 14px monospace';
      ctx.fillText(g, gearX, baseY + 112);
      gearX += 18;
    });

    const carX = baseX + 40;
    const carY = baseY + 122;

    ctx.fillStyle = '#00ff00';
    ctx.fillRect(carX, carY, 50, 24);
    ctx.fillStyle = '#000000';
    ctx.fillRect(carX + 12, carY + 4, 25, 16);
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(carX + 16, carY + 6, 8, 12);

    const fuelY = baseY + 165;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('E', baseX + 20, fuelY + 10);

    ctx.fillStyle = '#00ff00';
    ctx.fillText('F', baseX + 185, fuelY + 10);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(baseX + 35, fuelY, 145, 12);

    ctx.fillStyle = '#ff9900';
    ctx.fillRect(baseX + 37, fuelY + 2, 141, 8);

    ctx.restore();
  }
}