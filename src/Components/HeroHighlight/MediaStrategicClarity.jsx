import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const STRATEGIC_EDGES = [
  // Hub 1 (node 0) connections
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
  // Hub 2 (node 7) connections
  [7, 5], [7, 6], [7, 8], [7, 9], [7, 10], [7, 11], [7, 12], [7, 13],
  // Extra cyclic edges to make it a more complex graph network
  [1, 4], [2, 5], [8, 13], [10, 11], [3, 12]
];

export default function MediaStrategicClarity({ reduced }) {
  const SPEED_FACTOR = 0.15; // Tweak this value to reduce or increase speed
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const [nodes, setNodes] = useState([
    // Hub 1
    { id: 0, x: 50, y: 35, vx: 0.15, vy: -0.1, r: 5, isHub: true, label: "Mathematics Syllabus" },
    // Spokes for Hub 1
    { id: 1, x: 25, y: 20, vx: -0.1, vy: 0.12, r: 2.5, label: "Algebra" },
    { id: 2, x: 35, y: 70, vx: 0.12, vy: -0.08, r: 2.5, label: "Geometry" },
    { id: 3, x: 80, y: 25, vx: -0.08, vy: -0.15, r: 2.5, label: "Trigonometry" },
    { id: 4, x: 20, y: 50, vx: 0.14, vy: 0.1, r: 2.5, label: "Statistics" },
    { id: 5, x: 70, y: 55, vx: -0.12, vy: 0.08, r: 3, label: "Calculus Basics" }, // Shared node
    { id: 6, x: 85, y: 40, vx: 0.1, vy: -0.12, r: 3, label: "Probability" }, // Shared node
    
    // Hub 2
    { id: 7, x: 130, y: 75, vx: -0.1, vy: 0.15, r: 5, isHub: true, label: "Science Syllabus" },
    // Spokes for Hub 2
    { id: 8, x: 110, y: 95, vx: 0.08, vy: -0.14, r: 2.5, label: "Physics" },
    { id: 9, x: 160, y: 85, vx: -0.15, vy: -0.08, r: 2.5, label: "Chemistry" },
    { id: 10, x: 150, y: 45, vx: 0.12, vy: 0.11, r: 2.5, label: "Biology" },
    { id: 11, x: 170, y: 65, vx: -0.11, vy: 0.13, r: 2.5, label: "Mock Tests" },
    { id: 12, x: 120, y: 30, vx: 0.09, vy: -0.12, r: 2.5, label: "Marking Scheme" },
    { id: 13, x: 140, y: 100, vx: -0.13, vy: 0.07, r: 2.5, label: "Revision Notes" }
  ]);

  useEffect(() => {
    if (reduced) return;

    let animId;
    const update = () => {
      setNodes(prev =>
        prev.map(n => {
          let nextX = n.x + n.vx * SPEED_FACTOR;
          let nextY = n.y + n.vy * SPEED_FACTOR;
          let nextVx = n.vx;
          let nextVy = n.vy;

          // Bounds: SVG is 200x120. Keep nodes inside 8 to 192 for X, and 8 to 112 for Y
          if (nextX < 8 || nextX > 192) {
            nextVx = -nextVx;
            nextX = n.x + nextVx * SPEED_FACTOR;
          }
          if (nextY < 8 || nextY > 112) {
            nextVy = -nextVy;
            nextY = n.y + nextVy * SPEED_FACTOR;
          }

          return { ...n, x: nextX, y: nextY, vx: nextVx, vy: nextVy };
        })
      );
      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [reduced]);

  return (
    <div 
      className="relative flex items-center justify-center w-full h-full"
      onClick={() => setSelectedNodeId(null)}
    >
      <svg viewBox="0 0 200 120" className="w-full h-full opacity-90" aria-hidden="true">
        {/* Draw edges */}
        {STRATEGIC_EDGES.map(([a, b], idx) => {
          const nodeA = nodes[a];
          const nodeB = nodes[b];
          if (!nodeA || !nodeB) return null;
          return (
            <line
              key={idx}
              x1={nodeA.x}
              y1={nodeA.y}
              x2={nodeB.x}
              y2={nodeB.y}
              stroke="rgba(165, 180, 252, 0.2)"
              strokeWidth="1.2"
            />
          );
        })}

        {/* Draw nodes */}
        {nodes.map(n => {
          const isSelected = n.id === selectedNodeId;
          return (
            <g
              key={n.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNodeId(prev => prev === n.id ? null : n.id);
              }}
              style={{ cursor: 'pointer' }}
            >
              {/* Invisible expanded hit target for better UX */}
              <circle
                cx={n.x}
                cy={n.y}
                r={3}
                fill="transparent"
              />
              {/* Visible circle */}
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r}
                fill={isSelected ? "#312e81" : (n.isHub ? "#c7d2fe" : "#a5b4fc")}
                strokeWidth={isSelected ? 2.5 : (n.isHub ? 1.5 : 1)}
                role="img"
                aria-label={n.label}
              >
                <title>{n.label}</title>
              </circle>
            </g>
          );
        })}

        {/* Active Node Tooltip Label */}
        {selectedNodeId !== null && (() => {
          const selNode = nodes.find(n => n.id === selectedNodeId);
          if (!selNode) return null;
          
          // Estimate half-width of the text to prevent overflow on X axis
          const halfWidth = (selNode.label.length * 3.8) / 2;
          const textX = Math.max(halfWidth + 4, Math.min(200 - halfWidth - 4, selNode.x));
          
          // Flip text label to the bottom of the node if it gets too close to the top boundary
          const isTooCloseToTop = selNode.y < 16;
          const textY = isTooCloseToTop ? selNode.y + selNode.r + 10 : selNode.y - selNode.r - 8;

          return (
            <motion.g 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            key="tooltip" style={{ pointerEvents: 'none', cursor: 'default' }}>
              {/* Tooltip Text */}
              <motion.text
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
                x={textX}
                y={textY}
                fill="#182c41ff"
                fontSize={7}
                fontWeight="500"
                fontFamily="Inter, sans-serif"
                textAnchor="middle"
                style={{ userSelect: 'none', cursor: 'default' }}
              >
                {selNode.label}
              </motion.text>
            </motion.g>
          );
        })()}
      </svg>
    </div>
  );
}
