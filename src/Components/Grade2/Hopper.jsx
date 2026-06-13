import { useState, useRef, useEffect, useCallback } from 'react'
import { Undo2, HelpCircle, Settings, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// ─── Level configs ────────────────────────────────────────────────────────────
// Each level defines what kind of puzzle to generate, not static data.
const LEVEL_CONFIGS = [
  { label: 'LEVEL 1', desc: 'Add/subtract within 20',              max: 20,  types: ['add', 'sub']            },
  { label: 'LEVEL 2', desc: 'Add/subtract within 100 (no regroup)',max: 99,  types: ['add', 'sub']            },
  { label: 'LEVEL 3', desc: 'Add/subtract within 100 (regroup)',   max: 99,  types: ['add', 'sub']            },
  { label: 'LEVEL 4', desc: 'Missing addend problems',             max: 99,  types: ['missing']               },
]

// ─── Random puzzle generator ──────────────────────────────────────────────────
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomPuzzle(levelIdx) {
  const cfg  = LEVEL_CONFIGS[levelIdx]
  const type = cfg.types[Math.floor(Math.random() * cfg.types.length)]
  const max  = cfg.max

  if (type === 'add') {
    // start + b = target, all within max, b >= 2
    const start  = randInt(1, max - 2)
    const b      = randInt(2, max - start)
    return { start, op: '+', b, type: 'add' }
  }

  if (type === 'sub') {
    // start - b = positive result, b >= 2
    const start  = randInt(3, max)
    const b      = randInt(2, start - 1)
    return { start, op: '-', b, type: 'sub' }
  }

  // missing: start + __ = target
  const start  = randInt(1, max - 2)
  const target = randInt(start + 2, max)
  return { start, op: '+', b: null, target, type: 'missing' }
}

// derive target for non-missing puzzles
function getTarget(puzzle) {
  if (puzzle.type === 'missing') return puzzle.target
  return puzzle.op === '+' ? puzzle.start + puzzle.b : puzzle.start - puzzle.b
}

// ─── Dynamic number line range ────────────────────────────────────────────────
// Returns { nlMin, nlMax } snapped to multiples of 10, padded by 10 each side.
function getRange(puzzle) {
  const target = getTarget(puzzle)
  const lo = Math.min(puzzle.start, target)
  const hi = Math.max(puzzle.start, target)
  const nlMin = Math.max(0, Math.floor(lo / 10) * 10 - 10)
  const nlMax = Math.ceil(hi / 10) * 10 + 10
  return { nlMin, nlMax }
}

// arc colours cycling per hop
const ARC_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

// ─── Build multiple-choice options for missing addend ─────────────────────────
// correctAnswer = target - start. Generates 3 plausible distractors.
function buildChoices(correctAnswer) {
  const offsets = [-10, -5, -2, -1, 1, 2, 5, 10]
  const distractors = new Set()
  // shuffle offsets and pick 3 unique wrong answers > 0
  const shuffled = [...offsets].sort(() => Math.random() - 0.5)
  for (const off of shuffled) {
    const wrong = correctAnswer + off
    if (wrong > 0 && wrong !== correctAnswer) {
      distractors.add(wrong)
    }
    if (distractors.size === 3) break
  }
  return [...distractors, correctAnswer].sort(() => Math.random() - 0.5)
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Hopper() {
  const [levelIdx, setLevelIdx] = useState(0)
  const [puzzle,   setPuzzle]   = useState(() => randomPuzzle(0))
  const [hops, setHops] = useState([])
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [choices, setChoices] = useState([])

  const navigate = useNavigate()
  const canvasRef = useRef(null)

  const level  = LEVEL_CONFIGS[levelIdx]
  const target = getTarget(puzzle)
  const { nlMin, nlMax } = getRange(puzzle)

  // For missing type: the addend the student needs to find
  const missingAddend = puzzle.type === 'missing' ? target - puzzle.start : null

  // The correct answer to select:
  //   missing → the hidden addend
  //   add/sub → the target (final result)
  const correctChoice = puzzle.type === 'missing' ? missingAddend : target

  // Generate choices whenever puzzle changes
  useEffect(() => {
    setChoices(buildChoices(correctChoice))
    setSelectedAnswer(null)
  }, [puzzle, correctChoice])

  // current marker position = start + sum of hops
  const position = hops.reduce((acc, h) => acc + h.delta, puzzle.start)

  // For missing: total hops so far (what the student has counted)
  const hopTotal = hops.reduce((acc, h) => acc + h.delta, 0)

  // ── draw number line ────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    const PAD = 40
    const lineY = H * 0.72
    const span = W - PAD * 2
    const range = nlMax - nlMin

    const toX = (n) => PAD + ((n - nlMin) / range) * span

    ctx.clearRect(0, 0, W, H)

    // ── axis line
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(PAD, lineY)
    ctx.lineTo(W - PAD, lineY)
    ctx.stroke()

    // ── tick interval: every 5 for small ranges, every 10 for larger
    const tickStep = range <= 30 ? 5 : 10
    const labelStep = range <= 30 ? 5 : 10

    for (let v = nlMin; v <= nlMax; v += tickStep) {
      const x = toX(v)
      const isMajor = v % labelStep === 0
      ctx.strokeStyle = isMajor ? '#94a3b8' : '#cbd5e1'
      ctx.lineWidth = isMajor ? 1.5 : 1
      ctx.beginPath()
      ctx.moveTo(x, lineY - (isMajor ? 8 : 4))
      ctx.lineTo(x, lineY + (isMajor ? 8 : 4))
      ctx.stroke()
      if (isMajor) {
        ctx.fillStyle = '#475569'
        ctx.font = 'bold 13px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(v, x, lineY + 22)
      }
    }

    // ── hop arcs
    hops.forEach((hop, idx) => {
      const color = ARC_COLORS[idx % ARC_COLORS.length]
      const x1 = toX(hop.from)
      const x2 = toX(hop.to)
      const midX = (x1 + x2) / 2
      const arcH = -Math.min(Math.abs(x2 - x1) * 0.55, 70)
      const cpY = lineY + arcH

      ctx.strokeStyle = color
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(x1, lineY)
      ctx.quadraticCurveTo(midX, cpY, x2, lineY)
      ctx.stroke()

      // arrowhead at x2
      const angle = Math.atan2(lineY - cpY, x2 - midX)
      const aLen = 8
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(x2, lineY)
      ctx.lineTo(x2 - aLen * Math.cos(angle - 0.4), lineY - aLen * Math.sin(angle - 0.4))
      ctx.lineTo(x2 - aLen * Math.cos(angle + 0.4), lineY - aLen * Math.sin(angle + 0.4))
      ctx.closePath()
      ctx.fill()

      // delta label above arc
      ctx.fillStyle = color
      ctx.font = 'bold 12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText((hop.delta > 0 ? '+' : '') + hop.delta, midX, cpY - 6)
    })

    // ── start marker (ghost)
    ctx.fillStyle = '#94a3b8'
    ctx.beginPath()
    ctx.arc(toX(puzzle.start), lineY, 7, 0, Math.PI * 2)
    ctx.fill()

    // ── target marker (missing addend)
    if (puzzle.type === 'missing') {
      const tx = toX(target)
      ctx.strokeStyle = '#f97316'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 3])
      ctx.beginPath()
      ctx.moveTo(tx, lineY - 18)
      ctx.lineTo(tx, lineY + 18)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#f97316'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('?', tx, lineY - 24)
    }

    // ── frog marker
    const px = toX(position)
    ctx.fillStyle = 'rgba(0,0,0,0.15)'
    ctx.beginPath()
    ctx.ellipse(px, lineY + 12, 12, 5, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = checked ? (correct ? '#10b981' : '#ef4444') : '#3b82f6'
    ctx.beginPath()
    ctx.arc(px, lineY - 16, 14, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'white'
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(position, px, lineY - 12)
    ctx.fillStyle = '#1e40af'
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText('The Hopper', px, lineY - 36)
  }, [hops, position, puzzle, target, checked, correct, nlMin, nlMax])

  useEffect(() => { draw() }, [draw])

  // resize canvas to parent width
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const parent = canvas.parentElement
      canvas.width = parent.clientWidth
      canvas.height = 130
      draw()
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [draw])

  // ── hop controls ────────────────────────────────────────────────────────────
  function hop(delta) {
    if (checked) return
    const next = position + delta
    if (next < nlMin || next > nlMax) return
    setHops(prev => [...prev, { from: position, to: next, delta }])
  }

  function undo() {
    setChecked(false)
    setCorrect(false)
    setSelectedAnswer(null)
    setHops(prev => prev.slice(0, -1))
  }

  function handleSelectAnswer(choice) {
    if (checked) return
    setSelectedAnswer(choice)
    setCorrect(choice === correctChoice)
    setChecked(true)
  }

  function nextPuzzle() {
    setPuzzle(randomPuzzle(levelIdx))
    setHops([])
    setChecked(false)
    setCorrect(false)
    setSelectedAnswer(null)
  }

  function reset() {
    setHops([])
    setChecked(false)
    setCorrect(false)
    setSelectedAnswer(null)
  }

  // ── problem display string ──────────────────────────────────────────────────
  const blankDisplay = selectedAnswer !== null ? selectedAnswer : '__'
  const problemStr = puzzle.type === 'missing'
    ? `${puzzle.start} + ${blankDisplay} = ${target}`
    : `${puzzle.start} ${puzzle.op} ${puzzle.b} = ${selectedAnswer !== null ? selectedAnswer : '?'}`

  return (
    <div className="h-screen bg-[#f0f4fb] flex flex-col select-none font-sans overflow-hidden">

      {/* ── header ── */}
      <header className="w-full px-6 pt-2 pb-2 flex justify-between items-center shrink-0">
        <div className='flex gap-5 items-center'>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-blue-600 font-bold text-sm bg-blue-200 p-4 hover:text-blue-800 rounded-full"
          >
            <ArrowLeft size={30} />
          </button>
          <h1 className="text-4xl font-bold text-blue-600">The Hopper</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHelp(h => !h)}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-blue-500"
          >
            <HelpCircle size={18} />
          </button>
          <button className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-600">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* ── main content ── */}
      <div className="flex flex-col items-center flex-1 overflow-y-auto px-4 pb-4 gap-4">

        {/* help bar */}
        {showHelp && (
          <div className="w-full max-w-2xl bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 text-sm text-blue-700">
            Use the hop buttons to move the frog. Break the number into tens and ones.
            When you reach the answer, press <strong>Check Answer</strong>.
          </div>
        )}

        {/* level selector */}
        <div className="flex gap-2 w-full max-w-2xl">
          {LEVEL_CONFIGS.map((l, i) => (
            <button
              key={i}
              onClick={() => { setLevelIdx(i); setPuzzle(randomPuzzle(i)); reset() }}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-colors border
                ${i === levelIdx
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* problem card */}
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-slate-100 px-8 py-5 relative">
          {/* dog-ear */}
          <div className="absolute top-0 right-0 w-10 h-10 bg-amber-50 rounded-bl-2xl rounded-tr-3xl border-l border-b border-slate-100" />
          <p className="text-xs font-bold text-amber-500 tracking-widest mb-1">{level.label}</p>
          <p className="text-3xl font-black text-blue-700 mb-3">{problemStr}</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center text-xl font-black shadow">
              {position}
            </div>
            <span className="text-slate-500 font-semibold">Your Position</span>
            {hops.length > 0 && (
              <span className="ml-auto text-xs text-slate-400">
                {hops.length} hop{hops.length !== 1 ? 's' : ''} made
              </span>
            )}
          </div>
        </div>

        {/* number line canvas */}
        <div className="w-full max-w-screen bg-white rounded-2xl shadow-sm border h-60 flex justify-center items-center border-slate-100 px-2 py-3">
          <canvas ref={canvasRef} className="w-full" style={{ height: 130 }} />
        </div>

        <div className="shrink-0 bg-white border-t border-slate-100 shadow-inner px-4 py-3 flex justify-center gap-3">
          {/* +10 / -10 column */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => hop(+10)}
              className="w-36 h-14 rounded-2xl bg-amber-400 hover:bg-amber-500 text-white font-black text-base shadow-md active:scale-95 transition-all flex flex-col items-center justify-center"
            >
              <span className="text-lg leading-none">⇑</span>
              <span>+10</span>
            </button>
            <button
              onClick={() => hop(-10)}
              className="w-36 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-base shadow-sm active:scale-95 transition-all flex flex-col items-center justify-center"
            >
              <span className="text-lg leading-none">⇓</span>
              <span>-10</span>
            </button>
          </div>

          {/* +1 / -1 column */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => hop(+1)}
              className="w-36 h-14 rounded-2xl bg-amber-300 hover:bg-amber-400 text-white font-black text-base shadow-md active:scale-95 transition-all flex flex-col items-center justify-center"
            >
              <span className="text-lg leading-none">↑</span>
              <span>+1</span>
            </button>
            <button
              onClick={() => hop(-1)}
              className="w-36 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-base shadow-sm active:scale-95 transition-all flex flex-col items-center justify-center"
            >
              <span className="text-lg leading-none">↓</span>
              <span>-1</span>
            </button>
          </div>

          {/* undo + reset */}
          <div className="flex flex-col gap-2">
            <button
              onClick={undo}
              disabled={hops.length === 0}
              className={`w-28 h-14 rounded-2xl font-bold text-sm flex flex-col items-center justify-center gap-1 shadow transition-all
              ${hops.length > 0
                  ? 'bg-red-50 border border-red-300 text-red-500 hover:bg-red-100 active:scale-95'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-transparent'
                }`}
            >
              <Undo2 size={20} />
              Undo
            </button>
            <button
              onClick={reset}
              disabled={hops.length === 0}
              className={`w-28 h-14 rounded-2xl font-bold text-sm flex flex-col items-center justify-center gap-1 shadow transition-all
              ${hops.length > 0
                  ? 'bg-slate-200 border border-slate-300 text-slate-600 hover:bg-slate-300 active:scale-95'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-transparent'
                }`}
            >
              <span className="text-base">↺</span>
              Reset
            </button>
          </div>
        </div>

        {/* ── Answer choices (all puzzle types) ── */}
        {!checked && (
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-100 shadow-sm px-6 py-4 flex flex-col gap-3">
            <p className="text-sm font-bold text-slate-500 text-center">
              {hops.length === 0
                ? 'Hop the frog, then pick your answer below.'
                : puzzle.type === 'missing'
                  ? <>You hopped <span className="text-blue-600">{hopTotal > 0 ? '+' : ''}{hopTotal}</span> so far. What is the missing addend?</>
                  : <>You landed on <span className="text-blue-600">{position}</span>. What is the answer?</>
              }
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              {choices.map((c) => (
                <button
                  key={c}
                  onClick={() => handleSelectAnswer(c)}
                  className="w-20 h-16 rounded-2xl text-2xl font-black shadow-md transition-all active:scale-95 bg-amber-400 hover:bg-amber-500 text-white"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* feedback */}
        {checked && (
          <div className={`w-full max-w-2xl rounded-2xl px-6 py-4 font-bold text-center text-lg
            ${correct ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-700' : 'bg-red-50 border-2 border-red-300 text-red-600'}`}
          >
            {puzzle.type === 'missing'
              ? correct
                ? `🎉 Correct! ${puzzle.start} + ${missingAddend} = ${target}`
                : `Not quite — the missing number is ${missingAddend}, not ${selectedAnswer}.`
              : correct
                ? `🎉 Correct! ${puzzle.start} ${puzzle.op} ${puzzle.b} = ${target}`
                : `Not quite — the answer is ${target}, not ${selectedAnswer}.`
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
  )
}
