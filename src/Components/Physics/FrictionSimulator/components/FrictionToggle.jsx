import { motion } from "framer-motion";
import { CLR } from "../constants/frictionConstants";

export default function FrictionToggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium" style={{ color: CLR.muted }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        className="relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none"
        style={{ background: value ? CLR.accent : CLR.border }}
        role="switch" aria-checked={value} aria-label={label}
      >
        <motion.span
          animate={{ left: value ? "calc(100% - 18px)" : "2px" }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
          className="absolute top-0.5 w-4 h-4 rounded-full"
          style={{ background: CLR.text }}
        />
      </button>
    </div>
  );
}
