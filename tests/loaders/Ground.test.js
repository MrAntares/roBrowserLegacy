import { describe, it, expect } from 'vitest';  
import GND from 'Loaders/Ground.js';  
import { loadFixture } from '../helpers/loadFixture.js';  
  
describe('GND Loader', () => {  
    it('rejects invalid header', () => {  
        const buf = new ArrayBuffer(20);  
        expect(() => new GND(buf)).toThrow('Invalid header');  
    });  
  
    it('parses _test.gnd (ma_zif01) correctly', () => {  
        const data = loadFixture('_test.gnd');  
        const gnd = new GND(data);  
        expect(gnd.version).toBeCloseTo(1.7);  
        expect(gnd.width).toBe(30);  
        expect(gnd.height).toBe(30);  
        expect(typeof gnd.zoom).toBe('number');  
    });  
  
    it('has correct surface count', () => {  
        const data = loadFixture('_test.gnd');  
        const gnd = new GND(data);  
        expect(gnd.surfaces.length).toBe(900); // 30 * 30  
    });  
  
    it('does not have water (version 1.7 < 1.8)', () => {  
        const data = loadFixture('_test.gnd');  
        const gnd = new GND(data);  
        expect(gnd.water).toBeUndefined();  
    });  
  
    it('tiles array is defined', () => {  
        const data = loadFixture('_test.gnd');  
        const gnd = new GND(data);  
        expect(gnd.tiles).toBeDefined();  
        expect(Array.isArray(gnd.tiles)).toBe(true);  
    });  
});