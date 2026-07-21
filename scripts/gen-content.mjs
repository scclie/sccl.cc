import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = import.meta.dirname + "/..";
const SRC = join(ROOT, "src");
const DEST = join(ROOT, "content");
const BADGES_JSON = join(ROOT, "badges.json");
const MARKER = "%%BADGES%%";

// --- badges HTML ---
function genBadgesHtml() {
  const config = JSON.parse(readFileSync(BADGES_JSON, "utf8"));
  let html = `<div class="buttons-content">\n`;
  let idx = 0;

  for (const group of ["my", "friends"]) {
    const g = config[group];
    if (!g || !g.badges || !g.badges.length) continue;
    if (g.note) html += `    <span class="note">${g.note}</span>\n`;
    html += `    <div class="buttons-row">\n`;
    for (const b of g.badges) {
      if (!b.file) { idx++; continue; }
      html += `      <a href="${b.href}" class="badge badge-${idx}" title="${b.alt}"></a>\n`;
      idx++;
    }
    html += `    </div>\n`;
  }
  html += `  </div>`;
  return html;
}

// --- copy src/ → content/ with replacements ---
if (!existsSync(DEST)) mkdirSync(DEST, { recursive: true });

const badgesHtml = genBadgesHtml();
const files = readdirSync(SRC).filter(f => extname(f) === ".smd");

for (const file of files) {
  const srcPath = join(SRC, file);
  const destPath = join(DEST, file);
  let content = readFileSync(srcPath, "utf8");

  if (content.includes(MARKER)) {
    content = content.replace(MARKER, badgesHtml);
  }

  writeFileSync(destPath, content);
}

console.log(`generated ${files.length} files → content/`);
