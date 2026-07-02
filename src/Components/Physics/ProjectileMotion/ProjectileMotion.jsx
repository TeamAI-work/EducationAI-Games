import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { GRAVITY_PRESETS } from "./constants/physicsConstants";
import { useSimulation }   from "./hooks/useSimulation";

import SimHeader      from "./components/SimHeader";
import CanvasViewport from "./components/CanvasViewport";
import TelemetryBar   from "./components/TelemetryBar";
import ActionBar      from "./components/ActionBar";
import ControlsSidebar from "./components/ControlsSidebar";

/**
 * ProjectileMotion
 *
 * Thin orchestrator. Owns all control state, derives gravity, passes refs &
 * handlers down to sub-components. No rendering logic lives here.
 */
export default function ProjectileMotion() {
  const navigate   = useNavigate();
  const canvasRef  = useRef(null);

  // ── Canvas size (driven by CanvasViewport's ResizeObserver) ────────────────
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 480 });

  // ── Initial conditions ─────────────────────────────────────────────────────
  const [angle,    setAngle]    = useState(45);
  const [velocity, setVelocity] = useState(20);
  const [height,   setHeight]   = useState(0);
  const [mass,     setMass]     = useState(1);

  // ── Environment ────────────────────────────────────────────────────────────
  const [gravityKey,  setGravityKey]  = useState("earth");
  const [customGrav,  setCustomGrav]  = useState(5.0);
  const [airResist,   setAirResist]   = useState(false);
  const [dragCoeff,   setDragCoeff]   = useState(0.05);
  const [windSpeed,   setWindSpeed]   = useState(0);

  // ── Visualization ──────────────────────────────────────────────────────────
  const [showVectors,  setShowVectors]  = useState(true);
  const [showGrid,     setShowGrid]     = useState(true);
  const [retainTrails, setRetainTrails] = useState(true);

  // Derived gravity value
  const gravity = gravityKey === "custom"
    ? customGrav
    : GRAVITY_PRESETS[gravityKey].value;

  // ── Simulation hook ────────────────────────────────────────────────────────
  const {
    isRunning,
    isPaused,
    telemetry,
    trailCount,
    handleLaunch,
    handlePauseResume,
    handleReset,
  } = useSimulation({
    canvasRef,
    canvasSize,
    angle,
    velocity,
    height,
    mass,
    gravity,
    airResist,
    dragCoeff,
    windSpeed,
    retainTrails,
    showGrid,
    showVectors,
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: "#0d1117", fontFamily: "Inter, sans-serif" }}
    >
      {/* Header */}
      <SimHeader
        onBack={() => navigate(-1)}
        isRunning={isRunning}
        isPaused={isPaused}
        status={telemetry.status}
      />

      {/* Body: canvas area (left) + sidebar (right) */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left column: canvas + telemetry + action buttons */}
        <div className="flex flex-col flex-1 min-w-0 p-4 gap-3">
          <CanvasViewport
            canvasRef={canvasRef}
            canvasSize={canvasSize}
            onResize={setCanvasSize}
            idleHint={telemetry.status === "idle"}
          />
          <TelemetryBar telemetry={telemetry} gravity={gravity} />
          <ActionBar
            isRunning={isRunning}
            isPaused={isPaused}
            onLaunch={handleLaunch}
            onPauseResume={handlePauseResume}
            onReset={handleReset}
          />
        </div>

        {/* Right column: all controls */}
        <ControlsSidebar
          angle={angle}           setAngle={setAngle}
          velocity={velocity}     setVelocity={setVelocity}
          height={height}         setHeight={setHeight}
          mass={mass}             setMass={setMass}
          gravityKey={gravityKey} setGravityKey={setGravityKey}
          customGrav={customGrav} setCustomGrav={setCustomGrav}
          airResist={airResist}   setAirResist={setAirResist}
          dragCoeff={dragCoeff}   setDragCoeff={setDragCoeff}
          windSpeed={windSpeed}   setWindSpeed={setWindSpeed}
          showVectors={showVectors}   setShowVectors={setShowVectors}
          showGrid={showGrid}         setShowGrid={setShowGrid}
          retainTrails={retainTrails} setRetainTrails={setRetainTrails}
          trailCount={trailCount ?? 0}
        />
      </div>
    </div>
  );
}
