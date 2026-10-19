import { describe, it, expect } from 'vitest';
import SPR from 'Loaders/Sprite.js';
import { buildMinimalSPR } from './Sprite.test.helpers.js'; 

describe('SPR Loader', () => {
    it('rejects invalid header', () => {
        const buf = new ArrayBuffer(20);
        expect(() => new SPR(buf)).toThrow('Incorrect header');
    });

    it('parses synthetic SPR v2.1 correctly', () => {
        // Based on real values: 9 indexed frames, 0 RGBA, frame[0]=54x52
        const frameDims = [
            { w: 54, h: 52 }, { w: 30, h: 40 }, { w: 20, h: 25 },
            { w: 48, h: 44 }, { w: 36, h: 30 }, { w: 42, h: 38 },
            { w: 28, h: 32 }, { w: 50, h: 46 }, { w: 34, h: 28 }
        ];
        const data = buildMinimalSPR(frameDims);
        const spr = new SPR(data);
        expect(spr.header).toBe('SP');
        expect(spr.version).toBeCloseTo(2.1);
        expect(spr.indexed_count).toBe(9);
        expect(spr.rgba_count).toBe(0);
        expect(spr.frames.length).toBe(9);
        expect(spr.rgba_index).toBe(9);
    });

    it('has palette of 1024 bytes (version > 1.0)', () => {
        const data = buildMinimalSPR([{ w: 4, h: 4 }]);
        const spr = new SPR(data);
        expect(spr.palette).toBeInstanceOf(Uint8Array);
        expect(spr.palette.length).toBe(1024);
    });

    it('first frame has correct dimensions (RLE decoded)', () => {
        const data = buildMinimalSPR([{ w: 54, h: 52 }, { w: 10, h: 10 }]);
        const spr = new SPR(data);
        expect(spr.frames[0].width).toBe(54);
        expect(spr.frames[0].height).toBe(52);
    });

    it('all frames have valid dimensions', () => {
        const frameDims = [
            { w: 54, h: 52 }, { w: 30, h: 40 }, { w: 20, h: 25 }
        ];
        const data = buildMinimalSPR(frameDims);
        const spr = new SPR(data);
        for (let i = 0; i < spr.frames.length; i++) {
            expect(spr.frames[i].width).toBeGreaterThan(0);
            expect(spr.frames[i].height).toBeGreaterThan(0);
            expect(spr.frames[i].data).toBeDefined();
        }
    });

    it('compile() returns valid structure', () => {
        const data = buildMinimalSPR([{ w: 8, h: 8 }, { w: 4, h: 4 }]);
        const spr = new SPR(data);
        const compiled = spr.compile();
        expect(compiled).toBeDefined();
        expect(compiled.frames).toBeDefined();
        expect(compiled.palette).toBeDefined();
    });

    it('decodes RLE zero-runs correctly', () => {
        // Build pixel data with mixed zero-runs and literals to exercise
        // all three RLE decoder paths in Sprite.js:122-135:
        //   1. Non-zero literal byte
        //   2. Zero byte + count > 0 (run of zeros)
        //   3. Zero byte + count = 0 (literal zero, edge case)
        const w = 8;
        const h = 4;
        const pixels = new Uint8Array(w * h);
        // Row 0: all non-zero literals
        for (let x = 0; x < w; x++) pixels[x] = x + 1;
        // Row 1: run of 8 zeros (exercises path 2: 0x00 + count=8)
        // pixels[8..15] already 0
        // Row 2: mixed — literal, zeros, literal
        pixels[16] = 5;
        // pixels[17..20] = 0 (run of 4 zeros)
        pixels[21] = 10;
        pixels[22] = 20;
        pixels[23] = 30;
        // Row 3: starts with zeros
        // pixels[24..29] = 0 (run of 6 zeros)
        pixels[30] = 42;
        pixels[31] = 99;

        const data = buildMinimalSPR([{ w, h, pixels }]);
        const spr = new SPR(data);

        expect(spr.frames.length).toBe(1);
        expect(spr.frames[0].width).toBe(w);
        expect(spr.frames[0].height).toBe(h);

        const decoded = spr.frames[0].data;
        expect(decoded.length).toBe(w * h);

        // Verify row 0: non-zero literals preserved
        for (let x = 0; x < w; x++) {
            expect(decoded[x]).toBe(x + 1);
        }
        // Verify row 1: zero-run decoded correctly
        for (let x = 0; x < w; x++) {
            expect(decoded[w + x]).toBe(0);
        }
        // Verify row 2: mixed pattern
        expect(decoded[16]).toBe(5);
        expect(decoded[17]).toBe(0);
        expect(decoded[18]).toBe(0);
        expect(decoded[19]).toBe(0);
        expect(decoded[20]).toBe(0);
        expect(decoded[21]).toBe(10);
        expect(decoded[22]).toBe(20);
        expect(decoded[23]).toBe(30);
        // Verify row 3: zero-run then literals
        for (let x = 24; x < 30; x++) {
            expect(decoded[x]).toBe(0);
        }
        expect(decoded[30]).toBe(42);
        expect(decoded[31]).toBe(99);
    });
});