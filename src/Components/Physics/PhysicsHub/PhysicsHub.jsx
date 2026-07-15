import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, FlaskConical, ChevronRight } from "lucide-react";
import { CLR, TABS } from "./constants/hubConstants";

import ProjectileMotion from "../ProjectileMotion/ProjectileMotion";
import FrictionSimulator from "../FrictionSimulator/FrictionSimulator";
import SoundWaveTank from "../SoundWave/SoundWaveTank";
import OpticsMirrorLab  from "./OpticsMirrorLab";
import CircuitBuilder    from "./components/CircuitBuilder";

const TAB_ACCENT = {
  motion:   "#58a6ff",
  friction: "#56d364",
  sound:    "#00e5ff",
  power:    "#39d353", // Glowing green for Circuit Sandbox
  optics:   "#e3b341",
};

// ─── Left nav tab item ────────────────────────────────────────────────────────
function NavItem({ tab, active, onClick }) {
  const accent = TAB_ACCENT[tab.id];
  return (
    <motion.button
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors relative"
      style={{
        background: active ? `${accent}12` : "transparent",
        border:     `1px solid ${active ? accent + "55" : "transparent"}`,
      }}
    >
      {/* Active indicator bar */}
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
          style={{ background: accent }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
        />
      )}

      <span className="text-lg leading-none ml-1">{tab.icon}</span>

      <div className="flex flex-col min-w-0 flex-1">
        <span
          className="text-xs font-semibold leading-tight truncate"
          style={{ color: active ? accent : CLR.text }}
        >
          {tab.label}
        </span>
        {/* <span className="text-[9px] mt-0.5 truncate" style={{ color: CLR.muted }}>
          {tab.grade} · {tab.topic}
        </span> */}
      </div>

      <ChevronRight size={12} style={{ color: active ? accent : "transparent", flexShrink: 0 }} />
    </motion.button>
  );
}

// ─── Wrapper for existing full-screen simulators ──────────────────────────────
function SimulatorPane({ children }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {children}
    </div>
  );
}

export default function PhysicsHub() {
  const navigate   = useNavigate();
  const [activeTab, setActiveTab] = useState("motion");
  const activeTabData = TABS.find(t => t.id === activeTab);
  const accent = TAB_ACCENT[activeTab];

  const handleTabChange = useCallback((id) => setActiveTab(id), []);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: CLR.bg, fontFamily: "Inter, sans-serif" }}
    >
      {/* ── LEFT NAV COLUMN ──────────────────────────────────────────────────── */}
      <motion.aside
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-52 shrink-0 flex flex-col border-r overflow-hidden"
        style={{ background: CLR.panel, borderColor: CLR.border }}
      >
        {/* Branding */}
        <div className="px-4 py-4 border-b" style={{ borderColor: CLR.border }}>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(88,166,255,0.12)" }}
            >
              <FlaskConical size={14} style={{ color: CLR.accent }} />
            </div>
            <div>
              <p className="text-xs font-bold leading-none" style={{ color: CLR.text }}>
                NCERT Physics
              </p>
              <p className="text-[9px] mt-0.5" style={{ color: CLR.muted }}>
                Grades 9 &amp; 10
              </p>
            </div>
          </div>
        </div>

        {/* Module list */}
        <div className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-1">
          <p className="text-[9px] uppercase tracking-widest font-semibold px-2 mb-1"
            style={{ color: CLR.muted }}>
            Simulators
          </p>
          {TABS.map(tab => (
            <NavItem
              key={tab.id}
              tab={tab}
              active={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
            />
          ))}
        </div>

        {/* Back button at bottom */}
        <div className="px-3 py-3 border-t" style={{ borderColor: CLR.border }}>
          <motion.button
            whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
            style={{ color: CLR.muted, background: "rgba(139,148,158,0.06)" }}
          >
            <ArrowLeft size={13} /> Back to Home
          </motion.button>
        </div>
      </motion.aside>

      {/* ── CONTENT AREA (fills remaining space, simulators manage their own 3-col layout) ── */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col overflow-hidden"
          >
            {activeTab === "motion" && (
              <SimulatorPane><ProjectileMotion embedded /></SimulatorPane>
            )}
            {activeTab === "friction" && (
              <SimulatorPane><FrictionSimulator embedded /></SimulatorPane>
            )}
            {activeTab === "sound" && (
              <SimulatorPane><SoundWaveTank embedded /></SimulatorPane>
            )}
            {activeTab === "power" && (
              <div className="flex flex-1 min-h-0 overflow-hidden">
                <CircuitBuilder active={activeTab === "power"} />
              </div>
            )}
            {activeTab === "optics" && (
              <div className="flex flex-1 min-h-0 overflow-hidden">
                <OpticsMirrorLab active={activeTab === "optics"} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
