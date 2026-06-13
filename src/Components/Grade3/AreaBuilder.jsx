import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, HelpCircle, RotateCcw, ChevronRight } from 'lucide-react'

// ─── Colours per region ───────────────────────────────────────────────────────
const REGION_COLORS = [
    { bg: '#3b82f6', light: '#dbeafe', text: '#1d4ed8', name: 'Blue' },
    { bg: '#22c55e', light: '#dcfce7', text: '#15803d', name: 'Green' },
    { bg: '#f59e0b', light: '#fef3c7', text: '#b45309', name: 'Amber' },
    { bg: '#a855f7', light: '#f3e8ff', text: '#7e22ce', name: 'Purple' },
]

// ─── Level configs ────────────────────────────────────────────────────────────
const LEVEL_CONFIGS = [
    { label: 'LEVEL 1', desc: 'Single × Single', rowMin: 2, rowMax: 9, colMin: 2, colMax: 9 },
    { label: 'LEVEL 2', desc: 'Single × Double', rowMin: 2, rowMax: 9, colMin: 10, colMax: 19 },
    { label: 'LEVEL 3', desc: 'Double × Double', rowMin: 10, rowMax: 15, colMin: 10, colMax: 15 },
]

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomPuzzle(levelIdx) {
    const cfg = LEVEL_CONFIGS[levelIdx]
    return { rows: randInt(cfg.rowMin, cfg.rowMax), cols: randInt(cfg.colMin, cfg.colMax) }
}

// ─── Decompose into sub-grids ─────────────────────────────────────────────────
// Returns array of { rows, cols, label, colorIdx }
function decompose(rows, cols) {
    const rSplit = rows >= 10 ? [10, rows - 10] : [rows]
    const cSplit = cols >= 10 ? [10, cols - 10] : [cols]
    const regions = []
    let colorIdx = 0
    for (const r of rSplit) {
        for (const c of cSplit) {
            if (r > 0 && c > 0) {
                regions.push({ rows: r, cols: c, product: r * c, colorIdx })
                colorIdx++
            }
        }
    }
    return regions
}

// ─── Build MC choices around correct answer ───────────────────────────────────
function buildChoices(correct) {
    const offsets = [-20, -10, -5, -2, 2, 5, 10, 20]
    const wrong = new Set()
    for (const off of [...offsets].sort(() => Math.random() - 0.5)) {
        const w = correct + off
        if (w > 0 && w !== correct) wrong.add(w)
        if (wrong.size === 3) break
    }
    return [...wrong, correct].sort(() => Math.random() - 0.5)
}

// ─── Cell size ────────────────────────────────────────────────────────────────
function cellSize(rows, cols) {
    const m = Math.max(rows, cols)
    if (m <= 9) return 45
    if (m <= 12) return 40
    return 40
}

// ─── Mini-grid component ──────────────────────────────────────────────────────
// Shows a fully shaded grid with sequential numbers and a count badge.
function MiniGrid({ rows, cols, colorIdx, showNumbers }) {
    const color = REGION_COLORS[colorIdx]
    const cs = cellSize(rows, cols)
    return (
        <div className="flex flex-col items-center gap-2">
            <div
                className="rounded-2xl overflow-hidden"
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols}, ${cs}px)`,
                    gap: 2,
                }}
            >
                {Array.from({ length: rows * cols }, (_, i) => (
                    <div
                        key={i}
                        style={{
                            width: cs, height: cs,
                            background: color.bg,
                            borderRadius: 3,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white',
                            fontSize: cs > 38 ? 12 : 9,
                            fontWeight: 'bold',
                        }}
                    >
                        {showNumbers ? i + 1 : ''}
                    </div>
                ))}
            </div>
            <div
                className="text-xs font-black px-3 py-1 rounded-full"
                style={{ background: color.light, color: color.text }}
            >
                {rows} × {cols} = {rows * cols}
            </div>
        </div>
    )
}

// ─── Interactive drag-to-fill grid ───────────────────────────────────────────
// The grid is BUFFER cells larger than the target in both dimensions so the
// student must consciously stop at the correct boundary.
const BUFFER = 3

function DragGrid({ targetRows, targetCols, colorIdx, onComplete }) {
    const [shadedRows, setShadedRows] = useState(0)
    const [shadedCols, setShadedCols] = useState(0)
    const [dragging, setDragging] = useState(false)
    const [done, setDone] = useState(false)
    const color = REGION_COLORS[colorIdx]
    const cs = cellSize(targetRows, targetCols)
    const totalRows = targetRows + BUFFER
    const totalCols = targetCols + BUFFER

    useEffect(() => {
        const up = () => setDragging(false)
        window.addEventListener('pointerup', up)
        return () => window.removeEventListener('pointerup', up)
    }, [])

    function cellDown(r, c) {
        if (done) return
        setDragging(true)
        setShadedRows(r + 1)
        setShadedCols(c + 1)
    }
    function cellEnter(r, c) {
        if (!dragging || done) return
        setShadedRows(r + 1)
        setShadedCols(c + 1)
    }

    function handleConfirm() {
        if (shadedRows === targetRows && shadedCols === targetCols) {
            setDone(true)
            onComplete(true)
        } else {
            onComplete(false)
        }
    }

    // Is the selection exactly right?
    const exact = shadedRows === targetRows && shadedCols === targetCols

    return (
        <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-bold text-slate-600 text-center">
                Shade exactly{' '}
                <span className="font-black" style={{ color: color.bg }}>
                    {targetRows} rows × {targetCols} cols
                </span>
            </p>

            <div className="flex gap-2 items-start">
                {/* row number labels (left) — spacer + row indices */}
                <div className="flex flex-col" style={{ gap: 2 }}>
                    {/* blank corner cell above row labels */}
                    <div style={{ height: cs, width: 20 }} />
                    {Array.from({ length: totalRows }, (_, r) => (
                        <div key={r}
                            className="flex items-center justify-end pr-1"
                            style={{ height: cs, width: 20 }}
                        >
                            <span className="text-[10px] font-bold text-slate-400">{r + 1}</span>
                        </div>
                    ))}
                </div>

                {/* grid + column indices above */}
                <div className="flex flex-col" style={{ gap: 2 }}>
                    {/* column index row */}
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${totalCols}, ${cs}px)`, gap: 2 }}>
                        {Array.from({ length: totalCols }, (_, c) => (
                            <div key={c}
                                className="flex items-end justify-center pb-0.5"
                                style={{ height: cs, width: cs }}
                            >
                                <span className="text-[10px] font-bold text-slate-400">{c + 1}</span>
                            </div>
                        ))}
                    </div>

                    {/* grid */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${totalCols}, ${cs}px)`,
                            gap: 2,
                            cursor: 'crosshair',
                        }}
                    >
                        {Array.from({ length: totalRows }, (_, r) =>
                            Array.from({ length: totalCols }, (_, c) => {
                                const shaded = r < shadedRows && c < shadedCols
                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        onPointerDown={() => cellDown(r, c)}
                                        onPointerEnter={() => cellEnter(r, c)}
                                        style={{
                                            width: cs, height: cs,
                                            background: shaded ? color.bg : '#e2e8f0',
                                            borderRadius: 3,
                                            border: '2px solid transparent',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: shaded ? 'white' : '#94a3b8',
                                            fontSize: cs > 38 ? 11 : 9,
                                            fontWeight: 'bold',
                                            userSelect: 'none',
                                            transition: 'background 0.08s',
                                        }}
                                    >
                                        {shaded && cs > 26 ? r * targetCols + c + 1 : ''}
                                    </div>
                                )
                            })
                        )}
                    </div>

                </div>{/* end flex-col grid+col-labels wrapper */}

                {/* running totals */}
                <div className="flex flex-col" style={{ gap: 2 }}>
                    {/* blank spacer matching the column-index row height */}
                    <div style={{ height: cs }} />
                    {Array.from({ length: totalRows }, (_, r) => {
                        const active = r < shadedRows
                        const isLast = r === shadedRows - 1
                        return (
                            <div key={r}
                                className="flex items-center justify-center rounded-md text-[10px] font-black transition-all"
                                style={{
                                    width: cs, height: cs,
                                    background: active && isLast ? '#ea580c' : 'transparent',
                                    color: active ? (isLast ? 'white' : color.bg) : '#e2e8f0',
                                }}
                            >
                                {active ? (r + 1) * shadedCols : ''}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* status bar */}
            <div className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors
        ${exact ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500'}`}>
                {shadedRows > 0
                    ? <>Shaded: {shadedRows} × {shadedCols} = <strong>{shadedRows * shadedCols}</strong>  |  Target: {targetRows} × {targetCols} = <strong>{targetRows * targetCols}</strong></>
                    : <>Target: {targetRows} rows × {targetCols} cols</>
                }
            </div>

            {!done && (
                <button
                    onClick={handleConfirm}
                    disabled={shadedRows === 0}
                    className={`px-5 py-2 rounded-full font-bold text-sm transition-all
            ${exact ? 'ring-2 ring-offset-1' : ''}
            ${shadedRows > 0 ? 'text-white shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    style={shadedRows > 0 ? { background: color.bg, ringColor: color.bg } : {}}
                >
                    {exact ? '✓ Confirm this grid' : 'Confirm this grid'}
                </button>
            )}
            {done && (
                <div className="text-sm font-bold text-emerald-600">✅ Grid complete!</div>
            )}
        </div>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AreaBuilder() {
    const navigate = useNavigate()
    const [levelIdx, setLevelIdx] = useState(0)
    const [puzzle, setPuzzle] = useState(() => randomPuzzle(0))
    const [phase, setPhase] = useState('intro')   // 'intro' | 'build' | 'answer'
    const [currentRegion, setCurrentRegion] = useState(0)         // which sub-grid we're building
    const [badRegion, setBadRegion] = useState(false)     // wrong shade attempt
    const [choices, setChoices] = useState([])
    const [selected, setSelected] = useState(null)
    const [result, setResult] = useState(null)
    const [showHelp, setShowHelp] = useState(false)
    const [score, setScore] = useState(0)

    const { rows, cols } = puzzle
    const product = rows * cols
    const regions = decompose(rows, cols)
    const isLevel1 = levelIdx === 0

    // ── phase transitions ──────────────────────────────────────────────────────
    function startBuilding() {
        setPhase(isLevel1 ? 'build' : 'build')
        setCurrentRegion(0)
        setBadRegion(false)
    }

    function handleRegionComplete(success) {
        if (!success) {
            setBadRegion(true)
            return
        }
        setBadRegion(false)
        if (currentRegion + 1 >= regions.length) {
            // all sub-grids done → answer phase
            setChoices(buildChoices(product))
            setSelected(null)
            setResult(null)
            setPhase('answer')
        } else {
            setCurrentRegion(r => r + 1)
        }
    }

    function handleSelect(choice) {
        if (result !== null) return
        setSelected(choice)
        const ok = choice === product
        setResult(ok ? 'correct' : 'wrong')
        if (ok) setScore(s => s + (isLevel1 ? 100 : levelIdx === 1 ? 150 : 200))
    }

    function nextPuzzle() {
        setPuzzle(randomPuzzle(levelIdx))
        setPhase('intro')
        setCurrentRegion(0)
        setBadRegion(false)
        setSelected(null)
        setResult(null)
    }

    function resetPuzzle() {
        setPhase('intro')
        setCurrentRegion(0)
        setBadRegion(false)
        setSelected(null)
        setResult(null)
    }

    function switchLevel(i) {
        setLevelIdx(i)
        setPuzzle(randomPuzzle(i))
        setPhase('intro')
        setCurrentRegion(0)
        setBadRegion(false)
        setSelected(null)
        setResult(null)
    }

    // ── decomposition equation string ─────────────────────────────────────────
    function decompStr() {
        return regions.map(r => `${r.rows}×${r.cols}`).join(' + ')
    }

    return (
        <div className="h-screen bg-[#eef2fb] flex flex-col select-none font-sans overflow-hidden">

            {/* ── header ── */}
            <header className="w-full px-4 py-2 flex items-center justify-between shrink-0">
                <header className="px-4 py-2 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200"
                        >
                            <ArrowLeft size={30} />
                        </button>
                        <span className="font-bold text-blue-700 text-4xl">Area Builder</span>
                    </div>
                </header>
                <div className="flex items-center gap-2">
                    {/* level tabs in header */}
                    {LEVEL_CONFIGS.map((l, i) => (
                        <button key={i} onClick={() => switchLevel(i)}
                            className={`py-1 px-3 rounded-full text-xs font-bold transition-colors border
                ${i === levelIdx ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}`}>
                            {l.label}
                        </button>
                    ))}
                    <button onClick={() => setShowHelp(h => !h)} className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-500">
                        <HelpCircle size={16} />
                    </button>
                </div>
            </header>

            {/* ── two-column body ── */}
            <div className="flex flex-1 overflow-hidden">

                {/* ════════════════════════════════════════════════
            LEFT — Grid workspace
            ════════════════════════════════════════════ */}
                <div className="flex flex-col items-center justify-center flex-1 overflow-y-auto no-scrollbar bg-[#e8eef8] border-r border-slate-200 px-6 py-6 gap-4">

                    {showHelp && (
                        <div className="w-full max-w-xl bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 text-sm text-blue-700">
                            Drag to shade the correct rows and columns. Confirm each grid when done.
                        </div>
                    )}

                    {/* PHASE: intro */}
                    {phase === 'intro' && (
                        <div className="flex flex-col items-center gap-5">
                            <div className="text-6xl">🟦</div>
                            <p className="text-slate-600 font-semibold text-center max-w-xs">
                                {isLevel1
                                    ? <>Drag to shade <strong>{rows} rows</strong> × <strong>{cols} columns</strong></>
                                    : <>We'll break <strong>{rows} × {cols}</strong> into <strong>{regions.length} colour-coded grids</strong>. Build each one!</>
                                }
                            </p>
                            <button
                                onClick={startBuilding}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-full shadow-md transition-colors"
                            >
                                Start Building <ChevronRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* PHASE: build */}
                    {phase === 'build' && (
                        <div className="flex flex-col items-center gap-4 w-full">
                            {/* region step dots */}
                            {regions.length > 1 && (
                                <div className="flex gap-2">
                                    {regions.map((reg, i) => {
                                        const color = REGION_COLORS[reg.colorIdx]
                                        const done = i < currentRegion
                                        const active = i === currentRegion
                                        return (
                                            <div key={i}
                                                className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all"
                                                style={{
                                                    background: done ? color.bg : active ? color.light : '#f1f5f9',
                                                    borderColor: color.bg,
                                                    color: done ? 'white' : color.text,
                                                }}
                                            >
                                                {done ? '✓' : i + 1}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {badRegion && (
                                <div className="bg-red-50 border border-red-300 text-red-600 rounded-2xl px-5 py-2 text-sm font-semibold text-center">
                                    ❌ Shade exactly {regions[currentRegion].rows} rows × {regions[currentRegion].cols} cols
                                </div>
                            )}

                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
                                <DragGrid
                                    key={`${currentRegion}-${puzzle.rows}-${puzzle.cols}`}
                                    targetRows={regions[currentRegion].rows}
                                    targetCols={regions[currentRegion].cols}
                                    colorIdx={regions[currentRegion].colorIdx}
                                    onComplete={handleRegionComplete}
                                />
                            </div>

                            <button onClick={resetPuzzle} className="flex items-center gap-1 text-slate-400 hover:text-red-500 text-sm font-semibold">
                                <RotateCcw size={14} /> Start over
                            </button>
                        </div>
                    )}

                    {/* PHASE: answer — show all completed mini-grids */}
                    {phase === 'answer' && (
                        <div className="flex flex-col items-center gap-4 w-full">
                            <p className="text-sm font-bold text-slate-500 text-center">Count all the squares!</p>
                            <div className="flex flex-wrap gap-5 justify-center">
                                {regions.map((reg, i) => (
                                    <MiniGrid key={i} rows={reg.rows} cols={reg.cols} colorIdx={reg.colorIdx} showNumbers={true} />
                                ))}
                            </div>
                            {/* partial sums equation */}
                            {levelIdx !== 0 && (
                                <div className="text-sm font-semibold text-slate-500 text-center">
                                    {regions.map((r, i) => (
                                        <span key={i}>
                                            <span className="font-black text-3xl" style={{ color: REGION_COLORS[r.colorIdx].bg }}>{r.product}</span>
                                            {i < regions.length - 1 && <span className="text-slate-400 text-3xl"> + </span>}
                                        </span>
                                    ))}
                                    {
                                        regions.length > 1 && <>
                                            <span className='font-black tex-slate-700 text-3xl'>
                                                {' = '}
                                            </span>
                                            <span className="font-black text-slate-700 text-3xl">?</span>
                                        </>
                                    }

                                </div>
                            )}

                        </div>
                    )}
                </div>

                {/* ════════════════════════════════════════════════
            RIGHT — Equation, breakdown, MC, feedback
            ════════════════════════════════════════════ */}
                <div className="w-[30%] flex flex-col overflow-y-auto no-scrollbar bg-white border-l border-slate-100 px-5 py-5 gap-5 shrink-0">

                    {/* equation card */}
                    <div className="bg-[#eef2fb] rounded-2xl px-4 py-4 flex flex-col items-center gap-3">
                        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Equation</p>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center text-xl font-black shadow">{rows}</div>
                            <span className="text-xl font-black text-slate-400">×</span>
                            <div className="w-12 h-12 rounded-xl bg-amber-400 text-white flex items-center justify-center text-xl font-black shadow">{cols}</div>
                            <span className="text-xl font-black text-slate-400">=</span>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shadow transition-colors
                ${result === 'correct' ? 'bg-emerald-500 text-white' : 'bg-orange-600 text-white'}`}>
                                {result === 'correct' ? product : '?'}
                            </div>
                        </div>

                        {/* distributive breakdown pills */}
                        {!isLevel1 && (
                            <div className="flex flex-col gap-4 w-full">
                                <p className="text-[20px] font-bold text-slate-400 uppercase tracking-wide text-center">Break it apart</p>

                                {/* (r1 + r2) × (c1 + c2) = … */}
                                <div className="flex flex-wrap items-center justify-center gap-1 text-sm font-bold text-slate-500">
                                    {/* row split */}
                                    {[...new Map(regions.map(r => [r.rows, r])).values()].map((reg, i, arr) => (
                                        <span key={i} className="flex items-center gap-1">
                                            <span className="px-2 py-0.5 rounded-lg text-xl font-black text-white" style={{ background: REGION_COLORS[reg.colorIdx].bg }}>
                                                {reg.rows}
                                            </span>
                                            {i < arr.length - 1 && <span className="text-slate-400 text-xl">+</span>}
                                        </span>
                                    ))}

                                    <span className="text-slate-400 font-black text-xl">×</span>

                                    {/* col split */}
                                    {[...new Map(regions.map(r => [r.cols, r])).values()].map((reg, i, arr) => (
                                        <span key={i} className="flex items-center gap-1">
                                            <span className="px-2 py-0.5 rounded-lg text-xl font-black text-white" style={{ background: REGION_COLORS[reg.colorIdx].bg }}>
                                                {reg.cols}
                                            </span>
                                            {i < arr.length - 1 && <span className="text-slate-400 text-xl">+</span>}
                                        </span>
                                    ))}

                                </div>

                                {/* region pills — fill in as each grid is built */}
                                <div className="flex flex-wrap justify-center gap-2">
                                    {regions.map((reg, i) => {
                                        const color = REGION_COLORS[reg.colorIdx]
                                        const isBuilt = phase === 'answer' || (phase === 'build' && i < currentRegion)
                                        return (
                                            <span key={i}
                                                className="px-2 py-1 rounded-full text-xl font-black border-2"
                                                style={{
                                                    background: isBuilt ? color.bg : color.light,
                                                    color: isBuilt ? 'white' : color.text,
                                                    borderColor: color.bg,
                                                }}
                                            >
                                                {reg.rows}×{reg.cols}{isBuilt ? `=${reg.product}` : ''}
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* level description */}
                    <p className="text-xs text-slate-400 font-semibold text-center">{LEVEL_CONFIGS[levelIdx].desc}</p>

                    {/* MC choices — answer phase only */}
                    {phase === 'answer' && result === null && (
                        <div className="flex flex-col gap-3">
                            <p className="text-[10px] font-bold tracking-widest text-slate-400 text-center uppercase">
                                What is {rows} × {cols}?
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {choices.map(c => (
                                    <button key={c}
                                        onClick={() => handleSelect(c)}
                                        className={`py-3 rounded-xl text-xl font-black border-2 transition-all active:scale-95
                      ${selected === c
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50'}`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* feedback */}
                    {result === 'correct' && (
                        <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-700 rounded-2xl px-4 py-4 font-bold text-center">
                            🎉 Correct!<br />
                            <span className="text-lg">{rows} × {cols} = {product}</span>
                            {!isLevel1 && (
                                <p className="text-xs font-semibold mt-1 text-emerald-600">
                                    {regions.map(r => r.product).join(' + ')} = {product}
                                </p>
                            )}
                            <button onClick={nextPuzzle}
                                className="mt-3 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-2 rounded-full shadow-md mx-auto transition-colors text-sm">
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    )}
                    {result === 'wrong' && (
                        <div className="bg-red-50 border-2 border-red-300 text-red-600 rounded-2xl px-4 py-4 font-bold text-center text-sm">
                            Not quite — add the coloured grids again!
                            <button onClick={() => { setSelected(null); setResult(null) }}
                                className="mt-2 block mx-auto bg-white border border-slate-200 text-slate-600 font-bold py-1.5 px-4 rounded-full text-xs hover:bg-slate-50">
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* spacer + reset button at bottom */}
                    <div className="flex-1" />
                    <button onClick={resetPuzzle}
                        className="flex items-center justify-center gap-2 text-slate-400 hover:text-red-500 text-sm font-semibold py-2 rounded-full border border-slate-200 hover:border-red-300 transition-colors">
                        <RotateCcw size={14} /> Reset puzzle
                    </button>
                </div>
            </div>
        </div>
    )
}
