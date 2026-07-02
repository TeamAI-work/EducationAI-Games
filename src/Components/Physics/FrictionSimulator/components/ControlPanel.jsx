import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Triangle, Layers, Eye } from "lucide-react";
import { CLR, SURFACE_PRESETS } from "../constants/frictionConstants";
import FrictionSection  from "./FrictionSection";
import FrictionSliderRow from "./FrictionSliderRow";
import FrictionToggle   from "./FrictionToggle";

/**
 * Right-hand control sidebar.
 * All state is fully controlled — parent owns it, panel only calls setters.
 */
export default function ControlPanel({
  // Ramp geometry
  angle, setAngle,
  mass,  setMass,

  // Friction coefficients
  muS, setMuS,
  muK, setMuK,

  // Visualization
  showVectors, setShowVectors,
  showGrid,    setShowGrid,

  // Actions
  onRun, onPause, onReset,
  simState, STATES,
}) {
  const isRunning = simState === STATES.KINETIC || simState === STATES.STATIC;
  const isDone    = simState === STATES.DONE;

  const applyPreset = (key) => {
    const p = SURFACE_PRESETS[key];
    setMuS(p.us);
    setMuK(p.uk);
  };

  return (
    <div
      className="w-72 xl:w-80 shrink-0 border-l flex flex-col overflow-y-auto"
      style={{ borderColor: CLR.border, background: CLR.panel }}
    >
      <div className="flex flex-col gap-3 p-4">

        {/* ── Action buttons ── */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={onRun}
            disabled={isRunning}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-opacity"
            style={{
              background: isRunning ? "rgba(86,211,100,0.15)" : CLR.normal,
              color:      isRunning ? CLR.normal : "#0d1117",
              opacity:    isRunning ? 0.6 : 1,
              border:     isRunning ? `1px solid ${CLR.normal}` : "none",
            }}
          >
            <Play size={14} fill="currentColor" />
            {isDone ? "Replay" : "Run"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={onPause}
            disabled={!isRunning}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-opacity"
            style={{
              borderColor: CLR.border,
              color:       CLR.text,
              background:  "transparent",
              opacity:     !isRunning ? 0.35 : 1,
              cursor:      !isRunning ? "not-allowed" : "pointer",
            }}
          >
            <Pause size={14} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={onReset}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border"
            style={{ borderColor: CLR.border, color: CLR.muted, background: "transparent" }}
          >
            <RotateCcw size={14} />
          </motion.button>
        </div>

        {/* ── 1. Ramp Geometry ── */}
        <FrictionSection
          title="Ramp Geometry"
          icon={<Triangle size={13} style={{ color: CLR.accent }} />}
        >
          <div className="pt-3 flex flex-col gap-4">
            <FrictionSliderRow
              label="Incline Angle" value={angle}
              min={0} max={90} step={1} unit="°"
              onChange={setAngle}
            />
            <FrictionSliderRow
              label="Block Mass" value={mass}
              min={0.5} max={20} step={0.5} unit="kg"
              onChange={setMass}
            />
          </div>
        </FrictionSection>

        {/* ── 2. Surface Material Coefficients ── */}
        <FrictionSection
          title="Surface Coefficients"
          icon={<Layers size={13} style={{ color: CLR.friction }} />}
        >
          <div className="pt-3 flex flex-col gap-4">

            {/* Material presets */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium" style={{ color: CLR.muted }}>
                Material Preset
              </span>
              <div className="flex flex-col gap-1.5">
                {Object.entries(SURFACE_PRESETS).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium border transition-all text-left"
                    style={{ borderColor: CLR.border, color: CLR.muted, background: "transparent" }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = CLR.friction;
                      e.currentTarget.style.color = CLR.text;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = CLR.border;
                      e.currentTarget.style.color = CLR.muted;
                    }}
                  >
                    <span>{p.icon} {p.label}</span>
                    <span style={{ color: CLR.friction }}>
                      µs {p.us} / µk {p.uk}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px" style={{ background: CLR.border }} />

            <FrictionSliderRow
              label="Static Friction (µs)" value={muS}
              min={0} max={1} step={0.01} unit=""
              hint="Max before slipping"
              onChange={(v) => { setMuS(v); if (muK > v) setMuK(v); }}
            />
            <FrictionSliderRow
              label="Kinetic Friction (µk)" value={muK}
              min={0} max={muS} step={0.01} unit=""
              hint="While sliding (≤ µs)"
              onChange={setMuK}
            />

            {/* µk warning if equal */}
            {muK >= muS && muS > 0 && (
              <p className="text-[10px] px-0.5" style={{ color: CLR.friction }}>
                ⚠ µk = µs — no kinetic energy loss difference
              </p>
            )}
          </div>
        </FrictionSection>

        {/* ── 3. Visualization ── */}
        <FrictionSection
          title="Visualization"
          icon={<Eye size={13} style={{ color: CLR.accent }} />}
          defaultOpen={true}
        >
          <div className="pt-3 flex flex-col gap-3">
            <FrictionToggle
              label="Show Force Vectors"
              value={showVectors}
              onChange={setShowVectors}
            />
            <FrictionToggle
              label="Show Dot Grid"
              value={showGrid}
              onChange={setShowGrid}
            />
          </div>
        </FrictionSection>

        {/* ── Vector legend ── */}
        <div className="rounded-lg border p-3 flex flex-col gap-2" style={{ borderColor: CLR.border }}>
          <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: CLR.muted }}>
            Vector Legend
          </p>
          {[
            { color: CLR.gravity,  label: "Weight  (mg)"              },
            { color: CLR.normal,   label: "Normal Force  (N)"         },
            { color: CLR.friction, label: "Friction  (f)"             },
            { color: CLR.accent,   label: "Critical slip angle guide" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 text-xs" style={{ color: CLR.muted }}>
              <span className="w-4 h-0.5 rounded-full shrink-0" style={{ background: item.color }} />
              {item.label}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
