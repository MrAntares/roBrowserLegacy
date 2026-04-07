import { describe, it, expect } from 'vitest';  
import ACT from 'Loaders/Action.js';  
import { loadFixture } from '../helpers/loadFixture.js';  
  
describe('ACT Loader', () => {  
    it('rejects invalid header', () => {  
        const buf = new ArrayBuffer(20);  
        expect(() => new ACT(buf)).toThrow('Incorrect header');  
    });  
  
    it('parses _test.act (ork_warrior) correctly', () => {  
        const data = loadFixture('_test.act');  
        const act = new ACT(data);  
        expect(act.header).toBe('AC');  
        expect(act.version).toBeCloseTo(2.5);  
        expect(act.actions.length).toBe(40);  
    });  
  
    it('reads sounds (version >= 2.1)', () => {  
        const data = loadFixture('_test.act');  
        const act = new ACT(data);  
        expect(act.sounds.length).toBe(8);  
    });  
  
    it('reads delays per action (version >= 2.2)', () => {  
        const data = loadFixture('_test.act');  
        const act = new ACT(data);  
        for (let i = 0; i < act.actions.length; i++) {  
            expect(act.actions[i].delay).toBeDefined();  
            expect(typeof act.actions[i].delay).toBe('number');  
        }  
    });  
  
    it('has correct frame counts per action group', () => {  
        const data = loadFixture('_test.act');  
        const act = new ACT(data);  
        // Actions 0-7: 17 frames each  
        for (let i = 0; i < 8; i++) {  
            expect(act.actions[i].animations.length).toBe(17);  
        }  
        // Actions 8-15: 10 frames each  
        for (let i = 8; i < 16; i++) {  
            expect(act.actions[i].animations.length).toBe(10);  
        }  
        // Actions 16-23: 9 frames each  
        for (let i = 16; i < 24; i++) {  
            expect(act.actions[i].animations.length).toBe(9);  
        }  
        // Actions 24-31: 3 frames each  
        for (let i = 24; i < 32; i++) {  
            expect(act.actions[i].animations.length).toBe(3);  
        }  
        // Actions 32-39: 12 frames each  
        for (let i = 32; i < 40; i++) {  
            expect(act.actions[i].animations.length).toBe(12);  
        }  
    });  
  
    it('each animation has layers array', () => {  
        const data = loadFixture('_test.act');  
        const act = new ACT(data);  
        const firstAnim = act.actions[0].animations[0];  
        expect(Array.isArray(firstAnim.layers)).toBe(true);  
        if (firstAnim.layers.length > 0) {  
            const layer = firstAnim.layers[0];  
            expect(layer).toHaveProperty('index');  
            expect(layer).toHaveProperty('pos');  
        }  
    });  
  
    it('compile() returns valid structure', () => {  
        const data = loadFixture('_test.act');  
        const act = new ACT(data);  
        const compiled = act.compile();  
        expect(compiled).toBeDefined();  
    });  
});