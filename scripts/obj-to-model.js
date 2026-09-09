// Convierte un OBJ (export de Blender/SketchUp) a un modelo compacto para el
// visor 3D: <slug>.bin (triángulos en Float32) + <slug>.json (manifest).
// A diferencia de dxf-to-model.js, no clasifica por capa estructural (el OBJ
// no trae esa info) — todo va a la categoría OTRO.
//
// Uso: node scripts/obj-to-model.js <archivo.obj> <slug> [--object=Nombre] [--scale=1]
//   --object  sólo incluye el objeto ("o ...") cuyo nombre coincide (substring)
//   --scale   factor multiplicador aplicado a todas las coordenadas

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const [objPath, slug] = args.filter(a => !a.startsWith("--"));
const objectFilter = (args.find(a => a.startsWith("--object=")) || "").slice(9) || null;
const scale = parseFloat((args.find(a => a.startsWith("--scale=")) || "").slice(8)) || 1;

if (!objPath || !slug) {
  console.error("Uso: node scripts/obj-to-model.js <archivo.obj> <slug> [--object=Nombre] [--scale=1]");
  process.exit(1);
}

const text = fs.readFileSync(objPath, "utf8");
const lines = text.split("\n");

const vertices = []; // flat [x,y,z, x,y,z, ...]
const triangles = [];
let currentObjectMatches = !objectFilter;
let minX = Infinity, minY = Infinity, minZ = Infinity;
let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

for (const line of lines) {
  if (line.charCodeAt(0) === 111 && line[1] === " ") { // "o "
    const name = line.slice(2).trim();
    currentObjectMatches = !objectFilter || name.includes(objectFilter);
    continue;
  }
  if (line.charCodeAt(0) === 118 && line[1] === " ") { // "v "
    const parts = line.split(/\s+/);
    vertices.push(
      parseFloat(parts[1]) * scale,
      parseFloat(parts[2]) * scale,
      parseFloat(parts[3]) * scale
    );
    continue;
  }
  if (line.charCodeAt(0) === 102 && line[1] === " ") { // "f "
    if (!currentObjectMatches) continue;
    const parts = line.trim().split(/\s+/).slice(1);
    const idx = parts.map(p => parseInt(p.split("/")[0], 10) - 1);
    // fan triangulation (funciona para triángulos y polígonos convexos)
    for (let i = 1; i < idx.length - 1; i++) {
      for (const vi of [idx[0], idx[i], idx[i + 1]]) {
        const x = vertices[vi * 3], y = vertices[vi * 3 + 1], z = vertices[vi * 3 + 2];
        triangles.push(x, y, z);
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
      }
    }
  }
}

const f32 = Float32Array.from(triangles);
const outDir = path.join(__dirname, "..", "public", "models");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, `${slug}.bin`), Buffer.from(f32.buffer));
fs.writeFileSync(
  path.join(outDir, `${slug}.json`),
  JSON.stringify({
    bounds: { minX, minY, minZ, maxX, maxY, maxZ },
    triCount: triangles.length / 9,
    categories: { OTRO: { offset: 0, count: triangles.length / 9 } },
  })
);

console.log(`OK: ${slug} -> ${triangles.length / 9} triangulos`);
console.log(`  bounds: X ${minX.toFixed(2)}..${maxX.toFixed(2)}  Y ${minY.toFixed(2)}..${maxY.toFixed(2)}  Z ${minZ.toFixed(2)}..${maxZ.toFixed(2)}`);
