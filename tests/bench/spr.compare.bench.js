import { bench, describe } from 'vitest';
import SPR from 'Loaders/Sprite.js';

const FRAME_COUNT = 100;
const palette = new Uint8Array(1024).map((_, i) => (i * 31) & 0xff);

const dims = Array.from({ length: FRAME_COUNT }, (_, i) => [
  20 + ((i * 17) % 90),
  20 + ((i * 29) % 110)
]);

const sources = dims.map(([w, h]) => {
  const data = new Uint8Array(w * h);
  for (let i = 0; i < data.length; i++) {
    data[i] = (i * 7 + Math.floor(i / w) * 13) & 0xff;
  }
  return data;
});

function run() {
  const spr = Object.create(SPR.prototype);
  spr.palette = palette;
  spr.indexed_count = FRAME_COUNT;
  spr.frames = dims.map(([w, h], i) => ({
    type: SPR.TYPE_PAL,
    width: w,
    height: h,
    data: sources[i].slice()
  }));
  spr.switchToRGBA();
  return spr;
}

describe('SPR.switchToRGBA (100 frames)', () => {
  bench('switchToRGBA', run, { time: 5000, warmupTime: 500 });
});