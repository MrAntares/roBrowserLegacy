import { describe, it } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const sourceRoot = process.env.EFFECT_SOURCE_ROOT || join(process.cwd(), 'src');
const code = readFileSync(join(sourceRoot, 'Renderer/Effects/StrEffect.js'), 'utf8')
	.replace(/^import .*;\r?$/gm, '')
	.replace('export default StrEffect;', 'this.StrEffect = StrEffect;');

const round = v => Math.round(v * 1e6) / 1e6 + 0;

// Where a frame at `pos` is drawn: [x, y] in STR pixels and the vertical base in cells.
function layout(props, pos) {
	const context = vm.createContext({
		Float32Array,
		Math,
		Client: { loadFile: () => null },
		glMatrix: { mat4: { create: () => new Float32Array(16) } }
	});
	vm.runInContext(code, context);
	const str = Object.assign(new context.StrEffect('a.str', [0, 0, 0], 0, ''), props);
	const out = [0, 0];
	const base = str.layout({ pos }, 1, out);
	return [round(out[0]), round(out[1]), base];
}

describe('StrEffect layout', () => {
	it('puts a classic effect at (320,320), half a cell down', () => {
		assert.deepEqual(layout({}, [330, 300]), [10, -20, 0.5]);
	});

	it('puts an EZ2 effect at its centre (320,240), moved by PosX/PosY', () => {
		// 5 client units to a cell, 35 STR pixels to a cell: PosY 10 is 70 pixels up
		assert.deepEqual(layout({ ez2Offset: [0, 10] }, [320, 240]), [0, -70, 0]);
		assert.deepEqual(layout({ ez2Offset: [1, 3] }, [330, 250]), [17, -11, 0]);
		assert.deepEqual(layout({ ez2Offset: [0, 0] }, [320, 240]), [0, 0, 0]);
	});

	it('moves an aimed EZ2 effect after turning it', () => {
		// Art 10 pixels right of the centre turns a quarter, up the screen
		assert.deepEqual(layout({ ez2Offset: [0, 10], aimAngle: 90 }, [330, 240]), [0, -80, 0]);
	});

	it('keeps an attachment on its owner offsets', () => {
		const owner = { position: [0, 0, 0] };
		assert.deepEqual(layout({ ownerEntity: owner, yOffset: 10, ez2Offset: [0, 99] }, [320, 320]), [0, -70, 0]);
	});

	it('scales the art about its anchor, not the PosX/PosY shift', () => {
		assert.deepEqual(layout({ scale: 1.5 }, [330, 300]), [15, -30, 0.5]);
		assert.deepEqual(layout({ scale: 1.5, ez2Offset: [0, 10] }, [330, 250]), [15, -55, 0]);
		const owner = { position: [0, 0, 0] };
		assert.deepEqual(layout({ ownerEntity: owner, yOffset: 14, scale: 1.5 }, [330, 320]), [15, -98, 0]);
		assert.deepEqual(layout({ scale: 0.5, ez2Offset: [0, 0], aimAngle: 90 }, [340, 240]), [0, -10, 0]);
	});

	it('mirrors the art before turning it, and tilts it after', () => {
		assert.deepEqual(layout({ ez2Offset: [0, 0], flipX: true }, [330, 240]), [-10, 0, 0]);
		assert.deepEqual(layout({ ez2Offset: [0, 0], flipY: true }, [320, 230]), [0, 10, 0]);
		// Mirrored, then a quarter turn: art 10 pixels right ends up 10 pixels down
		assert.deepEqual(layout({ ez2Offset: [0, 0], flipX: true, aimAngle: 90 }, [330, 240]), [0, 10, 0]);
		// Tilted 60 degrees back: half as tall on screen
		assert.deepEqual(layout({ ez2Offset: [0, 0], tilt: 60 }, [320, 220]), [0, -10, 0]);
	});

	it('mirrors and turns a classic effect about its own anchor (320,320)', () => {
		assert.deepEqual(layout({ flipY: true }, [320, 320]), [0, 0, 0.5]);
		assert.deepEqual(layout({ flipY: true }, [320, 310]), [0, 10, 0.5]);
		assert.deepEqual(layout({ flipX: true }, [330, 320]), [-10, 0, 0.5]);
		assert.deepEqual(layout({ aimAngle: 90 }, [330, 320]), [0, -10, 0.5]);
	});
});
