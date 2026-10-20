import { beforeEach, describe, expect, it, vi } from 'vitest';

// The entity pass records its sprites and draws them in instanced runs.
// These check what reaches GL: how many draws, in which order, and that the
// blend and depth state each sprite asked for is the one it is drawn with.
vi.mock('Utils/WebGL.js', () => ({
	default: {
		createShaderProgram: () => ({
			attribute: new Proxy({}, { get: (t, k) => k }),
			uniform: new Proxy({}, { get: (t, k) => k })
		})
	}
}));
vi.mock('Renderer/Camera.js', () => ({ default: { zoom: 1, getLatitude: () => 0 } }));

const { default: SpriteRenderer } = await import('Renderer/SpriteRenderer.js');
const { default: SpriteBatch } = await import('Renderer/SpriteBatch.js');

const FOG = { use: false, exist: false, near: 30, far: 180, color: [0.4, 0.6, 0.6] };
const M = new Float32Array(16);

function fakeGL() {
	const calls = [];
	const target = {
		getParameter: () => 4096,
		createTexture: () => ({ texture: true }),
		isTexture: () => true,
		drawArraysInstanced: (mode, first, count, instances) => calls.push(['drawArraysInstanced', instances]),
		drawArrays: () => calls.push(['drawArrays'])
	};
	const gl = new Proxy(target, {
		get: (t, key) => {
			if (key in t) {
				return t[key];
			}
			if (typeof key === 'string' && /^[A-Z_0-9]+$/.test(key)) {
				return key;
			}
			return (...args) => {
				calls.push([key, ...args]);
				return {};
			};
		}
	});
	return { gl, calls };
}

function spr(name, type = 0) {
	const frames = [0, 1].map(() => ({
		type,
		width: 4,
		height: 4,
		data: new Uint8Array(16 * (type ? 4 : 1)),
		texture: { frame: name }
	}));
	return { name, frames, texture: type ? null : { palette: name } };
}

function draw(file, frameIndex, isBlendModeOne) {
	const frame = file.frames[frameIndex];
	SpriteRenderer.image.texture = frame.texture;
	SpriteRenderer.image.palette = file.texture;
	SpriteRenderer.image.size[0] = 8;
	SpriteRenderer.image.size[1] = 8;
	SpriteRenderer.image.spr = file;
	SpriteRenderer.image.frame = frame;
	SpriteRenderer.color.set([1, 1, 1, 1]);
	SpriteRenderer.size.set([4, 4]);
	SpriteRenderer.render(isBlendModeOne);
}

function shadow(file) {
	SpriteRenderer.shadowQueue = true;
	SpriteRenderer.runWithDepth(true, false, false, () => draw(file, 0, false));
	SpriteRenderer.shadowQueue = false;
}

const names = calls => calls.map(c => c[0]);

describe('SpriteBatch', () => {
	let gl, calls;
	const wolf = spr('wolf');
	const shadowSpr = spr('shadow');
	const poring = spr('poring');

	beforeEach(() => {
		({ gl, calls } = fakeGL());
		SpriteRenderer.init(gl);
		SpriteBatch.enabled = true;
		SpriteRenderer.bind3DContext(gl, M, M, FOG);
	});

	it('draws a crowd of the same monster in two calls: shadows, then bodies', () => {
		SpriteRenderer.beginBatch(gl);
		for (let i = 0; i < 50; i++) {
			shadow(shadowSpr);
			draw(wolf, i % 2, false);
		}
		calls.length = 0;
		SpriteRenderer.endBatch();

		const draws = calls.filter(c => c[0] === 'drawArraysInstanced');
		expect(draws).toEqual([
			['drawArraysInstanced', 50],
			['drawArraysInstanced', 50]
		]);
		expect(calls.some(c => c[0] === 'drawArrays')).toBe(false);
	});

	it('keeps the recorded order across different sprites', () => {
		SpriteRenderer.beginBatch(gl);
		draw(wolf, 0, false);
		draw(poring, 0, false);
		draw(wolf, 1, false);
		calls.length = 0;
		SpriteRenderer.endBatch();

		const textures = calls.filter(c => c[0] === 'bindTexture' && c[2] && c[2].texture).map(c => c[2]);
		expect(calls.filter(c => c[0] === 'drawArraysInstanced')).toHaveLength(3);
		expect(textures[0]).toBe(textures[2]);
		expect(textures[0]).not.toBe(textures[1]);
	});

	it('draws an additive sprite with its own blend, and the next one without it', () => {
		SpriteRenderer.beginBatch(gl);
		draw(wolf, 0, false);
		draw(wolf, 0, true);
		draw(wolf, 0, false);
		calls.length = 0;
		SpriteRenderer.endBatch();

		const sequence = calls
			.filter(c => c[0] === 'drawArraysInstanced' || c[0] === 'blendFunc')
			.map(c => (c[0] === 'blendFunc' ? c[2] : 'draw'));
		expect(sequence).toEqual(['ONE_MINUS_SRC_ALPHA', 'draw', 'ONE', 'draw', 'ONE_MINUS_SRC_ALPHA', 'draw']);
	});

	it('touches no depth state while recording, and leaves it as it found it', () => {
		SpriteRenderer.beginBatch(gl);
		calls.length = 0;
		SpriteRenderer.runWithDepth(true, false, false, () => draw(wolf, 0, false));
		expect(names(calls)).not.toContain('depthMask');

		SpriteRenderer.endBatch();
		const masks = calls.filter(c => c[0] === 'depthMask').map(c => c[1]);
		expect(masks).toEqual([false, true]);
	});

	it('draws what came before when something else draws in between', () => {
		SpriteRenderer.beginBatch(gl);
		draw(wolf, 0, false);
		calls.length = 0;
		SpriteRenderer.flushBatch();
		expect(calls.filter(c => c[0] === 'drawArraysInstanced')).toEqual([['drawArraysInstanced', 1]]);

		calls.length = 0;
		SpriteRenderer.endBatch();
		expect(names(calls)).not.toContain('drawArraysInstanced');
	});

	it('carries ignoreDepthMinCap per sprite without breaking the run', () => {
		SpriteRenderer.beginBatch(gl);
		SpriteRenderer.ignoreDepthMinCap = true;
		draw(wolf, 0, false);
		SpriteRenderer.ignoreDepthMinCap = false;
		draw(wolf, 1, false);
		calls.length = 0;
		SpriteRenderer.endBatch();

		expect(calls.filter(c => c[0] === 'drawArraysInstanced')).toEqual([['drawArraysInstanced', 2]]);
		const upload = calls.find(c => c[0] === 'bufferData')[2];
		expect(upload[19]).toBe(1);
		expect(upload[20 + 19]).toBe(0);
	});

	it('packs every frame of a sprite file into one texture', () => {
		SpriteRenderer.beginBatch(gl);
		draw(wolf, 0, false);
		SpriteRenderer.endBatch();

		expect(wolf.frames[0]._atlas.page).toBe(wolf.frames[1]._atlas.page);
		expect(wolf.frames[0]._atlas.u0).not.toBe(wolf.frames[1]._atlas.u0);
	});

	it('rebuilds its GPU objects after the context is restored', () => {
		SpriteRenderer.beginBatch(gl);
		draw(wolf, 0, false);
		SpriteRenderer.endBatch();
		const page = wolf.frames[0]._atlas.page;

		// Same context object, new GPU objects
		SpriteBatch.contextRestored();
		calls.length = 0;
		SpriteRenderer.beginBatch(gl);
		draw(wolf, 0, false);
		SpriteRenderer.endBatch();

		expect(names(calls)).toContain('createVertexArray');
		expect(wolf.frames[0]._atlas.page).not.toBe(page);

		// Its vertex array reads a quad made on the restored context, not
		// SpriteRenderer's, which still dates from before the loss
		const quadData = calls.findIndex(c => c[0] === 'bufferData' && c[2].length === 16);
		expect(quadData).toBeGreaterThan(-1);
		const quad = calls[quadData - 1][2];
		const vao = calls.findIndex(c => c[0] === 'bindVertexArray' && c[1]);
		expect(calls.find((c, i) => i > vao && c[0] === 'bindBuffer')[2]).toBe(quad);
		expect(calls.filter(c => c[0] === 'drawArraysInstanced')).toEqual([['drawArraysInstanced', 1]]);
	});

	it('draws sprites one by one when batching is off', () => {
		SpriteBatch.enabled = false;
		SpriteRenderer.beginBatch(gl);
		calls.length = 0;
		draw(wolf, 0, false);
		draw(wolf, 1, false);
		SpriteRenderer.endBatch();

		expect(names(calls).filter(n => n.startsWith('draw'))).toEqual(['drawArrays', 'drawArrays']);
	});
});
