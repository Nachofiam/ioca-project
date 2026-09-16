import React, { useState } from "react";
import ModelViewer from "./ModelViewer";

export default function ProjectModelViewer({ model, variants, accent }) {
  const [variantIndex, setVariantIndex] = useState(0);
  const options = variants?.length ? variants : [{ model }];
  const active = options[variantIndex];

  return (
    <div style={{ position:"relative", width:"100%", height:"100%", display:"flex", flexDirection:"column" }}>
      {options.length > 1 && (
        <div style={{ display:"flex", gap:"8px", padding:"8px 10px", background:"#eef1f2", borderBottom:"1px solid #b8c0c5", flexShrink:0 }}>
          {options.map((opt, i) => {
            const isActive = i === variantIndex;
            return (
              <button key={opt.model} type="button" onClick={() => setVariantIndex(i)} style={{
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
      <div style={{ flex:1, minHeight:0 }}>
        <ModelViewer key={active.model} slug={active.model} accent={accent} />
      </div>
    </div>
  );
}
