import { describe, expect, it, vi } from 'vitest';

// ThreeDEffect `sharedTexture`: many instances of one row (Endure's streaks) load their
// effect/ texture once and share it, and the class frees it when its last instance goes.

const loads = vi.hoisted(() => []);
vi.mock('Core/Client.js', () => ({
	default: {
		loadFile(path, onload) {
			loads.push(path);
			onload(new ArrayBuffer(4));
		}
	}
}));
vi.mock('Utils/WebGL.js', () => ({
	default: {
		texture(gl, buffer, onload) {
			onload({ id: loads.length });
		}
	}
}));
vi.mock('Renderer/SpriteRenderer.js', () => ({ default: {} }));
vi.mock('Renderer/Camera.js', () => ({ default: { angle: [0, 0], direction: 0 } }));

const { default: ThreeDEffect } = await import('../../src/Renderer/Effects/ThreeDEffect.js');

const deleted = [];
const gl = { deleteTexture: t => deleted.push(t) };

function make(row) {
	return new ThreeDEffect(
		{ type: '3D', alphaMax: 1, size: 50, ...row },
		{ position: [0, 0, 0], startTick: 0, endTick: 100 },
		{ ownerAID: 1 }
	);
}

describe('ThreeDEffect shared textures', () => {
	it('loads a shared effect/ texture once for every instance', () => {
		loads.length = 0;
		const a = make({ file: 'effect/alpha_down.tga', sharedTexture: true });
		const b = make({ file: 'effect/alpha_down.tga', sharedTexture: true });
		a.init(gl);
		b.init(gl);
		expect(loads).toEqual(['data/texture/effect/alpha_down.tga']);
		expect(a.ready && b.ready).toBe(true);
		expect(a.texture).toBe(b.texture);
	});

	it('frees the shared textures with the class', () => {
		deleted.length = 0;
		ThreeDEffect.free(gl);
		expect(deleted).toHaveLength(1);
		loads.length = 0;
		make({ file: 'effect/alpha_down.tga', sharedTexture: true }).init(gl);
		expect(loads).toHaveLength(1);
	});

	it('keeps one load per instance for other rows', () => {
		loads.length = 0;
		make({ file: 'effect/endure.tga' }).init(gl);
		make({ file: 'effect/endure.tga' }).init(gl);
		expect(loads).toHaveLength(2);
	});
});
