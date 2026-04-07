import { readFileSync } from 'fs';  
import { resolve, dirname } from 'path';  
import { fileURLToPath } from 'url';  
  
const __dirname = dirname(fileURLToPath(import.meta.url));  
  
export function loadFixture(filename) {  
    const filePath = resolve(__dirname, '../fixtures', filename);  
    const nodeBuffer = readFileSync(filePath);  
    // Cria Uint8Array no realm do jsdom para evitar cross-realm instanceof  
    const uint8 = new Uint8Array(nodeBuffer.length);  
    uint8.set(nodeBuffer);  
    return uint8.buffer; // ArrayBuffer do realm jsdom  
}  
