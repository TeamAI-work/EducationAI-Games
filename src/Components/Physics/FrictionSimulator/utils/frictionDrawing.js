import { CLR, BLOCK_SIZE, RAMP_ORIGIN_PAD_X, RAMP_ORIGIN_PAD_Y, RAMP_LENGTH } from "../constants/frictionConstants";

// ─── Geometry helpers ─────────────────────────────────────────────────────────

/**
 * Compute the three key screen-space points of the ramp triangle.
 *
 * The ramp is drawn as a right-angle triangle:
 *   origin  – bottom-left corner (ground level, left side)
 *   tip     – top of the slope (where the hypotenuse meets the vertical leg)
 *   base    – bottom-right corner directly below tip (ground level)
 *
 * @returns {{ origin, tip, base, rampLen, cosA, sinA }}
 */
export function getRampGeometry(W, H, angleDeg) {
  const rad    = (angleDeg * Math.PI) / 180;
  const cosA   = Math.cos(rad);
  const sinA   = Math.sin(rad);
  const rampLen = Math.min(W, H) * RAMP_LENGTH;   // hypotenuse length in px

  const origin = { x: W * RAMP_ORIGIN_PAD_X, y: H * RAMP_ORIGIN_PAD_Y };
  const tip    = { x: origin.x + rampLen * cosA,  y: origin.y - rampLen * sinA };
  const base   = { x: tip.x,                       y: origin.y };

  return { origin, tip, base, rampLen, cosA, sinA, rad };
}

/**
 * Given a distance `d` along the ramp from the TOP (tip), return the
 * screen-space centre of the block sitting on the surface at that position.
 *
 *  d = 0  → block centre is at the tip
 *  d = rampLen - BLOCK_SIZE/2 → block is at the bottom of the ramp
 *
 * The block is a square; its centre sits BLOCK_SIZE/2 above (perpendicular to)
 * the ramp surface so it appears to rest on it.
 */
export function blockCentre(tip, cosA, sinA, rampLen, d) {
  // Position along the ramp surface from the tip
  const along = Math.min(d, rampLen - BLOCK_SIZE * 0.5);
  // Surface point (on the hypotenuse)
  const sx = tip.x - along * cosA;        // moving toward origin
  const sy = tip.y + along * sinA;
  // Lift perpendicular to surface by half block size
  const px = sx - (BLOCK_SIZE / 2) * sinA;  // perpendicular = rotate (cosA,sinA) by 90°
  const py = sy - (BLOCK_SIZE / 2) * cosA;
  return { x: px, y: py };
}

// ─── Clear & background ───────────────────────────────────────────────────────
export function clearCanvas(ctx, W, H) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = CLR.bg;
  ctx.fillRect(0, 0, W, H);
}

// ─── Subtle dot-grid ──────────────────────────────────────────────────────────
export function drawDotGrid(ctx, W, H) {
  const spacing = 30;
  ctx.save();
  ctx.fillStyle = CLR.grid;
  for (let x = spacing; x < W; x += spacing) {
    for (let y = spacing; y < H; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// ─── Ground line ──────────────────────────────────────────────────────────────
export function drawGround(ctx, W, H) {
  const y = H * RAMP_ORIGIN_PAD_Y;
  ctx.save();
  ctx.strokeStyle = CLR.rampEdge;
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(W, y);
  ctx.stroke();

  // Hatch marks below to suggest solid ground
  ctx.strokeStyle = "rgba(48,54,61,0.45)";
  ctx.lineWidth   = 1;
  const hatchStep = 18;
  for (let x = 0; x < W; x += hatchStep) {
    ctx.beginPath();
    ctx.moveTo(x,      y);
    ctx.lineTo(x - 10, y + 10);
    ctx.stroke();
  }
  ctx.restore();
}

// ─── Ramp triangle ────────────────────────────────────────────────────────────
export function drawRamp(ctx, origin, tip, base) {
  ctx.save();

  // Filled triangle
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(tip.x,    tip.y);
  ctx.lineTo(base.x,   base.y);
  ctx.closePath();
  ctx.fillStyle = CLR.ramp;
  ctx.fill();

  // Hypotenuse (slope surface)
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(tip.x,    tip.y);
  ctx.strokeStyle = CLR.rampEdge;
  ctx.lineWidth   = 2.5;
  ctx.stroke();

  // Vertical leg
  ctx.beginPath();
  ctx.moveTo(tip.x,  tip.y);
  ctx.lineTo(base.x, base.y);
  ctx.strokeStyle = CLR.rampEdge;
  ctx.lineWidth   = 1.5;
  ctx.stroke();

  ctx.restore();
}

// ─── Angle arc label ─────────────────────────────────────────────────────────
export function drawAngleArc(ctx, origin, rad, angleDeg) {
  if (angleDeg < 2) return;
  const arcR = 36;
  ctx.save();
  ctx.strokeStyle = CLR.accent;
  ctx.lineWidth   = 1.2;
  // Arc from 0 (rightward) sweeping upward by rad
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, arcR, -rad, 0, false);
  ctx.stroke();

  // Label
  const midAngle = -rad / 2;
  const lx = origin.x + (arcR + 14) * Math.cos(midAngle);
  const ly = origin.y + (arcR + 14) * Math.sin(midAngle);
  ctx.fillStyle = CLR.accent;
  ctx.font      = "bold 11px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`${angleDeg}°`, lx, ly);
  ctx.restore();
}

// ─── Block ────────────────────────────────────────────────────────────────────
export function drawBlock(ctx, cx, cy, rad, isMoving) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-rad);   // rotate so block face is parallel to slope

  const half = BLOCK_SIZE / 2;

  // Shadow / glow
  ctx.shadowColor = isMoving ? CLR.block : "rgba(88,166,255,0.3)";
  ctx.shadowBlur  = isMoving ? 14 : 6;

  // Fill
  const grad = ctx.createLinearGradient(-half, -half, half, half);
  grad.addColorStop(0, isMoving ? "#79b8ff" : "#58a6ff");
  grad.addColorStop(1, isMoving ? "#1a6fb0" : "#0d4080");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(-half, -half, BLOCK_SIZE, BLOCK_SIZE, 4);
  ctx.fill();

  // Border
  ctx.strokeStyle = CLR.blockEdge;
  ctx.lineWidth   = 1.5;
  ctx.shadowBlur  = 0;
  ctx.stroke();

  // Centre dot
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ─── Arrow helper (screen-space) ─────────────────────────────────────────────
function drawArrow(ctx, fx, fy, tx, ty, color, lineWidth = 2, label = "") {
  const headLen = 10;
  const angle   = Math.atan2(ty - fy, tx - fx);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle   = color;
  ctx.lineWidth   = lineWidth;
  ctx.shadowColor = color;
  ctx.shadowBlur  = 6;
  ctx.lineCap     = "round";

  ctx.beginPath();
  ctx.moveTo(fx, fy);
  ctx.lineTo(tx, ty);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx - headLen * Math.cos(angle - Math.PI / 6), ty - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(tx - headLen * Math.cos(angle + Math.PI / 6), ty - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();

  if (label) {
    ctx.shadowBlur  = 0;
    ctx.font        = "bold 10px monospace";
    ctx.textAlign   = "center";
    const lx = tx + 14 * Math.cos(angle);
    const ly = ty + 14 * Math.sin(angle);
    ctx.fillText(label, lx, ly);
  }

  ctx.restore();
}

// ─── Force vectors ────────────────────────────────────────────────────────────
const VEC_SCALE = 0.6; // px per Newton

/**
 * Draw the three force vectors from the block centre:
 *   1. Gravity   — straight down
 *   2. Normal    — perpendicular to slope (pointing away from surface)
 *   3. Friction  — along slope opposing motion (up the slope when moving)
 */
export function drawForceVectors(ctx, cx, cy, rad, cosA, sinA, forces, showVectors) {
  if (!showVectors) return;

  const { fGravity, fNormal, fFriction } = forces;

  // 1. Gravity — straight down
  const gLen = fGravity * VEC_SCALE;
  drawArrow(ctx, cx, cy, cx, cy + gLen, CLR.gravity, 2.2, `${fGravity.toFixed(1)}N`);

  // 2. Normal — perpendicular to slope surface (rotated 90° from slope direction)
  //    Slope direction unit vector along surface: (-cosA, sinA) going uphill
  //    Normal (pointing away from surface = up-left): (-sinA, -cosA)
  const nLen = fNormal * VEC_SCALE;
  const nTx  = cx + nLen * (-sinA);
  const nTy  = cy + nLen * (-cosA);
  drawArrow(ctx, cx, cy, nTx, nTy, CLR.normal, 2.2, `${fNormal.toFixed(1)}N`);

  // 3. Friction — along slope, pointing uphill (opposing downhill slide)
  if (fFriction > 0.01) {
    const fLen = fFriction * VEC_SCALE;
    // Up-slope unit vector: (cosA, -sinA) ... wait, let's be precise:
    // Down-slope = (cosA goes right, -sinA goes up-right for positive angle) 
    // Actually origin is bottom-left, tip is top-right, so:
    // up-slope direction from block = toward tip = (-cosA from origin perspective, sinA)
    // Let's use: uphill direction = (-cosA, sinA) in screen space
    // No: slope goes from origin(bottom-left) to tip(top-right).
    // Screen: right = +x, down = +y.
    // Hypotenuse direction from origin to tip = (cosA, -sinA).
    // So up-slope (toward tip) = (-cosA, +sinA) wait ... 
    // tip.x = origin.x + rampLen*cosA  → direction (cosA, -sinA) in screen coords
    // uphill (origin → tip) = (cosA, -sinA)
    // friction opposes motion (block slides down), so friction points uphill:
    const fTx = cx + fLen * cosA;
    const fTy = cy + fLen * (-sinA);
    drawArrow(ctx, cx, cy, fTx, fTy, CLR.friction, 2.2, `${fFriction.toFixed(1)}N`);
  }
}

// ─── "Critical slip angle" dashed guide line ──────────────────────────────────
export function drawSlipAngleLine(ctx, origin, W, slipAngleDeg, currentAngleDeg) {
  if (slipAngleDeg <= 0 || slipAngleDeg > 89) return;
  const r       = (slipAngleDeg * Math.PI) / 180;
  const len     = (W - origin.x) * 0.9;
  const tx      = origin.x + len * Math.cos(r);
  const ty      = origin.y - len * Math.sin(r);
  const isPast  = currentAngleDeg >= slipAngleDeg;

  ctx.save();
  ctx.strokeStyle = isPast ? "rgba(244,112,103,0.5)" : "rgba(227,179,65,0.4)";
  ctx.lineWidth   = 1;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(tx, ty);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = isPast ? CLR.gravity : CLR.friction;
  ctx.font      = "9px monospace";
  ctx.textAlign = "left";
  ctx.fillText(`slip: ${slipAngleDeg.toFixed(1)}°`, tx - 44, ty - 6);
  ctx.restore();
}

// ─── "At rest" static friction indicator bar ─────────────────────────────────
export function drawFrictionUtilBar(ctx, W, H, ratio) {
  // Horizontal bar at the top showing how close to static limit we are
  const barW  = 160;
  const barH  = 6;
  const bx    = W - barW - 12;
  const by    = 12;
  const fill  = Math.min(ratio, 1);
  const color = fill >= 1 ? CLR.gravity : fill > 0.75 ? CLR.friction : CLR.normal;

  ctx.save();
  // Track
  ctx.fillStyle   = CLR.border;
  ctx.beginPath();
  ctx.roundRect(bx, by, barW, barH, 3);
  ctx.fill();
  // Fill
  if (fill > 0) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(bx, by, barW * fill, barH, 3);
    ctx.fill();
  }
  // Label
  ctx.fillStyle = CLR.muted;
  ctx.font      = "9px monospace";
  ctx.textAlign = "right";
  ctx.fillText("static friction limit", bx - 6, by + barH - 1);
  ctx.restore();
}
