import { motion, LayoutGroup } from 'framer-motion';
import { GRADES } from './gradesData';

export default function GradeTabBar({ activeIdx, onSwitch, onKeyDown, id }) {
  return (
    <LayoutGroup id={id}>
      <div
        role="tablist"
        aria-label="Grade portals"
        className="relative flex items-center gap-1 rounded-full px-2 py-1.5"
        style={{ background: '#f5f5f4', border: '1px solid #e7e5e4' }}
      >
        {GRADES.map((g, i) => {
          const isActive = i === activeIdx;
          return (
            <button
              key={g.id}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSwitch(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className="relative px-4 py-1.5 rounded-full text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
              style={{
                color: isActive ? '#1c1917' : '#78716c',
                fontFamily: 'Inter, sans-serif',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {/* Added z-0 to ensure it stays in the correct stacking layer */}
              {isActive && (
                <motion.span
                  layoutId={`active-pill-${id}`}
                  className="absolute inset-0 rounded-full z-0"
                  style={{ background: g.color }}
                  transition={{ type: 'spring', stiffness: 400, damping: 38 }}
                />
              )}

              {/* z-10 keeps the text cleanly on top of the pill */}
              <span className="relative z-10">{g.label}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
