import React, { useState, useEffect, useRef } from "react";

const AUTO_MS = 4000;

// Pase de imágenes para obras sin modelo 3D (o como alternativa al 3D).
// Avanza solo, se pausa al interactuar y admite deslizar con el dedo.
export default function ImageSlider({ images, accent }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef(null);
  const n = images.length;

  useEffect(() => {
    if (paused || n < 2) return;
    const t = setTimeout(() => setIndex(i => (i + 1) % n), AUTO_MS);
    return () => clearTimeout(t);
  }, [index, paused, n]);

  const go = (i) => { setPaused(true); setIndex((i + n) % n); };

  const arrow = (side) => ({
    position:"absolute", top:"50%", [side]:"8px", transform:"translateY(-50%)",
    width:"34px", height:"34px", display:"flex", alignItems:"center", justifyContent:"center",
    background:"rgba(20,22,26,0.72)", border:`1px solid ${accent}55`, color:accent,
    fontFamily:"serif", fontSize:"22px", lineHeight:1, cursor:"pointer", padding:0, zIndex:2,
  });

  return (
    <div
      style={{ position:"relative", width:"100%", height:"100%", overflow:"hidden", background:"#ffffff", touchAction:"pan-y" }}
      onPointerDown={e => { startX.current = e.clientX; }}
      onPointerUp={e => {
        if (startX.current === null) return;
        const d = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(d) > 40) go(index + (d < 0 ? 1 : -1));
      }}
    >
      <div style={{
        display:"flex", width:`${n * 100}%`, height:"100%",
        transform:`translateX(-${(index * 100) / n}%)`, transition:"transform 0.5s cubic-bezier(0.33,1,0.68,1)",
      }}>
        {images.map((src, i) => (
          <div key={src} style={{ width:`${100 / n}%`, height:"100%", display:"flex", alignItems:"center", justifyContent:"center", padding:"10px", boxSizing:"border-box" }}>
            <img src={src} alt="" draggable={false} style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain", display:"block", userSelect:"none" }} />
          </div>
        ))}
      </div>

      {n > 1 && (
        <>
          <button type="button" aria-label="Anterior" onClick={() => go(index - 1)} style={arrow("left")}>‹</button>
          <button type="button" aria-label="Siguiente" onClick={() => go(index + 1)} style={arrow("right")}>›</button>
          <div style={{ position:"absolute", bottom:"10px", left:0, right:0, display:"flex", justifyContent:"center", gap:"6px", zIndex:2 }}>
            {images.map((_, i) => (
              <button key={i} type="button" aria-label={`Imagen ${i + 1}`} onClick={() => go(i)} style={{
                width:"8px", height:"8px", padding:0, borderRadius:"50%", cursor:"pointer",
                background: i === index ? accent : "rgba(20,22,26,0.25)", border:`1px solid ${accent}`,
              }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
