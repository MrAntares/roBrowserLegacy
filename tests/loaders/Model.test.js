import { describe, it, expect } from 'vitest';  
import RSM from 'Loaders/Model.js';  
import { loadFixture } from '../helpers/loadFixture.js';  
  
describe('RSM Loader', () => {  
    it('rejects invalid header', () => {  
        const buf = new ArrayBuffer(20);  
        expect(() => new RSM(buf)).toThrow('Incorrect header');  
    });  
  
    it('parses _test.rsm (coin_j_01) correctly', () => {  
        const data = loadFixture('_test.rsm.bin');  
        const rsm = new RSM(data);  
        expect(rsm.version).toBeCloseTo(1.4);  
        expect(rsm.animLen).toBe(32000);  
        expect(rsm.shadeType).toBe(2);  
        expect(rsm.alpha).toBeCloseTo(1.0); // 255/255  
    });  
  
    it('has 1 node with correct name', () => {  
        const data = loadFixture('_test.rsm.bin');  
        const rsm = new RSM(data);  
        expect(rsm.nodes.length).toBe(1);  
        expect(rsm.main_node).toBeDefined();  
        expect(rsm.main_node.name).toContain('coin_j_01');  
    });  
  
    it('has 1 texture', () => {  
        const data = loadFixture('_test.rsm.bin');  
        const rsm = new RSM(data);  
        expect(rsm.textures.length).toBe(1);  
    });  
  
    it('main_node has vertices and faces', () => {  
        const data = loadFixture('_test.rsm.bin');  
        const rsm = new RSM(data);  
        expect(rsm.main_node.vertices.length).toBeGreaterThan(0);  
        expect(rsm.main_node.faces.length).toBeGreaterThan(0);  
    });  
});