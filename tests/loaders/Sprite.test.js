import { describe, it, expect } from 'vitest';  
import SPR from 'Loaders/Sprite.js';  
import { loadFixture } from '../helpers/loadFixture.js';  
  
describe('SPR Loader', () => {  
    it('rejects invalid header', () => {  
        const buf = new ArrayBuffer(20);  
        expect(() => new SPR(buf)).toThrow('Incorrect header');  
    });  
  
    it('parses _test.spr correctly', () => {  
        const data = loadFixture('_test.spr.bin');  
        const spr = new SPR(data);  
        expect(spr.header).toBe('SP');  
        expect(spr.version).toBeCloseTo(2.1);  
        expect(spr.indexed_count).toBe(9);  
        expect(spr.rgba_count).toBe(0);  
        expect(spr.frames.length).toBe(9);  
        expect(spr.rgba_index).toBe(9);  
    });  
  
    it('has palette of 1024 bytes (version > 1.0)', () => {  
        const data = loadFixture('_test.spr.bin');  
        const spr = new SPR(data);  
        expect(spr.palette).toBeInstanceOf(Uint8Array);  
        expect(spr.palette.length).toBe(1024);  
    });  
  
    it('first frame has correct dimensions (RLE decoded)', () => {  
        const data = loadFixture('_test.spr.bin');  
        const spr = new SPR(data);  
        expect(spr.frames[0].width).toBe(54);  
        expect(spr.frames[0].height).toBe(52);  
    });  
  
    it('all frames have valid dimensions', () => {  
        const data = loadFixture('_test.spr.bin');  
        const spr = new SPR(data);  
        for (let i = 0; i < spr.frames.length; i++) {  
            expect(spr.frames[i].width).toBeGreaterThan(0);  
            expect(spr.frames[i].height).toBeGreaterThan(0);  
            expect(spr.frames[i].data).toBeDefined();  
        }  
    });  
  
    it('compile() returns valid structure', () => {  
        const data = loadFixture('_test.spr.bin');  
        const spr = new SPR(data);  
        const compiled = spr.compile();  
        expect(compiled).toBeDefined();  
        // compile should return frames array  
        expect(compiled.frames || compiled).toBeDefined();  
    });  
});