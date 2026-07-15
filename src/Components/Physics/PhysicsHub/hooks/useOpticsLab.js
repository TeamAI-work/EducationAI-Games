import { useRef, useState, useEffect, useCallback } from "react";
import { COMPONENTS, EYE_DEFECTS, OPTIC_MODES } from "../constants/opticsConstants";
import {
  clearOptics, drawOpticsGrid, drawAxis, drawOpticElement,
  drawObject, drawImage, drawRays, drawOpticsTelemetry,
  drawEye, drawEyeRays, drawCorrectionLens,
  calcEyeConvergence, drawReflectRefract,
} from "../utils/opticsDrawing";

// ─── Mirror / Lens formula (New Cartesian Sign Convention) ───────────────────
function calcImage(type, focalPx, uPx) {
  const isMirror = type.includes("mirror");
  const isConcave = type.includes("concave");

  const u = -Math.abs(uPx);

  const fSigned = isConcave ? -Math.abs(focalPx) : Math.abs(focalPx);

  let vPx;
  if (isMirror) {
    vPx = 1 / (1 / fSigned - 1 / u);
  } else {
    vPx = 1 / (1 / fSigned + 1 / u);
  }

  const m = isMirror ? -vPx / u : vPx / u;
  const real = isMirror ? vPx < 0 : vPx > 0;
  const erect = m > 0;
  const atInfinity = !isFinite(vPx) || Math.abs(vPx) > 1e6;

  return { vPx, m, real, erect, atInfinity };
}

function isDivergingType(type) {
  return type === COMPONENTS.CONCAVE_LENS || type === COMPONENTS.CONVEX_MIRROR;
}

function clampObjDist(type, fPx, dist) {
  const minGap = 20;
  if (isDivergingType(type)) {
    return Math.max(minGap, dist);
  }
  return Math.max(Math.abs(fPx) * 1.05, dist);
}

function imageNature(real, erect, atInfinity) {
  if (atInfinity) return "At infinity";
  if (real && !erect) return "Real & Inverted";
  if (real && erect) return "Real & Erect";
  if (!real && erect) return "Virtual & Erect";
  return "Virtual & Inverted";
}

export function useOpticsLab({ canvasRef, canvasSize, active }) {
  const rafRef = useRef(null);

  const modeRef = useRef(OPTIC_MODES.BENCH);
  const componentRef = useRef(COMPONENTS.CONCAVE_LENS);
  const focalLenRef = useRef(120);
  const objDistRef = useRef(280);
  const objHeightRef = useRef(60);
  const defectRef = useRef(EYE_DEFECTS.MYOPIA);
  const corrTypeRef = useRef(null);
  const corrDioptRef = useRef(2.0);
  const corrActiveRef = useRef(false);

  const n1Ref = useRef(1.00);
  const n2Ref = useRef(1.50);
  const incidenceAngleRef = useRef(45);
  const showProtractorRef = useRef(true);

  const draggingRef = useRef(false);

  const sizeRef = useRef(canvasSize);
  useEffect(() => { sizeRef.current = canvasSize; }, [canvasSize]);

  const [telemetry, setTelemetry] = useState({
    u: 280, v: 0, f: 120, m: 0, real: true, erect: false,
    atInfinity: false, nature: "Real & Inverted", onRetina: false,
  });

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;

    clearOptics(ctx, W, H);
    drawOpticsGrid(ctx, W, H);

    const mode = modeRef.current;

    if (mode === OPTIC_MODES.BENCH) {
      drawAxis(ctx, W, H);
      const lensX = W / 2;
      const fPx = focalLenRef.current;
      const type = componentRef.current;
      const uPx = clampObjDist(type, fPx, objDistRef.current);
      const objX = lensX - uPx;
      const objH = objHeightRef.current;

      drawOpticElement(ctx, W, H, type, fPx, lensX);
      drawObject(ctx, objX, H, objH);

      const { vPx, m, real, erect, atInfinity } = calcImage(type, fPx, uPx);

      if (!atInfinity) {
        const imgX = lensX + vPx;
        const imgH = objH * Math.abs(m) * (erect ? 1 : -1);
        drawRays(ctx, W, H, type, lensX, fPx, objX, objH, imgX, imgH, real);
        drawImage(ctx, imgX, H, imgH, real, !real);
      } else {
        drawRays(ctx, W, H, type, lensX, fPx, objX, objH, NaN, NaN, false);
      }

      drawOpticsTelemetry(ctx, W, H, {
        u: uPx, v: vPx, f: fPx, m, real, erect, atInfinity,
        nature: imageNature(real, erect, atInfinity),
      });

    } else if (mode === OPTIC_MODES.REFLECT_REFRACT) {
      const n1 = n1Ref.current;
      const n2 = n2Ref.current;
      const thetaI = incidenceAngleRef.current;
      const showProtractor = showProtractorRef.current;
      drawReflectRefract(ctx, W, H, { n1, n2, thetaI, showProtractor });

    } else {
      const corrType = corrTypeRef.current;
      const corrD = corrDioptRef.current;
      const corrOn = corrActiveRef.current;

      drawEye(ctx, W, H);
      if (corrOn && corrType) drawCorrectionLens(ctx, W, H, corrType, corrD);
      const { onRetina } = drawEyeRays(ctx, W, H, defectRef.current, corrD, corrOn && !!corrType, corrType);

      if (onRetina) {
        ctx.save();
        ctx.fillStyle = "rgba(22,40,22,0.88)";
        ctx.strokeStyle = "#39d353"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(W / 2 - 100, 14, 200, 30, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#39d353"; ctx.font = "bold 12px monospace"; ctx.textAlign = "center";
        ctx.fillText("✓ Vision Corrected!", W / 2, 34);
        ctx.restore();
      }

      const defectLabel = defectRef.current === EYE_DEFECTS.MYOPIA
        ? "Myopia (Nearsightedness)"
        : "Hypermetropia (Farsightedness)";
      ctx.save();
      ctx.fillStyle = "#8b949e"; ctx.font = "11px monospace"; ctx.textAlign = "left";
      ctx.fillText(`Defect: ${defectLabel}`, 14, 26);
      ctx.restore();
    }
  }, [canvasRef]);

  const loop = useCallback(() => {
    drawFrame();
    rafRef.current = requestAnimationFrame(loop);
  }, [drawFrame]);

  useEffect(() => {
    if (active) {
      rafRef.current = requestAnimationFrame(loop);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active, loop]);

  useEffect(() => { drawFrame(); }, [drawFrame, canvasSize]);

  useEffect(() => {
    const id = setInterval(() => {
      if (modeRef.current === OPTIC_MODES.BENCH) {
        const fPx = focalLenRef.current;
        const type = componentRef.current;
        const uPx = clampObjDist(type, fPx, objDistRef.current);
        const { vPx, m, real, erect, atInfinity } = calcImage(type, fPx, uPx);
        setTelemetry(prev => ({
          ...prev,
          u: uPx, v: vPx, f: fPx, m, real, erect, atInfinity,
          nature: imageNature(real, erect, atInfinity),
          onRetina: false,
        }));
      } else if (modeRef.current === OPTIC_MODES.REFLECT_REFRACT) {
        const n1 = n1Ref.current;
        const n2 = n2Ref.current;
        const thetaI = incidenceAngleRef.current;

        // Snell's Law
        const thetaR = thetaI;
        let thetaT = 0;
        let tir = false;
        const ratio = (n1 * Math.sin(thetaI * Math.PI / 180)) / n2;
        if (ratio > 1) {
          tir = true;
          thetaT = NaN;
        } else {
          thetaT = Math.asin(ratio) * 180 / Math.PI;
        }

        const thetaC = n1 > n2 ? Math.asin(n2 / n1) * 180 / Math.PI : NaN;

        setTelemetry(prev => ({
          ...prev,
          thetaI,
          thetaR,
          thetaT,
          thetaC,
          tir,
          n1,
          n2,
          onRetina: false,
        }));
      } else {
        const W = sizeRef.current.w || 800;
        const H = sizeRef.current.h || 420;
        const { onRetina } = calcEyeConvergence(
          W, H, defectRef.current, corrDioptRef.current,
          corrActiveRef.current && !!corrTypeRef.current, corrTypeRef.current,
        );
        setTelemetry(prev => ({ ...prev, onRetina }));
      }
    }, 100);
    return () => clearInterval(id);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!draggingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const W = canvas.width;
    const H = canvas.height;
    const mouseX = (e.clientX - rect.left) * (W / rect.width);
    const mouseY = (e.clientY - rect.top) * (H / rect.height);

    if (modeRef.current === OPTIC_MODES.BENCH) {
      const lensX = W / 2;
      const dist = Math.abs(mouseX - lensX);
      objDistRef.current = clampObjDist(componentRef.current, focalLenRef.current, dist);
    } else if (modeRef.current === OPTIC_MODES.REFLECT_REFRACT) {
      const dx = mouseX - W / 2;
      const dy = mouseY - H / 2;
      if (dy < 0) { // Dragging is only allowed in the top half
        const theta_rad = Math.atan2(Math.abs(dx), -dy);
        const theta_deg = theta_rad * 180 / Math.PI;
        incidenceAngleRef.current = Math.min(85, Math.max(0, theta_deg));
      }
    }
  }, [canvasRef]);

  const handleMouseDown = useCallback(() => { draggingRef.current = true; }, []);
  const handleMouseUp = useCallback(() => { draggingRef.current = false; }, []);

  const syncMode = useCallback((v) => { modeRef.current = v; }, []);
  const syncComponent = useCallback((v) => { componentRef.current = v; }, []);
  const syncFocal = useCallback((v) => { focalLenRef.current = v; }, []);
  const syncObjDist = useCallback((v) => {
    objDistRef.current = clampObjDist(componentRef.current, focalLenRef.current, v);
  }, []);
  const syncObjHeight = useCallback((v) => { objHeightRef.current = v; }, []);
  const syncDefect = useCallback((v) => { defectRef.current = v; }, []);
  const syncCorrType = useCallback((v) => { corrTypeRef.current = v; corrActiveRef.current = !!v; }, []);
  const syncCorrDiopt = useCallback((v) => { corrDioptRef.current = v; }, []);

  const syncN1 = useCallback((v) => { n1Ref.current = v; }, []);
  const syncN2 = useCallback((v) => { n2Ref.current = v; }, []);
  const syncIncidenceAngle = useCallback((v) => { incidenceAngleRef.current = v; }, []);
  const syncShowProtractor = useCallback((v) => { showProtractorRef.current = v; }, []);

  return {
    telemetry,
    handleMouseMove, handleMouseDown, handleMouseUp,
    syncMode, syncComponent, syncFocal, syncObjDist, syncObjHeight,
    syncDefect, syncCorrType, syncCorrDiopt,
    syncN1, syncN2, syncIncidenceAngle, syncShowProtractor,
    OPTIC_MODES, COMPONENTS, EYE_DEFECTS,
  };
}
