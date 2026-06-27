import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

const PUBLIC_DIR = path.resolve('public')
const PORT = 31415
const OG_WIDTH = 1200
const OG_HEIGHT = 630
const OUTPUT = path.join(PUBLIC_DIR, 'img', 'og-contacts.png')

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
}

function serve(req, res) {
  let p = new URL(req.url, 'http://localhost').pathname
  if (p.endsWith('/')) p += 'index.html'
  const fp = path.join(PUBLIC_DIR, p)
  if (!fp.startsWith(PUBLIC_DIR)) { res.writeHead(403); res.end(); return }

  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end(); return }
    const ext = path.extname(fp)
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    res.end(data)
  })
}

async function main() {
  const server = http.createServer(serve)
  await new Promise(r => server.listen(PORT, r))
  console.log(`Server on http://localhost:${PORT}`)

  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: OG_WIDTH, height: OG_HEIGHT })

  await page.goto(`http://localhost:${PORT}/contacts/`, { waitUntil: 'networkidle' })
  // extra wait for fonts & encoding-errors animation
  await page.waitForTimeout(2000)

  // expand all crypto addresses and widen card
  await page.evaluate(() => {
    document.querySelectorAll('.contact-value[data-copy]').forEach(el => {
      el.textContent = el.getAttribute('data-copy')
    })
    const card = document.querySelector('.card')
    card.style.maxWidth = 'none'
    card.style.width = '1100px'
  })

  // full viewport screenshot — card nearly fills 1200×630
  await page.screenshot({ path: OUTPUT, type: 'png' })
  console.log(`OG image saved: ${OUTPUT}`)

  await browser.close()
  server.close()
}

main().catch(e => { console.error(e); process.exit(1) })
