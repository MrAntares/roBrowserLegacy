/**
 * tests/ui/NpcMenu.blankClick.test.js
 *
 * Clicking the blank area under the menu items must not send choice 0: rAthena kicks the player for it.
 */
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('DB/DBManager.js', () => ({
	default: { INTERFACE_PATH: '', getMessage: () => '', formatMsgToHtml: text => text }
}));
vi.mock('Core/Client.js', () => ({ default: { loadFile: vi.fn(), loadFiles: vi.fn() } }));
vi.mock('Core/Preferences.js', () => ({ default: { get: (_name, defaults) => ({ ...defaults, save: vi.fn() }) } }));
vi.mock('Renderer/Renderer.js', () => ({ default: { width: 1200, height: 800 } }));
vi.mock('Renderer/EntityManager.js', () => ({ default: { setOverEntity: vi.fn() } }));
vi.mock('UI/CursorManager.js', () => ({ default: { ACTION: {}, getActualType: vi.fn(), setType: vi.fn() } }));
vi.mock('UI/UIManager.js', () => ({ default: { addComponent: c => c } }));
vi.mock('UI/Elements/Elements.js', () => ({}));
vi.mock('UI/Components/InputBox/InputBox.js', () => ({ default: {} }));

const NpcMenu = (await import('UI/Components/NpcMenu/NpcMenu.js')).default;

const content = () => NpcMenu.getRoot().querySelector('.content');
const fire = (target, type) => target.dispatchEvent(new MouseEvent(type, { bubbles: true }));

describe('NpcMenu blank click', () => {
	beforeAll(() => {
		NpcMenu.prepare();
	});

	beforeEach(() => {
		NpcMenu.onSelectMenu = vi.fn();
		NpcMenu.setMenu('Only choice', 110020845);
	});

	it('keeps the selected item when the blank area is clicked, then sends it', () => {
		fire(content(), 'mousedown');
		NpcMenu.getRoot().querySelector('.ok').click();

		expect(NpcMenu.onSelectMenu).toHaveBeenCalledWith(110020845, 1);
	});

	it('does not send anything when the blank area is double-clicked', () => {
		fire(content(), 'dblclick');

		expect(NpcMenu.onSelectMenu).not.toHaveBeenCalled();
	});

	it('still sends the clicked item', () => {
		NpcMenu.setMenu('First:Second', 7);
		const second = content().querySelector('div[data-index="1"]');
		fire(second, 'mousedown');
		fire(second, 'dblclick');

		expect(NpcMenu.onSelectMenu).toHaveBeenCalledWith(7, 2);
	});
});
