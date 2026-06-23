import { useState, useEffect } from 'react';

export default function MediaFutureMastery({ reduced }) {
  const [cursor, setCursor] = useState(true);
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div className="flex items-stretch gap-2 w-full px-3 py-2 h-full">
      {/* Python snippet */}
      <div className="flex-1 rounded-xl p-3 text-left"
        style={{ background: '#0f172a', minWidth: 0 }}>
        <p style={{ fontSize: 9, color: '#94a3b8', fontFamily: 'monospace', marginBottom: 4 }}>// main.py</p>
        <p style={{ fontSize: 10, fontFamily: 'monospace', lineHeight: 1.6 }}>
          <span style={{ color: '#818cf8' }}>def </span>
          <span style={{ color: '#facc15' }}>analyse_logic</span>
          <span style={{ color: '#e2e8f0' }}>():</span>
        </p>
        <p style={{ fontSize: 10, fontFamily: 'monospace', lineHeight: 1.6, paddingLeft: 12 }}>
          <span style={{ color: '#94a3b8' }}>return </span>
          <span style={{ color: '#34d399' }}>education_ai</span>
          <span style={{ color: '#e2e8f0' }}>.solve()</span>
          <span style={{ color: '#f8fafc', opacity: cursor ? 1 : 0 }}>|</span>
        </p>
      </div>
      {/* Citation connector */}
      <div className="flex flex-col items-center justify-center" style={{ width: 20 }}>
        <div className='bg-linear-to-t from-gray-400 to-transparent' style={{ flex: 1, width: 1 }} />
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#546177ff', flexShrink: 0 }} />
        <div className='bg-linear-to-b from-gray-400 to-transparent' style={{ flex: 1, width: 1 }} />
      </div>
      {/* LaTeX formula */}
      <div className="flex-1 rounded-xl p-3 flex flex-col items-center justify-center"
        style={{ background: '#fafaf9', border: '1px solid #e5e7eb', minWidth: 0 }}>
        <svg viewBox="0 0 120 36" width="110" height="34" aria-label="Integral of f(x) dx equals F(x) plus C">
          <text x="2" y="26" fontSize="18" fontFamily="'Times New Roman', serif" fill="#1c1917">∫</text>
          <text x="18" y="24" fontSize="13" fontFamily="'Times New Roman', serif" fontStyle="italic" fill="#1c1917">f(x) dx = F(x) + C</text>
        </svg>
        <p style={{ fontSize: 8, color: '#9ca3af', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>Calculus II · NCERT</p>
      </div>
    </div>
  );
}
