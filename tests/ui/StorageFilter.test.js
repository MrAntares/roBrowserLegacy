/**
 * tests/ui/StorageFilter.test.js
 *
 * The window the expanded Storage opens for a filter tab or a search.
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
vi.mock('UI/Elements/Elements.js', () => ({}));
vi.mock('UI/Components/ItemInfo/ItemInfo.js', () => ({ default: {} }));

const GUIComponent = (await import('UI/GUIComponent.js')).default;
const StorageFilter = (await import('UI/Components/Storage/StorageV3/StorageFilter.js')).default;

describe('StorageFilter', () => {
	it('builds as a GUIComponent', () => {
		const filter = new StorageFilter(99);

		expect(filter).toBeInstanceOf(GUIComponent);
		expect(filter.name).toBe('StorageFilter_99');
	});

	it('lists the items it is given under its title', () => {
		const filter = new StorageFilter(99);
		filter.prepare();

		filter.setItems('Search', [{ index: 2, ITID: 512, count: 3, IsIdentified: true, name: 'Apple' }], 99);

		const root = filter.getRoot();
		expect(root.querySelector('.titlebar .text').textContent).toBe('Search');
		expect(root.querySelector('.item[data-index="2"] .name').textContent).toBe('Apple');
		expect(root.querySelector('.item[data-index="2"] .count').textContent).toBe('3');
	});
});
