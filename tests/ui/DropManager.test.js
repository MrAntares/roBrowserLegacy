/* global document, window, Event */

import { afterEach, describe, expect, it, vi } from 'vitest';
import DropManager from 'UI/DropManager.js';

const unregisters = [];

function setRect(element, rect) {
	const { left, top, width, height } = rect;
	Object.defineProperty(element, 'getBoundingClientRect', {
		configurable: true,
		value: () => ({
			left,
			top,
			width,
			height,
			right: left + width,
			bottom: top + height
		})
	});
}

function createZone(rect, zIndex = 50, parent = document.body) {
	const element = document.createElement('div');
	element.style.position = 'absolute';
	element.style.zIndex = String(zIndex);
	setRect(element, rect);
	parent.appendChild(element);
	return element;
}

function registerZone(element, options = {}) {
	const unregister = DropManager.register(element, {
		drop: vi.fn(),
		...options
	});
	unregisters.push(unregister);
	return unregister;
}

function dragEvent(type, x, y, data) {
	const event = new Event(type, { bubbles: true, cancelable: true });
	Object.defineProperty(event, 'clientX', { configurable: true, value: x });
	Object.defineProperty(event, 'clientY', { configurable: true, value: y });
	Object.defineProperty(event, 'dataTransfer', {
		configurable: true,
		value: {
			getData: requestedType => {
				if (requestedType === 'Text') {
					return JSON.stringify(data);
				}
				return '';
			}
		}
	});
	return event;
}

afterEach(() => {
	for (const unregister of unregisters.splice(0)) {
		unregister();
	}
	delete window._OBJ_DRAG_;
	document.body.innerHTML = '';
	vi.restoreAllMocks();
});

describe('DropManager', () => {
	it('registers and unregisters zones idempotently', () => {
		const element = createZone({ left: 0, top: 0, width: 100, height: 100 });
		const unregister = DropManager.register(element, { drop: vi.fn() });

		expect(DropManager.getTargetAt(10, 10, { type: 'item' })?.element).toBe(element);
		expect(unregister()).toBe(true);
		expect(unregister()).toBe(false);
		expect(DropManager.getTargetAt(10, 10, { type: 'item' })).toBeNull();
	});

	it('chooses the highest z-index zone', () => {
		const low = createZone({ left: 0, top: 0, width: 100, height: 100 }, 50);
		const high = createZone({ left: 0, top: 0, width: 100, height: 100 }, 80);
		registerZone(low);
		registerZone(high);

		expect(DropManager.getTargetAt(10, 10, { type: 'item' })?.element).toBe(high);
	});

	it('chooses the smaller zone when z-index values tie', () => {
		const large = createZone({ left: 0, top: 0, width: 200, height: 200 }, 50);
		const small = createZone({ left: 20, top: 20, width: 40, height: 40 }, 50);
		registerZone(large);
		registerZone(small);

		expect(DropManager.getTargetAt(30, 30, { type: 'item' })?.element).toBe(small);
	});

	it('uses accept filters to reject data', () => {
		const element = createZone({ left: 0, top: 0, width: 100, height: 100 });
		registerZone(element, { accept: data => data.type === 'skill' });

		expect(DropManager.getTargetAt(10, 10, { type: 'item' })).toBeNull();
		expect(DropManager.getTargetAt(10, 10, { type: 'skill' })?.element).toBe(element);
	});

	it('ignores hidden and detached zones', () => {
		const hidden = createZone({ left: 0, top: 0, width: 100, height: 100 });
		const detached = createZone({ left: 0, top: 0, width: 100, height: 100 });
		hidden.style.display = 'none';
		detached.remove();
		registerZone(hidden);
		registerZone(detached);

		expect(DropManager.getTargetAt(10, 10, { type: 'item' })).toBeNull();
	});

	it('reads window._OBJ_DRAG_ before DataTransfer', () => {
		window._OBJ_DRAG_ = { type: 'item', from: 'window' };
		const event = dragEvent('drop', 10, 10, { type: 'skill', from: 'dataTransfer' });

		expect(DropManager.getDragData(event)).toBe(window._OBJ_DRAG_);
	});

	it('parses JSON from DataTransfer Text data', () => {
		const event = dragEvent('drop', 10, 10, { type: 'item', index: 7 });

		expect(DropManager.getDragData(event)).toEqual({ type: 'item', index: 7 });
	});

	it('prevents dragover only when a matching zone exists', () => {
		const element = createZone({ left: 0, top: 0, width: 100, height: 100 });
		registerZone(element);

		const matching = dragEvent('dragover', 10, 10, { type: 'item' });
		document.dispatchEvent(matching);
		expect(matching.defaultPrevented).toBe(true);

		const missed = dragEvent('dragover', 150, 150, { type: 'item' });
		document.dispatchEvent(missed);
		expect(missed.defaultPrevented).toBe(false);
	});

	it('dropAt dispatches to the resolved target', () => {
		const element = createZone({ left: 0, top: 0, width: 100, height: 100 });
		const drop = vi.fn();
		registerZone(element, { drop });
		const event = {
			preventDefault: vi.fn(),
			stopPropagation: vi.fn()
		};
		const data = { type: 'item' };

		const zone = DropManager.dropAt(10, 10, event, data);

		expect(zone?.element).toBe(element);
		expect(event.preventDefault).toHaveBeenCalled();
		expect(event.stopPropagation).toHaveBeenCalled();
		expect(drop).toHaveBeenCalledWith(event, data, zone);
	});

	it('overAt dispatches hover callbacks and clearHover dispatches leave', () => {
		const element = createZone({ left: 0, top: 0, width: 100, height: 100 });
		const enter = vi.fn();
		const over = vi.fn();
		const leave = vi.fn();
		registerZone(element, { enter, over, leave });
		const event = {
			preventDefault: vi.fn()
		};
		const data = { type: 'item' };

		const zone = DropManager.overAt(10, 10, event, data);
		DropManager.overAt(10, 10, event, data);
		DropManager.clearHover(event, data);

		expect(zone?.element).toBe(element);
		expect(event.preventDefault).toHaveBeenCalledTimes(2);
		expect(enter).toHaveBeenCalledTimes(1);
		expect(over).toHaveBeenCalledTimes(2);
		expect(leave).toHaveBeenCalledTimes(1);
	});

	it('resolves elements registered inside Shadow DOM', () => {
		const host = createZone({ left: 0, top: 0, width: 120, height: 120 }, 90);
		const shadow = host.attachShadow({ mode: 'open' });
		const inner = document.createElement('div');
		setRect(inner, { left: 0, top: 0, width: 120, height: 120 });
		shadow.appendChild(inner);

		const light = createZone({ left: 0, top: 0, width: 120, height: 120 }, 50);
		registerZone(light);
		registerZone(inner);

		expect(DropManager.getTargetAt(10, 10, { type: 'item' })?.element).toBe(inner);
	});
});
