import { motion } from "framer-motion";
import { CLR } from "../constants/physicsConstants";

/**
 * A single telemetry metric card.
 */
function TelCard({ label, value, unit, accent }) {
  return (
    <motion.div
      layout
      className="flex flex-col gap-0.5 rounded-lg px-3 py-2.5 border"
      style={{ background: CLR.panel, borderColor: CLR.border }}
    >
      <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: CLR.muted }}>
        {label}
      </span>
      <span className="text-lg font-mono font-bold tabular-nums" style={{ color: accent || CLR.text }}>
        {value}
        <span className="text-xs font-normal ml-1" style={{ color: CLR.muted }}>{unit}</span>
      </span>
    </motion.div>
  );
}

/**
 * Six-card telemetry grid displayed below the canvas.
 *
 * Props: telemetry { x, y, speed, maxHeight, range }, gravity
 */
export default function TelemetryBar({ telemetry, gravity }) {
  const tel = telemetry;

  return (
    <motion.div layout className="grid grid-cols-3 gap-2 lg:grid-cols-6">
      <TelCard label="Range (X)"   value={tel.x.toFixed(1)}              unit="m"    accent={CLR.velX} />
      <TelCard label="Altitude (Y)" value={tel.y.toFixed(1)}             unit="m"    accent={CLR.velY} />
      <TelCard label="Net Speed"   value={tel.speed.toFixed(2)}          unit="m/s"  accent={CLR.velTotal} />
      <TelCard label="Max Height"  value={tel.maxHeight.toFixed(1)}      unit="m"    accent={CLR.apex} />
      <TelCard
        label="Final Range"
        value={tel.range !== null ? tel.range.toFixed(1) : "—"}
        unit={tel.range !== null ? "m" : ""}
        accent={CLR.neon}
      />
      <TelCard label="Gravity" value={gravity.toFixed(2)} unit="m/s²" />
    </motion.div>
  );
}
