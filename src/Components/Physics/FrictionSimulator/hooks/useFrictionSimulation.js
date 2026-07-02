import { useRef, useState, useEffect, useCallback } from "react";
import { G, DT, BLOCK_SIZE } from "../constants/frictionConstants";
import {
  getRampGeometry, blockCentre,
  clearCanvas, drawDotGrid, drawGround, drawRamp,
  drawAngleArc, drawBlock, drawForceVectors,
  drawSlipAngleLine, drawFrictionUtilBar,
} from "../utils/frictionDrawing";

// ─── Simulation state machine ─────────────────────────────────────────────────
// "idle"    → not started, block sits at top
// "static"  → running, but gravity < static friction limit → no movement
// "kinetic" → running, block is sliding down
// "done"    → block reached the bottom
const STATES = { IDLE: "idle", STATIC: "static", KINETIC: "kinetic", DONE: "done" };

export function useFrictionSimulation({ canvasRef, canvasSize }) {
  // ── Mutable sim refs (never trigger re-renders, read inside RAF) ───────────
  const rafRef       = useRef(null);
  const idleRafRef   = useRef(null);
  const idleLoopRef  = useRef(null);

  // Physics state
  const simRef = useRef({
    d:       0,     // distance travelled from top of ramp (metres)
    v:       0,     // velocity along ramp (m/s)
    a:       0,     // acceleration (m/s²)
    t:       0,     // elapsed time (s)
    state:   STATES.IDLE,
  });

  // Mirror of control inputs (written by React state effects, read by RAF)
  const angleRef    = useRef(30);
  const muSRef      = useRef(0.50);
  const muKRef      = useRef(0.30);
  const massRef     = useRef(5);
  const showVecRef  = useRef(true);
  const showGridRef = useRef(true);
  const sizeRef     = useRef(canvasSize);

  // Keep refs in sync
  useEffect(() => { sizeRef.current = canvasSize; }, [canvasSize]);

  // ── React UI state (updated ~10 fps via interval) ─────────────────────────
  const [telemetry, setTelemetry] = useState({
    state:         STATES.IDLE,
    speed:         0,
    acceleration:  0,
    elapsed:       0,
    fGravity:      0,
    fNormal:       0,
    fFriction:     0,
    frictionRatio: 0,   // fParallel / (µs * fNormal)  → 1 = at slip limit
  });

  // ── Canvas resize seed ────────────────────────────────────────────────────
  useEffect(() => { sizeRef.current = canvasSize; }, [canvasSize]);

  // ─── Core physics tick ────────────────────────────────────────────────────
  /**
   * Computes forces for the current angle/friction/mass and advances the
   * sim state by one DT step.  Returns the computed forces for drawing.
   */
  const physicsStep = useCallback(() => {
    const s    = simRef.current;
    const tRad = (angleRef.current * Math.PI) / 180;
    const m    = massRef.current;
    const muS  = muSRef.current;
    const muK  = muKRef.current;

    const fNormal   = m * G * Math.cos(tRad);
    const fParallel = m * G * Math.sin(tRad);   // gravity component down-slope
    const fStaticLim = muS * fNormal;

    let fFriction = 0;
    let accel     = 0;

    if (s.state === STATES.STATIC) {
      if (fParallel > fStaticLim) {
        // Overcome static friction → switch to kinetic
        s.state   = STATES.KINETIC;
        fFriction = muK * fNormal;
        accel     = (fParallel - fFriction) / m;
      } else {
        // Held by static friction
        fFriction = fParallel;   // static friction exactly balances gravity component
        accel     = 0;
      }
    } else if (s.state === STATES.KINETIC) {
      fFriction = muK * fNormal;
      accel     = (fParallel - fFriction) / m;
      if (accel < 0) accel = 0;  // can't decelerate past zero with pure gravity sim
    }

    s.a    = accel;
    s.v   += accel * DT;
    if (s.v < 0) s.v = 0;
    s.d   += s.v * DT;
    s.t   += DT;

    return {
      fGravity:      m * G,
      fNormal,
      fFriction,
      frictionRatio: fStaticLim > 0 ? fParallel / fStaticLim : 0,
    };
  }, []);

  // ─── Full canvas redraw ───────────────────────────────────────────────────
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W   = canvas.width;
    const H   = canvas.height;

    clearCanvas(ctx, W, H);
    if (showGridRef.current) drawDotGrid(ctx, W, H);
    drawGround(ctx, W, H);

    const angleDeg = angleRef.current;
    const geo      = getRampGeometry(W, H, angleDeg);
    const { origin, tip, base, rampLen, cosA, sinA, rad } = geo;

    // Slip angle guide
    const slipDeg = (Math.atan(muSRef.current) * 180) / Math.PI;
    drawSlipAngleLine(ctx, origin, W, slipDeg, angleDeg);

    drawRamp(ctx, origin, tip, base);
    drawAngleArc(ctx, origin, rad, angleDeg);

    // Block position
    const s       = simRef.current;
    // d is in "ramp pixels" — we work in pixel-space directly (no separate
    // metres scale here; 1 px = 1 px for this sim, physics uses G/mass ratios)
    const pixelsPerMetre = rampLen / 10; // map ramp to 10 "metres"
    const dPx     = s.d * pixelsPerMetre;
    const { x: cx, y: cy } = blockCentre(tip, cosA, sinA, rampLen, dPx);

    // Forces for vectors
    const tRad    = rad;
    const m       = massRef.current;
    const muS     = muSRef.current;
    const muK     = muKRef.current;
    const fNormal   = m * G * Math.cos(tRad);
    const fParallel = m * G * Math.sin(tRad);
    const fStaticLim = muS * fNormal;
    let fFriction = 0;
    if (s.state === STATES.STATIC || s.state === STATES.IDLE) {
      fFriction = Math.min(fParallel, fStaticLim);
    } else if (s.state === STATES.KINETIC) {
      fFriction = muK * fNormal;
    }

    const forces = {
      fGravity:  m * G,
      fNormal,
      fFriction,
      frictionRatio: fStaticLim > 0 ? fParallel / fStaticLim : 0,
    };

    drawForceVectors(ctx, cx, cy, rad, cosA, sinA, forces, showVecRef.current);
    drawBlock(ctx, cx, cy, rad, s.state === STATES.KINETIC);
    drawFrictionUtilBar(ctx, W, H, forces.frictionRatio);
  }, [canvasRef]);

  // ─── RAF physics + draw loop (runs while sim is active) ──────────────────
  const loop = useCallback(() => {
    const s = simRef.current;
    if (s.state !== STATES.STATIC && s.state !== STATES.KINETIC) return;

    // Get ramp length to check stopping condition
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W   = canvas.width;
    const H   = canvas.height;
    const geo = getRampGeometry(W, H, angleRef.current);
    const pixelsPerMetre = geo.rampLen / 10;
    const maxD = (geo.rampLen - BLOCK_SIZE) / pixelsPerMetre;

    const forces = physicsStep();

    // Check if block reached the bottom
    if (s.d >= maxD) {
      s.d     = maxD;
      s.v     = 0;
      s.state = STATES.DONE;
      drawFrame();
      setTelemetry(prev => ({ ...prev, state: STATES.DONE, speed: 0, elapsed: s.t, ...forces }));
      // Resume idle loop for continued redraws (angle can still change)
      idleRafRef.current = requestAnimationFrame(idleLoopRef.current);
      return;
    }

    drawFrame();
    rafRef.current = requestAnimationFrame(loop);
  }, [canvasRef, physicsStep, drawFrame]);

  // ─── Continuous idle RAF (redraws when idle/done — keeps angle changes live) ─
  const idleLoop = useCallback(() => {
    const s = simRef.current;
    if (s.state === STATES.KINETIC || s.state === STATES.STATIC) return; // physics loop owns it
    drawFrame();
    idleRafRef.current = requestAnimationFrame(idleLoop);
  }, [drawFrame]);

  useEffect(() => { idleLoopRef.current = idleLoop; }, [idleLoop]);

  // Start idle loop on mount
  useEffect(() => {
    idleRafRef.current = requestAnimationFrame(idleLoop);
    return () => {
      if (idleRafRef.current) cancelAnimationFrame(idleRafRef.current);
      if (rafRef.current)     cancelAnimationFrame(rafRef.current);
    };
  }, [idleLoop]);

  // ─── Telemetry poll at ~10 fps ───────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      const s = simRef.current;
      if (s.state === STATES.IDLE || s.state === STATES.DONE) return;

      const tRad    = (angleRef.current * Math.PI) / 180;
      const m       = massRef.current;
      const muS     = muSRef.current;
      const muK     = muKRef.current;
      const fNormal = m * G * Math.cos(tRad);
      const fPar    = m * G * Math.sin(tRad);
      const fSLim   = muS * fNormal;
      const fFric   = s.state === STATES.KINETIC ? muK * fNormal : Math.min(fPar, fSLim);

      setTelemetry({
        state:         s.state,
        speed:         s.v,
        acceleration:  s.a,
        elapsed:       s.t,
        fGravity:      m * G,
        fNormal,
        fFriction:     fFric,
        frictionRatio: fSLim > 0 ? fPar / fSLim : 0,
      });
    }, 100);
    return () => clearInterval(id);
  }, []);

  // Idle redraw on canvas resize
  useEffect(() => { drawFrame(); }, [drawFrame, canvasSize]);

  // ─── Public handlers ──────────────────────────────────────────────────────
  const handleRun = useCallback(() => {
    const s = simRef.current;
    if (s.state === STATES.KINETIC) return; // already running

    if (idleRafRef.current) cancelAnimationFrame(idleRafRef.current);
    if (rafRef.current)     cancelAnimationFrame(rafRef.current);

    // If idle/done — fresh start
    if (s.state === STATES.IDLE || s.state === STATES.DONE) {
      s.d = 0; s.v = 0; s.a = 0; s.t = 0;
    }

    // Determine initial state
    const tRad    = (angleRef.current * Math.PI) / 180;
    const m       = massRef.current;
    const fPar    = m * G * Math.sin(tRad);
    const fNormal = m * G * Math.cos(tRad);
    const fSLim   = muSRef.current * fNormal;

    s.state = fPar > fSLim ? STATES.KINETIC : STATES.STATIC;

    setTelemetry(prev => ({ ...prev, state: s.state }));
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const handlePause = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const s = simRef.current;
    if (s.state === STATES.KINETIC || s.state === STATES.STATIC) {
      s.state = STATES.IDLE; // treat pause as idle-in-place
      setTelemetry(prev => ({ ...prev, state: STATES.IDLE }));
      idleRafRef.current = requestAnimationFrame(idleLoopRef.current);
    }
  }, []);

  const handleReset = useCallback(() => {
    if (rafRef.current)     cancelAnimationFrame(rafRef.current);
    if (idleRafRef.current) cancelAnimationFrame(idleRafRef.current);

    simRef.current = { d: 0, v: 0, a: 0, t: 0, state: STATES.IDLE };
    setTelemetry({
      state: STATES.IDLE, speed: 0, acceleration: 0, elapsed: 0,
      fGravity: 0, fNormal: 0, fFriction: 0, frictionRatio: 0,
    });

    idleRafRef.current = requestAnimationFrame(idleLoopRef.current);
  }, []);

  // ─── Setters that update both React state and refs ────────────────────────
  // Angle / friction params are set from outside via these; the ref mirrors
  // update immediately so the next RAF frame picks them up.
  const setAngleRef    = useCallback((v) => { angleRef.current   = v; }, []);
  const setMuSRef      = useCallback((v) => { muSRef.current     = v; }, []);
  const setMuKRef      = useCallback((v) => { muKRef.current     = v; }, []);
  const setMassRef     = useCallback((v) => { massRef.current    = v; }, []);
  const setShowVecRef  = useCallback((v) => { showVecRef.current = v; }, []);
  const setShowGridRef = useCallback((v) => { showGridRef.current = v; }, []);

  return {
    telemetry,
    simState: simRef.current.state,
    STATES,
    handleRun,
    handlePause,
    handleReset,
    // Ref-setters (call these whenever React state changes)
    syncAngle:    setAngleRef,
    syncMuS:      setMuSRef,
    syncMuK:      setMuKRef,
    syncMass:     setMassRef,
    syncShowVec:  setShowVecRef,
    syncShowGrid: setShowGridRef,
  };
}
