/* global document, window, Event, MouseEvent, KeyboardEvent */

import { afterEach, describe, expect, it, vi } from 'vitest';
import DragManager from 'UI/DragManager.js';
import DropManager from 'UI/DropManager.js';
import GUIComponent from 'UI/GUIComponent.js';

const unregisters = [];
const originalElementFromPoint = document.elementFromPoint;

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

function createElement(rect = { left: 0, top: 0, width: 32, height: 32 }) {
	const element = document.createElement('div');
	setRect(element, rect);
	document.body.appendChild(element);
	return element;
}

function mouse(type, clientX, clientY, options = {}) {
	return new MouseEvent(type, {
		bubbles: true,
		cancelable: true,
		clientX,
		clientY,
		button: options.button ?? 0,
		buttons: options.buttons ?? 1
	});
}

function startDrag(source, start = { x: 4, y: 4 }, move = { x: 20, y: 20 }) {
	source.dispatchEvent(mouse('mousedown', start.x, start.y));
	window.dispatchEvent(mouse('mousemove', move.x, move.y));
}

function registerSource(root, options = {}) {
	const unregister = DragManager.register(root, {
		data: () => ({ type: 'item', from: 'test' }),
		...options
	});
	unregisters.push(unregister);
	return unregister;
}

function registerDrop(element, options = {}) {
	const unregister = DropManager.register(element, {
		drop: vi.fn(),
		...options
	});
	unregisters.push(unregister);
	return unregister;
}

afterEach(() => {
	DragManager.cancel();
	for (const unregister of unregisters.splice(0)) {
		unregister();
	}
	delete window._OBJ_DRAG_;
	document.body.innerHTML = '';
	Object.defineProperty(document, 'elementFromPoint', {
		configurable: true,
		value: originalElementFromPoint
	});
	vi.restoreAllMocks();
});

describe('DragManager', () => {
	it('registers delegated sources and unregisters idempotently', () => {
		const root = createElement({ left: 0, top: 0, width: 100, height: 100 });
		const source = document.createElement('div');
		source.className = 'item';
		setRect(source, { left: 0, top: 0, width: 32, height: 32 });
		root.appendChild(source);

		const unregister = DragManager.register(root, {
			selector: '.item',
			data: () => ({ type: 'item' })
		});

		expect(unregister()).toBe(true);
		expect(unregister()).toBe(false);
	});

	it('ignores non-primary buttons', () => {
		const source = createElement();
		const data = vi.fn(() => ({ type: 'item' }));
		registerSource(source, { data });

		source.dispatchEvent(mouse('mousedown', 4, 4, { button: 2 }));
		window.dispatchEvent(mouse('mousemove', 20, 20));

		expect(data).not.toHaveBeenCalled();
		expect(DragManager.isDragging()).toBe(false);
	});

	it('does not start when movement stays below the threshold', () => {
		const source = createElement();
		const data = vi.fn(() => ({ type: 'item' }));
		registerSource(source, { data, threshold: 8 });

		source.dispatchEvent(mouse('mousedown', 4, 4));
		window.dispatchEvent(mouse('mousemove', 8, 8));
		window.dispatchEvent(mouse('mouseup', 8, 8));

		expect(data).not.toHaveBeenCalled();
		expect(window._OBJ_DRAG_).toBeUndefined();
	});

	it('clears stale pending sessions when delegated content is rebuilt', () => {
		const root = createElement({ left: 0, top: 0, width: 100, height: 100 });
		const first = document.createElement('div');
		first.className = 'item';
		setRect(first, { left: 0, top: 0, width: 32, height: 32 });
		root.appendChild(first);

		const data = vi.fn(source => ({ type: 'item', source }));
		registerSource(root, { selector: '.item', data });

		first.dispatchEvent(mouse('mousedown', 4, 4));
		first.remove();

		const second = document.createElement('div');
		second.className = 'item';
		setRect(second, { left: 0, top: 0, width: 32, height: 32 });
		root.appendChild(second);

		second.dispatchEvent(mouse('mousedown', 4, 4));
		window.dispatchEvent(mouse('mousemove', 20, 20));

		expect(data).toHaveBeenCalledTimes(1);
		expect(DragManager.getData().source).toBe(second);
	});

	it('replaces abandoned pending sessions on the next start', () => {
		const root = createElement({ left: 0, top: 0, width: 100, height: 100 });
		const first = document.createElement('div');
		first.className = 'item';
		setRect(first, { left: 0, top: 0, width: 32, height: 32 });
		root.appendChild(first);

		const second = document.createElement('div');
		second.className = 'item';
		setRect(second, { left: 40, top: 0, width: 32, height: 32 });
		root.appendChild(second);

		const data = vi.fn(source => ({ type: 'item', source }));
		registerSource(root, { selector: '.item', data });

		first.dispatchEvent(mouse('mousedown', 4, 4));
		second.dispatchEvent(mouse('mousedown', 44, 4));
		window.dispatchEvent(mouse('mousemove', 70, 20));

		expect(data).toHaveBeenCalledTimes(1);
		expect(DragManager.getData().source).toBe(second);
	});

	it('prevents native dragstart for matching sources', () => {
		const source = createElement();
		registerSource(source);

		const event = new Event('dragstart', { bubbles: true, cancelable: true });
		source.dispatchEvent(event);

		expect(event.defaultPrevented).toBe(true);
	});

	it('sets and clears window drag data during active drags', () => {
		const source = createElement();
		const data = { type: 'item', from: 'Inventory' };
		registerSource(source, { data: () => data });

		startDrag(source);
		expect(window._OBJ_DRAG_).toBe(data);
		expect(DragManager.getData()).toBe(data);

		window.dispatchEvent(mouse('mouseup', 30, 30));
		expect(window._OBJ_DRAG_).toBeUndefined();
		expect(DragManager.getData()).toBeNull();
	});

	it('creates, positions, moves, and removes the helper clone', () => {
		const source = createElement();
		source.className = 'source';
		registerSource(source, { cursorAt: { right: 10, bottom: 10 } });

		startDrag(source, { x: 4, y: 4 }, { x: 40, y: 50 });
		const helper = document.body.querySelector('.source[aria-hidden="true"]');

		expect(helper).toBeTruthy();
		expect(helper.style.left).toBe('18px');
		expect(helper.style.top).toBe('28px');

		window.dispatchEvent(mouse('mousemove', 60, 70));
		expect(helper.style.left).toBe('38px');
		expect(helper.style.top).toBe('48px');

		window.dispatchEvent(mouse('mouseup', 60, 70));
		expect(document.body.querySelector('.source[aria-hidden="true"]')).toBeNull();
	});

	it('drops through DropManager on release', () => {
		const source = createElement({ left: 0, top: 0, width: 32, height: 32 });
		const zone = createElement({ left: 40, top: 40, width: 40, height: 40 });
		const payload = { type: 'item', from: 'Inventory' };
		const drop = vi.fn();
		registerSource(source, { data: () => payload });
		registerDrop(zone, { drop });

		startDrag(source, { x: 4, y: 4 }, { x: 50, y: 50 });
		window.dispatchEvent(mouse('mouseup', 50, 50));

		expect(drop).toHaveBeenCalledTimes(1);
		expect(drop.mock.calls[0][1]).toBe(payload);
	});

	it('ends with a null result when no drop zone matches', () => {
		const source = createElement();
		const end = vi.fn();
		registerSource(source, { end });

		startDrag(source);
		window.dispatchEvent(mouse('mouseup', 200, 200));

		expect(end).toHaveBeenCalledWith(source, expect.any(MouseEvent), { type: 'item', from: 'test' }, null);
	});

	it('dispatches a legacy DOM drop when no DropManager zone matches', () => {
		const source = createElement({ left: 0, top: 0, width: 32, height: 32 });
		const target = createElement({ left: 40, top: 40, width: 40, height: 40 });
		const payload = { type: 'item', from: 'Inventory' };
		const drop = vi.fn();
		Object.defineProperty(document, 'elementFromPoint', {
			configurable: true,
			value: vi.fn(() => target)
		});
		target.addEventListener('drop', drop);
		registerSource(source, { data: () => payload });

		startDrag(source, { x: 4, y: 4 }, { x: 50, y: 50 });
		window.dispatchEvent(mouse('mouseup', 50, 50));

		expect(drop).toHaveBeenCalledTimes(1);
		expect(JSON.parse(drop.mock.calls[0][0].dataTransfer.getData('Text'))).toEqual(payload);
	});

	it('creates legacy events with dataTransfer Text payloads', () => {
		const data = { type: 'skill', from: 'SkillList' };
		const event = DragManager.createLegacyEvent('drop', mouse('mouseup', 10, 10), data);

		expect(JSON.parse(event.originalEvent.dataTransfer.getData('Text'))).toEqual(data);
		expect(JSON.parse(event.originalEvent.dataTransfer.getData('text/plain'))).toEqual(data);
	});

	it('does not block keyboard events during active custom drags', () => {
		const source = createElement();
		const keydown = vi.fn();
		window.addEventListener('keydown', keydown);
		registerSource(source);

		startDrag(source);
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'q', altKey: true }));

		expect(keydown).toHaveBeenCalledTimes(1);
		window.removeEventListener('keydown', keydown);
	});

	it('registers Shadow DOM sources through GUIComponent.dragSource', () => {
		const component = new GUIComponent('DragManagerTest', '');
		component.mouseMode = GUIComponent.MouseMode.CROSS;
		component.render = () => '<div class="source"></div>';
		component.prepare();
		component.append();

		const source = component._shadow.querySelector('.source');
		setRect(source, { left: 0, top: 0, width: 32, height: 32 });
		const data = vi.fn(() => ({ type: 'item' }));
		const unregister = component.dragSource('.source', { data });
		unregisters.push(unregister);

		startDrag(source);

		expect(data).toHaveBeenCalledTimes(1);
		expect(DragManager.isDragging()).toBe(true);
	});
});
