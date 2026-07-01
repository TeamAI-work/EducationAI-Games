/**
 * Tracing.jsx - Alphabet Tracing Game
 * Clean layout: fixed-width panels, centred canvas, proper overflow handling.
 */

import { useEffect, useRef, useCallback, useSyncExternalStore, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    init, loadLetter,
    handlePointerDown, handlePointerMove, handlePointerUp,
    advanceStroke, resetCurrentStroke, resetLetter,
    getLetterAccuracy, getAllStrokeRenderProps,
    getState, subscribe, LETTERS,
} from "./engine/tracingEngine.js";

// snapshot helpers
let _lastSnapshot = getState();
function _getSnapshot() { return _lastSnapshot; }
function _getServerSnapshot() { return _lastSnapshot; }

const ALL_LETTERS = Object.keys(LETTERS);

// =============================================================================
// Main Game Component
// =============================================================================
export default function TracingGame() {
    const navigate = useNavigate();
    const [activeLetter, setActiveLetter] = useState("A");
    const [score, setScore] = useState(null);
    const [strokeFeedback, setStrokeFeedback] = useState(null);
    const [letterDone, setLetterDone] = useState(false);

    const engineState = useSyncExternalStore(
        useCallback((notify) => subscribe((snap) => { _lastSnapshot = snap; notify(); }), []),
        _getSnapshot, _getServerSnapshot
    );

    const selectLetter = (letter) => {
        setActiveLetter(letter);
        setScore(null);
        setStrokeFeedback(null);
        setLetterDone(false);
    };

    const handleStrokeEnd = useCallback((result) => {
        setStrokeFeedback(result.completed ? "great" : "retry");
        setTimeout(() => setStrokeFeedback(null), 900);
    }, []);

    const handleLetterComplete = useCallback((accuracy) => {
        setScore(Math.round(accuracy.overall));
        setLetterDone(true);
    }, []);

    const handleReset = () => {
        resetLetter();
        setScore(null);
        setStrokeFeedback(null);
        setLetterDone(false);
    };

    const handleNext = () => {
        const idx = ALL_LETTERS.indexOf(activeLetter);
        selectLetter(ALL_LETTERS[(idx + 1) % ALL_LETTERS.length]);
    };

    const handlePrev = () => {
        const idx = ALL_LETTERS.indexOf(activeLetter);
        selectLetter(ALL_LETTERS[(idx - 1 + ALL_LETTERS.length) % ALL_LETTERS.length]);
    };

    const totalStrokes = engineState.letterData?.strokes?.length ?? 0;
    const currentStroke = Math.min(engineState.currentStrokeIndex, totalStrokes);
    const strokeResults = engineState.letterAccuracy?.strokes ?? [];

    return (
        <div className="flex flex-col select-none h-screen w-screen bg-blue-50 overflow-hidden">

            {/* Header */}
            <header className="shrink-0 w-full px-5 py-3 flex items-center justify-between bg-white border-b-4 border-blue-400 shadow-sm">
                <div className="flex items-center gap-3">
                    <motion.button
                        onClick={() => navigate(-1)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all cursor-pointer"
                    >
                        <ArrowLeft size={20} strokeWidth={2.5} />
                    </motion.button>
                    <span className="font-extrabold text-blue-700 text-2xl">Trace Letters</span>
                </div>
                <span className="text-sm text-gray-500 font-semibold bg-gray-100 px-3 py-1 rounded-full">Grade 1</span>
            </header>

            {/* Body - three-column layout */}
            <div className="flex flex-1 overflow-hidden gap-3 p-3">

                {/* LEFT: Letter Picker - fixed width, scrollable */}
                <aside className="w-fit shrink-0 flex flex-col gap-2 bg-white rounded-2xl p-3 shadow border border-blue-200 overflow-y-auto">
                    <p className="text-xl font-bold text-blue-600 uppercase tracking-widest">Pick a Letter</p>
                    <div className="grid grid-cols-5 gap-3">
                        {ALL_LETTERS.map((l) => (
                            <motion.button
                                key={l}
                                id={`letter-btn-${l}`}
                                onClick={() => selectLetter(l)}
                                whileHover={{ scale: 1.15, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                animate={l === activeLetter ? { scale: 1.08 } : { scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className={`p-4 rounded-lg text-xl font-bold transition-all duration-150 cursor-pointer ${l === activeLetter
                                    ? "bg-blue-500 text-white shadow-md ring-2 ring-blue-300 ring-offset-1"
                                    : "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                                    }`}
                            >
                                {l}
                            </motion.button>
                        ))}
                    </div>
                </aside>

                {/* CENTRE: Canvas + controls */}
                <section className="flex-1 flex flex-col items-center gap-2 min-w-0">

                    {/* Stroke progress */}
                    <div className="flex items-center gap-2 w-full max-w-md">
                        <span className="text-xs font-bold text-blue-600 whitespace-nowrap shrink-0">
                            Stroke {Math.min(currentStroke + 1, totalStrokes || 1)} / {totalStrokes || 1}
                        </span>
                        <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                                className="h-full rounded-full"
                                initial={{ width: "0%" }}
                                animate={{
                                    width: totalStrokes > 0
                                        ? `${Math.min((currentStroke / totalStrokes) * 100, 100)}%`
                                        : "0%",
                                }}
                                transition={{ type: "spring", stiffness: 80, damping: 15 }}
                                style={{
                                    background: letterDone
                                        ? "linear-gradient(90deg,#22c55e,#16a34a)"
                                        : "linear-gradient(90deg,#3b82f6,#2563eb)",
                                }}
                            />
                        </div>
                    </div>

                    {/* Canvas */}
                    <TracingCanvas
                        letter={activeLetter}
                        strokeFeedback={strokeFeedback}
                        onStrokeEnd={handleStrokeEnd}
                        onLetterComplete={handleLetterComplete}
                    />

                    {/* Feedback Container - reserved height prevents shifting controls below */}
                    <div className="h-12 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {strokeFeedback && (
                                <motion.div
                                    key={strokeFeedback}
                                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, y: -5 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className={`rounded-xl border-l-4 px-4 py-1.5 shadow-sm ${
                                        strokeFeedback === "great"
                                            ? "bg-green-50 border-green-500 text-green-800"
                                            : "bg-orange-50 border-orange-500 text-orange-800"
                                    }`}
                                >
                                    <p className="font-bold text-sm flex items-center gap-1.5">
                                        {strokeFeedback === "great" ? "✨ Great!" : "✍️ Keep trying..."}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>



                    {/* Hint */}
                    <p className="text-xs text-gray-500 text-center">
                        Tap the <span className="text-blue-500 font-bold">START dot</span>, then drag to trace each stroke
                    </p>

                    {/* Controls */}
                    <div className="flex gap-2 items-center">
                        <motion.button
                            id="btn-prev-letter"
                            onClick={handlePrev}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 font-bold text-sm shadow-sm cursor-pointer"
                        >
                            Prev
                        </motion.button>
                        <motion.button
                            id="btn-reset"
                            onClick={handleReset}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-sm cursor-pointer"
                        >
                            Reset
                        </motion.button>
                        <motion.button
                            id="btn-next-letter"
                            onClick={handleNext}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 font-bold text-sm shadow-sm cursor-pointer"
                        >
                            Next
                        </motion.button>
                    </div>
                </section>

                {/* RIGHT: Score panel - fixed width */}
                <aside className="w-100 shrink-0 flex flex-col gap-3 items-center bg-white rounded-2xl p-3 shadow border border-blue-200 overflow-y-auto">

                    {/* Current letter */}
                    <div className="text-7xl font-black text-blue-500 leading-none">{activeLetter}</div>

                    {/* Score ring or placeholder */}
                    <AnimatePresence mode="wait">
                        {score !== null && (
                            <motion.div
                                key="score-panel"
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.6 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="flex flex-col items-center"
                            >
                                <ScoreRing score={score} />
                                <p className="text-xs font-bold text-gray-500 mt-1">Accuracy</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Letter complete */}
                    <AnimatePresence>
                        {letterDone && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.7, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.7, y: 30 }}
                                transition={{ type: "spring", stiffness: 180, damping: 12 }}
                                className="w-full rounded-2xl bg-green-50 border border-green-200 p-3 text-center shadow-md"
                            >
                                <motion.p
                                    className="text-3xl mb-1.5 inline-block"
                                >
                                    {score >= 80 ? "🌟" : score >= 60 ? "🎉" : "💪"}
                                </motion.p>
                                <p className="text-sm font-black text-green-600 mb-2">
                                    {score >= 80 ? "Excellent!" : score >= 60 ? "Good job!" : "Keep going!"}
                                </p>
                                <motion.button
                                    id="btn-try-next"
                                    onClick={handleNext}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs cursor-pointer"
                                >
                                    Try Next
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Stroke breakdown */}
                    {strokeResults.length > 0 && (
                        <div className="w-full flex flex-col gap-1.5">
                            <p className="text-[15px] font-bold uppercase tracking-wider text-gray-400">Strokes</p>
                            {strokeResults.map((s, i) => {
                                const col = s.score >= 80 ? "#22c55e" : s.score >= 50 ? "#f59e0b" : "#ef4444";
                                return (
                                    <div key={s.strokeId} className="flex items-center gap-2">
                                        <span className="text-[15px] text-gray-400 font-bold w-5 shrink-0">{i + 1}</span>
                                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div style={{ width: `${s.score}%`, background: col, height: "100%", borderRadius: 999, transition: "width 0.4s ease" }} />
                                        </div>
                                        <span className="text-[15px] font-bold w-6 text-right shrink-0" style={{ color: col }}>
                                            {Math.round(s.score)}%
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </aside>

            </div>
        </div>
    );
}

// =============================================================================
// TracingCanvas
// =============================================================================
function TracingCanvas({ letter, strokeFeedback, onStrokeEnd, onLetterComplete }) {
    const svgRef = useRef(null);

    const engineState = useSyncExternalStore(
        useCallback((notify) => subscribe((snap) => { _lastSnapshot = snap; notify(); }), []),
        _getSnapshot, _getServerSnapshot
    );

    useEffect(() => {
        if (!svgRef.current) return;
        init(svgRef.current);
        loadLetter(letter);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { loadLetter(letter); }, [letter]);

    const onPointerDown = useCallback((e) => { e.currentTarget.setPointerCapture(e.pointerId); handlePointerDown(e); }, []);
    const onPointerMove = useCallback((e) => { handlePointerMove(e); }, []);
    const onPointerUp = useCallback((e) => {
        const result = handlePointerUp(e);
        if (!result) return;
        onStrokeEnd?.(result);
        if (result.completed) {
            const advance = advanceStroke();
            if (advance.letterDone) onLetterComplete?.(getLetterAccuracy());
        } else {
            resetCurrentStroke();
        }
    }, [onStrokeEnd, onLetterComplete]);
    const onPointerCancel = useCallback((e) => { handlePointerUp(e); }, []);

    const strokeRenderProps = getAllStrokeRenderProps();
    const completedIds = new Set(
        engineState.letterAccuracy?.strokes.filter((r) => r.completed).map((r) => r.strokeId) ?? []
    );

    return (
        <div style={{
            width: "min(58vh, 430px)",
            aspectRatio: "1 / 1",
            background: "linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)",
            borderRadius: 20,
            boxShadow: "0 4px 24px rgba(59,130,246,0.12), 0 1px 4px rgba(0,0,0,0.06)",
            overflow: "hidden",
            position: "relative",
            border: "2px solid #e2e8f0",
            flexShrink: 0,
        }}>
            {/* Ghost letter */}
            <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "clamp(130px, 40%, 190px)", fontWeight: 900,
                color: "rgba(59,130,246,0.05)",
                pointerEvents: "none", userSelect: "none", lineHeight: 1,
            }}>
                {letter}
            </div>

            <svg
                ref={svgRef}
                viewBox="0 0 400 400"
                xmlns="http://www.w3.org/2000/svg"
                style={{ touchAction: "none", display: "block", width: "100%", height: "100%", position: "relative", zIndex: 1 }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
            >
                <RuledLines />

                {strokeRenderProps.map((props) => props ? <StrokeLayer key={props.strokeId} {...props} /> : null)}

                <StartIndicator
                    strokes={engineState.letterData?.strokes ?? []}
                    currentIndex={engineState.currentStrokeIndex}
                    completedIds={completedIds}
                />




            </svg>
        </div>
    );
}

// =============================================================================
// RuledLines
// =============================================================================
function RuledLines() {
    const lines = [
        { y: 55, dash: false, color: "#dbeafe", width: 1.5 },
        { y: 160, dash: false, color: "#dbeafe", width: 1.5 },
        { y: 240, dash: true, color: "#bfdbfe", width: 1.5 },
        { y: 345, dash: false, color: "#dbeafe", width: 1.5 },
    ];
    return (
        <g data-role="ruled-lines" style={{ pointerEvents: "none" }}>
            {lines.map(({ y, dash, color, width }) => (
                <line key={y} x1={20} y1={y} x2={380} y2={y}
                    stroke={color} strokeWidth={width}
                    strokeDasharray={dash ? "8 6" : undefined}
                />
            ))}
        </g>
    );
}

// =============================================================================
// StrokeLayer
// =============================================================================
function StrokeLayer({ strokeId, pathD, guideOpacity, guideStroke, traceOpacity, traceStroke, dashArray, dashOffset, isCompleted }) {
    return (
        <g data-stroke-id={strokeId}>
            <path d={pathD} fill="none" stroke={guideStroke} strokeWidth={30}
                strokeLinecap="round" strokeLinejoin="round"
                opacity={guideOpacity} style={{ pointerEvents: "none" }} />
            {!isCompleted && traceOpacity > 0 && (
                <path d={pathD} fill="none" stroke={traceStroke} strokeWidth={30}
                    strokeLinecap="round" strokeLinejoin="round"
                    opacity={traceOpacity} strokeDasharray={dashArray} strokeDashoffset={dashOffset}
                    style={{ pointerEvents: "none", transition: "stroke-dashoffset 16ms linear" }} />
            )}
        </g>
    );
}

// =============================================================================
// StartIndicator — pulsing dot + directional arrow
// =============================================================================
function StartIndicator({ strokes, currentIndex, completedIds }) {
    if (!strokes.length || currentIndex >= strokes.length) return null;
    const currentStroke = strokes[currentIndex];
    if (!currentStroke || completedIds.has(currentStroke.id)) return null;

    const { x, y } = currentStroke.startPoint;
    const dir = currentStroke.direction ?? { x: 1, y: 0 };

    // Arrow geometry
    const OFFSET = 14;   // gap from dot edge to arrow tail
    const LENGTH = 52;   // shaft length
    const HEAD = 14;   // arrowhead arm length
    const SPREAD = 0.45; // arrowhead spread in radians

    const px = -dir.y;   // perpendicular
    const py = dir.x;

    const tx = x + dir.x * OFFSET;
    const ty = y + dir.y * OFFSET;
    const ax = x + dir.x * (OFFSET + LENGTH);
    const ay = y + dir.y * (OFFSET + LENGTH);

    const cos = Math.cos(SPREAD);
    const sin = Math.sin(SPREAD);

    const lx = ax - HEAD * (dir.x * cos - px * sin);
    const ly = ay - HEAD * (dir.y * cos - py * sin);
    const rx2 = ax - HEAD * (dir.x * cos + px * sin);
    const ry2 = ay - HEAD * (dir.y * cos + py * sin);

    const labelX = x - dir.x * 32;
    const labelY = y - dir.y * 32;

    return (
        <motion.g
            data-role="start-indicator"
            style={{ pointerEvents: "none", transformOrigin: `${x}px ${y}px` }}
            animate={{ scale: [0.96, 1.04, 0.96] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
            {/* Pulse ring */}
            <circle cx={x} cy={y} r={20} fill="none" stroke="#3b82f6" strokeWidth={3} opacity={0.6}>
                <animate attributeName="r" values="16;26;16" dur="1.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.4s" repeatCount="indefinite" />
            </circle>

            {/* Solid dot */}
            <circle cx={x} cy={y} r={9} fill="#3b82f6" opacity={0.95} />

            {/* Arrow shaft */}
            <line x1={tx} y1={ty} x2={ax} y2={ay}
                stroke="#3b82f6" strokeWidth={3.5} strokeLinecap="round" opacity={0.9} />

            {/* Arrowhead */}
            <polygon points={`${ax},${ay} ${lx},${ly} ${rx2},${ry2}`}
                fill="#3b82f6" opacity={0.9} />

            {/* START label */}
            <text x={labelX} y={labelY}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={12} fontWeight="700"
                fill="#3b82f6" opacity={0.85}
                fontFamily="Inter, system-ui, sans-serif">
                START
            </text>
        </motion.g>
    );
}

// =============================================================================
// ScoreRing
// =============================================================================
function ScoreRing({ score }) {
    const r = 40;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
    return (
        <svg width={100} height={100} viewBox="0 0 100 100">
            <circle cx={50} cy={50} r={r} fill="none" stroke="#e2e8f0" strokeWidth={9} />
            <circle cx={50} cy={50} r={r} fill="none" stroke={color} strokeWidth={9}
                strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                transform="rotate(-90 50 50)"
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
            <text x={50} y={56} textAnchor="middle" fontSize={20} fontWeight="800"
                fill={color} fontFamily="Inter, system-ui, sans-serif">
                {score}%
            </text>
        </svg>
    );
}