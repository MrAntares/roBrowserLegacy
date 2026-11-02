import { describe, expect, it, vi } from 'vitest';

// ThreeDEffect `track`: a per-frame path (position, size, alpha, angle) from a function of the
// age in official client ticks, used by effects ported from the official client.

const renderer = vi.hoisted(() => ({
	position: [0, 0, 0],
	size: [0, 0],
	color: [1, 1, 1, 1],
	offset: [0, 0],
	angle: 0,
	image: { texture: null, palette: null, size: [0, 0] },
	zIndex: 0,
	drawn: [],
	fogToBlack() {},
	runWithDepth(a, b, c, fn) {
		fn();
	},
	render() {
		renderer.drawn.push({
			position: renderer.position.slice(),
			size: renderer.size.slice(),
			alpha: renderer.color[3],
			angle: renderer.angle,
			offset: renderer.offset.slice()
		});
	}
}));

vi.mock('Renderer/SpriteRenderer.js', () => ({ default: renderer }));
vi.mock('Renderer/Camera.js', () => ({ default: { angle: [0, 0], direction: 0 } }));

const { default: ThreeDEffect, trackAge } = await import('../../src/Renderer/Effects/ThreeDEffect.js');

const gl = { SRC_ALPHA: 1, ONE_MINUS_SRC_ALPHA: 2, blendFunc() {} };

function make(track) {
	const effect = new ThreeDEffect(
		{ type: '3D', file: 'none.tga', alphaMax: 1, size: 50, track },
		{ position: [10, 20, 3], startTick: 1000, endTick: 2000 },
		{ ownerAID: 1 }
	);
	effect.texture = {};
	effect.textureList = [];
	return effect;
}

describe('ThreeDEffect track', () => {
	it('counts age in client ticks', () => {
		expect(trackAge(1000, 1000)).toBe(0);
		expect(trackAge(1000, 1500)).toBe(30);
	});

	it('draws where the track says', () => {
		const ages = [];
		const effect = make(age => {
			ages.push(age);
			return { x: 1, y: -2, z: 0.5, size: 28, alpha: 0.25, angle: 45 };
		});
		renderer.drawn.length = 0;
		effect.render(gl, 1500);
		expect(ages).toEqual([30]);
		expect(renderer.drawn).toEqual([
			{ position: [11, 18, 3.5], size: [28, 28], alpha: 0.25, angle: 45, offset: [0, 0] }
		]);
	});

	it('draws nothing when the track returns null', () => {
		const effect = make(() => null);
		renderer.drawn.length = 0;
		effect.render(gl, 1200);
		expect(renderer.drawn).toEqual([]);
	});

	it('keeps the other options for fields the track leaves out', () => {
		const effect = make(() => ({ z: 1 }));
		renderer.drawn.length = 0;
		effect.render(gl, 1200);
		expect(renderer.drawn[0].position).toEqual([10, 20, 4]);
		expect(renderer.drawn[0].size).toEqual([50, 50]);
	});

	it('sets the two sides apart and moves the sprite on the screen plane for this sprite only', () => {
		const effect = make(() => ({ sizeX: 3, sizeY: 80, offsetX: 12, offsetY: -20 }));
		renderer.drawn.length = 0;
		effect.render(gl, 1200);
		expect(renderer.drawn[0].size).toEqual([3, 80]);
		expect(renderer.drawn[0].offset).toEqual([12, -20]);
		expect(renderer.offset).toEqual([0, 0]);
	});
});
