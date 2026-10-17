/**
 * tests/ui/CartItems.altTransfer.test.js
 *
 * Alt + right click on a cart item moves the whole stack to the open window.
 */
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const storageHost = document.createElement('div');
const inventoryHost = document.createElement('div');
const reqAddItemFromCart = vi.fn();

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
vi.mock('UI/Components/Storage/Storage.js', () => ({
	default: { _host: storageHost, reqAddItemFromCart }
}));
vi.mock('UI/Components/Inventory/Inventory.js', () => ({ default: { _host: inventoryHost } }));
vi.mock('UI/Components/Equipment/Equipment.js', () => ({ default: {} }));

const CartItems = (await import('UI/Components/CartItems/CartItems.js')).default;

function altRightClick() {
	const icon = CartItems.getRoot().querySelector('.item[data-index="3"] .icon');
	const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, altKey: true, button: 2 });
	// jsdom leaves the legacy `which` out of MouseEvent
	Object.defineProperty(event, 'which', { value: 3 });
	icon.dispatchEvent(event);
}

describe('CartItems Alt + right click', () => {
	beforeAll(() => {
		CartItems.prepare();
		CartItems.list = [];
		CartItems.setItems([{ index: 3, ITID: 909, count: 100 }]);
		document.body.appendChild(inventoryHost);
	});

	beforeEach(() => {
		CartItems.reqRemoveItem = vi.fn();
		reqAddItemFromCart.mockClear();
	});

	it('moves the stack to the storage while it is open', () => {
		document.body.appendChild(storageHost);

		altRightClick();

		expect(reqAddItemFromCart).toHaveBeenCalledWith(3, 100);
		expect(CartItems.reqRemoveItem).not.toHaveBeenCalled();
	});

	it('moves the stack to the inventory once the storage is closed', () => {
		storageHost.remove();

		altRightClick();

		expect(CartItems.reqRemoveItem).toHaveBeenCalledWith(3, 100);
		expect(reqAddItemFromCart).not.toHaveBeenCalled();
	});
});
