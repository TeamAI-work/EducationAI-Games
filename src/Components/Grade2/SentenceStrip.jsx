import { useState } from 'react'
import { Volume2, HelpCircle, Hand, CheckCircle2, RotateCcw, Delete, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// ─── Puzzle data — edit only this ────────────────────────────────────────────
// scaffolding levels:
//   1 = picture + sentence + first letter revealed
//   2 = picture + sentence
//   3 = sentence only (no picture)
const PUZZLES = [
  {
    id: 1,
    sentence: 'The ______ is yellow and hot.',
    answer: 'SUN',
    emoji: '☀️',
    hint: 'S-U-N',
    distractors: ['M', 'T', 'P'],
    level: 1,
  },
  {
    id: 2,
    sentence: 'The ______ barks at night.',
    answer: 'DOG',
    emoji: '🐶',
    hint: 'D-O-G',
    distractors: ['B', 'T', 'Z'],
    level: 2,
  },
  {
    id: 3,
    sentence: 'She drinks ______ every morning.',
    answer: 'MILK',
    emoji: '🥛',
    hint: 'M-I-L-K',
    distractors: ['W', 'R', 'X'],
    level: 3,
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function buildPool(puzzle) {
  const letters = puzzle.answer.split('')
  const all = [...letters, ...puzzle.distractors]
  // Level 1: first letter is pre-revealed, remove one copy from the pool
  if (puzzle.level === 1) {
    const idx = all.indexOf(letters[0])
    all.splice(idx, 1)
  }
  return shuffle(all)
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SentenceStrip() {
  const [puzzleIdx, setPuzzleIdx] = useState(0)
  const [slots, setSlots] = useState(() => initSlots(PUZZLES[0]))
  const [pool, setPool] = useState(() => buildPool(PUZZLES[0]).map((l, i) => ({ id: i, letter: l, used: false })))
  const [checked, setChecked] = useState(false)   // whether CHECK was pressed
  const [won, setWon] = useState(false)

  const navigate = useNavigate()

  const puzzle = PUZZLES[puzzleIdx]

  // slots: array of { letter: string|null, locked: boolean }
  function initSlots(p) {
    return p.answer.split('').map((letter, i) => ({
      letter: p.level === 1 && i === 0 ? letter : null,
      locked: p.level === 1 && i === 0,          // pre-revealed, can't remove
    }))
  }

  // Next unfilled (unlocked) slot index
  const nextEmptyIdx = slots.findIndex(s => !s.letter)

  function placeLetter(poolItem) {
    if (poolItem.used || nextEmptyIdx === -1) return
    const newSlots = slots.map((s, i) =>
      i === nextEmptyIdx ? { ...s, letter: poolItem.letter } : s
    )
    const newPool = pool.map(p => p.id === poolItem.id ? { ...p, used: true } : p)
    setSlots(newSlots)
    setPool(newPool)
    setChecked(false)
  }

  function removeSlot(slotIdx) {
    const slot = slots[slotIdx]
    if (!slot.letter || slot.locked) return
    const letter = slot.letter
    // Un-use the most-recently-used pool tile with that letter
    let restored = false
    const newPool = [...pool].reverse().map(p => {
      if (!restored && p.used && p.letter === letter) {
        restored = true
        return { ...p, used: false }
      }
      return p
    }).reverse()
    setSlots(slots.map((s, i) => i === slotIdx ? { ...s, letter: null } : s))
    setPool(newPool)
    setChecked(false)
  }

  function handleCheck() {
    const filled = slots.every(s => s.letter)
    if (!filled) return
    const correct = slots.map(s => s.letter).join('') === puzzle.answer
    setChecked(true)
    if (correct) setWon(true)
  }

  function handleHint() {
    // Find the first empty unlocked slot and reveal its correct letter
    const idx = slots.findIndex(s => !s.letter && !s.locked)
    if (idx === -1) return
    const correctLetter = puzzle.answer[idx]
    // Mark one matching pool tile as used
    let used = false
    const newPool = pool.map(p => {
      if (!used && !p.used && p.letter === correctLetter) { used = true; return { ...p, used: true } }
      return p
    })
    setSlots(slots.map((s, i) => i === idx ? { ...s, letter: correctLetter } : s))
    setPool(newPool)
    setChecked(false)
  }

  // Delete last filled unlocked slot
  function deleteLast() {
    const lastIdx = [...slots].map((s, i) => ({ ...s, i }))
      .reverse()
      .find(s => s.letter && !s.locked)?.i
    if (lastIdx === undefined) return
    removeSlot(lastIdx)
  }

  function nextPuzzle() {
    const next = (puzzleIdx + 1) % PUZZLES.length
    setPuzzleIdx(next)
    setSlots(initSlots(PUZZLES[next]))
    setPool(buildPool(PUZZLES[next]).map((l, i) => ({ id: i, letter: l, used: false })))
    setChecked(false)
    setWon(false)
  }

  function reset() {
    setSlots(initSlots(puzzle))
    setPool(buildPool(puzzle).map((l, i) => ({ id: i, letter: l, used: false })))
    setChecked(false)
    setWon(false)
  }

  // Split sentence into parts: before blank, the blank itself, after blank
  const parts = puzzle.sentence.split('______')
  const before = parts[0]
  const after = parts[1] ?? ''

  // Slot result color when checked
  function slotStyle(slot, idx) {
    if (!checked || !slot.letter) return 'border-dashed border-2 border-slate-300 bg-blue-50/60'
    const correct = slot.letter === puzzle.answer[idx]
    return correct
      ? 'border-2 border-emerald-400 bg-emerald-50 text-emerald-700'
      : 'border-2 border-red-400 bg-red-50 text-red-600'
  }

  const allFilled = slots.every(s => s.letter)
  const hasAnyFilled = slots.some(s => s.letter && !s.locked)

  return (
    <div className="h-screen bg-[#f0f4fb] flex flex-col items-center select-none font-sans overflow-hidden">

      {/* Header */}
      <div className="w-full px-4 py-2 flex justify-between items-center gap-3">
        <div className='flex items-center gap-4'>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-blue-600 font-bold text-sm bg-blue-200 p-4 hover:text-blue-800 rounded-full"
          >
            <ArrowLeft size={30} />
          </button>
          <span className="flex-1 font-bold text-blue-700 text-4xl">
            Sentence Strip
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-500">
            <HelpCircle size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-3xl no-scrollbar px-6 pt-4 pb-8 flex-1 overflow-y-auto">

        {/* Picture — hidden on level 3 */}
        {puzzle.level !== 3 && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 px-10 py-6 flex flex-col items-center gap-2">
            <div className="text-7xl">{puzzle.emoji}</div>
            {puzzle.level === 1 && (
              <p className="text-blue-500 font-bold tracking-widest text-sm">{puzzle.hint}</p>
            )}
          </div>
        )}

        {/* Sentence strip */}
        <div className="w-full bg-white rounded-2xl border-2 border-slate-200 shadow-sm px-6 py-5 text-center">
          <p className="text-slate-700 text-xl font-semibold leading-relaxed">
            {before}
            <span className="text-blue-500 underline decoration-blue-300 underline-offset-4 tracking-widest mx-1">
              {'_'.repeat(puzzle.answer.length)}
            </span>
            {after}
          </p>
        </div>

        {/* Answer slots */}
        <div className="flex gap-3 justify-center">
          {slots.map((slot, idx) => (
            <button
              key={idx}
              onClick={() => removeSlot(idx)}
              style={{ width: 80, height: 84 }}
              className={`rounded-2xl flex items-center justify-center text-2xl font-black transition-all cursor-pointer ${slotStyle(slot, idx)}`}
            >
              {slot.letter ?? ''}
            </button>
          ))}
        </div>

        {/* Letter pool */}
        <div className="flex gap-3 flex-wrap justify-center">
          {pool.map(item => (
            <button
              key={item.id}
              onClick={() => placeLetter(item)}
              disabled={item.used}
              style={{ width: 80, height: 80 }}
              className={`rounded-2xl text-4xl font-black shadow-md transition-all
                ${item.used
                  ? 'bg-amber-200 text-amber-100 opacity-50 cursor-not-allowed'
                  : 'bg-amber-400 hover:bg-amber-500 text-white cursor-pointer active:scale-95'
                }`}
            >
              {item.letter}
            </button>
          ))}
        </div>

        {/* Hint + Delete + Check buttons */}
        <div className="flex gap-3 w-full">
          <button
            onClick={handleHint}
            className="flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-800 text-white font-bold px-5 py-3 rounded-full shadow-md transition-colors text-sm"
          >
            <Hand size={16} /> HINT
          </button>
          <button
            onClick={deleteLast}
            disabled={!hasAnyFilled}
            className={`flex flex-col items-center justify-center gap-1 w-20 h-14 rounded-2xl font-bold text-xs shadow-lg transition-all
              ${hasAnyFilled ? 'bg-red-500 hover:bg-red-600 text-white active:scale-95' : 'bg-slate-200 text-slate-300 cursor-not-allowed'}`}
          >
            <Delete size={20} /> DELETE
          </button>
          <button
            onClick={reset}
            disabled={!hasAnyFilled}
            className={`flex flex-col items-center justify-center gap-1 w-20 h-14 rounded-2xl font-bold text-xs shadow-lg transition-all
              ${hasAnyFilled ? 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95' : 'bg-slate-200 text-slate-300 cursor-not-allowed'}`}
          >
            <RotateCcw size={20} /> RESET
          </button>
          <button
            onClick={handleCheck}
            disabled={!allFilled}
            className={`flex-1 flex items-center justify-center gap-2 font-bold py-3 rounded-full shadow-md transition-colors text-sm
              ${allFilled ? 'bg-green-700 hover:bg-green-800 text-white cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            {won ? <><CheckCircle2 size={18} /> CORRECT!</> : 'CHECK'}
          </button>
        </div>

        {/* Feedback */}
        {checked && !won && (
          <p className="text-red-500 font-semibold text-sm">
            Not quite — tap a letter tile to remove it and try again!
          </p>
        )}

        {/* Win card — appears inline when correct */}
        {won && (
          <div className="w-full bg-white rounded-3xl border-2 border-emerald-200 shadow-lg px-8 py-3 flex flex-col items-center gap-3">
            <div className="text-5xl">🎉</div>
            <h2 className="text-xl font-black text-slate-800">Well Done!</h2>
            <p className="text-slate-500 text-sm text-center">
              The missing word was <span className="font-black text-blue-600">{puzzle.answer}</span>!
            </p>
            <div className="text-4xl">{puzzle.emoji}</div>
            <div className="flex gap-3 w-full">
              <button onClick={reset} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-full transition-colors">
                Try Again
              </button>
              <button onClick={nextPuzzle} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-full transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
