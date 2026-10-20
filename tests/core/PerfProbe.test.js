import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Load a fresh PerfProbe with `perfProbe` set in the configuration or not
 */
async function load(enabled) {
	vi.resetModules();
	vi.doMock('Core/Configs.js', () => ({
		default: { get: (key, fallback) => (key === 'perfProbe' ? enabled : fallback) }
	}));
	return (await import('Core/PerfProbe.js')).default;
}

function makeGl() {
	const calls = [];
	return {
		calls,
		drawArrays: (...a) => calls.push(['drawArrays', ...a]),
		drawElements: (...a) => calls.push(['drawElements', ...a]),
		drawArraysInstanced: (...a) => calls.push(['drawArraysInstanced', ...a]),
		drawElementsInstanced: (...a) => calls.push(['drawElementsInstanced', ...a])
	};
}

afterEach(() => {
	document.getElementById('roPerfOverlay')?.remove();
	vi.doUnmock('Core/Configs.js');
});

describe('PerfProbe', () => {
	it('does nothing unless the configuration asks for it', async () => {
		const PerfProbe = await load(false);
		const gl = makeGl();
		const drawArrays = gl.drawArrays;
		PerfProbe.attach(gl);
		expect(PerfProbe.enabled).toBe(false);
		expect(gl.drawArrays).toBe(drawArrays);
		expect(document.getElementById('roPerfOverlay')).toBeNull();
	});

	it('switches on when the renderer attaches, without a global', async () => {
		const PerfProbe = await load(true);
		expect(PerfProbe.enabled).toBe(false);
		PerfProbe.attach(makeGl());
		expect(PerfProbe.enabled).toBe(true);
		expect(document.getElementById('roPerfOverlay')).not.toBeNull();
		expect(window.roPerf).toBeUndefined();
		PerfProbe.overlay(false);
		expect(document.getElementById('roPerfOverlay')).toBeNull();
	});

	it('counts draw calls and frame times per frame', async () => {
		const PerfProbe = await load(true);
		const gl = makeGl();
		PerfProbe.attach(gl);

		// The first frame of a window only sets the clock
		for (let frame = 0; frame < 5; frame++) {
			PerfProbe.frameStart(1000 + frame * 20);
			gl.drawArrays(4, 0, 6);
			gl.drawElements(4, 30, 0x1403, 0);
			PerfProbe.frameEnd();
		}

		const stats = PerfProbe.stats();
		expect(stats.frames).toBe(4);
		expect(stats.frameMs.avg).toBe(20);
		expect(stats.frameMs.p99).toBe(20);
		expect(stats.drawCalls.avg).toBe(2);
		expect(stats.verticesPerFrame).toBe(36);
		expect(gl.calls).toHaveLength(10);

		PerfProbe.reset();
		expect(PerfProbe.stats().frames).toBe(0);
	});

	it('logs frames slower than 33 ms', async () => {
		const PerfProbe = await load(true);
		PerfProbe.attach(makeGl());
		for (const t of [0, 16, 32, 132, 148]) {
			PerfProbe.frameStart(1000 + t);
			PerfProbe.frameEnd();
		}
		const slow = PerfProbe.slowFrames();
		expect(slow).toHaveLength(1);
		expect(slow[0].frameMs).toBe(100);
		expect(slow[0].at).toBe(1032);
		PerfProbe.reset();
		expect(PerfProbe.slowFrames()).toHaveLength(0);
	});

	it('counts every instance of an instanced draw', async () => {
		const PerfProbe = await load(true);
		const gl = makeGl();
		PerfProbe.attach(gl);
		for (const t of [0, 16]) {
			PerfProbe.frameStart(1000 + t);
			gl.drawArraysInstanced(5, 0, 4, 640);
			gl.drawElementsInstanced(4, 6, 0x1403, 0, 10);
			PerfProbe.frameEnd();
		}
		expect(PerfProbe.stats().verticesPerFrame).toBe(4 * 640 + 6 * 10);
	});

	it('does not count a renderer pause as a frame', async () => {
		const PerfProbe = await load(true);
		PerfProbe.attach(makeGl());
		for (const t of [0, 16, 32]) {
			PerfProbe.frameStart(1000 + t);
			PerfProbe.frameEnd();
		}
		PerfProbe.stop();
		for (const t of [30000, 30016]) {
			PerfProbe.frameStart(1000 + t);
			PerfProbe.frameEnd();
		}
		const stats = PerfProbe.stats();
		expect(stats.frames).toBe(3);
		expect(stats.frameMs.max).toBe(16);
		expect(stats.hitches).toBe(0);
		expect(PerfProbe.slowFrames()).toHaveLength(0);
	});

	it('takes the frame rate from the frames, not from the time spent loading', async () => {
		const PerfProbe = await load(true);
		const now = vi.spyOn(performance, 'now').mockReturnValue(1);
		PerfProbe.attach(makeGl());
		for (let frame = 0; frame <= 300; frame++) {
			PerfProbe.frameStart(1000 + frame * 20);
			PerfProbe.frameEnd();
		}
		now.mockReturnValue(11001); // 6 s drawing, 5 s loading
		const stats = PerfProbe.stats();
		now.mockRestore();
		expect(stats.fps).toBe(50);
		expect(stats.drawingSeconds).toBe(6);
		expect(stats.seconds).toBe(11);
	});

	it('stops logging and measuring slow frames at the cap, and says how many there were', async () => {
		const PerfProbe = await load(true);
		const measure = vi.spyOn(performance, 'measure').mockImplementation(() => {});
		const clear = vi.spyOn(performance, 'clearMeasures').mockImplementation(() => {});
		PerfProbe.attach(makeGl());
		for (let frame = 0; frame <= 1200; frame++) {
			PerfProbe.frameStart(1000 + frame * 40);
			PerfProbe.frameEnd();
		}
		expect(PerfProbe.slowFrames()).toHaveLength(1000);
		expect(measure).toHaveBeenCalledTimes(1000);
		expect(PerfProbe.stats().slowFrames).toBe(1200);
		PerfProbe.reset();
		expect(clear).toHaveBeenCalledWith('roPerf slow frame');
		expect(PerfProbe.stats().slowFrames).toBe(0);
		measure.mockRestore();
		clear.mockRestore();
	});

	it('records map load and login marks', async () => {
		const PerfProbe = await load(true);
		PerfProbe.attach(makeGl());
		PerfProbe.loginShown();
		PerfProbe.mapStart('iz_dun04.gat');
		PerfProbe.mapReady();
		PerfProbe.frameStart(1);
		PerfProbe.frameEnd();

		const { marks } = PerfProbe.stats();
		expect(marks.login).toBeTypeOf('number');
		expect(marks.maps).toHaveLength(1);
		expect(marks.maps[0].map).toBe('iz_dun04.gat');
		expect(marks.maps[0].firstFrameMs).toBeTypeOf('number');

		// A reset starts a new window for the map marks; the startup time stays
		PerfProbe.reset();
		expect(PerfProbe.stats().marks.maps).toHaveLength(0);
		expect(PerfProbe.stats().marks.login).toBe(marks.login);
	});
});
