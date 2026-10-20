import { beforeEach, describe, expect, it } from 'vitest';
import FramePacer from 'Renderer/FramePacer.js';

/**
 * Drive the pacer the way Renderer._render does, with rAF firing at `hz`
 * (plus a little timestamp jitter), and return the intervals between the
 * frames it let through after the refresh rate is known.
 */
function run(hz, limit, { seconds = 2, jitter = 0.2, random = false, start = 1000 } = {}) {
	const refresh = 1000 / hz;
	const frames = [];
	let last = 0;
	let seed = 1;
	for (let i = 0; i < hz * seconds; i++) {
		seed = (seed * 16807) % 2147483647;
		const offset = random ? (seed / 2147483647) * 2 - 1 : i % 2 ? 1 : -1;
		const now = start + i * refresh + offset * jitter;
		FramePacer.sample(now);
		if (last === 0) {
			last = now;
		}
		const next = FramePacer.next(now, last, limit);
		if (next >= 0) {
			last = next;
			if (i > 40) {
				frames.push(now);
			}
		}
	}
	return frames.slice(1).map((t, i) => t - frames[i]);
}

const refreshes = (intervals, hz) => [...new Set(intervals.map(ms => Math.round(ms / (1000 / hz))))];

beforeEach(() => FramePacer.reset());

describe('FramePacer', () => {
	it('paces evenly when a whole number of refreshes fits under the limit', () => {
		expect(refreshes(run(60, 60), 60)).toEqual([1]);
		FramePacer.reset();
		expect(refreshes(run(59.94, 60), 59.94)).toEqual([1]);
		FramePacer.reset();
		expect(refreshes(run(120, 60), 120)).toEqual([2]);
		FramePacer.reset();
		expect(refreshes(run(119.88, 60), 119.88)).toEqual([2]);
		FramePacer.reset();
		expect(refreshes(run(165, 60), 165)).toEqual([3]); // 55 fps
		FramePacer.reset();
		expect(refreshes(run(60, 30), 60)).toEqual([2]);
	});

	it('uses every refresh when the display is slower than the limit', () => {
		expect(refreshes(run(60, 90), 60)).toEqual([1]);
		FramePacer.reset();
		expect(refreshes(run(75, 120), 75)).toEqual([1]);
	});

	it('falls back to the time limiter when even pacing would fall 10% short', () => {
		// 60 on 75 Hz: 2 refreshes would be 37.5, so by time (1 or 2 refreshes)
		expect(FramePacer.refreshesPerFrame(60, 1000 / 75)).toBe(2);
		run(75, 60, { seconds: 1 });
		expect(FramePacer.canPace(60, FramePacer.refreshInterval())).toBe(false);
		FramePacer.reset();
		expect(refreshes(run(75, 60), 75).sort()).toEqual([1, 2]);
		FramePacer.reset();
		expect(FramePacer.canPace(60, 1000 / 144)).toBe(false); // 48 < 54
	});

	it('never renders faster than the limit', () => {
		for (const hz of [59.94, 60, 75, 119.88, 120, 144, 165, 240]) {
			for (const limit of [30, 60, 90, 120]) {
				FramePacer.reset();
				const intervals = run(hz, limit, { seconds: 4 });
				const fps = 1000 / (intervals.reduce((a, b) => a + b, 0) / intervals.length);
				// 1% slack: 60.0x Hz counts as 60
				expect(fps).toBeLessThanOrEqual(limit * 1.01);
				// and the cap is reached, or the display's own rate is
				expect(fps).toBeGreaterThanOrEqual(Math.min(limit, hz) * 0.9);
			}
		}
	});

	it('keeps one pacing when the display sits at the edge of the slack', () => {
		// 60.6 Hz for 60, 121.2 Hz for 60: measured either side of the 1%
		for (const [hz, limit] of [
			[60.6, 60],
			[60.65, 60],
			[121.2, 60],
			[60.6, 30]
		]) {
			FramePacer.reset();
			const intervals = run(hz, limit, { seconds: 10, jitter: 0.1, random: true });
			const fps = 1000 / (intervals.reduce((a, b) => a + b, 0) / intervals.length);
			expect(fps).toBeGreaterThan(limit * 0.99);
			expect(fps).toBeLessThanOrEqual(limit * 1.01);
		}
	});

	it('gives the lower count back when the display moves under the edge of the slack', () => {
		// 60.65 Hz for 60 is past the edge: by time. Then 60.5 Hz is within
		// the 1%: every refresh, evenly.
		run(60.65, 60, { seconds: 5, jitter: 0.1, random: true });
		const intervals = run(60.5, 60, { seconds: 10, jitter: 0.1, random: true, start: 6000 }).slice(120);
		expect(refreshes(intervals, 60.5)).toEqual([1]);
	});

	it('measures the refresh interval from rAF timestamps', () => {
		run(75, 60, { seconds: 1 });
		expect(FramePacer.refreshInterval()).toBeCloseTo(1000 / 75, 0);
	});

	it('limits by time until the refresh rate is known', () => {
		FramePacer.sample(1000);
		expect(FramePacer.refreshInterval()).toBe(0);
		expect(FramePacer.next(1010, 1000, 60)).toBe(-1);
		expect(FramePacer.next(1020, 1000, 60)).toBeCloseTo(1020 - (20 % (1000 / 60)), 5);
	});

	it('reports the rate a limit gives on the display', () => {
		expect(FramePacer.targetRate(60)).toBe(60); // refresh rate not known yet
		expect(FramePacer.targetRate(-1)).toBe(0);
		run(165, 60, { seconds: 1 });
		expect(FramePacer.targetRate(60)).toBeCloseTo(55, 0); // 3 refreshes
		expect(Math.abs(FramePacer.targetRate(-1) - 165)).toBeLessThan(2); // jitter
		FramePacer.reset();
		run(60, 120, { seconds: 1 });
		expect(FramePacer.targetRate(120)).toBeCloseTo(60, 0); // display slower than the limit
		FramePacer.reset();
		run(75, 60, { seconds: 1 });
		expect(FramePacer.targetRate(60)).toBe(60); // by time
	});

	it('ignores gaps that are not refreshes', () => {
		for (let i = 0; i < 20; i++) {
			FramePacer.sample(1000 + i * 16.667);
		}
		FramePacer.sample(5000); // a hidden tab
		expect(FramePacer.refreshInterval()).toBeCloseTo(16.667, 1);
	});
});
