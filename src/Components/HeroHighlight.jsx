import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { GRADES } from './HeroHighlight/gradesData';
import MediaGrowingMinds from './HeroHighlight/MediaGrowingMinds';
import MediaDailyMomentum from './HeroHighlight/MediaDailyMomentum';
import MediaStrategicClarity from './HeroHighlight/MediaStrategicClarity';
import MediaFutureMastery from './HeroHighlight/MediaFutureMastery';
import GradeTabBar from './HeroHighlight/GradeTabBar';
import TrustBar from './HeroHighlight/TrustBar';
import { useNavigate } from 'react-router-dom';

// ─── HighlightMedia: picks the right media per grade ─────────────────────────
function HighlightMedia({ gradeId, reduced }) {
  const map = {
    g1: <MediaGrowingMinds reduced={reduced} />,
    g2: <MediaDailyMomentum reduced={reduced} />,
    g3: <MediaStrategicClarity reduced={reduced} />,
    g4: <MediaFutureMastery reduced={reduced} />,
  };
  return map[gradeId] || null;
}

// ─── Inline <style> for keyframes & custom font scale ─────────────────────────
const HERO_STYLES = `
  @keyframes hero-blur-in {
    from { filter: blur(6px); opacity: 0; transform: scale(0.96); }
    to   { filter: blur(0px); opacity: 1; transform: scale(1); }
  }
  .hero-highlight-text {
    font-family: 'Playfair Display', Georgia, serif;
    font-style: italic;
    font-weight: 600;
  }
  .hero-headline {
    font-family: 'Playfair Display', Georgia, serif;
    font-weight: 400;
    font-size: clamp(2.5rem, 5.5vw, 5.5rem);
    line-height: 1.08;
    letter-spacing: -0.02em;
  }
`;

// ─── Main HeroHighlight component ─────────────────────────────────────────────
export default function HeroHighlight() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState(null);
  const tabRefs = useRef([]);
  const liveRef = useRef(null);

  const nav = useNavigate()

  // Detect prefers-reduced-motion
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const activeGrade = GRADES[activeIdx];

  function switchTab(idx) {
    if (idx === activeIdx) return;
    setPrevIdx(activeIdx);
    setActiveIdx(idx);
  }

  // Keyboard navigation for tab bar
  function handleTabKey(e, idx) {
    if (e.key === 'ArrowRight') {
      const next = (idx + 1) % GRADES.length;
      switchTab(next);
      tabRefs.current[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      const prev = (idx - 1 + GRADES.length) % GRADES.length;
      switchTab(prev);
      tabRefs.current[prev]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      switchTab(idx);
    }
  }

  return (
    <>
      <style>{HERO_STYLES}</style>
      <div
        className="relative flex flex-col min-h-screen w-full"
        style={{ background: '#fafaf9', color: '#1c1917' }}
      >
        {/* ── Navigation ─────────────────────────────────────────── */}
        <nav className="flex items-center justify-center px-6 md:px-12 py-5 w-full" aria-label="Main navigation">
          {/* Grade tabs (nav center) */}
          <div className="hidden md:flex">
            <GradeTabBar activeIdx={activeIdx} onSwitch={switchTab} onKeyDown={handleTabKey} id="desktop" />
          </div>
        </nav>

        {/* ── Mobile tab bar ─────────────────────────────────────── */}
        <div className="md:hidden flex items-center justify-center px-4 pb-2">
          <GradeTabBar activeIdx={activeIdx} onSwitch={switchTab} onKeyDown={handleTabKey} id="mobile" />
        </div>

        {/* ── Main content ───────────────────────────────────────── */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 pb-16">
          <div className="w-full max-w-4xl text-center">

            {/* ARIA live region for grade changes */}
            <div
              ref={liveRef}
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
            >
              {`Now showing: ${activeGrade.label} — ${activeGrade.headlineHighlight}`}
            </div>

            {/* ── Headline ─────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeGrade.id + '-headline'}
                initial={reduced ? {} : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? {} : { opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              >
                <h1 className="hero-headline flex flex-col gap-3 text-center mb-6" style={{ color: '#1c1917' }}>
                  {/* Static part */}
                  {activeGrade.headlinePre}{' '}
                  {/* Highlight box */}
                  <span className=''>
                    <span
                      className="inline-block relative align-middle"
                      style={{
                        background: activeGrade.color,
                        border: `1px solid rgba(0,0,0,0.06)`,
                        borderRadius: 16,
                        width: 'fit-content',
                        padding: '0.12em 0.32em',
                        lineHeight: 1.15,
                        verticalAlign: 'middle',
                        overflow: 'hidden',
                        minWidth: 120,
                      }}
                    >
                      {/* Text label */}
                      <span className="hero-highlight-text relative z-10" style={{ color: '#1c1917' }}>
                        {activeGrade.headlineHighlight}
                      </span>
                    </span>
                  </span>
                </h1>
              </motion.div>
            </AnimatePresence>

            {/* ── Media card (live viewport) ───────────────────── */}
            <div
              className="relative w-full flex items-center rounded-2xl mb-8 mx-auto overflow-hidden"
              style={{
                border: `1px solid ${activeGrade.border}`,
                background: activeGrade.color + '30',
                aspectRatio: '5 / 3',
                maxWidth: 520,
                transition: 'background 0.4s, border-color 0.4s',
              }}
              role="region"
              aria-label={`Interactive media for ${activeGrade.label}`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeGrade.id + '-media'}
                  initial={reduced ? {} : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduced ? {} : { opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="w-full h-full"
                >
                  <HighlightMedia gradeId={activeGrade.id} reduced={reduced} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Subhead ──────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              <motion.p
                key={activeGrade.id + '-sub'}
                initial={reduced ? {} : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? {} : { opacity: 0, y: -4 }}
                transition={{ duration: 0.24, delay: 0.06 }}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 16,
                  color: '#78716c',
                  fontWeight: 400,
                  marginBottom: 28,
                  maxWidth: 340,
                  margin: '0 auto 28px',
                }}
              >
                {activeGrade.sub}
              </motion.p>
            </AnimatePresence>

            {/* ── CTA buttons ──────────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              {/* Primary CTA */}
              <motion.button
                whileHover={reduced ? {} : { scale: 1.05, boxShadow: `0 8px 24px ${activeGrade.color}99` }}
                whileTap={reduced ? {} : { scale: 0.98 }}
                onClick={()=>{
                  nav("/games")
                }}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  fontWeight: 500,
                  background: activeGrade.color,
                  color: '#1c1917',
                  border: 'none',
                  borderRadius: 999,
                  padding: '12px 24px',
                  cursor: 'pointer',
                  transition: 'background 0.3s',
                }}
              >
                Start Your Journey
              </motion.button>
            </div>

            {/* ── Trust bar ────────────────────────────────────── */}
            <TrustBar />

          </div>
        </main>
      </div>
    </>
  );
}
