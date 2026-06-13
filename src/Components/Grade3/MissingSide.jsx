import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, HelpCircle, RotateCcw, ChevronRight, Plus } from 'lucide-react'

// ─── Palette ──────────────────────────────────────────────────────────────────
const BLUE = { bg: '#3b82f6', light: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' }
const ORANGE = { bg: '#f97316', light: '#ffedd5', text: '#c2410c', border: '#fdba74' }
const GREEN = { bg: '#22c55e', light: '#dcfce7', text: '#15803d', border: '#86efac' }
const PURPLE = { bg: '#a855f7', light: '#f3e8ff', text: '#7e22ce', border: '#d8b4fe' }
const REMAIN = { bg: '#94a3b8', light: '#f1f5f9', text: '#475569', border: '#cbd5e1' }

// ─── Level configs ────────────────────────────────────────────────────────────
// level 0: exact division, small numbers
// level 1: remainders
// level 2: larger dividends, strategic
const LEVELS = [
    {
        label: 'LEVEL 1', tag: 'Exact Division',
        desc: 'Find the missing side — no leftovers!',
        divisorMin: 2, divisorMax: 6, quotientMin: 2, quotientMax: 9, hasRemainder: false,
    },
    {
        label: 'LEVEL 2', tag: 'With Remainders',
        desc: 'Some squares will be left over — that\'s the remainder!',
        divisorMin: 3, divisorMax: 7, quotientMin: 3, quotientMax: 9, hasRemainder: true,
    },
    {
        label: 'LEVEL 3', tag: 'Larger Numbers',
        desc: 'Bigger dividends — split your rows strategically!',
        divisorMin: 6, divisorMax: 9, quotientMin: 7, quotientMax: 12, hasRemainder: true,
    },
]

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function makePuzzle(lvlIdx) {
    const cfg = LEVELS[lvlIdx]
    const divisor = randInt(cfg.divisorMin, cfg.divisorMax)
    const quotient = randInt(cfg.quotientMin, cfg.quotientMax)
    const remainder = cfg.hasRemainder ? randInt(0, divisor - 1) : 0
    const dividend = divisor * quotient + remainder
    return { dividend, divisor, quotient, remainder }
}

function buildChoices(correct, divisor) {
    const wrong = new Set()
    const neighbors = [-3, -2, -1, 1, 2, 3, 4, -4]
    for (const off of [...neighbors].sort(() => Math.random() - 0.5)) {
        const w = correct + off
        if (w > 0 && w !== correct) wrong.add(w)
        if (wrong.size === 3) break
    }
    return [...wrong, correct].sort(() => Math.random() - 0.5)
}

// ─── Grid cell-size helper ─────────────────────────────────────────────────
// Computes cell size so the full grid (quotient+BUFFER rows) fits in available
// height with room to spare. Falls back to a min of 28px.
function cellSize(divisor, totalRows, availableHeight) {
    // if we know the container height, fit to it
    if (availableHeight && availableHeight > 0) {
        // reserve ~160px for header label + area bar + padding
        const usable = availableHeight - 160
        const perRow = Math.floor(usable / totalRows) - 2   // subtract gap
        return Math.max(28, Math.min(48, perRow))
    }
    // fallback by dimension
    const maxDim = Math.max(divisor, totalRows)
    if (maxDim <= 9) return 44
    if (maxDim <= 12) return 36
    if (maxDim <= 15) return 32
    return 28
}

// ─── Row counter animation ─────────────────────────────────────────────────
// Shows "1 row = 6,  2 rows = 12 …" beside the grid
function RowLedger({ divisor, shadedRows, cs }) {
    return (
        <div className="flex flex-col gap-0.5" style={{ gap: 2 }}>
            {/* spacer matching top of grid */}
            <div style={{ height: cs }} />
            {Array.from({ length: shadedRows }, (_, r) => {
                const isLast = r === shadedRows - 1
                return (
                    <div
                        key={r}
                        className="flex items-center justify-center rounded-md font-black transition-all"
                        style={{
                            width: Math.max(cs, 50), height: cs,
                            background: isLast ? ORANGE.bg : BLUE.light,
                            color: isLast ? 'white' : BLUE.text,
                            fontSize: cs >= 40 ? 12 : 10,
                            padding: '0 4px',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {r + 1} × {divisor} = {(r + 1) * divisor}
                    </div>
                )
            })}
        </div>
    )
}

// ─── Interactive division grid ─────────────────────────────────────────────
// Fixed width = divisor (known side). Student builds rows by clicking/dragging.
// Grid has BUFFER extra rows so student doesn't know the exact target height.
const BUFFER = 3

function DivisionGrid({ dividend, divisor, quotient, remainder, onChange, locked, availableHeight }) {
    const [shadedRows, setShadedRows] = useState(0)
    const [dragging, setDragging] = useState(false)
    const totalGridRows = quotient + BUFFER
    const cs = cellSize(divisor, totalGridRows, availableHeight)
    const remainderHeight = remainder > 0 ? Math.round(cs * 0.55) : 0

    useEffect(() => {
        const up = () => setDragging(false)
        window.addEventListener('pointerup', up)
        return () => window.removeEventListener('pointerup', up)
    }, [])

    useEffect(() => {
        onChange(shadedRows)
    }, [shadedRows]) // eslint-disable-line

    function clampRow(r) { return Math.max(0, Math.min(totalGridRows, r + 1)) }

    function cellDown(r) {
        if (locked) return
        setDragging(true)
        setShadedRows(clampRow(r))
    }
    function cellEnter(r) {
        if (!dragging || locked) return
        setShadedRows(clampRow(r))
    }

    const runningTotal = shadedRows * divisor

    return (
        <div>
            <div className="flex gap-3 items-center w-full justify-center select-none">
                {/* QUOTIENT label on left axis — spans full grid height including buffer */}
                <div className="flex flex-col items-center justify-center shrink-0" style={{ height: totalGridRows * (cs + 2) + remainderHeight }}>
                    <span
                        className="font-black tracking-widest uppercase"
                        style={{
                            writingMode: 'vertical-rl',
                            transform: 'rotate(180deg)',
                            fontSize: 10,
                            color: '#94a3b8',
                            letterSpacing: 3,
                        }}
                    >
                        ROWS
                    </span>
                </div>

                {/* Question-mark box for quotient — height = full quotient only */}
                <div className="flex flex-col justify-start items-center shrink-0" >
                    <div
                        className="rounded-xl border-2 font-black flex items-center justify-center transition-all"
                        style={{
                            width: cs + 8, height: 100,
                            borderColor: locked ? GREEN.border : BLUE.border,
                            background: locked ? GREEN.light : BLUE.light,
                            color: locked ? GREEN.text : BLUE.text,
                            fontSize: cs >= 40 ? 22 : 18,
                        }}
                    >
                        {locked ? quotient : '?'}
                    </div>
                    {remainder > 0 && (
                        <div
                            className="rounded-lg font-black flex items-center justify-center mt-0.5"
                            style={{
                                width: cs + 8, height: remainderHeight,
                                background: REMAIN.light,
                                color: REMAIN.text,
                                fontSize: 15,
                                border: `2px dashed ${REMAIN.border}`,
                            }}
                        >
                            {remainder}
                        </div>
                    )}
                </div>

                {/* the grid itself */}
                <div className="flex flex-col" style={{ gap: 2 }}>
                    {/* DIVISOR label + value above */}
                    <div
                        className="flex items-center justify-center rounded-lg font-black mb-1"
                        style={{
                            height: cs - 6,
                            background: ORANGE.bg,
                            color: 'white',
                            fontSize: cs >= 40 ? 16 : 13,
                            width: divisor * (cs + 2) - 2,
                        }}
                    >
                        <span className="tracking-widest uppercase text-[9px] font-bold opacity-70 mr-1">DIVISOR</span>
                        {divisor}
                    </div>

                    {/* all rows including buffer — identical appearance */}
                    {Array.from({ length: totalGridRows }, (_, r) => {
                        const rowShaded = r < shadedRows
                        return (
                            <div key={r} style={{ display: 'flex', gap: 2 }}>
                                {Array.from({ length: divisor }, (_, c) => (
                                    <div
                                        key={`${r}-${c}`}
                                        onPointerDown={() => cellDown(r)}
                                        onPointerEnter={() => cellEnter(r)}
                                        style={{
                                            width: cs, height: cs,
                                            background: rowShaded ? BLUE.bg : '#e2e8f0',
                                            borderRadius: 4,
                                            border: `2px solid ${rowShaded ? BLUE.border : '#cbd5e1'}`,
                                            cursor: locked ? 'default' : 'pointer',
                                            transition: 'background 0.1s, border-color 0.1s',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: rowShaded ? 'white' : '#94a3b8',
                                            fontSize: cs >= 36 ? 11 : cs >= 30 ? 9 : 8,
                                            fontWeight: 'bold',
                                            userSelect: 'none',
                                        }}
                                    >
                                        {rowShaded ? r * divisor + c + 1 : ''}
                                    </div>
                                ))}
                            </div>
                        )
                    })}

                    {/* remainder row — partial, dashed, always shown if remainder > 0 */}
                    {remainder > 0 && (
                        <div style={{ display: 'flex', gap: 2 }}>
                            {Array.from({ length: divisor }, (_, c) => (
                                <div
                                    key={`rem-${c}`}
                                    style={{
                                        width: cs,
                                        height: cs  ,
                                        background: c < remainder ? REMAIN.light : 'transparent',
                                        borderRadius: 3,
                                        border: c < remainder ? `2px dashed ${REMAIN.border}` : `2px dashed #e2e8f0`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: REMAIN.text,
                                        fontSize: 9,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {c < remainder && locked ? '·' : ''}
                                </div>
                            ))}
                        </div>
                    )}

                </div>


                {/* row counter ledger — always present, fixed width to prevent layout shift */}
                <div
                    className="flex flex-col shrink-0"
                    style={{ gap: 2, width: Math.max(cs, 70), paddingTop: cs + 4 }}
                >
                    {Array.from({ length: totalGridRows }, (_, r) => {
                        const active = r < shadedRows
                        const isLast = r === shadedRows - 1
                        return (
                            <div
                                key={r}
                                className="flex items-center justify-center rounded-md font-black transition-all"
                                style={{
                                    width: '100%', height: cs,
                                    background: active ? (isLast ? ORANGE.bg : BLUE.light) : 'transparent',
                                    color: active ? (isLast ? 'white' : BLUE.text) : 'transparent',
                                    fontSize: cs >= 40 ? 11 : 9,
                                    padding: '0 4px',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {active ? `${r + 1} × ${divisor} = ${(r + 1) * divisor}` : ''}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

// ─── Equation card ──────────────────────────────────────────────────────────
function EquationCard({ dividend, divisor, answer, revealed }) {
    return (
        <div className="bg-[#eef2fb] rounded-2xl px-5 py-4 flex flex-col items-center gap-3">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Equation Detective</p>
            <div className="flex items-center gap-3">
                <div
                    className="rounded-xl flex items-center justify-center font-black shadow"
                    style={{ width: 52, height: 52, background: BLUE.bg, color: 'white', fontSize: 22 }}
                >
                    {dividend}
                </div>
                <span className="text-2xl font-black text-slate-400">÷</span>
                <div
                    className="rounded-xl flex items-center justify-center font-black shadow"
                    style={{ width: 52, height: 52, background: ORANGE.bg, color: 'white', fontSize: 22 }}
                >
                    {divisor}
                </div>
                <span className="text-2xl font-black text-slate-400">=</span>
                <div
                    className="rounded-xl flex items-center justify-center font-black shadow transition-all"
                    style={{
                        width: 52, height: 52,
                        background: revealed ? GREEN.bg : 'white',
                        color: revealed ? 'white' : '#94a3b8',
                        border: revealed ? 'none' : `2px solid ${BLUE.border}`,
                        fontSize: revealed ? 22 : 28,
                    }}
                >
                    {revealed ? answer : '?'}
                </div>
            </div>
        </div>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MissingSide() {
    const navigate = useNavigate()
    const [levelIdx, setLevelIdx] = useState(0)
    const [puzzle, setPuzzle] = useState(() => makePuzzle(0))
    const [phase, setPhase] = useState('explore')
    const [shadedRows, setShadedRows] = useState(0)
    const [choices, setChoices] = useState([])
    const [selected, setSelected] = useState(null)
    const [result, setResult] = useState(null)
    const [score, setScore] = useState(0)
    const [showHelp, setShowHelp] = useState(false)
    const [streak, setStreak] = useState(0)
    const [gridKey, setGridKey] = useState(0)   // increment to force-remount DivisionGrid

    const { dividend, divisor, quotient, remainder } = puzzle
    const fullRows = dividend - remainder  // area covered by full rows

    // when student presses Confirm → advance to answer phase
    function confirmGrid() {
        if (shadedRows === 0 || phase !== 'explore') return
        setChoices(buildChoices(quotient, divisor))
        setPhase('answer')
    }

    function handleSelect(choice) {
        if (result !== null) return
        setSelected(choice)
        const ok = choice === quotient
        setResult(ok ? 'correct' : 'wrong')
        if (ok) {
            setScore(s => s + (levelIdx + 1) * 100)
            setStreak(s => s + 1)
        } else {
            setStreak(0)
        }
    }

    function nextPuzzle() {
        const p = makePuzzle(levelIdx)
        setPuzzle(p)
        setPhase('explore')
        setShadedRows(0)
        setSelected(null)
        setResult(null)
        setGridKey(k => k + 1)
    }

    function resetPuzzle() {
        setShadedRows(0)
        setPhase('explore')
        setSelected(null)
        setResult(null)
        setGridKey(k => k + 1)
    }

    function switchLevel(i) {
        setLevelIdx(i)
        const p = makePuzzle(i)
        setPuzzle(p)
        setPhase('explore')
        setShadedRows(0)
        setSelected(null)
        setResult(null)
        setGridKey(k => k + 1)
    }

    // derived
    return (
        <div className="h-screen bg-[#eef2fb] flex flex-col select-none font-sans overflow-hidden">

            {/* ── header ── */}
            <header className="w-full px-4 py-2 flex items-center justify-between shrink-0 bg-white border-b border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <span className="font-bold text-blue-700 text-xl">Division Detective</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* level tabs */}
                    {LEVELS.map((l, i) => (
                        <button
                            key={i}
                            onClick={() => switchLevel(i)}
                            className="py-1 px-3 rounded-full text-xs font-bold transition-colors border"
                            style={i === levelIdx
                                ? { background: BLUE.bg, color: 'white', borderColor: BLUE.bg }
                                : { background: 'white', color: '#64748b', borderColor: '#e2e8f0' }
                            }
                        >
                            {l.label}
                        </button>
                    ))}

                    <button
                        onClick={() => setShowHelp(h => !h)}
                        className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-500 transition-colors"
                    >
                        <HelpCircle size={16} />
                    </button>
                </div>
            </header>

            {/* ── body ── */}
            <div className="flex flex-1 overflow-hidden">

                {/* ════════ LEFT — grid workspace ════════ */}
                <div className="flex flex-col items-center flex-1 border overflow-y-auto no-scrollbar bg-[#e8eef8] border-r border-slate-200 px-6 py-6 gap-4">

                    <div className='flex flex-col gap-5 justify-center h-full'>


                        {showHelp && (
                            <div className="w-full max-w-2xl bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 text-sm text-blue-700">
                                <strong>How to play:</strong> The rectangle has area <strong>{dividend}</strong> and one side is <strong>{divisor}</strong>.
                                Click or drag the grid rows to fill it up, row by row, until you reach {dividend}.
                                The number of rows you need is the missing side!
                            </div>
                        )}

                        {/* main equation display */}
                        <div
                            className="w-full max-w-2xl rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm"
                            style={{ background: 'white', border: `2px dashed ${BLUE.border}` }}
                        >
                            <div className="flex items-center gap-2 text-lg font-black" style={{ color: BLUE.text }}>
                                <span style={{ color: BLUE.text, fontSize: 28 }}>{dividend}</span>
                                <span className="text-slate-400 text-2xl">÷</span>
                                <span style={{ color: ORANGE.text, fontSize: 28 }}>{divisor}</span>
                                <span className="text-slate-400 text-2xl">=</span>
                                <div
                                    className="rounded-xl flex items-center justify-center font-black"
                                    style={{
                                        width: 48, height: 48,
                                        background: phase === 'done' || result === 'correct' ? GREEN.light : '#f8fafc',
                                        border: `2px solid ${phase === 'done' || result === 'correct' ? GREEN.border : BLUE.border}`,
                                        color: phase === 'done' || result === 'correct' ? GREEN.text : '#94a3b8',
                                        fontSize: 22,
                                    }}
                                >
                                    {result === 'correct' ? quotient : '?'}
                                </div>
                            </div>
                            {remainder > 0 && (
                                <div className='flex items-center'>
                                    <span className='text-2xl'>
                                        +
                                    </span>
                                    <div
                                        className="ml-2 rounded-lg px-2 py-1 font-bold text-xl"
                                        style={{ background: REMAIN.light, color: REMAIN.text, border: `1px dashed ${REMAIN.border}` }}
                                    >
                                        <span className='text-3xl'>{remainder}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* grid */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 overflow-x-auto max-w-full">
                            <DivisionGrid
                                key={`${dividend}-${divisor}-${gridKey}`}
                                dividend={dividend}
                                divisor={divisor}
                                quotient={quotient}
                                remainder={remainder}
                                onChange={setShadedRows}
                                locked={result === 'correct'}
                            />
                        </div>

                        {/* row equation + confirm button */}
                        <div className='flex flex-col items-center gap-3'>
                            <div
                                className="w-full max-w-fit rounded-2xl px-5 py-3 flex items-center gap-3 font-bold text-sm transition-all"
                                style={{ background: BLUE.light, border: `1.5px solid ${BLUE.border}`, color: BLUE.text }}
                            >
                                {shadedRows > 0 ? (
                                    <>
                                        <span>📐 {shadedRows} rows × {divisor} = </span>
                                        <span
                                            className="text-lg font-black"
                                            style={{ color: shadedRows * divisor === fullRows ? GREEN.text : BLUE.text }}
                                        >
                                            {shadedRows * divisor}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-slate-400 font-semibold">Start exploring the grid</span>
                                )}
                            </div>

                            {/* Confirm button — only while still in explore phase */}
                            {phase === 'explore' && (
                                <button
                                    onClick={confirmGrid}
                                    disabled={shadedRows === 0}
                                    className={`flex items-center gap-2 font-bold px-6 py-2.5 rounded-full shadow-md transition-colors text-sm
                                        ${shadedRows > 0
                                            ? 'text-white'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                    style={shadedRows > 0 ? { background: BLUE.bg } : {}}
                                >
                                    <ChevronRight size={16} /> Confirm my grid
                                </button>
                            )}
                        </div>

                    </div>

                </div>

                {/* ════════ RIGHT — equation card + choices + feedback ════════ */}
                <div className="w-[30%] shrink-0 flex flex-col overflow-y-auto no-scrollbar bg-white border-l border-slate-100 px-5 py-5 gap-5">

                    {/* equation card */}
                    <EquationCard
                        dividend={dividend}
                        divisor={divisor}
                        answer={quotient}
                        revealed={result === 'correct'}
                    />

                    {/* insight cards — shown after shading begins */}
                    {shadedRows > 0 && phase === 'explore' && (
                        <div className="flex flex-col gap-2">
                            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Row Progress</p>
                            {Array.from({ length: shadedRows }, (_, r) => (
                                <div
                                    key={r}
                                    className="flex items-center justify-between rounded-xl px-3 py-1.5 text-sm font-bold"
                                    style={{
                                        background: r === shadedRows - 1 ? ORANGE.light : BLUE.light,
                                        color: r === shadedRows - 1 ? ORANGE.text : BLUE.text,
                                        border: `1px solid ${r === shadedRows - 1 ? ORANGE.border : BLUE.border}`,
                                    }}
                                >
                                    <span>Row {r + 1}</span>
                                    <span>{(r + 1)} × {divisor} = <strong>{(r + 1) * divisor}</strong></span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* multiplication insight */}
                    {phase !== 'explore' && (
                        <div
                            className="rounded-2xl px-4 py-3 text-sm font-semibold"
                            style={{ background: BLUE.light, border: `1.5px solid ${BLUE.border}`, color: BLUE.text }}
                        >
                            <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: '#94a3b8' }}>
                                Multiplication Connection
                            </p>
                            <p>
                                <strong>{quotient}</strong> × <strong>{divisor}</strong> = <strong>{quotient * divisor}</strong>
                                {remainder > 0 && <> + <strong>{remainder}</strong> = <strong>{dividend}</strong></>}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                So {dividend} ÷ {divisor} = {quotient}{remainder > 0 ? ` R${remainder}` : ''}
                            </p>
                        </div>
                    )}

                    {/* MC choices */}
                    {phase === 'answer' && result === null && (
                        <div className="flex flex-col gap-3">
                            <p className="text-[10px] font-bold tracking-widest text-slate-400 text-center uppercase">
                                What is the missing side?
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {choices.map(c => (
                                    <button
                                        key={c}
                                        id={`choice-${c}`}
                                        onClick={() => handleSelect(c)}
                                        className="py-4 rounded-2xl text-2xl font-black border-2 transition-all active:scale-95 shadow-sm hover:shadow-md"
                                        style={{
                                            borderColor: selected === c ? BLUE.bg : '#e2e8f0',
                                            background: selected === c ? BLUE.light : '#f8fafc',
                                            color: selected === c ? BLUE.text : '#334155',
                                        }}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* feedback */}
                    {result === 'correct' && (
                        <div
                            className="rounded-2xl px-4 py-4 font-bold text-center"
                            style={{ background: GREEN.light, border: `2px solid ${GREEN.border}`, color: GREEN.text }}
                        >
                            🎉 Correct!
                            <br />
                            <span className="text-lg">
                                {dividend} ÷ {divisor} = {quotient}
                                {remainder > 0 && <span className="text-sm"> R{remainder}</span>}
                            </span>
                            <p className="text-xs mt-1 font-semibold" style={{ color: GREEN.text }}>
                                Check: {quotient} × {divisor}{remainder > 0 ? ` + ${remainder}` : ''} = {dividend} ✓
                            </p>
                            <button
                                onClick={nextPuzzle}
                                className="mt-3 flex items-center gap-2 text-white font-bold px-5 py-2 rounded-full shadow-md mx-auto transition-colors text-sm"
                                style={{ background: BLUE.bg }}
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    )}

                    {result === 'wrong' && (
                        <div
                            className="rounded-2xl px-4 py-4 font-bold text-center text-sm"
                            style={{ background: '#fef2f2', border: '2px solid #fca5a5', color: '#b91c1c' }}
                        >
                            Not quite! Count the rows again.
                            <button
                                onClick={() => { setSelected(null); setResult(null) }}
                                className="mt-2 block mx-auto bg-white border border-slate-200 text-slate-600 font-bold py-1.5 px-4 rounded-full text-xs hover:bg-slate-50"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* remainder explainer */}
                    {remainder > 0 && (
                        <div
                            className="rounded-xl px-3 py-2 text-xs font-semibold"
                            style={{ background: REMAIN.light, color: REMAIN.text, border: `1px dashed ${REMAIN.border}` }}
                        >
                            <strong>Remainder {remainder}:</strong> After filling {quotient} full rows of {divisor},
                            there are {remainder} leftover squares that can't complete another row.
                        </div>
                    )}

                    <div className="flex-1" />

                    <button
                        onClick={resetPuzzle}
                        className="flex items-center justify-center gap-2 text-slate-400 hover:text-red-500 text-sm font-semibold py-2 rounded-full border border-slate-200 hover:border-red-300 transition-colors"
                    >
                        <RotateCcw size={14} /> Reset puzzle
                    </button>
                </div>
            </div>
        </div>
    )
}