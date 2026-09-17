import { beforeEach, describe, expect, it, vi } from 'vitest';

const camera = {
	enable3RDPerson: true,
	state: 1,
	states: { isometric: 0, third_person: 1, first_person: 2 },
	focus: new Float32Array([1, 2, 3])
};
const graphics = { occluderFade: 'dither', occluderFadeOpacity: 0.25 };
const runWithDepth = vi.fn((_test, _mask, _corr, fn) => fn());

vi.mock('Renderer/Effects/Shaders/GLSL/OccluderFade.glsl?raw', () => ({
	default: 'uniform int uOccluderFadeMode;'
}));
vi.mock('Renderer/Camera.js', () => ({ default: camera }));
vi.mock('Preferences/Graphics.js', () => ({ default: graphics }));
vi.mock('Renderer/SpriteRenderer.js', () => ({ default: { runWithDepth } }));

const { default: OccluderFade } = await import('Renderer/Map/OccluderFade.js');

const uniform = {
	uOccluderFadeMode: 'mode',
	uOccluderFadeEye: 'eye',
	uOccluderFadeFocus: 'focus',
	uOccluderFadeRadius: 'radius',
	uOccluderFadeOpacity: 'opacity'
};

function makeGl() {
	return {
		SRC_ALPHA: 770,
		ONE_MINUS_SRC_ALPHA: 771,
		uniform1i: vi.fn(),
		uniform1f: vi.fn(),
		uniform3fv: vi.fn(),
		blendFunc: vi.fn()
	};
}

describe('Renderer/Map/OccluderFade', () => {
	beforeEach(() => {
		camera.enable3RDPerson = true;
		camera.state = camera.states.third_person;
		graphics.occluderFade = 'dither';
		runWithDepth.mockClear();
	});

	it('splices the shared GLSL at the include marker', () => {
		const out = OccluderFade.injectShader('a\n// #include OccluderFade.glsl\nb');
		expect(out).toBe('a\nuniform int uOccluderFadeMode;\nb');
	});

	it('is only active in third person with the camera allowed and setting on', () => {
		expect(OccluderFade.isActive()).toBe(true);

		camera.state = camera.states.isometric;
		expect(OccluderFade.isActive()).toBe(false);

		camera.state = camera.states.first_person;
		expect(OccluderFade.isActive()).toBe(false);

		camera.state = camera.states.third_person;
		camera.enable3RDPerson = false;
		expect(OccluderFade.isActive()).toBe(false);

		camera.enable3RDPerson = true;
		graphics.occluderFade = 'off';
		expect(OccluderFade.isActive()).toBe(false);
	});

	it('picks the opaque shader mode from the setting', () => {
		expect(OccluderFade.opaqueMode()).toBe(OccluderFade.MODE.DITHER);
		expect(OccluderFade.needsBlendPass()).toBe(false);

		graphics.occluderFade = 'alpha';
		expect(OccluderFade.opaqueMode()).toBe(OccluderFade.MODE.ALPHA_OPAQUE);
		expect(OccluderFade.needsBlendPass()).toBe(true);

		camera.state = camera.states.isometric;
		expect(OccluderFade.opaqueMode()).toBe(OccluderFade.MODE.OFF);
		expect(OccluderFade.needsBlendPass()).toBe(false);
	});

	it('uploads only the mode when off', () => {
		const gl = makeGl();
		OccluderFade.setUniforms(gl, uniform, OccluderFade.MODE.OFF);
		expect(gl.uniform1i).toHaveBeenCalledWith('mode', 0);
		expect(gl.uniform3fv).not.toHaveBeenCalled();
		expect(gl.uniform1f).not.toHaveBeenCalled();
	});

	it('uploads eye from the inverted model-view and focus from the camera', () => {
		const gl = makeGl();
		// translation by (-4, -5, -6): the eye sits at (4, 5, 6)
		const modelView = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -4, -5, -6, 1]);
		OccluderFade.update(modelView);
		OccluderFade.setUniforms(gl, uniform, OccluderFade.MODE.DITHER);

		const eye = gl.uniform3fv.mock.calls.find((c) => c[0] === 'eye')[1];
		expect(Array.from(eye)).toEqual([4, 5, 6]);
		expect(gl.uniform3fv).toHaveBeenCalledWith('focus', camera.focus);
		expect(gl.uniform1f).toHaveBeenCalledWith('opacity', 0.25);
	});

	it('draws the opaque pass with depth writes and the blend pass without', () => {
		const gl = makeGl();
		const draw = vi.fn();

		OccluderFade.renderOpaque(gl, uniform, draw);
		expect(runWithDepth).toHaveBeenLastCalledWith(true, true, true, expect.any(Function));
		expect(gl.uniform1i).toHaveBeenLastCalledWith('mode', OccluderFade.MODE.DITHER);

		OccluderFade.renderBlend(gl, uniform, draw);
		expect(runWithDepth).toHaveBeenLastCalledWith(true, false, true, expect.any(Function));
		expect(gl.uniform1i).toHaveBeenLastCalledWith('mode', OccluderFade.MODE.ALPHA_BLEND);
		expect(gl.blendFunc).toHaveBeenCalledWith(770, 771);
		expect(draw).toHaveBeenCalledTimes(2);
	});
});
