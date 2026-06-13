import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, HelpCircle, Volume2, ChevronRight, RotateCcw, CheckCircle, XCircle } from 'lucide-react'

// ─── Image imports ────────────────────────────────────────────────────────────
import AppleTable   from '../../assets/PictureMatchImages/1_AppleTable.png'
import CatMat       from '../../assets/PictureMatchImages/2_CatMat.png'
import CycleWall    from '../../assets/PictureMatchImages/3_CycleWall.png'
import DogBall      from '../../assets/PictureMatchImages/4_DogBall.png'
import DogLeash     from '../../assets/PictureMatchImages/5_DogLeash.png'
import HenEggs      from '../../assets/PictureMatchImages/6_HenEggs.png'
import BreakFast    from '../../assets/PictureMatchImages/7_BreakFast.png'
import Bun          from '../../assets/PictureMatchImages/8_Bun.png'
import FlowerPot    from '../../assets/PictureMatchImages/9_FlowerPot.png'
import RainSun      from '../../assets/PictureMatchImages/10_RainSun.png'
import Rocket       from '../../assets/PictureMatchImages/11_Rocket.png'
import Shapes       from '../../assets/PictureMatchImages/12_Shapes.png'
import SixFlowers   from '../../assets/PictureMatchImages/13_SixFlowers.png'

// ─── Level configs ────────────────────────────────────────────────────────────
// Each question: { text, correctIdx (0-based), options: [{img, label, distractor?}] }
// distractor: short note explaining the misreading (shown on wrong pick)

const LEVELS = [
  {
    label: 'Level 1',
    desc: 'Single sentence — clear distinctions',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    questions: [
      {
        text: 'The red apple sits on top of the table.',
        correctIdx: 0,
        options: [
          { img: AppleTable,  label: 'Apple on the table' },
          { img: CatMat,      label: 'Cat on a mat',       distractor: 'You may have missed "apple" and confused it with another animal scene.' },
          { img: FlowerPot,   label: 'Flower in a pot',    distractor: 'This shows a flower, not an apple — check the subject of the sentence.' },
        ],
      },
      {
        text: 'The cat rests on a soft mat.',
        correctIdx: 1,
        options: [
          { img: DogBall,     label: 'Dog with a ball',    distractor: '"Dog" and "cat" are both animals — re-read who is resting.' },
          { img: CatMat,      label: 'Cat on a mat' },
          { img: HenEggs,     label: 'Hen near eggs',      distractor: 'A hen is a bird, not a cat — check the subject again.' },
        ],
      },
      {
        text: 'The bicycle leans against a tall wall.',
        correctIdx: 0,
        options: [
          { img: CycleWall,   label: 'Bicycle against wall' },
          { img: DogLeash,    label: 'Dog on a leash',      distractor: '"Leash" and "leans" sound similar — re-read the object in the sentence.' },
          { img: Rocket,      label: 'Rocket in the sky',   distractor: 'The sentence describes something on the ground, not in the sky.' },
        ],
      },
      {
        text: 'The dog plays with a round ball.',
        correctIdx: 2,
        options: [
          { img: DogLeash,    label: 'Dog on a leash',      distractor: 'The sentence says "ball", not "leash" — check what the dog is doing.' },
          { img: CatMat,      label: 'Cat on a mat',        distractor: 'The subject is a dog, not a cat.' },
          { img: DogBall,     label: 'Dog with a ball' },
        ],
      },
    ],
  },
  {
    label: 'Level 2',
    desc: 'Single sentence — subtle distractors',
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    questions: [
      {
        text: 'The hen sits quietly beside her many eggs.',
        correctIdx: 2,
        options: [
          { img: BreakFast,   label: 'Breakfast on a table', distractor: 'Eggs are mentioned, but the sentence is about a hen — not a meal.' },
          { img: Bun,         label: 'A fluffy bun',          distractor: '"Bun" sounds like it could relate to food, but the sentence is about a hen and her eggs.' },
          { img: HenEggs,     label: 'Hen beside eggs' },
        ],
      },
      {
        text: 'Six colorful flowers grow in a row.',
        correctIdx: 1,
        options: [
          { img: FlowerPot,   label: 'One flower in a pot',  distractor: '"Flower" appears in both, but the sentence says six flowers in a row — not one in a pot.' },
          { img: SixFlowers,  label: 'Six flowers in a row' },
          { img: Shapes,      label: 'Colorful shapes',       distractor: '"Colorful" fits both, but shapes are not flowers — re-read the noun.' },
        ],
      },
      {
        text: 'The dog walks calmly on a leash.',
        correctIdx: 0,
        options: [
          { img: DogLeash,    label: 'Dog on a leash' },
          { img: DogBall,     label: 'Dog chasing a ball',   distractor: 'Both show a dog, but "calmly on a leash" doesn\'t match chasing a ball.' },
          { img: CycleWall,   label: 'Bicycle against wall', distractor: 'No dog is shown here — re-read the subject of the sentence.' },
        ],
      },
      {
        text: 'There are three different shapes on the page.',
        correctIdx: 2,
        options: [
          { img: SixFlowers,  label: 'Six flowers',          distractor: 'Flowers are not shapes — re-read the noun.' },
          { img: Rocket,      label: 'A rocket blasting off', distractor: 'A rocket is one shape, but the sentence says three different shapes.' },
          { img: Shapes,      label: 'Three shapes' },
        ],
      },
    ],
  },
  {
    label: 'Level 3',
    desc: 'Short passage — inference required',
    color: '#059669',
    bgColor: '#ecfdf5',
    questions: [
      {
        text: 'Maya woke up early. She looked outside and saw gray clouds. She grabbed her umbrella before going out.',
        correctIdx: 1,
        options: [
          { img: RainSun,     label: 'Bright sunny day',     distractor: 'Maya grabbed an umbrella — she expected rain, not sunshine.' },
          { img: RainSun,     label: 'Cloudy, rainy sky' },
          { img: BreakFast,   label: 'Maya eating breakfast', distractor: 'The passage focuses on the weather outside, not eating breakfast.' },
        ],
      },
      {
        text: 'Tom prepared a tray with orange juice, toast, and a boiled egg. He was making breakfast for his mom.',
        correctIdx: 0,
        options: [
          { img: BreakFast,   label: 'A breakfast tray' },
          { img: HenEggs,     label: 'A hen with eggs',       distractor: '"Egg" is mentioned, but the passage is about a prepared breakfast tray, not a hen.' },
          { img: AppleTable,  label: 'An apple on a table',   distractor: 'No apple is mentioned — re-read what Tom put on the tray.' },
        ],
      },
      {
        text: 'The rocket was painted red and white. It stood tall on the launch pad, pointing straight at the stars.',
        correctIdx: 2,
        options: [
          { img: Shapes,      label: 'Colorful shapes',       distractor: 'The sentence mentions colors but describes a rocket, not shapes.' },
          { img: CycleWall,   label: 'A bicycle leaning',     distractor: 'Both can be "tall", but a bicycle is not a rocket — re-read.' },
          { img: Rocket,      label: 'A rocket on a launch pad' },
        ],
      },
      {
        text: 'Lily planted a small seed in a pot of soil. She watered it every day. Soon a bright flower began to grow.',
        correctIdx: 1,
        options: [
          { img: SixFlowers,  label: 'Many flowers in a row', distractor: 'Lily planted one seed in a pot — the sentence doesn\'t describe a whole row of flowers.' },
          { img: FlowerPot,   label: 'Flower growing in a pot' },
          { img: Bun,         label: 'A fluffy bun',           distractor: '"Bun" sounds like it could relate to something round and small, but the passage is about a flower pot.' },
        ],
      },
    ],
  },
]

// ─── TTS helper ───────────────────────────────────────────────────────────────
function speak(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.rate = 0.9
  window.speechSynthesis.speak(utt)
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PictureMatch() {
  const navigate = useNavigate()

  const [levelIdx,   setLevelIdx]   = useState(0)
  const [qIdx,       setQIdx]       = useState(0)
  const [selected,   setSelected]   = useState(null)   // index of chosen option
  const [result,     setResult]     = useState(null)   // null | 'correct' | 'wrong'
  const [score,      setScore]      = useState(0)
  const [showHelp,   setShowHelp]   = useState(false)
  const [highlight,  setHighlight]  = useState(false)
  const [isReading,  setIsReading]  = useState(false)
  const readTimerRef = useRef(null)

  const level    = LEVELS[levelIdx]
  const question = level.questions[qIdx]
  const total    = level.questions.length

  // stop speech on unmount / question change
  useEffect(() => {
    window.speechSynthesis?.cancel()
    setIsReading(false)
  }, [levelIdx, qIdx])

  function handleRead() {
    if (isReading) {
      window.speechSynthesis?.cancel()
      setIsReading(false)
      return
    }
    setIsReading(true)
    speak(question.text)
    // estimate reading duration
    const ms = question.text.split(' ').length * 400 + 800
    clearTimeout(readTimerRef.current)
    readTimerRef.current = setTimeout(() => setIsReading(false), ms)
  }

  function handleSelect(idx) {
    if (result !== null) return
    setSelected(idx)
    const correct = idx === question.correctIdx
    setResult(correct ? 'correct' : 'wrong')
    if (correct) setScore(s => s + 100)
  }

  function nextQuestion() {
    if (qIdx + 1 < total) {
      setQIdx(q => q + 1)
    } else if (levelIdx + 1 < LEVELS.length) {
      setLevelIdx(l => l + 1)
      setQIdx(0)
    }
    setSelected(null)
    setResult(null)
    setHighlight(false)
  }

  function switchLevel(idx) {
    setLevelIdx(idx)
    setQIdx(0)
    setSelected(null)
    setResult(null)
    setHighlight(false)
  }

  function tryAgain() {
    setSelected(null)
    setResult(null)
  }

  const isLastQuestion = levelIdx === LEVELS.length - 1 && qIdx === total - 1
  const wrongDistractor = result === 'wrong' && selected !== null
    ? question.options[selected]?.distractor
    : null

  // highlight key words — bold words that are action/position/number/adjective
  function renderText(text) {
    if (!highlight) return <span>{text}</span>
    // simple heuristic: highlight prepositions, numbers, adjectives commonly tested
    const keywords = /\b(on|under|beside|against|in|into|out|above|below|around|through|beside|near|top|bottom|left|right|up|down|over|behind|front|between|six|three|two|one|four|five|seven|eight|nine|ten|red|blue|green|brown|big|small|tall|short|long|soft|round|fluffy|bright|gray|colorful|many|quietly|calmly|slowly|quickly|early)\b/gi
    const parts = text.split(keywords)
    const matches = [...text.matchAll(keywords)]
    const result = []
    parts.forEach((part, i) => {
      result.push(<span key={`p${i}`}>{part}</span>)
      if (matches[i]) {
        result.push(
          <mark key={`m${i}`} className="bg-yellow-200 text-yellow-900 px-0.5 rounded font-bold not-italic">
            {matches[i][0]}
          </mark>
        )
      }
    })
    return <>{result}</>
  }

  return (
    <div className="min-h-screen bg-[#f0f4fa] flex flex-col font-sans select-none">

      {/* ── header ── */}
      <header className="w-full px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200"
          >
            <ArrowLeft size={30} />
          </button>
          <span className="text-3xl font-black text-blue-700">Reading Explorer</span>
        </div>

        <div className="flex items-center gap-2">
          {LEVELS.map((l, i) => (
            <button
              key={i}
              onClick={() => switchLevel(i)}
              className={`py-1 px-3 rounded-full text-xs font-bold transition-colors border
                ${i === levelIdx
                  ? 'text-white border-transparent'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}`}
              style={i === levelIdx ? { background: level.color, borderColor: level.color } : {}}
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={() => setShowHelp(h => !h)}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-500 ml-1"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </header>

      {/* ── body ── */}
      <div className="flex flex-col items-center flex-1 px-4 py-6 gap-5 overflow-y-auto">

        {showHelp && (
          <div className="w-full max-w-3xl bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 text-sm text-blue-700">
            Read the text carefully, then tap the picture that best matches what it describes.
            Use <strong>🔊</strong> to hear the text read aloud, and <strong>Highlight</strong> to mark key words.
          </div>
        )}

        {/* level badge */}
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-bold tracking-widest uppercase px-3 py-1 rounded-full text-white"
            style={{ background: level.color }}
          >
            Select the Image that matches the text
          </span>
        </div>

        {/* ── text card ── */}
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-sm border border-slate-100 px-8 py-6">
          <p className="text-xl font-semibold text-slate-800 leading-relaxed text-center">
            {renderText(question.text)}
          </p>

          {/* controls row */}
          <div className="flex items-center justify-center gap-3 mt-4">
            {/* read aloud */}
            <button
              onClick={handleRead}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors
                ${isReading
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            >
              <Volume2 size={16} />
              {isReading ? 'Reading…' : 'Read Aloud'}
            </button>

            <div className="w-px h-6 bg-slate-200" />

          </div>
        </div>

        {/* ── picture choices ── */}
        <div className="w-full max-w-3xl grid grid-cols-3 gap-4">
          {question.options.map((opt, i) => {
            const isCorrect  = i === question.correctIdx
            const isSelected = i === selected
            let borderStyle  = 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md cursor-pointer'

            if (result !== null && isSelected && isCorrect)
              borderStyle = 'border-emerald-400 bg-emerald-50 shadow-lg'
            else if (result !== null && isSelected && !isCorrect)
              borderStyle = 'border-red-400 bg-red-50 shadow-lg'
            else if (result === 'wrong' && isCorrect)
              borderStyle = 'border-emerald-300 bg-emerald-50'   // reveal correct after wrong

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={result !== null}
                className={`relative rounded-2xl border-2 p-3 transition-all flex flex-col items-center gap-2 ${borderStyle}`}
              >
                <img
                  src={opt.img}
                  alt={opt.label}
                  className="w-full h-44 object-contain rounded-xl"
                />
                <span className="text-xs font-semibold text-slate-500 text-center">{opt.label}</span>

                {/* overlay icon */}
                {result !== null && isSelected && (
                  <div className={`absolute top-2 right-2 rounded-full p-0.5 ${isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isCorrect
                      ? <CheckCircle size={22} strokeWidth={2.5} />
                      : <XCircle    size={22} strokeWidth={2.5} />}
                  </div>
                )}
                {result === 'wrong' && !isSelected && isCorrect && (
                  <div className="absolute top-2 right-2 text-emerald-500">
                    <CheckCircle size={22} strokeWidth={2.5} />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* ── feedback banner ── */}
        {result === 'correct' && (
          <div className="w-full max-w-3xl bg-emerald-50 border-2 border-emerald-300 rounded-2xl px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-emerald-700 font-black text-lg">Correct!</p>
              <p className="text-emerald-600 text-sm">Great reading — you matched the right picture.</p>
            </div>
            {!isLastQuestion ? (
              <button
                onClick={nextQuestion}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-full shadow-md transition-colors"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-emerald-700 font-bold text-sm">All done!</span>
                <button
                  onClick={() => { setLevelIdx(0); setQIdx(0); setSelected(null); setResult(null); setScore(0) }}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-full shadow-md transition-colors text-sm"
                >
                  <RotateCcw size={14} /> Play Again
                </button>
              </div>
            )}
          </div>
        )}

        {result === 'wrong' && (
          <div className="w-full max-w-3xl bg-red-50 border-2 border-red-200 rounded-2xl px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-red-600 font-black text-lg">Not quite!</p>
              {wrongDistractor && (
                <p className="text-red-500 text-sm mt-0.5 max-w-md">💡 {wrongDistractor}</p>
              )}
              <p className="text-red-400 text-xs mt-1">The correct picture is highlighted in green.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={tryAgain}
                className="bg-white border border-slate-200 text-slate-600 font-bold py-2 px-4 rounded-full text-sm hover:bg-slate-50"
              >
                <RotateCcw size={13} className="inline mr-1" />Try Again
              </button>
              <button
                onClick={nextQuestion}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-2 rounded-full shadow-md transition-colors text-sm"
              >
                Skip <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* progress dots */}
        <div className="flex items-center gap-2 mt-1">
          {level.questions.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i < qIdx ? 'bg-emerald-400' :
                i === qIdx ? 'w-4' : 'bg-slate-200'
              }`}
              style={i === qIdx ? { background: level.color } : {}}
            />
          ))}
        </div>

      </div>
    </div>
  )
}
