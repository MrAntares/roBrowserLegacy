import { describe, it, expect, beforeAll } from 'vitest';  
import { loadFixture } from '../helpers/loadFixture.js';  
  
class MockFileReaderSync {  
    readAsArrayBuffer(blob) {  
        const copy = new Uint8Array(blob.length);  
        copy.set(blob);  
        return copy.buffer;  
    }  
}  
globalThis.FileReaderSync = MockFileReaderSync;  
  
import GRF from 'Loaders/GameFile.js';  
  
function createMockFile(arrayBuffer) {  
    const bytes = new Uint8Array(arrayBuffer);  
    return {  
        size: arrayBuffer.byteLength,  
        slice(start, end) {  
            return bytes.slice(start, end);  
        }  
    };  
}  
  
describe('GRF Loader', () => {  
    let grf;  
    let mockFile;  
  
    beforeAll(() => {  
        const data = loadFixture('_test.grf.bin');  
        mockFile = createMockFile(data);  
        grf = new GRF(mockFile);  
    });  
  
    it('parses header with "Master of Magic" signature', () => {  
        expect(grf.header).toBeDefined();  
        expect(grf.header.signature).toBe('Master of Magic');  
    });  
  
    it('has version 0x200', () => {  
        expect(grf.header.version).toBe(GRF.VERSION_200);  
    });  
  
    it('loads entries', () => {  
        expect(grf.entries).toBeDefined();  
        expect(grf.entries.length).toBeGreaterThan(0);  
    });  
  
    it('has index for quick search', () => {  
        expect(grf.index).toBeDefined();  
        expect(typeof grf.index).toBe('object');  
    });  
  
    it('finds the TGA file entry by search()', () => {  
        const entry = grf.search('data\\marshofabyss24.tga');  
        expect(entry).not.toBeNull();  
        expect(entry.real_size).toBeGreaterThan(0);  
        expect(entry.pack_size).toBeGreaterThan(0);  
        expect(entry.type & GRF.FILELIST_TYPE_FILE).toBeTruthy();  
    });  
  
    it('search() returns null for non-existent file', () => {  
        expect(grf.search('data\\nonexistent.txt')).toBeNull();  
    });  
  
    it('entry has valid offset within file bounds', () => {  
        const entry = grf.search('data\\marshofabyss24.tga');  
        expect(entry.offset).toBeGreaterThanOrEqual(0);  
        expect(entry.offset + GRF.struct_header.size + entry.length_aligned)  
            .toBeLessThanOrEqual(mockFile.size);  
    });  
  
    it('decodeEntry extracts valid data', () => {  
        const entry = grf.search('data\\marshofabyss24.tga');  
        const rawStart = entry.offset + GRF.struct_header.size;  
        const rawBytes = mockFile.slice(rawStart, rawStart + entry.length_aligned);  
        const rawBuffer = new Uint8Array(rawBytes.length);  
        rawBuffer.set(rawBytes);  
  
        let extractedData = null;  
        grf.decodeEntry(rawBuffer.buffer, entry, (result) => {  
            extractedData = result;  
        });  
  
        expect(extractedData).not.toBeNull();  
        expect(extractedData).toBeInstanceOf(ArrayBuffer);  
        expect(extractedData.byteLength).toBe(entry.real_size);  
    });  
  
    it('extracted TGA has valid header', () => {  
        const entry = grf.search('data\\marshofabyss24.tga');  
        const rawStart = entry.offset + GRF.struct_header.size;  
        const rawBytes = mockFile.slice(rawStart, rawStart + entry.length_aligned);  
        const rawBuffer = new Uint8Array(rawBytes.length);  
        rawBuffer.set(rawBytes);  
  
        let extractedData = null;  
        grf.decodeEntry(rawBuffer.buffer, entry, (result) => {  
            extractedData = result;  
        });  
  
        // (header >= 18 bytes)  
        const tgaBytes = new Uint8Array(extractedData);  
        expect(tgaBytes.length).toBeGreaterThanOrEqual(18);  
        // TGA imageType 2 (RGB) || 10 (RLE RGB)
        const imageType = tgaBytes[2];  
        expect([0, 1, 2, 3, 9, 10, 11]).toContain(imageType);  
        // pixelDepth should be 8, 16, 24 ou 32  
        const pixelDepth = tgaBytes[16];  
        expect([8, 16, 24, 32]).toContain(pixelDepth);  
    });  
  
    it('rejects file too small for header', () => {  
        const smallBuf = new ArrayBuffer(10);  
        const smallFile = { size: 10, slice: () => new Uint8Array(0) };  
        expect(() => new GRF(smallFile)).toThrow('Not enough bytes');  
    });  
  
    it('rejects invalid signature', () => {  
        const buf = new ArrayBuffer(GRF.struct_header.size);  
        const file = createMockFile(buf);  
        expect(() => new GRF(file)).toThrow('Incorrect header');  
    });  
  
    it('struct sizes are correct', () => {  
        // header: 15+15+4+4+4+4 = 46  
        expect(GRF.struct_header.size).toBe(46);  
        // table: 4+4 = 8  
        expect(GRF.struct_table.size).toBe(8);  
        // entry: 4+4+4+1+4 = 17  
        expect(GRF.struct_entry.size).toBe(17);  
    });  
});