import { describe, it, expect } from 'vitest';  
import Inflate from 'Utils/Inflate.js';  
  
describe('Inflate', () => {  
    it('decompresses a stored (uncompressed) deflate block', () => {  
        // zlib header (78 01) + stored block for "Hello" + Adler-32  
        const compressed = new Uint8Array([  
            0x78, 0x01,                                     // zlib header (CMF + FLG)  
            0x01, 0x05, 0x00, 0xFA, 0xFF,                   // stored block: BFINAL=1, LEN=5, NLEN=~5  
            0x48, 0x65, 0x6C, 0x6C, 0x6F,                   // "Hello"  
            0x05, 0x8D, 0x01, 0xF5                           // Adler-32 of "Hello"  
        ]);  
        const inflater = new Inflate(compressed);  
        const output = inflater.getBytes();  
        const str = String.fromCharCode(...output);  
        expect(str).toBe('Hello');  
    });  
  
    it('decompresses fixed Huffman block', () => {  
        // zlib header + fixed Huffman encoded "Hello" + Adler-32  
        const compressed = new Uint8Array([  
            0x78, 0x01,                                     // zlib header  
            0xF2, 0x48, 0xCD, 0xC9, 0xC9, 0x07, 0x00,      // fixed Huffman "Hello"  
            0x05, 0x8D, 0x01, 0xF5                           // Adler-32  
        ]);  
        const inflater = new Inflate(compressed);  
        const output = inflater.getBytes();  
        const str = String.fromCharCode(...output);  
        expect(str).toBe('Hello');  
    });  
  
    it('rejects invalid compression method', () => {  
        const bad = new Uint8Array([0x01, 0x00]);  
        expect(() => new Inflate(bad)).toThrow('Unknown compression method');  
    });  
  
    it('rejects bad FCHECK', () => {  
        // CMF=0x78 is valid, but FLG=0x00 fails: (0x78 << 8) + 0x00 = 0x7800, 0x7800 % 31 = 8 ≠ 0  
        const bad = new Uint8Array([0x78, 0x00]);  
        expect(() => new Inflate(bad)).toThrow('Bad FCHECK');  
    });  
});