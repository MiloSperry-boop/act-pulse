/**
 * Generates Summit PWA icons as PNGs with zero external dependencies.
 * Design: violet-ink field, an iris mountain peak with a shaded facet,
 * and a coral point marking the summit.
 * Run: node scripts/gen-icons.mjs
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'icons');
mkdirSync(OUT, { recursive: true });

// Colors — matches the app's iris/coral identity.
const INK = [12, 13, 20]; // #0c0d14
const INK2 = [33, 36, 51]; // #212433
const IRIS = [139, 140, 247]; // #8b8cf7
const IRIS_DK = [84, 87, 224]; // #5457e0
const IRIS_SHADE = [65, 67, 196]; // #4143c4
const CORAL = [255, 122, 90]; // #ff7a5a

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
function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function draw(size, { maskable = false } = {}) {
  const px = new Array(size * size);
  const r = maskable ? size : size * 0.22; // corner radius
  const cx = size / 2;
  const cy = size / 2;

  // Mountain geometry (normalized). Main peak with a secondary shoulder.
  const apex = { x: 0.5, y: 0.3 };
  const shoulder = { x: 0.7, y: 0.52 }; // secondary ridge point on the right
  const baseY = 0.78;
  const leftFoot = 0.13;
  const rightFoot = 0.87;

  /** Ridge height (normalized y) at normalized x; baseY outside the mountain. */
  function ridgeAt(nx) {
    if (nx <= leftFoot || nx >= rightFoot) return baseY;
    if (nx <= apex.x) {
      // left slope: foot → apex
      const t = (nx - leftFoot) / (apex.x - leftFoot);
      return baseY + (apex.y - baseY) * t;
    }
    if (nx <= shoulder.x) {
      // right slope: apex → shoulder
      const t = (nx - apex.x) / (shoulder.x - apex.x);
      return apex.y + (shoulder.y - apex.y) * t;
    }
    // shoulder → right foot
    const t = (nx - shoulder.x) / (rightFoot - shoulder.x);
    return shoulder.y + (baseY - shoulder.y) * t;
  }

  const aa = 1.25 / size; // ~1.25px anti-alias band in normalized units
  const dotR = 0.052;
  const dot = { x: apex.x, y: apex.y - 0.085 };

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

      // Background diagonal gradient (violet-ink).
      let color = lerp(INK2, INK, (nx + ny) / 2);

      // Mountain fill: between the ridge line and the base line.
      const ridge = ridgeAt(nx);
      if (ny > ridge - aa && ny < baseY + aa) {
        // Anti-aliased coverage at the ridge and base edges.
        const topCov = clamp01((ny - (ridge - aa)) / (2 * aa));
        const botCov = clamp01(((baseY + aa) - ny) / (2 * aa));
        const cov = Math.min(topCov, botCov);
        if (cov > 0) {
          // Vertical gradient up the face; right of the apex is the shaded facet.
          const h = clamp01((baseY - ny) / (baseY - apex.y));
          let face = lerp(IRIS_DK, IRIS, h);
          if (nx > apex.x) face = lerp(face, IRIS_SHADE, 0.45);
          color = lerp(color, face, cov);
        }
      }

      // Coral summit point (soft glow + solid core) above the apex.
      const dDot = Math.hypot(nx - dot.x, ny - dot.y);
      if (dDot < dotR * 2.4) {
        const glow = Math.max(0, 1 - dDot / (dotR * 2.4)) * 0.32;
        color = lerp(color, CORAL, glow);
      }
      if (dDot < dotR) {
        const core = clamp01((dotR - dDot) / (dotR * 0.35));
        color = lerp(color, CORAL, core);
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
