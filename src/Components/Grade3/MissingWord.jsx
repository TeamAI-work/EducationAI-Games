import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, HelpCircle, Volume2, CheckCircle2, ChevronRight } from 'lucide-react'

// ─── Puzzle bank ──────────────────────────────────────────────────────────────
// Each puzzle:
//   passage  – sentence with ______ for the blank
//   options  – multiple-choice words (level 1 & 2)
//   correct  – the right MC answer
//   accepted – extra words accepted in free-type mode (level 3)
//   wrong    – map of wrong-word → short explanation why it doesn't fit
//   emoji    – picture clue emoji
//   theme    – level sub-topic label
const LEVELS = [
  // ── LEVEL 1 — Basic context clues ────────────────────────────────────────
  {
    label: 'LEVEL 1',
    desc: 'Pick the right word from the choices.',
    mode: 'choice',
    puzzles: [
      {
        theme: 'Birds & Homes',
        passage: 'The bird built a ______ in the tall tree.',
        emoji: '🐦',
        options: ['nest', 'rock', 'river', 'cloud'],
        correct: 'nest',
        wrong: {
          rock:  'A rock is hard and heavy — birds can\'t build with it.',
          river: 'A river is water that flows — birds don\'t live in rivers.',
          cloud: 'A cloud is made of water vapor — it\'s not solid enough for a home.',
        },
      },
      {
        theme: 'Eating',
        passage: 'She was very hungry, so she ate a big ______.',
        emoji: '🍎',
        options: ['apple', 'pillow', 'shoe', 'pencil'],
        correct: 'apple',
        wrong: {
          pillow: 'You sleep on a pillow — it\'s not food.',
          shoe:   'Shoes go on your feet — you wouldn\'t eat one!',
          pencil: 'A pencil is for writing, not eating.',
        },
      },
      {
        theme: 'Weather',
        passage: 'It was raining, so he opened his ______.',
        emoji: '☔',
        options: ['umbrella', 'book', 'banana', 'chair'],
        correct: 'umbrella',
        wrong: {
          book:   'A book can\'t keep you dry in the rain.',
          banana: 'A banana is a fruit — it won\'t protect you from rain.',
          chair:  'You sit on a chair — it\'s not used for rain.',
        },
      },
      {
        theme: 'Sleep',
        passage: 'At night, he was tired and went to ______.',
        emoji: '🛏️',
        options: ['sleep', 'swim', 'dance', 'paint'],
        correct: 'sleep',
        wrong: {
          swim:  'Swimming happens in water — not usually at bedtime!',
          dance: 'Dancing takes energy — not what you do when tired.',
          paint: 'Painting is an activity for when you\'re awake and active.',
        },
      },
      {
        theme: 'Animals',
        passage: 'The dog wagged its ______ when it was happy.',
        emoji: '🐕',
        options: ['tail', 'wing', 'fin', 'trunk'],
        correct: 'tail',
        wrong: {
          wing:  'Wings are for birds — dogs don\'t have them.',
          fin:   'Fins help fish swim — dogs don\'t have fins.',
          trunk: 'A trunk is part of an elephant, not a dog.',
        },
      },
    ],
  },

  // ── LEVEL 2 — Longer passage + harder distractors ─────────────────────────
  {
    label: 'LEVEL 2',
    desc: 'Read the full passage for clues, then pick the best word.',
    mode: 'choice',
    puzzles: [
      {
        theme: 'Library',
        passage: 'Maya loved reading. Every Saturday she visited the ______ and borrowed three books.',
        emoji: '📚',
        options: ['library', 'gym', 'airport', 'museum'],
        correct: 'library',
        wrong: {
          gym:     'A gym is for exercise, not borrowing books.',
          airport: 'Airports are for travelling by plane, not reading.',
          museum:  'Museums display art or history — they don\'t lend books to borrow.',
        },
      },
      {
        theme: 'Cooking',
        passage: 'Dad put the cake in the ______ so it could bake for thirty minutes.',
        emoji: '🎂',
        options: ['oven', 'freezer', 'sink', 'drawer'],
        correct: 'oven',
        wrong: {
          freezer: 'A freezer makes things cold — baking needs heat.',
          sink:    'A sink is full of water — you can\'t bake in it.',
          drawer:  'Drawers store items — they can\'t produce heat to bake.',
        },
      },
      {
        theme: 'Garden',
        passage: 'To help the flowers grow, Lily watered them with a ______.',
        emoji: '🌸',
        options: ['hose', 'hammer', 'mirror', 'blanket'],
        correct: 'hose',
        wrong: {
          hammer:  'A hammer is a tool for hitting nails — not for watering.',
          mirror:  'Mirrors reflect light — they don\'t carry water.',
          blanket: 'Blankets keep you warm — they can\'t water plants.',
        },
      },
      {
        theme: 'Ocean',
        passage: 'The sailor used a ______ to steer the boat across the ocean.',
        emoji: '⛵',
        options: ['rudder', 'ladder', 'pillow', 'clock'],
        correct: 'rudder',
        wrong: {
          ladder: 'A ladder helps you climb up and down — it doesn\'t steer boats.',
          pillow: 'A pillow is for sleeping — it has nothing to do with steering.',
          clock:  'A clock tells time — it can\'t control a boat\'s direction.',
        },
      },
      {
        theme: 'Music',
        passage: 'She pressed the keys on the ______ and a beautiful melody filled the room.',
        emoji: '🎹',
        options: ['piano', 'telescope', 'bucket', 'fence'],
        correct: 'piano',
        wrong: {
          telescope: 'A telescope lets you see far away — it has no keys to press.',
          bucket:    'A bucket holds water or things — it doesn\'t make music.',
          fence:     'A fence encloses an area — it has no keys for making melodies.',
        },
      },
    ],
  },

  // ── LEVEL 3 — Free-type with semantic acceptance ──────────────────────────
  {
    label: 'LEVEL 3',
    desc: 'Type any word that makes sense. Multiple answers may be accepted!',
    mode: 'freeType',
    puzzles: [
      {
        theme: 'Shelter',
        passage: 'After a long hike, they were glad to find a warm ______ to rest in.',
        emoji: '🏕️',
        correct: 'shelter',
        accepted: ['shelter', 'cabin', 'tent', 'hut', 'house', 'home', 'lodge', 'cottage', 'barn', 'cave'],
        whyCorrect: 'Great! Something warm to rest in after hiking is a shelter or similar structure.',
        whyWrong: 'Think about what you\'d rest inside after a long outdoor hike — somewhere warm and enclosed.',
      },
      {
        theme: 'Feelings',
        passage: 'When she won the race, she felt very ______ and smiled at everyone.',
        emoji: '🏅',
        correct: 'happy',
        accepted: ['happy', 'proud', 'excited', 'joyful', 'thrilled', 'glad', 'pleased', 'ecstatic', 'delighted', 'elated'],
        whyCorrect: 'Exactly! Winning makes people feel happy, proud, excited — all great answers.',
        whyWrong: 'Think about how you feel when you win something — is it a positive or negative feeling?',
      },
      {
        theme: 'Science',
        passage: 'Plants need sunlight, water, and ______ from the soil to grow.',
        emoji: '🌱',
        correct: 'nutrients',
        accepted: ['nutrients', 'minerals', 'food', 'vitamins', 'nitrogen', 'potassium', 'nourishment'],
        whyCorrect: 'Well done! Plants absorb nutrients, minerals, or food from the soil — all correct.',
        whyWrong: 'Think about what plants absorb through their roots from the soil to stay healthy.',
      },
      {
        theme: 'Travel',
        passage: 'To cross the wide river, they needed a ______.',
        emoji: '🌊',
        correct: 'bridge',
        accepted: ['bridge', 'boat', 'raft', 'ferry', 'canoe', 'kayak', 'ship', 'vessel'],
        whyCorrect: 'Correct! A bridge, boat, raft or ferry can all help you cross a wide river.',
        whyWrong: 'What could you use to get across a wide river? Think of something that travels over or through water.',
      },
      {
        theme: 'Sound',
        passage: 'The thunder was so loud it made everyone ______.',
        emoji: '⛈️',
        correct: 'jump',
        accepted: ['jump', 'scream', 'shudder', 'shiver', 'tremble', 'gasp', 'flinch', 'startle', 'scared', 'frightened'],
        whyCorrect: 'Yes! A loud sound like thunder makes people jump, scream, or shudder — all valid.',
        whyWrong: 'Think about your reaction when you hear something very loud and unexpected.',
      },
    ],
  },
]

// ─── Text-to-speech helper ────────────────────────────────────────────────────
function speak(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.rate  = 0.9
  window.speechSynthesis.speak(utt)
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ current, total }) {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${((current) / total) * 100}%` }}
        />
      </div>
      <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">{current}/{total}</span>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MissingWord() {
  const navigate   = useNavigate()
  const [levelIdx,  setLevelIdx]  = useState(0)
  const [puzzleIdx, setPuzzleIdx] = useState(0)
  const [selected,  setSelected]  = useState(null)   // MC selection
  const [typed,     setTyped]     = useState('')      // free-type input
  const [result,    setResult]    = useState(null)    // null | 'correct' | 'wrong'
  const [feedback,  setFeedback]  = useState('')
  const [showHelp,  setShowHelp]  = useState(false)
  const [score,     setScore]     = useState(0)
  const inputRef = useRef(null)

  const level  = LEVELS[levelIdx]
  const puzzle = level.puzzles[puzzleIdx]
  const isLast = puzzleIdx === level.puzzles.length - 1

  // split passage into before/after blank
  const parts  = puzzle.passage.split('______')
  const before = parts[0]
  const after  = parts[1] ?? ''

  // the word shown in the blank (while selected / typed / correct)
  const blankWord = result === 'correct'
    ? (level.mode === 'freeType' ? typed.toLowerCase().trim() : selected)
    : (level.mode === 'choice' ? selected : (typed || null))

  useEffect(() => {
    setSelected(null)
    setTyped('')
    setResult(null)
    setFeedback('')
  }, [levelIdx, puzzleIdx])

  // focus input on level 3
  useEffect(() => {
    if (level.mode === 'freeType' && inputRef.current) inputRef.current.focus()
  }, [levelIdx, puzzleIdx, level.mode])

  function handleCheck() {
    if (level.mode === 'choice') {
      if (!selected) return
      if (selected === puzzle.correct) {
        setResult('correct')
        setFeedback(`✅ "${selected}" is correct! ${buildCorrectExplanation(puzzle)}`)
        setScore(s => s + 100)
      } else {
        setResult('wrong')
        setFeedback(`❌ "${selected}" doesn't fit. ${puzzle.wrong[selected] ?? 'Think about the context clues in the sentence.'}`)
      }
    } else {
      const answer = typed.toLowerCase().trim()
      if (!answer) return
      if (puzzle.accepted.includes(answer)) {
        setResult('correct')
        setFeedback(`✅ "${answer}" works! ${puzzle.whyCorrect}`)
        setScore(s => s + 150)
      } else {
        setResult('wrong')
        setFeedback(`❌ "${answer}" doesn't quite fit here. ${puzzle.whyWrong}`)
      }
    }
  }

  function buildCorrectExplanation(p) {
    return `The context clue "${p.theme}" tells us "${p.correct}" makes the most sense.`
  }

  function nextPuzzle() {
    if (isLast) {
      // wrap around
      setPuzzleIdx(0)
    } else {
      setPuzzleIdx(i => i + 1)
    }
  }

  function retry() {
    setSelected(null)
    setTyped('')
    setResult(null)
    setFeedback('')
  }

  function switchLevel(i) {
    setLevelIdx(i)
    setPuzzleIdx(0)
  }

  const fullSentence = puzzle.passage.replace('______', puzzle.correct)

  return (
    <div className="h-screen bg-[#f0f6ff] flex flex-col select-none font-sans overflow-hidden">

      {/* ── header ── */}
      <header className="w-full px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200"
          >
            <ArrowLeft size={30} />
          </button>
          <span className="font-bold text-blue-700 text-4xl">Sentence Builder</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelp(h => !h)}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-500"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </header>

      {/* ── scrollable body ── */}
      <div className="flex flex-col items-center flex-1 overflow-y-auto no-scrollbar px-4 py-4 gap-4">

        {/* help */}
        {showHelp && (
          <div className="w-full max-w-2xl bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 text-sm text-blue-700">
            Read the sentence carefully. Use the context clues — the other words around the blank — to figure out which word makes sense. Click "Listen" to hear the sentence read aloud.
          </div>
        )}

        {/* level tabs */}
        <div className="flex gap-2 w-full max-w-2xl">
          {LEVELS.map((l, i) => (
            <button
              key={i}
              onClick={() => switchLevel(i)}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-colors border
                ${i === levelIdx
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* progress */}
        <div className="w-full max-w-2xl flex items-center gap-3">
          <ProgressBar current={puzzleIdx + (result === 'correct' ? 1 : 0)} total={level.puzzles.length} />
        </div>

        {/* ── passage card ── */}
        <div className="w-full max-w-2xl bg-white rounded-3xl border-2 border-blue-100 shadow-sm px-8 py-7">
          <p className="text-2xl font-black text-slate-800 leading-relaxed text-center">
            {before}
            <span className={`inline-block mx-2 px-4 py-1 rounded-xl border-2 min-w-[80px] text-center transition-all
              ${result === 'correct'
                ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                : result === 'wrong'
                  ? 'border-red-400 bg-red-50 text-red-600'
                  : 'border-blue-300 bg-blue-50 text-blue-400'
              }`}
            >
              {blankWord ?? '?'}
            </span>
            {after}
          </p>

          {/* listen button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => speak(fullSentence)}
              className="flex items-center gap-2 text-blue-500 hover:text-blue-700 text-sm font-semibold"
            >
              <Volume2 size={16} /> Listen to Sentence
            </button>
          </div>
        </div>

        {/* ── picture clue ── */}
        <div className="w-full max-w-2xl flex justify-center">
          <div className="relative bg-white rounded-3xl border border-slate-100 shadow-sm w-44 h-44 flex items-center justify-center text-8xl">
            {puzzle.emoji}
            <span className="absolute -top-3 -right-3 bg-amber-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
              Picture Clue!
            </span>
          </div>
        </div>

        {/* ── MC options (level 1 & 2) ── */}
        {level.mode === 'choice' && result === null && (
          <div className="w-full max-w-2xl flex flex-col gap-3">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 text-center uppercase">Pick the right word</p>
            <div className="grid grid-cols-2 gap-3">
              {puzzle.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => { setSelected(opt); setResult(null) }}
                  className={`py-4 rounded-2xl text-xl font-black border-2 transition-all active:scale-95 shadow-sm
                    ${selected === opt
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Free-type input (level 3) ── */}
        {level.mode === 'freeType' && result === null && (
          <div className="w-full max-w-2xl flex flex-col gap-3">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 text-center uppercase">Type your answer</p>
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={typed}
                onChange={e => setTyped(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCheck()}
                placeholder="Type a word that fits…"
                className="flex-1 border-2 border-blue-200 rounded-2xl px-5 py-3 text-lg font-bold text-slate-700 outline-none focus:border-blue-500 bg-white"
              />
            </div>
            <p className="text-xs text-slate-400 text-center">Multiple correct answers are accepted!</p>
          </div>
        )}

        {/* ── feedback banner ── */}
        {feedback && (
          <div className={`w-full max-w-2xl rounded-2xl px-6 py-4 text-sm font-semibold
            ${result === 'correct'
              ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-700'
              : 'bg-red-50 border-2 border-red-300 text-red-600'}`}
          >
            {feedback}
          </div>
        )}

        {/* ── action buttons ── */}
        <div className="w-full max-w-2xl flex gap-3 flex-wrap justify-center">
          {result === null && (
            <button
              onClick={handleCheck}
              disabled={level.mode === 'choice' ? !selected : !typed.trim()}
              className={`flex items-center gap-2 font-bold px-8 py-3 rounded-full shadow-md transition-colors text-base
                ${(level.mode === 'choice' ? selected : typed.trim())
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              <CheckCircle2 size={18} /> Check Answer
            </button>
          )}

          {result === 'wrong' && (
            <button
              onClick={retry}
              className="flex items-center gap-2 font-bold px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm transition-colors text-base"
            >
              Try Again
            </button>
          )}

          {result === 'correct' && (
            <button
              onClick={nextPuzzle}
              className="flex items-center gap-2 font-bold px-8 py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-colors text-base"
            >
              {isLast ? 'Play Again' : 'Next'} <ChevronRight size={18} />
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
