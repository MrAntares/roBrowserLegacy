import { describe, it, expect } from 'vitest';  
import GAT from 'Loaders/Altitude.js';  
import { loadFixture } from '../helpers/loadFixture.js';  

function buildMinimalGat(width, height) {  
    // Header: "GRAT" (4) + version major (1) + version minor (1) + width (4) + height (4)  
    // Per cell: 4 floats (16) + 1 uint32 type (4) = 20 bytes  
    const headerSize = 4 + 1 + 1 + 4 + 4;  
    const cellCount = width * height;  
    const buf = new ArrayBuffer(headerSize + cellCount * 20);  
    const view = new DataView(buf);  
    let offset = 0;  
  
    // "GRAT"  
    [0x47, 0x52, 0x41, 0x54].forEach(b => view.setUint8(offset++, b));  
    view.setUint8(offset++, 1);  // version major  
    view.setUint8(offset++, 2);  // version minor (1.2)  
    view.setUint32(offset, width, true); offset += 4;  
    view.setUint32(offset, height, true); offset += 4;  
  
    for (let i = 0; i < cellCount; i++) {  
        view.setFloat32(offset, 10.0, true); offset += 4; // h1  
        view.setFloat32(offset, 10.0, true); offset += 4; // h2  
        view.setFloat32(offset, 10.0, true); offset += 4; // h3  
        view.setFloat32(offset, 10.0, true); offset += 4; // h4  
        view.setUint32(offset, 0, true); offset += 4;     // type 0 = walkable  
    }  
    return buf;  
}  
  
describe('GAT Loader', () => {  
    it('parses a minimal 2x2 gat file', () => {  
        const buf = buildMinimalGat(2, 2);  
        const gat = new GAT(buf);  
        expect(gat.width).toBe(2);  
        expect(gat.height).toBe(2);  
        expect(gat.version).toBeCloseTo(1.2);  
        expect(gat.cells.length).toBe(2 * 2 * 5);  
    });  
  
    it('rejects invalid header', () => {  
        const buf = new ArrayBuffer(14);  
        expect(() => new GAT(buf)).toThrow('Invalid header');  
    });  
});

describe('GAT Loader with real fixture', () => {  
    it('parses _test.gat (ma_zif01) correctly', () => {  
        const data = loadFixture('_test.gat.bin');  
        const gat = new GAT(data);  
        expect(gat.version).toBeCloseTo(1.2);  
        expect(gat.width).toBe(60);  
        expect(gat.height).toBe(60);  
        expect(gat.cells.length).toBe(60 * 60 * 5); // 18000  
    });  
  
    it('cells contain valid height and type data', () => {  
        const data = loadFixture('_test.gat.bin');  
        const gat = new GAT(data);  
        // Check first cell has 5 values (4 heights + 1 type)  
        for (let i = 0; i < 5; i++) {  
            expect(typeof gat.cells[i]).toBe('number');  
            expect(isNaN(gat.cells[i])).toBe(false);  
        }  
        // Type values should be valid (from TYPE_TABLE)  
        for (let i = 0; i < gat.width * gat.height; i++) {  
            const type = gat.cells[i * 5 + 4];  
            expect(type).toBeDefined();  
        }  
    });  
});