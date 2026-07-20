import { useState } from "react";

// ── Organelle data ──────────────────────────────────────────────────────────────
const ORGANELLES = [
  {
    id: "membrane",
    name: "Cell Membrane",
    tagline: "Outer Boundary & Gatekeeper",
    color: "#4ade80",
    description: "A semi-permeable phospholipid bilayer that encloses the cell, controls transport of substances in and out, and communicates with the extracellular environment.",
    fact: "The cell membrane is only ~7-10 nm thick — about 10,000x thinner than a human hair.",
  },
  {
    id: "cytoplasm",
    name: "Cytoplasm",
    tagline: "Internal Cellular Fluid",
    color: "#7dd3fc",
    description: "The gel-like cytosol (~70% water) that fills the cell interior, suspending all organelles and providing the medium for most metabolic reactions.",
    fact: "The cytoplasm constantly streams — a process called cytoplasmic streaming — to distribute nutrients.",
  },
  {
    id: "nucleus",
    name: "Nucleus",
    tagline: "Control Centre & DNA Vault",
    color: "#f97316",
    description: "The largest organelle; houses the cell's DNA on 46 chromosomes and coordinates growth, metabolism, protein synthesis, and cell division.",
    fact: "If the DNA in one human cell was uncoiled, it would stretch approximately 2 metres long.",
  },
  {
    id: "nucleolus",
    name: "Nucleolus",
    tagline: "Ribosome Assembly Plant",
    color: "#fbbf24",
    description: "A dense region inside the nucleus that transcribes ribosomal RNA (rRNA) and assembles ribosomal subunits for export to the cytoplasm.",
    fact: "Cells actively making proteins have larger, more prominent nucleoli.",
  },
  {
    id: "mitochondria",
    name: "Mitochondria",
    tagline: "Powerhouse of the Cell",
    color: "#f87171",
    description: "Double-membraned organelles that generate ATP via cellular respiration. The inner membrane folds (cristae) dramatically increase surface area for reactions.",
    fact: "Mitochondria have their own DNA, inherited exclusively from the mother.",
  },
  {
    id: "golgi",
    name: "Golgi Apparatus",
    tagline: "Post Office & Processing Hub",
    color: "#4ade80",
    description: "A stack of flattened membranous sacs (cisternae) that receives proteins from the ER, modifies and packages them, then ships them via vesicles to their destination.",
    fact: "Named after Camillo Golgi who discovered it in 1897 — but scientists initially dismissed it as an artefact.",
  },
  {
    id: "er_rough",
    name: "Rough ER",
    tagline: "Protein Manufacturing Line",
    color: "#60a5fa",
    description: "Endoplasmic Reticulum studded with ribosomes. It folds and processes newly made proteins before shipping them to the Golgi Apparatus.",
    fact: "The 'rough' texture comes from thousands of ribosomes attached to its surface.",
  },
  {
    id: "er_smooth",
    name: "Smooth ER",
    tagline: "Lipid & Detox Factory",
    color: "#818cf8",
    description: "Endoplasmic Reticulum without ribosomes. Synthesises lipids, steroids, and phospholipids; also detoxifies drugs and stores calcium ions.",
    fact: "Liver cells are packed with Smooth ER — it helps break down alcohol and medications.",
  },
  {
    id: "lysosome",
    name: "Lysosome",
    tagline: "Cellular Waste Recycler",
    color: "#c084fc",
    description: "Small, spherical vesicles packed with hydrolytic enzymes. They digest worn-out organelles, cellular debris, and foreign particles in a process called autophagy.",
    fact: "Lysosomes maintain an internal pH of ~4.5 — acidic enough to degrade almost any biological molecule.",
  },
  {
    id: "ribosome",
    name: "Ribosomes",
    tagline: "Protein Builders",
    color: "#facc15",
    description: "Tiny two-subunit machines that translate mRNA into proteins. Found free in the cytoplasm or bound to the Rough ER.",
    fact: "A single human cell can contain up to 10 million ribosomes.",
  },
  {
    id: "peroxisome",
    name: "Peroxisome",
    tagline: "H2O2 Neutraliser",
    color: "#fb923c",
    description: "Small organelles that break down fatty acids and detoxify harmful compounds (e.g., alcohol). They produce and then immediately destroy H2O2 using catalase.",
    fact: "Peroxisomes are named after the hydrogen peroxide (H2O2) they produce and decompose.",
  },
  {
    id: "centriole",
    name: "Centriole",
    tagline: "Division Coordinator",
    color: "#e3b341",
    description: "A pair of perpendicular cylindrical structures that organise the mitotic spindle during cell division, ensuring chromosomes are distributed equally.",
    fact: "Centrioles are absent in plant cells — plants use different mechanisms to form spindle fibres.",
  },
];

const DATA = Object.fromEntries(ORGANELLES.map(o => [o.id, o]));

const CX = 250, CY = 248, CELL_RX = 200, CELL_RY = 168;

const LABEL_CONFIGS = [
  { id: "membrane",     lx: 440, ly: 135, tx: "right", ax: 395, ay: 165 },
  { id: "cytoplasm",    lx: 58,  ly: 350, tx: "left",  ax: 135, ay: 308 },
  { id: "nucleus",      lx: 58,  ly: 200, tx: "left",  ax: 186, ay: 232 },
  { id: "nucleolus",    lx: 58,  ly: 235, tx: "left",  ax: 209, ay: 242 },
  { id: "mitochondria", lx: 440, ly: 345, tx: "right", ax: 355, ay: 325 },
  { id: "golgi",        lx: 440, ly: 170, tx: "right", ax: 348, ay: 182 },
  { id: "er_rough",     lx: 440, ly: 295, tx: "right", ax: 358, ay: 282 },
  { id: "er_smooth",    lx: 440, ly: 240, tx: "right", ax: 395, ay: 238 },
  { id: "lysosome",     lx: 58,  ly: 390, tx: "left",  ax: 158, ay: 360 },
  { id: "ribosome",     lx: 440, ly: 408, tx: "right", ax: 298, ay: 392 },
  { id: "peroxisome",   lx: 58,  ly: 290, tx: "left",  ax: 138, ay: 310 },
  { id: "centriole",    lx: 58,  ly: 140, tx: "left",  ax: 143, ay: 168 },
];

export default function InteractiveAnimalCell() {
  const [activeId, setActiveId] = useState("nucleus");
  const [hoveredId, setHoveredId] = useState(null);

  const currentId   = hoveredId || activeId;
  const currentData = DATA[currentId] || DATA.nucleus;

  const isHighlit = id => id === activeId || id === hoveredId;

  const orgProps = id => ({
    onClick:      () => setActiveId(id),
    onMouseEnter: () => setHoveredId(id),
    onMouseLeave: () => setHoveredId(null),
    style: { cursor: "pointer" },
  });

  return (
    <div style={{
      display: "flex", width: "100%", height: "100%", minHeight: 0,
      background: "transparent", color: "#f1f5f9",
      fontFamily: "'Inter','Segoe UI',sans-serif", overflow: "hidden",
    }}>
      <div style={{
        display: "flex", flex: 1, minHeight: 0, gap: "16px",
        padding: "16px", overflow: "hidden",
      }}>

        {/* SVG Diagram */}
        <div style={{ flex: "0 0 auto", width: "500px", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg viewBox="0 0 500 500" width="500" height="500"
            style={{ display: "block", userSelect: "none", overflow: "visible" }}
            xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="ng" cx="38%" cy="35%" r="55%">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="45%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#c2410c" stopOpacity="0.9" />
              </radialGradient>
              <radialGradient id="nlg" cx="35%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="100%" stopColor="#d97706" />
              </radialGradient>
              <radialGradient id="cyg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,240,180,0.11)" />
                <stop offset="100%" stopColor="rgba(255,200,80,0.03)" />
              </radialGradient>
              <linearGradient id="mg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fca5a5" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>

            {/* Callout lines and labels */}
            {LABEL_CONFIGS.map(({ id, lx, ly, tx, ax, ay }) => {
              const info = DATA[id];
              const hl = isHighlit(id);
              return (
                <g key={id} {...orgProps(id)} opacity={hl ? 1 : 0.5}
                  style={{ cursor: "pointer", transition: "opacity 0.2s" }}>
                  <line x1={ax} y1={ay} x2={lx + (tx === "right" ? -5 : 5)} y2={ly}
                    stroke={hl ? info.color : "#475569"}
                    strokeWidth={hl ? 1.5 : 1}
                    strokeDasharray={hl ? "" : "3 3"} />
                  <text x={lx} y={ly + 4}
                    textAnchor={tx === "right" ? "end" : "start"}
                    fontSize="11" fontWeight={hl ? "700" : "500"}
                    fill={hl ? info.color : "#94a3b8"}
                    style={{ transition: "fill 0.2s", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
                    {info.name}
                  </text>
                </g>
              );
            })}

            {/* Cytoplasm fill */}
            <ellipse cx={CX} cy={CY} rx={CELL_RX} ry={CELL_RY}
              fill="url(#cyg)"
              stroke={isHighlit("cytoplasm") ? "#7dd3fc" : "none"}
              strokeWidth={isHighlit("cytoplasm") ? 3 : 0}
              {...orgProps("cytoplasm")} />

            {/* Cell Membrane */}
            <ellipse cx={CX} cy={CY} rx={CELL_RX} ry={CELL_RY}
              fill="none"
              stroke={isHighlit("membrane") ? "#4ade80" : "#16a34a"}
              strokeWidth={isHighlit("membrane") ? 8 : 5}
              style={{ filter: isHighlit("membrane") ? "drop-shadow(0 0 8px #4ade80)" : "none", transition: "all 0.2s", cursor: "pointer" }}
              {...orgProps("membrane")} />

            {/* Rough ER */}
            <g {...orgProps("er_rough")}>
              {[0,13,26,39].map((dy, i) => (
                <g key={i}>
                  <path d={`M ${290-i*2},${264+dy} C ${312},${256+dy} ${342},${270+dy} ${360},${264+dy} C ${370},${267+dy} ${382},${258+dy} ${396},${264+dy}`}
                    fill={`rgba(96,165,250,${0.08+i*0.04})`}
                    stroke={isHighlit("er_rough") ? "#60a5fa" : "#3b82f6"}
                    strokeWidth={isHighlit("er_rough") ? 2.5 : 1.8}
                    style={{ filter: isHighlit("er_rough") ? "drop-shadow(0 0 5px #60a5fa)" : "none", transition: "all 0.2s" }} />
                  {[295,310,325,340,355,370,385].map((rx2, j) => (
                    <circle key={j} cx={rx2} cy={264+dy-4} r="3.5"
                      fill={isHighlit("ribosome") ? "#facc15" : "#ca8a04"}
                      opacity={isHighlit("ribosome") ? 1 : 0.7}
                      {...orgProps("ribosome")} />
                  ))}
                </g>
              ))}
            </g>

            {/* Smooth ER */}
            <g {...orgProps("er_smooth")}>
              {[
                "M 356,198 C 376,183 402,193 416,208 C 402,220 376,214 356,198",
                "M 350,218 C 372,203 401,213 418,228 C 401,242 370,236 350,218",
                "M 348,238 C 370,224 399,233 417,248 C 399,262 368,256 348,238",
              ].map((d, i) => (
                <path key={i} d={d}
                  fill={`rgba(129,140,248,${0.14+i*0.06})`}
                  stroke={isHighlit("er_smooth") ? "#818cf8" : "#6366f1"}
                  strokeWidth={isHighlit("er_smooth") ? 2.5 : 1.8}
                  style={{ filter: isHighlit("er_smooth") ? "drop-shadow(0 0 5px #818cf8)" : "none", transition: "all 0.2s" }} />
              ))}
            </g>

            {/* Golgi Apparatus */}
            <g {...orgProps("golgi")}>
              {[0,11,21,30].map((dy, i) => {
                const w = 54 - i * 7, ox = 296 + i * 2, oy = 150 + i * 12;
                return (
                  <path key={i}
                    d={`M ${ox},${oy} Q ${ox+w/2},${oy-9} ${ox+w},${oy} Q ${ox+w+7},${oy+6} ${ox+w},${oy+9} Q ${ox+w/2},${oy} ${ox},${oy+9} Q ${ox-7},${oy+3} ${ox},${oy} Z`}
                    fill={`rgba(74,222,128,${0.18+i*0.08})`}
                    stroke={isHighlit("golgi") ? "#4ade80" : "#16a34a"}
                    strokeWidth={isHighlit("golgi") ? 1.8 : 1.3}
                    style={{ filter: isHighlit("golgi") ? "drop-shadow(0 0 7px #4ade80)" : "none", transition: "all 0.2s" }} />
                );
              })}
              {[[294,150],[356,215]].map(([bx,by],i) => (
                <circle key={i} cx={bx} cy={by} r="6"
                  fill="rgba(74,222,128,0.3)" stroke={isHighlit("golgi") ? "#4ade80" : "#16a34a"} strokeWidth="1.5" />
              ))}
            </g>

            {/* Mitochondria */}
            {[
              { cx: 165, cy: 330, w: 48, h: 23, angle: 20 },
              { cx: 400, cy: 362, w: 42, h: 20, angle: -15 },
              { cx: 104, cy: 200, w: 40, h: 19, angle: -35 },
            ].map((m, i) => (
              <g key={i} transform={`rotate(${m.angle},${m.cx},${m.cy})`} {...orgProps("mitochondria")}>
                <ellipse cx={m.cx} cy={m.cy} rx={m.w} ry={m.h}
                  fill="url(#mg)" fillOpacity={isHighlit("mitochondria") ? 0.55 : 0.38}
                  stroke={isHighlit("mitochondria") ? "#f87171" : "#ef4444"}
                  strokeWidth={isHighlit("mitochondria") ? 2.5 : 1.8}
                  style={{ filter: isHighlit("mitochondria") ? "drop-shadow(0 0 6px #f87171)" : "none", transition: "all 0.2s" }} />
                <ellipse cx={m.cx} cy={m.cy} rx={m.w*0.76} ry={m.h*0.65}
                  fill="none" stroke="rgba(254,202,202,0.35)" strokeWidth="1" />
                {[-m.w*0.38, 0, m.w*0.38].map((dx, j) => (
                  <path key={j}
                    d={`M ${m.cx+dx},${m.cy-m.h*0.55} C ${m.cx+dx+5},${m.cy-m.h*0.15} ${m.cx+dx-5},${m.cy+m.h*0.15} ${m.cx+dx},${m.cy+m.h*0.55}`}
                    fill="none" stroke="rgba(254,202,202,0.55)" strokeWidth="1.5" />
                ))}
              </g>
            ))}

            {/* Lysosomes */}
            {[[155,358,12],[338,402,10],[110,276,10]].map(([lx,ly,lr],i) => (
              <g key={i} {...orgProps("lysosome")}>
                <circle cx={lx} cy={ly} r={lr}
                  fill={isHighlit("lysosome") ? "rgba(192,132,252,0.55)" : "rgba(167,88,220,0.35)"}
                  stroke={isHighlit("lysosome") ? "#c084fc" : "#9333ea"}
                  strokeWidth={isHighlit("lysosome") ? 2 : 1.5}
                  style={{ filter: isHighlit("lysosome") ? "drop-shadow(0 0 5px #c084fc)" : "none", transition: "all 0.2s" }} />
                <circle cx={lx} cy={ly} r="2.5" fill="rgba(233,213,255,0.7)" />
              </g>
            ))}

            {/* Peroxisomes */}
            {[[130,312,10],[205,398,9]].map(([px,py,pr],i) => (
              <g key={i} {...orgProps("peroxisome")}>
                <circle cx={px} cy={py} r={pr}
                  fill={isHighlit("peroxisome") ? "rgba(251,191,36,0.5)" : "rgba(217,119,6,0.35)"}
                  stroke={isHighlit("peroxisome") ? "#fbbf24" : "#d97706"}
                  strokeWidth={isHighlit("peroxisome") ? 2 : 1.5}
                  style={{ filter: isHighlit("peroxisome") ? "drop-shadow(0 0 5px #fbbf24)" : "none", transition: "all 0.2s" }} />
                <circle cx={px} cy={py} r="2.5" fill="rgba(254,243,199,0.75)" />
              </g>
            ))}

            {/* Centriole */}
            <g {...orgProps("centriole")}>
              <rect x="130" y="158" width="28" height="11" rx="5.5"
                fill={isHighlit("centriole") ? "rgba(227,179,65,0.7)" : "rgba(217,119,6,0.45)"}
                stroke={isHighlit("centriole") ? "#e3b341" : "#b45309"}
                strokeWidth={isHighlit("centriole") ? 2 : 1.5}
                transform="rotate(-20,144,163)"
                style={{ filter: isHighlit("centriole") ? "drop-shadow(0 0 5px #e3b341)" : "none", transition: "all 0.2s" }} />
              <rect x="138" y="165" width="28" height="11" rx="5.5"
                fill={isHighlit("centriole") ? "rgba(227,179,65,0.7)" : "rgba(217,119,6,0.45)"}
                stroke={isHighlit("centriole") ? "#e3b341" : "#b45309"}
                strokeWidth={isHighlit("centriole") ? 2 : 1.5}
                transform="rotate(70,152,170)"
                style={{ filter: isHighlit("centriole") ? "drop-shadow(0 0 5px #e3b341)" : "none", transition: "all 0.2s" }} />
              {[-30,-10,10,30,50].map((deg,i) => {
                const rad = (deg - 90) * Math.PI / 180;
                return (
                  <line key={i} x1={148} y1={170}
                    x2={148+Math.cos(rad)*42} y2={170+Math.sin(rad)*42}
                    stroke={isHighlit("centriole") ? "rgba(227,179,65,0.55)" : "rgba(180,130,30,0.28)"}
                    strokeWidth="1.2" strokeDasharray="3 2" />
                );
              })}
            </g>

            {/* Scattered ribosomes */}
            {[[292,392],[310,402],[328,398],[268,380],[248,395],[168,296],[192,378],[222,362]].map(([rx2,ry2],i) => (
              <g key={i} {...orgProps("ribosome")}>
                <circle cx={rx2} cy={ry2} r="4"
                  fill={isHighlit("ribosome") ? "#facc15" : "#ca8a04"}
                  style={{ filter: isHighlit("ribosome") ? "drop-shadow(0 0 4px #facc15)" : "none", transition: "all 0.2s" }} />
                <circle cx={rx2+3} cy={ry2-3} r="2.5" fill={isHighlit("ribosome") ? "#fde68a" : "#a16207"} opacity="0.8" />
              </g>
            ))}

            {/* Nucleus */}
            <g {...orgProps("nucleus")}>
              <circle cx={CX} cy={CY} r="78" fill="url(#ng)"
                fillOpacity={isHighlit("nucleus") ? 1 : 0.88}
                stroke={isHighlit("nucleus") ? "#f97316" : "#ea580c"}
                strokeWidth={isHighlit("nucleus") ? 3 : 2}
                style={{ filter: isHighlit("nucleus") ? "drop-shadow(0 0 12px rgba(249,115,22,0.6))" : "none", transition: "all 0.2s" }} />
              <circle cx={CX} cy={CY} r="72" fill="none" stroke="rgba(254,215,170,0.3)" strokeWidth="1.5" />
              {Array.from({length:10},(_,i) => {
                const a = (i/10)*Math.PI*2;
                return <circle key={i} cx={CX+Math.cos(a)*78} cy={CY+Math.sin(a)*78}
                  r="3.5" fill="rgba(12,8,4,0.65)" stroke="rgba(249,115,22,0.7)" strokeWidth="1.2" />;
              })}
            </g>

            {/* Nucleolus */}
            <g {...orgProps("nucleolus")}>
              <circle cx={CX+16} cy={CY-10} r="26" fill="url(#nlg)"
                fillOpacity={isHighlit("nucleolus") ? 0.95 : 0.82}
                stroke={isHighlit("nucleolus") ? "#fbbf24" : "#d97706"}
                strokeWidth={isHighlit("nucleolus") ? 2.5 : 1.5}
                style={{ filter: isHighlit("nucleolus") ? "drop-shadow(0 0 8px rgba(251,191,36,0.7))" : "none", transition: "all 0.2s" }} />
            </g>
          </svg>

          <div style={{
            position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)",
            background: "rgba(15,23,42,0.85)", border: "1px solid rgba(100,116,139,0.4)",
            backdropFilter: "blur(8px)", borderRadius: "999px",
            padding: "4px 14px", fontSize: "11px", color: "#94a3b8",
            whiteSpace: "nowrap", pointerEvents: "none",
          }}>
            Click or hover over an organelle to learn more
          </div>
        </div>

        {/* Info Panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px", overflow: "hidden", minWidth: 0 }}>

          {/* Header card */}
          <div style={{
            background: "rgba(15,23,42,0.85)",
            border: `1px solid ${currentData.color}40`,
            borderRadius: "14px", padding: "20px",
            boxShadow: `0 0 22px ${currentData.color}18`,
            transition: "all 0.25s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span style={{
                width: "10px", height: "10px", borderRadius: "50%",
                background: currentData.color, boxShadow: `0 0 8px ${currentData.color}`,
                flexShrink: 0,
              }} />
              <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b" }}>
                {currentData.tagline}
              </span>
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 10px" }}>
              {currentData.name}
            </h2>
            <p style={{ fontSize: "13.5px", color: "#94a3b8", lineHeight: 1.65, margin: 0 }}>
              {currentData.description}
            </p>
          </div>

          {/* Fun fact card */}
          <div style={{
            background: `linear-gradient(135deg, ${currentData.color}12, rgba(15,23,42,0.6))`,
            border: `1px solid ${currentData.color}30`,
            borderRadius: "12px", padding: "14px 18px",
            transition: "all 0.25s ease",
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: currentData.color, marginBottom: "6px" }}>
              Did you know?
            </div>
            <p style={{ fontSize: "12.5px", color: "#cbd5e1", lineHeight: 1.6, margin: 0 }}>
              {currentData.fact}
            </p>
          </div>

          {/* Organelle selector grid */}
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: "8px", minHeight: 0 }}>
            <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#475569" }}>
              All Organelles
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "6px",
              overflowY: "auto", paddingRight: "4px",
            }}>
              {ORGANELLES.map(o => {
                const selected = activeId === o.id;
                return (
                  <button key={o.id}
                    onClick={() => setActiveId(o.id)}
                    onMouseEnter={() => setHoveredId(o.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "7px 10px", borderRadius: "8px",
                      border: `1px solid ${selected ? o.color+"60" : "rgba(51,65,85,0.5)"}`,
                      background: selected ? `${o.color}18` : "rgba(15,23,42,0.5)",
                      color: selected ? o.color : "#64748b",
                      fontSize: "12px", fontWeight: selected ? 600 : 400,
                      cursor: "pointer", textAlign: "left",
                      transition: "all 0.15s ease", outline: "none",
                    }}>
                    <span style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: o.color, flexShrink: 0,
                      boxShadow: selected ? `0 0 6px ${o.color}` : "none",
                    }} />
                    <span style={{ lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {o.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
