/**
 * tests/ui/Storage.search.test.js
 *
 * The search field of the expanded Storage window.
 */
import { describe, expect, it, vi } from 'vitest';

vi.mock('UI/CursorManager.js', () => ({ default: { ACTION: {}, getActualType: vi.fn(), setType: vi.fn() } }));
vi.mock('DB/DBManager.js', () => ({
	default: {
		INTERFACE_PATH: '',
		getItemInfo: () => ({ identifiedResourceName: 'apple' }),
		getItemName: item => item.name
	}
}));
vi.mock('Core/Client.js', () => ({ default: { loadFile: vi.fn(), loadFiles: vi.fn() } }));
vi.mock('Core/Preferences.js', () => ({ default: { get: (_name, defaults) => ({ ...defaults, save: vi.fn() }) } }));
vi.mock('Renderer/Renderer.js', () => ({ default: { width: 1200, height: 800 } }));
vi.mock('Renderer/EntityManager.js', () => ({ default: { setOverEntity: vi.fn() } }));
vi.mock('UI/Scrollbar.js', () => ({ default: {} }));
vi.mock('UI/UIManager.js', () => ({ default: { addComponent: c => c } }));
vi.mock('UI/Elements/Elements.js', () => ({}));
vi.mock('UI/Components/ItemInfo/ItemInfo.js', () => ({ default: {} }));
vi.mock('UI/Components/InputBox/InputBox.js', () => ({ default: {} }));
vi.mock('UI/Components/CartItems/CartItems.js', () => ({ default: {} }));
vi.mock('UI/Components/Inventory/Inventory.js', () => ({ default: {} }));

const Storage = (await import('UI/Components/Storage/StorageV3/Storage.js')).default;

describe('Storage search', () => {
	it('opens the results on Enter in the search field', () => {
		Storage.prepare();
		Storage.setItems([
			{ index: 2, ITID: 512, type: 0, count: 3, IsIdentified: true, name: 'Apple' },
			{ index: 3, ITID: 909, type: 3, count: 1, IsIdentified: true, name: 'Jellopy' }
		]);

		const input = Storage.getRoot().querySelector('#storage-search-input');
		input.value = 'app';
		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

		const results = document.getElementById('StorageFilter_99');
		expect(results).not.toBeNull();
		const names = [...results.shadowRoot.querySelectorAll('.item .name')].map(el => el.textContent);
		expect(names).toEqual(['Apple']);
	});
});
