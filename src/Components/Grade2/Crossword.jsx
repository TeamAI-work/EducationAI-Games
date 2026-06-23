import { useState, useMemo, useEffect } from 'react'
import { Volume2, HelpCircle, Lightbulb, Delete, RotateCcw, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import PUZZLE from "./puzzle"


const DATA = [
    {
        "word": "CAT",
        "options": ["A", "B", "R", "T", "U", "C", "Z"],
        "icon": ""
    }
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function cellKey(r, c) { return `${r},${c}` }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function buildCells(words) {
    const map = {}
    const numbered = new Set()

    words.forEach(word => {
        word.answer.split('').forEach((letter, i) => {
            const row = word.direction === 'across' ? word.startRow : word.startRow + i
            const col = word.direction === 'across' ? word.startCol + i : word.startCol
            const k = cellKey(row, col)
            if (!map[k]) map[k] = { row, col, answer: letter, wordIds: [], num: null }
            if (!map[k].wordIds.includes(word.id)) map[k].wordIds.push(word.id)
        })
        const sk = cellKey(word.startRow, word.startCol)
        if (!numbered.has(sk)) { map[sk].num = word.id; numbered.add(sk) }
    })

    return Object.values(map)
}

function buildPool(words) {
    // Derive pool from unique grid cells — shared intersection cells are NOT double-counted.
    // Each cell needs exactly one tile, so pool size == number of cells + 1 distractor.
    const cells = buildCells(words)
    const letters = cells.map(c => c.answer)           // one letter per unique grid cell
    const answerSet = new Set(letters)
    const distractor = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        .split('')
        .find(l => !answerSet.has(l)) ?? 'Z'           // pick a letter not in any answer
    return shuffle([...letters, distractor])
}

// Auto-positions both words: word1 across at row 1 col 0,
// word2 down intersects at the first shared letter.
// If no shared letter exists, word2 is placed to the right with a gap.
function positionWords(puzzle) {
    const a1 = puzzle[0].answer.toUpperCase()
    const a2 = puzzle[1].answer.toUpperCase()

    let inter = null
    outer: for (let i = 0; i < a1.length; i++) {
        for (let j = 0; j < a2.length; j++) {
            if (a1[i] === a2[j]) { inter = { i, j }; break outer }
        }
    }

    const w1Row = 1, w1Col = 0
    const w2Row = inter ? w1Row - inter.j : 0
    const w2Col = inter ? w1Col + inter.i : a1.length + 1

    return [
        { ...puzzle[0], answer: a1, startRow: w1Row, startCol: w1Col },
        { ...puzzle[1], answer: a2, startRow: w2Row, startCol: w2Col },
    ]
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Crossword() {
    const navigate = useNavigate()

    // ── Puzzle progression ──────────────────────────────────────────────────────
    const [puzzleIdx, setPuzzleIdx] = useState(0)

    // Recompute grid whenever puzzle index changes
    const words   = useMemo(() => positionWords(PUZZLE[puzzleIdx]), [puzzleIdx])
    const cells   = useMemo(() => buildCells(words),  [words])
    const allRows = useMemo(() => [...new Set(cells.map(c => c.row))].sort((a, b) => a - b), [cells])
    const allCols = useMemo(() => [...new Set(cells.map(c => c.col))].sort((a, b) => a - b), [cells])

    // ── Game state ──────────────────────────────────────────────────────────────
    const [filled,   setFilled]   = useState({})
    const [wrong,    setWrong]    = useState({})
    const [used,     setUsed]     = useState([])
    const [pool,     setPool]     = useState(() => buildPool(words))
    const [activeId, setActiveId] = useState(words[0].id)
    const [won,      setWon]      = useState(false)
    const [hinted,   setHinted]   = useState(false)

    // Re-initialise game state whenever the puzzle changes
    useEffect(() => {
        setFilled({}); setWrong({}); setUsed([])
        setPool(buildPool(words))
        setActiveId(words[0].id)
        setWon(false); setHinted(false)
    }, [words]) // eslint-disable-line react-hooks/exhaustive-deps

    const activeWord   = words.find(w => w.id === activeId)
    const activeCells  = cells
        .filter(c => c.wordIds.includes(activeId))
        .sort((a, b) => activeWord.direction === 'across' ? a.col - b.col : a.row - b.row)

    const nextEmpty = activeCells.find(c => !filled[cellKey(c.row, c.col)])
    const hasFilled = activeCells.some(c =>  filled[cellKey(c.row, c.col)])

    function placeLetter(letter, poolIdx) {
        if (used.includes(poolIdx) || !nextEmpty) return
        const k = cellKey(nextEmpty.row, nextEmpty.col)
        const isCorrect = letter === nextEmpty.answer
        const newFilled = { ...filled, [k]: letter }
        const newWrong = { ...wrong, [k]: !isCorrect }
        setFilled(newFilled)
        setUsed([...used, poolIdx])
        setWrong(newWrong)
        if (cells.every(c => newFilled[cellKey(c.row, c.col)] === c.answer)) setWon(true)
    }

    function deleteLast() {
        const last = [...activeCells].reverse().find(c => filled[cellKey(c.row, c.col)])
        if (!last) return
        const k = cellKey(last.row, last.col)
        const letter = filled[k]
        const nf = { ...filled }; delete nf[k]
        const nw = { ...wrong }; delete nw[k]
        setFilled(nf); setWrong(nw)
        const pi = pool.findIndex((l, i) => l === letter && used.includes(i))
        if (pi !== -1) setUsed(used.filter(i => i !== pi))
    }

    function giveHint() {
        if (!nextEmpty) return
        const k = cellKey(nextEmpty.row, nextEmpty.col)
        const newFilled = { ...filled, [k]: nextEmpty.answer }
        setFilled(newFilled)
        setWrong(prev => ({ ...prev, [k]: false }))
        setHinted(true)
        const pi = pool.findIndex((l, i) => l === nextEmpty.answer && !used.includes(i))
        if (pi !== -1) setUsed(prev => [...prev, pi])
        if (cells.every(c => newFilled[cellKey(c.row, c.col)] === c.answer)) setTimeout(() => setWon(true), 300)
    }

    function reset() {
        setFilled({}); setWrong({}); setUsed([])
        setActiveId(words[0].id)
        setPool(buildPool(words))
        setWon(false); setHinted(false)
    }

    function nextPuzzle() {
        setPuzzleIdx(idx => (idx + 1) % PUZZLE.length)
    }

    const SIZE = 64

    return (
        <div className="min-h-screen bg-[#f0f4fb] flex flex-col select-none font-sans">

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
                        Crossword puzzle
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-500">
                        <HelpCircle size={16} />
                    </button>
                </div>
            </div>


            {/* Clue cards */}
            <section className="px-8 pt-4 pb-2 grid grid-cols-2 gap-4">
                {words.map(word => {
                    const isActive = word.id === activeId
                    const color = word.direction === 'across' ? 'blue' : 'amber'
                    return (
                        <button
                            key={word.id}
                            onClick={() => setActiveId(word.id)}
                            className={`relative text-left rounded-2xl p-4 border-2 bg-white shadow-sm flex items-center gap-4 transition-all
                ${isActive ? `border-${color}-500 shadow-md` : 'border-slate-200 hover:border-slate-300'}`}
                        >
                            <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-${color}-500`}>
                                {word.label}
                            </span>
                            <div className="mt-4 w-14 shrink-0 flex items-center justify-center">
                                {word.icon ? (
                                    <Icon icon={word.icon} width={44} height={44} />
                                ) : (
                                    <span className="text-4xl">{word.emoji}</span>
                                )}
                            </div>
                            <div className="mt-2">
                                <p className="text-slate-600 text-sm">{word.clue}</p>
                                {isActive && (
                                    <p className={`text-xs font-bold mt-1 tracking-widest text-${color}-500`}>
                                        {word.answer.split('').join(' · ')}
                                    </p>
                                )}
                            </div>
                        </button>
                    )
                })}
            </section>

            {/* Grid */}
            <main className="flex-1 flex items-center justify-center py-4">
                <div className="bg-white/60 backdrop-blur rounded-3xl p-8 border border-white shadow-sm">
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateRows: `repeat(${allRows.length}, ${SIZE}px)`,
                            gridTemplateColumns: `repeat(${allCols.length}, ${SIZE}px)`,
                            gap: 8,
                        }}
                    >
                        {allRows.map(r => allCols.map(c => {
                            const cell = cells.find(cl => cl.row === r && cl.col === c)
                            const k = cellKey(r, c)
                            const val = filled[k]

                            if (!cell) return <div key={k} style={{ width: SIZE, height: SIZE }} />

                            const isActive = cell.wordIds.includes(activeId)
                            const isWrong = wrong[k]
                            const isRight = val && !isWrong

                            const style = isRight ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                                : isWrong ? 'border-red-400 bg-red-50 text-red-600'
                                    : isActive ? 'border-blue-400 bg-blue-50'
                                        : 'border-slate-200 bg-white'

                            return (
                                <div
                                    key={k}
                                    onClick={() => setActiveId(cell.wordIds[0])}
                                    style={{ width: SIZE, height: SIZE }}
                                    className={`relative rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all ${style}`}
                                >
                                    {cell.num && (
                                        <span className="absolute top-1 left-1.5 text-[10px] font-semibold text-slate-400">{cell.num}</span>
                                    )}
                                    {val && <span className="text-2xl font-bold">{val}</span>}
                                </div>
                            )
                        }))}
                    </div>
                </div>
            </main>

            {won && (
                <div className="flex items-center justify-center z-50 mb-10">
                    <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-4 shadow-2xl max-w-fit w-full mx-4">

                        {/* Colored icons + labels for completed words */}
                        <div className="flex gap-8 mb-1">
                            {words.map(w => (
                                <div key={w.id} className="flex flex-col items-center gap-1">
                                    <Icon icon={w.icon} width={56} height={56} />
                                    <span className="text-xs font-bold text-slate-500 tracking-widest">{w.answer}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center items-center gap-3">
                            <div className="text-4xl">🎉</div>
                            <h2 className="text-2xl font-black text-slate-800">Great Job!</h2>
                        </div>

                        <p className="text-slate-400 text-sm">
                            Puzzle {puzzleIdx + 1} of {PUZZLE.length} complete!
                        </p>

                        <div className="flex gap-3 mt-1">
                            <button
                                onClick={reset}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-full transition-colors"
                            >
                                Play Again
                            </button>
                            <button
                                onClick={nextPuzzle}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 py-3 rounded-full transition-colors"
                            >
                                Next Puzzle →
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* Hint */}
            <div className="flex justify-center pb-4">
                <button
                    onClick={giveHint}
                    className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-md transition-colors"
                >
                    <Lightbulb size={16} /> GIVE ME A HINT
                </button>
            </div>

            {/* Tiles + Delete */}
            <footer className="bg-blue-500 px-6 py-5 flex justify-center items-center gap-3">

                <button
                    onClick={reset}
                    disabled={!hasFilled}
                    className={`flex flex-col items-center justify-center gap-1 w-20 h-16 rounded-2xl font-bold text-xs shadow-lg transition-all
            ${hasFilled ? 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95' : 'bg-blue-400 text-blue-300 opacity-40 cursor-not-allowed'}`}
                >
                    <RotateCcw size={22} /> Reset
                </button>
                <div className="w-px h-10 bg-blue-400 mx-1" />



                {pool.map((letter, idx) => {
                    const isUsed = used.includes(idx)
                    return (
                        <button
                            key={idx}
                            onClick={() => placeLetter(letter, idx)}
                            disabled={isUsed}
                            className={`w-14 h-14 rounded-xl text-2xl font-black shadow-md transition-all
                ${isUsed ? 'bg-blue-400 text-blue-300 opacity-50 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                            {letter}
                        </button>
                    )
                })}
                <div className="w-px h-10 bg-blue-400 mx-1" />
                <button
                    onClick={deleteLast}
                    disabled={!hasFilled}
                    className={`flex flex-col items-center justify-center gap-1 w-20 h-16 rounded-2xl font-bold text-xs shadow-lg transition-all
            ${hasFilled ? 'bg-red-500 hover:bg-red-600 text-white active:scale-95' : 'bg-blue-400 text-blue-300 opacity-40 cursor-not-allowed'}`}
                >
                    <Delete size={22} /> DELETE
                </button>
            </footer>

        </div>
    )
}
