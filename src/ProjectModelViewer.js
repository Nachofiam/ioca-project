import React, { useState } from "react";
import ModelViewer from "./ModelViewer";

export default function ProjectModelViewer({ model, variants, accent }) {
  const [variantIndex, setVariantIndex] = useState(0);
  const options = variants?.length ? variants : [{ model }];
  const active = options[variantIndex];
  const nextIndex = (variantIndex + 1) % options.length;

  return (
    <div style={{ position:"relative", width:"100%", height:"100%", display:"flex", flexDirection:"column" }}>
      {options.length > 1 && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px", padding:"8px 10px", background:"#eef1f2", borderBottom:"1px solid #b8c0c5", flexShrink:0 }}>
          <span aria-live="polite" style={{ fontFamily:"'Courier New', monospace", fontSize:"11px", color:"#344038" }}>
            {active.label}
          </span>
          <button type="button" onClick={() => setVariantIndex(nextIndex)} style={{
            background:"#18251c", border:`1px solid ${accent}`, color:"#e4f5e4", padding:"7px 10px",
            fontFamily:"'Courier New', monospace", fontSize:"11px", cursor:"pointer",
          }}>Ver {options[nextIndex].label.toLocaleLowerCase("es")}</button>
        </div>
      )}
      <div style={{ flex:1, minHeight:0 }}>
        <ModelViewer key={active.model} slug={active.model} accent={accent} />
      </div>
    </div>
  );
}
