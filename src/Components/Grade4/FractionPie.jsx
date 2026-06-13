import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, HelpCircle, RotateCcw, ChevronRight, Tag, Plus, Trash2, X, Check } from 'lucide-react'

// ─── Level config ─────────────────────────────────────────────────────────────
const LEVELS = [
    {
        label: 'Level 1', desc: 'Unit fractions', color: '#3b82f6',
        challenges: [
            { num: 1, den: 2 }, { num: 1, den: 3 }, { num: 1, den: 4 },
            { num: 1, den: 5 }, { num: 1, den: 6 },
        ],
    },
    {
        label: 'Level 2', desc: 'Proper fractions', color: '#8b5cf6',
        challenges: [
            { num: 2, den: 3 }, { num: 3, den: 4 }, { num: 3, den: 5 },
            { num: 2, den: 5 }, { num: 5, den: 6 },
        ],
    },
    {
        label: 'Level 3', desc: 'Improper fractions', color: '#f59e0b',
        challenges: [
            { num: 5, den: 4 }, { num: 7, den: 4 }, { num: 4, den: 3 },
            { num: 7, den: 6 }, { num: 5, den: 3 },
        ],
    },
    {
        label: 'Level 4', desc: 'Mixed numbers', color: '#059669',
        challenges: [
            { num: 3, den: 2 }, { num: 5, den: 2 }, { num: 7, den: 3 },
            { num: 9, den: 4 }, { num: 11, den: 6 },
        ],
    },
]

// ─── SVG helpers ──────────────────────────────────────────────────────────────
const CX = 120, CY = 120, R = 108

function polarToXY(deg, r = R) {
    const rad = ((deg - 90) * Math.PI) / 180
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

function slicePath(idx, total) {
    if (total === 1) return `M ${CX} ${CY} m -${R} 0 a ${R} ${R} 0 1 1 0 0.001 Z` // full circle
    const sweep = 360 / total
    const s = polarToXY(sweep * idx)
    const e = polarToXY(sweep * (idx + 1))
    const large = sweep > 180 ? 1 : 0
    return `M ${CX} ${CY} L ${s.x} ${s.y} A ${R} ${R} 0 ${large} 1 ${e.x} ${e.y} Z`
}

// ─── Single interactive pie ────────────────────────────────────────────────────
function PieCircle({ slices, shaded, onToggle, showLabel, disabled, highlight }) {
    const totalShaded = shaded.size
    return (
        <svg
            width={200} height={200}
            viewBox="0 0 240 240"
            className={`drop-shadow-md rounded-full transition-all ${highlight ? 'ring-4 ring-emerald-400' : ''}`}
        >
            <circle cx={CX} cy={CY} r={R} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={1.5} />

            {Array.from({ length: slices }, (_, i) => (
                <path
                    key={i}
                    d={slicePath(i, slices)}
                    fill={shaded.has(i) ? '#fb923c' : '#f8fafc'}
                    stroke="#E3E3E3"
                    strokeWidth={2.5}
                    className={disabled ? 'cursor-default' : 'cursor-pointer hover:brightness-90 active:scale-95'}
                    onClick={() => !disabled && onToggle(i)}
                />
            ))}

            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#cbd5e1" strokeWidth={1.5} />

            {showLabel && (
                <g>
                    <rect x={CX - 28} y={CY - 15} width={56} height={30} rx={9} fill="white" stroke="#93c5fd" strokeWidth={1.5} />
                    <text x={CX} y={CY + 7} textAnchor="middle" fontSize={14} fontWeight="bold" fill="#1e40af">
                        {totalShaded}/{slices}
                    </text>
                </g>
            )}
        </svg>
    )
}

// ─── Tiny read-only target pie ────────────────────────────────────────────────
function TargetMini({ slices, shadedCount }) {
    return (
        <svg width={72} height={72} viewBox="0 0 240 240" className="opacity-70 drop-shadow-sm">
            <circle cx={CX} cy={CY} r={R} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={2} />
            {Array.from({ length: slices }, (_, i) => (
                <path key={i} d={slicePath(i, slices)}
                    fill={i < shadedCount ? '#fb923c' : '#f8fafc'} stroke="white" strokeWidth={3} />
            ))}
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#cbd5e1" strokeWidth={2} />
        </svg>
    )
}

// ─── Fresh pie state ──────────────────────────────────────────────────────────
function newPie() { return { id: Math.random(), shaded: new Set() } }
function initPies() { return [newPie()] }

// ─── Component ────────────────────────────────────────────────────────────────
export default function FractionPie() {
    const navigate = useNavigate()

    const [levelIdx, setLevelIdx] = useState(0)
    const [chalIdx, setChalIdx] = useState(0)
    const [showHelp, setShowHelp] = useState(false)
    const [showLabel, setShowLabel] = useState(true)
    const [score, setScore] = useState(0)
    const [result, setResult] = useState(null)   // null | 'correct' | 'wrong'
    const [submitted, setSubmitted] = useState(false)
    const [hint, setHint] = useState(false)

    // pies: array of { id, shaded: Set<number> }
    const [pies, setPies] = useState(initPies)
    // slices = denominator — shared across all pies
    const [slices, setSlices] = useState(2)

    const level = LEVELS[levelIdx]
    const challenge = level.challenges[chalIdx]
    const { num, den } = challenge

    // total shaded across all pies
    const totalShaded = pies.reduce((sum, p) => sum + p.shaded.size, 0)

    // ── reset ────────────────────────────────────────────────────────────────────
    function reset(newDen) {
        setPies(initPies())
        setSlices(newDen ?? den)
        setResult(null)
        setSubmitted(false)
    }

    function switchLevel(idx) {
        setLevelIdx(idx)
        setChalIdx(0)
        reset(LEVELS[idx].challenges[0].den)
    }

    function nextChallenge() {
        const next = chalIdx + 1
        if (next < level.challenges.length) {
            setChalIdx(next)
            reset(level.challenges[next].den)
        } else if (levelIdx + 1 < LEVELS.length) {
            const nl = levelIdx + 1
            setLevelIdx(nl)
            setChalIdx(0)
            reset(LEVELS[nl].challenges[0].den)
        }
    }

    // ── pie management ────────────────────────────────────────────────────────────
    function addPie() {
        if (submitted) return
        setPies(prev => [...prev, newPie()])
    }

    function removePie(id) {
        if (submitted || pies.length <= 1) return
        setPies(prev => prev.filter(p => p.id !== id))
    }

    // ── toggle a slice in a specific pie ─────────────────────────────────────────
    function toggleSlice(pieId, sliceIdx) {
        if (submitted) return
        setPies(prev => prev.map(p => {
            if (p.id !== pieId) return p
            const next = new Set(p.shaded)
            next.has(sliceIdx) ? next.delete(sliceIdx) : next.add(sliceIdx)
            return { ...p, shaded: next }
        }))
    }

    // ── slider — resets all shading when changed ──────────────────────────────────
    function onSliderChange(e) {
        const val = Number(e.target.value)
        setSlices(val)
        setPies(prev => prev.map(p => ({ ...p, shaded: new Set() })))
        setResult(null)
        setSubmitted(false)
    }

    // ── check ────────────────────────────────────────────────────────────────────
    function checkAnswer() {
        const ok = slices === den && totalShaded === num
        setResult(ok ? 'correct' : 'wrong')
        setSubmitted(true)
        if (ok) {
            setScore(s => s + 100)
            setHint(false)
        }
    }

    const isLast = levelIdx === LEVELS.length - 1 && chalIdx === level.challenges.length - 1

    // target breakdown for mini preview
    const fullCircles = Math.floor(num / den)
    const remainder = num % den
    const targetMinis = [
        ...Array(fullCircles).fill(den),
        ...(remainder > 0 ? [remainder] : []),
    ]

    return (
        <div className="min-h-screen bg-[#eef4fb] flex flex-col font-sans select-none">

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
                        <span className="font-bold text-blue-700 text-4xl">Fraction Pie</span>
                    </div>
                </header>
                <div className="flex items-center gap-2">
                    {/* level tabs in header */}
                    {LEVELS.map((l, i) => (
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

            {/* ── body ── */}
            <div className="flex flex-col items-center flex-1 px-4 py-6 gap-6 overflow-y-auto">

                {showHelp && !submitted && (
                    <div className="w-full max-w-5xl bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 text-sm text-blue-700">
                        <strong>How to play:</strong> Set the number of slices with the slider, then click any slice to shade or unshade it.
                        Add more pies with <strong>+ Add Pie</strong> for improper fractions or mixed numbers. Remove extra pies with the trash icon.
                    </div>
                )}

                {/* target title */}
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 bg-slate-100 rounded-full"
                        style={{ color: level.color }}>{level.label} · {level.desc}</span>
                    <h2 className="text-4xl font-black mt-1 flex items-end gap-2" style={{ color: level.color }}>
                        Build
                        <span className="inline-flex flex-col items-center leading-none">
                            <span className="text-3xl font-black border-b-2 border-current px-1 leading-tight">{num}</span>
                            <span className="text-3xl font-black px-1 leading-tight">{den}</span>
                        </span>
                    </h2>
                    <p className="text-slate-400 text-sm">Set the slices, shade the pies, add more pies if needed!</p>
                </div>

                {/* ── main layout ── */}
                <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-6 items-start">

                    {/* ── LEFT: controls ── */}
                    <div className="flex flex-col gap-4 w-full lg:w-100 shrink-0">

                        {/* current build */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">CURRENT BUILD</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-center">
                                    <span className="text-4xl font-black text-slate-800 border-b-4 border-slate-800 px-2 leading-tight">{totalShaded}</span>
                                    <span className="text-4xl font-black text-slate-800 px-2 leading-tight">{slices}</span>
                                </div>
                                {totalShaded > 0 && totalShaded >= slices && (
                                    <div className="text-sm text-slate-500 font-semibold leading-tight">
                                        = {Math.floor(totalShaded / slices)}
                                        {totalShaded % slices > 0 && (
                                            <span className="inline-flex flex-col items-center leading-none align-middle ml-1 text-xs">
                                                <span className="border-b border-slate-400 px-0.5">{totalShaded % slices}</span>
                                                <span className="px-0.5">{slices}</span>
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                {pies.length} pie{pies.length !== 1 ? 's' : ''} · {totalShaded} shaded of {pies.length * slices} total
                            </p>
                        </div>

                        {/* denominator slider */}
                        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
                            <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">DENOMINATOR (SLICES)</p>
                            <input type="range" min={2} max={12} value={slices} onChange={onSliderChange}
                                className="w-full accent-blue-600 cursor-pointer" />
                            <div className="flex justify-between mt-1">
                                {Array.from({ length: 11 }, (_, i) => i + 2).map(n => (
                                    <span key={n} className={`text-[10px] font-bold ${n === slices ? 'text-blue-600' : 'text-slate-300'}`}>{n}</span>
                                ))}
                            </div>
                        </div>

                        {/* show label */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm">
                                <Tag size={15} className="text-blue-500" /> Show Label
                            </div>
                            <button onClick={() => setShowLabel(v => !v)}
                                className={`relative w-11 h-6 rounded-full transition-colors ${showLabel ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${showLabel ? 'left-5' : 'left-0.5'}`} />
                            </button>
                        </div>

                        {/* reset */}
                        <button onClick={() => reset()}
                            className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2.5 rounded-2xl shadow-md transition-colors">
                            <RotateCcw size={14} /> Reset All
                        </button>
                        <button onClick={() => checkAnswer()}
                            className="flex items-center justify-center gap-2 bg-green-700 hover:bg-blue-800 text-white font-bold px-4 py-2.5 rounded-2xl shadow-md transition-colors">
                            <Check size={14} /> Check
                        </button>



                        {/* feedback */}
                        {result === 'correct' && (
                            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl px-4 py-3 text-center">
                                <p className="text-emerald-700 font-black">🎉 Correct!</p>
                                <p className="text-emerald-600 text-xs mt-0.5">You built {num}/{den} perfectly.</p>
                                {!isLast ? (
                                    <button onClick={nextChallenge}
                                        className="mt-2 flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-1.5 rounded-full text-sm mx-auto">
                                        Next <ChevronRight size={14} />
                                    </button>
                                ) : (
                                    <p className="text-emerald-500 font-bold text-sm mt-1">All done! ⭐ {score} pts</p>
                                )}
                            </div>
                        )}
                        {result === 'wrong' && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 text-center">
                                <p className="text-red-600 font-black">Not quite!</p>
                                <p className="text-red-400 text-xs mt-1">
                                    {slices !== den
                                        ? `Slider should be at ${den} — you have ${slices}.`
                                        : `You shaded ${totalShaded} slices — need ${num}.`}
                                </p>
                                <button onClick={() => reset()}
                                    className="mt-2 flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-600 font-bold px-4 py-1.5 rounded-full text-sm mx-auto">
                                    <RotateCcw size={12} /> Try Again
                                </button>
                            </div>
                        )}

                        {/* target miniatures */}
                        {
                            hint ? (
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                                    <div className='flex justify-between items-center'>
                                        <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">TARGET</p>
                                        <div className=''
                                            onClick={() => setHint(false)}
                                        >
                                            <X size={20} />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {targetMinis.map((shadedN, i) => (
                                            <TargetMini key={i} slices={den} shadedCount={shadedN} />
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1 text-center">{num}/{den}</p>
                                </div>
                            ) :
                                (
                                    <button onClick={() => {
                                        setHint(true)
                                    }}
                                        className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2.5 rounded-2xl shadow-md transition-colors">
                                        <RotateCcw size={14} /> Hint
                                    </button>
                                )
                        }
                    </div>

                    {/* ── RIGHT: pies ── */}
                    <div className="flex-1">
                        <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">YOUR PIES</p>
                        <div className="flex flex-wrap gap-5 items-start">
                            {pies.map((pie, idx) => (
                                <div key={pie.id} className="flex flex-col items-center gap-2">
                                    <div className="relative">
                                        <PieCircle
                                            slices={slices}
                                            shaded={pie.shaded}
                                            onToggle={(si) => toggleSlice(pie.id, si)}
                                            showLabel={showLabel}
                                            disabled={submitted}
                                            highlight={result === 'correct'}
                                        />
                                        {/* remove button — top-right corner */}
                                        {!submitted && pies.length > 1 && (
                                            <button
                                                onClick={() => removePie(pie.id)}
                                                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 text-red-500 flex items-center justify-center shadow-sm border border-red-200 transition-colors"
                                                title="Remove this pie"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-400 font-semibold">
                                        Pie {idx + 1} — {pie.shaded.size}/{slices}
                                    </span>
                                </div>
                            ))}

                            {/* add pie shortcut */}
                            {!submitted && (
                                <button
                                    onClick={addPie}
                                    className="w-[200px] h-[200px] rounded-full border-2 border-dashed border-indigo-300 bg-indigo-50
                    hover:bg-indigo-100 hover:border-indigo-400 flex flex-col items-center justify-center gap-2
                    text-indigo-400 font-bold text-sm transition-colors"
                                >
                                    <Plus size={28} />
                                    Add Pie
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
