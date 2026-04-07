import { readFileSync } from 'fs';  
import { resolve, dirname } from 'path';  
import { fileURLToPath } from 'url';  
  
const __dirname = dirname(fileURLToPath(import.meta.url));  
  
export function loadFixture(filename) {  
    const filePath = resolve(__dirname, '../fixtures', filename);  
    const buffer = readFileSync(filePath);  
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);  
}