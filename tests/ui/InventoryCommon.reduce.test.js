import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The restore path (onAppend) and the user click (the mini button's own
// listener) must land on the same toggle, or a preference saved as reduced
// never collapses the window back on reload.
const mocks = vi.hoisted(() => {
	class MockGUIComponent {
		constructor() {
			this._host = document.createElement('div');
			this.magnet = { TOP: false, BOTTOM: false, LEFT: false, RIGHT: false };
		}

		getRoot() {
			return this._host;
		}

		draggable() {
			return this;
		}

		focus() {}
	}

	return { MockGUIComponent };
});

vi.mock('DB/DBManager.js', () => ({ default: { INTERFACE_PATH: '', getMessage: (_id, def) => def } }));
vi.mock('DB/Items/ItemType.js', () => ({ default: {} }));
vi.mock('Network/NetworkManager.js', () => ({ default: { hookPacket: vi.fn(), sendPacket: vi.fn() } }));
vi.mock('Network/PacketStructure.js', () => ({ default: {} }));
vi.mock('Network/PacketVerManager.js', () => ({ default: { value: 20211103 } }));
vi.mock('Core/Client.js', () => ({ default: { loadFile: (_path, cb) => cb?.(''), loadFiles: (_paths, cb) => cb?.() } }));
vi.mock('Core/Configs.js', () => ({ default: { get: (_k, d) => d } }));
vi.mock('Renderer/Renderer.js', () => ({ default: { width: 1200, height: 800 } }));
vi.mock('Controls/MouseEventHandler.js', () => ({ default: {} }));
vi.mock('UI/UIManager.js', () => ({ default: { addComponent: component => component } }));
vi.mock('UI/GUIComponent.js', () => ({ default: mocks.MockGUIComponent }));
vi.mock('UI/UIVersionManager.js', () => ({ default: { getInventoryVersion: () => 0 } }));
vi.mock('UI/Elements/Elements.js', () => ({}));
vi.mock('UI/TouchDrag.js', () => ({ attachTouchDrag: vi.fn() }));
vi.mock('UI/Components/CartItems/CartItems.js', () => ({ default: {} }));
vi.mock('UI/Components/InputBox/InputBox.js', () => ({ default: {} }));
vi.mock('UI/Components/ItemCompare/ItemCompare.js', () => ({ default: {} }));
vi.mock('UI/Components/ItemInfo/ItemInfo.js', () => ({ default: {} }));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({ default: { addText: vi.fn(), TYPE: {}, FILTER: {} } }));
vi.mock('UI/Components/Equipment/Equipment.js', () => ({ default: {} }));
vi.mock('UI/Components/Storage/Storage.js', () => ({ default: {} }));
vi.mock('UI/Components/SwitchEquip/SwitchEquip.js', () => ({ default: {} }));
vi.mock('UI/Components/BasicInfo/BasicInfo.js', () => ({ default: {} }));
vi.mock('UI/Components/Refine/Refine.js', () => ({ default: {} }));
vi.mock('UI/Components/EnchantGrade/EnchantGrade.js', () => ({ default: {} }));
vi.mock('UI/Components/Enchant/Enchant.js', () => ({ default: {} }));
vi.mock('UI/Components/Mail/Mail.js', () => ({ default: {} }));
vi.mock('UI/Components/Rodex/WriteRodex.js', () => ({ default: {} }));

const { createInventory } = await import('UI/Components/Inventory/InventoryCommon.js');

const NAME = 'InventoryReduceTest';

// Only the elements the restore path and its toggle actually touch; every
// other selector Init/onAppend look up is optional and skipped when absent.
const htmlText = `
	<div class="titlebar">
		<button class="base"></button>
		<button class="mini"></button>
	</div>
	<div class="panel"></div>
`;

/** Seed the preference the way Preferences.save would have left it. */
function savePreference(prefs) {
	localStorage.setItem(NAME, JSON.stringify({ ...prefs, _version: 1.0 }));
}

// Measures like a browser: nothing while hidden, the inline height when set,
// the stylesheet's height otherwise.
function measureLikeABrowser(host, cssHeight) {
	host.getBoundingClientRect = () => {
		const height = host.style.display === 'none' ? 0 : parseInt(host.style.height, 10) || cssHeight;
		return { height, width: 300, top: 0, left: 0, right: 300, bottom: height };
	};
}

function mount({ resizableHeight = false, cssHeight = 193 } = {}) {
	const Component = createInventory({ name: NAME, htmlText, cssText: '', defaultHeight: 2, resizableHeight });
	Component.getRoot().innerHTML = htmlText;
	Component.init();
	measureLikeABrowser(Component._host, cssHeight);
	Component.onAppend();
	return Component;
}

function clickMini(Component) {
	Component.getRoot().querySelector('.titlebar .mini').click();
}

function panelDisplay(Component) {
	return Component.getRoot().querySelector('.panel').style.display;
}

describe('inventory window, restoring the reduced preference on reopen', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	afterEach(() => {
		localStorage.clear();
	});

	it('comes back reduced when it was saved reduced', () => {
		savePreference({ show: true, reduce: true });

		const Component = mount();

		expect(Component._host.style.height).toBe('17px');
		expect(panelDisplay(Component)).toBe('none');
	});

	it('comes back expanded when it was saved expanded', () => {
		savePreference({ show: true, reduce: false });

		const Component = mount();

		expect(Component._host.style.height).not.toBe('17px');
		expect(panelDisplay(Component)).not.toBe('none');
	});

	it('opens expanded when it was saved hidden and expanded', () => {
		savePreference({ show: false, reduce: false });

		const Component = mount();
		Component._host.style.display = '';

		expect(Component._host.getBoundingClientRect().height).toBe(193);
		expect(panelDisplay(Component)).not.toBe('none');
	});

	it('expands to its full height after being saved hidden and reduced', () => {
		savePreference({ show: false, reduce: true });

		const Component = mount();
		Component._host.style.display = '';
		clickMini(Component);

		expect(Component._host.getBoundingClientRect().height).toBe(193);
		expect(panelDisplay(Component)).toBe('flex');
	});

	it('expands to its full height after a reduced close and reopen', () => {
		savePreference({ show: true, reduce: false });

		const Component = mount();
		clickMini(Component);
		Component.onRemove();
		Component.onAppend();
		clickMini(Component);

		expect(Component._host.getBoundingClientRect().height).toBe(193);
		expect(panelDisplay(Component)).toBe('flex');
	});

	it('keeps the resizable height of V0 across a reduced close and reopen', () => {
		savePreference({ show: true, reduce: false, width: 7, height: 4 });

		const Component = mount({ resizableHeight: true });
		const expanded = Component._host.style.height;
		clickMini(Component);
		Component.onRemove();
		Component.onAppend();
		clickMini(Component);

		expect(Component._host.style.height).toBe(expanded);
	});
});
