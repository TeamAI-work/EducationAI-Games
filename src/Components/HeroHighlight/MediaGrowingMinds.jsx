import { motion } from 'framer-motion';

export default function MediaGrowingMinds({ reduced }) {
  // Total cycle duration
  const DUR = 5;

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <svg viewBox="0 0 120 120" className="w-full h-full" style={{ maxWidth: 280, maxHeight: 280 }} aria-hidden="true">

        {/* ── Pot ──────────────────────────────────── */}
        <rect x="42" y="100" width="36" height="14" rx="3" fill="#d4a574" opacity="0.7" />
        <rect x="38" y="96" width="44" height="6" rx="2" fill="#c4956a" opacity="0.7" />

        {/* ── Stem (draws upward) ──────────────────── */}
        <motion.path
          d="M 60 96 Q 60 70 58 50 Q 57 40 60 28"
          stroke="#16a34a"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={reduced ? { pathLength: 1 } : {
            pathLength: [0, 1, 1, 0],
            opacity: [1, 1, 1, 0],
          }}
          transition={reduced ? { duration: 1 } : {
            duration: DUR,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.35, 0.8, 1],
          }}
        />

        {/* ── Left leaf (unfurls at t=0.2) ────────── */}
        <motion.path
          d="M 58 65 Q 40 55 35 62 Q 32 68 48 68 Z"
          fill="#4ade80"
          initial={{ scale: 0, opacity: 0 }}
          animate={reduced ? { scale: 1, opacity: 0.85 } : {
            scale: [0, 0, 1, 1, 0],
            opacity: [0, 0, 0.85, 0.85, 0],
          }}
          transition={reduced ? { duration: 0.5, delay: 0.3 } : {
            duration: DUR,
            repeat: Infinity,
            ease: 'easeOut',
            times: [0, 0.2, 0.4, 0.8, 1],
          }}
          style={{ transformOrigin: '58px 65px' }}
        />

        {/* ── Right leaf (unfurls at t=0.3) ───────── */}
        <motion.path
          d="M 60 55 Q 78 45 82 52 Q 85 58 70 58 Z"
          fill="#86efac"
          initial={{ scale: 0, opacity: 0 }}
          animate={reduced ? { scale: 1, opacity: 0.85 } : {
            scale: [0, 0, 0, 1, 1, 0],
            opacity: [0, 0, 0, 0.85, 0.85, 0],
          }}
          transition={reduced ? { duration: 0.5, delay: 0.5 } : {
            duration: DUR,
            repeat: Infinity,
            ease: 'easeOut',
            times: [0, 0.25, 0.3, 0.5, 0.8, 1],
          }}
          style={{ transformOrigin: '60px 55px' }}
        />

        {/* ── Small left leaf (unfurls at t=0.35) ─── */}
        <motion.path
          d="M 59 45 Q 46 38 44 44 Q 42 49 54 47 Z"
          fill="#4ade80"
          initial={{ scale: 0, opacity: 0 }}
          animate={reduced ? { scale: 1, opacity: 0.7 } : {
            scale: [0, 0, 0, 1, 1, 0],
            opacity: [0, 0, 0, 0.7, 0.7, 0],
          }}
          transition={reduced ? { duration: 0.5, delay: 0.6 } : {
            duration: DUR,
            repeat: Infinity,
            ease: 'easeOut',
            times: [0, 0.3, 0.35, 0.55, 0.8, 1],
          }}
          style={{ transformOrigin: '59px 45px' }}
        />

        {/* ── Bloom / flower at top (appears at t=0.5) */}
        {[0, 1, 2, 3, 4].map(i => (
          <motion.ellipse
            key={`petal-${i}`}
            cx={60 + Math.cos((i * 72 * Math.PI) / 180) * 8}
            cy={24 + Math.sin((i * 72 * Math.PI) / 180) * 8}
            rx="5"
            ry="8"
            fill="#fbcfe8"
            initial={{ scale: 0, opacity: 0 }}
            animate={reduced ? { scale: 1, opacity: 0.8 } : {
              scale: [0, 0, 0, 1, 1, 0],
              opacity: [0, 0, 0, 0.8, 0.8, 0],
            }}
            transition={reduced ? { duration: 0.4, delay: 0.7 + i * 0.05 } : {
              duration: DUR,
              repeat: Infinity,
              ease: 'easeOut',
              times: [0, 0.4, 0.5 + i * 0.02, 0.65, 0.8, 1],
            }}
            style={{
              transformOrigin: `${60 + Math.cos((i * 72 * Math.PI) / 180) * 8}px ${24 + Math.sin((i * 72 * Math.PI) / 180) * 8}px`,
              rotate: `${i * 72}deg`,
            }}
          />
        ))}
        {/* Bloom center */}
        <motion.circle
          cx="60"
          cy="24"
          r="4"
          fill="#f472b6"
          initial={{ scale: 0, opacity: 0 }}
          animate={reduced ? { scale: 1, opacity: 1 } : {
            scale: [0, 0, 0, 1, 1, 0],
            opacity: [0, 0, 0, 1, 1, 0],
          }}
          transition={reduced ? { duration: 0.3, delay: 0.9 } : {
            duration: DUR,
            repeat: Infinity,
            ease: 'easeOut',
            times: [0, 0.5, 0.55, 0.68, 0.8, 1],
          }}
          style={{ transformOrigin: '60px 24px' }}
        />

        {/* ── Rising knowledge sparkles ───────────── */}
        {!reduced && [
          { x: 48, delay: 0.6 },
          { x: 72, delay: 1.0 },
          { x: 55, delay: 1.5 },
          { x: 66, delay: 2.0 },
        ].map((s, i) => (
          <motion.circle
            key={`spark-${i}`}
            cx={s.x}
            cy={20}
            r="1.5"
            fill="#fda4af"
            animate={{
              y: [0, -18],
              opacity: [0, 0.9, 0],
              scale: [0, 1, 0.5],
            }}
            transition={{
              duration: 1.8,
              delay: s.delay,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        ))}
      </svg>
    </div>
  );
}
