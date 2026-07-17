/**
 * Generates the app's PWA icons as PNGs with zero external dependencies.
 * Design: bold dark-blue "ACT" letters on a white field.
 * Letters are drawn geometrically (stroked segments + an arc), no font needed.
 * Run: node scripts/gen-icons.mjs
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'icons');
mkdirSync(OUT, { recursive: true });

const WHITE = [255, 255, 255];
const BLUE = [30, 58, 138]; // #1e3a8a — classic dark blue

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
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
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
function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function distToSeg(px_, py_, a, b) {
  const [x1, y1] = a;
  const [x2, y2] = b;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px_ - x1) * dx + (py_ - y1) * dy) / len2;
  t = clamp01(t);
  return Math.hypot(px_ - (x1 + t * dx), py_ - (y1 + t * dy));
}

function draw(size, { maskable = false } = {}) {
  const px = new Array(size * size);
  const r = maskable ? size : size * 0.22;
  const cx = size / 2;
  const cy = size / 2;

  // ── Letterforms (normalized 0..1 coordinates) ─────────────────────────
  const top = 0.36;
  const bottom = 0.64;
  const midY = (top + bottom) / 2;
  const w = 0.062; // stroke half-ish width (full width used as threshold)

  // A — centered at 0.235
  const A = { apex: [0.235, top], bl: [0.15, bottom], br: [0.32, bottom] };
  const aCross = [
    [0.235 + (0.15 - 0.235) * 0.55, top + (bottom - top) * 0.62],
    [0.235 + (0.32 - 0.235) * 0.55, top + (bottom - top) * 0.62],
  ];
  const A_SEGS = [
    [A.apex, A.bl],
    [A.apex, A.br],
    aCross,
  ];

  // C — ring centered at 0.5 with a right-facing gap
  const C = { cx: 0.5, cy: midY, R: (bottom - top) / 2, gapDeg: 55 };

  // T — centered at 0.765
  const T_SEGS = [
    [
      [0.675, top],
      [0.855, top],
    ],
    [
      [0.765, top],
      [0.765, bottom],
    ],
  ];

  const SEGS = [...A_SEGS, ...T_SEGS];
  const aa = 1.3 / size; // anti-alias band

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;

      // Rounded-rect mask
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

      const nx = x / size;
      const ny = y / size;
      let color = WHITE;

      // Distance to the nearest letter stroke.
      let dmin = Infinity;
      for (const [a, b] of SEGS) dmin = Math.min(dmin, distToSeg(nx, ny, a, b));

      // C as an arc: |distance from ring| with the right gap excluded.
      const dc = Math.hypot(nx - C.cx, ny - C.cy);
      const angle = (Math.atan2(ny - C.cy, nx - C.cx) * 180) / Math.PI; // -180..180
      if (Math.abs(angle) > C.gapDeg) {
        dmin = Math.min(dmin, Math.abs(dc - C.R));
      }

      const half = w / 2;
      if (dmin < half + aa) {
        const cov = clamp01((half + aa - dmin) / (2 * aa));
        color = lerp(WHITE, BLUE, cov);
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
