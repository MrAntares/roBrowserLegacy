import { describe, it, expect } from 'vitest';  
import STR from 'Loaders/Str.js';  
import { loadFixture } from '../helpers/loadFixture.js';  
  
describe('STR Loader', () => {  
    it('rejects invalid header', () => {  
        const buf = new ArrayBuffer(20);  
        expect(() => new STR(buf)).toThrow('Incorrect header');  
    });  
  
    it('parses _test.str (note_1) correctly', () => {  
        const data = loadFixture('_test.str');  
        const str = new STR(data);  
        expect(str.header).toBe('STRM');  
        expect(str.version).toBe(0x94); // 148  
        expect(str.fps).toBe(60);  
        expect(str.maxKey).toBe(90);  
        expect(str.layernum).toBe(16);  
    });  
  
    it('has correct number of layers', () => {  
        const data = loadFixture('_test.str');  
        const str = new STR(data);  
        expect(str.layers.length).toBe(16);  
    });  
  
    it('layers have valid structure', () => {  
        const data = loadFixture('_test.str');  
        const str = new STR(data);  
        for (let i = 0; i < str.layers.length; i++) {  
            expect(str.layers[i]).toBeDefined();  
        }  
    });  
});