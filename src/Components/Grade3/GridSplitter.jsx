import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, HelpCircle, ChevronRight, RotateCcw } from 'lucide-react'

// ─── Level config ─────────────────────────────────────────────────────────────
const LEVEL_CONFIG = { label: 'LEVEL 1', desc: 'Split the larger factor (11–19 × 2–9)', minA: 11, maxA: 19, minB: 2, maxB: 9 }

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomPuzzle() {
  const a = randInt(LEVEL_CONFIG.minA, LEVEL_CONFIG.maxA)
  const b = randInt(LEVEL_CONFIG.minB, LEVEL_CONFIG.maxB)
  return { rows: b, cols: a }
}

function buildChoices(correct) {
  const offsets = [-20, -10, -5, -3, 3, 5, 10, 20]
  const wrong = new Set()
  for (const off of [...offsets].sort(() => Math.random() - 0.5)) {
    const w = correct + off
    if (w > 0 && w !== correct) wrong.add(w)
    if (wrong.size === 3) break
  }
  return [...wrong, correct].sort(() => Math.random() - 0.5)
}

// cell size — keep grid manageable
function cellSize(rows, cols) {
  const maxDim = Math.max(rows, cols)
  if (maxDim <= 12) return 38
  if (maxDim <= 16) return 30
  return 24
}

// ─── Color palette ────────────────────────────────────────────────────────────
const LEFT_COLOR  = { bg: '#dbeafe', border: '#3b82f6', text: '#1d4ed8', solid: '#3b82f6' }
const RIGHT_COLOR = { bg: '#fef9c3', border: '#ca8a04', text: '#92400e', solid: '#ca8a04' }

// ─── Component ────────────────────────────────────────────────────────────────
export default function GridSplitter() {
  const navigate   = useNavigate()
  const [puzzle,   setPuzzle]    = useState(() => randomPuzzle())
  // splitCol: column index (0-based) after which the split happens
  // 0 means no split; valid range 1 … cols-1
  const [splitCol,  setSplitCol]  = useState(null)
  const [showAlgo,  setShowAlgo]  = useState(false)
  const [choices,   setChoices]   = useState([])
  const [selected,  setSelected]  = useState(null)
  const [result,    setResult]    = useState(null)  // null | 'correct' | 'wrong'
  const [score,     setScore]     = useState(0)
  const [showHelp,  setShowHelp]  = useState(false)

  // drag state for the split handle
  const isDragging  = useRef(false)
  const gridRef     = useRef(null)

  const { rows, cols } = puzzle
  const product = rows * cols
  const cs      = cellSize(rows, cols)

  // derived split values
  const leftCols  = splitCol ?? Math.floor(cols / 2)
  const rightCols = cols - leftCols
  const leftProd  = rows * leftCols
  const rightProd = rows * rightCols

  // generate choices when puzzle changes
  useEffect(() => {
    setChoices(buildChoices(product))
    setSelected(null)
    setResult(null)
    setSplitCol(null)
  }, [puzzle, product])

  // ── drag split handle ────────────────────────────────────────────────────────
  function colFromEvent(e) {
    const grid = gridRef.current
    if (!grid) return null
    const rect    = grid.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const relX    = clientX - rect.left
    const col     = Math.round(relX / (cs + 2))
    return Math.max(1, Math.min(cols - 1, col))
  }

  function onHandlePointerDown(e) {
    e.preventDefault()
    isDragging.current = true
  }

  function onGridPointerMove(e) {
    if (!isDragging.current) return
    const col = colFromEvent(e)
    if (col !== null) setSplitCol(col)
  }

  function onPointerUp() {
    isDragging.current = false
  }

  useEffect(() => {
    window.addEventListener('pointerup', onPointerUp)
    return () => window.removeEventListener('pointerup', onPointerUp)
  }, [])

  // ── answer select ────────────────────────────────────────────────────────────
  function handleSelect(choice) {
    if (result === 'correct' || result === 'wrong') return
    setSelected(choice)
    const ok = choice === product
    setResult(ok ? 'correct' : 'wrong')
    if (ok) setScore(s => s + 100)
  }

  function nextPuzzle() {
    setPuzzle(randomPuzzle())
  }

  function reset() {
    setSplitCol(null)
    setSelected(null)
    setResult(null)
  }

  // handle position in pixels from left of grid
  const handleX = leftCols * (cs + 2) - 1

  return (
    <div className="h-screen bg-[#eef4fb] flex flex-col select-none font-sans overflow-hidden">

      {/* ── header ── */}
      <header className="w-full px-4 py-2 flex items-center justify-between shrink-0 bg-white border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200">
            <ArrowLeft size={20} />
          </button>
          <span className="font-bold text-blue-700 text-xl">Grid Splitter</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-600">{LEVEL_CONFIG.label}</span>
          <span className="text-xs text-amber-600 font-bold ml-2">⭐ {score}</span>
          <button onClick={() => setShowHelp(h => !h)} className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-500">
            <HelpCircle size={16} />
          </button>
        </div>
      </header>
      {/* ── scrollable body ── */}
      <div className="flex flex-col items-center flex-1 overflow-y-auto no-scrollbar px-4 py-5 gap-5">

        {showHelp && (
          <div className="w-full max-w-3xl bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 text-sm text-blue-700">
            Drag the blue line to split the grid into two rectangles. Any split position is valid!
            The game will show you the partial products and how they add up.
          </div>
        )}

        {/* level badge + equation */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-full">
            {LEVEL_CONFIG.label}: Distributive Property
          </span>
          <h2 className="text-4xl font-black text-slate-800">
            {cols} × {rows} = <span className="text-blue-500">?</span>
          </h2>
          <p className="text-slate-400 text-sm">Split the grid to make the multiplication easier!</p>
        </div>

        {/* ── grid workspace card ── */}
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-sm border border-slate-100 p-6">

          {/* top info row */}
          <div className="flex items-end justify-center mb-3">
            <div className="flex gap-3">
              <div className="flex flex-col items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Height</span>
                <span className="text-xl font-black text-slate-700">{rows}</span>
              </div>
              <div className="flex flex-col items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Width</span>
                <span className="text-xl font-black text-slate-700">{cols}</span>
              </div>
            </div>
          </div>
            {/* split column labels above grid */}
            <div className="flex items-center justify-center gap-1 text-base font-black mr-2">
              <span style={{ color: LEFT_COLOR.solid }}>{leftCols}</span>
              <span className="text-slate-300 text-sm">+</span>
              <span style={{ color: RIGHT_COLOR.solid }}>{rightCols}</span>
            </div>

          {/* left height label + grid */}  
          <div className="flex items-center justify-center gap-3">

            {/* grid container — relative for the split handle */}
            <div
              ref={gridRef}
              className="relative"
              style={{ userSelect: 'none' }}
              onPointerMove={onGridPointerMove}
            >
              {/* column indices above */}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cs}px)`, gap: 2, marginBottom: 4 }}>
                {Array.from({ length: cols }, (_, c) => (
                  <div key={c} className="flex items-end justify-center" style={{ height: 16 }}>
                    <span className="text-[9px] font-bold text-slate-400">{c + 1}</span>
                  </div>
                ))}
              </div>

              {/* the grid itself */}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cs}px)`, gap: 2 }}>
                {Array.from({ length: rows }, (_, r) =>
                  Array.from({ length: cols }, (_, c) => {
                    const isLeft = c < leftCols
                    return (
                      <div
                        key={`${r}-${c}`}
                        style={{
                          width: cs, height: cs,
                          background: isLeft ? LEFT_COLOR.bg : RIGHT_COLOR.bg,
                          borderRadius: 3,
                          border: `1.5px solid ${isLeft ? LEFT_COLOR.border : RIGHT_COLOR.border}`,
                          opacity: 0.85,
                          transition: 'background 0.1s, border-color 0.1s',
                        }}
                      />
                    )
                  })
                )}
              </div>

              {/* row indices on the right */}
              <div
                className="absolute top-0 flex flex-col"
                style={{ left: cols * (cs + 2) + 6, gap: 2, paddingTop: 20 }}
              >
                {Array.from({ length: rows }, (_, r) => (
                  <div key={r} className="flex items-center" style={{ height: cs }}>
                    <span className="text-[9px] font-bold text-slate-400">{r + 1}</span>
                  </div>
                ))}
              </div>

              {/* ── split handle (draggable vertical line) ── */}
              <div
                style={{
                  position: 'absolute',
                  top: 20,    // below col indices
                  left: handleX,
                  width: 4,
                  height: rows * (cs + 2) - 2,
                  background: LEFT_COLOR.solid,
                  borderRadius: 4,
                  cursor: 'col-resize',
                  zIndex: 10,
                  boxShadow: '0 0 8px rgba(59,130,246,0.6)',
                }}
                onPointerDown={onHandlePointerDown}
              >
                {/* drag knob */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 22, height: 22,
                  borderRadius: '50%',
                  background: LEFT_COLOR.solid,
                  border: '3px solid white',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 11, fontWeight: 'bold',
                  cursor: 'col-resize',
                }}>
                  ⇔
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── left + right area cards ── */}
        <div className="w-full max-w-3xl flex items-center gap-4">
          {/* LEFT area */}
          <div className="flex-1 bg-white rounded-2xl border-2 shadow-sm px-5 py-4 flex flex-col gap-1"
            style={{ borderColor: LEFT_COLOR.border }}>
            <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: LEFT_COLOR.solid }}>Left Area</span>
            <div className="flex items-center gap-1 text-lg font-black">
              <span className="px-2 py-0.5 rounded border-2 font-black" style={{ borderColor: LEFT_COLOR.border, color: LEFT_COLOR.text }}>{leftCols}</span>
              <span className="text-slate-400">×</span>
              <span className="px-2 py-0.5 rounded border-2 font-black" style={{ borderColor: LEFT_COLOR.border, color: LEFT_COLOR.text }}>{rows}</span>
              <span className="text-slate-400">=</span>
              <span className="font-black text-xl" style={{ color: LEFT_COLOR.solid }}>{leftProd}</span>
            </div>
            {showAlgo && (
              <p className="text-xs text-slate-400 font-semibold">{leftCols} × {rows} = {leftProd}</p>
            )}
          </div>

          {/* + symbol */}
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-lg shrink-0">+</div>

          {/* RIGHT area */}
          <div className="flex-1 bg-white rounded-2xl border-2 shadow-sm px-5 py-4 flex flex-col gap-1"
            style={{ borderColor: RIGHT_COLOR.border }}>
            <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: RIGHT_COLOR.solid }}>Right Area</span>
            <div className="flex items-center gap-1 text-lg font-black">
              <span className="px-2 py-0.5 rounded border-2 font-black" style={{ borderColor: RIGHT_COLOR.border, color: RIGHT_COLOR.text }}>{rightCols}</span>
              <span className="text-slate-400">×</span>
              <span className="px-2 py-0.5 rounded border-2 font-black" style={{ borderColor: RIGHT_COLOR.border, color: RIGHT_COLOR.text }}>{rows}</span>
              <span className="text-slate-400">=</span>
              <span className="font-black text-xl" style={{ color: RIGHT_COLOR.solid }}>{rightProd}</span>
            </div>
            {showAlgo && (
              <p className="text-xs text-slate-400 font-semibold">{rightCols} × {rows} = {rightProd}</p>
            )}
          </div>
        </div>

        {/* ── sum row + check / MC ── */}
        <div className="w-full max-w-3xl flex items-center justify-between gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-4">
          <div className="text-xl font-black text-slate-700 flex items-center gap-2">
            <span style={{ color: LEFT_COLOR.solid }}>{leftProd}</span>
            <span className="text-slate-400">+</span>
            <span style={{ color: RIGHT_COLOR.solid }}>{rightProd}</span>
            <span className="text-slate-400">=</span>
            <span className="text-slate-800"> { result === 'correct' ? leftProd + rightProd : '?' }</span>
          </div>

          {result === null && (
            <button
              onClick={() => {
                setChoices(buildChoices(product))
                setResult('choosing')
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-full shadow-md transition-colors"
            >
              Check Split <ChevronRight size={16} />
            </button>
          )}
          {result === 'choosing' && (
            <span className="text-sm font-bold text-slate-500">Pick the answer →</span>
          )}
          {result === 'correct' && (
            <div className="flex items-center gap-3">
              <span className="text-emerald-600 font-black">🎉 Correct!</span>
              <button onClick={nextPuzzle} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-2 rounded-full shadow-md transition-colors text-sm">
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
          {result === 'wrong' && (
            <div className="flex items-center gap-3">
              <span className="text-red-500 font-bold text-sm">Not quite!</span>
              <button onClick={reset} className="bg-white border border-slate-200 text-slate-600 font-bold py-1.5 px-4 rounded-full text-sm hover:bg-slate-50">
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* MC choices — shown after Check Split is pressed */}
        {result === 'choosing' && (
          <div className="w-full max-w-3xl flex flex-col gap-3">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 text-center uppercase">
              What is {cols} × {rows}?
            </p>
            <div className="grid grid-cols-4 gap-3">
              {choices.map(c => (
                <button key={c}
                  onClick={() => handleSelect(c)}
                  className="py-4 rounded-2xl text-2xl font-black border-2 transition-all active:scale-95 shadow-sm border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* feedback */}
        {result === 'correct' && (
          <div className="w-full max-w-3xl bg-emerald-50 border-2 border-emerald-300 text-emerald-700 rounded-2xl px-6 py-4 font-bold text-center">
            🎉 {cols} × {rows} = ({leftCols} + {rightCols}) × {rows} = {leftProd} + {rightProd} = {product}
          </div>
        )}
        {result === 'wrong' && (
          <div className="w-full max-w-3xl bg-red-50 border-2 border-red-300 text-red-600 rounded-2xl px-6 py-4 font-bold text-center text-sm">
            The partial products add up to {leftProd + rightProd}. Check your multiplication!
          </div>
        )}

        {/* reset */}
        <button onClick={reset} className="flex items-center gap-1 text-slate-400 hover:text-red-400 text-sm font-semibold">
          <RotateCcw size={13} /> Reset
        </button>

      </div>
    </div>
  )
}
