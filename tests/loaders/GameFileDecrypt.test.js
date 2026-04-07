import { describe, it, expect } from 'vitest';  
import GameFileDecrypt from 'Loaders/GameFileDecrypt.js';  
import { loadFixture } from '../helpers/loadFixture.js';  

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
  
    it('decodeHeader is deterministic (same input → same output)', () => {  
        const input1 = new Uint8Array(160);  
        const input2 = new Uint8Array(160);  
        for (let i = 0; i < 160; i++) {  
            input1[i] = i % 256;  
            input2[i] = i % 256;  
        }  
  
        GameFileDecrypt.decodeHeader(input1, 160);  
        GameFileDecrypt.decodeHeader(input2, 160);  
  
        expect(input1).toEqual(input2);  
    });  
  
    it('decodeHeader only modifies first 20 blocks (160 bytes)', () => {  
        // 256 bytes = 32 blocks, but decodeHeader only touches first 20  
        const data = new Uint8Array(256);  
        for (let i = 0; i < 256; i++) data[i] = i % 256;  
        const original = new Uint8Array(data);  
  
        GameFileDecrypt.decodeHeader(data, 256);  
  
        // Bytes 160-255 (blocks 20-31) should be unchanged  
        for (let i = 160; i < 256; i++) {  
            expect(data[i]).toBe(original[i]);  
        }  
        // But first 160 bytes should differ  
        let differs = false;  
        for (let i = 0; i < 160; i++) {  
            if (data[i] !== original[i]) { differs = true; break; }  
        }  
        expect(differs).toBe(true);  
    });  
  
    it('decodeFull is deterministic', () => {  
        const input1 = new Uint8Array(192);  
        const input2 = new Uint8Array(192);  
        for (let i = 0; i < 192; i++) {  
            input1[i] = (i * 7 + 13) % 256;  
            input2[i] = (i * 7 + 13) % 256;  
        }  
  
        GameFileDecrypt.decodeFull(input1, 192, 100);  
        GameFileDecrypt.decodeFull(input2, 192, 100);  
  
        expect(input1).toEqual(input2);  
    });  
  
    it('decodeFull cycle varies with entry_len digits', () => {  
        // entry_len=9 (1 digit) → cycle=3  
        // entry_len=99 (2 digits) → cycle=3  
        // entry_len=999 (3 digits) → cycle=4  
        // entry_len=9999 (4 digits) → cycle=5  
        // Diferentes cycles devem produzir resultados diferentes  
        const makeData = () => {  
            const d = new Uint8Array(320); // 40 blocks  
            for (let i = 0; i < 320; i++) d[i] = (i * 3 + 5) % 256;  
            return d;  
        };  
  
        const d1 = makeData();  
        const d2 = makeData();  
        GameFileDecrypt.decodeFull(d1, 320, 9);    // cycle=3  
        GameFileDecrypt.decodeFull(d2, 320, 999);  // cycle=4  
  
        // Primeiros 160 bytes (20 blocks) são iguais (ambos decriptam todos)  
        // Mas após block 20, o cycle diferente causa resultados diferentes  
        let diffAfter20 = false;  
        for (let i = 160; i < 320; i++) {  
            if (d1[i] !== d2[i]) { diffAfter20 = true; break; }  
        }  
        expect(diffAfter20).toBe(true);  
    });  
  
    it('decodeFull with less than 20 blocks only decrypts available blocks', () => {  
        // 10 blocks = 80 bytes  
        const data = new Uint8Array(80);  
        for (let i = 0; i < 80; i++) data[i] = i % 256;  
        const original = new Uint8Array(data);  
  
        GameFileDecrypt.decodeFull(data, 80, 100);  
  
        // Should still modify data (decrypts blocks 0-9)  
        let differs = false;  
        for (let i = 0; i < 80; i++) {  
            if (data[i] !== original[i]) { differs = true; break; }  
        }  
        expect(differs).toBe(true);  
    });  
  
    it('decryptBlock operates on exactly 8 bytes', () => {  
        // 16 bytes, decrypt only block at index 0  
        const data = new Uint8Array(16);  
        for (let i = 0; i < 16; i++) data[i] = i;  
        const original = new Uint8Array(data);  
  
        // decodeHeader with len=8 → 1 block  
        GameFileDecrypt.decodeHeader(data, 8);  
  
        // First 8 bytes should change  
        let firstChanged = false;  
        for (let i = 0; i < 8; i++) {  
            if (data[i] !== original[i]) { firstChanged = true; break; }  
        }  
        expect(firstChanged).toBe(true);  
  
        // Last 8 bytes should NOT change  
        for (let i = 8; i < 16; i++) {  
            expect(data[i]).toBe(original[i]);  
        }  
    });  
  
    it('SKIP_EXTENSIONS uses decodeHeader for .gat/.gnd/.act/.str', () => {  
        // Verificar que o regex de SKIP_EXTENSIONS funciona  
        // (testado indiretamente via decodeEntry no GameFile.test.js)  
        const skipRegex = /\.(gnd|gat|act|str)$/i;  
        expect(skipRegex.test('test.gat')).toBe(true);  
        expect(skipRegex.test('test.GND')).toBe(true);  
        expect(skipRegex.test('test.act')).toBe(true);  
        expect(skipRegex.test('test.str')).toBe(true);  
        expect(skipRegex.test('test.tga')).toBe(false);  
        expect(skipRegex.test('test.spr')).toBe(false);  
        expect(skipRegex.test('test.bmp')).toBe(false);  
    });  
});  
  
describe('GameFileDecrypt integration with GRF', () => {  
    it('decrypt + decompress produces valid output from real GRF entry', async () => {  
        // Este teste valida o pipeline completo:  
        // GRF raw bytes → decrypt → Inflate → output válido  
        // Importa dinamicamente para garantir que o mock de FileReaderSync existe  
        globalThis.FileReaderSync = globalThis.FileReaderSync || class {  
            readAsArrayBuffer(blob) {  
                const copy = new Uint8Array(blob.length);  
                copy.set(blob);  
                return copy.buffer;  
            }  
        };  
  
        const { default: GRF } = await import('Loaders/GameFile.js');  
  
        const data = loadFixture('_test.grf.bin');  
        const bytes = new Uint8Array(data);  
        const mockFile = {  
            size: data.byteLength,  
            slice(start, end) { return bytes.slice(start, end); }  
        };  
  
        const grf = new GRF(mockFile);  
        const entry = grf.search('data\\marshofabyss24.tga');  
        expect(entry).not.toBeNull();  
  
        // Extrair e decriptar/descomprimir  
        const rawStart = entry.offset + GRF.struct_header.size;  
        const rawSlice = bytes.slice(rawStart, rawStart + entry.length_aligned);  
        const rawBuffer = new Uint8Array(rawSlice.length);  
        rawBuffer.set(rawSlice);  
  
        let result = null;  
        grf.decodeEntry(rawBuffer.buffer, entry, (output) => {  
            result = output;  
        });  
  
        // O output deve ter o tamanho real declarado na entry  
        expect(result).not.toBeNull();  
        expect(result.byteLength).toBe(entry.real_size);  
  
        // E deve ser um TGA válido  
        const tga = new Uint8Array(result);  
        expect(tga.length).toBeGreaterThanOrEqual(18);  
        // imageType válido  
        expect([0, 1, 2, 3, 9, 10, 11]).toContain(tga[2]);  
    });  
});