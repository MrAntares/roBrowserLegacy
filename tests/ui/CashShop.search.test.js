import { describe, expect, it, vi } from 'vitest';

// Enter in the Cash Shop's search box searches, as the magnifier button does.
const mocks = vi.hoisted(() => {
	class MockGUIComponent {
		constructor(name) {
			this.name = name;
			this._host = document.createElement('div');
			this.magnet = {};
		}

		getRoot() {
			return this._host;
		}

		draggable() {}

		static processDataAttrs() {}
	}

	return { MockGUIComponent };
});

vi.mock('DB/DBManager.js', () => ({
	default: {
		INTERFACE_PATH: '',
		getItemInfo: id => ({ identifiedDisplayName: id === 501 ? 'Red Potion' : 'Apple', identifiedResourceName: 'r' }),
		getCashShopBannerTable: () => []
	}
}));
vi.mock('Core/Client.js', () => ({ default: { loadFile: vi.fn() } }));
vi.mock('Network/NetworkManager.js', () => ({ default: { sendPacket: vi.fn() } }));
vi.mock('Network/PacketStructure.js', () => ({ default: { CZ: {} } }));
vi.mock('Controls/KeyEventHandler.js', () => ({ default: { ENTER: 13, ESCAPE: 27 } }));
vi.mock('UI/Components/InputBox/InputBox.js', () => ({ default: {} }));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({ default: { addText: vi.fn(), TYPE: {}, FILTER: {} } }));
vi.mock('Renderer/Renderer.js', () => ({ default: { width: 1200, height: 800 } }));
vi.mock('Core/Preferences.js', () => ({ default: { get: (_k, def) => ({ ...def, save: vi.fn() }) } }));
vi.mock('Engine/SessionStorage.js', () => ({ default: {} }));
vi.mock('UI/Components/ItemInfo/ItemInfo.js', () => ({ default: {} }));
vi.mock('UI/Elements/Elements.js', () => ({}));
vi.mock('UI/GUIComponent.js', () => ({ default: mocks.MockGUIComponent }));
vi.mock('UI/UIManager.js', () => ({
	default: {
		addComponent(component) {
			component.getRoot().innerHTML = component.render();
			component.init();
			return component;
		},
		showMessageBox: vi.fn()
	}
}));

const { default: CashShop } = await import('UI/Components/CashShop/CashShop.js');

function shownItems() {
	return [...CashShop.getRoot().querySelectorAll('#panel-items .item')].map(el => Number(el.dataset.index));
}

describe('Cash Shop search', () => {
	it('searches when Enter is pressed in the search box', () => {
		CashShop.cashShopListItem = [];
		CashShop.readCashShopItems({ tabNum: 0, count: 1, items: [{ itemId: 501, price: 10 }] });
		CashShop.readCashShopItems({ tabNum: 1, count: 1, items: [{ itemId: 512, price: 1 }] });

		const input = CashShop.getRoot().querySelector('.cashshop-search');
		input.value = 'potion';

		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', bubbles: true }));
		expect(shownItems()).toEqual([]);

		const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
		input.dispatchEvent(enter);
		expect(shownItems()).toEqual([501]);
		expect(enter.defaultPrevented).toBe(true);
	});
});
