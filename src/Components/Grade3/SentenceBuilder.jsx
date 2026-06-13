import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, HelpCircle, CheckCircle2, Trash2, Lightbulb } from 'lucide-react'

// ─── Part-of-speech colours ───────────────────────────────────────────────────
const POS_STYLE = {
  noun:        { bg: 'bg-purple-400',  border: 'border-purple-400',  text: 'text-purple-700',  light: 'bg-purple-50',  label: 'Noun'        },
  pronoun:     { bg: 'bg-amber-400',  border: 'border-amber-400',  text: 'text-amber-700',  light: 'bg-amber-50',  label: 'Pronoun'     },
  verb:        { bg: 'bg-red-400',     border: 'border-red-400',     text: 'text-red-700',     light: 'bg-red-50',     label: 'Verb'        },
  adjective:   { bg: 'bg-green-400',   border: 'border-green-400',   text: 'text-green-700',   light: 'bg-green-50',   label: 'Adjective'   },
  adverb:      { bg: 'bg-yellow-400',  border: 'border-yellow-400',  text: 'text-yellow-700',  light: 'bg-yellow-50',  label: 'Adverb'      },
  conjunction: { bg: 'bg-slate-400',   border: 'border-slate-400',   text: 'text-slate-700',   light: 'bg-slate-50',   label: 'Conjunction' },
}

// ─── Level definitions ────────────────────────────────────────────────────────
// slots: ordered list of { id, accepts: [pos], label, optional? }
// wordBank: grouped tiles
// solutions: array of valid slot→word maps (at least one must match)
const LEVELS = [
  // ── LEVEL 1: Subject + Verb ──────────────────────────────────────────────
  {
    levelLabel: 'LEVEL 1',
    title: 'Subject + Verb',
    desc: 'Simple: Noun + Verb → "Dogs bark."',
    slots: [
      { id: 'subject', accepts: ['noun', 'pronoun'], label: 'SUBJECT (noun)' },
      { id: 'verb',    accepts: ['verb'],            label: 'VERB'           },
    ],
    wordBank: [
      { word: 'Dogs',   pos: 'noun'   },
      { word: 'Cats',   pos: 'noun'   },
      { word: 'Birds',  pos: 'noun'   },
      { word: 'She',    pos: 'pronoun'},
      { word: 'He',     pos: 'pronoun'},
      { word: 'bark',   pos: 'verb'   },
      { word: 'purr',   pos: 'verb'   },
      { word: 'sing',   pos: 'verb'   },
      { word: 'fly',    pos: 'verb'   },
      { word: 'run',    pos: 'verb'   },
    ],
    exampleSentence: 'Dogs bark.',
  },

  // ── LEVEL 2: Adjective + Noun + Verb + Adverb ────────────────────────────
  {
    levelLabel: 'LEVEL 2',
    title: 'Expanded Sentence',
    desc: 'Add adjective and adverb → "Hungry dogs bark loudly."',
    slots: [
      { id: 'adjective', accepts: ['adjective'],      label: 'ADJECTIVE'      },
      { id: 'subject',   accepts: ['noun', 'pronoun'], label: 'SUBJECT (noun)' },
      { id: 'verb',      accepts: ['verb'],             label: 'VERB'           },
      { id: 'adverb',    accepts: ['adverb'],           label: 'ADVERB'         },
    ],
    wordBank: [
      { word: 'Hungry',  pos: 'adjective' },
      { word: 'Sleepy',  pos: 'adjective' },
      { word: 'Happy',   pos: 'adjective' },
      { word: 'Big',     pos: 'adjective' },
      { word: 'dogs',    pos: 'noun'      },
      { word: 'cats',    pos: 'noun'      },
      { word: 'birds',   pos: 'noun'      },
      { word: 'bark',    pos: 'verb'      },
      { word: 'purr',    pos: 'verb'      },
      { word: 'sing',    pos: 'verb'      },
      { word: 'loudly',  pos: 'adverb'    },
      { word: 'softly',  pos: 'adverb'    },
      { word: 'quickly', pos: 'adverb'    },
      { word: 'slowly',  pos: 'adverb'    },
    ],
    exampleSentence: 'Hungry dogs bark loudly.',
  },

  // ── LEVEL 3: Two clauses with conjunction ─────────────────────────────────
  {
    levelLabel: 'LEVEL 3',
    title: 'Compound Sentence',
    desc: 'Two clauses joined by a conjunction → "Dogs bark, but cats purr."',
    slots: [
      { id: 'subj1',       accepts: ['noun', 'pronoun'], label: 'SUBJECT 1'     },
      { id: 'verb1',       accepts: ['verb'],             label: 'VERB 1'        },
      { id: 'conjunction', accepts: ['conjunction'],      label: 'CONJUNCTION'   },
      { id: 'subj2',       accepts: ['noun', 'pronoun'], label: 'SUBJECT 2'     },
      { id: 'verb2',       accepts: ['verb'],             label: 'VERB 2'        },
    ],
    wordBank: [
      { word: 'Dogs',  pos: 'noun'        },
      { word: 'Cats',  pos: 'noun'        },
      { word: 'Birds', pos: 'noun'        },
      { word: 'She',   pos: 'pronoun'     },
      { word: 'He',    pos: 'pronoun'     },
      { word: 'bark',  pos: 'verb'        },
      { word: 'purr',  pos: 'verb'        },
      { word: 'sing',  pos: 'verb'        },
      { word: 'run',   pos: 'verb'        },
      { word: 'and',   pos: 'conjunction' },
      { word: 'but',   pos: 'conjunction' },
      { word: 'so',    pos: 'conjunction' },
    ],
    exampleSentence: 'Dogs bark, but cats purr.',
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
  const navigate  = useNavigate()
  const [levelIdx, setLevelIdx] = useState(0)

  // slots state: { slotId -> { word, pos } | null }
  const initSlots = (idx) => Object.fromEntries(LEVELS[idx].slots.map(s => [s.id, null]))
  const [filled,    setFilled]    = useState(() => initSlots(0))
  const [dragWord,  setDragWord]  = useState(null)    // { word, pos, from: 'bank'|slotId }
  const [error,     setError]     = useState(null)    // { slotId, message }
  const [result,    setResult]    = useState(null)    // null | 'correct' | 'wrong'
  const [showHelp,  setShowHelp]  = useState(false)
  const [showHint,  setShowHint]  = useState(false)

  const level   = LEVELS[levelIdx]
  const grouped = groupByPos(level.wordBank)

  // tiles in use (placed in a slot) — to grey them out in word bank
  const usedWords = new Set(Object.values(filled).filter(Boolean).map(t => t.word))

  // ── drag handlers ──────────────────────────────────────────────────────────
  function onDragStart(word, pos, from) {
    setDragWord({ word, pos, from })
    setError(null)
    setResult(null)
  }

  function onDropSlot(slotId) {
    if (!dragWord) return
    const slot = level.slots.find(s => s.id === slotId)

    // grammar check
    if (!slot.accepts.includes(dragWord.pos)) {
      const expected = slot.accepts.map(p => POS_STYLE[p].label).join(' or ')
      setError({
        slotId,
        message: `A ${POS_STYLE[dragWord.pos].label} can't go here. This slot needs a ${expected}.`,
      })
      setDragWord(null)
      return
    }

    setFilled(prev => {
      const next = { ...prev }
      // if dragged from another slot, clear it
      if (dragWord.from !== 'bank') next[dragWord.from] = null
      next[slotId] = { word: dragWord.word, pos: dragWord.pos }
      return next
    })
    setError(null)
    setDragWord(null)
  }

  function onDropBank() {
    // drag from slot back to bank — clear that slot
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

  // ── tap-to-place (click on tile fills next empty slot that accepts it) ────
  function tapTile(word, pos) {
    if (usedWords.has(word)) return
    setError(null)
    setResult(null)
    const nextSlot = level.slots.find(s => {
      if (filled[s.id]) return false        // already filled
      if (!s.accepts.includes(pos)) return false
      return true
    })
    if (!nextSlot) {
      // no matching empty slot — show error
      setError({ slotId: null, message: `No empty slot accepts a ${POS_STYLE[pos].label}.` })
      return
    }
    setFilled(prev => ({ ...prev, [nextSlot.id]: { word, pos } }))
  }

  // ── check grammar ──────────────────────────────────────────────────────────
  function checkGrammar() {
    const allFilled = level.slots.every(s => filled[s.id])
    if (!allFilled) {
      setError({ slotId: null, message: 'Fill all the slots before checking!' })
      return
    }
    // basic rule: each slot must have a word of accepted pos (already enforced on drop)
    // additional rule for level 3: subj1 ≠ subj2
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
  }

  function clearAll() {
    setFilled(initSlots(levelIdx))
    setError(null)
    setResult(null)
    setShowHint(false)
  }

  function switchLevel(i) {
    setLevelIdx(i)
    setFilled(initSlots(i))
    setError(null)
    setResult(null)
    setShowHint(false)
  }

  // ── build sentence preview ─────────────────────────────────────────────────
  const sentenceWords = level.slots.map(s => filled[s.id]?.word ?? '___')
  const sentenceStr   = sentenceWords.join(' ')

  // capitalise first word, add period
  const displaySentence = sentenceStr === level.slots.map(() => '___').join(' ')
    ? null
    : sentenceStr.charAt(0).toUpperCase() + sentenceStr.slice(1) + '.'

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

        {/* title card */}
        <div className="w-full max-w-3xl text-center">
          <h2 className="text-2xl font-black text-blue-700">Build a Sentence!</h2>
          <p className="text-slate-400 text-sm mt-0.5">Tap or drag word tiles into the correct coloured slots below.</p>
        </div>

        {/* ── slot row ── */}
        <div
          className="w-full max-w-3xl flex gap-3 flex-wrap justify-center"
          onDragOver={e => e.preventDefault()}
          onDrop={onDropBank}
        >
          {level.slots.map(slot => {
            const tile    = filled[slot.id]
            const posKey  = tile ? tile.pos : slot.accepts[0]
            const style   = POS_STYLE[posKey]
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
                {/* underline accent */}
                <span className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full ${tile ? style.bg : 'bg-slate-200'}`} />
              </div>
            )
          })}
        </div>

        {/* error banner */}
        {error && (
          <div className="w-full max-w-3xl bg-red-50 border border-red-300 rounded-2xl px-5 py-3 text-sm text-red-600 font-semibold text-center">
            ⚠️ {error.message}
          </div>
        )}

        {/* hint */}
        {showHint && (
          <div className="w-full max-w-3xl bg-amber-50 border border-amber-300 rounded-2xl px-5 py-3 text-sm text-amber-700 font-semibold text-center">
            💡 Example: <em>{level.exampleSentence}</em>
          </div>
        )}

        {/* ── word bank ── */}
        <div
          className="w-full max-w-3xl bg-white rounded-3xl border border-slate-100 shadow-sm px-6 py-5"
          onDragOver={e => e.preventDefault()}
          onDrop={onDropBank}
        >
          <p className="text-sm font-bold text-slate-500 mb-3 flex items-center gap-2">
            🗂 Word Bank
          </p>
          <div className="flex flex-col gap-4">
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

        {/* ── sentence preview + actions ── */}
        <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-100 shadow-sm px-6 py-5 flex flex-col gap-4">
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
            <p className="text-center text-emerald-600 font-semibold text-sm">
              ✅ Great sentence! That's grammatically correct.
            </p>
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
            <button
              onClick={() => setShowHint(h => !h)}
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-white font-bold px-5 py-3 rounded-full shadow-md transition-colors"
            >
              <Lightbulb size={16} /> Hint
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
