import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ModelViewer from "./ModelViewer";
import ImageSlider from "./ImageSlider";

// Visor de una obra: uno o más modelos 3D (variants) y/o un pase de imágenes.
// Si hay más de una opción, se muestran pestañas para elegir. Se puede ampliar a pantalla completa.
export default function ProjectModelViewer({ model, variants, images, accent, hint }) {
  const [variantIndex, setVariantIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const options = variants?.length ? [...variants] : model ? [{ model, label: "Estructura 3D" }] : [];
  if (images?.length) options.push({ images, label: "Imágenes" });
  const active = options[variantIndex];

  useEffect(() => {
    if (!expanded) return;
    const onKey = e => { if (e.key === "Escape") { e.stopPropagation(); setExpanded(false); } };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [expanded]);

  const cornerButton = {
    position:"absolute", top:"8px", right:"8px", zIndex:3,
    width:"32px", height:"32px", display:"flex", alignItems:"center", justifyContent:"center",
    background:"rgba(20,22,26,0.72)", backdropFilter:"blur(3px)", border:`1px solid ${accent}55`,
    color:accent, fontSize:"16px", lineHeight:1, cursor:"pointer", padding:0,
  };

  const content = (
    <div style={{ position:"relative", width:"100%", height:"100%", display:"flex", flexDirection:"column" }}>
      {options.length > 1 && (
        <div style={{ display:"flex", gap:"8px", padding:"8px 10px", background:"#eef1f2", borderBottom:"1px solid #b8c0c5", flexShrink:0 }}>
          {options.map((opt, i) => {
            const isActive = i === variantIndex;
            return (
              <button key={opt.model || "images"} type="button" onClick={() => setVariantIndex(i)} style={{
                flex:1, background: isActive ? accent : "transparent",
                border:`1px solid ${accent}`, color: isActive ? "#0d1a12" : "#344038",
                fontWeight: isActive ? "bold" : "normal", padding:"7px 8px",
                fontFamily:"'Courier New', monospace", fontSize:"10.5px", letterSpacing:"0.02em",
                cursor: isActive ? "default" : "pointer", transition:"all 0.15s",
              }}>{opt.label}</button>
            );
          })}
        </div>
      )}
      <div style={{ flex:1, minHeight:0, position:"relative" }}>
        {active.images
          ? <ImageSlider images={active.images} accent={accent} />
          : <ModelViewer key={active.model} slug={active.model} accent={accent} />}
        {!active.images && hint && (
          <div style={{
            position:"absolute", bottom:"8px", left:"10px", pointerEvents:"none",
            fontFamily:"'Courier New', monospace", fontSize:"9px", letterSpacing:"0.1em",
            color:"#3a444d", opacity:0.7, background:"rgba(255,255,255,0.6)", padding:"3px 8px",
          }}>{hint}</div>
        )}
        <button type="button" onClick={() => setExpanded(e => !e)}
          aria-label={expanded ? "Cerrar vista ampliada" : "Ampliar"} title={expanded ? "Cerrar (Esc)" : "Ampliar"}
          style={cornerButton}>
          {expanded ? "✕" : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );

  if (!expanded) return content;

  // Vista ampliada: por encima de todo, en un portal para no quedar atrapada dentro del modal
  return (
    <>
      <div style={{ width:"100%", height:"100%", background:"#eef1f2" }} />
      {createPortal(
        <div
          onClick={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
          onTouchEnd={e => e.stopPropagation()}
          onWheel={e => e.stopPropagation()}
          style={{
            position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.85)",
            padding:"max(12px, 2vmin)", boxSizing:"border-box",
          }}
        >
          <div style={{ width:"100%", height:"100%", background:"linear-gradient(180deg, #eef1f2 0%, #dde2e5 100%)", border:`1px solid ${accent}66` }}>
            {content}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
