/**
 * tests/ui/CartItems.drop.test.js
 *
 * Dropping an inventory item on the Cart Items window.
 */
import { beforeAll, describe, expect, it, vi } from 'vitest';

const reqMoveItemToCart = vi.fn();

vi.mock('UI/CursorManager.js', () => ({ default: { ACTION: {}, getActualType: vi.fn(), setType: vi.fn() } }));
vi.mock('DB/DBManager.js', () => ({
	default: { INTERFACE_PATH: '', getItemInfo: () => ({}), getItemName: () => '', getMessage: () => '' }
}));
vi.mock('Core/Client.js', () => ({ default: { loadFile: vi.fn(), loadFiles: vi.fn() } }));
vi.mock('Core/Preferences.js', () => ({ default: { get: (_name, defaults) => ({ ...defaults, save: vi.fn() }) } }));
vi.mock('Renderer/Renderer.js', () => ({ default: { width: 1200, height: 800 } }));
vi.mock('Renderer/EntityManager.js', () => ({ default: { setOverEntity: vi.fn() } }));
vi.mock('UI/Scrollbar.js', () => ({ default: {} }));
vi.mock('UI/UIManager.js', () => ({ default: { addComponent: c => c } }));
vi.mock('UI/Elements/Elements.js', () => ({}));
vi.mock('UI/Components/InputBox/InputBox.js', () => ({ default: {} }));
vi.mock('UI/Components/ItemInfo/ItemInfo.js', () => ({ default: {} }));
vi.mock('UI/Components/ItemCompare/ItemCompare.js', () => ({ default: {} }));
vi.mock('UI/Components/Storage/Storage.js', () => ({ default: { reqMoveItemToCart: vi.fn() } }));
vi.mock('UI/Components/Inventory/Inventory.js', () => ({ default: { reqMoveItemToCart } }));
vi.mock('UI/Components/Equipment/Equipment.js', () => ({ default: {} }));

const CartItems = (await import('UI/Components/CartItems/CartItems.js')).default;

/**
 * @param {string} type drag event name
 * @param {object} [payload] JSON the dragged item carries
 * @returns {Event}
 */
function dragEvent(type, payload) {
	const event = new Event(type, { bubbles: true, cancelable: true });
	Object.defineProperty(event, 'dataTransfer', {
		value: { getData: () => (payload ? JSON.stringify(payload) : '') }
	});
	return event;
}

describe('CartItems drop', () => {
	beforeAll(() => {
		CartItems.prepare();
	});

	it('accepts a drag over the window, so the browser fires drop', () => {
		const event = dragEvent('dragover');

		CartItems._host.dispatchEvent(event);

		expect(event.defaultPrevented).toBe(true);
	});

	it('moves a dropped inventory item to the cart', () => {
		const item = { index: 5, ITID: 501, count: 1 };

		CartItems._host.dispatchEvent(dragEvent('drop', { type: 'item', from: 'Inventory', data: item }));

		expect(reqMoveItemToCart).toHaveBeenCalledWith(5, 1);
	});
});
