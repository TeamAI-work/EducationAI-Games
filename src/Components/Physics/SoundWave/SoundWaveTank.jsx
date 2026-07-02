import { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { DEFAULT_FREQ, DEFAULT_AMP, DEFAULT_PHASE_DEG, DEFAULT_TEMP_C, MEDIUM_PRESETS, BOUNDARY, computeSpeedOfSound } from "./constants/soundConstants";
import { useSoundSimulation } from "./hooks/useSoundSimulation";

import SoundHeader       from "./components/SoundHeader";
import SoundCanvas       from "./components/SoundCanvas";
import SoundTelemetry    from "./components/SoundTelemetry";
import SoundControlPanel from "./components/SoundControlPanel";

/**
 * SoundWaveTank — thin orchestrator.
 * Owns all React state, wires ref-setters from the hook, composes sub-components.
 */
export default function SoundWaveTank() {
  const navigate   = useNavigate();
  const tankRef    = useRef(null);
  const graphRef   = useRef(null);

  // ── Canvas size ────────────────────────────────────────────────────────────
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 480 });

  // ── Control state ──────────────────────────────────────────────────────────
  const [freq,     setFreqState]     = useState(DEFAULT_FREQ);
  const [amp,      setAmpState]      = useState(DEFAULT_AMP);
  const [phase,    setPhaseState]    = useState(DEFAULT_PHASE_DEG);
  const [temp,     setTempState]     = useState(DEFAULT_TEMP_C);
  const [medium,   setMediumState]   = useState("gas");
  const [boundary, setBoundaryState] = useState(BOUNDARY.ABSORB);

  // SONAR guess
  const [sonarGuess,   setSonarGuess]   = useState("");
  const [sonarResult,  setSonarResult]  = useState(null);

  // ── Simulation hook ────────────────────────────────────────────────────────
  const {
    telemetry,
    handlePlay,
    handlePause,
    handleReset,
    handleFireSonar,
    syncFreq,
    syncAmp,
    syncPhase,
    syncMedium,
    syncTemp,
    syncBoundary,
  } = useSoundSimulation({ tankCanvasRef: tankRef, graphCanvasRef: graphRef, canvasSize });

  // ── Paired setters (React state + ref sync) ───────────────────────────────
  const setFreq     = useCallback((v) => { setFreqState(v);     syncFreq(v);     }, [syncFreq]);
  const setAmp      = useCallback((v) => { setAmpState(v);      syncAmp(v);      }, [syncAmp]);
  const setPhase    = useCallback((v) => { setPhaseState(v);    syncPhase(v);    }, [syncPhase]);
  const setTemp     = useCallback((v) => { setTempState(v);     syncTemp(v);     }, [syncTemp]);
  const setMedium   = useCallback((v) => { setMediumState(v);   syncMedium(v);   }, [syncMedium]);
  const setBoundary = useCallback((v) => { setBoundaryState(v); syncBoundary(v); }, [syncBoundary]);
  const handleFullReset = useCallback(() => {
    handleReset();
    setSonarGuess("");
    setSonarResult(null);
  }, [handleReset]);

  // ── SONAR answer check ────────────────────────────────────────────────────
  const handleSonarSubmit = useCallback(() => {
    const guess    = parseFloat(sonarGuess);
    const v        = computeSpeedOfSound(medium, temp);
    const tof      = telemetry.sonarTof;
    const calcDist = v * tof / 2;
    if (isNaN(guess) || calcDist === 0) return;
    const err = Math.abs(guess - calcDist) / calcDist;
    setSonarResult(err < 0.05 ? "correct" : err < 0.15 ? "close" : "wrong");
  }, [sonarGuess, medium, temp, telemetry.sonarTof]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: "#0d1117", fontFamily: "Inter, sans-serif" }}
    >
      <SoundHeader
        onBack={() => navigate(-1)}
        running={telemetry.running}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Left: canvas + telemetry ── */}
        <div className="flex flex-col flex-1 min-w-0 p-4 gap-3">
          <SoundCanvas
            tankRef={tankRef}
            graphRef={graphRef}
            tankSize={canvasSize}
            graphSize={canvasSize}
            onResize={setCanvasSize}
          />

          <SoundTelemetry
            telemetry={telemetry}
            sonarGuess={sonarGuess}
            setSonarGuess={setSonarGuess}
            onSonarSubmit={handleSonarSubmit}
          />

          {/* SONAR result banner */}
          {sonarResult && (
            <div
              className="rounded-lg px-4 py-2 text-sm font-semibold border"
              style={{
                borderColor: sonarResult === "correct" ? "#69ff47" : sonarResult === "close" ? "#ffb300" : "#ff5252",
                color:       sonarResult === "correct" ? "#69ff47" : sonarResult === "close" ? "#ffb300" : "#ff5252",
                background:  sonarResult === "correct" ? "rgba(105,255,71,0.06)" : sonarResult === "close" ? "rgba(255,179,0,0.06)" : "rgba(255,82,82,0.06)",
              }}
            >
              {sonarResult === "correct" && "✓ Correct! Your estimate was within 5%."}
              {sonarResult === "close"   && "~ Close! Within 15% — refine your calculation."}
              {sonarResult === "wrong"   && "✗ Off-target. Recall: d = v × t / 2"}
            </div>
          )}
        </div>

        {/* ── Right: controls ── */}
        <SoundControlPanel
          freq={freq}         setFreq={setFreq}
          amp={amp}           setAmp={setAmp}
          phase={phase}       setPhase={setPhase}
          temp={temp}         setTemp={setTemp}
          medium={medium}     setMedium={setMedium}
          boundary={boundary} setBoundary={setBoundary}
          running={telemetry.running}
          onPlay={handlePlay}
          onPause={handlePause}
          onReset={handleFullReset}
          onFireSonar={handleFireSonar}
        />
      </div>
    </div>
  );
}
