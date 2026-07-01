import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, HelpCircle, RotateCcw, ChevronRight } from 'lucide-react'

// ─── Level configs ─────────────────────────────────────────────────────────────
const LEVELS = [
  {
    label: 'Level 1', desc: 'Build both fractions yourself', color: '#3b82f6', autoFill: false,
    problems: [
      { a: { num: 1, den: 2 }, b: { num: 1, den: 3 } },
      { a: { num: 1, den: 4 }, b: { num: 1, den: 2 } },
      { a: { num: 2, den: 4 }, b: { num: 1, den: 2 } },
      { a: { num: 1, den: 3 }, b: { num: 1, den: 4 } },
      { a: { num: 3, den: 4 }, b: { num: 2, den: 3 } },
    ],
  },
  {
    label: 'Level 2', desc: 'Same denominator — compare numerators', color: '#8b5cf6', autoFill: false,
    problems: [
      { a: { num: 2, den: 5 }, b: { num: 3, den: 5 } },
      { a: { num: 3, den: 6 }, b: { num: 5, den: 6 } },
      { a: { num: 4, den: 8 }, b: { num: 3, den: 8 } },
      { a: { num: 1, den: 4 }, b: { num: 3, den: 4 } },
      { a: { num: 5, den: 7 }, b: { num: 5, den: 7 } },
    ],
  },
  {
    label: 'Level 3', desc: 'Same numerator — compare denominators', color: '#f59e0b', autoFill: false,
    problems: [
      { a: { num: 2, den: 3 }, b: { num: 2, den: 5 } },
      { a: { num: 3, den: 4 }, b: { num: 3, den: 8 } },
      { a: { num: 1, den: 2 }, b: { num: 1, den: 5 } },
      { a: { num: 4, den: 5 }, b: { num: 4, den: 9 } },
      { a: { num: 2, den: 7 }, b: { num: 2, den: 7 } },
    ],
  },
  {
    label: 'Level 4', desc: 'Any fractions — auto pies', color: '#059669', autoFill: false,
    problems: [
      { a: { num: 2, den: 3 }, b: { num: 3, den: 5 } },
      { a: { num: 5, den: 6 }, b: { num: 3, den: 4 } },
      { a: { num: 4, den: 9 }, b: { num: 2, den: 5 } },
      { a: { num: 7, den: 8 }, b: { num: 5, den: 6 } },
      { a: { num: 3, den: 7 }, b: { num: 3, den: 7 } },
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
  const sweep = 360 / total
  const s = polarToXY(sweep * idx)
  const e = polarToXY(sweep * (idx + 1))
  const large = sweep > 180 ? 1 : 0
  return `M ${CX} ${CY} L ${s.x} ${s.y} A ${R} ${R} 0 ${large} 1 ${e.x} ${e.y} Z`
}

// ─── Pie SVG — each slice toggles independently via a Set ─────────────────────
function PieSVG({ slices, shadedSet, onToggle, showLabel, color, disabled, dim = 220 }) {
  return (
    <svg width={dim} height={dim} viewBox="0 0 240 240" className="drop-shadow-lg">
      <circle cx={CX} cy={CY} r={R} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1.5} />

      {Array.from({ length: slices }, (_, i) => (
        <path
          key={i}
          d={slicePath(i, slices)}
          fill={shadedSet.has(i) ? color : '#f1f5f9'}
          stroke="white"
          strokeWidth={2.5}
          className={
            disabled
              ? 'cursor-default'
              : 'cursor-pointer hover:brightness-90 active:brightness-75 transition-all'
          }
          onClick={() => !disabled && onToggle(i)}
        />
      ))}

      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#cbd5e1" strokeWidth={1.5} />

      {showLabel && (
        <g>
          <rect x={CX - 30} y={CY - 15} width={60} height={30} rx={10}
            fill="white" fillOpacity={0.92} stroke="#c7d2fe" strokeWidth={1.5} />
          <text x={CX} y={CY + 7} textAnchor="middle" fontSize={13} fontWeight="bold" fill="#3730a3">
            {shadedSet.size}/{slices}
          </text>
        </g>
      )}
    </svg>
  )
}

// ─── Symbol button ────────────────────────────────────────────────────────────
function SymbolBtn({ sym, selected, correct, submitted, onClick }) {
  let cls = 'w-14 h-14 rounded-2xl text-2xl font-black border-2 transition-all flex items-center justify-center '
  if (!submitted) {
    cls += selected
      ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-110'
      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
  } else {
    if (selected && correct) cls += 'bg-emerald-500 text-white border-emerald-500 scale-110'
    else if (selected && !correct) cls += 'bg-red-400 text-white border-red-400'
    else if (!selected && correct) cls += 'bg-emerald-100 text-emerald-600 border-emerald-400'
    else cls += 'bg-white text-slate-300 border-slate-200'
  }
  return <button className={cls} onClick={onClick} disabled={submitted}>{sym}</button>
}

// ─── Fraction stacked display ─────────────────────────────────────────────────
function FractionDisplay({ num, den, color }) {
  return (
    <div className="flex flex-col items-center leading-none" style={{ color }}>
      <span className="text-3xl font-black border-b-[3px] border-current px-2 leading-tight">{num}</span>
      <span className="text-3xl font-black px-2 leading-tight">{den}</span>
    </div>
  )
}

// ─── State helpers ────────────────────────────────────────────────────────────
const PIE_A_COLOR = '#6366f1'
const PIE_B_COLOR = '#f97316'

// Build an auto-fill Set of the first `num` indices out of `den`
function autoSet(num, den) {
  return new Set(Array.from({ length: num }, (_, i) => i))
}

function initState(problem, autoFill) {
  return {
    aSlices: problem.a.den,
    aShadedSet: autoFill ? autoSet(problem.a.num, problem.a.den) : new Set(),
    bSlices: problem.b.den,
    bShadedSet: autoFill ? autoSet(problem.b.num, problem.b.den) : new Set(),
  }
}

// Toggle a slice index in a Set, returning a new Set
function toggleInSet(set, idx) {
  const next = new Set(set)
  next.has(idx) ? next.delete(idx) : next.add(idx)
  return next
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function FractionCompare() {
  const navigate = useNavigate()

  const [levelIdx, setLevelIdx] = useState(0)
  const [probIdx, setProbIdx] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const [showLabel, setShowLabel] = useState(true)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [pieError, setPieError] = useState(null)  // null | string

  const level = LEVELS[levelIdx]
  const problem = level.problems[probIdx]

  const [pie, setPie] = useState(() => initState(problem, level.autoFill))

  useEffect(() => {
    setPie(initState(problem, level.autoFill))
    setSelected(null)
    setSubmitted(false)
    setResult(null)
  }, [levelIdx, probIdx, problem, level.autoFill])

  const aVal = problem.a.num / problem.a.den
  const bVal = problem.b.num / problem.b.den
  const answer = aVal > bVal ? '>' : aVal < bVal ? '<' : '='

  // ── slice toggles ─────────────────────────────────────────────────────────────
  function toggleA(idx) {
    if (submitted) return
    setPieError(null)
    setPie(prev => ({ ...prev, aShadedSet: toggleInSet(prev.aShadedSet, idx) }))
  }

  function toggleB(idx) {
    if (submitted) return
    setPieError(null)
    setPie(prev => ({ ...prev, bShadedSet: toggleInSet(prev.bShadedSet, idx) }))
  }

  // ── sliders reset shading when denominator changes ────────────────────────────
  function onSliderA(e) {
    if (submitted) return
    setPieError(null)
    setPie(prev => ({ ...prev, aSlices: Number(e.target.value), aShadedSet: new Set() }))
  }

  function onSliderB(e) {
    if (submitted) return
    setPieError(null)
    setPie(prev => ({ ...prev, bSlices: Number(e.target.value), bShadedSet: new Set() }))
  }

  // ── submit ────────────────────────────────────────────────────────────────────
  function submitAnswer() {
    if (!selected) return

    // For build-it-yourself levels, both pies must match the target fraction exactly
    if (!level.autoFill) {
      const aCorrect = pie.aSlices === problem.a.den && pie.aShadedSet.size === problem.a.num
      const bCorrect = pie.bSlices === problem.b.den && pie.bShadedSet.size === problem.b.num

      if (!aCorrect || !bCorrect) {
        const msgs = []
        if (!aCorrect) msgs.push(
          `Pie A should show ${problem.a.num}/${problem.a.den} — set the slider to ${problem.a.den} slices and shade ${problem.a.num}.`
        )
        if (!bCorrect) msgs.push(
          `Pie B should show ${problem.b.num}/${problem.b.den} — set the slider to ${problem.b.den} slices and shade ${problem.b.num}.`
        )
        setPieError(msgs.join('  •  '))
        return
      }
    }

    setPieError(null)
    const ok = selected === answer
    setResult(ok ? 'correct' : 'wrong')
    setSubmitted(true)
    if (ok) setScore(s => s + 100)
  }

  function nextProblem() {
    const next = probIdx + 1
    if (next < level.problems.length) setProbIdx(next)
    else if (levelIdx + 1 < LEVELS.length) { setLevelIdx(l => l + 1); setProbIdx(0) }
  }

  function reset() {
    setPie(initState(problem, level.autoFill))
    setSelected(null)
    setSubmitted(false)
    setResult(null)
    setPieError(null)
  }

  function switchLevel(idx) { setLevelIdx(idx); setProbIdx(0) }

  const isLast = levelIdx === LEVELS.length - 1 && probIdx === level.problems.length - 1

  return (
    <div className="min-h-screen bg-[#f0f4fb] flex flex-col font-sans select-none">

      {/* header */}
      <header className="w-full px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200">
            <ArrowLeft size={30} />
          </button>
          <span className="font-bold text-blue-700 text-3xl">Fraction Compare</span>
        </div>
        <div className="flex items-center gap-2">
          {LEVELS.map((l, i) => (
            <button key={l.label} onClick={() => switchLevel(i)}
              className={`w-fit px-2 items-center py-1 rounded-full text-sm font-black flex gap-2 border-2 transition-all ${i === levelIdx ? 'border-blue-500 scale-110' : 'border-transparent'}`}
              style={{ color: l.color, backgroundColor: i === levelIdx ? `${l.color}20` : '' }}
              title={l.label}
            >
              <span>Level</span> {i + 1}
            </button>
          ))}

          <button onClick={() => setShowHelp(h => !h)} className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-500">
            <HelpCircle size={16} />
          </button>
        </div>
      </header>

      {/* body */}
      <div className="flex flex-col items-center flex-1 px-4 py-6 gap-5 overflow-y-auto">

        {showHelp && !submitted && (
          <div className="w-full max-w-4xl bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 text-sm text-blue-700">
            {level.autoFill
              ? <><strong>Level {levelIdx + 1}:</strong> Pies are built for you — study them, then pick &lt;, =, or &gt;.</>
              : <><strong>Level {levelIdx + 1}:</strong> Set the slices with the slider, click individual slices to shade or unshade them, then pick &lt;, =, or &gt;.</>
            }
            <span className="ml-2 text-blue-500">Both circles are the same size — a fair comparison!</span>
          </div>
        )}
        <div className='flex flex-col gap-2.5'>
          <div className="flex items-center flex-col gap-3">
            <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 bg-slate-100 rounded-full"
              style={{ color: level.color }}>{level.label} · {level.desc}</span>
            <h2 className="text-2xl font-black text-slate-700">Which is larger?</h2>
            <div className="flex items-center gap-6 bg-white rounded-2xl shadow-sm border border-slate-100 px-8 py-4">
              <FractionDisplay num={problem.a.num} den={problem.a.den} color={PIE_A_COLOR} />
              <span className="text-slate-300 text-3xl font-black">|</span>
              <FractionDisplay num={problem.b.num} den={problem.b.den} color={PIE_B_COLOR} />
            </div>
          </div>
        </div>

        <div className='flex justify-center items-center gap-6'>

          {/* PIE A */}

          <div className={`bg-white rounded-3xl shadow-sm border-2 p-5 flex flex-col items-center gap-3 transition-all
            ${submitted && result === 'correct' && (answer === '>' || answer === '=') ? 'border-emerald-300'
              : pieError && (pie.aSlices !== problem.a.den || pie.aShadedSet.size !== problem.a.num) ? 'border-amber-400'
                : 'border-slate-100'}`}>
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">PIE A</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: PIE_A_COLOR }}>
                {problem.a.num}/{problem.a.den}
              </span>
            </div>
            <PieSVG
              slices={pie.aSlices}
              shadedSet={pie.aShadedSet}
              onToggle={toggleA}
              showLabel={showLabel}
              color={PIE_A_COLOR}
              disabled={level.autoFill || submitted}
            />
            <div className="w-full">
              <p className="text-xs text-slate-500 font-semibold">
                Shaded: <strong style={{ color: PIE_A_COLOR }}>{pie.aShadedSet.size} of {pie.aSlices}</strong>
              </p>
              {!level.autoFill && (
                <>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mt-3 mb-1">DENOMINATOR</p>
                  <input type="range" min={1} max={12} value={pie.aSlices} onChange={onSliderA}
                    disabled={submitted} className="w-full accent-indigo-500 cursor-pointer disabled:cursor-default" />
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => !submitted && setPie(p => ({ ...p, aShadedSet: toggleInSet(p.aShadedSet, p.aShadedSet.size - 1) }))}
                      disabled={submitted || pie.aShadedSet.size === 0}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-lg flex items-center justify-center disabled:opacity-30">−</button>
                    <span className="text-sm font-bold text-slate-600 flex-1 text-center">{pie.aShadedSet.size} shaded</span>
                    <button onClick={() => !submitted && pie.aShadedSet.size < pie.aSlices && setPie(p => ({ ...p, aShadedSet: toggleInSet(p.aShadedSet, p.aShadedSet.size) }))}
                      disabled={submitted || pie.aShadedSet.size >= pie.aSlices}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-lg flex items-center justify-center disabled:opacity-30">+</button>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className='flex gap-3 flex-col items-center justify-around'>
            <div className="flex flex-col items-center gap-3">

              <div className="flex items-center gap-3 mt-1">
                {['<', '=', '>'].map(sym => (
                  <SymbolBtn key={sym} sym={sym} selected={selected === sym}
                    correct={answer === sym} submitted={submitted}
                    onClick={() => !submitted && setSelected(sym)} />
                ))}
              </div>
            </div>

            <div className='flex items-center justify-center'>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black border-2 shadow-sm transition-all
              ${!selected
                  ? 'border-dashed border-slate-300 bg-white text-slate-300'
                  : submitted && result === 'correct'
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-600 scale-110'
                    : submitted && result === 'wrong'
                      ? 'border-red-400 bg-red-50 text-red-500'
                      : 'border-blue-400 bg-blue-50 text-blue-600 scale-105'
                }`}>
                {selected ?? '?'}
              </div>
            </div>

            <div className="flex items-center justify-center mt-2">
              <button onClick={reset}
                className="flex items-center gap-1 text-slate-400 hover:text-red-400 text-sm font-semibold transition-colors">
                <RotateCcw size={13} /> Reset
              </button>
            </div>
          </div>


          {/* PIE B */}
          <div className={`bg-white rounded-3xl shadow-sm border-2 p-5 flex flex-col items-center gap-3 transition-all
            ${submitted && result === 'correct' && (answer === '<' || answer === '=') ? 'border-emerald-300'
              : pieError && (pie.bSlices !== problem.b.den || pie.bShadedSet.size !== problem.b.num) ? 'border-amber-400'
                : 'border-slate-100'}`}>
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">PIE B</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: PIE_B_COLOR }}>
                {problem.b.num}/{problem.b.den}
              </span>
            </div>
            <PieSVG
              slices={pie.bSlices}
              shadedSet={pie.bShadedSet}
              onToggle={toggleB}
              showLabel={showLabel}
              color={PIE_B_COLOR}
              disabled={level.autoFill || submitted}
            />
            <div className="w-full">
              <p className="text-xs text-slate-500 font-semibold">
                Shaded: <strong style={{ color: PIE_B_COLOR }}>{pie.bShadedSet.size} of {pie.bSlices}</strong>
              </p>
              {!level.autoFill && (
                <>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mt-3 mb-1">DENOMINATOR</p>
                  <input type="range" min={1} max={12} value={pie.bSlices} onChange={onSliderB}
                    disabled={submitted} className="w-full accent-orange-500 cursor-pointer disabled:cursor-default" />
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => !submitted && setPie(p => ({ ...p, bShadedSet: toggleInSet(p.bShadedSet, p.bShadedSet.size - 1) }))}
                      disabled={submitted || pie.bShadedSet.size === 0}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-lg flex items-center justify-center disabled:opacity-30">−</button>
                    <span className="text-sm font-bold text-slate-600 flex-1 text-center">{pie.bShadedSet.size} shaded</span>
                    <button onClick={() => !submitted && pie.bShadedSet.size < pie.bSlices && setPie(p => ({ ...p, bShadedSet: toggleInSet(p.bShadedSet, p.bShadedSet.size) }))}
                      disabled={submitted || pie.bShadedSet.size >= pie.bSlices}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-lg flex items-center justify-center disabled:opacity-30">+</button>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>


        {/* show label + reset */}


        {/* pie build error */}
        {pieError && (
          <div className="w-full max-w-4xl bg-amber-50 border-2 border-amber-300 rounded-2xl px-5 py-3 flex items-start gap-3">
            <span className="text-amber-500 text-lg shrink-0">⚠️</span>
            <p className="text-amber-700 text-sm font-semibold">{pieError}</p>
          </div>
        )}

        {/* submit / feedback */}
        {!submitted ? (
          <button onClick={submitAnswer} disabled={!selected}
            className={`px-10 py-3 rounded-full font-black text-white shadow-md transition-all text-lg
              ${selected ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95' : 'bg-slate-300 cursor-not-allowed'}`}>
            Submit Answer
          </button>
        ) : (
          <div className={`w-full max-w-4xl rounded-2xl border-2 px-6 py-4 flex items-center justify-between
            ${result === 'correct' ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-200'}`}>
            <div>
              {result === 'correct' ? (
                <>
                  <p className="font-black text-emerald-700 text-lg">🎉 Correct!</p>
                  <p className="text-emerald-600 text-sm mt-0.5">
                    {problem.a.num}/{problem.a.den} <strong>{answer}</strong> {problem.b.num}/{problem.b.den}
                    {answer === '=' && ' — equivalent fractions!'}
                    {answer === '>' && ' — the left pie has more shaded area.'}
                    {answer === '<' && ' — the right pie has more shaded area.'}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-black text-red-600 text-lg">Not quite!</p>
                  <p className="text-red-400 text-sm mt-0.5">
                    The answer is <strong>{problem.a.num}/{problem.a.den} {answer} {problem.b.num}/{problem.b.den}</strong>.
                    {answer === '=' && ' They cover the same portion of equal-sized circles.'}
                    {answer === '>' && ` Even though Pie B has more slices, each slice of Pie B is smaller.`}
                    {answer === '<' && ` Even though Pie A has more slices, each slice of Pie A is smaller.`}
                  </p>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4 shrink-0">
              {result === 'wrong' && (
                <button onClick={reset}
                  className="flex items-center gap-1 bg-white border border-slate-200 text-slate-600 font-bold py-2 px-4 rounded-full text-sm hover:bg-slate-50">
                  <RotateCcw size={12} /> Try Again
                </button>
              )}
              {!isLast && (
                <button onClick={nextProblem}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-2 rounded-full shadow-md text-sm transition-colors">
                  Next <ChevronRight size={14} />
                </button>
              )}
              {isLast && result === 'correct' && (
                <span className="text-emerald-700 font-bold text-sm">All done! ⭐ {score} pts</span>
              )}
            </div>
          </div>
        )}

        {/* progress dots */}
        <div className="flex items-center gap-2">
          {level.problems.map((_, i) => (
            <div key={i}
              className={`h-2.5 rounded-full transition-all ${i < probIdx ? 'bg-emerald-400 w-2.5' : i === probIdx ? 'w-4' : 'bg-slate-200 w-2.5'}`}
              style={i === probIdx ? { background: level.color } : {}} />
          ))}
        </div>

      </div>
    </div>
  )
}
