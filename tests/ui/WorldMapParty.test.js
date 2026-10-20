/**
 * The world map builds its sections when it is first shown. Party members
 * reported before that are marked on the sections it builds.
 */
import { describe, expect, it, vi } from 'vitest';

// jsdom has no CSS.escape
globalThis.CSS ??= { escape: s => s };

vi.mock('Core/Client.js', () => ({
	default: {
		loadFile(path, onload) {
			onload?.(`img:${path}`);
		},
		loadFiles: vi.fn()
	}
}));
vi.mock('DB/DBManager.js', () => ({
	default: { INTERFACE_PATH: '', getMessage: () => '', getMapInfo: () => null }
}));
vi.mock('DB/Map/WorldMap.js', () => ({
	default: [
		{
			id: 'worldmap_test',
			name: 'Test',
			ep_from: 0,
			ep_to: 999,
			maps: [
				{ id: 'prontera', name: '', left: 0, top: 0, width: 10, height: 10, ep_from: 0, ep_to: 999 },
				{ id: 'geffen', name: '', left: 20, top: 0, width: 10, height: 10, ep_from: 0, ep_to: 999 }
			]
		}
	]
}));
vi.mock('Core/Configs.js', () => ({ default: { get: (_k, def) => def } }));
vi.mock('Core/Preferences.js', () => ({ default: { get: (_k, def) => ({ ...def, save: vi.fn() }) } }));
vi.mock('Controls/KeyEventHandler.js', () => ({ default: {} }));
vi.mock('Renderer/Renderer.js', () => ({ default: {} }));
vi.mock('Renderer/MapRenderer.js', () => ({ default: { currentMap: 'geffen.gat' } }));
vi.mock('Renderer/EntityManager.js', () => ({ default: {} }));
vi.mock('UI/UIManager.js', () => ({ default: { addComponent: component => component } }));
vi.mock('UI/CursorManager.js', () => ({ default: { ACTION: {}, getActualType: () => 0, setType: vi.fn() } }));
vi.mock('UI/Scrollbar.js', () => ({ default: {} }));
vi.mock('UI/Components/Navigation/Navigation.js', () => ({ default: {} }));
vi.mock('Engine/SessionStorage.js', () => ({ default: { AID: 1 } }));

const { default: WorldMap } = await import('UI/Components/WorldMap/WorldMap.js');

// GUIComponent loads Client and DB itself before it handles a node
await new Promise(r => setTimeout(r, 20));

describe('WorldMap party markers', () => {
	it('marks members reported while the map was hidden when it is first shown', () => {
		vi.spyOn(console, 'log').mockImplementation(() => {});
		WorldMap.append();
		expect(WorldMap._host.style.display).toBe('none');
		expect(WorldMap.getRoot().querySelector('.worldmap')).toBeNull();

		WorldMap.updatePartyMembers({
			groupInfo: [{ AID: 2, state: 0, mapName: 'prontera.gat', characterName: 'Alice' }]
		});
		WorldMap.toggle();

		const root = WorldMap.getRoot();
		expect(root.querySelector('.section#prontera').classList.contains('membersonmap')).toBe(true);
		expect(root.querySelector('.section#geffen').classList.contains('membersonmap')).toBe(false);
		WorldMap.remove();
	});

	it('stops marking members who left the party, and everyone once we leave', () => {
		vi.spyOn(console, 'log').mockImplementation(() => {});
		WorldMap.updatePartyMembers({
			groupInfo: [
				{ AID: 2, state: 0, mapName: 'prontera.gat', characterName: 'Bob' },
				{ AID: 3, state: 0, mapName: 'geffen.gat', characterName: 'Carol' }
			]
		});
		WorldMap.append();
		if (WorldMap._host.style.display === 'none') WorldMap.toggle();
		const marked = id => WorldMap.getRoot().querySelector('.section#' + id).classList.contains('membersonmap');
		expect(marked('prontera')).toBe(true);

		WorldMap.removePartyMember(2);
		expect(marked('prontera')).toBe(false);
		expect(marked('geffen')).toBe(true);

		// rebuilt sections keep to the current party
		WorldMap.toggle();
		WorldMap.toggle();
		expect(marked('prontera')).toBe(false);

		WorldMap.removePartyMember(1);
		expect(marked('geffen')).toBe(false);
		WorldMap.remove();
	});
});
