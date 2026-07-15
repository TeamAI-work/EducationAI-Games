import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, BarChart2 } from "lucide-react";
import { CLR } from "../constants/frictionConstants";

// ─── Single metric card ───────────────────────────────────────────────────────
function TelCard({ label, value, unit, accent, wide }) {
  return (
    <motion.div
      layout
      className={`flex flex-col gap-0.5 rounded-lg px-3 py-2.5 border ${wide ? "col-span-2" : ""}`}
      style={{ background: CLR.bg, borderColor: CLR.border }}
    >
      <span
        className="text-[10px] uppercase tracking-widest font-semibold leading-none"
        style={{ color: CLR.muted }}
      >
        {label}
      </span>
      <span
        className="text-base font-mono font-bold tabular-nums leading-tight mt-0.5"
        style={{ color: accent || CLR.text }}
      >
        {value}
        {unit && (
          <span className="text-xs font-normal ml-1" style={{ color: CLR.muted }}>
            {unit}
          </span>
        )}
      </span>
    </motion.div>
  );
}

// ─── Compact metric item for collapsed view ──────────────────────────────────
function CompactMetric({ label, value, unit, accent }) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px]"
      style={{ background: CLR.bg, borderColor: CLR.border }}
    >
      <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: CLR.muted }}>
        {label}:
      </span>
      <span className="font-mono font-bold tabular-nums" style={{ color: accent || CLR.text }}>
        {value}
      </span>
      {unit && (
        <span className="text-[9px] ml-0.5" style={{ color: CLR.muted }}>
          {unit}
        </span>
      )}
    </div>
  );
}

// ─── Group header ─────────────────────────────────────────────────────────────
function Group({ title }) {
  return (
    <p
      className="text-[10px] uppercase tracking-widest font-semibold px-0.5 col-span-full border-b pb-1 mb-1"
      style={{ color: CLR.muted, borderColor: CLR.border }}
    >
      {title}
    </p>
  );
}

/**
 * TelemetryPanel
 *
 * Props:
 *   telemetry  – from useFrictionSimulation
 *   slipAngle  – atan(µs) in degrees  (derived in orchestrator)
 *   STATES     – state machine constants
 */
export default function TelemetryPanel({ telemetry, slipAngle, STATES }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    state, speed, maxSpeed, acceleration, elapsed, distance,
    fGravity, fNormal, fFriction, fNet,
    kineticEnergy, workByGravity, workByFriction,
  } = telemetry;

  // ── State label + colour ───────────────────────────────────────────────────
  const stateLabel =
    state === STATES.KINETIC ? "Kinetic — Sliding"
    : state === STATES.STATIC ? "Static — At Rest"
    : state === STATES.DONE   ? "Reached Bottom"
    : "Idle";

  const stateColor =
    state === STATES.KINETIC ? CLR.gravity
    : state === STATES.STATIC ? CLR.friction
    : state === STATES.DONE   ? CLR.normal
    : CLR.muted;

  // ── Efficiency: ratio of KE gained to gravitational work done ─────────────
  // η = KE / W_gravity  (1 = no friction loss, 0 = all energy lost)
  const efficiency = workByGravity > 0
    ? Math.min(100, (kineticEnergy / workByGravity) * 100)
    : 0;

  // ── Theoretical terminal condition at bottom (v² = 2·a·d) for comparison ──
  // Only show if block is sliding (a > 0)
  const vTheory = acceleration > 0
    ? Math.sqrt(2 * acceleration * Math.max(distance, 0.001))
    : null;

  return (
    <div
      className="rounded-xl border p-2.5 transition-all flex flex-col gap-2"
      style={{ background: CLR.panel, borderColor: CLR.border }}
    >
      {/* ── Header / Compact Bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-3 overflow-hidden flex-1 flex-wrap">
          {/* Logo & title */}
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            <BarChart2 size={14} style={{ color: CLR.accent }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: CLR.text }}>
              Telemetry
            </span>
          </div>

          {/* Collapsed state metrics */}
          <AnimatePresence>
            {!isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-wrap items-center gap-1.5"
              >
                <CompactMetric
                  label="State"
                  value={state === STATES.KINETIC ? "Sliding" : state === STATES.STATIC ? "Static" : state === STATES.DONE ? "Finished" : "Idle"}
                  accent={stateColor}
                />
                <CompactMetric label="Speed" value={speed.toFixed(2)} unit="m/s" accent={CLR.accent} />
                <CompactMetric label="Accel" value={acceleration.toFixed(2)} unit="m/s²" accent={CLR.accent} />
                <CompactMetric label="Friction" value={fFriction.toFixed(1)} unit="N" accent={CLR.friction} />
                <CompactMetric
                  label="Net Force"
                  value={fNet.toFixed(1)}
                  unit="N"
                  accent={fNet > 0.5 ? CLR.gravity : fNet < -0.5 ? CLR.normal : CLR.muted}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border transition-all shrink-0"
          style={{
            borderColor: CLR.border,
            color: CLR.text,
            background: CLR.bg,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = CLR.accent;
            e.currentTarget.style.color = CLR.accent;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = CLR.border;
            e.currentTarget.style.color = CLR.text;
          }}
        >
          <span>{isExpanded ? "Hide Details" : "Show Details"}</span>
          {isExpanded ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
        </button>
      </div>

      {/* ── Expanded Content ────────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t flex flex-col gap-3 mt-1.5" style={{ borderColor: CLR.border }}>
              {/* Row 1: Motion state */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Group title="Motion State" />
                <TelCard label="State"        value={stateLabel}              accent={stateColor} wide />
                <TelCard label="Speed"        value={speed.toFixed(2)}        unit="m/s"  accent={CLR.accent} />
                <TelCard label="Max Speed ↑"  value={maxSpeed.toFixed(2)}     unit="m/s"  accent={CLR.neon} />
                <TelCard label="Acceleration" value={acceleration.toFixed(3)} unit="m/s²" accent={CLR.accent} />
                <TelCard label="Distance"     value={distance.toFixed(2)}     unit="m"    accent={CLR.muted} />
                <TelCard label="Elapsed"      value={elapsed.toFixed(2)}      unit="s"    accent={CLR.muted} />
              </div>

              {/* Row 2: Forces */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Group title="Forces" />
                <TelCard label="Weight (mg)"   value={fGravity.toFixed(1)}   unit="N" accent={CLR.gravity} />
                <TelCard label="Normal (N)"    value={fNormal.toFixed(1)}    unit="N" accent={CLR.normal} />
                <TelCard label="Friction (f)"  value={fFriction.toFixed(1)}  unit="N" accent={CLR.friction} />
                <TelCard label="Net Force"     value={fNet.toFixed(1)}       unit="N" accent={
                  fNet > 0.5 ? CLR.gravity : fNet < -0.5 ? CLR.normal : CLR.muted
                } />
              </div>

              {/* Row 3: Energy & analysis */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Group title="Energy & Analysis" />
                <TelCard label="Kinetic Energy"  value={kineticEnergy.toFixed(2)}   unit="J"  accent={CLR.accent} />
                <TelCard label="Work by Gravity" value={workByGravity.toFixed(2)}   unit="J"  accent={CLR.normal} />
                <TelCard label="Friction Heat"   value={workByFriction.toFixed(2)}  unit="J"  accent={CLR.friction} />
                <TelCard
                  label="Efficiency"
                  value={`${efficiency.toFixed(1)}%`}
                  accent={efficiency > 75 ? CLR.normal : efficiency > 40 ? CLR.friction : CLR.gravity}
                />
                <TelCard
                  label="Slip Angle (θc)"
                  value={slipAngle.toFixed(1)}
                  unit="°"
                  accent={CLR.friction}
                />
                {vTheory !== null && (
                  <TelCard
                    label="v (theory)"
                    value={vTheory.toFixed(2)}
                    unit="m/s"
                    accent={CLR.muted}
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
