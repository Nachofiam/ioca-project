const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

test("converts a polyface quad completely, including invisible edges and Z-up coordinates", () => {
  const slug = `test-quad-${process.pid}`;
  const input = path.join(os.tmpdir(), `${slug}.dxf`);
  const output = path.join(__dirname, "..", "public", "models", slug);
  const pairs = [0,"SECTION",2,"ENTITIES",0,"POLYLINE",8,"VIGA",66,1,70,64,10,0,20,0,30,0];
  for (const [x,y,z] of [[0,0,2],[2,0,2],[2,3,2],[0,3,2]]) {
    pairs.push(0,"VERTEX",70,192,10,x,20,y,30,z);
  }
  pairs.push(0,"VERTEX",70,128,10,0,20,0,30,0,71,1,72,-2,73,3,74,4,0,"SEQEND",0,"ENDSEC",0,"EOF");
  try {
    fs.writeFileSync(input, pairs.join("\n") + "\n");
    execFileSync(process.execPath, [path.join(__dirname,"dxf-to-model.js"), input, slug]);
    const manifest = JSON.parse(fs.readFileSync(`${output}.json`, "utf8"));
    assert.equal(manifest.triCount, 2);
    assert.equal(manifest.categories.VIGA.count, 2);
    const bytes = fs.readFileSync(`${output}.bin`);
    assert.equal(bytes.length, 72);
    const values = Array.from({length:18}, (_,i) => bytes.readFloatLE(i*4));
    assert.deepEqual(values, [0,2,0,2,2,0,2,2,3,0,2,0,2,2,3,0,2,3]);
  } finally {
    for (const file of [input, `${output}.json`, `${output}.bin`]) {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
  }
});
