// Convierte un DXF (malla 3D real, polyface mesh por capa) a un modelo compacto
// para el visor 3D: <slug>.bin (triángulos en Float32, agrupados por categoría
// estructural) + <slug>.json (manifest: bounds y offsets por categoría).
//
// Uso: node scripts/dxf-to-model.js <archivo.dxf> <slug>
// Ej:  node scripts/dxf-to-model.js "../Edificios/Aristobulo.dxf" aristobulo

const fs = require("fs");
const path = require("path");
const DxfParser = require("dxf-parser");

const CATEGORY_ORDER = ["PILAR", "VIGA", "MURO", "CIMENTACION", "LOSA", "OTRO"];

function classify(layer) {
  if (!layer) return "OTRO";
  for (const cat of CATEGORY_ORDER) {
    if (cat !== "OTRO" && layer.includes(cat)) return cat;
  }
  return "OTRO";
}

function extract(dxfPath) {
  const text = fs.readFileSync(dxfPath, "utf8");
  const dxf = new DxfParser().parseSync(text);

  const triangles = Object.fromEntries(CATEGORY_ORDER.map(c => [c, []]));
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  let triCount = 0;

  for (const e of dxf.entities) {
    if (e.type !== "POLYLINE" || !e.isPolyfaceMesh) continue;
    const cat = classify(e.layer);

    const corners = [];
    const faces = [];
    for (const v of e.vertices) {
      if (v.faceA !== undefined) {
        faces.push([v.faceA, v.faceB, v.faceC]);
        // El cuarto índice es opcional; los índices negativos ocultan aristas.
        if (v.faceD && Math.abs(v.faceD) !== Math.abs(v.faceC)) {
          faces.push([v.faceA, v.faceC, v.faceD]);
        }
      }
      else corners.push([v.x, v.y, v.z]);
    }

    for (const f of faces) {
      const idx = f.map(n => Math.abs(n) - 1);
      if (idx.some(i => i < 0 || i >= corners.length)) continue;
      const [a, b, c] = idx.map(i => corners[i]);
      // DXF es Z-up; three.js es Y-up: (x,y,z) -> (x,z,y)
      for (const p of [a, b, c]) {
        const px = p[0], py = p[2], pz = p[1];
        triangles[cat].push(px, py, pz);
        minX = Math.min(minX, px); maxX = Math.max(maxX, px);
        minY = Math.min(minY, py); maxY = Math.max(maxY, py);
        minZ = Math.min(minZ, pz); maxZ = Math.max(maxZ, pz);
      }
      triCount++;
    }
  }

  return { triangles, bounds: { minX, minY, minZ, maxX, maxY, maxZ }, triCount };
}

function write(slug, outDir, { triangles, bounds, triCount }) {
  fs.mkdirSync(outDir, { recursive: true });

  const parts = [];
  const categories = {};
  let offset = 0;
  for (const cat of CATEGORY_ORDER) {
    const arr = triangles[cat];
    if (!arr.length) continue;
    const f32 = Float32Array.from(arr);
    parts.push(Buffer.from(f32.buffer));
    categories[cat] = { offset, count: arr.length / 9 };
    offset += f32.byteLength;
  }

  fs.writeFileSync(path.join(outDir, `${slug}.bin`), Buffer.concat(parts));
  fs.writeFileSync(
    path.join(outDir, `${slug}.json`),
    JSON.stringify({ bounds, triCount, categories })
  );
}

const [, , dxfPath, slug] = process.argv;
if (!dxfPath || !slug) {
  console.error("Uso: node scripts/dxf-to-model.js <archivo.dxf> <slug>");
  process.exit(1);
}

const outDir = path.join(__dirname, "..", "public", "models");
const result = extract(dxfPath);
write(slug, outDir, result);

console.log(`OK: ${slug} -> ${result.triCount} triangulos`);
for (const cat of CATEGORY_ORDER) {
  if (result.triangles[cat].length) console.log(`  ${cat}: ${result.triangles[cat].length / 9}`);
}
