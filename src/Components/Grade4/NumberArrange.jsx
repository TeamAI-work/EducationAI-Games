import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";

/* ─── helpers ──────────────────────────────────────────────────── */
function buildSolved(n) {
  const total = n * n;
  return Array.from({ length: total }, (_, i) => (i < total - 1 ? i + 1 : 0));
}

function isSolvable(tiles, n) {
  const arr = tiles.filter((t) => t !== 0);
  let inv = 0;
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)
      if (arr[i] > arr[j]) inv++;
  const blankRow = Math.floor(tiles.indexOf(0) / n);
  if (n % 2 === 1) return inv % 2 === 0;
  return blankRow % 2 === 0 ? inv % 2 === 1 : inv % 2 === 0;
}

function shuffle(n) {
  let arr = buildSolved(n);
  do {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  } while (
    !isSolvable(arr, n) ||
    JSON.stringify(arr) === JSON.stringify(buildSolved(n))
  );
  return arr;
}

function checkWin(tiles, n) {
  return tiles.every((v, i) => v === buildSolved(n)[i]);
}

/* ─── main component ───────────────────────────────────────────── */
export default function NumberArrange() {
  const navigate = useNavigate();
  const [size, setSize] = useState(3);
  const [tiles, setTiles] = useState(() => shuffle(3));
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const [shine, setShine] = useState(false);
  const [shineIdx, setShineIdx] = useState(-1);
  const timerRef = useRef(null);
  const shineRef = useRef(null);
  const [timerStart, setTimerStart] = useState(false);

  /* ── timer ── */
  useEffect(() => {
    if (running && timerStart) {
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running, timerStart]);

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  /* ── game reset ── */
  const startGame = useCallback((n) => {
    clearTimeout(shineRef.current);
    setSize(n);
    setTiles(shuffle(n));
    setMoves(0);
    setWon(false);
    setShine(false);
    setShineIdx(-1);
    setElapsed(0);
    setRunning(true);
    setTimerStart(true);
  }, []);

  /* ── diagonal shine wave (bottom-right → top-left, loops while won) ── */
  const triggerShine = useCallback((n) => {
    setShine(true);
    const totalDiags = 2 * n - 1;
    let d = totalDiags - 1;
    const step = () => {
      setShineIdx(d);
      d--;
      if (d >= 0) {
        shineRef.current = setTimeout(step, 110);
      } else {
        shineRef.current = setTimeout(() => triggerShine(n), 600);
      }
    };
    step();
  }, []);

  /* ── tile click ── */
  const handleTileClick = useCallback(
    (idx) => {
      if (won) return;
      if (!timerStart) {
        setTimerStart(true);
      }
      const n = size;
      const blankIdx = tiles.indexOf(0);
      const row = Math.floor(idx / n), col = idx % n;
      const bRow = Math.floor(blankIdx / n), bCol = blankIdx % n;
      const adjacent =
        (row === bRow && Math.abs(col - bCol) === 1) ||
        (col === bCol && Math.abs(row - bRow) === 1);
      if (!adjacent) return;

      const next = [...tiles];
      [next[idx], next[blankIdx]] = [next[blankIdx], next[idx]];
      setTiles(next);
      setMoves((m) => m + 1);

      if (checkWin(next, n)) {
        setWon(true);
        setRunning(false);
        shineRef.current = setTimeout(() => triggerShine(n), 200);
      }
    },
    [tiles, won, size, triggerShine]
  );

  /* ── keyboard ── */
  useEffect(() => {
    const handler = (e) => {
      if (won) return;
      const n = size;
      const blankIdx = tiles.indexOf(0);
      const bRow = Math.floor(blankIdx / n), bCol = blankIdx % n;
      let target = -1;
      if (e.key === "ArrowRight" && bCol > 0) target = blankIdx - 1;
      if (e.key === "ArrowLeft" && bCol < n - 1) target = blankIdx + 1;
      if (e.key === "ArrowDown" && bRow > 0) target = blankIdx - n;
      if (e.key === "ArrowUp" && bRow < n - 1) target = blankIdx + n;
      if (target !== -1) { e.preventDefault(); handleTileClick(target); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [tiles, won, size, handleTileClick]);

  const total = size * size - 1;

  /* diagonal index: 0 = bottom-right, 2n-2 = top-left */
  const diagOf = (idx) => {
    const n = size;
    const row = Math.floor(idx / n), col = idx % n;
    return (n - 1 - row) + (n - 1 - col);
  };

  /* tile dimensions */
  const tileSize = size === 3 ? 88 : size === 4 ? 72 : 58;
  const gap = 6;
  const fontSize = size === 3 ? 26 : size === 4 ? 20 : 16;

  const SIZES = [3, 4, 5];

  return (
    <div className="min-h-screen bg-[#eef4fb] flex flex-col font-sans select-none">

      {/* ── header ── */}
      <header className="w-full px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors"
          >
            <ArrowLeft size={30} />
          </button>
          <span className="font-bold text-blue-700 text-4xl">Number Puzzle</span>
        </div>

        {/* size selector in header */}
        <div className="flex items-center gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => startGame(s)}
              className={`py-1 px-3 rounded-full text-xs font-bold transition-colors border ${
                s === size
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
              }`}
            >
              {s}×{s}
            </button>
          ))}
        </div>
      </header>

      {/* ── body ── */}
      <div className="flex flex-col items-center flex-1 px-4 py-6 gap-6 overflow-y-auto">

        {/* stats row */}
        <div className="flex items-center gap-3">
          {[
            { label: "Moves", value: moves },
            { label: "Time",  value: fmt(elapsed) },
            { label: "Goal",  value: `1 – ${total}` },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-2 min-w-[80px]"
            >
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">{label}</span>
              <span className="text-xl font-black text-blue-700">{value}</span>
            </div>
          ))}
        </div>

        {/* win banner */}
        {won && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-3 text-emerald-700 font-bold text-base flex items-center gap-2 shadow-sm">
            🎉 Solved in <span className="text-emerald-800">{moves} moves</span> &amp; <span className="text-emerald-800">{fmt(elapsed)}</span>!
          </div>
        )}

        {/* ── board ── */}
        <div
          className="grid bg-white rounded-3xl border border-slate-100 shadow-sm"
          style={{
            gridTemplateColumns: `repeat(${size}, ${tileSize}px)`,
            gridTemplateRows: `repeat(${size}, ${tileSize}px)`,
            gap: `${gap}px`,
            padding: "12px",
          }}
        >
          {tiles.map((num, idx) => {
            const isBlank = num === 0;
            const isShining = shine && diagOf(idx) === shineIdx;

            /* position in solved order → subtle blue shade */
            const goalPos = num - 1; // 0-indexed position in solved state
            const hue = num === 0 ? 0 : Math.round((num / total) * 60); // 0–60° (blue family)

            return (
              <div
                key={idx}
                onClick={() => !isBlank && handleTileClick(idx)}
                className="flex items-center justify-center font-black rounded-xl transition-all duration-150 ease-in-out"
                style={{
                  width: tileSize,
                  height: tileSize,
                  fontSize,
                  cursor: isBlank ? "default" : "pointer",
                  pointerEvents: isBlank ? "none" : "auto",
                  letterSpacing: "-0.5px",
                  background: isBlank
                    ? "#f1f5f9"
                    : isShining
                    ? "#fbbf24"
                    : `hsl(${210 + hue}, 80%, 60%)`,
                  color: isBlank ? "transparent" : isShining ? "#fff" : "#fff",
                  boxShadow: isBlank
                    ? "none"
                    : isShining
                    ? "0 0 18px 6px rgba(251,191,36,0.55), 0 4px 0 #d97706"
                    : `0 4px 0 hsl(${210 + hue}, 80%, 42%), 0 6px 14px rgba(0,0,0,0.10)`,
                  transform: isShining ? "scale(1.08)" : "scale(1)",
                }}
              >
                {num !== 0 && num}
              </div>
            );
          })}
        </div>

        {/* ── reset button ── */}
        <button
          onClick={() => startGame(size)}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 font-bold px-6 py-2.5 rounded-full shadow-sm hover:border-blue-300 hover:text-blue-600 transition-colors active:scale-95"
        >
          <RotateCcw size={16} />
          Reset
        </button>

        {/* hint */}
        <p className="text-[11px] text-slate-400 font-medium tracking-wide">
          Tap a tile next to the empty space — or use arrow keys
        </p>
      </div>
    </div>
  );
}