import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, HelpCircle, CheckCircle2, Trash2, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react'

// ─── Part-of-speech colours ───────────────────────────────────────────────────
const POS_STYLE = {
  noun: { bg: 'bg-purple-400', border: 'border-purple-400', text: 'text-purple-700', light: 'bg-purple-50', label: 'Noun' },
  pronoun: { bg: 'bg-amber-400', border: 'border-amber-400', text: 'text-amber-700', light: 'bg-amber-50', label: 'Pronoun' },
  verb: { bg: 'bg-red-400', border: 'border-red-400', text: 'text-red-700', light: 'bg-red-50', label: 'Verb' },
  adjective: { bg: 'bg-green-400', border: 'border-green-400', text: 'text-green-700', light: 'bg-green-50', label: 'Adjective' },
  adverb: { bg: 'bg-yellow-400', border: 'border-yellow-400', text: 'text-yellow-700', light: 'bg-yellow-50', label: 'Adverb' },
  conjunction: { bg: 'bg-slate-400', border: 'border-slate-400', text: 'text-slate-700', light: 'bg-slate-50', label: 'Conjunction' },
}

// ─── Level definitions ────────────────────────────────────────────────────────
// Each level has multiple `sentences` so kids can practice variety.
// Each sentence has: slots, wordBank, exampleSentence.
const LEVELS = [
  // ══ LEVEL 1: Subject + Verb ══════════════════════════════════════════════════
  {
    levelLabel: 'LEVEL 1',
    title: 'Subject + Verb',
    desc: 'Simple: Noun/Pronoun + Verb',
    sentences: [
      {
        slots: [
          { id: 'subject', accepts: ['noun', 'pronoun'], label: 'SUBJECT (noun)' },
          { id: 'verb', accepts: ['verb'], label: 'VERB' },
        ],
        wordBank: [
          { word: 'Dogs', pos: 'noun' },
          { word: 'Cats', pos: 'noun' },
          { word: 'Birds', pos: 'noun' },
          { word: 'She', pos: 'pronoun' },
          { word: 'He', pos: 'pronoun' },
          { word: 'bark', pos: 'verb' },
          { word: 'purr', pos: 'verb' },
          { word: 'sing', pos: 'verb' },
          { word: 'fly', pos: 'verb' },
          { word: 'run', pos: 'verb' },
        ],
        exampleSentence: 'Dogs bark.',
      },
      {
        slots: [
          { id: 'subject', accepts: ['noun', 'pronoun'], label: 'SUBJECT (noun)' },
          { id: 'verb', accepts: ['verb'], label: 'VERB' },
        ],
        wordBank: [
          { word: 'Fish', pos: 'noun' },
          { word: 'Frogs', pos: 'noun' },
          { word: 'Rabbits', pos: 'noun' },
          { word: 'They', pos: 'pronoun' },
          { word: 'We', pos: 'pronoun' },
          { word: 'swim', pos: 'verb' },
          { word: 'jump', pos: 'verb' },
          { word: 'hop', pos: 'verb' },
          { word: 'sleep', pos: 'verb' },
          { word: 'eat', pos: 'verb' },
        ],
        exampleSentence: 'Frogs jump.',
      },
      {
        slots: [
          { id: 'subject', accepts: ['noun', 'pronoun'], label: 'SUBJECT (noun)' },
          { id: 'verb', accepts: ['verb'], label: 'VERB' },
        ],
        wordBank: [
          { word: 'Lions', pos: 'noun' },
          { word: 'Wolves', pos: 'noun' },
          { word: 'Monkeys', pos: 'noun' },
          { word: 'I', pos: 'pronoun' },
          { word: 'You', pos: 'pronoun' },
          { word: 'roar', pos: 'verb' },
          { word: 'howl', pos: 'verb' },
          { word: 'climb', pos: 'verb' },
          { word: 'dance', pos: 'verb' },
          { word: 'play', pos: 'verb' },
        ],
        exampleSentence: 'Lions roar.',
      },
      {
        slots: [
          { id: 'subject', accepts: ['noun', 'pronoun'], label: 'SUBJECT (noun)' },
          { id: 'verb', accepts: ['verb'], label: 'VERB' },
        ],
        wordBank: [
          { word: 'Stars', pos: 'noun' },
          { word: 'Clouds', pos: 'noun' },
          { word: 'Rivers', pos: 'noun' },
          { word: 'It', pos: 'pronoun' },
          { word: 'They', pos: 'pronoun' },
          { word: 'shine', pos: 'verb' },
          { word: 'float', pos: 'verb' },
          { word: 'flow', pos: 'verb' },
          { word: 'glow', pos: 'verb' },
          { word: 'drift', pos: 'verb' },
        ],
        exampleSentence: 'Stars shine.',
      },
    ],
  },

  // ══ LEVEL 2: Adjective + Noun + Verb + Adverb ════════════════════════════════
  {
    levelLabel: 'LEVEL 2',
    title: 'Expanded Sentence',
    desc: 'Add adjective + adverb → "Hungry dogs bark loudly."',
    sentences: [
      {
        slots: [
          { id: 'adjective', accepts: ['adjective'], label: 'ADJECTIVE' },
          { id: 'subject', accepts: ['noun', 'pronoun'], label: 'SUBJECT (noun)' },
          { id: 'verb', accepts: ['verb'], label: 'VERB' },
          { id: 'adverb', accepts: ['adverb'], label: 'ADVERB' },
        ],
        wordBank: [
          { word: 'Hungry', pos: 'adjective' },
          { word: 'Sleepy', pos: 'adjective' },
          { word: 'Happy', pos: 'adjective' },
          { word: 'Big', pos: 'adjective' },
          { word: 'dogs', pos: 'noun' },
          { word: 'cats', pos: 'noun' },
          { word: 'birds', pos: 'noun' },
          { word: 'bark', pos: 'verb' },
          { word: 'purr', pos: 'verb' },
          { word: 'sing', pos: 'verb' },
          { word: 'loudly', pos: 'adverb' },
          { word: 'softly', pos: 'adverb' },
          { word: 'quickly', pos: 'adverb' },
          { word: 'slowly', pos: 'adverb' },
        ],
        exampleSentence: 'Hungry dogs bark loudly.',
      },
      {
        slots: [
          { id: 'adjective', accepts: ['adjective'], label: 'ADJECTIVE' },
          { id: 'subject', accepts: ['noun', 'pronoun'], label: 'SUBJECT (noun)' },
          { id: 'verb', accepts: ['verb'], label: 'VERB' },
          { id: 'adverb', accepts: ['adverb'], label: 'ADVERB' },
        ],
        wordBank: [
          { word: 'Tiny', pos: 'adjective' },
          { word: 'Fluffy', pos: 'adjective' },
          { word: 'Curious', pos: 'adjective' },
          { word: 'Wild', pos: 'adjective' },
          { word: 'rabbits', pos: 'noun' },
          { word: 'foxes', pos: 'noun' },
          { word: 'kittens', pos: 'noun' },
          { word: 'hop', pos: 'verb' },
          { word: 'run', pos: 'verb' },
          { word: 'play', pos: 'verb' },
          { word: 'swiftly', pos: 'adverb' },
          { word: 'gently', pos: 'adverb' },
          { word: 'happily', pos: 'adverb' },
          { word: 'wildly', pos: 'adverb' },
        ],
        exampleSentence: 'Tiny rabbits hop swiftly.',
      },
      {
        slots: [
          { id: 'adjective', accepts: ['adjective'], label: 'ADJECTIVE' },
          { id: 'subject', accepts: ['noun', 'pronoun'], label: 'SUBJECT (noun)' },
          { id: 'verb', accepts: ['verb'], label: 'VERB' },
          { id: 'adverb', accepts: ['adverb'], label: 'ADVERB' },
        ],
        wordBank: [
          { word: 'Brave', pos: 'adjective' },
          { word: 'Strong', pos: 'adjective' },
          { word: 'Clever', pos: 'adjective' },
          { word: 'Tall', pos: 'adjective' },
          { word: 'knights', pos: 'noun' },
          { word: 'heroes', pos: 'noun' },
          { word: 'giants', pos: 'noun' },
          { word: 'fight', pos: 'verb' },
          { word: 'stand', pos: 'verb' },
          { word: 'march', pos: 'verb' },
          { word: 'bravely', pos: 'adverb' },
          { word: 'proudly', pos: 'adverb' },
          { word: 'boldly', pos: 'adverb' },
          { word: 'firmly', pos: 'adverb' },
        ],
        exampleSentence: 'Brave knights fight bravely.',
      },
      {
        slots: [
          { id: 'adjective', accepts: ['adjective'], label: 'ADJECTIVE' },
          { id: 'subject', accepts: ['noun', 'pronoun'], label: 'SUBJECT (noun)' },
          { id: 'verb', accepts: ['verb'], label: 'VERB' },
          { id: 'adverb', accepts: ['adverb'], label: 'ADVERB' },
        ],
        wordBank: [
          { word: 'Bright', pos: 'adjective' },
          { word: 'Golden', pos: 'adjective' },
          { word: 'Sparkling', pos: 'adjective' },
          { word: 'Ancient', pos: 'adjective' },
          { word: 'stars', pos: 'noun' },
          { word: 'rivers', pos: 'noun' },
          { word: 'stones', pos: 'noun' },
          { word: 'shine', pos: 'verb' },
          { word: 'flow', pos: 'verb' },
          { word: 'glitter', pos: 'verb' },
          { word: 'brightly', pos: 'adverb' },
          { word: 'quietly', pos: 'adverb' },
          { word: 'endlessly', pos: 'adverb' },
          { word: 'forever', pos: 'adverb' },
        ],
        exampleSentence: 'Bright stars shine brightly.',
      },
    ],
  },

  // ══ LEVEL 3: Two clauses with conjunction ════════════════════════════════════
  {
    levelLabel: 'LEVEL 3',
    title: 'Compound Sentence',
    desc: 'Two clauses joined by a conjunction',
    sentences: [
      {
        slots: [
          { id: 'subj1', accepts: ['noun', 'pronoun'], label: 'SUBJECT 1' },
          { id: 'verb1', accepts: ['verb'], label: 'VERB 1' },
          { id: 'conjunction', accepts: ['conjunction'], label: 'CONJUNCTION' },
          { id: 'subj2', accepts: ['noun', 'pronoun'], label: 'SUBJECT 2' },
          { id: 'verb2', accepts: ['verb'], label: 'VERB 2' },
        ],
        wordBank: [
          { word: 'Dogs', pos: 'noun' },
          { word: 'Cats', pos: 'noun' },
          { word: 'Birds', pos: 'noun' },
          { word: 'She', pos: 'pronoun' },
          { word: 'He', pos: 'pronoun' },
          { word: 'bark', pos: 'verb' },
          { word: 'purr', pos: 'verb' },
          { word: 'sing', pos: 'verb' },
          { word: 'run', pos: 'verb' },
          { word: 'and', pos: 'conjunction' },
          { word: 'but', pos: 'conjunction' },
          { word: 'so', pos: 'conjunction' },
        ],
        exampleSentence: 'Dogs bark, but cats purr.',
      },
      {
        slots: [
          { id: 'subj1', accepts: ['noun', 'pronoun'], label: 'SUBJECT 1' },
          { id: 'verb1', accepts: ['verb'], label: 'VERB 1' },
          { id: 'conjunction', accepts: ['conjunction'], label: 'CONJUNCTION' },
          { id: 'subj2', accepts: ['noun', 'pronoun'], label: 'SUBJECT 2' },
          { id: 'verb2', accepts: ['verb'], label: 'VERB 2' },
        ],
        wordBank: [
          { word: 'Lions', pos: 'noun' },
          { word: 'Rabbits', pos: 'noun' },
          { word: 'Wolves', pos: 'noun' },
          { word: 'They', pos: 'pronoun' },
          { word: 'We', pos: 'pronoun' },
          { word: 'roar', pos: 'verb' },
          { word: 'hop', pos: 'verb' },
          { word: 'howl', pos: 'verb' },
          { word: 'hide', pos: 'verb' },
          { word: 'and', pos: 'conjunction' },
          { word: 'but', pos: 'conjunction' },
          { word: 'yet', pos: 'conjunction' },
        ],
        exampleSentence: 'Lions roar, but rabbits hide.',
      },
      {
        slots: [
          { id: 'subj1', accepts: ['noun', 'pronoun'], label: 'SUBJECT 1' },
          { id: 'verb1', accepts: ['verb'], label: 'VERB 1' },
          { id: 'conjunction', accepts: ['conjunction'], label: 'CONJUNCTION' },
          { id: 'subj2', accepts: ['noun', 'pronoun'], label: 'SUBJECT 2' },
          { id: 'verb2', accepts: ['verb'], label: 'VERB 2' },
        ],
        wordBank: [
          { word: 'Stars', pos: 'noun' },
          { word: 'Moons', pos: 'noun' },
          { word: 'Suns', pos: 'noun' },
          { word: 'It', pos: 'pronoun' },
          { word: 'They', pos: 'pronoun' },
          { word: 'glow', pos: 'verb' },
          { word: 'rise', pos: 'verb' },
          { word: 'shine', pos: 'verb' },
          { word: 'set', pos: 'verb' },
          { word: 'and', pos: 'conjunction' },
          { word: 'but', pos: 'conjunction' },
          { word: 'or', pos: 'conjunction' },
        ],
        exampleSentence: 'Stars glow, and moons rise.',
      },
      {
        slots: [
          { id: 'subj1', accepts: ['noun', 'pronoun'], label: 'SUBJECT 1' },
          { id: 'verb1', accepts: ['verb'], label: 'VERB 1' },
          { id: 'conjunction', accepts: ['conjunction'], label: 'CONJUNCTION' },
          { id: 'subj2', accepts: ['noun', 'pronoun'], label: 'SUBJECT 2' },
          { id: 'verb2', accepts: ['verb'], label: 'VERB 2' },
        ],
        wordBank: [
          { word: 'Kids', pos: 'noun' },
          { word: 'Teachers', pos: 'noun' },
          { word: 'Parents', pos: 'noun' },
          { word: 'We', pos: 'pronoun' },
          { word: 'They', pos: 'pronoun' },
          { word: 'learn', pos: 'verb' },
          { word: 'teach', pos: 'verb' },
          { word: 'read', pos: 'verb' },
          { word: 'listen', pos: 'verb' },
          { word: 'and', pos: 'conjunction' },
          { word: 'so', pos: 'conjunction' },
          { word: 'but', pos: 'conjunction' },
        ],
        exampleSentence: 'Kids learn, and teachers teach.',
      },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function groupByPos(wordBank) {
  const groups = {}
  for (const tile of wordBank) {
    if (!groups[tile.pos]) groups[tile.pos] = []
    groups[tile.pos].push(tile)
  }
  return groups
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SentenceBuilder() {
  const navigate = useNavigate()
  const [levelIdx, setLevelIdx] = useState(0)
  const [sentenceIdx, setSentenceIdx] = useState(0)

  const level = LEVELS[levelIdx]
  const sentence = level.sentences[sentenceIdx]
  const totalSentences = level.sentences.length

  const initSlots = (lIdx, sIdx) =>
    Object.fromEntries(LEVELS[lIdx].sentences[sIdx].slots.map(s => [s.id, null]))

  const [filled, setFilled] = useState(() => initSlots(0, 0))
  const [dragWord, setDragWord] = useState(null)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [hintButton, setHintButton] = useState(true)
  const [direction, setDirection] = useState(1)   // +1 = forward, -1 = back

  const grouped = groupByPos(sentence.wordBank)
  const usedWords = new Set(Object.values(filled).filter(Boolean).map(t => t.word))

  // ── drag handlers ──────────────────────────────────────────────────────────
  function onDragStart(word, pos, from) {
    setDragWord({ word, pos, from })
    setError(null)
    setResult(null)
  }

  function onDropSlot(slotId) {
    if (!dragWord) return
    const slot = sentence.slots.find(s => s.id === slotId)

    if (!slot.accepts.includes(dragWord.pos)) {
      const expected = slot.accepts.map(p => POS_STYLE[p].label).join(' or ')
      setError({ slotId, message: `A ${POS_STYLE[dragWord.pos].label} can't go here. This slot needs a ${expected}.` })
      setDragWord(null)
      return
    }

    setFilled(prev => {
      const next = { ...prev }
      if (dragWord.from !== 'bank') next[dragWord.from] = null
      next[slotId] = { word: dragWord.word, pos: dragWord.pos }
      return next
    })
    setError(null)
    setDragWord(null)
  }

  function onDropBank() {
    if (dragWord && dragWord.from !== 'bank') {
      setFilled(prev => ({ ...prev, [dragWord.from]: null }))
    }
    setDragWord(null)
  }

  function removeFromSlot(slotId) {
    setFilled(prev => ({ ...prev, [slotId]: null }))
    setError(null)
    setResult(null)
  }

  // ── tap-to-place ───────────────────────────────────────────────────────────
  function tapTile(word, pos) {
    if (usedWords.has(word)) return
    setError(null)
    setResult(null)
    const nextSlot = sentence.slots.find(s => {
      if (filled[s.id]) return false
      return s.accepts.includes(pos)
    })
    if (!nextSlot) {
      setError({ slotId: null, message: `No empty slot accepts a ${POS_STYLE[pos].label}.` })
      return
    }
    setFilled(prev => ({ ...prev, [nextSlot.id]: { word, pos } }))
  }

  // ── check grammar ──────────────────────────────────────────────────────────
  function checkGrammar() {
    const allFilled = sentence.slots.every(s => filled[s.id])
    if (!allFilled) {
      setError({ slotId: null, message: 'Fill all the slots before checking!' })
      return
    }
    if (levelIdx === 2) {
      const s1 = filled['subj1']?.word
      const s2 = filled['subj2']?.word
      if (s1 && s2 && s1 === s2) {
        setResult('wrong')
        setError({ slotId: null, message: 'The two subjects should be different!' })
        return
      }
    }
    setResult('correct')
    setError(null)
    setShowHint(false)
    setHintButton(false)
  }

  function clearAll() {
    setFilled(initSlots(levelIdx, sentenceIdx))
    setError(null)
    setResult(null)
    setShowHint(false)
  }

  function switchLevel(i) {
    setLevelIdx(i)
    setSentenceIdx(0)
    setFilled(initSlots(i, 0))
    setError(null)
    setResult(null)
    setShowHint(false)
    setHintButton(true)
  }

  function nextSentence() {
    const next = (sentenceIdx + 1) % totalSentences
    setDirection(1)
    setSentenceIdx(next)
    setFilled(initSlots(levelIdx, next))
    setError(null)
    setResult(null)
    setShowHint(false)
    setHintButton(true)
  }
  function previousSentence() {
    const next = (sentenceIdx - 1 + totalSentences) % totalSentences
    setDirection(-1)
    setSentenceIdx(next)
    setFilled(initSlots(levelIdx, next))
    setError(null)
    setResult(null)
    setShowHint(false)
    setHintButton(true)
  }

  // ── sentence preview ───────────────────────────────────────────────────────
  const sentenceWords = sentence.slots.map(s => filled[s.id]?.word ?? '___')
  const sentenceStr = sentenceWords.join(' ')
  const displaySentence = sentenceStr === sentence.slots.map(() => '___').join(' ')
    ? null
    : sentenceStr.charAt(0).toUpperCase() + sentenceStr.slice(1) + '.'

  // ── animation variants ────────────────────────────────────────────────────
  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  }

  return (
    <div className="h-screen bg-[#f0f4fb] flex flex-col select-none font-sans overflow-hidden">

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
          <div className="w-full max-w-3xl bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 text-sm text-blue-700">
            Tap or drag word tiles into the matching coloured slots. Each colour is a part of speech.
            A <span className="font-bold text-purple-600">purple</span> slot needs a Noun/Pronoun,{' '}
            <span className="font-bold text-red-500">red</span> a Verb,{' '}
            <span className="font-bold text-green-600">green</span> an Adjective,{' '}
            <span className="font-bold text-yellow-600">yellow</span> an Adverb,{' '}
            <span className="font-bold text-slate-500">grey</span> a Conjunction.
          </div>
        )}

        {/* level tabs */}
        <div className="flex gap-2 w-full max-w-3xl">
          {LEVELS.map((l, i) => (
            <button
              key={i}
              onClick={() => switchLevel(i)}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-colors border
                ${i === levelIdx
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}`}
            >
              {l.levelLabel}
            </button>
          ))}
        </div>

        {/* title + sentence counter */}
        <div className="w-full max-w-3xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-blue-700">Build a Sentence!</h2>
            <p className="text-slate-400 text-sm mt-0.5">Tap or drag word tiles into the correct coloured slots below.</p>
          </div>
          {/* sentence counter pill */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm shrink-0">
            <div className="flex gap-1">
              {level.sentences.map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${i === sentenceIdx ? 'bg-blue-500' : 'bg-slate-200'}`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-500">
              {sentenceIdx + 1} / {totalSentences}
            </span>
          </div>
        </div>

        {/* ── animated sentence area ── */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${levelIdx}-${sentenceIdx}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="w-full max-w-3xl flex flex-col gap-4"
          >
            {/* slot row */}
            <div
              className="flex gap-3 flex-wrap justify-center"
              onDragOver={e => e.preventDefault()}
              onDrop={onDropBank}
            >
              {sentence.slots.map(slot => {
                const tile = filled[slot.id]
                const posKey = tile ? tile.pos : slot.accepts[0]
                const style = POS_STYLE[posKey]
                const isError = error?.slotId === slot.id

                return (
                  <div
                    key={slot.id}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => onDropSlot(slot.id)}
                    onClick={() => tile && removeFromSlot(slot.id)}
                    className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed
                      transition-all cursor-pointer select-none
                      ${tile ? `${style.light} ${style.border}` : 'bg-white border-slate-300 hover:border-blue-300'}
                      ${isError ? 'border-red-400 bg-red-50 animate-pulse' : ''}
                    `}
                    style={{ minWidth: 110, minHeight: 72, padding: '8px 12px' }}
                    title={tile ? 'Click to remove' : `Drop a ${slot.label} here`}
                  >
                    <span className={`text-[10px] font-bold tracking-wider uppercase mb-1
                      ${tile ? style.text : 'text-slate-300'}`}
                    >
                      {slot.label}
                    </span>
                    {tile ? (
                      <span className={`text-base font-black ${style.text}`}>{tile.word}</span>
                    ) : (
                      <span className="text-slate-200 text-xl font-black">—</span>
                    )}
                    <span className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full ${tile ? style.bg : 'bg-slate-200'}`} />
                  </div>
                )
              })}
            </div>

            {/* error banner */}
            {error && (
              <div className="bg-red-50 border border-red-300 rounded-2xl px-5 py-3 text-sm text-red-600 font-semibold text-center">
                ⚠️ {error.message}
              </div>
            )}

            {/* hint */}
            {showHint && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl px-5 py-3 text-sm text-amber-700 font-semibold text-center">
                💡 Example: <em>{sentence.exampleSentence}</em>
              </div>
            )}

            {/* word bank */}
            <div
              className="bg-white rounded-3xl border border-slate-100 shadow-sm px-6 py-5"
              onDragOver={e => e.preventDefault()}
              onDrop={onDropBank}
            >
              <p className="text-sm font-bold text-slate-500 mb-3 flex items-center gap-2">
                🗂 Word Bank
              </p>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(grouped).map(([pos, tiles]) => {
                  const style = POS_STYLE[pos]
                  return (
                    <div key={pos}>
                      <p className={`text-xs font-bold mb-2 ${style.text}`}>{style.label}s</p>
                      <div className="flex gap-2 flex-wrap">
                        {tiles.map(tile => {
                          const used = usedWords.has(tile.word)
                          return (
                            <div
                              key={tile.word}
                              draggable={!used}
                              onDragStart={() => !used && onDragStart(tile.word, tile.pos, 'bank')}
                              onClick={() => !used && tapTile(tile.word, tile.pos)}
                              className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all select-none
                                ${used
                                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-50'
                                  : `${style.bg} text-white shadow-md hover:opacity-90 active:scale-95`
                                }`}
                            >
                              {tile.word}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* sentence preview + actions */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm px-6 py-5 flex flex-col gap-4">
              <p className="text-[10px] font-bold tracking-widest text-slate-400 text-center uppercase">Your Sentence</p>
              <p className={`text-center font-black text-2xl min-h-8
                ${result === 'correct' ? 'text-emerald-600' : result === 'wrong' ? 'text-red-500' : 'text-slate-700'}`}
              >
                {displaySentence
                  ? (result === 'correct' ? `🎉 ${displaySentence}` : displaySentence)
                  : <span className="text-slate-300 font-semibold text-lg">Tap words to build your story…</span>
                }
              </p>

              {result === 'correct' && (
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="text-center text-emerald-600 font-semibold text-sm"
                >
                  ✅ Great sentence! That's grammatically correct.
                </motion.p>
              )}

              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={checkGrammar}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-full shadow-md transition-colors"
                >
                  <CheckCircle2 size={18} /> Check Grammar
                </button>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-5 py-3 rounded-full transition-colors"
                >
                  <Trash2 size={16} /> Clear
                </button>
                {hintButton && (
                  <button
                    onClick={() => setShowHint(h => !h)}
                    className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-white font-bold px-5 py-3 rounded-full shadow-md transition-colors"
                  >
                    <Lightbulb size={16} /> Hint
                  </button>
                )}
                {/* ── Prev / Next Sentence ── */}
                <button
                  onClick={previousSentence}
                  className="flex items-center gap-2 bg-slate-500 hover:bg-slate-600 text-white font-bold px-5 py-3 rounded-full shadow-md transition-colors"
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                {result === 'correct' && (
                  <button
                    onClick={nextSentence}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-3 rounded-full shadow-md transition-colors"
                  >
                    Next Sentence <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>

          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  )
}
