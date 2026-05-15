import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { deflateSync } from 'zlib';

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buf) crc = CRC_TABLE[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcVal  = crc32(Buffer.concat([typeBuf, data]));
  const crcBuf  = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }
function clamp(v: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, v)); }

/* Signed distance to a capsule (line segment with rounded caps) */
function capsuleSDF(px: number, py: number, ax: number, ay: number, bx: number, by: number, r: number): number {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : clamp(((px - ax) * dx + (py - ay) * dy) / len2, 0, 1);
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy)) - r;
}

function makePng(size: number): Buffer {
  const s = size;
  const pixels = new Uint8Array(s * s * 4);

  /* Lens geometry */
  const cx      = s * 0.40;
  const cy      = s * 0.40;
  const outerR  = s * 0.295;
  const innerR  = s * 0.185;
  const handleR = s * 0.065;

  /* Handle exits the ring at 45° (bottom-right in screen coords) */
  const EXIT = Math.PI / 4;
  const hx0 = cx + outerR * Math.cos(EXIT);
  const hy0 = cy + outerR * Math.sin(EXIT);
  const hx1 = s * 0.82;
  const hy1 = s * 0.82;

  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      /* Gradient background: #007AFF → #5E5CE6 diagonal */
      const gt  = (x / (s - 1) + y / (s - 1)) / 2;
      const bgR = Math.round(lerp(0x00, 0x5E, gt));
      const bgG = Math.round(lerp(0x7A, 0x5C, gt));
      const bgB = Math.round(lerp(0xFF, 0xE6, gt));

      /* Lens ring SDF */
      const d      = Math.hypot(x - cx, y - cy);
      const ringSDF = Math.max(innerR - d, d - outerR);

      /* Handle SDF */
      const hSDF = capsuleSDF(x, y, hx0, hy0, hx1, hy1, handleR);

      /* Union of both shapes — 1-pixel anti-aliased coverage */
      const sdf = Math.min(ringSDF, hSDF);
      const cov = clamp(0.5 - sdf, 0, 1);

      const idx        = (y * s + x) * 4;
      pixels[idx]     = Math.round(lerp(bgR, 255, cov));
      pixels[idx + 1] = Math.round(lerp(bgG, 255, cov));
      pixels[idx + 2] = Math.round(lerp(bgB, 255, cov));
      pixels[idx + 3] = 255;
    }
  }

  /* Encode as RGBA PNG */
  const rowBytes = 1 + s * 4;
  const raw = Buffer.alloc(rowBytes * s);
  for (let y = 0; y < s; y++) {
    raw[y * rowBytes] = 0;
    for (let x = 0; x < s; x++) {
      const src = (y * s + x) * 4;
      const dst = y * rowBytes + 1 + x * 4;
      raw[dst]     = pixels[src];
      raw[dst + 1] = pixels[src + 1];
      raw[dst + 2] = pixels[src + 2];
      raw[dst + 3] = pixels[src + 3];
    }
  }
  const compressed = deflateSync(raw, { level: 9 });

  const sig  = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(s, 0);
  ihdr.writeUInt32BE(s, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

const outDir = join(import.meta.dir, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

for (const size of [16, 48, 128] as const) {
  const path = join(outDir, `icon-${size}.png`);
  writeFileSync(path, makePng(size));
  console.log(`✓ icon-${size}.png`);
}
