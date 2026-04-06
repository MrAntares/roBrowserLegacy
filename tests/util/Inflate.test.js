import { describe, it, expect } from 'vitest';  
import Inflate from 'Utils/Inflate.js';  
  
describe('Inflate', () => {  
    it('decompresses a stored (uncompressed) deflate block', () => {  
        // Deflate stored block: final=1, type=00, len=5, nlen=~5, "Hello"  
        const compressed = new Uint8Array([  
            0x01,       // bfinal=1, btype=00 (stored)  
            0x05, 0x00, // len = 5  
            0xfa, 0xff, // nlen = ~5  
            0x48, 0x65, 0x6c, 0x6c, 0x6f // "Hello"  
        ]);  
        const inflater = new Inflate(compressed);  
        const output = inflater.getBytes();  
        const str = String.fromCharCode(...output);  
        expect(str).toBe('Hello');  
    });  
  
    it('decompresses fixed Huffman block', () => {  
        // Use a known zlib-compressed "Hello World" (without zlib header, raw deflate)  
        // This is "Hello" compressed with fixed Huffman codes  
        const compressed = new Uint8Array([  
            0xf2, 0x48, 0xcd, 0xc9, 0xc9, 0x07, 0x00  
        ]);  
        const inflater = new Inflate(compressed);  
        const output = inflater.getBytes();  
        const str = String.fromCharCode(...output);  
        expect(str).toBe('Hello');  
    });  
});