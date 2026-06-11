import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Delete, HelpCircle, Rotate3d, RotateCcw, Settings, Star } from 'lucide-react'

// ─── Puzzle bank ──────────────────────────────────────────────────────────────
const LEVEL_RANGES = [
  { label: 'LEVEL 1', desc: 'Distance within 20',              min: 1,  max: 20  },
  { label: 'LEVEL 2', desc: 'Distance within 100 (tens+ones)', min: 10, max: 90  },
  { label: 'LEVEL 3', desc: 'Distance within 100 (any)',       min: 1,  max: 99  },
]

// ─── Random generator ────────────────────────────────────────────────────────
// Returns two distinct integers in [min, max]
function randomPair(min, max) {
  const first  = Math.floor(Math.random() * (max - min + 1)) + min
  let   second = Math.floor(Math.random() * (max - min + 1)) + min
  // re-roll until they differ (and ensure a meaningful gap >= 2)
  while (second === first || Math.abs(second - first) < 2) {
    second = Math.floor(Math.random() * (max - min + 1)) + min
  }
  // always return smaller as `from`, larger as `to`
  return { from: Math.min(first, second), to: Math.max(first, second) }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getRange(puzzle) {
    const lo = Math.min(puzzle.from, puzzle.to)
    const hi = Math.max(puzzle.from, puzzle.to)
    const nlMin = Math.max(0, Math.floor(lo / 10) * 10 - 10)
    const nlMax = Math.ceil(hi  / 10) * 10 + 10
    return { nlMin, nlMax }
}

function buildChoices(correct) {
    const offsets = [-10, -5, -2, -1, 1, 2, 5, 10]
    const wrong = new Set()
    for (const off of [...offsets].sort(() => Math.random() - 0.5)) {
        const w = correct + off
        if (w > 0 && w !== correct) wrong.add(w)
        if (wrong.size === 3) break
    }
    return [...wrong, correct].sort(() => Math.random() - 0.5)
}

const ARC_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

// ─── Component ────────────────────────────────────────────────────────────────
export default function Distance() {
    const navigate = useNavigate()
    const [levelIdx, setLevelIdx] = useState(1)
    const [puzzle,   setPuzzle]   = useState(() => randomPair(LEVEL_RANGES[1].min, LEVEL_RANGES[1].max))
    const [hops, setHops] = useState([])
    const [showHops, setShowHops] = useState(true)
    const [choices, setChoices] = useState([])
    const [selected, setSelected] = useState(null)
    const [correct, setCorrect] = useState(null)
    const [score, setScore] = useState(0)
    const [showHelp, setShowHelp] = useState(false)

    const canvasRef = useRef(null)

    const level      = LEVEL_RANGES[levelIdx]
    const { nlMin, nlMax } = getRange(puzzle)
    const correctDist = Math.abs(puzzle.to - puzzle.from)

    // current frog position
    const position = hops.reduce((acc, h) => acc + h.delta, puzzle.from)
    // total distance hopped so far
    const totalHopped = hops.reduce((acc, h) => acc + Math.abs(h.delta), 0)

    // generate choices whenever puzzle changes
    useEffect(() => {
        setChoices(buildChoices(correctDist))
        setSelected(null)
        setCorrect(null)
        setHops([])
    }, [puzzle, correctDist])

    // ── canvas draw ─────────────────────────────────────────────────────────────
    const draw = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const W = canvas.width
        const H = canvas.height
        const PAD = 44
        const lineY = H * 0.70
        const span = W - PAD * 2
        const range = nlMax - nlMin

        const toX = n => PAD + ((n - nlMin) / range) * span

        ctx.clearRect(0, 0, W, H)

        // axis
        ctx.strokeStyle = '#94a3b8'
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(PAD, lineY); ctx.lineTo(W - PAD, lineY); ctx.stroke()

        // ticks
        const tickStep = range <= 30 ? 5 : 10
        for (let v = nlMin; v <= nlMax; v += tickStep) {
            const x = toX(v)
            const isMajor = v % (range <= 30 ? 5 : 10) === 0
            ctx.strokeStyle = isMajor ? '#94a3b8' : '#cbd5e1'
            ctx.lineWidth = isMajor ? 1.5 : 1
            ctx.beginPath()
            ctx.moveTo(x, lineY - (isMajor ? 8 : 4))
            ctx.lineTo(x, lineY + (isMajor ? 8 : 4))
            ctx.stroke()
            if (isMajor) {
                ctx.fillStyle = '#475569'
                ctx.font = 'bold 15px sans-serif'
                ctx.textAlign = 'center'
                ctx.fillText(v, x, lineY + 20)
            }
        }

        // hop arcs
        if (showHops) {
            hops.forEach((hop, idx) => {
                const color = ARC_COLORS[idx % ARC_COLORS.length]
                const x1 = toX(hop.from)
                const x2 = toX(hop.to)
                const midX = (x1 + x2) / 2
                const arcH = -Math.min(Math.abs(x2 - x1) * 0.55, 60)
                const cpY = lineY + arcH

                ctx.strokeStyle = color; ctx.lineWidth = 2.5
                ctx.beginPath()
                ctx.moveTo(x1, lineY)
                ctx.quadraticCurveTo(midX, cpY, x2, lineY)
                ctx.stroke()

                // arrowhead
                const angle = Math.atan2(lineY - cpY, x2 - midX)
                const aLen = 7
                ctx.fillStyle = color
                ctx.beginPath()
                ctx.moveTo(x2, lineY)
                ctx.lineTo(x2 - aLen * Math.cos(angle - 0.4), lineY - aLen * Math.sin(angle - 0.4))
                ctx.lineTo(x2 - aLen * Math.cos(angle + 0.4), lineY - aLen * Math.sin(angle + 0.4))
                ctx.closePath(); ctx.fill()

                // label
                ctx.fillStyle = color; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'
                ctx.fillText((hop.delta > 0 ? '+' : '') + hop.delta, midX, cpY - 5)
            })
        }

        // FROM marker (green) — big pin above the line
        const fx = toX(puzzle.from)
        ctx.save()
        ctx.shadowColor = 'rgba(34,197,94,0.45)'
        ctx.shadowBlur  = 10
        ctx.fillStyle   = '#22c55e'
        ctx.beginPath(); ctx.arc(fx, lineY - 18, 16, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
        // inner white number
        ctx.fillStyle  = 'white'
        ctx.font       = 'bold 13px sans-serif'
        ctx.textAlign  = 'center'
        ctx.fillText(puzzle.from, fx, lineY - 13)
        // stem connecting pin to line
        ctx.strokeStyle = '#22c55e'
        ctx.lineWidth   = 3
        ctx.beginPath(); ctx.moveTo(fx, lineY - 2); ctx.lineTo(fx, lineY + 2); ctx.stroke()
        // dot on line
        ctx.fillStyle = '#22c55e'
        ctx.beginPath(); ctx.arc(fx, lineY, 5, 0, Math.PI * 2); ctx.fill()

        // TO marker (red) — big pin above the line
        const tx = toX(puzzle.to)
        ctx.save()
        ctx.shadowColor = 'rgba(239,68,68,0.45)'
        ctx.shadowBlur  = 10
        ctx.fillStyle   = '#ef4444'
        ctx.beginPath(); ctx.arc(tx, lineY - 18, 16, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
        ctx.fillStyle  = 'white'
        ctx.font       = 'bold 13px sans-serif'
        ctx.textAlign  = 'center'
        ctx.fillText(puzzle.to, tx, lineY - 13)
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth   = 3
        ctx.beginPath(); ctx.moveTo(tx, lineY - 2); ctx.lineTo(tx, lineY + 2); ctx.stroke()
        ctx.fillStyle = '#ef4444'
        ctx.beginPath(); ctx.arc(tx, lineY, 5, 0, Math.PI * 2); ctx.fill()

        // frog marker (blue circle with number)
        const px = toX(position)
        // shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)'
        ctx.beginPath(); ctx.ellipse(px, lineY + 14, 14, 5, 0, 0, Math.PI * 2); ctx.fill()
        // glow
        ctx.save()
        ctx.shadowColor = correct === true ? 'rgba(16,185,129,0.5)' : 'rgba(59,130,246,0.5)'
        ctx.shadowBlur  = 12
        ctx.fillStyle   = correct === true ? '#10b981' : correct === false ? '#ef4444' : '#3b82f6'
        ctx.beginPath(); ctx.arc(px, lineY - 18, 18, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
        // number inside frog
        ctx.fillStyle  = 'white'
        ctx.font       = 'bold 14px sans-serif'
        ctx.textAlign  = 'center'
        ctx.fillText(position, px, lineY - 13)
        // 🐸 label above
        ctx.font      = 'bold 18px sans-serif'
        ctx.fillText('🐸', px, lineY - 40)
    }, [hops, position, puzzle, correct, nlMin, nlMax, showHops])

    useEffect(() => { draw() }, [draw])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const resize = () => {
            canvas.width = canvas.parentElement.clientWidth
            canvas.height = 160
            draw()
        }
        resize()
        window.addEventListener('resize', resize)
        return () => window.removeEventListener('resize', resize)
    }, [draw])

    // ── hop controls ─────────────────────────────────────────────────────────────
    function hop(delta) {
        if (correct !== null) return
        const next = position + delta
        if (next < nlMin || next > nlMax) return
        setHops(prev => [...prev, { from: position, to: next, delta }])
    }

    function undo() {
        if (correct !== null) return
        setHops(prev => prev.slice(0, -1))
    }

    function reset() {
        setHops([])
        setSelected(null)
        setCorrect(null)
    }

    function handleSelect(choice) {
        if (correct !== null) return
        setSelected(choice)
        const isCorrect = choice === correctDist
        setCorrect(isCorrect)
        if (isCorrect) setScore(s => s + 100)
    }

    function nextPuzzle() {
        setPuzzle(randomPair(level.min, level.max))
    }

    return (
        <div className="h-screen bg-[#eef2fb] flex flex-col select-none font-sans overflow-hidden">

            {/* ── header ── */}
            <div className="w-full px-4 py-2 flex justify-between items-center gap-3">
                <div className='flex items-center gap-4'>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 text-blue-600 font-bold text-sm bg-blue-200 p-4 hover:text-blue-800 rounded-full"
                    >
                        <ArrowLeft size={30} />
                    </button>
                    <span className="flex-1 font-bold text-blue-700 text-4xl">
                        Distance Finder
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowHelp(h => !h)} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-500">
                        <HelpCircle size={16} />
                    </button>
                </div>
            </div>

            {/* ── scrollable content ── */}
            <div className="flex flex-col items-center flex-1 overflow-y-auto px-4 py-4 gap-4">

                {/* help */}
                {showHelp && (
                    <div className="w-full max-w-2xl bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 text-sm text-blue-700">
                        Start at the <span className="font-bold text-green-600">green</span> dot. Hop to the <span className="font-bold text-red-500">red</span> dot. Count your total hops — that's the distance!
                    </div>
                )}

                {/* level tabs */}
                <div className="flex gap-2 w-full max-w-2xl">
                    {LEVEL_RANGES.map((l, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setLevelIdx(i)
                                setPuzzle(randomPair(l.min, l.max))
                            }}
                            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-colors border
                ${i === levelIdx
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}`}
                        >
                            {l.label}
                        </button>
                    ))}
                </div>

                {/* question card */}
                <div className="w-full max-w-2xl bg-white rounded-3xl border-2 border-blue-300 shadow-sm px-8 py-5 text-center">
                    <h2 className="text-3xl font-black text-slate-800">
                        How far from <span className="text-blue-600">{puzzle.from}</span> to <span className="text-blue-600">{puzzle.to}</span>?
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Use the hop buttons to find the distance!</p>
                </div>

                {/* number line */}
                <div className="w-full max-w-screen bg-white rounded-2xl shadow-sm border border-slate-100 px-2 py-10">
                    <canvas ref={canvasRef} className="w-full" style={{ height: 160 }} />
                </div>

                {/* hop buttons */}
                <div className="flex gap-4 justify-center">
                    {/* Reset */}
                    <button
                        onClick={reset}
                        disabled={hops.length === 0 || correct !== null}
                        className="w-36 h-24 rounded-2xl bg-red-200 border-2 border-slate-200 shadow-md flex flex-col items-center justify-center gap-2 active:scale-95 transition-all hover:border-blue-300"
                    >
                        <div className="w-12 h-12 rounded-full bg-red-500 text-white text-xl font-black flex items-center justify-center shadow">
                            <RotateCcw size={30} />
                        </div>
                        <span className="text-slate-500 font-semibold text-sm">Reset</span>
                    </button>

                    {/* +1 tiny hop */}
                    <button
                        onClick={() => hop(+1)}
                        className="w-36 h-24 rounded-2xl bg-white border-2 border-slate-200 shadow-md flex flex-col items-center justify-center gap-2 active:scale-95 transition-all hover:border-blue-300"
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-500 text-white text-xl font-black flex items-center justify-center shadow">+1</div>
                        <span className="text-slate-500 font-semibold text-sm">Tiny Hop</span>
                    </button>
                    {/* +10 big hop */}
                    <button
                        onClick={() => hop(+10)}
                        className="w-36 h-24 rounded-2xl bg-white border-2 border-slate-200 shadow-md flex flex-col items-center justify-center gap-2 active:scale-95 transition-all hover:border-amber-300"
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-500 text-white text-xl font-black flex items-center justify-center shadow">+10</div>
                        <span className="text-slate-500 font-semibold text-sm">Big Hop</span>
                    </button>
                    {/* -1 back */}
                    <button
                        onClick={() => hop(-1)}
                        className="w-36 h-24 rounded-2xl bg-white border-2 border-slate-200 shadow-md flex flex-col items-center justify-center gap-2 active:scale-95 transition-all hover:border-slate-300"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-500 text-white text-xl font-black flex items-center justify-center shadow">-1</div>
                        <span className="text-slate-500 font-semibold text-sm">Step Back</span>
                    </button>
                    { /* -10 Back */}
                    <button
                        onClick={() => hop(-10)}
                        className="w-36 h-24 rounded-2xl bg-white border-2 border-slate-200 shadow-md flex flex-col items-center justify-center gap-2 active:scale-95 transition-all hover:border-slate-300"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-500 text-white text-xl font-black flex items-center justify-center shadow">-10</div>
                        <span className="text-slate-500 font-semibold text-sm">Step Back</span>
                    </button>

                    {/* Undo */}
                    <button
                        onClick={undo}
                        disabled={hops.length === 0 || correct !== null}
                        className="w-36 h-24 rounded-2xl bg-red-200 border-2 border-slate-200 shadow-md flex flex-col items-center justify-center gap-2 active:scale-95 transition-all hover:border-blue-300"
                    >
                        <div className="w-12 h-12 rounded-full bg-red-500 text-white text-xl font-black flex items-center justify-center shadow">
                            <Delete size={30} />
                        </div>
                        <span className="text-slate-500 font-semibold text-sm">Undo</span>
                    </button>
                </div>


                {/* total distance + show hops + answer choices */}
                <div className="w-full max-w-2xl bg-[#dce8fb] rounded-3xl px-6 py-5 flex flex-col gap-4">

                    {/* distance tracker */}
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 text-lg">Total Distance:</span>
                        <div className={`w-20 h-12 rounded-xl border-2 border-dashed flex items-center justify-center text-2xl font-black transition-colors
              ${correct === true ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                                : correct === false ? 'border-red-400 bg-red-50 text-red-500'
                                    : 'border-blue-300 bg-white text-blue-400'}`}
                        >
                            {selected !== null ? selected : '?'}
                        </div>
                    </div>

                    {/* show hops toggle */}
                    {/* <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-600">Show Hops</span>
                        <button
                            onClick={() => setShowHops(v => !v)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${showHops ? 'bg-blue-500' : 'bg-slate-300'}`}
                        >
                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${showHops ? 'left-6' : 'left-0.5'}`} />
                        </button>
                    </div> */}

                    {/* answer choices */}
                    {correct === null && (
                        <div className="flex gap-3 justify-center flex-wrap">
                            {choices.map(c => (
                                <button
                                    key={c}
                                    onClick={() => handleSelect(c)}
                                    className="w-20 h-14 rounded-2xl text-2xl font-black shadow-md active:scale-95 transition-all bg-white border-2 border-blue-200 text-blue-700 hover:border-blue-400 hover:bg-blue-50"
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* check / feedback row */}
                    {correct !== null && (
                        <div className={`w-full rounded-2xl px-5 py-4 font-bold text-center text-base
              ${correct ? 'bg-emerald-100 border-2 border-emerald-300 text-emerald-700' : 'bg-red-100 border-2 border-red-300 text-red-600'}`}
                        >
                            {correct
                                ? `🎉 Correct! The distance from ${puzzle.from} to ${puzzle.to} is ${correctDist}.`
                                : `Not quite — the distance is ${correctDist}, not ${selected}.`
                            }
                            <div className="flex gap-3 justify-center mt-3">
                                <button onClick={reset} className="bg-white border border-slate-200 text-slate-600 font-bold py-2 px-5 rounded-full text-sm hover:bg-slate-50">
                                    Try Again
                                </button>
                                {correct && (
                                    <button onClick={nextPuzzle} className="bg-blue-500 text-white font-bold py-2 px-6 rounded-full text-sm hover:bg-blue-600">
                                        Next →
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
