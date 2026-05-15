import { useState, useEffect, useRef, useCallback } from "react";

// Fotos de ingeniería via Picsum (funcionan sin restricciones CORS)
const ENGINEERING_PHOTOS = [
  { src: "https://picsum.photos/seed/steel1/900/500",    label: "Estructura metálica" },
  { src: "https://picsum.photos/seed/construct2/900/500", label: "Obra en altura" },
  { src: "https://picsum.photos/seed/bridge3/900/500",   label: "Ingeniería civil" },
  { src: "https://picsum.photos/seed/weld4/900/500",     label: "Soldadura" },
  { src: "https://picsum.photos/seed/scaffold5/900/500", label: "Andamiaje" },
  { src: "https://picsum.photos/seed/concrete6/900/500", label: "Hormigón armado" },
];

function PhotoSlider({ accent, steel }) {
  const [open, setOpen] = useState(null); // índice de la foto abierta, null = cerrado

  return (
    <div style={{ width: "100%", maxWidth: "760px", display: "flex", flexDirection: "column", height: "calc(100vh - 160px)", gap: "16px" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
        <div style={{ width:"28px", height:"1.5px", background:accent }}/>
        <span style={{ fontFamily:"'Courier New', monospace", fontSize:"10px", letterSpacing:"0.16em", color:accent, textTransform:"uppercase" }}>La obra en marcha</span>
      </div>

      {/* Grid de thumbnails */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"8px", flex:1, minHeight:0 }}>
        {ENGINEERING_PHOTOS.map((p, i) => (
          <div key={i} onClick={() => setOpen(i)} style={{
            position:"relative", cursor:"pointer", overflow:"hidden",
            border: `1px solid ${steel}33`,
            transition:"border-color 0.3s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = accent}
            onMouseLeave={e => e.currentTarget.style.borderColor = `${steel}33`}
          >
            <img src={p.src} alt={p.label} style={{
              width:"100%", height:"100%", objectFit:"cover", display:"block",
              opacity: 0.7, transition:"opacity 0.3s",
            }}
              onMouseEnter={e => e.target.style.opacity = 1}
              onMouseLeave={e => e.target.style.opacity = 0.7}
            />
            <div style={{
              position:"absolute", inset:0, pointerEvents:"none",
              background:"linear-gradient(to top, #000000bb 0%, transparent 60%)",
            }}/>
            <div style={{
              position:"absolute", bottom:"8px", left:"10px",
              fontFamily:"'Courier New', monospace", fontSize:"9px",
              letterSpacing:"0.14em", color:"#ffffffaa",
            }}>{p.label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ fontFamily:"'Courier New', monospace", fontSize:"10px", color:steel, letterSpacing:"0.1em", opacity:0.5, display:"flex", gap:"1rem", flexShrink:0 }}>
        <span>NIV. 02</span><span>+7.00 m</span><span>COTA ±0.00</span>
      </div>

      {/* Lightbox */}
      {open !== null && (
        <div onClick={() => setOpen(null)} style={{
          position:"fixed", inset:0, zIndex:100,
          background:"#000000cc",
          display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"zoom-out",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            position:"relative", maxWidth:"90vw", maxHeight:"90vh",
            border:`1px solid ${steel}55`,
          }}>
            {/* Esquinas */}
            {[[0,0],[1,0],[0,1],[1,1]].map(([r,b], i) => (
              <div key={i} style={{
                position:"absolute", zIndex:3,
                top: b===0 ? 0 : "auto", bottom: b===1 ? 0 : "auto",
                left: r===0 ? 0 : "auto", right: r===1 ? 0 : "auto",
                width:"16px", height:"16px",
                borderTop:    b===0 ? `2px solid ${accent}` : "none",
                borderBottom: b===1 ? `2px solid ${accent}` : "none",
                borderLeft:   r===0 ? `2px solid ${accent}` : "none",
                borderRight:  r===1 ? `2px solid ${accent}` : "none",
              }} />
            ))}
            <img src={ENGINEERING_PHOTOS[open].src} alt={ENGINEERING_PHOTOS[open].label} style={{
              display:"block", maxWidth:"90vw", maxHeight:"90vh", objectFit:"contain",
            }} />
            {/* Caption */}
            <div style={{
              position:"absolute", bottom:"12px", left:"14px",
              fontFamily:"'Courier New', monospace", fontSize:"10px",
              letterSpacing:"0.18em", color:"#ffffffaa",
            }}>{ENGINEERING_PHOTOS[open].label}</div>
            {/* Cerrar */}
            <button onClick={() => setOpen(null)} style={{
              position:"absolute", top:"10px", right:"10px",
              background:"transparent", border:`1px solid ${steel}66`,
              color:"#ffffff99", width:"26px", height:"26px",
              cursor:"pointer", fontFamily:"monospace", fontSize:"14px",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>×</button>
            {/* Prev / Next */}
            {open > 0 && (
              <button onClick={() => setOpen(open - 1)} style={{
                position:"absolute", left:"10px", top:"50%", transform:"translateY(-50%)",
                background:"#00000088", border:`1px solid ${steel}66`,
                color:"#ffffffcc", width:"32px", height:"32px", cursor:"pointer",
                fontFamily:"serif", fontSize:"20px", display:"flex", alignItems:"center", justifyContent:"center",
              }}>‹</button>
            )}
            {open < ENGINEERING_PHOTOS.length - 1 && (
              <button onClick={() => setOpen(open + 1)} style={{
                position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)",
                background:"#00000088", border:`1px solid ${steel}66`,
                color:"#ffffffcc", width:"32px", height:"32px", cursor:"pointer",
                fontFamily:"serif", fontSize:"20px", display:"flex", alignItems:"center", justifyContent:"center",
              }}>›</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const TOTAL = 8;
const FLOOR_HEIGHT = 220;
const ANIM_MS = 850;

const floors = [
  { number: 8, label: "ÁTICO",   title: "Visión",       subtitle: "Donde todo comienza",      description: "Cada gran proyecto nace de una idea en las alturas. Diseñamos el futuro desde la perspectiva más amplia.", accent: "#c8a96e", bg: "#0c0a06", text: "#f5edd8", steel: "#6a5a3a" },
  { number: 7, label: "PISO 7",  title: "Estructuras",  subtitle: "La columna vertebral",     description: "Calculamos cargas, tensiones y momentos. Cada viga responde a fuerzas que el ojo no ve pero la física nunca olvida.", accent: "#7ab0d4", bg: "#050810", text: "#d8eaf5", steel: "#2a4a6a" },
  { number: 6, label: "PISO 6",  title: "Fundaciones",  subtitle: "Lo que sostiene todo",     description: "El suelo habla si sabés escucharlo. Estudiamos cada estrato para que lo que construimos dure generaciones.", accent: "#b87a5a", bg: "#100806", text: "#f5e0d8", steel: "#6a3a2a" },
  { number: 5, label: "PISO 5",  title: "Hidráulica",   subtitle: "El flujo como ingeniería", description: "El agua sigue leyes exactas. Diseñamos redes, drenajes y sistemas que respetan cada milímetro de presión.", accent: "#5a9ab0", bg: "#05090e", text: "#d8eef5", steel: "#2a5a6a" },
  { number: 4, label: "PISO 4",  title: "Materiales",   subtitle: "Elegir con precisión",     description: "Acero, hormigón, compuestos. Cada material tiene un propósito; equivocarse en la elección no es una opción.", accent: "#9a9a7a", bg: "#090906", text: "#f0f0e0", steel: "#5a5a3a" },
  { number: 3, label: "PISO 3",  title: "Proyecto",     subtitle: "Del plano a la realidad",  description: "La documentación técnica es el lenguaje entre la idea y la obra. Cada plano es una instrucción sin ambigüedad.", accent: "#8a7ac8", bg: "#07060e", text: "#e4d8f5", steel: "#3a3a6a" },
  { number: 2, label: "PISO 2",  title: "Construcción", subtitle: "La obra en marcha",        description: "Supervisamos cada etapa. La ingeniería no termina en el escritorio; vive y respira en el sitio de obra.", accent: "#7ab87a", bg: "#050e05", text: "#d8f5d8", steel: "#2a5a2a" },
  { number: 1, label: "P. BAJA", title: "Contacto",     subtitle: "Tu proyecto empieza aquí", description: "Estudio de ingeniería con más de 20 años de experiencia. Contanos tu desafío y lo convertimos en estructura.", accent: "#c0c0c0", bg: "#080808", text: "#f5f5f5", steel: "#5a5a5a" },
];

// ─── COLORES FIJOS DEL ASCENSOR (acero, no cambian con el piso) ───────────────
const CS  = "#7a8a8a";   // acero medio
const CD  = "#4a5858";   // ala / flange oscuro
const CR  = "#9aaaaa";   // roblón
const CA  = "#b0c4c4";   // highlight frío

// ─── SHAFT: esquema del ascensor (panel izquierdo) ────────────────────────────
const VB_W = 380;       // expandido: 200 shaft + 180 nombres
const VB_H = 700;
const SHAFT_TOP = 35;
const SHAFT_BOT = 665;
const SHAFT_H   = SHAFT_BOT - SHAFT_TOP;
const FLOOR_H_S = SHAFT_H / (TOTAL - 1);
const CAB_W = 74;
const CAB_H = 50;
const CAB_X = 63;       // fijo: era (200-74)/2
const SHAFT_CX = 100;   // centro del shaft (era VB_W/2 cuando VB_W=200)
const CW_X = 160;       // contrapeso fijo (era VB_W-18=182)

function shaftY(idx) { return SHAFT_TOP + idx * FLOOR_H_S; }

function ElevatorShaft({ current, arrived, go, accent }) {
  const cabinY = shaftY(current) - CAB_H / 2;
  const cwY    = SHAFT_H - (cabinY - SHAFT_TOP) + SHAFT_TOP;

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ width: "100%", height: "100%", display: "block" }}
      xmlns="http://www.w3.org/2000/svg">

      <defs>
        <filter id="neon" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur1" />
          <feGaussianBlur stdDeviation="6" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Shaft wall hints */}
      <rect x={CAB_X - 24} y={SHAFT_TOP - 12} width="2" height={SHAFT_H + 24} fill={CS} fillOpacity="0.1" />
      <rect x={CAB_X + CAB_W + 22} y={SHAFT_TOP - 12} width="2" height={SHAFT_H + 24} fill={CS} fillOpacity="0.1" />

      {/* Pulley at top */}
      <circle cx={SHAFT_CX} cy={SHAFT_TOP - 16} r="9" fill="none" stroke={CR} strokeWidth="1.5" strokeOpacity="0.55" />
      <circle cx={SHAFT_CX} cy={SHAFT_TOP - 16} r="3.5" fill={CR} fillOpacity="0.45" />

      {/* Guide rails */}
      <rect x={CAB_X - 11} y={SHAFT_TOP - 12} width="5" height={SHAFT_H + 24} fill={CS} fillOpacity="0.5" />
      <rect x={CAB_X - 14} y={SHAFT_TOP - 12} width="3" height={SHAFT_H + 24} fill={CD} fillOpacity="0.4" />
      <rect x={CAB_X + CAB_W + 6} y={SHAFT_TOP - 12} width="5" height={SHAFT_H + 24} fill={CS} fillOpacity="0.5" />
      <rect x={CAB_X + CAB_W + 11} y={SHAFT_TOP - 12} width="3" height={SHAFT_H + 24} fill={CD} fillOpacity="0.4" />

      {/* Cables */}
      <rect x={SHAFT_CX - 11} y={SHAFT_TOP - 7} width="1.4" height={cabinY - (SHAFT_TOP - 7)}
        fill={CS} fillOpacity="0.6"
        style={{ transition: `height ${ANIM_MS}ms cubic-bezier(0.33,1,0.68,1)` }} />
      <rect x={SHAFT_CX + 10} y={SHAFT_TOP - 7} width="1.4" height={cabinY - (SHAFT_TOP - 7)}
        fill={CS} fillOpacity="0.6"
        style={{ transition: `height ${ANIM_MS}ms cubic-bezier(0.33,1,0.68,1)` }} />

      {/* Counterweight */}
      <g style={{ transform: `translateY(${cwY - SHAFT_TOP}px)`, transition: `transform ${ANIM_MS}ms cubic-bezier(0.33,1,0.68,1)` }}>
        <line x1={CW_X} y1={SHAFT_TOP} x2={CW_X} y2={SHAFT_TOP - 10} stroke={CS} strokeWidth="1.2" strokeOpacity="0.45" />
        <rect x={CW_X - 8} y={SHAFT_TOP} width="16" height="26" rx="1"
          fill={CD} fillOpacity="0.3" stroke={CS} strokeWidth="0.8" strokeOpacity="0.45" />
        <line x1={CW_X - 8} y1={SHAFT_TOP + 13} x2={CW_X + 8} y2={SHAFT_TOP + 13}
          stroke={CS} strokeWidth="0.5" strokeOpacity="0.3" />
      </g>

      {/* Floor beams & labels */}
      {floors.map((f, i) => {
        const y = shaftY(i);
        const active = i === current;
        return (
          <g key={i} onClick={() => go(i)} style={{ cursor: "pointer" }}>
            <rect x="0" y={y - FLOOR_H_S / 2} width={VB_W} height={FLOOR_H_S} fill="transparent" />
            <rect x={CAB_X - 19} y={y - 3} width={CAB_W + 38} height="6"
              fill={CS} fillOpacity="0.18" />
            <circle cx={CAB_X - 16} cy={y} r="2.5" fill={CR} fillOpacity={i === arrived ? 0.85 : 0.3} />
            <circle cx={CAB_X + CAB_W + 16} cy={y} r="2.5" fill={CR} fillOpacity={i === arrived ? 0.85 : 0.3} />
            <text x="13" y={y + 4} fontFamily="'Courier New', monospace" fontSize="8"
              fill={i === arrived ? CA : CS} fillOpacity={i === arrived ? 1 : 0.35}
              letterSpacing="0.5" textAnchor="middle">
              {String(f.number).padStart(2, "0")}
            </text>
            {i === arrived && <line x1="185" y1={y} x2="198" y2={y} stroke={accent} strokeWidth="1.5" strokeOpacity="0.9" />}
            <text x="202" y={y + 5} fontFamily="'Courier New', monospace" fontSize="14"
              fill={i === arrived ? accent : "#ffffff"}
              fillOpacity={i === arrived ? 1 : 0.45}
              filter={i === arrived ? "url(#neon)" : undefined}
              letterSpacing="0.8" textAnchor="start">
              {f.title.toUpperCase()}
            </text>
          </g>
        );
      })}

      {/* Cabin (animated) */}
      <g style={{ transform: `translateY(${cabinY}px)`, transition: `transform ${ANIM_MS}ms cubic-bezier(0.33,1,0.68,1)` }}>
        <rect x={CAB_X} y={0} width={CAB_W} height={CAB_H} rx="2"
          fill={CD} fillOpacity="0.55" stroke={CA} strokeWidth="1.4" strokeOpacity="0.75" />
        <rect x={CAB_X - 5} y={-5} width={CAB_W + 10} height="7" rx="1" fill={CS} fillOpacity="0.8" />
        <rect x={CAB_X - 3} y={CAB_H - 2} width={CAB_W + 6} height="5" rx="1" fill={CS} fillOpacity="0.7" />
        <rect x={CAB_X + 2} y={2} width="4" height={CAB_H - 4} fill={CS} fillOpacity="0.2" />
        <rect x={CAB_X + CAB_W - 6} y={2} width="4" height={CAB_H - 4} fill={CS} fillOpacity="0.2" />
        <line x1={SHAFT_CX} y1={4} x2={SHAFT_CX} y2={CAB_H - 5}
          stroke={CS} strokeWidth="1" strokeOpacity="0.45" strokeDasharray="3 3" />
        <rect x={CAB_X + 8} y={6} width={CAB_W / 2 - 12} height={CAB_H - 14} rx="1"
          fill="none" stroke={CS} strokeWidth="0.6" strokeOpacity="0.4" />
        <rect x={SHAFT_CX + 4} y={6} width={CAB_W / 2 - 12} height={CAB_H - 14} rx="1"
          fill="none" stroke={CS} strokeWidth="0.6" strokeOpacity="0.4" />
        <rect x={CAB_X + CAB_W / 2 - 11} y={8} width="22" height="13" rx="1"
          fill="#050505" fillOpacity="0.8" stroke={CA} strokeWidth="0.6" strokeOpacity="0.6" />
        <text x={SHAFT_CX} y={19} fontFamily="'Courier New', monospace" fontSize="8" fontWeight="bold"
          fill={CA} fillOpacity="0.95" textAnchor="middle">
          {String(floors[current].number).padStart(2, "0")}
        </text>
        {[8, CAB_H - 18].map(dy => (
          <g key={dy}>
            <rect x={CAB_X - 8} y={dy} width="8" height="10" rx="1" fill={CS} fillOpacity="0.6" />
            <rect x={CAB_X + CAB_W} y={dy} width="8" height="10" rx="1" fill={CS} fillOpacity="0.6" />
          </g>
        ))}
        {[[CAB_X+5,5],[CAB_X+CAB_W-5,5],[CAB_X+5,CAB_H-6],[CAB_X+CAB_W-5,CAB_H-6]].map(([cx,cy],i)=>(
          <g key={i}>
            <circle cx={cx} cy={cy} r="2.2" fill={CR} fillOpacity="0.6"/>
            <circle cx={cx} cy={cy} r="0.9" fill={CR} fillOpacity="0.9"/>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ─── FONDO: estructura metálica que scrollea ──────────────────────────────────
function SteelWorld({ offsetY, steel }) {
  const sections = TOTAL + 3;
  const W = 1400;

  return (
    <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      viewBox={`0 0 ${W} 800`} preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="hatch" patternUnits="userSpaceOnUse" width="9" height="9" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="9" stroke={steel} strokeWidth="0.8" strokeOpacity="0.3" />
        </pattern>
      </defs>

      <g style={{ transform: `translateY(${offsetY}px)`, transition: `transform ${ANIM_MS}ms cubic-bezier(0.33,1,0.68,1)` }}>

        {/* Left I-beam column */}
        <rect x="60" y={-FLOOR_HEIGHT} width="6" height={(sections+2)*FLOOR_HEIGHT} fill={steel} fillOpacity="0.12" />
        <rect x="60" y={-FLOOR_HEIGHT} width="6" height={(sections+2)*FLOOR_HEIGHT} fill="url(#hatch)" />
        <rect x="48" y={-FLOOR_HEIGHT} width="7" height={(sections+2)*FLOOR_HEIGHT} fill={steel} fillOpacity="0.4" />
        <rect x="66" y={-FLOOR_HEIGHT} width="7" height={(sections+2)*FLOOR_HEIGHT} fill={steel} fillOpacity="0.4" />
        <line x1="48" y1={-FLOOR_HEIGHT} x2="48" y2={(sections+2)*FLOOR_HEIGHT} stroke={steel} strokeWidth="0.6" strokeOpacity="0.5" />
        <line x1="73" y1={-FLOOR_HEIGHT} x2="73" y2={(sections+2)*FLOOR_HEIGHT} stroke={steel} strokeWidth="0.6" strokeOpacity="0.5" />

        {/* Right I-beam column */}
        <rect x="1334" y={-FLOOR_HEIGHT} width="6" height={(sections+2)*FLOOR_HEIGHT} fill={steel} fillOpacity="0.12" />
        <rect x="1334" y={-FLOOR_HEIGHT} width="6" height={(sections+2)*FLOOR_HEIGHT} fill="url(#hatch)" />
        <rect x="1327" y={-FLOOR_HEIGHT} width="7" height={(sections+2)*FLOOR_HEIGHT} fill={steel} fillOpacity="0.4" />
        <rect x="1340" y={-FLOOR_HEIGHT} width="7" height={(sections+2)*FLOOR_HEIGHT} fill={steel} fillOpacity="0.4" />
        <line x1="1327" y1={-FLOOR_HEIGHT} x2="1327" y2={(sections+2)*FLOOR_HEIGHT} stroke={steel} strokeWidth="0.6" strokeOpacity="0.5" />
        <line x1="1347" y1={-FLOOR_HEIGHT} x2="1347" y2={(sections+2)*FLOOR_HEIGHT} stroke={steel} strokeWidth="0.6" strokeOpacity="0.5" />

        {/* Secondary verticals */}
        {[230, 420, 700, 980, 1170].map(x => (
          <rect key={x} x={x} y={-FLOOR_HEIGHT} width="3" height={(sections+2)*FLOOR_HEIGHT} fill={steel} fillOpacity="0.09" />
        ))}

        {/* Per-floor sections */}
        {Array.from({ length: sections }, (_, i) => {
          const y  = i * FLOOR_HEIGHT;
          const fi = Math.min(i, TOTAL - 1);
          const fa = floors[fi].accent;
          return (
            <g key={i}>
              {/* Horizontal beam */}
              <rect x="48" y={y-10} width="1299" height="5"  fill={steel} fillOpacity="0.28" />
              <rect x="48" y={y-5}  width="1299" height="10" fill={steel} fillOpacity="0.10" />
              <rect x="48" y={y+5}  width="1299" height="5"  fill={steel} fillOpacity="0.28" />
              <line x1="48" y1={y-10} x2="1347" y2={y-10} stroke={steel} strokeWidth="0.7" strokeOpacity="0.5" />
              <line x1="48" y1={y+10} x2="1347" y2={y+10} stroke={steel} strokeWidth="0.7" strokeOpacity="0.5" />

              {/* Gusset plates at columns */}
              <rect x="48"  y={y-18} width="34" height="36" rx="1" fill="none" stroke={fa} strokeWidth="0.9" strokeOpacity="0.4" />
              <rect x="1315" y={y-18} width="34" height="36" rx="1" fill="none" stroke={fa} strokeWidth="0.9" strokeOpacity="0.4" />

              {/* Bolts */}
              {[56, 65, 74].map(bx => [-11, 11].map(dy => (
                <g key={`${bx}${dy}`}>
                  <circle cx={bx}         cy={y+dy} r="3"   fill={steel} fillOpacity="0.5" />
                  <circle cx={bx}         cy={y+dy} r="1.1" fill={steel} fillOpacity="0.85" />
                  <circle cx={1400-bx}    cy={y+dy} r="3"   fill={steel} fillOpacity="0.5" />
                  <circle cx={1400-bx}    cy={y+dy} r="1.1" fill={steel} fillOpacity="0.85" />
                </g>
              )))}

              {/* Stiffeners */}
              {[230, 420, 700, 980, 1170].map(sx => (
                <g key={sx}>
                  <rect x={sx-3} y={y-4} width="6" height="8" fill={steel} fillOpacity="0.38" />
                  <circle cx={sx} cy={y-8} r="2.3" fill={steel} fillOpacity="0.38" />
                  <circle cx={sx} cy={y+8} r="2.3" fill={steel} fillOpacity="0.38" />
                </g>
              ))}

              {/* Rivet line */}
              {[130, 200, 310, 470, 610, 790, 930, 1090, 1200, 1270].map(rx => (
                <g key={rx}>
                  <circle cx={rx} cy={y} r="3" fillOpacity="0.28" fill={steel} />
                  <circle cx={rx} cy={y} r="1.2" fillOpacity="0.55" fill={steel} />
                </g>
              ))}

              {/* X-braces left */}
              <line x1="73"  y1={y+10} x2="227" y2={y+FLOOR_HEIGHT-10} stroke={steel} strokeWidth="2.2" strokeOpacity="0.28" strokeLinecap="round" />
              <line x1="227" y1={y+10} x2="73"  y2={y+FLOOR_HEIGHT-10} stroke={steel} strokeWidth="2.2" strokeOpacity="0.28" strokeLinecap="round" />
              <circle cx="150" cy={y+FLOOR_HEIGHT/2} r="5" fill={steel} fillOpacity="0.15" stroke={steel} strokeWidth="1" strokeOpacity="0.3" />
              <circle cx="150" cy={y+FLOOR_HEIGHT/2} r="2" fill={steel} fillOpacity="0.45" />

              {/* X-braces right */}
              <line x1="1173" y1={y+10} x2="1327" y2={y+FLOOR_HEIGHT-10} stroke={steel} strokeWidth="2.2" strokeOpacity="0.28" strokeLinecap="round" />
              <line x1="1327" y1={y+10} x2="1173" y2={y+FLOOR_HEIGHT-10} stroke={steel} strokeWidth="2.2" strokeOpacity="0.28" strokeLinecap="round" />
              <circle cx="1250" cy={y+FLOOR_HEIGHT/2} r="5" fill={steel} fillOpacity="0.15" stroke={steel} strokeWidth="1" strokeOpacity="0.3" />
              <circle cx="1250" cy={y+FLOOR_HEIGHT/2} r="2" fill={steel} fillOpacity="0.45" />

              {/* Floor tags */}
              <text x="60" y={y-14} textAnchor="middle" fontFamily="'Courier New', monospace"
                fontSize="10" letterSpacing="0.5" fill={fa} fillOpacity="0.5">
                FL.{String(floors[fi].number).padStart(2,"0")}
              </text>
              <text x="1340" y={y-14} textAnchor="middle" fontFamily="'Courier New', monospace"
                fontSize="10" letterSpacing="0.5" fill={fa} fillOpacity="0.5">
                +{(floors[fi].number*3.5).toFixed(1)}m
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// ─── CABIN FRAME (foreground, fijo, colores de acero) ────────────────────────
function CabinFrame() {
  return (
    <svg style={{ position:"fixed", left:"310px", right:0, top:0, bottom:0, width:"calc(100% - 310px)", height:"100%", pointerEvents:"none", zIndex:20 }}
      viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">

      {/* Top beam */}
      <rect x="58" y="16" width="884" height="20" rx="2" fill={CS} fillOpacity="0.7" />
      <rect x="58" y="12" width="884" height="7"  rx="1" fill={CD} fillOpacity="0.9" />
      {[100,175,270,380,500,620,730,825,900].map(x=>(
        <g key={x}>
          <circle cx={x} cy={26} r="3.8" fill={CR} fillOpacity="0.65"/>
          <circle cx={x} cy={26} r="1.5" fill={CR} fillOpacity="0.95"/>
        </g>
      ))}

      {/* Bottom beam */}
      <rect x="58" y="662" width="884" height="20" rx="2" fill={CS} fillOpacity="0.7" />
      <rect x="58" y="682" width="884" height="7"  rx="1" fill={CD} fillOpacity="0.9" />
      {[100,175,270,380,500,620,730,825,900].map(x=>(
        <g key={x}>
          <circle cx={x} cy={672} r="3.8" fill={CR} fillOpacity="0.65"/>
          <circle cx={x} cy={672} r="1.5" fill={CR} fillOpacity="0.95"/>
        </g>
      ))}

      {/* Left upright */}
      <rect x="58" y="12"  width="20" height="678" fill={CS} fillOpacity="0.6" />
      <rect x="52" y="12"  width="8"  height="678" fill={CD} fillOpacity="0.85" />
      {[75,155,250,345,440,535,625,700].map(y=>(
        <g key={y}>
          <circle cx={68} cy={y} r="3.8" fill={CR} fillOpacity="0.65"/>
          <circle cx={68} cy={y} r="1.5" fill={CR} fillOpacity="0.95"/>
        </g>
      ))}

      {/* Right upright */}
      <rect x="922" y="12"  width="20" height="678" fill={CS} fillOpacity="0.6" />
      <rect x="940" y="12"  width="8"  height="678" fill={CD} fillOpacity="0.85" />
      {[75,155,250,345,440,535,625,700].map(y=>(
        <g key={y}>
          <circle cx={932} cy={y} r="3.8" fill={CR} fillOpacity="0.65"/>
          <circle cx={932} cy={y} r="1.5" fill={CR} fillOpacity="0.95"/>
        </g>
      ))}

      {/* Corner gussets */}
      {[[52,12],[930,12],[52,672],[930,672]].map(([x,y],i)=>(
        <rect key={i} x={x} y={y} width="30" height="30" rx="2"
          fill={CD} fillOpacity="0.95" stroke={CA} strokeWidth="0.8" strokeOpacity="0.5"/>
      ))}
      {[[58,18],[72,18],[58,32],[72,32], [936,18],[950,18],[936,32],[950,32],
        [58,678],[72,678],[58,692],[72,692],[936,678],[950,678],[936,692],[950,692]].map(([x,y],i)=>(
        <g key={i}>
          <circle cx={x} cy={y} r="3"   fill={CR} fillOpacity="0.6"/>
          <circle cx={x} cy={y} r="1.2" fill={CR} fillOpacity="0.9"/>
        </g>
      ))}

      {/* Guide shoes */}
      {[85,575].map(y=>(
        <g key={y}>
          <rect x="42" y={y} width="18" height="32" rx="2" fill={CD} fillOpacity="0.85"/>
          <rect x="940" y={y} width="18" height="32" rx="2" fill={CD} fillOpacity="0.85"/>
        </g>
      ))}

      {/* Cables from top */}
      <line x1="200" y1="0" x2="200" y2="12" stroke={CS} strokeWidth="3" strokeOpacity="0.7"/>
      <line x1="800" y1="0" x2="800" y2="12" stroke={CS} strokeWidth="3" strokeOpacity="0.7"/>
      <line x1="500" y1="0" x2="500" y2="12" stroke={CS} strokeWidth="4" strokeOpacity="0.45"/>
    </svg>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [current,      setCurrent]      = useState(0);
  const [display,      setDisplay]      = useState(0);
  const [transitioning,setTransitioning]= useState(false);
  const [direction,    setDirection]    = useState("down");
  const [doorsOpen,    setDoorsOpen]    = useState(false);
  const [doorsVisible, setDoorsVisible] = useState(true);
  const [arrived,      setArrived]      = useState(0);
  const lastScroll = useRef(0);
  const touchY     = useRef(null);
  const animating  = useRef(false);

  const go = useCallback((next) => {
    if (animating.current || next < 0 || next >= TOTAL) return;
    animating.current = true;
    setArrived(-1);
    setDirection(next > current ? "down" : "up");
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(next);
      setDisplay(next);
      setTransitioning(false);
      setTimeout(() => {
        setArrived(next);
        animating.current = false;
      }, ANIM_MS + 100);
    }, 280);
  }, [current]);

  useEffect(() => {
    const t1 = setTimeout(() => setDoorsOpen(true), 500);
    const t2 = setTimeout(() => setDoorsVisible(false), 500 + 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const onWheel = e => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastScroll.current < ANIM_MS) return;
      lastScroll.current = now;
      go(current + (e.deltaY > 0 ? 1 : -1));
    };
    const onKey = e => {
      if (e.key === "ArrowDown" || e.key === "PageDown") go(current + 1);
      if (e.key === "ArrowUp"   || e.key === "PageUp")   go(current - 1);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("wheel", onWheel); window.removeEventListener("keydown", onKey); };
  }, [current, go]);

  const floor     = floors[display];
  const worldOff  = -current * FLOOR_HEIGHT + 280;

  return (
    <div
      onTouchStart={e => { touchY.current = e.touches[0].clientY; }}
      onTouchEnd={e => {
        if (touchY.current === null) return;
        const d = touchY.current - e.changedTouches[0].clientY;
        if (Math.abs(d) > 40) go(current + (d > 0 ? 1 : -1));
        touchY.current = null;
      }}
      style={{
        minHeight: "100vh", overflow: "hidden", position: "relative",
        background: floor.bg, transition: "background 0.9s ease",
        userSelect: "none", fontFamily: "'Georgia', serif",
      }}
    >
      {/* ── Fondo: estructura que scrollea ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
        <SteelWorld offsetY={worldOff} steel={floor.steel} />
      </div>

      {/* ── Vignette central ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 5, pointerEvents: "none",
        background: `radial-gradient(ellipse 60% 70% at 55% 50%, transparent 20%, ${floor.bg}c0 100%)`,
        transition: "background 0.9s ease",
      }} />

      {/* ── Panel izquierdo: shaft del ascensor ── */}
      <div style={{
        position: "fixed", left: 0, top: 0, bottom: 0,
        width: "310px", zIndex: 35,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "16px 8px",
        borderRight: `1px solid ${CS}22`,
        background: `${floor.bg}cc`,
        transition: "background 0.9s ease",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "12px" }}>
        <img src="/logo-final.png" alt="IOCA"
          style={{ width: "200px", objectFit: "contain", marginTop: "12px", marginBottom: "8px", opacity: 0.9 }} />
        {/* Iconos sociales */}
        <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
          {/* Instagram */}
          <a href="https://instagram.com" target="_blank" rel="noreferrer"
            style={{ opacity: 0.5, transition: "opacity 0.3s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="5.5" stroke={CS} strokeWidth="1.8"/>
              <circle cx="12" cy="12" r="4.5" stroke={CS} strokeWidth="1.8"/>
              <circle cx="17.5" cy="6.5" r="1" fill={CS}/>
            </svg>
          </a>
          {/* WhatsApp */}
          <a href="https://wa.me/" target="_blank" rel="noreferrer"
            style={{ opacity: 0.5, transition: "opacity 0.3s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.41A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" stroke={CS} strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M8.5 9.5c.5 1 1.5 3 3.5 4s3-1 3-1-.5-1.5-1-1.5c-.4 0-.8.3-1 .5-.8-.3-2-1.5-2.3-2.3.2-.2.5-.6.5-1 0-.5-1.5-1-1.5-1S8 8.5 8.5 9.5z" fill={CS}/>
            </svg>
          </a>
        </div>
        </div>{/* fin grupo logo+sociales */}
        <div style={{ width: "290px", flex: 1, minHeight: 0 }}>
          <ElevatorShaft current={current} arrived={arrived} go={go} accent={floor.accent} />
        </div>
      </div>


      {/* ── Animación: puertas de ascensor ── */}
      {doorsVisible && (
        <svg style={{ position:"fixed", left:"310px", right:0, top:0, bottom:0,
          width:"calc(100% - 310px)", height:"100%", zIndex:45,
          pointerEvents: doorsOpen ? "none" : "all" }}
          viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Clip al interior exacto del marco */}
            <clipPath id="door-clip">
              <rect x="78" y="36" width="844" height="626" />
            </clipPath>
            <linearGradient id="door-grad-l" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#1a2828" />
              <stop offset="100%" stopColor="#243535" />
            </linearGradient>
            <linearGradient id="door-grad-r" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#243535" />
              <stop offset="100%" stopColor="#1a2828" />
            </linearGradient>
          </defs>

          <g clipPath="url(#door-clip)">
            {/* Puerta izquierda */}
            <g style={{
              transformBox: "fill-box",
              transform: doorsOpen ? "translateX(-101%)" : "translateX(0)",
              transition: "transform 1.4s cubic-bezier(0.77,0,0.18,1)",
            }}>
              <rect x="78" y="36" width="422" height="626" fill="url(#door-grad-l)" />
              {/* Paneles */}
              {[140, 349, 558].map(y => (
                <rect key={y} x="108" y={y} width="360" height="3" rx="1"
                  fill={CS} fillOpacity="0.2" />
              ))}
              <rect x="108" y="76" width="360" height="540" rx="3"
                fill="none" stroke={CS} strokeWidth="1.5" strokeOpacity="0.15" />
              {/* Remaches borde derecho */}
              {[80, 200, 349, 498, 640].map(y => (
                <g key={y}>
                  <circle cx="490" cy={y} r="4" fill={CR} fillOpacity="0.4" />
                  <circle cx="490" cy={y} r="1.5" fill={CR} fillOpacity="0.7" />
                </g>
              ))}
              {/* Borde de encuentro */}
              <line x1="499" y1="36" x2="499" y2="662" stroke={CA} strokeWidth="2" strokeOpacity="0.5" />
              {/* Sombra hacia el centro */}
              <rect x="460" y="36" width="40" height="626"
                fill="url(#shadow-l-inner)" />
              <defs>
                <linearGradient id="shadow-l-inner" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#000" stopOpacity="0" />
                  <stop offset="100%" stopColor="#000" stopOpacity="0.4" />
                </linearGradient>
              </defs>
            </g>

            {/* Puerta derecha */}
            <g style={{
              transformBox: "fill-box",
              transform: doorsOpen ? "translateX(101%)" : "translateX(0)",
              transition: "transform 1.4s cubic-bezier(0.77,0,0.18,1)",
            }}>
              <rect x="500" y="36" width="422" height="626" fill="url(#door-grad-r)" />
              {/* Paneles */}
              {[140, 349, 558].map(y => (
                <rect key={y} x="512" y={y} width="360" height="3" rx="1"
                  fill={CS} fillOpacity="0.2" />
              ))}
              <rect x="512" y="76" width="360" height="540" rx="3"
                fill="none" stroke={CS} strokeWidth="1.5" strokeOpacity="0.15" />
              {/* Remaches borde izquierdo */}
              {[80, 200, 349, 498, 640].map(y => (
                <g key={y}>
                  <circle cx="510" cy={y} r="4" fill={CR} fillOpacity="0.4" />
                  <circle cx="510" cy={y} r="1.5" fill={CR} fillOpacity="0.7" />
                </g>
              ))}
              {/* Borde de encuentro */}
              <line x1="501" y1="36" x2="501" y2="662" stroke={CA} strokeWidth="2" strokeOpacity="0.5" />
              {/* Sombra hacia el centro */}
              <rect x="500" y="36" width="40" height="626"
                fill="url(#shadow-r-inner)" />
              <defs>
                <linearGradient id="shadow-r-inner" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#000" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#000" stopOpacity="0" />
                </linearGradient>
              </defs>
            </g>
          </g>
        </svg>
      )}


      {/* ── Contenido ── */}
      <div style={{
        position: "fixed", left: "310px", right: 0, top: 0, bottom: 0, zIndex: 30,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: display === 6 ? "68px 68px 50px 30px" : "80px 80px 80px 30px",
      }}>
        <div
          key={display}
          style={{
            maxWidth: display === 6 ? "580px" : "480px", width: "100%",
            animation: transitioning
              ? `${direction === "down" ? "exitUp" : "exitDown"} 0.28s ease forwards`
              : `${direction === "down" ? "enterUp" : "enterDown"} 0.6s cubic-bezier(0.16,1,0.3,1) forwards`,
          }}
        >
          {display === 6 ? (
            <PhotoSlider accent={floor.accent} steel={floor.steel} text={floor.text} />
          ) : (
            <>
              <div style={{
                fontFamily: "'Courier New', monospace", fontSize: "10px",
                letterSpacing: "0.28em", color: floor.steel, marginBottom: "1rem",
                display: "flex", alignItems: "center", gap: "10px",
              }}>
                <span style={{ width:"24px", height:"1px", background:floor.accent, opacity:0.7, display:"inline-block" }}/>
                {floor.label}
              </div>

              <h1 style={{
                fontSize: "clamp(44px, 5.5vw, 72px)", fontWeight: "normal",
                color: floor.text, margin: "0 0 1rem",
                lineHeight: 0.95, letterSpacing: "-0.03em",
              }}>{floor.title}</h1>

              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"1.3rem" }}>
                <div style={{ width:"36px", height:"1.5px", background:floor.accent }}/>
                <span style={{
                  fontFamily:"'Courier New', monospace", fontSize:"11px",
                  letterSpacing:"0.16em", color:floor.accent, textTransform:"uppercase",
                }}>{floor.subtitle}</span>
              </div>

              <p style={{
                fontSize:"16px", color:floor.text, lineHeight:"1.85",
                margin:"0 0 2.5rem", opacity:0.72, maxWidth:"380px",
              }}>{floor.description}</p>

              <div style={{
                fontFamily:"'Courier New', monospace", fontSize:"10px",
                color:floor.steel, letterSpacing:"0.12em",
                display:"flex", gap:"1.5rem", opacity:0.5,
              }}>
                <span>NIV. {String(floor.number).padStart(2,"0")}</span>
                <span>+{(floor.number*3.5).toFixed(2)} m</span>
                <span>COTA ±0.00</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Piso actual top-right ── */}
      <div style={{
        position:"fixed", top:"60px", right:"60px", zIndex:35,
        fontFamily:"'Courier New', monospace", textAlign:"right",
      }}>
        <div style={{ color:floor.accent, fontSize:"28px", fontWeight:"bold", lineHeight:1 }}>
          {String(floor.number).padStart(2,"0")}
        </div>
        <div style={{ color:floor.steel, fontSize:"9px", letterSpacing:"0.2em", marginTop:"3px" }}>
          {floor.label}
        </div>
      </div>

      {/* ── Nav buttons ── */}
      <div style={{
        position:"fixed", right:"20px", top:"50%", transform:"translateY(-50%)",
        display:"flex", flexDirection:"column", gap:"0.6rem", zIndex:35, alignItems:"center",
      }}>
        {[["▲", current-1, current===0],["▼", current+1, current===TOTAL-1]].map(([lbl,tgt,dis])=>(
          <button key={lbl} onClick={()=>go(tgt)} disabled={dis} style={{
            background:"transparent",
            border:`1px solid ${dis ? floor.steel : floor.accent}`,
            color: dis ? floor.steel : floor.accent,
            padding:"8px 12px", cursor: dis?"default":"pointer",
            fontFamily:"'Courier New', monospace", fontSize:"11px",
            opacity: dis?0.3:1, transition:"all 0.3s",
          }}>{lbl}</button>
        ))}
        <span style={{ color:floor.steel, fontFamily:"'Courier New', monospace", fontSize:"10px", letterSpacing:"0.2em", writingMode:"vertical-rl" }}>
          {current+1} / {TOTAL}
        </span>
      </div>

      <style>{`
        @keyframes enterUp   { from{opacity:0;transform:translateY(50px)} to{opacity:1;transform:translateY(0)} }
        @keyframes exitUp    { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(-50px)} }
        @keyframes enterDown { from{opacity:0;transform:translateY(-50px)} to{opacity:1;transform:translateY(0)} }
        @keyframes exitDown  { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(50px)} }
        @keyframes progress  { from{width:0%} to{width:100%} }
        button:focus { outline:none; }
      `}</style>
    </div>
  );
}
