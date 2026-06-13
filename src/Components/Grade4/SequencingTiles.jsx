import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, HelpCircle, ChevronRight, RotateCcw, CheckCircle, XCircle } from 'lucide-react'

// ─── Story data ───────────────────────────────────────────────────────────────
const LEVELS = [
    {
        level: 1,
        label: 'Level 1',
        desc: 'Explicit sequence words (first, then, finally)',
        color: '#3b82f6',
        stories: [
            {
                id: 'L1_S1',
                title: 'The Bird House',
                scrambled_tiles: [
                    { id: 'A', text: 'Finally, a little blue bird flew inside.' },
                    { id: 'B', text: 'First, Tim painted the wooden bird house.' },
                    { id: 'C', text: 'Next, he hung it up on a tall tree branch.' },
                ],
                correct_order: ['B', 'C', 'A'],
            },
            {
                id: 'L1_S2',
                title: 'Baking Cookies',
                scrambled_tiles: [
                    { id: 'A', text: 'Then, she put the tray into the hot oven.' },
                    { id: 'B', text: 'First, Mom mixed the cookie dough in a big bowl.' },
                    { id: 'C', text: 'Last, we ate the warm cookies with milk.' },
                ],
                correct_order: ['B', 'A', 'C'],
            },
            {
                id: 'L1_S3',
                title: 'Making a Sandcastle',
                scrambled_tiles: [
                    { id: 'A', text: 'Next, he flipped the bucket upside down on the beach.' },
                    { id: 'B', text: 'Finally, he put a little red flag on top.' },
                    { id: 'C', text: 'First, Leo filled his yellow bucket with wet sand.' },
                ],
                correct_order: ['C', 'A', 'B'],
            },
        ],
    },
    {
        level: 2,
        label: 'Level 2',
        desc: 'Implicit sequence — cause and effect',
        color: '#8b5cf6',
        stories: [
            {
                id: 'L2_S1',
                title: 'Lost Toy',
                scrambled_tiles: [
                    { id: 'A', text: 'He looked under his bed and found his toy car.' },
                    { id: 'B', text: 'Sam felt very sad because his favorite toy was missing.' },
                    { id: 'C', text: 'He wiped his tears and started smiling again.' },
                ],
                correct_order: ['B', 'A', 'C'],
            },
            {
                id: 'L2_S2',
                title: 'The Muddy Puppy',
                scrambled_tiles: [
                    { id: 'A', text: 'Max jumped into a deep puddle of mud.' },
                    { id: 'B', text: 'Dad used the garden hose to wash him clean.' },
                    { id: 'C', text: 'The puppy ran through the wet grass after the rain.' },
                ],
                correct_order: ['C', 'A', 'B'],
            },
            {
                id: 'L2_S3',
                title: 'Plant Growth',
                scrambled_tiles: [
                    { id: 'A', text: 'A tiny green sprout pushed up through the dirt.' },
                    { id: 'B', text: 'Maya dug a small hole and dropped a sunflower seed inside.' },
                    { id: 'C', text: 'She carried her watering can over and gave it a drink.' },
                ],
                correct_order: ['B', 'C', 'A'],
            },
        ],
    },
    {
        level: 3,
        label: 'Level 3',
        desc: 'Non-linear telling — inference required',
        color: '#059669',
        stories: [
            {
                id: 'L3_S1',
                title: 'School Day',
                scrambled_tiles: [
                    { id: 'A', text: 'The loud bell rang and she walked into her classroom.' },
                    { id: 'B', text: 'Lily waved goodbye as she stepped onto the big yellow bus.' },
                    { id: 'C', text: 'She packed her red notebook into her backpack at breakfast.' },
                ],
                correct_order: ['C', 'B', 'A'],
            },
            {
                id: 'L3_S2',
                title: 'The Birthday Surprise',
                scrambled_tiles: [
                    { id: 'A', text: 'All of her friends jumped up and yelled, "Surprise!"' },
                    { id: 'B', text: 'Amy walked into the dark living room and turned on the light.' },
                    { id: 'C', text: 'She opened her eyes wide and started to laugh.' },
                ],
                correct_order: ['B', 'A', 'C'],
            },
            {
                id: 'L3_S3',
                title: 'Starry Night',
                scrambled_tiles: [
                    { id: 'A', text: 'The bright sun went down behind the hills.' },
                    { id: 'B', text: 'He pointed his telescope at the shiny moon.' },
                    { id: 'C', text: 'Jake waited for the sky to get completely dark.' },
                ],
                correct_order: ['A', 'C', 'B'],
            },
        ],
    },
]

const TILE_COLORS = [
    { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af' },
    { bg: '#fef9c3', border: '#fcd34d', text: '#92400e' },
    { bg: '#d1fae5', border: '#6ee7b7', text: '#065f46' },
    { bg: '#fce7f3', border: '#f9a8d4', text: '#9d174d' },
    { bg: '#ede9fe', border: '#c4b5fd', text: '#4c1d95' },
]

// ─── Pure move function — single source of truth ──────────────────────────────
// src: 'pool' | number (slot index)
// dst: 'pool' | number (slot index)
function applyMove(state, id, src, dst) {
    const slots = [...state.slots]
    const pool = [...state.pool]

    if (src === dst) return state  // no-op

    // Remove id from its source
    if (src === 'pool') {
        const idx = pool.indexOf(id)
        if (idx === -1) return state
        pool.splice(idx, 1)
    } else {
        slots[src] = null
    }

    // Place id into destination; handle eviction
    if (dst === 'pool') {
        pool.push(id)
    } else {
        const evicted = slots[dst]
        if (evicted !== null && evicted !== undefined) {
            // Send evicted tile back to source location
            if (src === 'pool') {
                pool.push(evicted)
            } else {
                slots[src] = evicted
            }
        }
        slots[dst] = id
    }

    return { slots, pool }
}

function initState(story) {
    return {
        slots: Array(story.scrambled_tiles.length).fill(null),
        pool: story.scrambled_tiles.map(t => t.id),
    }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SequencingTiles() {
    const navigate = useNavigate()

    const [levelIdx, setLevelIdx] = useState(0)
    const [storyIdx, setStoryIdx] = useState(0)
    const [showHelp, setShowHelp] = useState(false)
    const [result, setResult] = useState(null)   // null | 'correct' | 'wrong'
    const [score, setScore] = useState(0)
    const [shake, setShake] = useState(false)

    // Single state object: { slots: (null|id)[], pool: id[] }
    const [board, setBoard] = useState(() => initState(LEVELS[0].stories[0]))

    // Tap-to-place state
    const [picked, setPicked] = useState(null)  // { id, src } | null

    // Drag refs
    const dragId = useRef(null)
    const dragSrc = useRef(null)

    const level = LEVELS[levelIdx]
    const story = level.stories[storyIdx]
    const { slots, pool } = board

    // Reset board when story changes
    useEffect(() => {
        setBoard(initState(story))
        setResult(null)
        setShake(false)
        setPicked(null)
    }, [levelIdx, storyIdx, story])

    function tileById(id) {
        return story.scrambled_tiles.find(t => t.id === id)
    }
    function colorFor(id) {
        const i = story.scrambled_tiles.findIndex(t => t.id === id)
        return TILE_COLORS[i % TILE_COLORS.length]
    }

    // ── Drag & drop ──────────────────────────────────────────────────────────────
    function onDragStart(e, id, src) {
        dragId.current = id
        dragSrc.current = src
        e.dataTransfer.effectAllowed = 'move'
    }
    function onDragOver(e) { e.preventDefault() }

    function onDrop(e, dst) {
        e.preventDefault()
        const id = dragId.current
        const src = dragSrc.current
        dragId.current = null
        dragSrc.current = null
        if (id === null || id === undefined) return
        setBoard(prev => applyMove(prev, id, src, dst))
    }

    // ── Tap to place ─────────────────────────────────────────────────────────────
    function onTileClick(id, src) {
        if (result !== null) return
        if (!picked) {
            setPicked({ id, src })
        } else if (picked.id === id) {
            setPicked(null)   // deselect
        } else if (typeof src === 'number') {
            // tapping another slot tile while holding: swap
            setBoard(prev => applyMove(prev, picked.id, picked.src, src))
            setPicked(null)
        } else {
            // both pool tiles: reselect
            setPicked({ id, src })
        }
    }

    function onSlotClick(slotIdx) {
        if (result !== null) return
        if (picked) {
            setBoard(prev => applyMove(prev, picked.id, picked.src, slotIdx))
            setPicked(null)
        } else if (slots[slotIdx]) {
            setPicked({ id: slots[slotIdx], src: slotIdx })
        }
    }

    // ── Game logic ───────────────────────────────────────────────────────────────
    function checkAnswer() {
        if (slots.some(s => !s)) return
        const ok = story.correct_order.every((id, i) => slots[i] === id)
        if (ok) {
            setResult('correct')
            setScore(s => s + 100)
        } else {
            setResult('wrong')
            setShake(true)
            setTimeout(() => setShake(false), 600)
        }
    }

    function tryAgain() {
        setBoard(initState(story))
        setResult(null)
        setPicked(null)
    }

    function nextStory() {
        if (storyIdx + 1 < level.stories.length) {
            setStoryIdx(s => s + 1)
        } else if (levelIdx + 1 < LEVELS.length) {
            setLevelIdx(l => l + 1)
            setStoryIdx(0)
        }
    }

    function switchLevel(idx) {
        setLevelIdx(idx)
        setStoryIdx(0)
    }

    const allFilled = slots.every(Boolean)
    const isLastStory = levelIdx === LEVELS.length - 1 && storyIdx === level.stories.length - 1

    return (
        <div className="min-h-screen bg-[#eef4fb] flex flex-col font-sans select-none">

            {/* ── header ── */}
            <header className="w-full px-6 pt-2 pb-2 flex justify-between items-center shrink-0">
                <div className='flex gap-5 items-center'>

                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 text-blue-600 font-bold text-sm bg-blue-200 p-4 hover:text-blue-800 rounded-full"
                    >
                        <ArrowLeft size={30} />
                    </button>
                    <h1 className="text-3xl font-bold text-blue-600">Sequencing Tiles</h1>
                </div>



                <div className="flex gap-2">
                    <div className='flex gap-2.5 justify-end'>
                        {LEVELS.map((l, i) => (
                            <button
                                key={i}
                                onClick={() => switchLevel(i)}
                                className={`w-fit px-3 rounded-full text-sm font-bold flex gap-2 items-center justify-center
                ${levelIdx === i ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-200'}`}
                            >
                                <span>LEVEL</span>  {i + 1}
                            </button>
                        ))
                        }
                    </div>
                    <button
                        onClick={() => setShowHelp(h => !h)}
                        className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-blue-500"
                    >
                        <HelpCircle size={18} />
                    </button>
                </div>
            </header>

            {/* ── body ── */}
            <div className="flex flex-col items-center flex-1 px-4 py-6 gap-5 overflow-y-auto">

                {showHelp && (
                    <div className="w-full max-w-3xl bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 text-sm text-blue-700">
                        Read all the sentence tiles, then <strong>drag</strong> (or <strong>tap</strong>) them into the numbered slots
                        in the correct story order. Press <strong>Check!</strong> when all slots are filled.
                    </div>
                )}

                {/* instruction card */}
                <div className="w-full max-w-3xl bg-white border-l-4 rounded-2xl shadow-sm px-6 py-4"
                    style={{ borderLeftColor: level.color }}>
                    <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: level.color }}>INSTRUCTION</p>
                    <p className="text-lg font-semibold text-slate-700">Put the sentences in order to tell the story.</p>
                </div>

                {/* story title */}
                <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-slate-800">{story.title}</span>
                    <span className="text-xs text-slate-400">{level.desc}</span>
                </div>

                {/* ── drop zones ── */}
                <div className="w-full max-w-3xl">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">YOUR STORY SEQUENCE</p>
                    <div className={`grid gap-3 ${slots.length <= 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                        {slots.map((tileId, i) => {
                            const tile = tileId ? tileById(tileId) : null
                            const color = tileId ? colorFor(tileId) : null
                            const isPicked = picked?.src === i
                            const isWrong = result === 'wrong' && tileId && slots[i] !== story.correct_order[i]

                            return (
                                <div
                                    key={i}
                                    onDragOver={onDragOver}
                                    onDrop={e => onDrop(e, i)}
                                    onClick={() => onSlotClick(i)}
                                    className={`relative min-h-[110px] rounded-2xl border-2 transition-all flex flex-col
                    items-center justify-center p-3 cursor-pointer
                    ${!tile ? 'border-dashed border-slate-300 bg-white hover:border-blue-300 hover:bg-blue-50' : 'shadow-sm'}
                    ${isPicked ? 'ring-2 ring-offset-1 ring-blue-400' : ''}
                    ${shake && isWrong ? 'animate-shake' : ''}
                  `}
                                    style={
                                        result === 'correct' && tile
                                            ? { background: '#d1fae5', borderColor: '#34d399' }
                                            : tile
                                                ? { background: color.bg, borderColor: color.border }
                                                : {}
                                    }
                                >
                                    <span className={`absolute top-2 left-3 text-xs font-black ${tile ? 'opacity-30' : 'text-slate-300'}`}>
                                        {i + 1}
                                    </span>

                                    {tile ? (
                                        <>
                                            {/* slots are also draggable */}
                                            <div
                                                draggable
                                                onDragStart={e => { e.stopPropagation(); onDragStart(e, tileId, i) }}
                                                className="w-full flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing"
                                                onClick={e => { e.stopPropagation(); onTileClick(tileId, i) }}
                                            >
                                                <p className="text-sm font-semibold text-center leading-snug mt-2"
                                                    style={{ color: result === 'correct' ? '#065f46' : color.text }}>
                                                    {tile.text}
                                                </p>
                                            </div>
                                            {result === 'correct' && <CheckCircle size={16} className="text-emerald-500 mt-1" />}
                                            {result === 'wrong' && (
                                                slots[i] === story.correct_order[i]
                                                    ? <CheckCircle size={16} className="text-emerald-500 mt-1" />
                                                    : <XCircle size={16} className="text-red-400 mt-1" />
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-slate-200 text-3xl font-black">{i + 1}</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* ── sentence pool ── */}
                <div className="w-full max-w-3xl"
                    onDragOver={onDragOver}
                    onDrop={e => onDrop(e, 'pool')}>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">SENTENCE POOL</p>

                    {/* CHANGE 1: Switched to grid, 3 equal columns, eliminated flex-wrap */}
                    <div className="grid grid-cols-3 box-border gap-3 min-h-[80px] bg-white rounded-2xl border border-slate-100 shadow-sm p-4 w-full">
                        {pool.length === 0 && result === null && (
                            <span className="col-span-3 text-sm text-slate-300 font-semibold m-auto">All tiles placed — press Check!</span>
                        )}
                        {pool.map(id => {
                            const tile = tileById(id)
                            const color = colorFor(id)
                            const isPicked = picked?.id === id && picked?.src === 'pool'

                            return (
                                <div
                                    key={id}
                                    draggable
                                    onDragStart={e => onDragStart(e, id, 'pool')}
                                    onClick={() => onTileClick(id, 'pool')}
                                    className={`rounded-xl border-2 w-full px-4 py-3 text-sm font-semibold cursor-grab active:cursor-grabbing
            transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5
            ${isPicked ? 'ring-2 ring-offset-1 ring-blue-500 scale-105' : ''}`}
                                    style={{ background: color.bg, borderColor: color.border, color: color.text }}
                                >
                                    {tile.text}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* ── check button ── */}
                {result === null && (
                    <button
                        onClick={checkAnswer}
                        disabled={!allFilled}
                        className={`font-black px-8 py-3 rounded-full shadow-md text-white transition-all
              ${allFilled ? 'bg-blue-700 hover:bg-blue-800 active:scale-95' : 'bg-slate-300 cursor-not-allowed'}`}
                    >
                        Check!
                    </button>
                )}

                {/* ── feedback ── */}
                {result === 'correct' && (
                    <div className="w-full max-w-3xl bg-emerald-50 border-2 border-emerald-300 rounded-2xl px-6 py-4 flex items-center justify-between">
                        <div>
                            <p className="text-emerald-700 font-black text-lg">🎉 Perfect order!</p>
                            <p className="text-emerald-600 text-sm">You sequenced the story correctly.</p>
                        </div>
                        {!isLastStory ? (
                            <button onClick={nextStory}
                                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-full shadow-md">
                                Next Story <ChevronRight size={16} />
                            </button>
                        ) : (
                            <div className="flex items-center gap-3">
                                <span className="text-emerald-700 font-bold text-sm">All done! ⭐ {score} pts</span>
                                <button onClick={() => { setLevelIdx(0); setStoryIdx(0); setScore(0) }}
                                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-full text-sm shadow-md">
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
                            <p className="text-red-400 text-sm">Check the ✗ slots and think about what happens first.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={tryAgain}
                                className="bg-white border border-slate-200 text-slate-600 font-bold py-2 px-4 rounded-full text-sm hover:bg-slate-50 flex items-center gap-1">
                                <RotateCcw size={13} /> Try Again
                            </button>
                            {!isLastStory && (
                                <button onClick={nextStory}
                                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-2 rounded-full text-sm shadow-md">
                                    Skip <ChevronRight size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* progress dots */}
                <div className="flex items-center gap-2 mt-1">
                    {level.stories.map((_, i) => (
                        <div key={i}
                            className={`h-2.5 rounded-full transition-all ${i < storyIdx ? 'bg-emerald-400 w-2.5' : i === storyIdx ? 'w-4' : 'bg-slate-200 w-2.5'}`}
                            style={i === storyIdx ? { background: level.color } : {}} />
                    ))}
                </div>
            </div>

            <style>{`
        @keyframes shake {
          0%,100% { transform:translateX(0); }
          20%      { transform:translateX(-6px); }
          40%      { transform:translateX(6px); }
          60%      { transform:translateX(-4px); }
          80%      { transform:translateX(4px); }
        }
        .animate-shake { animation: shake 0.5s ease; }
      `}</style>
        </div>
    )
}
