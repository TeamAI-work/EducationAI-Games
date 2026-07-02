import { motion } from "framer-motion";
import { CLR, MISSION } from "../constants/soundConstants";

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

export default function SoundTelemetry({ telemetry, sonarGuess, setSonarGuess, onSonarSubmit }) {
  const { wavelength, v, mission, matchPct, matchWon, cancelRms, cancelWon, sonarTof } = telemetry;

  // ── Mission status string ─────────────────────────────────────────────────
  let statusLabel = "Analysing medium...";
  let statusColor = CLR.muted;

  if (mission === MISSION.RESONANCE) {
    if (matchWon) { statusLabel = "✓ TARGET LOCKED!"; statusColor = CLR.wave; }
    else          { statusLabel = `Matching Target… ${matchPct}%`; statusColor = CLR.target; }
  } else if (mission === MISSION.CANCEL) {
    const pct = Math.round((1 - Math.min(cancelRms, 1)) * 100);
    if (cancelWon) { statusLabel = "✓ SILENCE ACHIEVED!"; statusColor = CLR.wave; }
    else           { statusLabel = `Cancellation: ${pct}%`; statusColor = CLR.noise; }
  } else if (mission === MISSION.SONAR) {
    statusLabel = sonarTof > 0 ? `TOF captured: ${sonarTof.toFixed(3)} s` : "Fire a pulse to measure";
    statusColor = CLR.sonar;
  } else {
    statusLabel = "Sandbox — No mission";
    statusColor = CLR.muted;
  }

  const calcDist = sonarTof > 0 ? (v * sonarTof / 2).toFixed(1) : "—";

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] uppercase tracking-widest font-semibold px-0.5" style={{ color: CLR.muted }}>
        Telemetry
      </p>

      <div className="grid grid-cols-4 gap-2">
        {/* Always-visible cards */}
        <TelCard label="Wavelength (λ)" value={wavelength.toFixed(2)} unit="m"    accent={CLR.wave} />
        <TelCard label="Speed (v)"      value={v}                      unit="m/s"  accent={CLR.accent} />
        <TelCard label="Status"         value={statusLabel}            accent={statusColor} wide />

        {/* Mission-specific extras */}
        {mission === MISSION.RESONANCE && (
          <TelCard label="Match" value={`${matchPct}%`} unit="" accent={matchPct > 90 ? CLR.wave : CLR.target} />
        )}
        {mission === MISSION.CANCEL && (
          <TelCard label="RMS Disp." value={(cancelRms).toFixed(3)} unit="" accent={cancelRms < 0.1 ? CLR.wave : CLR.noise} />
        )}
        {mission === MISSION.SONAR && (
          <>
            <TelCard label="Calc. Distance" value={calcDist} unit="m" accent={CLR.sonar} />
            <TelCard label="TOF"            value={sonarTof > 0 ? sonarTof.toFixed(3) : "—"} unit="s" accent={CLR.sonar} />
          </>
        )}
      </div>

      {/* SONAR guess field */}
      {mission === MISSION.SONAR && sonarTof > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-lg border p-3"
          style={{ borderColor: CLR.sonar + "55", background: "rgba(105,255,71,0.04)" }}
        >
          <span className="text-xs font-medium shrink-0" style={{ color: CLR.muted }}>
            Your estimate:
          </span>
          <input
            type="text" inputMode="decimal" value={sonarGuess}
            onChange={e => setSonarGuess(e.target.value)}
            placeholder="distance (m)"
            className="flex-1 text-xs text-center rounded-md px-2 py-1 outline-none border"
            style={{ background: CLR.bg, borderColor: CLR.border, color: CLR.text }}
          />
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={onSonarSubmit}
            className="shrink-0 px-3 py-1 rounded-md text-xs font-semibold"
            style={{ background: CLR.sonar, color: "#0d1117" }}
          >
            Check
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
