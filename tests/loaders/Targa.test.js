import { describe, it, expect } from 'vitest';  
import Targa from 'Loaders/Targa.js';  
import { loadFixture } from '../helpers/loadFixture.js';   
  
function buildMinimalTGA(width, height, pixelDepth) {  
    const pixelSize = pixelDepth >> 3;  
    const headerSize = 18;  
    const dataSize = width * height * pixelSize;  
    const data = new Uint8Array(headerSize + dataSize);  
  
    data[0]  = 0;              // idLength  
    data[1]  = 0;              // colorMapType  
    data[2]  = 2;              // imageType = RGB  
    // colorMap fields (5 bytes) = 0  
    // offset x/y (4 bytes) = 0  
    data[12] = width & 0xff;   // width low  
    data[13] = width >> 8;     // width high  
    data[14] = height & 0xff;  // height low  
    data[15] = height >> 8;    // height high  
    data[16] = pixelDepth;     // pixelDepth  
    data[17] = 0x20;           // flags: top-left origin  
  
    // Fill pixels with a pattern  
    for (let i = 0; i < dataSize; i++) {  
        data[headerSize + i] = i % 256;  
    }  
    return data;  
}  
  
describe('Targa Loader', () => {  
    it('rejects data smaller than header (< 18 bytes)', () => {  
        const data = new Uint8Array(10);  
        expect(() => new Targa(data)).toThrow('Not enough data');  
    });  
  
    it('parses _test.24b.tga (24-bit)', () => {  
        const data = loadFixture('_test.24b.tga');  
        const tga = new Targa(new Uint8Array(data));  
        expect(tga.header.pixelDepth).toBe(24);  
        expect(tga.header.width).toBeGreaterThan(0);  
        expect(tga.header.height).toBeGreaterThan(0);  
        expect(tga.imageData).toBeDefined();  
        expect(tga.imageData.length).toBeGreaterThan(0);  
    });  
  
    it('parses _test.32b.tga (32-bit)', () => {  
        const data = loadFixture('_test.32b.tga');  
        const tga = new Targa(new Uint8Array(data));  
        expect(tga.header.pixelDepth).toBe(32);  
        expect(tga.header.width).toBeGreaterThan(0);  
        expect(tga.header.height).toBeGreaterThan(0);  
        expect(tga.imageData).toBeDefined();  
    });  
  
    it('getImageData returns RGBA data for 24-bit', () => {  
        const data = loadFixture('_test.24b.tga');  
        const tga = new Targa(new Uint8Array(data));  
        const imageData = tga.getImageData();  
        expect(imageData.data.length).toBe(tga.header.width * tga.header.height * 4);  
    });  
  
    it('getImageData returns RGBA data for 32-bit', () => {  
        const data = loadFixture('_test.32b.tga');  
        const tga = new Targa(new Uint8Array(data));  
        const imageData = tga.getImageData();  
        expect(imageData.data.length).toBe(tga.header.width * tga.header.height * 4);  
    });  
});
