import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = import.meta.dirname + "/..";
const SRC = join(ROOT, "src");
const DEST = join(ROOT, "content");
const BADGES_JSON = join(ROOT, "badges.json");
const MARKER = "%%BADGES%%";
const LLMS_BODY_MARKER = "%%BODY%%";

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
      html += `      <a href="${b.href}" class="badge badge-${idx}" title="${b.alt}">${b.alt}</a>\n`;
      idx++;
    }
    html += `    </div>\n`;
  }
  html += `  </div>`;
  return html;
}

// --- shorthand DSL ---
function fail(file, lineno, line) {
  throw new Error(`${file}:${lineno}: cannot parse "${line}"`);
}

function detectTab(frontmatter, file) {
  const m = frontmatter.match(/^\s*\.tab\s*=\s*"([^"]+)"/m);
  if (!m) throw new Error(`${file}: missing .tab in frontmatter`);
  return m[1];
}

function renderSection(tab, name) {
  const tag = tab === "peripherals" ? "span" : "p";
  return `  <${tag} class="crypto-sep">[${name}]</${tag}>`;
}

function renderItem(tab, fields, file, lineno, line) {
  const arity = { contacts: [3, 4], projects: [3], peripherals: [2] };
  if (!arity[tab] || !arity[tab].includes(fields.length)) fail(file, lineno, line);

  if (tab === "contacts") {
    const [label, href, display, copy] = fields;
    const labelTag = href
      ? `<a href="${href}" class="contact-label">${label}</a>`
      : `<span class="contact-label">${label}</span>`;
    return [
      `  <div class="contact-item">`,
      `    ${labelTag}`,
      `    <span class="contact-value" data-copy="${copy || display}">${display}</span>`,
      `  </div>`,
    ].join("\n");
  }

  if (tab === "projects") {
    const [title, href, desc] = fields;
    return [
      `  <div class="project-item">`,
      `    <div class="project-details">`,
      `      <a href="${href}" class="project-title">${title}</a>`,
      `      <span class="project-desc">${desc}</span>`,
      `    </div>`,
      `  </div>`,
    ].join("\n");
  }

  // peripherals
  const [label, value] = fields;
  return [
    `  <div class="peripheral-section">`,
    `    <span class="peripheral-label">${label}:</span>`,
    `    <span class="peripheral-value">${value}</span>`,
    `  </div>`,
  ].join("\n");
}

function collectLlmsItem(llms, tab, sectionName, fields) {
  if (tab === "contacts" && sectionName === "contacts") {
    const [label, href, display] = fields;
    if (href) {
      const name = { github: "GitHub", youtube: "YouTube" }[label] ?? `${label[0].toUpperCase()}${label.slice(1)}`;
      llms.contacts.push(`- ${name}: ${display} - ${href}`);
    }
  } else if (tab === "contacts" && sectionName === "crypto") {
    if (fields[3]) llms.crypto.push(`- ${fields[0]}: ${fields[3]}`);
  } else if (tab === "projects") {
    const [title, href, desc] = fields;
    llms.projects.push(desc ? `- ${title} (${desc}): ${href}` : `- ${title}: ${href}`);
  } else if (tab === "peripherals") {
    llms.peripherals.push(`- ${fields[0]}: ${fields[1]}`);
  }
}

function renderRow(centered, rest, file, lineno, line) {
  const tokens = rest.split(" | ");
  const parts = [];
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    if (t.startsWith("//")) { parts.push(`<span class="note">${t}</span>`); i++; continue; }
    const href = tokens[i + 1];
    if (!href || href.startsWith("//")) fail(file, lineno, line);
    parts.push(`<a href="${href}" class="zine-credit">${t}</a>`);
    i += 2;
  }
  const inner = `<span style="white-space:nowrap">${parts.join(" ")}</span>`;
  return centered
    ? `  <div style="text-align:center">${inner}</div>`
    : `  ${inner}`;
}

function generateFromData(dataText, tab, file, llms) {
  const out = [];
  let sectionName = "";
  dataText.split("\n").forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    if (line === MARKER) { out.push(raw); return; }
    const section = line.match(/^\[([^\]]+)\]$/);
    if (section) { sectionName = section[1]; out.push(renderSection(tab, section[1])); return; }
    if (line.startsWith("note | ")) { out.push(`  <p class="note">${line.slice(7)}</p>`); return; }
    const row = line.match(/^row(\.centered)? \| (.+)$/);
    if (row) { out.push(renderRow(!!row[1], row[2], file, i + 1, line)); return; }
    const fields = line.split(/\s*\|\s*/);
    collectLlmsItem(llms, tab, sectionName, fields);
    out.push(renderItem(tab, fields, file, i + 1, line));
  });
  return out.join("\n");
}

function expandShorthand(content, file, llms) {
  const lines = content.split("\n");
  const start = lines.findIndex((l) => l.trim() === "```=data");
  if (start === -1) return null;
  let end = -1;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].trim() === "```") { end = i; break; }
  }
  if (end === -1) throw new Error(`${file}: unterminated \`\`\`=data block`);
  const tab = detectTab(lines.slice(0, start).join("\n"), file);
  const body = generateFromData(lines.slice(start + 1, end).join("\n"), tab, file, llms);
  const block = ["```=html", `<div class="${tab}-content">`, body, "</div>", "```"].join("\n");
  return [...lines.slice(0, start), block, ...lines.slice(end + 1)].join("\n");
}

// --- llms.txt ---
function genLlmsBody(llms) {
  const ziggy = readFileSync(join(ROOT, "zine.ziggy"), "utf8");
  const host = ziggy.match(/\.host_url\s*=\s*"([^"]+)"/)[1].replace(/\/+$/, "");
  const key = (name) => readFileSync(join(ROOT, "assets", name), "utf8").replace(/\s+$/, "");
  const sections = [
    ["## Contacts", llms.contacts],
    ["## Public keys:", [
      "### age key",
      key("age-public.txt"),
      "",
      "### ssh keys",
      key("id_ed25519.txt"),
      "",
      "### pgp key",
      key("gpg.txt"),
    ]],
    ["## Crypto addresses", llms.crypto],
    ["## Projects", llms.projects],
    ["## Peripherals", llms.peripherals],
    ["## Navigation", [
      `- Contacts: ${host}/`,
      `- Projects: ${host}/projects/`,
      `- Peripherals: ${host}/peripherals/`,
      "- Blog: https://shiza.sccl.cc",
    ]],
  ];
  return sections.map(([title, lines]) => [title, ...lines].join("\n")).join("\n\n");
}

function writeLlms(llms) {
  const template = readFileSync(join(ROOT, "assets", "llms.header.txt"), "utf8");
  if (!template.includes(LLMS_BODY_MARKER)) {
    throw new Error("assets/llms.header.txt: missing %%BODY%% marker");
  }
  const body = genLlmsBody(llms);
  writeFileSync(join(ROOT, "assets", "llms.txt"), template.replace(LLMS_BODY_MARKER, () => body));
}

// --- copy src/ → content/ with replacements ---
if (!existsSync(DEST)) mkdirSync(DEST, { recursive: true });

const badgesHtml = genBadgesHtml();
const files = readdirSync(SRC).filter(f => extname(f) === ".smd");
const llms = { contacts: [], crypto: [], projects: [], peripherals: [] };

for (const file of files) {
  const srcPath = join(SRC, file);
  const destPath = join(DEST, file);
  let content = readFileSync(srcPath, "utf8");

  const expanded = expandShorthand(content, file, llms);
  if (expanded !== null) content = expanded;

  if (content.includes(MARKER)) {
    content = content.replace(MARKER, badgesHtml);
  }

  writeFileSync(destPath, content);
}

writeLlms(llms);

console.log(`generated ${files.length} files → content/, assets/llms.txt`);
