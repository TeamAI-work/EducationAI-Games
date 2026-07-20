import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, FlaskConical, ChevronRight } from "lucide-react";
import { CLR, BIO_TABS, TAB_ACCENT } from "./constants/bioConstants";
import CellSandbox from "./components/CellSandbox";

// ─── Left nav tab item ─────────────────────────────────────────────────────────
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
        border: `1px solid ${active ? accent + "55" : "transparent"}`,
      }}>
      {active && (
        <motion.div
          layoutId="bio-nav-indicator"
          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
          style={{ background: accent }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
        />
      )}
      <span className="text-lg leading-none ml-1">{tab.icon}</span>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-xs font-semibold leading-tight truncate"
          style={{ color: active ? accent : CLR.muted }}>
          {tab.label}
        </span>
        <span className="text-[9px] mt-0.5 truncate" style={{ color: CLR.muted }}>
          {tab.grade} · {tab.topic.substring(0, 22)}{tab.topic.length > 22 ? "…" : ""}
        </span>
      </div>
      <ChevronRight size={12} style={{ color: active ? accent : "transparent", flexShrink: 0 }} />
    </motion.button>
  );
}

// ─── Coming Soon Placeholder ───────────────────────────────────────────────────
function ComingSoon({ tab }) {
  const accent = TAB_ACCENT[tab?.id] || CLR.accent;
  return (
    <div className="flex flex-1 items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 p-8 rounded-2xl border text-center max-w-sm"
        style={{ borderColor: accent + "33", background: accent + "08" }}>
        <span className="text-5xl">{tab?.icon}</span>
        <div>
          <p className="text-base font-bold mb-1" style={{ color: accent }}>{tab?.label}</p>
          <p className="text-xs leading-relaxed" style={{ color: CLR.muted }}>
            This lab is under construction and will be available soon.<br />
            Grade {tab?.grade} · {tab?.topic}
          </p>
        </div>
        <span className="text-[9px] uppercase tracking-widest font-semibold px-3 py-1 rounded-full border"
          style={{ borderColor: accent + "55", color: accent, background: accent + "10" }}>
          Coming Soon
        </span>
      </motion.div>
    </div>
  );
}

// ─── Biology Hub Root ──────────────────────────────────────────────────────────
export default function BioHub() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("cell");

  const activeTabData = BIO_TABS.find(t => t.id === activeTab);
  const accent = TAB_ACCENT[activeTab];

  const handleTabChange = useCallback((id) => setActiveTab(id), []);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: CLR.bg, fontFamily: "Inter, sans-serif" }}>

      {/* ── LEFT NAV ──────────────────────────────────────────────────────────── */}
      <motion.aside
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-52 shrink-0 flex flex-col border-r overflow-hidden"
        style={{ background: CLR.panel, borderColor: CLR.border }}>

        {/* Branding */}
        <div className="px-4 py-4 border-b" style={{ borderColor: CLR.border }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(57,211,83,0.12)" }}>
              <FlaskConical size={14} style={{ color: CLR.accent }} />
            </div>
            <div>
              <p className="text-xs font-bold leading-none" style={{ color: CLR.text }}>NCERT Biology</p>
              <p className="text-[9px] mt-0.5" style={{ color: CLR.muted }}>Grades 9 & 10</p>
            </div>
          </div>
        </div>

        {/* Module list */}
        <div className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-1">
          <p className="text-[9px] uppercase tracking-widest font-semibold px-2 mb-1"
            style={{ color: CLR.muted }}>
            Simulators
          </p>
          {BIO_TABS.map(tab => (
            <NavItem
              key={tab.id}
              tab={tab}
              active={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
            />
          ))}
        </div>

        {/* Back button */}
        <div className="px-3 py-3 border-t" style={{ borderColor: CLR.border }}>
          <motion.button
            whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
            style={{ color: CLR.muted, background: "rgba(139,148,158,0.06)" }}>
            <ArrowLeft size={13} /> Back to Home
          </motion.button>
        </div>
      </motion.aside>

      {/* ── CONTENT AREA ──────────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col overflow-hidden">

            {activeTab === "cell" && (
              <CellSandbox active={activeTab === "cell"} />
            )}
            {activeTab !== "cell" && (
              <ComingSoon tab={activeTabData} />
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
