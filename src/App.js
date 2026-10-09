import React, { useState, useEffect, useRef, useCallback } from "react";
import ProjectModelViewer from "./ProjectModelViewer";


// ─── CLIENTES: cinta transportadora industrial ───────────────────────────────
const CLIENTS = [
  { name: "YPF",              color: "#4a90d9", letter: "Y",  desc: "Proyecto de ingeniería estructural para plantas de extracción en la cuenca neuquina." },
  { name: "IMPSA",            color: "#c8a96e", letter: "I",  desc: "Cálculo y supervisión de obras civiles para parques de generación eólica." },
  { name: "Techint",          color: "#7ab0d4", letter: "T",  desc: "Estructuras metálicas y fundaciones para complejos industriales en Bahía Blanca." },
  { name: "IECSA",            color: "#b87a5a", letter: "E",  desc: "Dirección técnica en obras de infraestructura vial y puentes de hormigón." },
  { name: "Roggio",           color: "#9a9a7a", letter: "R",  desc: "Auditoría estructural y certificación de obras en el área metropolitana." },
  { name: "Electroingenieria",color: "#8a7ac8", letter: "EL", desc: "Ingeniería de detalle para subestaciones eléctricas de alta tensión." },
  { name: "Loma Negra",       color: "#7ab87a", letter: "LN", desc: "Estudio de suelos y diseño de fundaciones para plantas cementeras." },
  { name: "Sacde",            color: "#c0c0c0", letter: "S",  desc: "Proyecto ejecutivo de estructuras para obras hidráulicas en el NOA." },
  { name: "Ghella",           color: "#d4a0a0", letter: "G",  desc: "Soporte técnico en tunelería y obras subterráneas en Buenos Aires." },
  { name: "IATEC",            color: "#a0c4d4", letter: "IA", desc: "Consultoría en instalaciones industriales y montaje electromecánico." },
];

const GR  = 52; const BT = 12;
const CW = 130; const CH = 110; const CGAP = 22;
const CARD_PITCH = CW + CGAP;
const N_CARDS = CLIENTS.length;
const LOOP_W = N_CARDS * CARD_PITCH;
const TW = 12; const TG = 7; const TH = 10;
const TPITCH = TW + TG;
const VIGA_W = 18;
const REMACHES = [20, 60, 110, 160, 210, 260];

// Geometría de la cinta según el ancho del viewBox (más angosto en celular → cajas más grandes)
function beltGeometry(VW) {
  const VH = 320;
  const TX = GR; const TXR = VW - GR;
  const VCY = VH * 0.72;
  return {
    VW, VH, TX, TXR, VCY,
    OT: VCY - GR, IT: VCY - GR + BT,
    OB: VCY + GR, IB: VCY + GR - BT,
    STRAIGHT: TXR - TX,
    N_TEETH: Math.ceil((TXR - TX) / TPITCH) + 2,
    VIGA_X_L: TX + GR * 0.3,
    VIGA_X_R: TXR - GR * 0.3 - 18,
  };
}

// ─── Responsive ──────────────────────────────────────────────────────────────
const MOBILE_BP = 768;
function useIsMobile() {
  const get = () => typeof window !== "undefined" && window.innerWidth < MOBILE_BP;
  const [mobile, setMobile] = useState(get);
  useEffect(() => {
    const onResize = () => setMobile(get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return mobile;
}

// Evita que los toques dentro de un modal cambien de piso
const stopTouch = { onTouchStart: e => e.stopPropagation(), onTouchEnd: e => e.stopPropagation() };

function Gear({ cx, cy, paused }) {
  const teeth = 16; const r = GR - BT/2; const toothH = 11;
  const pts = [];
  for (let i = 0; i < teeth; i++) {
    const a0 = (i/teeth)*2*Math.PI - Math.PI/2;
    const a1 = a0 + 0.38/teeth*2*Math.PI;
    const a2 = a0 + 0.62/teeth*2*Math.PI;
    const a3 = a0 + 1.0 /teeth*2*Math.PI;
    const p = (a,rad) => `${(cx+Math.cos(a)*rad).toFixed(2)},${(cy+Math.sin(a)*rad).toFixed(2)}`;
    pts.push(`${p(a0,r)} ${p(a1,r)} ${p(a1,r+toothH)} ${p(a2,r+toothH)} ${p(a2,r)} ${p(a3,r)}`);
  }
  const d = "M" + pts.join(" ") + "Z";
  return (
    <g style={{ transformOrigin:`${cx}px ${cy}px`, animation:`gearSpin 4s linear infinite`, animationPlayState: paused ? "paused" : "running" }}>
      <path d={d} fill="#252525" stroke="#4a4a4a" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={r*0.5}  fill="none" stroke="#4a4a4a" strokeWidth="3" />
      <circle cx={cx} cy={cy} r={r*0.18} fill="#4a4a4a" />
    </g>
  );
}

function ClientsBelt({ accent, steel, text, bg, mode, mobile }) {
  const { VW, VH, TX, TXR, VCY, OT, IT, OB, IB, STRAIGHT, N_TEETH, VIGA_X_L, VIGA_X_R } = beltGeometry(mobile ? 460 : 1000);
  const modalBg = mode === "light" ? "#faf9f6" : "#0d0c14";
  const headingColor = mode === "light" ? "#1a1a1a" : "#f5f5f5";
  const bodyDim = mode === "light" ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.65)";
  const [selected, setSelected] = React.useState(null);
  const [offset,   setOffset]   = React.useState(0);
  const pausedRef   = React.useRef(false);
  const rafRef      = React.useRef(null);
  const speed       = 0.5; // px per frame

  // Auto-scroll loop
  React.useEffect(() => {
    const tick = () => {
      if (!pausedRef.current) {
        setOffset(o => {
          const next = o - speed;
          return next < -LOOP_W ? next + LOOP_W : next;
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Pause only when hovering a card
  const handleCardEnter = () => { pausedRef.current = true; };
  const handleCardLeave = () => { if (!selected) pausedRef.current = false; };

  // Resume belt when modal closes
  const closeModal = () => {
    setSelected(null);
    pausedRef.current = false;
  };

  const cards = [...CLIENTS, ...CLIENTS, ...CLIENTS];
  const paused = pausedRef.current || !!selected;

  return (
    <div style={{ width:"100%", display:"flex", flexDirection:"column", justifyContent:"flex-start", height:"100%", paddingTop: mobile ? "0" : "60px", gap: mobile ? "32px" : "60px" }}>

      {/* Header */}
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"0.8rem" }}>
          <div style={{ width:"28px", height:"1.5px", background:accent }}/>
          <span style={{ fontFamily:"'Courier New', monospace", fontSize:"11px", letterSpacing:"0.16em", color:accent, textTransform:"uppercase" }}>Quienes confian en nosotros</span>
        </div>
        <h1 style={{ fontSize:"clamp(38px, 5vw, 64px)", fontWeight:"normal", color:text, margin:0, lineHeight:0.95, letterSpacing:"-0.03em" }}>Clientes</h1>
      </div>

      {/* Belt */}
      <div style={{ width:"100%", position:"relative" }}>
        <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width:"100%", display:"block" }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="cardClip">
              <rect x={VIGA_X_L + VIGA_W} y={0} width={VIGA_X_R - VIGA_X_L - VIGA_W} height={VH} />
            </clipPath>
            <clipPath id="toothClipT">
              <rect x={TX} y={OT - TH - 2} width={STRAIGHT} height={TH + 4} />
            </clipPath>
            <clipPath id="toothClipB">
              <rect x={TX} y={OB - 2} width={STRAIGHT} height={TH + 4} />
            </clipPath>
            <linearGradient id="fadeL" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%"   stopColor={bg} stopOpacity="1" />
              <stop offset="100%" stopColor={bg} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="fadeR" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%"   stopColor={bg} stopOpacity="0" />
              <stop offset="100%" stopColor={bg} stopOpacity="1" />
            </linearGradient>
            <linearGradient id="vigaGrad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%"   stopColor="#222" />
              <stop offset="45%"  stopColor="#4a4a4a" />
              <stop offset="100%" stopColor="#1e1e1e" />
            </linearGradient>
          </defs>

          {/* Cajas (JS transform, no CSS animation) */}
          <g clipPath="url(#cardClip)">
            <g transform={`translate(${offset % LOOP_W}, 0)`}>
              {cards.map((c, i) => {
                const x = TX + 10 + i * CARD_PITCH;
                const y = OT - CH - 6;
                return (
                  <g key={i}
                    onClick={() => setSelected(c)}
                    onMouseEnter={handleCardEnter}
                    onMouseLeave={handleCardLeave}
                    style={{ cursor:"pointer" }}
                  >
                    <rect x={x} y={y} width={CW} height={CH} rx="2"
                      fill={c.color+"18"} stroke={c.color+"66"} strokeWidth="1" />
                    <circle cx={x+CW/2} cy={y+CH*0.42} r="26"
                      fill={c.color+"28"} stroke={c.color+"88"} strokeWidth="1.5" />
                    <text x={x+CW/2} y={y+CH*0.42+6} textAnchor="middle"
                      fontFamily="'Courier New', monospace" fontSize="14" fontWeight="bold" fill={c.color}>{c.letter}</text>
                    <text x={x+CW/2} y={y+CH*0.82} textAnchor="middle"
                      fontFamily="'Courier New', monospace" fontSize="9" letterSpacing="1"
                      fill={c.color} fillOpacity="0.7">{c.name.toUpperCase()}</text>
                  </g>
                );
              })}
            </g>
          </g>

          {/* Correa */}
          <rect x={TX} y={OT} width={STRAIGHT} height={BT} fill="#2a2a2a" />
          <rect x={TX} y={OB-BT} width={STRAIGHT} height={BT} fill="#2a2a2a" />
          <path d={`M${TX},${OT} A${GR},${GR} 0 0,0 ${TX},${OB}`} fill="none" stroke="#2a2a2a" strokeWidth={BT} />
          <path d={`M${TXR},${OT} A${GR},${GR} 0 0,1 ${TXR},${OB}`} fill="none" stroke="#2a2a2a" strokeWidth={BT} />
          <path d={`M${TX},${IT} L${TXR},${IT} A${GR-BT},${GR-BT} 0 0,1 ${TXR},${IB} L${TX},${IB} A${GR-BT},${GR-BT} 0 0,1 ${TX},${IT} Z`} fill="transparent" />
          <path d={`M${TX},${OT} L${TXR},${OT} A${GR},${GR} 0 0,1 ${TXR},${OB} L${TX},${OB} A${GR},${GR} 0 0,1 ${TX},${OT} Z`} fill="none" stroke="#444" strokeWidth="1.5" />

          {/* Dientes superiores */}
          <g clipPath="url(#toothClipT)" style={{ animation:`teethMove ${TPITCH/55}s linear infinite`, animationPlayState: paused ? "paused" : "running" }}>
            {Array.from({length:N_TEETH},(_,i)=>(
              <rect key={i} x={TX+i*TPITCH-TPITCH} y={OT-TH} width={TW} height={TH} rx="1.5" fill="#1e1e1e" stroke="#3e3e3e" strokeWidth="0.8" />
            ))}
          </g>
          {/* Dientes inferiores */}
          <g clipPath="url(#toothClipB)" style={{ animation:`teethMovR ${TPITCH/55}s linear infinite`, animationPlayState: paused ? "paused" : "running" }}>
            {Array.from({length:N_TEETH},(_,i)=>(
              <rect key={i} x={TX+i*TPITCH-TPITCH} y={OB} width={TW} height={TH} rx="1.5" fill="#1e1e1e" stroke="#3e3e3e" strokeWidth="0.8" />
            ))}
          </g>

          {/* Engranajes */}
          <Gear cx={TX}  cy={VCY} paused={paused} />
          <Gear cx={TXR} cy={VCY} paused={paused} />

          {/* Fades */}
          <rect x={0} y={0} width={VIGA_X_L+VIGA_W+20} height={VH} fill="url(#fadeL)" />
          <rect x={VIGA_X_R-20} y={0} width={VW-VIGA_X_R+20} height={VH} fill="url(#fadeR)" />

          {/* Vigas */}
          <rect x={VIGA_X_L} y={0} width={VIGA_W} height={VH} fill="url(#vigaGrad)" stroke="#555" strokeWidth="0.8" />
          {REMACHES.map(ry => (
            <g key={ry}>
              <circle cx={VIGA_X_L+VIGA_W/2} cy={ry} r="4" fill="#1a1a1a" stroke="#555" strokeWidth="0.8" />
              <circle cx={VIGA_X_L+VIGA_W/2} cy={ry} r="1.5" fill="#666" />
            </g>
          ))}
          <rect x={VIGA_X_R} y={0} width={VIGA_W} height={VH} fill="url(#vigaGrad)" stroke="#555" strokeWidth="0.8" />
          {REMACHES.map(ry => (
            <g key={ry}>
              <circle cx={VIGA_X_R+VIGA_W/2} cy={ry} r="4" fill="#1a1a1a" stroke="#555" strokeWidth="0.8" />
              <circle cx={VIGA_X_R+VIGA_W/2} cy={ry} r="1.5" fill="#666" />
            </g>
          ))}
        </svg>
      </div>

      {/* Modal */}
      {selected && (
        <div onClick={closeModal} {...stopTouch} style={{
          position:"fixed", inset:0, zIndex:200,
          background:"rgba(0,0,0,0.7)",
          display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background:modalBg, border:`1px solid ${selected.color}66`,
            padding: mobile ? "32px 22px 24px" : "36px 40px", maxWidth:"420px", width:"90%",
            position:"relative", cursor:"default",
          }}>
            {[[0,0],[1,0],[0,1],[1,1]].map(([r,b],i) => (
              <div key={i} style={{
                position:"absolute",
                top:b===0?0:"auto", bottom:b===1?0:"auto",
                left:r===0?0:"auto", right:r===1?0:"auto",
                width:"16px", height:"16px",
                borderTop:    b===0?`2px solid ${selected.color}`:"none",
                borderBottom: b===1?`2px solid ${selected.color}`:"none",
                borderLeft:   r===0?`2px solid ${selected.color}`:"none",
                borderRight:  r===1?`2px solid ${selected.color}`:"none",
              }}/>
            ))}
            <button onClick={closeModal} aria-label="Cerrar" style={{
              position:"absolute", top:"14px", right:"14px",
              width:"26px", height:"26px", display:"flex", alignItems:"center", justifyContent:"center",
              background:"transparent", border:`1px solid ${selected.color}55`,
              color:selected.color, fontFamily:"'Courier New', monospace", fontSize:"14px",
              lineHeight:1, cursor:"pointer",
            }}>×</button>
            <div style={{
              width:"60px", height:"60px", borderRadius:"50%",
              background:`${selected.color}22`, border:`2px solid ${selected.color}88`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontFamily:"'Courier New', monospace", fontSize:"18px", fontWeight:"bold",
              color:selected.color, marginBottom:"20px",
            }}>{selected.letter}</div>
            <div style={{ fontFamily:"'Courier New', monospace", fontSize:"10px", letterSpacing:"0.2em", color:selected.color, marginBottom:"6px", textTransform:"uppercase" }}>Cliente</div>
            <h2 style={{ fontFamily:"Georgia, serif", fontSize:"28px", fontWeight:"normal", color:headingColor, margin:"0 0 16px", letterSpacing:"-0.02em" }}>{selected.name}</h2>
            <div style={{ width:"36px", height:"1.5px", background:selected.color, marginBottom:"16px" }}/>
            <p style={{ fontFamily:"'Courier New', monospace", fontSize:"12px", color:bodyDim, lineHeight:"1.8", margin:"0 0 24px", letterSpacing:"0.02em" }}>{selected.desc}</p>
            <button onClick={closeModal} style={{
              background:"transparent", border:`1px solid ${selected.color}66`,
              color:selected.color, padding:"8px 20px",
              fontFamily:"'Courier New', monospace", fontSize:"10px",
              letterSpacing:"0.15em", cursor:"pointer", textTransform:"uppercase",
            }}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ fontFamily:"'Courier New', monospace", fontSize:"11px", color:steel, letterSpacing:"0.1em", opacity:0.5, display:"flex", gap:"1.5rem" }}>
        <span>NIV. 02</span><span>+7.00 m</span><span>COTA ±0.00</span>
      </div>

      <style>{`
        @keyframes teethMove  { from{transform:translateX(0)} to{transform:translateX(-${TPITCH}px)} }
        @keyframes teethMovR  { from{transform:translateX(0)} to{transform:translateX(${TPITCH}px)}  }
        @keyframes gearSpin   { from{transform:rotate(0deg)}  to{transform:rotate(-360deg)} }
      `}</style>
    </div>
  );
}

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
  const [open, setOpen] = useState(null);

  return (
    <div style={{ width: "100%", maxWidth: "820px", display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
        <div style={{ width:"28px", height:"1.5px", background:accent }}/>
        <span style={{ fontFamily:"'Courier New', monospace", fontSize:"12px", letterSpacing:"0.16em", color:accent, textTransform:"uppercase" }}>Nuestras obras</span>
      </div>

      {/* Grid de thumbnails — cuadrados */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"8px" }}>
        {ENGINEERING_PHOTOS.map((p, i) => (
          <div key={i} onClick={() => setOpen(i)} style={{
            position:"relative", cursor:"pointer", overflow:"hidden",
            aspectRatio:"1",
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
              position:"absolute", bottom:"10px", left:"12px",
              fontFamily:"'Courier New', monospace", fontSize:"12px",
              letterSpacing:"0.14em", color:"#ffffffaa",
            }}>{p.label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ fontFamily:"'Courier New', monospace", fontSize:"12px", color:steel, letterSpacing:"0.1em", opacity:0.5, display:"flex", gap:"1rem", flexShrink:0 }}>
        <span>NIV. 03</span><span>+10.50 m</span><span>COTA ±0.00</span>
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
              background:"rgba(0,0,0,0.75)", border:"1px solid rgba(255,255,255,0.4)",
              color:"#ffffff", width:"32px", height:"32px",
              cursor:"pointer", fontFamily:"monospace", fontSize:"18px",
              display:"flex", alignItems:"center", justifyContent:"center",
              backdropFilter:"blur(4px)",
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

// ─── EDIFICIOS, VIVIENDAS Y NAVES: fichas de obra ─────────────────────────
const EDIFICIOS_DATA = [
  { cliente: "Moschini",     obra: "Nuñez",                m2: 950,  ubicacion: "Villa Urquiza, CABA", model: "nunez" },
  { cliente: "TdAs",         obra: "Aristóbulo",           m2: 2600, ubicacion: "Lanús", model: "aristobulo" },
  { cliente: "Acosta",       obra: "Bogotá",                m2: 2400, ubicacion: "Gral. Pacheco, Tigre", model: "bogota" },
  { cliente: "Ganzabal",     obra: "Locales Buena Vista",   m2: 1300, ubicacion: "Victoria, San Fernando", model: "locales-buena-vista" },
  { cliente: "TdAs",         obra: "Sixto 195",             m2: 5400, ubicacion: "Las Lomitas, Lomas de Zamora" },
  { cliente: "Cubero-Rubio", obra: "AR2235",                m2: 5800, ubicacion: "Palermo, CABA", model: "ar2235" },
];

const VIVIENDAS_DATA = [
  { cliente: "GBG Arquitectos", obra: "Steel deck",                                    m2: 210, ubicacion: "El Rebenque, Canning", model: "canning" },
  { cliente: "NNN Estudio",     obra: "Estructura de madera",                          m2: 260, ubicacion: "Luján", model: "lujan" },
  { cliente: "ALM Arqs",        obra: "Remodelación · muros portantes y viguetas",     m2: 320, ubicacion: "Coghlan, CABA", model: "coghlan" },
  { cliente: "TdAs",            obra: "Hormigón armado",                               m2: 685, ubicacion: "Adrogué, Alte. Brown", model: "adrogue" },
  { cliente: "AORA",            obra: "Hormigón armado y viguetas",                    m2: 460, ubicacion: "Medal, Pilar", model: "medal-pilar" },
  { cliente: "TdAs",            obra: "Hormigón armado",                               m2: 355, ubicacion: "El Salvaje, Mar de las Pampas", model: "el-salvaje" },
];

// Fuente: Contenido WEB - Version B.xlsx, Hoja1, filas 20–24.
const NAVES_DATA = [
  { cliente: "GAMMA Sudamericana", obra: "Estación de servicio AXION", tipo: "Estructura reticulada / Shop de hormigón", m2: "950 + 700", ubicacion: "San Vicente", model: "san-vicente" },
  { cliente: "LUMMA", obra: "Cine 3D", tipo: "Estructura metálica", superficie: "Sala: 500 m² + Pantalla: 350 m²", ubicacion: "Eco Parque, CABA", model: "lumma" },
  { cliente: "Constructora Lomas", obra: "Plásticos SP", tipo: "Alma llena / Oficinas de hormigón", m2: "2800 + 150", ubicacion: "Burzaco", model: "plasticos-sp" },
  { cliente: "BLASTAC", obra: "Nave Producción", tipo: "Alma llena / Oficinas metálicas y prelosas", m2: "1200 + 350", ubicacion: "Parque industrial RN6, Cardales", model: "blastac" },
  { cliente: "BTU", obra: "Naves Containers", tipo: "Naves contenedores / Reticuladas", m2: 1200, ubicacion: "Ezeiza", model: "btu" },
];

// Fuente: Contenido WEB - Version B.xlsx, Hoja1, filas 27–30.
const PATOLOGIAS_DATA = [
  { cliente: "AUSOL", obra: "Pasarelas / Refugios", ubicacion: "Vicente López", model: "ausol" },
  { cliente: "La Nueva Metropol", obra: "Verificación de naves metálicas", m2: 1250, ubicacion: "Merlo", model: "metropol" },
  { cliente: "Palacio Alsina", obra: "Palacio Alsina" },
  { cliente: "FAMIQ", obra: "Verificación estructural", tipo: "Estructura reticulada", m2: 13000, ubicacion: "El Triángulo, Garín", model: "famiq-con-hormigon", modelVariants: [
    { model: "famiq-con-hormigon", label: "Reforzada + puente grúa" },
    { model: "famiq-sin-hormigon", label: "Estructura original" },
  ] },
];

function workSurface(item) {
  return item.superficie || (item.m2 != null ? `${item.m2} m²` : "");
}

function WorksGrid({ floor, items, mode, mobile }) {
  const { accent, steel, text } = floor;
  const modalBg = mode === "light" ? "#faf9f6" : "#0d0c14";
  const headingColor = mode === "light" ? "#1a1a1a" : "#f5f5f5";
  const bodyStrong = mode === "light" ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.85)";
  // En claro el fondo estructural del piso es oscuro y contrasta demasiado
  // detrás de fichas casi transparentes; en oscuro el patrón original queda igual.
  const cardBg      = mode === "light" ? mix(accent, floor.bg, 0.92) : `${accent}0a`;
  const cardBgHover  = mode === "light" ? mix(accent, floor.bg, 0.82) : `${accent}18`;
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ width:"100%", maxWidth:"920px", display:"flex", flexDirection:"column", gap: mobile ? "20px" : "28px" }}>

      {/* Header */}
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"0.8rem" }}>
          <div style={{ width:"28px", height:"1.5px", background:accent }}/>
          <span style={{ fontFamily:"'Courier New', monospace", fontSize:"11px", letterSpacing:"0.16em", color:accent, textTransform:"uppercase" }}>{floor.subtitle}</span>
        </div>
        <h1 style={{ fontSize:"clamp(38px, 5vw, 64px)", fontWeight:"normal", color:text, margin:0, lineHeight:0.95, letterSpacing:"-0.03em" }}>{floor.title}</h1>
        <p style={{ fontSize: mobile ? "14px" : "15px", color:text, lineHeight: mobile ? "1.6" : "1.8", margin:"1rem 0 0", opacity:0.65, maxWidth:"620px" }}>{floor.description}</p>
      </div>

      {/* Grid de fichas */}
      <div style={{ display:"grid", gridTemplateColumns: mobile ? "repeat(auto-fill, minmax(150px, 1fr))" : "repeat(3, 1fr)", gap: mobile ? "10px" : "14px" }}>
        {items.map((it, i) => (
          <div key={i} onClick={() => setSelected(it)} style={{
            position:"relative", cursor:"pointer", padding: mobile ? "14px 12px" : "20px 16px",
            border:`1px solid ${accent}33`, background:cardBg,
            transition:"all 0.25s", minHeight: mobile ? "120px" : "150px", gap:"8px",
            display:"flex", flexDirection:"column", justifyContent:"space-between",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.background = cardBgHover; e.currentTarget.style.transform = "translateY(-3px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = `${accent}33`; e.currentTarget.style.background = cardBg; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {[[0,0],[1,0],[0,1],[1,1]].map(([r,b],ci) => (
              <div key={ci} style={{
                position:"absolute", width:"10px", height:"10px",
                top:b===0?0:"auto", bottom:b===1?0:"auto",
                left:r===0?0:"auto", right:r===1?0:"auto",
                borderTop:    b===0?`1.5px solid ${accent}`:"none",
                borderBottom: b===1?`1.5px solid ${accent}`:"none",
                borderLeft:   r===0?`1.5px solid ${accent}`:"none",
                borderRight:  r===1?`1.5px solid ${accent}`:"none",
                opacity:0.7,
              }}/>
            ))}
            <div style={{ fontFamily:"'Courier New', monospace", fontSize:"9px", letterSpacing:"0.18em", color:accent, opacity:0.6 }}>
              {String(i+1).padStart(2,"0")} / {String(items.length).padStart(2,"0")}
            </div>
            <div>
              <div style={{ fontFamily:"Georgia, serif", fontSize:"18px", color:text, marginBottom:"4px", letterSpacing:"-0.01em" }}>{it.obra}</div>
              <div style={{ fontFamily:"'Courier New', monospace", fontSize:"10px", letterSpacing:"0.1em", color:steel, textTransform:"uppercase" }}>{it.cliente}</div>
            </div>
            <div style={{ display:"flex", flexDirection: mobile ? "column" : "row", justifyContent:"space-between", alignItems: mobile ? "flex-start" : "flex-end", fontFamily:"'Courier New', monospace", fontSize:"10px", color:accent, opacity:0.85, gap: mobile ? "2px" : "8px" }}>
              <span style={{ flexShrink:it.superficie ? 1 : 0 }}>{workSurface(it)}</span>
              <span style={{ opacity:0.6, textAlign: mobile ? "left" : "right" }}>{it.ubicacion}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ fontFamily:"'Courier New', monospace", fontSize:"11px", color:steel, letterSpacing:"0.1em", opacity:0.5, display:"flex", gap:"1.5rem" }}>
        <span>NIV. {String(floor.number).padStart(2,"0")}</span><span>+{(floor.number*3.5).toFixed(2)} m</span><span>COTA ±0.00</span>
      </div>

      {/* Modal: ficha técnica */}
      {selected && (
        <div onClick={() => setSelected(null)} {...stopTouch} style={{
          position:"fixed", inset:0, zIndex:200,
          background:"rgba(0,0,0,0.7)",
          display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer",
        }}>
          <div onClick={e => e.stopPropagation()} onWheel={e => e.stopPropagation()} style={{
            background:modalBg, border:`1px solid ${accent}66`,
            padding: mobile ? "36px 18px 22px" : "40px 44px", maxWidth: selected.model ? "840px" : "460px",
            width: mobile ? "calc(100% - 24px)" : "90%", maxHeight: mobile ? "calc(100dvh - 24px)" : "none",
            overflowY: mobile ? "auto" : "visible", boxSizing:"border-box",
            position:"relative", cursor:"default",
          }}>
            {[[0,0],[1,0],[0,1],[1,1]].map(([r,b],i) => (
              <div key={i} style={{
                position:"absolute",
                top:b===0?0:"auto", bottom:b===1?0:"auto",
                left:r===0?0:"auto", right:r===1?0:"auto",
                width:"16px", height:"16px",
                borderTop:    b===0?`2px solid ${accent}`:"none",
                borderBottom: b===1?`2px solid ${accent}`:"none",
                borderLeft:   r===0?`2px solid ${accent}`:"none",
                borderRight:  r===1?`2px solid ${accent}`:"none",
              }}/>
            ))}
            <button onClick={() => setSelected(null)} aria-label="Cerrar" style={{
              position:"absolute", top:"14px", right:"14px",
              width:"26px", height:"26px", display:"flex", alignItems:"center", justifyContent:"center",
              background:"transparent", border:`1px solid ${accent}55`,
              color:accent, fontFamily:"'Courier New', monospace", fontSize:"14px",
              lineHeight:1, cursor:"pointer",
            }}>×</button>
            <div style={{ fontFamily:"'Courier New', monospace", fontSize:"12px", letterSpacing:"0.2em", color:accent, marginBottom:"8px", textTransform:"uppercase" }}>Ficha técnica</div>
            <h2 style={{ fontFamily:"Georgia, serif", fontSize: mobile ? "24px" : "32px", fontWeight:"normal", color:headingColor, margin: mobile ? "0 0 16px" : "0 0 22px", letterSpacing:"-0.02em", paddingRight: mobile ? "30px" : 0 }}>{selected.obra}</h2>
            <div style={{ width:"36px", height:"1.5px", background:accent, marginBottom:"22px" }}/>

            <div style={{ display:"flex", gap: mobile ? "20px" : "32px", flexDirection: selected.model && !mobile ? "row" : "column", flexWrap:"wrap" }}>
              {selected.model && (
                <div style={{
                  flex: mobile ? "0 0 auto" : "1 1 380px", height: mobile ? "280px" : "360px",
                  border:`1px solid ${accent}33`, background:"linear-gradient(180deg, #eef1f2 0%, #dde2e5 100%)",
                  position:"relative", overflow:"hidden",
                }}>
                  <ProjectModelViewer key={selected.model} model={selected.model} variants={selected.modelVariants} accent={accent} />
                  <div style={{
                    position:"absolute", bottom:"8px", left:"10px", pointerEvents:"none",
                    fontFamily:"'Courier New', monospace", fontSize:"9px", letterSpacing:"0.1em",
                    color:"#3a444d", opacity:0.7, background:"rgba(255,255,255,0.6)", padding:"3px 8px",
                  }}>{mobile ? "ARRASTRAR PARA ROTAR" : "🖱️ ARRASTRAR PARA ROTAR · RUEDA PARA ZOOM"}</div>
                </div>
              )}

              <div style={{ flex: mobile ? "0 0 auto" : "1 1 220px", display:"flex", flexDirection:"column", gap: mobile ? "12px" : "18px" }}>
                {[
                  ["Cliente", selected.cliente],
                  ["Obra", selected.obra],
                  ...(selected.tipo ? [["Tipo", selected.tipo]] : []),
                  ["Superficie", workSurface(selected)],
                  ["Ubicación", selected.ubicacion],
                ].filter(([, value]) => value).map(([label, value]) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", gap:"20px", borderBottom:`1px solid ${accent}22`, paddingBottom:"12px" }}>
                    <span style={{ fontFamily:"'Courier New', monospace", fontSize: mobile ? "10px" : "12px", letterSpacing:"0.14em", color:accent, opacity:0.9, textTransform:"uppercase", flexShrink:0 }}>{label}</span>
                    <span style={{ fontFamily:"'Courier New', monospace", fontSize: mobile ? "13px" : "15px", color:bodyStrong, textAlign:"right" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setSelected(null)} style={{
              background:"transparent", border:`1px solid ${accent}66`,
              color:accent, padding:"8px 20px", marginTop:"30px",
              fontFamily:"'Courier New', monospace", fontSize:"10px",
              letterSpacing:"0.15em", cursor:"pointer", textTransform:"uppercase",
            }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

const TOTAL = 8;
const FLOOR_HEIGHT = 220;
const ANIM_MS = 850;
const WIDE_FLOORS = new Set([1, 2, 3, 4, 6]); // Viviendas, Edificios, Naves, Patologías, Clientes

// ─── Utilidades de color: derivan la paleta clara de cada piso a partir de
// su acento, mezclando hacia blanco/negro en vez de codear ~30 colores a mano.
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(hex, target, t) {
  const [r1, g1, b1] = hexToRgb(hex);
  const [r2, g2, b2] = hexToRgb(target);
  const round = v => Math.round(v).toString(16).padStart(2, "0");
  return `#${round(r1 + (r2 - r1) * t)}${round(g1 + (g2 - g1) * t)}${round(b1 + (b2 - b1) * t)}`;
}

const floors = [
  { number: 8, label: "ÁTICO",   title: "Visión",                   subtitle: "Donde todo comienza",              description: "Cada gran proyecto nace de una idea en las alturas. Diseñamos el futuro desde la perspectiva más amplia.", accent: "#c8a96e", bg: "#0c0a06", text: "#f5edd8", steel: "#6a5a3a" },
  { number: 7, label: "PISO 7",  title: "Viviendas",                subtitle: "Diseño y cálculo habitacional",    description: "Calculamos y proyectamos estructuras para viviendas unifamiliares y multifamiliares. Desde la fundación hasta la cubierta, cada detalle importa.", accent: "#b87a5a", bg: "#100806", text: "#f5e0d8", steel: "#6a3a2a" },
  { number: 6, label: "PISO 6",  title: "Edificios",                subtitle: "Estructuras en altura",            description: "Diseño estructural para edificios en altura. Sistemas de hormigón armado y acero que cumplen con las máximas exigencias sísmicas y normativas vigentes.", accent: "#5a9ab0", bg: "#05090e", text: "#d8eef5", steel: "#2a5a6a" },
  { number: 5, label: "PISO 5",  title: "Naves industriales",       lines: ["NAVES", "INDUSTRIALES"],        subtitle: "Galpones y estructuras metálicas", description: "Galpones, depósitos y plantas industriales. Estructuras metálicas livianas y pesadas diseñadas para maximizar la funcionalidad y minimizar los costos.", accent: "#9a9a7a", bg: "#090906", text: "#f0f0e0", steel: "#5a5a3a" },
  { number: 4, label: "PISO 4",  title: "Patologías estructurales", lines: ["PATOLOGÍAS", "ESTRUCTURALES"],  subtitle: "Diagnóstico estructural",          description: "Diagnóstico y reparación de estructuras dañadas. Relevamos, analizamos y proponemos soluciones para edificios con problemas estructurales.", accent: "#7ab87a", bg: "#050e05", text: "#d8f5d8", steel: "#2a5a2a" },
  { number: 3, label: "PISO 3",  title: "Obras especiales",         lines: ["OBRAS", "ESPECIALES"],          subtitle: "Proyectos fuera de lo convencional", description: "Cálculo y proyecto de estructuras atípicas: tanques, silos, chimeneas, muros de contención y fundaciones especiales para equipos e instalaciones singulares.", accent: "#c85a5a", bg: "#0e0505", text: "#f5d8d8", steel: "#5a2a2a" },
  { number: 2, label: "PISO 2",  title: "Clientes",                 subtitle: "Quienes confían en nosotros",      description: "Empresas que eligen rigor, precisión y experiencia para sus proyectos más exigentes.", accent: "#8a7ac8", bg: "#07060e", text: "#e4d8f5", steel: "#3a3a6a" },
  { number: 1, label: "P. BAJA", title: "Contacto",                 subtitle: "Tu proyecto empieza aquí",        description: "Estudio de ingeniería con más de 20 años de experiencia. Contanos tu desafío y lo convertimos en estructura.", accent: "#c0c0c0", bg: "#080808", text: "#f5f5f5", steel: "#5a5a5a" },
];

// Piso a piso, para modo claro: mismo acento pero mezclado hacia blanco/negro
// (fondo tipo papel, texto casi negro, acento con más contraste sobre blanco).
const floorsLight = floors.map(f => ({
  ...f,
  bg: mix(f.accent, "#ffffff", 0.93),
  text: mix(f.accent, "#000000", 0.85),
  steel: mix(f.accent, "#000000", 0.45),
  accent: mix(f.accent, "#000000", 0.35),
}));

const STEEL_DARK  = { CS: "#7a8a8a", CD: "#4a5858", CR: "#9aaaaa", CA: "#b0c4c4" };
const STEEL_LIGHT = {
  CS: mix(STEEL_DARK.CS, "#000000", 0.35),
  CD: mix(STEEL_DARK.CD, "#000000", 0.15),
  CR: mix(STEEL_DARK.CR, "#000000", 0.45),
  CA: mix(STEEL_DARK.CA, "#000000", 0.55),
};
const CS  = STEEL_DARK.CS;
const CD  = STEEL_DARK.CD;
const CR  = STEEL_DARK.CR;
const CA  = STEEL_DARK.CA;

const VB_W = 380;
const VB_H = 700;
const SHAFT_TOP = 35;
const SHAFT_BOT = 665;
const SHAFT_H   = SHAFT_BOT - SHAFT_TOP;
const FLOOR_H_S = SHAFT_H / (TOTAL - 1);
const CAB_W = 74;
const CAB_H = 50;
const CAB_X = 63;
const SHAFT_CX = 100;
const CW_X = 160;

function shaftY(idx) { return SHAFT_TOP + idx * FLOOR_H_S; }

function ElevatorShaft({ current, introCurrent, doorsVisible, arrived, go, accent, mode }) {
  const shaftIdx = doorsVisible ? introCurrent : current;
  const cabinY = shaftY(shaftIdx) - CAB_H / 2;
  const cwY    = SHAFT_H - (cabinY - SHAFT_TOP) + SHAFT_TOP;
  const { CS, CD, CR, CA } = mode === "light" ? STEEL_LIGHT : STEEL_DARK;
  const inactiveLabel = mode === "light" ? "#0a0a0a" : "#ffffff";
  const inactiveLabelOpacity = mode === "light" ? 0.75 : 0.45;
  const inactiveNumberOpacity = mode === "light" ? 0.65 : 0.35;

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

      <rect x={CAB_X - 24} y={SHAFT_TOP - 12} width="2" height={SHAFT_H + 24} fill={CS} fillOpacity="0.1" />
      <rect x={CAB_X + CAB_W + 22} y={SHAFT_TOP - 12} width="2" height={SHAFT_H + 24} fill={CS} fillOpacity="0.1" />

      <circle cx={SHAFT_CX} cy={SHAFT_TOP - 16} r="9" fill="none" stroke={CR} strokeWidth="1.5" strokeOpacity="0.55" />
      <circle cx={SHAFT_CX} cy={SHAFT_TOP - 16} r="3.5" fill={CR} fillOpacity="0.45" />

      <rect x={CAB_X - 11} y={SHAFT_TOP - 12} width="5" height={SHAFT_H + 24} fill={CS} fillOpacity="0.5" />
      <rect x={CAB_X - 14} y={SHAFT_TOP - 12} width="3" height={SHAFT_H + 24} fill={CD} fillOpacity="0.4" />
      <rect x={CAB_X + CAB_W + 6} y={SHAFT_TOP - 12} width="5" height={SHAFT_H + 24} fill={CS} fillOpacity="0.5" />
      <rect x={CAB_X + CAB_W + 11} y={SHAFT_TOP - 12} width="3" height={SHAFT_H + 24} fill={CD} fillOpacity="0.4" />

      <rect x={SHAFT_CX - 11} y={SHAFT_TOP - 7} width="1.4" height={cabinY - (SHAFT_TOP - 7)}
        fill={CS} fillOpacity="0.6"
        style={{ transition: `height ${ANIM_MS}ms cubic-bezier(0.33,1,0.68,1)` }} />
      <rect x={SHAFT_CX + 10} y={SHAFT_TOP - 7} width="1.4" height={cabinY - (SHAFT_TOP - 7)}
        fill={CS} fillOpacity="0.6"
        style={{ transition: `height ${ANIM_MS}ms cubic-bezier(0.33,1,0.68,1)` }} />

      <g style={{ transform: `translateY(${cwY - SHAFT_TOP}px)`, transition: `transform ${ANIM_MS}ms cubic-bezier(0.33,1,0.68,1)` }}>
        <line x1={CW_X} y1={SHAFT_TOP} x2={CW_X} y2={SHAFT_TOP - 10} stroke={CS} strokeWidth="1.2" strokeOpacity="0.45" />
        <rect x={CW_X - 8} y={SHAFT_TOP} width="16" height="26" rx="1"
          fill={CD} fillOpacity="0.3" stroke={CS} strokeWidth="0.8" strokeOpacity="0.45" />
        <line x1={CW_X - 8} y1={SHAFT_TOP + 13} x2={CW_X + 8} y2={SHAFT_TOP + 13}
          stroke={CS} strokeWidth="0.5" strokeOpacity="0.3" />
      </g>

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
              fill={i === arrived ? CA : CS} fillOpacity={i === arrived ? 1 : inactiveNumberOpacity}
              letterSpacing="0.5" textAnchor="middle">
              {String(f.number).padStart(2, "0")}
            </text>
            {i === arrived && <line x1="185" y1={y} x2="198" y2={y} stroke={accent} strokeWidth="1.5" strokeOpacity="0.9" />}
            <text x="202" y={f.lines ? y - 3 : y + 5} fontFamily="'Courier New', monospace" fontSize="14"
              fill={i === arrived ? accent : inactiveLabel}
              fillOpacity={i === arrived ? 1 : inactiveLabelOpacity}
              filter={i === arrived ? "url(#neon)" : undefined}
              letterSpacing="0.8" textAnchor="start">
              {f.lines
                ? f.lines.map((line, li) => <tspan key={li} x="202" dy={li === 0 ? 0 : 15}>{line}</tspan>)
                : f.title.toUpperCase()}
            </text>
          </g>
        );
      })}

      <g style={{ transform: `translateY(${cabinY}px)`, transition: `transform ${doorsVisible ? 1200 : ANIM_MS}ms cubic-bezier(0.33,1,0.68,1)` }}>
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

function SteelWorld({ offsetY, steel, floorsData }) {
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

        <rect x="60" y={-FLOOR_HEIGHT} width="6" height={(sections+2)*FLOOR_HEIGHT} fill={steel} fillOpacity="0.12" />
        <rect x="60" y={-FLOOR_HEIGHT} width="6" height={(sections+2)*FLOOR_HEIGHT} fill="url(#hatch)" />
        <rect x="48" y={-FLOOR_HEIGHT} width="7" height={(sections+2)*FLOOR_HEIGHT} fill={steel} fillOpacity="0.4" />
        <rect x="66" y={-FLOOR_HEIGHT} width="7" height={(sections+2)*FLOOR_HEIGHT} fill={steel} fillOpacity="0.4" />
        <line x1="48" y1={-FLOOR_HEIGHT} x2="48" y2={(sections+2)*FLOOR_HEIGHT} stroke={steel} strokeWidth="0.6" strokeOpacity="0.5" />
        <line x1="73" y1={-FLOOR_HEIGHT} x2="73" y2={(sections+2)*FLOOR_HEIGHT} stroke={steel} strokeWidth="0.6" strokeOpacity="0.5" />

        <rect x="1334" y={-FLOOR_HEIGHT} width="6" height={(sections+2)*FLOOR_HEIGHT} fill={steel} fillOpacity="0.12" />
        <rect x="1334" y={-FLOOR_HEIGHT} width="6" height={(sections+2)*FLOOR_HEIGHT} fill="url(#hatch)" />
        <rect x="1327" y={-FLOOR_HEIGHT} width="7" height={(sections+2)*FLOOR_HEIGHT} fill={steel} fillOpacity="0.4" />
        <rect x="1340" y={-FLOOR_HEIGHT} width="7" height={(sections+2)*FLOOR_HEIGHT} fill={steel} fillOpacity="0.4" />
        <line x1="1327" y1={-FLOOR_HEIGHT} x2="1327" y2={(sections+2)*FLOOR_HEIGHT} stroke={steel} strokeWidth="0.6" strokeOpacity="0.5" />
        <line x1="1347" y1={-FLOOR_HEIGHT} x2="1347" y2={(sections+2)*FLOOR_HEIGHT} stroke={steel} strokeWidth="0.6" strokeOpacity="0.5" />

        {[230, 420, 700, 980, 1170].map(x => (
          <rect key={x} x={x} y={-FLOOR_HEIGHT} width="3" height={(sections+2)*FLOOR_HEIGHT} fill={steel} fillOpacity="0.09" />
        ))}

        {Array.from({ length: sections }, (_, i) => {
          const y  = i * FLOOR_HEIGHT;
          const fi = Math.min(i, TOTAL - 1);
          const fa = floorsData[fi].accent;
          return (
            <g key={i}>
              <rect x="48" y={y-10} width="1299" height="5"  fill={steel} fillOpacity="0.28" />
              <rect x="48" y={y-5}  width="1299" height="10" fill={steel} fillOpacity="0.10" />
              <rect x="48" y={y+5}  width="1299" height="5"  fill={steel} fillOpacity="0.28" />
              <line x1="48" y1={y-10} x2="1347" y2={y-10} stroke={steel} strokeWidth="0.7" strokeOpacity="0.5" />
              <line x1="48" y1={y+10} x2="1347" y2={y+10} stroke={steel} strokeWidth="0.7" strokeOpacity="0.5" />

              <rect x="48"  y={y-18} width="34" height="36" rx="1" fill="none" stroke={fa} strokeWidth="0.9" strokeOpacity="0.4" />
              <rect x="1315" y={y-18} width="34" height="36" rx="1" fill="none" stroke={fa} strokeWidth="0.9" strokeOpacity="0.4" />

              {[56, 65, 74].map(bx => [-11, 11].map(dy => (
                <g key={`${bx}${dy}`}>
                  <circle cx={bx}         cy={y+dy} r="3"   fill={steel} fillOpacity="0.5" />
                  <circle cx={bx}         cy={y+dy} r="1.1" fill={steel} fillOpacity="0.85" />
                  <circle cx={1400-bx}    cy={y+dy} r="3"   fill={steel} fillOpacity="0.5" />
                  <circle cx={1400-bx}    cy={y+dy} r="1.1" fill={steel} fillOpacity="0.85" />
                </g>
              )))}

              {[230, 420, 700, 980, 1170].map(sx => (
                <g key={sx}>
                  <rect x={sx-3} y={y-4} width="6" height="8" fill={steel} fillOpacity="0.38" />
                  <circle cx={sx} cy={y-8} r="2.3" fill={steel} fillOpacity="0.38" />
                  <circle cx={sx} cy={y+8} r="2.3" fill={steel} fillOpacity="0.38" />
                </g>
              ))}

              {[130, 200, 310, 470, 610, 790, 930, 1090, 1200, 1270].map(rx => (
                <g key={rx}>
                  <circle cx={rx} cy={y} r="3" fillOpacity="0.28" fill={steel} />
                  <circle cx={rx} cy={y} r="1.2" fillOpacity="0.55" fill={steel} />
                </g>
              ))}

              <line x1="73"  y1={y+10} x2="227" y2={y+FLOOR_HEIGHT-10} stroke={steel} strokeWidth="2.2" strokeOpacity="0.28" strokeLinecap="round" />
              <line x1="227" y1={y+10} x2="73"  y2={y+FLOOR_HEIGHT-10} stroke={steel} strokeWidth="2.2" strokeOpacity="0.28" strokeLinecap="round" />
              <circle cx="150" cy={y+FLOOR_HEIGHT/2} r="5" fill={steel} fillOpacity="0.15" stroke={steel} strokeWidth="1" strokeOpacity="0.3" />
              <circle cx="150" cy={y+FLOOR_HEIGHT/2} r="2" fill={steel} fillOpacity="0.45" />

              <line x1="1173" y1={y+10} x2="1327" y2={y+FLOOR_HEIGHT-10} stroke={steel} strokeWidth="2.2" strokeOpacity="0.28" strokeLinecap="round" />
              <line x1="1327" y1={y+10} x2="1173" y2={y+FLOOR_HEIGHT-10} stroke={steel} strokeWidth="2.2" strokeOpacity="0.28" strokeLinecap="round" />
              <circle cx="1250" cy={y+FLOOR_HEIGHT/2} r="5" fill={steel} fillOpacity="0.15" stroke={steel} strokeWidth="1" strokeOpacity="0.3" />
              <circle cx="1250" cy={y+FLOOR_HEIGHT/2} r="2" fill={steel} fillOpacity="0.45" />

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

function CabinFrame({ mode }) {
  const { CS, CD, CR, CA } = mode === "light" ? STEEL_LIGHT : STEEL_DARK;
  return (
    <svg style={{ position:"fixed", left:"310px", right:0, top:0, bottom:0, width:"calc(100% - 310px)", height:"100%", pointerEvents:"none", zIndex:20 }}
      viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">

      <rect x="58" y="16" width="884" height="20" rx="2" fill={CS} fillOpacity="0.7" />
      <rect x="58" y="12" width="884" height="7"  rx="1" fill={CD} fillOpacity="0.9" />
      {[100,175,270,380,500,620,730,825,900].map(x=>(
        <g key={x}>
          <circle cx={x} cy={26} r="3.8" fill={CR} fillOpacity="0.65"/>
          <circle cx={x} cy={26} r="1.5" fill={CR} fillOpacity="0.95"/>
        </g>
      ))}

      <rect x="58" y="662" width="884" height="20" rx="2" fill={CS} fillOpacity="0.7" />
      <rect x="58" y="682" width="884" height="7"  rx="1" fill={CD} fillOpacity="0.9" />
      {[100,175,270,380,500,620,730,825,900].map(x=>(
        <g key={x}>
          <circle cx={x} cy={672} r="3.8" fill={CR} fillOpacity="0.65"/>
          <circle cx={x} cy={672} r="1.5" fill={CR} fillOpacity="0.95"/>
        </g>
      ))}

      <rect x="58" y="12"  width="20" height="678" fill={CS} fillOpacity="0.6" />
      <rect x="52" y="12"  width="8"  height="678" fill={CD} fillOpacity="0.85" />
      {[75,155,250,345,440,535,625,700].map(y=>(
        <g key={y}>
          <circle cx={68} cy={y} r="3.8" fill={CR} fillOpacity="0.65"/>
          <circle cx={68} cy={y} r="1.5" fill={CR} fillOpacity="0.95"/>
        </g>
      ))}

      <rect x="922" y="12"  width="20" height="678" fill={CS} fillOpacity="0.6" />
      <rect x="940" y="12"  width="8"  height="678" fill={CD} fillOpacity="0.85" />
      {[75,155,250,345,440,535,625,700].map(y=>(
        <g key={y}>
          <circle cx={932} cy={y} r="3.8" fill={CR} fillOpacity="0.65"/>
          <circle cx={932} cy={y} r="1.5" fill={CR} fillOpacity="0.95"/>
        </g>
      ))}

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

      {[85,575].map(y=>(
        <g key={y}>
          <rect x="42" y={y} width="18" height="32" rx="2" fill={CD} fillOpacity="0.85"/>
          <rect x="940" y={y} width="18" height="32" rx="2" fill={CD} fillOpacity="0.85"/>
        </g>
      ))}

      <line x1="200" y1="0" x2="200" y2="12" stroke={CS} strokeWidth="3" strokeOpacity="0.7"/>
      <line x1="800" y1="0" x2="800" y2="12" stroke={CS} strokeWidth="3" strokeOpacity="0.7"/>
      <line x1="500" y1="0" x2="500" y2="12" stroke={CS} strokeWidth="4" strokeOpacity="0.45"/>
    </svg>
  );
}

export default function App() {
  const [current,      setCurrent]      = useState(0);
  const [display,      setDisplay]      = useState(0);
  const [transitioning,setTransitioning]= useState(false);
  const [direction,    setDirection]    = useState("down");
  const [doorsOpen,    setDoorsOpen]    = useState(false);
  const [doorsVisible, setDoorsVisible] = useState(true);
  const [arrived,      setArrived]      = useState(0);
  const [introCurrent, setIntroCurrent] = useState(TOTAL - 1);
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem("ioca-theme") === "light" ? "light" : "dark"; }
    catch { return "dark"; }
  });
  const [menuOpen,     setMenuOpen]     = useState(false);
  const mobile     = useIsMobile();
  const lastScroll = useRef(0);
  const touchY     = useRef(null);
  const animating  = useRef(false);
  const contentRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem("ioca-theme", mode); } catch { /* almacenamiento no disponible */ }
  }, [mode]);

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
    const t1 = setTimeout(() => { setDoorsOpen(true); setIntroCurrent(0); }, 300);
    const t2 = setTimeout(() => setDoorsVisible(false), 300 + 1600);
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

  const floorsData = mode === "light" ? floorsLight : floors;
  const floor      = floorsData[display];
  const worldOff   = -current * FLOOR_HEIGHT + 280;
  const { CS: sidebarCS } = mode === "light" ? STEEL_LIGHT : STEEL_DARK;

  return (
    <div
      onTouchStart={e => { touchY.current = e.touches[0].clientY; }}
      onTouchEnd={e => {
        if (touchY.current === null) return;
        const d = touchY.current - e.changedTouches[0].clientY;
        touchY.current = null;
        if (menuOpen || Math.abs(d) <= 40) return;
        // Si el contenido del piso tiene scroll, solo cambiar de piso al llegar al borde
        const el = contentRef.current;
        if (el && el.scrollHeight > el.clientHeight + 2) {
          const atTop    = el.scrollTop <= 2;
          const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
          if ((d > 0 && !atBottom) || (d < 0 && !atTop)) return;
        }
        go(current + (d > 0 ? 1 : -1));
      }}
      style={{
        minHeight: "100vh", overflow: "hidden", position: "relative",
        background: floor.bg, transition: "background 0.9s ease",
        userSelect: "none", fontFamily: "'Georgia', serif",
      }}
    >
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
        <SteelWorld offsetY={worldOff} steel={floor.steel} floorsData={floorsData} />
      </div>

      <div style={{
        position: "fixed", inset: 0, zIndex: 5, pointerEvents: "none",
        background: `radial-gradient(ellipse 60% 70% at 55% 50%, transparent 20%, ${floor.bg}c0 100%)`,
        transition: "background 0.9s ease",
      }} />

      {mobile ? (
        <>
          {/* Barra superior (celular) */}
          <div style={{
            position: "fixed", left: 0, right: 0, top: 0, height: "60px", zIndex: 40,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 14px", boxSizing: "border-box",
            borderBottom: `1px solid ${sidebarCS}22`,
            background: `${floor.bg}e6`, backdropFilter: "blur(6px)",
            transition: "background 0.9s ease",
          }}>
            <img src={mode === "light" ? "/logo-blanco.png" : "/logo-final.png"} alt="IOCA" style={{ height: "34px", objectFit: "contain", opacity: 0.9 }} />
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ fontFamily: "'Courier New', monospace", textAlign: "right" }}>
                <div style={{ color: floor.accent, fontSize: "18px", fontWeight: "bold", lineHeight: 1 }}>
                  {String(floor.number).padStart(2, "0")}
                </div>
                <div style={{ color: floor.steel, fontSize: "8px", letterSpacing: "0.2em", marginTop: "2px" }}>{floor.label}</div>
              </div>
              <button onClick={() => setMenuOpen(o => !o)} aria-label="Menú" style={{
                width: "40px", height: "40px", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: "5px",
                background: "transparent", border: `1px solid ${floor.accent}66`, cursor: "pointer", padding: 0,
              }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: "18px", height: "1.5px", background: floor.accent, transition: "all 0.25s",
                    transform: menuOpen ? (i === 0 ? "translateY(6.5px) rotate(45deg)" : i === 2 ? "translateY(-6.5px) rotate(-45deg)" : "none") : "none",
                    opacity: menuOpen && i === 1 ? 0 : 1,
                  }} />
                ))}
              </button>
            </div>
          </div>

          {/* Menú de pisos (celular) */}
          {menuOpen && (
            <div onClick={() => setMenuOpen(false)} {...stopTouch} style={{
              position: "fixed", left: 0, right: 0, top: "60px", bottom: 0, zIndex: 39,
              background: `${floor.bg}f2`, backdropFilter: "blur(6px)",
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "12px 16px 20px", boxSizing: "border-box",
            }}>
              <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "340px", flex: 1, minHeight: 0 }}>
                <ElevatorShaft current={current} introCurrent={introCurrent} doorsVisible={doorsVisible} arrived={arrived}
                  go={i => { setMenuOpen(false); go(i); }} accent={floor.accent} mode={mode} />
              </div>
              <div onClick={e => e.stopPropagation()} style={{ marginTop: "12px", width: "180px", display: "flex", gap: "6px" }}>
                {[["dark", "OSCURO"], ["light", "CLARO"]].map(([val, label]) => (
                  <button key={val} onClick={() => setMode(val)} style={{
                    flex: 1, textAlign: "center",
                    background: mode === val ? `${floor.accent}22` : "transparent",
                    border: `1px solid ${mode === val ? floor.accent : sidebarCS + "44"}`,
                    color: mode === val ? floor.accent : (mode === "light" ? "#1a1a1a" : "#e5e5e5"),
                    padding: "8px 6px",
                    fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "0.04em",
                    cursor: "pointer",
                  }}>{label}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: "22px", marginTop: "12px" }}>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ opacity: 0.7 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="20" height="20" rx="5.5" stroke={sidebarCS} strokeWidth="1.8"/>
                    <circle cx="12" cy="12" r="4.5" stroke={sidebarCS} strokeWidth="1.8"/>
                    <circle cx="17.5" cy="6.5" r="1" fill={sidebarCS}/>
                  </svg>
                </a>
                <a href="https://wa.me/" target="_blank" rel="noreferrer" style={{ opacity: 0.7 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.41A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" stroke={sidebarCS} strokeWidth="1.8" strokeLinejoin="round"/>
                    <path d="M8.5 9.5c.5 1 1.5 3 3.5 4s3-1 3-1-.5-1.5-1-1.5c-.4 0-.8.3-1 .5-.8-.3-2-1.5-2.3-2.3.2-.2.5-.6.5-1 0-.5-1.5-1-1.5-1S8 8.5 8.5 9.5z" fill={sidebarCS}/>
                  </svg>
                </a>
              </div>
            </div>
          )}
        </>
      ) : (
      <div style={{
        position: "fixed", left: 0, top: 0, bottom: 0,
        width: "310px", zIndex: 35,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "16px 8px",
        borderRight: `1px solid ${sidebarCS}22`,
        background: `${floor.bg}cc`,
        transition: "background 0.9s ease",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "12px" }}>
          <img src={mode === "light" ? "/logo-blanco.png" : "/logo-final.png"} alt="IOCA"
            style={{ width: "200px", objectFit: "contain", marginTop: "12px", marginBottom: "8px", opacity: 0.9 }} />
          <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
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
        </div>
        <div style={{ width: "290px", flex: 1, minHeight: 0 }}>
          <ElevatorShaft current={current} introCurrent={introCurrent} doorsVisible={doorsVisible} arrived={arrived} go={go} accent={floor.accent} mode={mode} />
        </div>
        <div style={{ marginTop: "12px", width: "150px", display: "flex", gap: "6px" }}>
          {[["dark", "OSCURO"], ["light", "CLARO"]].map(([val, label]) => (
            <button key={val} onClick={() => setMode(val)} style={{
              flex: 1, textAlign: "center",
              background: mode === val ? `${floor.accent}22` : "transparent",
              border: `1px solid ${mode === val ? floor.accent : sidebarCS + "44"}`,
              color: mode === val ? floor.accent : (mode === "light" ? "#1a1a1a" : "#e5e5e5"),
              padding: "4px 6px",
              fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "0.04em",
              cursor: "pointer", transition: "all 0.2s",
            }}>{label}</button>
          ))}
        </div>
      </div>
      )}

      {doorsVisible && (
        <svg style={{ position:"fixed", left: mobile ? 0 : "310px", right:0, top:0, bottom:0,
          width: mobile ? "100%" : "calc(100% - 310px)", height:"100%", zIndex:45,
          pointerEvents: doorsOpen ? "none" : "all" }}
          viewBox="0 0 1000 700" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="door-grad-l" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#1a2828" />
              <stop offset="100%" stopColor="#243535" />
            </linearGradient>
            <linearGradient id="door-grad-r" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#243535" />
              <stop offset="100%" stopColor="#1a2828" />
            </linearGradient>
            <linearGradient id="shadow-l-inner" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="shadow-r-inner" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#000" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Puerta izquierda */}
          <g style={{
            transformBox: "fill-box",
            transform: doorsOpen ? "translateX(-101%)" : "translateX(0)",
            transition: "transform 1.4s cubic-bezier(0.77,0,0.18,1)",
          }}>
            <rect x="0" y="0" width="500" height="700" fill="url(#door-grad-l)" />
            {[196, 350, 504].map(y => (
              <rect key={y} x="30" y={y} width="440" height="3" rx="1"
                fill={CS} fillOpacity="0.2" />
            ))}
            <rect x="30" y="40" width="440" height="620" rx="3"
              fill="none" stroke={CS} strokeWidth="1.5" strokeOpacity="0.15" />
            {[70, 210, 350, 490, 630].map(y => (
              <g key={y}>
                <circle cx="462" cy={y} r="4" fill={CR} fillOpacity="0.4" />
                <circle cx="462" cy={y} r="1.5" fill={CR} fillOpacity="0.7" />
              </g>
            ))}
            <line x1="499" y1="0" x2="499" y2="700" stroke={CA} strokeWidth="2" strokeOpacity="0.5" />
            <rect x="460" y="0" width="40" height="700" fill="url(#shadow-l-inner)" />
          </g>

          {/* Puerta derecha */}
          <g style={{
            transformBox: "fill-box",
            transform: doorsOpen ? "translateX(101%)" : "translateX(0)",
            transition: "transform 1.4s cubic-bezier(0.77,0,0.18,1)",
          }}>
            <rect x="500" y="0" width="500" height="700" fill="url(#door-grad-r)" />
            {[196, 350, 504].map(y => (
              <rect key={y} x="530" y={y} width="440" height="3" rx="1"
                fill={CS} fillOpacity="0.2" />
            ))}
            <rect x="530" y="40" width="440" height="620" rx="3"
              fill="none" stroke={CS} strokeWidth="1.5" strokeOpacity="0.15" />
            {[70, 210, 350, 490, 630].map(y => (
              <g key={y}>
                <circle cx="538" cy={y} r="4" fill={CR} fillOpacity="0.4" />
                <circle cx="538" cy={y} r="1.5" fill={CR} fillOpacity="0.7" />
              </g>
            ))}
            <line x1="501" y1="0" x2="501" y2="700" stroke={CA} strokeWidth="2" strokeOpacity="0.5" />
            <rect x="500" y="0" width="40" height="700" fill="url(#shadow-r-inner)" />
          </g>
        </svg>
      )}

      <div ref={contentRef} style={mobile ? {
        position: "fixed", left: 0, right: 0, top: "60px", bottom: 0, zIndex: 30,
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "24px 18px 84px", boxSizing: "border-box",
        overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch",
      } : {
        position: "fixed", left: "310px", right: 0, top: 0, bottom: 0, zIndex: 30,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: WIDE_FLOORS.has(display) ? "40px 40px 40px 40px" : "80px 80px 80px 30px",
      }}>
        <div
          key={display}
          style={{
            maxWidth: WIDE_FLOORS.has(display) ? "920px" : "480px", width: "100%",
            margin: mobile ? "auto 0" : 0,
            animation: transitioning
              ? `${direction === "down" ? "exitUp" : "exitDown"} 0.28s ease forwards`
              : `${direction === "down" ? "enterUp" : "enterDown"} 0.6s cubic-bezier(0.16,1,0.3,1) forwards`,
          }}
        >
          {display === 1 ? (
            <WorksGrid floor={floor} items={VIVIENDAS_DATA} mode={mode} mobile={mobile} />
          ) : display === 2 ? (
            <WorksGrid floor={floor} items={EDIFICIOS_DATA} mode={mode} mobile={mobile} />
          ) : display === 3 ? (
            <WorksGrid floor={floor} items={NAVES_DATA} mode={mode} mobile={mobile} />
          ) : display === 4 ? (
            <WorksGrid floor={floor} items={PATOLOGIAS_DATA} mode={mode} mobile={mobile} />
          ) : display === 6 ? (
            <ClientsBelt accent={floor.accent} steel={floor.steel} text={floor.text} bg={floor.bg} mode={mode} mobile={mobile} />
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
                fontSize: mobile ? "clamp(32px, 10vw, 48px)" : "clamp(44px, 5.5vw, 72px)", fontWeight: "normal",
                overflowWrap: "break-word",
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
                fontSize: mobile ? "15px" : "16px", color:floor.text, lineHeight: mobile ? "1.7" : "1.85",
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

      {!mobile && <div style={{
        position:"fixed", top:"60px", right:"60px", zIndex:35,
        fontFamily:"'Courier New', monospace", textAlign:"right",
      }}>
        <div style={{ color:floor.accent, fontSize:"28px", fontWeight:"bold", lineHeight:1 }}>
          {String(floor.number).padStart(2,"0")}
        </div>
        <div style={{ color:floor.steel, fontSize:"9px", letterSpacing:"0.2em", marginTop:"3px" }}>
          {floor.label}
        </div>
      </div>}

      <div style={mobile ? {
        position:"fixed", right:"16px", bottom:"16px",
        display:"flex", flexDirection:"row", gap:"0.6rem", zIndex:35, alignItems:"center",
        padding:"6px", background:`${floor.bg}cc`, backdropFilter:"blur(4px)",
      } : {
        position:"fixed", right:"20px", top:"50%", transform:"translateY(-50%)",
        display:"flex", flexDirection:"column", gap:"0.6rem", zIndex:35, alignItems:"center",
      }}>
        {[["▲", current-1, current===0],["▼", current+1, current===TOTAL-1]].map(([lbl,tgt,dis])=>(
          <button key={lbl} onClick={()=>go(tgt)} disabled={dis} style={{
            background:"transparent",
            border:`1px solid ${dis ? floor.steel : floor.accent}`,
            color: dis ? floor.steel : floor.accent,
            padding: mobile ? "10px 14px" : "8px 12px", cursor: dis?"default":"pointer",
            fontFamily:"'Courier New', monospace", fontSize:"11px",
            opacity: dis?0.3:1, transition:"all 0.3s",
          }}>{lbl}</button>
        ))}
        <span style={{ color:floor.steel, fontFamily:"'Courier New', monospace", fontSize:"10px", letterSpacing:"0.2em", writingMode: mobile ? "horizontal-tb" : "vertical-rl" }}>
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
