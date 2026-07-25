import { readFileSync, writeFileSync, readdirSync, unlinkSync } from "node:fs";
import { join, extname } from "node:path";
import { createHash } from "node:crypto";

const ROOT = import.meta.dirname + "/..";
const BADGES_JSON = join(ROOT, "badges.json");
const BADGES_DIR = join(ROOT, "assets", "img", "badges");
const ASSETS_DIR = join(ROOT, "assets");
const LAYOUT = join(ROOT, "layouts", "page.shtml");
const ZIGGY = join(ROOT, "zine.ziggy");

const MIME = { ".png": "image/png", ".gif": "image/gif", ".jpg": "image/jpeg", ".webp": "image/webp" };

const config = JSON.parse(readFileSync(BADGES_JSON, "utf8"));
let css = `.badge{display:inline-block;width:88px;height:31px;font-size:0;image-rendering:pixelated;image-rendering:crisp-edges}\n`;
let idx = 0;

for (const group of ["my", "friends"]) {
  const badges = config[group]?.badges || [];
  for (const b of badges) {
    if (!b.file) { idx++; continue; }
    const buf = readFileSync(join(BADGES_DIR, b.file));
    const ext = extname(b.file).toLowerCase();
    const mime = MIME[ext] || "image/png";
    css += `.badge-${idx}{background:url(data:${mime};base64,${buf.toString("base64")}) no-repeat 0 0}\n`;
    idx++;
  }
}

// clean old hashed files
for (const f of readdirSync(ASSETS_DIR)) {
  if (/^badges\.[a-f0-9]+\.css$/.test(f)) unlinkSync(join(ASSETS_DIR, f));
}

const hash = createHash("md5").update(css).digest("hex").slice(0, 8);
const filename = `badges.${hash}.css`;
writeFileSync(join(ASSETS_DIR, filename), css);

let layout = readFileSync(LAYOUT, "utf8");
layout = layout.replace(/href="\/badges[^"]*"/, `href="/${filename}"`);
writeFileSync(LAYOUT, layout);

let ziggy = readFileSync(ZIGGY, "utf8");
ziggy = ziggy.replace(/"badges[^"]*\.css"/, `"${filename}"`);
writeFileSync(ZIGGY, ziggy);

const sizeKb = (Buffer.byteLength(css) / 1024).toFixed(1);
console.log(`${filename}: ${idx} badges, ${sizeKb}kb`);
