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
const { default: SpriteAtlas } = await import('Renderer/SpriteAtlas.js');

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

function spr(name, type = 0, width = 4, height = 4, count = 2) {
	const frames = Array.from({ length: count }, () => ({
		type,
		width,
		height,
		data: new Uint8Array(width * height * (type ? 4 : 1)),
		texture: { frame: name }
	}));
	return {
		name,
		frames,
		texture: type ? null : { palette: name },
		palette: type ? null : new Uint8Array(1024)
	};
}

function draw(file, frameIndex, isBlendModeOne) {
	const frame = file.frames[frameIndex];
	SpriteRenderer.image.texture = frame.texture;
	SpriteRenderer.image.palette = file.texture;
	SpriteRenderer.palette = file.palette;
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

// The instances of the last upload: [layer, source, palette row] each
function instances(calls) {
	const upload = calls.filter(c => c[0] === 'bufferData').pop();
	const data = upload[2];
	const out = [];
	for (let i = 0; i < upload[5] / 24; i++) {
		out.push([data[i * 24 + 21], data[i * 24 + 20], data[i * 24 + 22]]);
	}
	return out;
}

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

	it('draws different sprite files with different palettes in one call', () => {
		SpriteRenderer.beginBatch(gl);
		draw(wolf, 0, false);
		draw(poring, 0, false);
		draw(wolf, 1, false);
		calls.length = 0;
		SpriteRenderer.endBatch();

		expect(calls.filter(c => c[0] === 'drawArraysInstanced')).toEqual([['drawArraysInstanced', 3]]);
		const [a, b, c] = instances(calls);
		expect(a[1]).toBe(SpriteBatch.SOURCE_INDEX);
		expect(a[2]).toBe(c[2]);
		expect(a[2]).not.toBe(b[2]);
	});

	it('draws RGBA frames from the atlas in the same call', () => {
		const costume = spr('costume', 1);
		SpriteRenderer.beginBatch(gl);
		draw(wolf, 0, false);
		SpriteRenderer.image.palette = null;
		draw(costume, 0, false);
		calls.length = 0;
		SpriteRenderer.endBatch();

		expect(calls.filter(c => c[0] === 'drawArraysInstanced')).toEqual([['drawArraysInstanced', 2]]);
		expect(instances(calls)[1]).toEqual([0, SpriteBatch.SOURCE_RGBA, SpriteBatch.PALETTE_NONE]);
	});

	it('keeps the recorded order around a frame too big for the atlas', () => {
		const big = spr('big', 0, 3000, 4, 1);
		SpriteRenderer.beginBatch(gl);
		draw(wolf, 0, false);
		draw(big, 0, false);
		draw(wolf, 1, false);
		calls.length = 0;
		SpriteRenderer.endBatch();

		expect(calls.filter(c => c[0] === 'drawArraysInstanced')).toHaveLength(3);
		const textures = calls.filter(c => c[0] === 'bindTexture' && c[2] && c[2].frame).map(c => c[2]);
		expect(textures).toEqual([big.frames[0].texture]);
		expect(instances(calls)[1]).toEqual([0, SpriteBatch.SOURCE_OWN, SpriteBatch.PALETTE_OWN]);
	});

	it('keeps a palette on its own texture once the palette atlas is full', () => {
		const files = Array.from({ length: SpriteAtlas.PALETTE_ROWS + 1 }, (v, i) => spr('mob' + i));
		SpriteRenderer.beginBatch(gl);
		for (const file of files) {
			draw(file, 0, false);
		}
		calls.length = 0;
		SpriteRenderer.endBatch();

		const draws = calls.filter(c => c[0] === 'drawArraysInstanced');
		expect(draws).toEqual([
			['drawArraysInstanced', SpriteAtlas.PALETTE_ROWS],
			['drawArraysInstanced', 1]
		]);
		expect(instances(calls).pop()).toEqual([0, SpriteBatch.SOURCE_INDEX, SpriteBatch.PALETTE_OWN]);

		// The next frame starts the palettes over
		SpriteRenderer.beginBatch(gl);
		draw(files[SpriteAtlas.PALETTE_ROWS], 0, false);
		calls.length = 0;
		SpriteRenderer.endBatch();
		expect(instances(calls)).toEqual([[0, SpriteBatch.SOURCE_INDEX, 0]]);
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
		expect(upload[24 + 19]).toBe(0);
	});

	it('packs the frames of every sprite file side by side', () => {
		SpriteRenderer.beginBatch(gl);
		draw(wolf, 0, false);
		draw(poring, 0, false);
		SpriteRenderer.endBatch();

		const rects = [...wolf.frames, ...poring.frames].map(f => f._atlas);
		expect(rects.map(r => r.layer)).toEqual([0, 0, 0, 0]);
		expect(new Set(rects.map(r => r.u0)).size).toBe(4);
	});

	it("gives a freed file's room to the next one", () => {
		const a = spr('a');
		const b = spr('b');
		SpriteRenderer.beginBatch(gl);
		draw(a, 0, false);
		SpriteRenderer.endBatch();
		const first = a.frames[0]._atlas.u0;

		a._atlasRelease();
		expect(a.frames[0]._atlas).toBe(null);

		SpriteRenderer.beginBatch(gl);
		draw(b, 0, false);
		SpriteRenderer.endBatch();
		expect(b.frames[0]._atlas.u0).toBe(first);
	});

	it('grows the atlas when its layers are full, keeping what they hold', () => {
		const huge = spr('huge', 0, 2000, 2000, 3);
		SpriteRenderer.beginBatch(gl);
		draw(huge, 0, false);
		calls.length = 0;
		SpriteRenderer.endBatch();

		expect(huge.frames.map(f => f._atlas.layer).sort()).toEqual([0, 1, 2]);
		expect(calls.filter(c => c[0] === 'drawArraysInstanced')).toEqual([['drawArraysInstanced', 1]]);
	});

	it('rebuilds its GPU objects and repacks after the context is restored', () => {
		SpriteRenderer.beginBatch(gl);
		draw(wolf, 0, false);
		SpriteRenderer.endBatch();
		const generation = wolf._atlasGeneration;
		const palettes = SpriteAtlas.textures.palettes;

		// Same context object, new GPU objects
		SpriteBatch.contextRestored();
		calls.length = 0;
		SpriteRenderer.beginBatch(gl);
		draw(wolf, 0, false);
		SpriteRenderer.endBatch();

		expect(names(calls)).toContain('createVertexArray');
		expect(SpriteAtlas.textures.palettes).not.toBe(palettes);
		expect(wolf._atlasGeneration).not.toBe(generation);

		// Its vertex array reads a quad made on the restored context, not
		// SpriteRenderer's, which still dates from before the loss
		const quadData = calls.findIndex(c => c[0] === 'bufferData' && c[2].length === 16);
		expect(quadData).toBeGreaterThan(-1);
		const quad = calls[quadData - 1][2];
		const vao = calls.findIndex(c => c[0] === 'bindVertexArray' && c[1]);
		expect(calls.find((c, i) => i > vao && c[0] === 'bindBuffer')[2]).toBe(quad);
		expect(calls.filter(c => c[0] === 'drawArraysInstanced')).toEqual([['drawArraysInstanced', 1]]);
	});

	it('deletes the old palette texture when the context changes', () => {
		SpriteRenderer.beginBatch(gl);
		draw(wolf, 0, false);
		SpriteRenderer.endBatch();
		const palettes = SpriteAtlas.textures.palettes;
		const oldCalls = calls;

		const next = fakeGL();
		SpriteRenderer.init(next.gl);
		SpriteRenderer.bind3DContext(next.gl, M, M, FOG);
		SpriteRenderer.beginBatch(next.gl);
		SpriteRenderer.endBatch();

		expect(oldCalls.some(c => c[0] === 'deleteTexture' && c[1] === palettes)).toBe(true);
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
