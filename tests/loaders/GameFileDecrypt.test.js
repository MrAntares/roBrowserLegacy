import { describe, it, expect } from 'vitest';  
import GameFileDecrypt from 'Loaders/GameFileDecrypt.js';  
  
describe('GameFileDecrypt', () => {  
    it('decodeHeader modifies first 160 bytes (20 blocks)', () => {  
        const original = new Uint8Array(160);  
        for (let i = 0; i < 160; i++) original[i] = i % 256;  
  
        const encrypted = new Uint8Array(original);  
        // decodeHeader should modify the data in-place  
        GameFileDecrypt.decodeHeader(encrypted, 160);  
  
        // At least some bytes should differ after decryption  
        let differs = false;  
        for (let i = 0; i < 160; i++) {  
            if (encrypted[i] !== original[i]) { differs = true; break; }  
        }  
        expect(differs).toBe(true);  
    });  
  
    it('decodeHeader is idempotent on small data', () => {  
        // With less than 8 bytes, no blocks to decrypt  
        const data = new Uint8Array([1, 2, 3, 4]);  
        const copy = new Uint8Array(data);  
        GameFileDecrypt.decodeHeader(data, 4);  
        expect(data).toEqual(copy);  
    });  
  
    it('decodeFull processes cycle-based encryption', () => {  
        // 24 blocks = 192 bytes, entry_len=100 (3 digits -> cycle=4)  
        const data = new Uint8Array(192);  
        for (let i = 0; i < 192; i++) data[i] = i % 256;  
        const original = new Uint8Array(data);  
  
        GameFileDecrypt.decodeFull(data, 192, 100);  
  
        let differs = false;  
        for (let i = 0; i < 192; i++) {  
            if (data[i] !== original[i]) { differs = true; break; }  
        }  
        expect(differs).toBe(true);  
    });  
});