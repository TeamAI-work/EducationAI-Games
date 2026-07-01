import { ArrowLeft, HelpCircle } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

export default function Count() {

    const LEVELS = [
        { label: "Level 1", desc: "Fill in the blank", color: "#3b82f6", problems: [] },
        { label: "Level 2", desc: "Fill in the blank", color: "#3b82f6", problems: [] }
    ]

    const navigate = useNavigate()
    const [levelIdx, setLevelIdx] = useState(0)
    const [count, setCount] = useState(0)
    const [showHelp, setShowHelp] = useState(false)

    // Bottom strip — source apples, each { id, removing }
    const [bottomApples, setBottomApples] = useState([])
    // Top box — dropped apples
    const [topApples, setTopApples] = useState([])

    const nextId = useRef(0)
    const [draggingId, setDraggingId] = useState(null)
    const [isDragOver, setIsDragOver] = useState(false)
    const [feedback, setFeedback] = useState(null) // null | 'correct' | 'wrong'

    // Rebuild bottom apples whenever count changes
    useEffect(() => {
        getPuzzle(0)
        const total = count + 5
        setBottomApples(Array.from({ length: total }, () => ({
            id: nextId.current++,
            removing: false,
        })))
        setTopApples([])
        setFeedback(null)
    }, [count])

    function switchLevel(idx) {
        getPuzzle(idx)
        setLevelIdx(idx)
    }

    function getPuzzle(lvl) {
        const min = lvl === 0 ? 1 : 10
        const max = lvl === 0 ? 10 : 20
        setCount(Math.floor(Math.random() * (max - min + 1) + min))
    }

    function checkAnswer() {
        if (topApples.length === count) {
            setFeedback('correct')
        } else {
            setFeedback('wrong')
        }
    }

    function newPuzzle() {
        getPuzzle(levelIdx)
    }

    // ── Drag handlers ──────────────────────────────────────────────
    function handleDragStart(e, id) {
        setDraggingId(id)
        e.dataTransfer.effectAllowed = "move"
    }

    function handleDragEnd() {
        setDraggingId(null)
    }

    function handleDragOver(e) {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        setIsDragOver(true)
    }

    function handleDragLeave() {
        setIsDragOver(false)
    }

    function handleDrop(e) {
        e.preventDefault()
        setIsDragOver(false)
        if (draggingId === null) return

        const id = draggingId
        setDraggingId(null)

        // Mark apple as removing → triggers slide animation on bottom strip
        setBottomApples(prev => prev.map(a => a.id === id ? { ...a, removing: true } : a))

        // Add to top box immediately
        setTopApples(prev => [...prev, { id }])

        // After animation completes, purge from bottom state
        setTimeout(() => {
            setBottomApples(prev => prev.filter(a => a.id !== id))
        }, 350)
    }

    return (
        <div className="flex flex-col select-none h-screen w-screen">

            {/* Header */}
            <header className="w-full px-4 py-2 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200">
                        <ArrowLeft size={30} />
                    </button>
                    <span className="font-bold text-blue-700 text-3xl">Count Objects</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowHelp(h => !h)} className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-500">
                        <HelpCircle size={16} />
                    </button>
                </div>
            </header>

            {/* Main Section */}
            <div className="flex-1 flex gap-5 px-10">
                {/* Left Section */}
                <div className="flex-col flex gap-6 w-[60%] justify-center py-6">


                    {/* Top drop box */}
                    <div className="w-full flex justify-center">
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            style={{
                                background: isDragOver
                                    ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
                                    : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                boxShadow: isDragOver
                                    ? 'inset 0 2px 16px rgba(59,130,246,0.10), 0 4px 24px rgba(59,130,246,0.08)'
                                    : 'inset 0 2px 12px rgba(0,0,0,0.04), 0 2px 12px rgba(0,0,0,0.04)',
                            }}
                            className={`rounded-3xl w-[85%] min-h-[220px] flex flex-wrap gap-3 p-5 items-start content-start transition-all duration-300
                                ${isDragOver
                                    ? 'border-2 border-dashed border-blue-400 scale-[1.01]'
                                    : 'border-2 border-dashed border-gray-200'}`}
                        >
                            {topApples.map(apple => (
                                <div
                                    key={apple.id}
                                    onClick={() => {
                                        setBottomApples(prev => [...prev, { id: nextId.current++ }]);
                                        setTopApples(prev => prev.filter(a => a.id !== apple.id));
                                    }}
                                    className="flex justify-center items-center rounded-2xl p-2 bg-white border border-gray-100 shadow-sm cursor-pointer hover:scale-110 hover:shadow-md active:scale-95 transition-all duration-150"
                                    title="Click to send back"
                                >
                                    <span className="text-4xl">🍎</span>
                                </div>
                            ))}
                            {topApples.length === 0 && (
                                <div className="m-auto flex flex-col items-center gap-2 pointer-events-none">
                                    <span className="text-5xl opacity-20">🍎</span>
                                    <span className="text-gray-300 text-sm font-semibold">Drag apples here</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom window strip */}
                    <div className="flex justify-center items-center">
                        {/* Outer wrapper adds drop-shadow and relative for edge fades */}
                        <div className="relative" style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.08))' }}>
                            {/* Left fade edge */}
                            <div className="pointer-events-none absolute left-0 top-0 h-full w-10 z-10 rounded-l-2xl"
                                style={{ background: 'linear-gradient(to right, #f1f5f9, transparent)' }} />
                            {/* Right fade edge */}
                            <div className="pointer-events-none absolute right-0 top-0 h-full w-10 z-10 rounded-r-2xl"
                                style={{ background: 'linear-gradient(to left, #f1f5f9, transparent)' }} />

                            {/* Window frame */}
                            <div
                                className="rounded-2xl w-[500px] h-[90px] overflow-hidden flex items-center px-4"
                                style={{
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                    border: '2px solid #e2e8f0',
                                }}
                            >
                                {/* Unconstrained inner strip */}
                                <div className="flex items-center" style={{ gap: 0 }}>
                                    {bottomApples.map(apple => (
                                        <div
                                            key={apple.id}
                                            draggable={!apple.removing}
                                            onClick={() => {
                                                setBottomApples(prev => prev.filter(a => a.id !== apple.id));
                                                setTopApples(prev => [...prev, { id: nextId.current++ }]);
                                            }}
                                            onDragStart={(e) => handleDragStart(e, apple.id)}
                                            onDragEnd={handleDragEnd}
                                            style={{
                                                maxWidth: apple.removing ? '0px' : '68px',
                                                opacity: apple.removing ? 0 : draggingId === apple.id ? 0.3 : 1,
                                                marginRight: apple.removing ? '0px' : '8px',
                                                transform: apple.removing ? 'scale(0.3)' : 'scale(1)',
                                                transition: 'max-width 350ms ease, opacity 280ms ease, margin-right 350ms ease, transform 280ms ease',
                                                overflow: 'hidden',
                                                flexShrink: 0,
                                                cursor: apple.removing ? 'default' : 'grab',
                                            }}
                                            className="select-none flex justify-center items-center rounded-xl p-2 bg-white border border-gray-100 shadow-sm hover:scale-110 hover:shadow-md transition-transform duration-100"
                                            title="Drag or click to move"
                                        >
                                            <span className="text-3xl">🍎</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section */}
                <div className='flex-1 flex flex-col items-center justify-center gap-8 py-6'>

                    {/* Level tabs */}
                    <div className="flex w-[85%] rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 p-1 gap-1">
                        {LEVELS.map((lvl, i) => (
                            <button
                                key={i}
                                onClick={() => switchLevel(i)}
                                className={`flex-1 py-2 rounded-xl font-bold text-base transition-all duration-200
                                    ${i === levelIdx
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {lvl.label}
                            </button>
                        ))}
                    </div>

                    {/* Target count */}
                    <div className='flex gap-3 text-blue-500 justify-center items-end'>
                        <span className='text-3xl font-black'>Make</span>
                        <div className='text-7xl font-black leading-none'>{count}</div>
                        <span className='text-3xl font-black'>apples</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-[85%] flex flex-col gap-2">
                        <div className="flex justify-between text-sm text-gray-400 font-semibold">
                            <span>Progress</span>
                            <span>{topApples.length} / {count}</span>
                        </div>
                        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                    width: count > 0 ? `${Math.min((topApples.length / count) * 100, 100)}%` : '0%',
                                    backgroundColor: topApples.length === count ? '#22c55e' : '#3b82f6',
                                }}
                            />
                        </div>
                    </div>

                    {/* Current count card */}
                    <div className="flex items-center gap-4 border border-gray-200 rounded-3xl px-8 py-5 bg-white shadow-sm w-[85%] justify-center">
                        <div
                            className="text-6xl font-black transition-colors duration-300"
                            style={{ color: topApples.length === count && count > 0 ? '#22c55e' : '#3b82f6' }}
                        >
                            {topApples.length}
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-sm text-gray-400 font-semibold uppercase tracking-wide">Placed</span>
                            <span className="text-lg text-gray-600 font-bold">out of {count}</span>
                        </div>
                    </div>

                    {/* Feedback banner */}
                    {feedback && (
                        <div className={`w-[85%] py-4 rounded-2xl text-center text-xl font-black transition-all
                            ${feedback === 'correct'
                                ? 'bg-green-100 text-green-600 border border-green-300'
                                : 'bg-red-100 text-red-500 border border-red-300'}`}
                        >
                            {feedback === 'correct' ? '🎉 Correct! Well done!' : `❌ Not quite — you placed ${topApples.length}, need ${count}`}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3 w-[85%]">
                        <button
                            onClick={checkAnswer}
                            disabled={topApples.length === 0}
                            className="flex-1 py-4 rounded-2xl bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-black text-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                        >
                            Check ✓
                        </button>
                        <button
                            onClick={newPuzzle}
                            className="flex-1 py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-600 font-black text-lg transition-all duration-150 border border-gray-200"
                        >
                            New 🔄
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}