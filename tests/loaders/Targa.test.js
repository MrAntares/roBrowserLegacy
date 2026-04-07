import { describe, it, expect } from 'vitest';  
import Targa from 'Loaders/Targa.js';  
  
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
    it('parses a minimal 2x2 24-bit TGA', () => {  
        const data = buildMinimalTGA(2, 2, 24);  
        const tga = new Targa();  
        tga.load(data);  
        expect(tga.header.width).toBe(2);  
        expect(tga.header.height).toBe(2);  
        expect(tga.header.pixelDepth).toBe(24);  
        expect(tga.imageData.length).toBe(2 * 2 * 3);  
    });  
  
    it('parses 32-bit TGA', () => {  
        const data = buildMinimalTGA(4, 4, 32);  
        const tga = new Targa();  
        tga.load(data);  
        expect(tga.header.pixelDepth).toBe(32);  
        expect(tga.imageData.length).toBe(4 * 4 * 4);  
    });  
  
    it('getImageData returns correct dimensions', () => {  
        const data = buildMinimalTGA(3, 3, 24);  
        const tga = new Targa();  
        tga.load(data);  
        const imgData = tga.getImageData();  
        expect(imgData.width).toBe(3);  
        expect(imgData.height).toBe(3);  
        expect(imgData.data.length).toBe(3 * 3 * 4);  
    });  
  
    it('rejects too-small data', () => {  
        const data = new Uint8Array(10);  
        const tga = new Targa();  
        expect(() => tga.load(data)).toThrow('Not enough data');  
    });  
  
    it('rejects NO_DATA image type', () => {  
        const data = new Uint8Array(18);  
        data[2] = 0; // NO_DATA  
        data[12] = 1; data[14] = 1; data[16] = 24;  
        const tga = new Targa();  
        expect(() => tga.load(data)).toThrow('No data');  
    });  
});