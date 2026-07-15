import { CLR, PARTICLE_COLS, PARTICLE_ROWS, MAX_DISP_PX } from "../constants/soundConstants";

// ─── Background & grid ────────────────────────────────────────────────────────
export function clearCanvas(ctx, W, H, isDark) {
  ctx.fillStyle = isDark ? "#060a10" : CLR.bg;
  ctx.fillRect(0, 0, W, H);
}

export function drawDotGrid(ctx, W, H) {
  const sp = 28;
  ctx.fillStyle = CLR.grid;
  for (let x = sp; x < W; x += sp)
    for (let y = sp; y < H; y += sp) {
      ctx.beginPath();
      ctx.arc(x, y, 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
}

// ─── Speaker / piston on left wall ───────────────────────────────────────────
export function drawSpeaker(ctx, H, tankTop, tankH, pistonX, amplitude, t) {
  const cx    = pistonX;
  const midY  = tankTop + tankH / 2;
  const spH   = tankH * 0.72;
  const wobble = amplitude * Math.sin(t * 8) * 3; // visual wobble

  // Back plate
  ctx.save();
  ctx.fillStyle   = CLR.speaker;
  ctx.strokeStyle = CLR.speakerEdge;
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.roundRect(cx - 18, midY - spH / 2, 18, spH, [0, 0, 4, 4]);
  ctx.fill(); ctx.stroke();

  // Cone
  const coneW = 10 + wobble;
  ctx.fillStyle = "#2d333b";
  ctx.beginPath();
  ctx.moveTo(cx, midY - spH * 0.38);
  ctx.lineTo(cx + coneW, midY - spH * 0.18);
  ctx.lineTo(cx + coneW, midY + spH * 0.18);
  ctx.lineTo(cx, midY + spH * 0.38);
  ctx.closePath();
  ctx.fill();

  // Dome
  ctx.fillStyle = "#58a6ff44";
  ctx.beginPath();
  ctx.arc(cx + coneW, midY, spH * 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ─── Right wall / boundary ────────────────────────────────────────────────────
export function drawWall(ctx, wallX, tankTop, tankH, isRigid) {
  ctx.save();
  if (isRigid) {
    ctx.fillStyle   = "#21262d";
    ctx.strokeStyle = "#8b949e";
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.rect(wallX, tankTop, 12, tankH);
    ctx.fill(); ctx.stroke();
    // Hatch marks
    ctx.strokeStyle = "rgba(139,148,158,0.3)";
    ctx.lineWidth   = 1;
    for (let y = tankTop; y < tankTop + tankH; y += 10) {
      ctx.beginPath();
      ctx.moveTo(wallX + 12, y);
      ctx.lineTo(wallX + 22, y + 10);
      ctx.stroke();
    }
  } else {
    // Foam — dark wavy fill
    ctx.fillStyle = "rgba(33,38,45,0.8)";
    ctx.beginPath();
    ctx.rect(wallX, tankTop, 14, tankH);
    ctx.fill();
    ctx.strokeStyle = "#30363d";
    ctx.lineWidth   = 1;
    for (let y = tankTop + 4; y < tankTop + tankH - 4; y += 6) {
      ctx.beginPath();
      ctx.moveTo(wallX + 2, y);
      ctx.quadraticCurveTo(wallX + 7, y + 3, wallX + 12, y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// ─── Tank border ─────────────────────────────────────────────────────────────
export function drawTankBorder(ctx, tankLeft, tankTop, tankW, tankH) {
  ctx.save();
  ctx.strokeStyle = CLR.border;
  ctx.lineWidth   = 1.5;
  ctx.strokeRect(tankLeft, tankTop, tankW, tankH);
  ctx.restore();
}

// ─── Particle grid ────────────────────────────────────────────────────────────
/**
 * Draws PARTICLE_COLS × PARTICLE_ROWS molecules inside the tank.
 * Each column x maps to a wave displacement y(x,t) which nudges the dots.
 * @param {Float32Array} dispArr  – per-column displacement (−1 to 1 normalised)
 */
export function drawParticles(ctx, tankLeft, tankTop, tankW, tankH, dispArr) {
  const colW   = tankW / PARTICLE_COLS;
  const rowH   = tankH / (PARTICLE_ROWS + 1);
  const radius = 2.2;

  ctx.save();
  for (let col = 0; col < PARTICLE_COLS; col++) {
    const disp     = dispArr[col];             // -1 to 1
    const dispPx   = disp * MAX_DISP_PX;
    const pressure = Math.abs(disp);           // 0-1 for colour blend
    const baseX    = tankLeft + (col + 0.5) * colW + dispPx;

    const alpha = 0.2 + pressure * 0.5;
    ctx.fillStyle = pressure > 0.55
      ? `rgba(0,229,255,${alpha})`
      : `rgba(240,246,252,${0.18 + pressure * 0.25})`;

    for (let row = 0; row < PARTICLE_ROWS; row++) {
      const baseY = tankTop + (row + 1) * rowH;
      // Small stagger per row for realism
      const stagger = ((row % 2) * 0.5 - 0.25) * colW;
      ctx.beginPath();
      ctx.arc(baseX + stagger, baseY, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// ─── Wave graph (bottom panel) ────────────────────────────────────────────────
/**
 * Draws the displacement vs distance sine trace.
 * @param {Float32Array} dispArr
 * @param {Float32Array|null} targetArr   – target silhouette for Mode 1
 * @param {Float32Array|null} noiseArr    – noise wave for Mode 2
 */
export function drawWaveGraph(ctx, gLeft, gTop, gW, gH, dispArr, targetArr, noiseArr) {
  const midY = gTop + gH / 2;

  // Background
  ctx.fillStyle = CLR.bg;
  ctx.fillRect(gLeft, gTop, gW, gH);

  // Centre axis
  ctx.save();
  ctx.strokeStyle = CLR.border;
  ctx.lineWidth   = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(gLeft, midY);
  ctx.lineTo(gLeft + gW, midY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Y-axis label
  ctx.fillStyle = CLR.muted;
  ctx.font      = "9px monospace";
  ctx.textAlign = "left";
  ctx.fillText("y", gLeft + 4, gTop + 12);
  ctx.fillText("0", gLeft + 4, midY + 3);
  ctx.textAlign = "right";
  ctx.fillText("x →", gLeft + gW - 4, gTop + 12);
  ctx.restore();

  const ampPx = (gH / 2) * 0.82;
  const step  = gW / (dispArr.length - 1);

  // Target silhouette (Mode 1 — dashed amber)
  if (targetArr) {
    ctx.save();
    ctx.strokeStyle = CLR.target;
    ctx.lineWidth   = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    for (let i = 0; i < targetArr.length; i++) {
      const px = gLeft + i * step;
      const py = midY - targetArr[i] * ampPx;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // Noise wave (Mode 2 — red)
  if (noiseArr) {
    ctx.save();
    ctx.strokeStyle = CLR.noise;
    ctx.lineWidth   = 1.5;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    for (let i = 0; i < noiseArr.length; i++) {
      const px = gLeft + i * step;
      const py = midY - noiseArr[i] * ampPx;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Live user wave — neon cyan with glow
  ctx.save();
  ctx.strokeStyle = CLR.wave;
  ctx.lineWidth   = 2.2;
  ctx.shadowColor = CLR.wave;
  ctx.shadowBlur  = 8;
  ctx.lineJoin    = "round";
  ctx.beginPath();
  for (let i = 0; i < dispArr.length; i++) {
    const px = gLeft + i * step;
    const py = midY - dispArr[i] * ampPx;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();

  // Graph border
  ctx.save();
  ctx.strokeStyle = CLR.border;
  ctx.lineWidth   = 1;
  ctx.strokeRect(gLeft, gTop, gW, gH);
  ctx.restore();
}

// ─── Graph axis labels ────────────────────────────────────────────────────────
export function drawGraphLabels(ctx, gLeft, gTop, gW, gH, wavelength, v) {
  ctx.save();
  ctx.fillStyle = CLR.muted;
  ctx.font      = "9px monospace";
  ctx.textAlign = "right";
  ctx.fillText(`λ = ${wavelength.toFixed(2)} m   v = ${v} m/s`, gLeft + gW - 6, gTop + gH - 5);
  ctx.restore();
}
