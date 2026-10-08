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

function filterCount(id, index) {
	return document.getElementById(id).shadowRoot.querySelector(`.item[data-index="${index}"] .count`).textContent;
}

function search(term) {
	const input = Storage.getRoot().querySelector('#storage-search-input');
	input.value = term;
	input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
}

describe('Storage search', () => {
	Storage.prepare();
	Storage.setItems([
		{ index: 2, ITID: 512, type: 0, count: 3, IsIdentified: true, name: 'Apple' },
		{ index: 3, ITID: 909, type: 3, count: 1, IsIdentified: true, name: 'Jellopy' }
	]);

	it('opens the results on Enter in the search field', () => {
		search('app');

		const results = document.getElementById('StorageFilter_99');
		expect(results).not.toBeNull();
		const names = [...results.shadowRoot.querySelectorAll('.item .name')].map(el => el.textContent);
		expect(names).toEqual(['Apple']);
	});

	it('counts a change once with a filter window open', () => {
		search('app');
		Storage.getRoot().querySelector('.filter-buttons button[data-tab-id="0"]').dispatchEvent(new MouseEvent('mousedown'));

		Storage.addItem({ index: 2, ITID: 512, type: 0, count: 2, IsIdentified: true, name: 'Apple' });
		expect(filterCount('StorageFilter_0', 2)).toBe('5');
		expect(filterCount('StorageFilter_99', 2)).toBe('5');

		Storage.removeItem(2, 1);
		expect(filterCount('StorageFilter_0', 2)).toBe('4');
		expect(filterCount('StorageFilter_99', 2)).toBe('4');
		expect(Storage.getRoot().querySelector('.content .item[data-index="2"] .count').textContent).toBe('4');
	});

	it('adds a new matching item to the open results', () => {
		search('jell');

		Storage.addItem({ index: 7, ITID: 913, type: 3, count: 2, IsIdentified: true, name: 'Jellopy Box' });
		Storage.addItem({ index: 8, ITID: 914, type: 3, count: 1, IsIdentified: true, name: 'Apple Pie' });

		const names = [...document.getElementById('StorageFilter_99').shadowRoot.querySelectorAll('.item .name')].map(
			el => el.textContent
		);
		expect(names).toEqual(['Jellopy', 'Jellopy Box']);
	});
});
