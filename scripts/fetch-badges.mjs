import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "node:fs";
import { join, extname, resolve } from "node:path";

const ROOT = import.meta.dirname + "/..";
const BADGES_JSON = join(ROOT, "badges.json");
const BADGES_DIR = join(ROOT, "assets", "img", "badges");

if (!existsSync(BADGES_DIR)) mkdirSync(BADGES_DIR, { recursive: true });

const config = JSON.parse(readFileSync(BADGES_JSON, "utf8"));
let idx = 0;

for (const group of ["my", "friends"]) {
  const badges = config[group]?.badges || [];
  for (const b of badges) {
    let ext, filename, dest;

    if (b.local) {
      ext = extname(b.local);
      filename = `${idx}${ext}`;
      dest = join(BADGES_DIR, filename);
      const src = resolve(ROOT, "assets", b.local.replace(/^\.\.\//, ""));
      process.stdout.write(`local ${b.local} → ${filename} ... `);
      try {
        copyFileSync(src, dest);
        const size = readFileSync(dest).length;
        console.log(`${(size / 1024).toFixed(1)}kb`);
      } catch (e) {
        console.log(`FAILED: ${e.message}`);
        idx++;
        continue;
      }
    } else if (b.url) {
      ext = extname(new URL(b.url).pathname) || ".png";
      filename = `${idx}${ext}`;
      dest = join(BADGES_DIR, filename);
      process.stdout.write(`fetch ${b.url} → ${filename} ... `);
      try {
        const res = await fetch(b.url, {
          headers: { "User-Agent": "sccl-badge-collector/1.0" },
          redirect: "follow",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        writeFileSync(dest, buf);
        console.log(`${(buf.length / 1024).toFixed(1)}kb`);
      } catch (e) {
        console.log(`FAILED: ${e.message}`);
        idx++;
        continue;
      }
    } else {
      idx++;
      continue;
    }

    b.file = filename;
    idx++;
  }
}

writeFileSync(BADGES_JSON, JSON.stringify(config, null, 2) + "\n");
const total = (config.my?.badges?.length || 0) + (config.friends?.badges?.length || 0);
console.log(`\ndone. ${total} badges processed.`);
