import { motion } from "framer-motion";
import { CLR } from "../constants/frictionConstants";

function TelCard({ label, value, unit, accent, wide }) {
  return (
    <motion.div
      layout
      className={`flex flex-col gap-0.5 rounded-lg px-3 py-2.5 border ${wide ? "col-span-2" : ""}`}
      style={{ background: CLR.panel, borderColor: CLR.border }}
    >
      <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: CLR.muted }}>
        {label}
      </span>
      <span className="text-base font-mono font-bold tabular-nums leading-tight" style={{ color: accent || CLR.text }}>
        {value}
        {unit && <span className="text-xs font-normal ml-1" style={{ color: CLR.muted }}>{unit}</span>}
      </span>
    </motion.div>
  );
}

/**
 * Props:
 *   telemetry   – from useFrictionSimulation
 *   slipAngle   – atan(µs) in degrees
 *   STATES      – state machine constants
 */
export default function TelemetryPanel({ telemetry, slipAngle, STATES }) {
  const { state, speed, acceleration, elapsed, fGravity, fNormal, fFriction } = telemetry;

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

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] uppercase tracking-widest font-semibold px-0.5" style={{ color: CLR.muted }}>
        Telemetry
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <TelCard label="State"          value={stateLabel}             accent={stateColor}  wide />
        <TelCard label="Speed"          value={speed.toFixed(2)}       unit="m/s"  accent={CLR.accent} />
        <TelCard label="Acceleration"   value={acceleration.toFixed(2)} unit="m/s²" accent={CLR.accent} />
        <TelCard label="Elapsed"        value={elapsed.toFixed(2)}     unit="s"    accent={CLR.muted} />
        <TelCard label="Slip Angle (θc)" value={slipAngle.toFixed(1)}  unit="°"    accent={CLR.friction} />
        <TelCard label="F gravity"      value={fGravity.toFixed(1)}    unit="N"    accent={CLR.gravity} />
        <TelCard label="F normal"       value={fNormal.toFixed(1)}     unit="N"    accent={CLR.normal} />
        <TelCard label="F friction"     value={fFriction.toFixed(1)}   unit="N"    accent={CLR.friction} />
      </div>
    </div>
  );
}
