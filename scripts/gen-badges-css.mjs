import { readFileSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = import.meta.dirname + "/..";
const BADGES_JSON = join(ROOT, "badges.json");
const BADGES_DIR = join(ROOT, "assets", "img", "badges");
const CSS_OUT = join(ROOT, "assets", "badges.css");

const MIME = { ".png": "image/png", ".gif": "image/gif", ".jpg": "image/jpeg", ".webp": "image/webp" };

const config = JSON.parse(readFileSync(BADGES_JSON, "utf8"));
let css = `.badge{display:inline-block;width:88px;height:31px;image-rendering:pixelated;image-rendering:crisp-edges}\n`;
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

writeFileSync(CSS_OUT, css);
const sizeKb = (Buffer.byteLength(css) / 1024).toFixed(1);
console.log(`badges.css: ${idx} badges, ${sizeKb}kb`);
