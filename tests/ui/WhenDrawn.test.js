/**
 * UI/WhenDrawn.js runs a callback once, the first time an element is drawn.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import whenDrawn from 'UI/WhenDrawn.js';

// jsdom draws nothing and has no IntersectionObserver; a test says what is drawn
const observed = new Set();
let notify = null;
class FakeObserver {
	constructor(callback) {
		notify = callback;
	}
	observe(element) {
		observed.add(element);
	}
	unobserve(element) {
		observed.delete(element);
	}
}
function draw(element, isIntersecting = true) {
	notify?.([{ target: element, isIntersecting }]);
}

afterEach(() => {
	delete globalThis.IntersectionObserver;
});

describe('whenDrawn', () => {
	it('runs the callback at once without IntersectionObserver', () => {
		const callback = vi.fn();
		whenDrawn(document.createElement('div'), callback);
		expect(callback).toHaveBeenCalledTimes(1);
	});

	it('waits for the element to be drawn, then runs each callback once', () => {
		globalThis.IntersectionObserver = FakeObserver;
		const element = document.createElement('div');
		const first = vi.fn();
		const second = vi.fn();
		whenDrawn(element, first);
		whenDrawn(element, second);
		expect(first).not.toHaveBeenCalled();

		draw(element, false);
		expect(first).not.toHaveBeenCalled();

		draw(element);
		draw(element);
		expect(first).toHaveBeenCalledTimes(1);
		expect(second).toHaveBeenCalledTimes(1);
		expect(observed.has(element)).toBe(false);
	});

	it('keeps running the other callbacks when one throws', () => {
		globalThis.IntersectionObserver = FakeObserver;
		const element = document.createElement('div');
		const after = vi.fn();
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		whenDrawn(element, () => {
			throw new Error('boom');
		});
		whenDrawn(element, after);
		draw(element);
		expect(after).toHaveBeenCalledTimes(1);
		expect(error).toHaveBeenCalled();
		error.mockRestore();
	});

	it('stops watching under a host taken off the page, and resumes when it is back', () => {
		globalThis.IntersectionObserver = FakeObserver;
		const host = document.createElement('div');
		const shadow = host.attachShadow({ mode: 'open' });
		const inner = document.createElement('span');
		shadow.appendChild(inner);
		const callback = vi.fn();
		whenDrawn(host, callback);
		whenDrawn(inner, callback);

		whenDrawn.suspend(host);
		expect(observed.has(host)).toBe(false);
		expect(observed.has(inner)).toBe(false);

		whenDrawn.resume(host);
		expect(observed.has(host)).toBe(true);
		expect(observed.has(inner)).toBe(true);
		draw(inner);
		draw(host);
		expect(callback).toHaveBeenCalledTimes(2);
	});
});
