/**
 * tests/ui/SlotMachine.loadGuard.test.js
 *
 * Clicking the slot machine before its sprite has loaded must not start the
 * capture. The component is a module-level singleton, so each case re-imports
 * it fresh after resetting modules.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
	class MockGUIComponent {
		constructor(name) {
			this.name = name;
			this.__active = false;
		}

		getRoot() {
			return this._host;
		}

		prepare() {
			this._host = document.createElement('div');
			this._host.innerHTML = this.render();
			if (this.init) this.init();
		}

		append() {
			this.__active = true;
			document.body.appendChild(this._host);
			if (this.onAppend) this.onAppend();
		}

		remove() {
			this.__active = false;
			this._host.remove();
			if (this.onRemove) this.onRemove();
		}
	}

	MockGUIComponent.MouseMode = { STOP: 'STOP' };

	return { MockGUIComponent, loadFilesCallback: null };
});

vi.mock('UI/GUIComponent.js', () => ({ default: mocks.MockGUIComponent }));
vi.mock('UI/UIManager.js', () => ({ default: { addComponent: c => c } }));
vi.mock('Core/Client.js', () => ({
	default: {
		loadFiles: (_filenames, callback) => {
			mocks.loadFilesCallback = callback;
		}
	}
}));
vi.mock('Core/Events.js', () => ({ default: { setTimeout: vi.fn() } }));
vi.mock('Renderer/Renderer.js', () => ({
	default: { tick: 0, width: 1200, height: 800, render: vi.fn(), stop: vi.fn() }
}));
vi.mock('Renderer/Entity/Entity.js', () => ({
	default: class {
		renderLayer() {}
	}
}));
vi.mock('Renderer/SpriteRenderer.js', () => ({ default: { bind2DContext: vi.fn() } }));

HTMLCanvasElement.prototype.getContext = function () {
	return { canvas: this, clearRect() {} };
};

/** Fresh SlotMachine singleton, appended and ready to click. */
async function mountSlotMachine() {
	vi.resetModules();
	mocks.loadFilesCallback = null;

	const { default: SlotMachine } = await import('UI/Components/SlotMachine/SlotMachine.js');
	SlotMachine.onTry = vi.fn();
	SlotMachine.prepare();
	SlotMachine.append();
	return SlotMachine;
}

function click(component) {
	component._host.querySelector('canvas').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
}

beforeEach(() => {
	document.body.innerHTML = '';
});

describe('a click on the slot machine canvas', () => {
	it('is ignored while the sprite and action are still loading', async () => {
		const SlotMachine = await mountSlotMachine();

		click(SlotMachine);

		expect(SlotMachine.onTry).not.toHaveBeenCalled();
	});

	it('starts the capture once the sprite and action have loaded', async () => {
		const SlotMachine = await mountSlotMachine();
		mocks.loadFilesCallback('sprite', 'action');

		click(SlotMachine);

		expect(SlotMachine.onTry).toHaveBeenCalledTimes(1);
	});
});
