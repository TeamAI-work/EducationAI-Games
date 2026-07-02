import { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useFrictionSimulation } from "./hooks/useFrictionSimulation";
import FrictionHeader   from "./components/FrictionHeader";
import FrictionCanvas   from "./components/FrictionCanvas";
import TelemetryPanel   from "./components/TelemetryPanel";
import ControlPanel     from "./components/ControlPanel";

/**
 * FrictionSimulator — thin orchestrator.
 * Owns all React state, wires refs via sync* callbacks from the hook,
 * and composes sub-components. No rendering logic lives here.
 */
export default function FrictionSimulator() {
  const navigate   = useNavigate();
  const canvasRef  = useRef(null);

  // ── Canvas size (driven by FrictionCanvas ResizeObserver) ─────────────────
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 480 });

  // ── Control state ──────────────────────────────────────────────────────────
  const [angle,       setAngleState]  = useState(30);
  const [mass,        setMassState]   = useState(5);
  const [muS,         setMuSState]    = useState(0.50);
  const [muK,         setMuKState]    = useState(0.30);
  const [showVectors, setShowVectors] = useState(true);
  const [showGrid,    setShowGrid]    = useState(true);

  // ── Simulation hook ────────────────────────────────────────────────────────
  const {
    telemetry,
    STATES,
    handleRun,
    handlePause,
    handleReset,
    syncAngle,
    syncMuS,
    syncMuK,
    syncMass,
    syncShowVec,
    syncShowGrid,
  } = useFrictionSimulation({ canvasRef, canvasSize });

  // Derived
  const slipAngle = (Math.atan(muS) * 180) / Math.PI;
  const simState  = telemetry.state;

  // ── Setters: update React state AND sync ref for RAF ──────────────────────
  const setAngle = useCallback((v) => { setAngleState(v);  syncAngle(v);    }, [syncAngle]);
  const setMass  = useCallback((v) => { setMassState(v);   syncMass(v);     }, [syncMass]);
  const setMuS   = useCallback((v) => { setMuSState(v);    syncMuS(v);      }, [syncMuS]);
  const setMuK   = useCallback((v) => { setMuKState(v);    syncMuK(v);      }, [syncMuK]);

  const handleShowVectors = useCallback((v) => { setShowVectors(v); syncShowVec(v);  }, [syncShowVec]);
  const handleShowGrid    = useCallback((v) => { setShowGrid(v);    syncShowGrid(v); }, [syncShowGrid]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: "#0d1117", fontFamily: "Inter, sans-serif" }}
    >
      <FrictionHeader
        onBack={() => navigate(-1)}
        simState={simState}
        STATES={STATES}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Left: canvas + telemetry ── */}
        <div className="flex flex-col flex-1 min-w-0 p-4 gap-3">
          <FrictionCanvas
            canvasRef={canvasRef}
            canvasSize={canvasSize}
            onResize={setCanvasSize}
          />
          <TelemetryPanel
            telemetry={telemetry}
            slipAngle={slipAngle}
            STATES={STATES}
          />
        </div>

        {/* ── Right: controls ── */}
        <ControlPanel
          angle={angle}   setAngle={setAngle}
          mass={mass}     setMass={setMass}
          muS={muS}       setMuS={setMuS}
          muK={muK}       setMuK={setMuK}
          showVectors={showVectors} setShowVectors={handleShowVectors}
          showGrid={showGrid}       setShowGrid={handleShowGrid}
          onRun={handleRun}
          onPause={handlePause}
          onReset={handleReset}
          simState={simState}
          STATES={STATES}
        />
      </div>
    </div>
  );
}
