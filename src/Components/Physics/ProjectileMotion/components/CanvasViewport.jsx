import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CLR } from "../constants/physicsConstants";

/**
 * Responsive canvas container. Observes its own size via ResizeObserver and
 * reports { w, h } upward via onResize so the parent can keep the canvas
 * pixel dimensions in sync. The canvas element itself is passed in via ref.
 *
 * Props:
 *   canvasRef    – ref forwarded from parent (points at <canvas>)
 *   canvasSize   – { w, h } controlled by parent
 *   onResize     – (size: { w, h }) => void
 *   idleHint     – boolean, shows "Configure and click Launch" overlay when true
 */
export default function CanvasViewport({ canvasRef, canvasSize, onResize, idleHint }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        const { width, height } = e.contentRect;
        if (width > 0 && height > 0) {
          onResize({ w: Math.floor(width), h: Math.floor(height) });
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [onResize]);

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 rounded-xl border overflow-hidden relative"
      style={{ borderColor: CLR.border, background: CLR.bg }}
    >
      <canvas
        ref={canvasRef}
        width={canvasSize.w}
        height={canvasSize.h}
        style={{ display: "block", width: "100%", height: "100%" }}
      />

      {/* Idle placeholder hint */}
      <AnimatePresence>
        {idleHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <p className="text-sm" style={{ color: CLR.muted }}>
              Configure parameters and click Launch
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
