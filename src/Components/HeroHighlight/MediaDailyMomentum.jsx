import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MediaDailyMomentum({ reduced }) {
  const [t, setT] = useState(0);

  useEffect(() => {
    if (reduced) return;
    let animId;
    const speed = 0.015; // smooth flying speed
    const update = () => {
      setT(prev => (prev + speed) % (2 * Math.PI));
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [reduced]);

  // Coordinates & tangent calculations for the plane
  const getPosition = (timeVal) => {
    const x = 60 + 35 * Math.cos(timeVal);
    const y = 55 + 20 * Math.sin(2 * timeVal);
    const dx = -35 * Math.sin(timeVal);
    const dy = 40 * Math.cos(2 * timeVal);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return { x, y, angle };
  };

  const currentPos = getPosition(t);

  // Trailing dots behind the plane
  const trailingDots = [
    { delay: 0.06, opacity: 0.7, r: 1.8 },
    { delay: 0.12, opacity: 0.5, r: 1.4 },
    { delay: 0.18, opacity: 0.3, r: 1.0 },
    { delay: 0.24, opacity: 0.15, r: 0.7 },
  ];

  // Static curriculum nodes along the path
  const nodes = [
    { t: 0.5, label: "Algebra", color: "#0284c7" },
    { t: 2.1, label: "Physics", color: "#0ea5e9" },
    { t: 3.6, label: "Grammar", color: "#0284c7" },
    { t: 5.2, label: "Coding", color: "#0ea5e9" },
  ].map((n) => {
    const x = 60 + 35 * Math.cos(n.t);
    const y = 55 + 20 * Math.sin(2 * n.t);
    
    // Proximity detection
    let dist = Math.abs(t - n.t);
    // Handle wrap-around distance for periodic boundary [0, 2pi]
    dist = Math.min(dist, 2 * Math.PI - dist);
    const isActive = dist < 0.45;

    return { ...n, x, y, isActive };
  });

  // Programmatically generate figure-8 background path d-attribute
  const pathPoints = [];
  for (let i = 0; i <= 60; i++) {
    const pT = (i / 60) * 2 * Math.PI;
    const px = 60 + 35 * Math.cos(pT);
    const py = 55 + 20 * Math.sin(2 * pT);
    pathPoints.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }
  const pathD = `M ${pathPoints.join(' L ')}`;

  return (
    <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
      <svg viewBox="0 0 120 110" className="w-full h-full" style={{ maxWidth: 280, maxHeight: 260 }} aria-hidden="true">
        {/* ── Grid Pattern Def ────────────────────────── */}
        <defs>
          <pattern id="media-grid" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M 12 0 L 0 0 0 12" fill="none" stroke="rgba(3, 105, 161, 0.04)" strokeWidth="0.8" />
          </pattern>
        </defs>

        {/* ── Background Grid ────────────────────────── */}
        <rect width="100%" height="100%" fill="url(#media-grid)" />

        {/* ── Floating Math/Science Symbols ──────────── */}
        <g style={{ opacity: 0.4 }}>
          {/* Sigma */}
          <text x="22" y="24" fontSize="12" fontFamily="Times New Roman, Georgia, serif" fontStyle="italic" fill="#0369a1">∑</text>
          {/* Pi */}
          <text x="96" y="86" fontSize="11" fontFamily="Times New Roman, Georgia, serif" fontStyle="italic" fill="#0369a1">π</text>
          {/* Infinity */}
          <text x="94" y="28" fontSize="12" fill="#0369a1">∞</text>
          {/* Square root x */}
          <text x="20" y="88" fontSize="10" fontFamily="Times New Roman, Georgia, serif" fontStyle="italic" fill="#0369a1">√x</text>
        </g>

        {/* ── Path Trajectory ────────────────────────── */}
        <path
          d={pathD}
          fill="none"
          stroke="rgba(3, 105, 161, 0.15)"
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />

        {/* ── Trailing Dots ──────────────────────────── */}
        {!reduced && trailingDots.map((dot, idx) => {
          // Calculate delay coordinate parameter
          let dotT = t - dot.delay;
          if (dotT < 0) dotT += 2 * Math.PI;
          const pos = getPosition(dotT);
          return (
            <circle
              key={`trail-${idx}`}
              cx={pos.x}
              cy={pos.y}
              r={dot.r}
              fill="#38bdf8"
              opacity={dot.opacity}
            />
          );
        })}

        {/* ── Curriculum Nodes ───────────────────────── */}
        {nodes.map((node, idx) => (
          <g key={`node-${idx}`}>
            {/* Pulsing ring on active */}
            {node.isActive && !reduced && (
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={8}
                fill="none"
                stroke="#38bdf8"
                strokeWidth={1}
                initial={{ scale: 0.7, opacity: 0.8 }}
                animate={{ scale: 1.7, opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut", repeat: Infinity, repeatDelay: 0.1 }}
              />
            )}

            {/* Core Node Circle */}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.isActive ? 4.5 : 2.5}
              fill={node.isActive ? "#0284c7" : "#bae6fd"}
              stroke="#0284c7"
              strokeWidth={node.isActive ? 1.5 : 1}
              animate={{
                scale: node.isActive ? 1.2 : 1,
              }}
              transition={{ duration: 0.2 }}
            />
          </g>
        ))}

        {/* ── Paper Plane ────────────────────────────── */}
        <g transform={`translate(${currentPos.x}, ${currentPos.y}) rotate(${currentPos.angle})`}>
          {/* Main Body */}
          <polygon
            points="0,0 -10,-3.5 -7.5,0 -10,3.5"
            fill="#ffffff"
            stroke="#0284c7"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Fold detail */}
          <line
            x1="-7.5"
            y1="0"
            x2="0"
            y2="0"
            stroke="#0284c7"
            strokeWidth="0.6"
          />
        </g>
      </svg>
    </div>
  );
}
