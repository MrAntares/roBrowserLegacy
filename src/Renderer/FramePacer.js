/**
 * Renderer/FramePacer.js
 *
 * Frame limiter that paces to the display. requestAnimationFrame fires once per
 * display refresh, so a limit that is not a whole divisor of the refresh rate
 * can only be met by skipping some refreshes and not others: 60 fps on a 75 Hz
 * display shows one frame in four for two refreshes, and frame times alternate
 * between 13.3 and 26.7 ms. That reads as stutter, though the average is 60.
 *
 * A limit is a ceiling: players set one for heat and power, so it is never
 * exceeded by more than the 1% that lets a 60.0x Hz display count as 60. The refresh interval is measured from the rAF timestamps, and when
 * a whole number of refreshes per frame gives a rate at or under the limit and
 * within 10% of it, every frame lasts that many refreshes: 60 on 60 or 120 Hz
 * is an even 60, 60 on 165 Hz an even 55, 30 on 60 Hz an even 30. When none
 * does (60 on 75 Hz would be 37.5, on 144 Hz 48), the limit is applied by time,
 * as before: the cap holds, unevenly. A display rate under the limit is used
 * as it is, every refresh.
 *
 * Until enough refreshes have been seen, or when the rAF rate is not steady
 * (a hidden tab, a fallback timer), the limit is also applied by time.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

/**
 * rAF intervals kept to estimate the refresh interval
 */
const SAMPLES = 31;

/**
 * Intervals needed before the estimate is used
 */
const MIN_SAMPLES = 8;

/**
 * Intervals longer than this (ms) are not refreshes (a hidden tab, a stall)
 */
const MAX_INTERVAL = 100;

/**
 * Share of the rate below the edge of the 1% slack where the last refreshes
 * per frame are kept
 */
const EDGE_BAND = 0.0015;

const _intervals = new Float32Array(SAMPLES);
const _sorted = new Float32Array(SAMPLES);
let _count = 0;
let _next = 0;
let _lastTick = 0;

/**
 * Refreshes per frame that next() last chose, and for which limit
 */
let _frames = 0;
let _framesLimit = 0;

class FramePacer {
	/**
	 * Record a rAF callback, rendered or not
	 *
	 * @param {number} now rAF timestamp (ms)
	 */
	static sample(now) {
		const interval = now - _lastTick;
		_lastTick = now;
		if (interval <= 0 || interval > MAX_INTERVAL) {
			return;
		}
		_intervals[_next] = interval;
		_next = (_next + 1) % SAMPLES;
		_count = Math.min(_count + 1, SAMPLES);
	}

	/**
	 * Measured refresh interval: the mean of the middle half of the recent
	 * rAF intervals (robust to a stall, and to timestamps that jitter either
	 * side of the refresh, where a median picks one side), or 0 while there
	 * are too few
	 *
	 * @return {number} ms
	 */
	static refreshInterval() {
		if (_count < MIN_SAMPLES) {
			return 0;
		}
		const sorted = _sorted.subarray(0, _count);
		sorted.set(_intervals.subarray(0, _count));
		sorted.sort();
		const from = _count >> 2;
		const to = _count - from;
		let sum = 0;
		for (let i = from; i < to; ++i) {
			sum += sorted[i];
		}
		return sum / (to - from);
	}

	/**
	 * How many refreshes each frame lasts, for a limit: the fewest that keep
	 * the frame rate at or under it. 1% of slack lets a 60.0x or 120.0x Hz
	 * display count as 60 or 120.
	 *
	 * Near the edge of the slack the last count chosen is kept: a display
	 * measured either side of it (60.6 Hz for 60) would otherwise switch on
	 * every few frames between pacing and the time limiter, and stutter. The
	 * band is 0.15% below the edge, wider than the estimate wanders with
	 * 0.1 ms of timestamp jitter (about 0.1%), so a display that really moves
	 * under the edge (60.5 Hz) gets the lower count back.
	 *
	 * @param {number} limit fps
	 * @param {number} refresh refresh interval (ms)
	 * @return {number} 1 or more
	 */
	static refreshesPerFrame(limit, refresh) {
		const display = 1000 / refresh;
		const frames = Math.max(1, Math.ceil(display / (limit * 1.01)));
		if (limit === _framesLimit && _frames === frames + 1 && display / frames > limit * 1.01 * (1 - EDGE_BAND)) {
			return _frames;
		}
		return frames;
	}

	/**
	 * Whether frames can be paced evenly under a limit: the rate a whole
	 * number of refreshes gives is the display's own, or within 10% of it
	 *
	 * @param {number} limit fps
	 * @param {number} refresh refresh interval (ms)
	 * @return {boolean}
	 */
	static canPace(limit, refresh) {
		const frames = FramePacer.refreshesPerFrame(limit, refresh);
		return frames === 1 || 1000 / refresh / frames >= limit * 0.9;
	}

	/**
	 * Whether a frame is due, and from when the next one counts
	 *
	 * @param {number} now rAF timestamp (ms)
	 * @param {number} last value returned for the previous frame
	 * @param {number} limit fps, above 0
	 * @return {number} the new `last` when a frame is due, or -1 to skip
	 */
	static next(now, last, limit) {
		const elapsed = now - last;
		const refresh = FramePacer.refreshInterval();

		if (refresh) {
			_frames = FramePacer.refreshesPerFrame(limit, refresh);
			_framesLimit = limit;
		}

		if (!refresh || !FramePacer.canPace(limit, refresh)) {
			// By time, as before: keep to the interval grid, so the rate
			// does not drift below the limit (nor above it)
			const interval = 1000 / limit;
			return elapsed < interval ? -1 : now - (elapsed % interval);
		}

		// Half a refresh of tolerance absorbs rAF timestamp jitter
		return elapsed < (_frames - 0.5) * refresh ? -1 : now;
	}

	/**
	 * The frame rate a limit is expected to give on this display: the display's
	 * own rate with no limit or a limit above it, the evenly paced rate when
	 * frames can be paced, otherwise the limit. With the refresh rate not known
	 * yet, the limit (0 when there is none).
	 *
	 * @param {number} limit fps, or 0 or less for none
	 * @return {number} fps
	 */
	static targetRate(limit) {
		const refresh = FramePacer.refreshInterval();
		if (!refresh) {
			return limit > 0 ? limit : 0;
		}
		const display = 1000 / refresh;
		if (limit <= 0) {
			return display;
		}
		if (!FramePacer.canPace(limit, refresh)) {
			return Math.min(limit, display);
		}
		return display / FramePacer.refreshesPerFrame(limit, refresh);
	}

	/**
	 * Forget the measured refresh rate (for tests, or a display change)
	 */
	static reset() {
		_count = 0;
		_next = 0;
		_lastTick = 0;
		_frames = 0;
		_framesLimit = 0;
	}
}

/**
 * Export
 */
export default FramePacer;
