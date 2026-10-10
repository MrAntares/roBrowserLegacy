import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
	// jsdom has no 2D canvas; every compiled frame needs a distinct data URI
	let frame = 0;
	HTMLCanvasElement.prototype.getContext = () => ({ clearRect() {} });
	HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,' + btoa(String(frame++));
	URL.createObjectURL = () => 'blob:cursor';
});

vi.mock('Core/Client.js', () => ({ default: { getFiles: (files, callback) => callback(null, null) } }));
vi.mock('Core/MemoryManager.js', () => ({ default: { remove() {} } }));
vi.mock('Preferences/Graphics.js', () => ({ default: { cursor: true } }));
vi.mock('Preferences/Controls.js', () => ({ default: { snap: true, itemsnap: true } }));
vi.mock('Loaders/Sprite.js', () => ({ default: class {} }));
vi.mock('Loaders/Action.js', () => ({
	default: class {
		constructor() {
			const action = { delay: 100, animations: [{ layers: [] }] };
			this.actions = [action, action];
		}
	}
}));
vi.mock('Renderer/EntityManager.js', () => ({ default: { getOverEntity: () => null } }));
vi.mock('Renderer/Entity/Entity.js', () => ({
	default: class {
		renderLayer() {}
	}
}));
vi.mock('Renderer/SpriteRenderer.js', () => ({ default: { bind2DContext() {} } }));
vi.mock('Controls/MouseEventHandler.js', () => ({ default: { screen: { x: 0, y: 0 } } }));

import Cursor from 'UI/CursorManager.js';

describe('Cursor', () => {
	beforeAll(async () => {
		vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'Date'] });
		await new Promise(resolve => Cursor.init(resolve));
	});

	afterEach(() => {
		Cursor.setType(Cursor.ACTION.DEFAULT);
		vi.advanceTimersToNextFrame();
	});

	it('follows a type change with no scene render loop running', () => {
		Cursor.setType(Cursor.ACTION.TALK);
		vi.advanceTimersToNextFrame();

		expect(document.querySelector('.cursor').style.transform).toBe('translate(-20px, -20px)');
	});

	it('goes back to the default arrow once the hovered target is gone', () => {
		Cursor.setType(Cursor.ACTION.TALK);
		vi.advanceTimersToNextFrame();
		Cursor.setType(Cursor.ACTION.DEFAULT);
		vi.advanceTimersToNextFrame();

		expect(document.querySelector('.cursor').style.transform).toBe('translate(-0px, -0px)');
	});

	it('leaves the cursor to the scene render loop while it runs', () => {
		Cursor.setSceneDriven(true);
		Cursor.setType(Cursor.ACTION.TALK);
		vi.advanceTimersToNextFrame();

		expect(document.querySelector('.cursor').style.transform).toBe('translate(-0px, -0px)');

		Cursor.setSceneDriven(false);
		vi.advanceTimersToNextFrame();

		expect(document.querySelector('.cursor').style.transform).toBe('translate(-20px, -20px)');
	});
});
