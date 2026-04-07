import { describe, it, expect } from 'vitest';  
import RSW from 'Loaders/World.js';  
import { loadFixture } from '../helpers/loadFixture.js';  
  
describe('RSW Loader', () => {  
    it('rejects invalid header', () => {  
        const buf = new ArrayBuffer(20);  
        expect(() => new RSW(buf)).toThrow('Invalid header');  
    });  
  
it('parses _test.rsw (ma_zif01) correctly', () => {  
    const data = loadFixture('_test.rsw.bin');  
    const rsw = new RSW(data);  
    expect(rsw.files.gnd).toBeDefined();  
    expect(rsw.files.gat).toBeDefined();  
    expect(rsw.water).toBeDefined();  
    expect(rsw.light).toBeDefined();  
}); 
  
    it('reads water properties (version 2.1 >= 1.8)', () => {  
        const data = loadFixture('_test.rsw.bin');  
        const rsw = new RSW(data);  
        expect(rsw.water.level).toBeCloseTo(0);  
        expect(rsw.water.type).toBe(0);  
        expect(rsw.water.waveHeight).toBeCloseTo(0.2); // raw 1.0 / 5  
        expect(rsw.water.waveSpeed).toBeCloseTo(2);  
        expect(rsw.water.wavePitch).toBeCloseTo(50);  
        expect(rsw.water.animSpeed).toBe(3);  
    });  
  
    it('reads light properties (version >= 1.5)', () => {  
        const data = loadFixture('_test.rsw.bin');  
        const rsw = new RSW(data);  
        expect(rsw.light.longitude).toBe(45);  
        expect(rsw.light.latitude).toBe(45);  
        expect(rsw.light.diffuse).toEqual([1, 1, 1]);  
        expect(rsw.light.ambient[0]).toBeCloseTo(0.3);  
        expect(rsw.light.ambient[1]).toBeCloseTo(0.3);  
        expect(rsw.light.ambient[2]).toBeCloseTo(0.3);  
        expect(rsw.light.opacity).toBeCloseTo(0.5);  
    });  
  
    it('reads ground frustum (version >= 1.6)', () => {  
        const data = loadFixture('_test.rsw.bin');  
        const rsw = new RSW(data);  
        expect(rsw.ground.top).toBe(0);  
        expect(rsw.ground.bottom).toBe(0);  
        expect(typeof rsw.ground.left).toBe('number');  
        expect(typeof rsw.ground.right).toBe('number');  
    });  
  
    it('reads 1 model object', () => {  
        const data = loadFixture('_test.rsw.bin');  
        const rsw = new RSW(data);  
        // Total objects = 1, all models  
        let modelCount = 0;  
        for (let i = 0; i < rsw.models.length; i++) {  
            if (rsw.models[i]) modelCount++;  
        }  
        expect(modelCount).toBe(1);  
    });  
  
    it('compile() returns valid structure', () => {  
        const data = loadFixture('_test.rsw.bin');  
        const rsw = new RSW(data);  
        const compiled = rsw.compile();  
        expect(compiled).toBeDefined();  
    });  
});