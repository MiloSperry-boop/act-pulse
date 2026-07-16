/**
 * Generates ACT Pulse PWA icons as PNGs with zero external dependencies.
 * Draws a navy rounded field with a teal "pulse" (ECG) waveform.
 * Run: node scripts/gen-icons.mjs
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'icons');
mkdirSync(OUT, { recursive: true });

// Colors
const NAVY = [11, 18, 32];
const NAVY2 = [22, 34, 59];
const TEAL = [45, 212, 191];
const TEAL_DK = [13, 148, 136];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePNG(size, pixels) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter none
    for (let x = 0; x < size; x++) {
      const p = pixels[y * size + x];
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = p[0];
      raw[o + 1] = p[1];
      raw[o + 2] = p[2];
      raw[o + 3] = p[3];
    }
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function lerp(a, b, t) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}

function draw(size, { maskable = false } = {}) {
  const px = new Array(size * size);
  const r = maskable ? size : size * 0.22; // corner radius
  const cx = size / 2;
  const cy = size / 2;

  // Pulse polyline (normalized 0..1), ECG-like.
  const pts = [
    [0.1, 0.5],
    [0.32, 0.5],
    [0.4, 0.34],
    [0.5, 0.72],
    [0.58, 0.28],
    [0.66, 0.5],
    [0.9, 0.5],
  ].map(([x, y]) => [x * size, y * size]);
  const lineW = size * 0.055;

  function distToSeg(px_, py_, a, b) {
    const [x1, y1] = a;
    const [x2, y2] = b;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len2 = dx * dx + dy * dy || 1;
    let t = ((px_ - x1) * dx + (py_ - y1) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const lx = x1 + t * dx;
    const ly = y1 + t * dy;
    return Math.hypot(px_ - lx, py_ - ly);
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      // Rounded rect mask
      let inside = true;
      if (!maskable) {
        const qx = Math.abs(x - cx) - (size / 2 - r);
        const qy = Math.abs(y - cy) - (size / 2 - r);
        const d =
          Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) +
          Math.min(Math.max(qx, qy), 0);
        inside = d <= r;
      }
      if (!inside) {
        px[i] = [0, 0, 0, 0];
        continue;
      }
      // Background vertical gradient
      const t = y / size;
      let color = lerp(NAVY2, NAVY, t);

      // Pulse line
      let dmin = Infinity;
      for (let s = 0; s < pts.length - 1; s++) {
        dmin = Math.min(dmin, distToSeg(x, y, pts[s], pts[s + 1]));
      }
      if (dmin < lineW) {
        const edge = Math.max(0, Math.min(1, (lineW - dmin) / (lineW * 0.5)));
        const lc = lerp(TEAL_DK, TEAL, (x / size));
        color = lerp(color, lc, edge);
      }
      px[i] = [...color, 255];
    }
  }
  return encodePNG(size, px);
}

const targets = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-maskable-512.png', size: 512, maskable: true },
  { name: 'apple-touch-icon.png', size: 180, maskable: true },
];

for (const t of targets) {
  const buf = draw(t.size, { maskable: t.maskable });
  const dest =
    t.name === 'apple-touch-icon.png'
      ? join(__dirname, '..', 'public', t.name)
      : join(OUT, t.name);
  writeFileSync(dest, buf);
  console.log('wrote', dest, buf.length, 'bytes');
}
