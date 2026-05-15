/**
 * Generates placeholder PNG icons for the extension.
 * Produces solid blue squares at 16×16, 48×48, 128×128.
 * Drop final artwork into public/icons/ to replace.
 */

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
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function makePng(size: number): Buffer {
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB

  // IDAT — solid #007AFF blue rows
  const rowBytes = 1 + size * 3;
  const raw = Buffer.alloc(rowBytes * size, 0);
  for (let y = 0; y < size; y++) {
    raw[y * rowBytes] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const off = y * rowBytes + 1 + x * 3;
      raw[off]     = 0x00; // R
      raw[off + 1] = 0x7A; // G
      raw[off + 2] = 0xFF; // B
    }
  }
  const compressed = deflateSync(raw, { level: 9 });

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
