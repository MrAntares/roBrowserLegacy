/**
 * tests/ui/Navigation.airship.test.js
 *
 * The Navigation window's Private Airship Move button: when it is offered,
 * and the map and NPC flag it hands to the payment window after the path
 * refreshes that call navigateTo again with the stored, normalized target.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const opened = [];

vi.mock('UI/CursorManager.js', () => ({ default: { ACTION: { DEFAULT: 0 }, setType: vi.fn(), getActualType: vi.fn() } }));
vi.mock('DB/DBManager.js', () => ({
	default: { INTERFACE_PATH: 'data/texture/ui/', getMessage: (_id, fallback) => fallback || '', mapalias: {}, getTownInfo: () => [] }
}));
vi.mock('Core/Client.js', () => ({
	default: {
		loadFile(_path, callback) {
			callback?.(null);
		},
		loadFiles(_paths, callback) {
			callback?.('', '');
		}
	}
}));
vi.mock('Renderer/Renderer.js', () => ({ default: { width: 1200, height: 800, render: vi.fn(), stop: vi.fn() } }));
vi.mock('Renderer/MapRenderer.js', () => ({ default: { currentMap: 'prontera.gat' } }));
vi.mock('Renderer/EntityManager.js', () => ({ default: { setOverEntity: vi.fn() } }));
vi.mock('Renderer/Map/Altitude.js', () => ({ default: { TYPE: { WALKABLE: 1 } } }));
vi.mock('Engine/SessionStorage.js', () => ({ default: { Entity: { position: [150, 150] } } }));
vi.mock('UI/Scrollbar.js', () => ({ default: {} }));
vi.mock('UI/UIManager.js', () => ({ default: { addComponent: component => component } }));
vi.mock('UI/Components/Navigation/MapPathFinder.js', () => ({ default: { findPathBetweenMaps: () => null } }));
vi.mock('UI/Components/PrivateAirship/PrivateAirship.js', () => ({ default: { open: options => opened.push(options) } }));

vi.stubGlobal(
	'Worker',
	class {
		postMessage() {}
		terminate() {}
	}
);

const PACKETVER = (await import('Network/PacketVerManager.js')).default;
const Navigation = (await import('UI/Components/Navigation/Navigation.js')).default;

const button = () => Navigation.getRoot().querySelector('.airship-move');
const bar = () => Navigation.getRoot().querySelector('.airship-bar');
const originalVersion = PACKETVER.value;

beforeEach(() => {
	opened.length = 0;
	PACKETVER.value = 20221005;
	Navigation.prepare();
	Navigation.clear();
});

afterEach(() => {
	PACKETVER.value = originalVersion;
});

const target = extra => ({ startMap: 'prontera', startX: 150, startY: 150, endMap: 'izlude_a.gat', endX: 128, endY: 114, displayName: 'Guide', ...extra });

describe('the Navigation Move button', () => {
	it('is off without a target and on with one', () => {
		expect(button().disabled).toBe(true);
		Navigation.navigateTo(target());
		expect(button().disabled).toBe(false);
	});

	it('is hidden on clients older than the airship request', () => {
		PACKETVER.value = 20180320;
		Navigation.navigateTo(target());
		expect(bar().style.display).toBe('none');
		expect(button().disabled).toBe(true);
		Navigation.onAirshipMove();
		expect(opened).toHaveLength(0);
	});

	it('flies to the real map name and keeps the NPC flag through path refreshes', () => {
		Navigation.navigateTo(target({ isNpc: true }));

		// Reopening the window refreshes the path from the stored target
		Navigation.onAppend();
		Navigation.onAirshipMove();

		expect(opened).toEqual([{ targetMap: 'izlude_a', toNpc: true }]);
	});

	it('flies to a new target on the same coordinates, not the previous one', () => {
		Navigation.navigateTo(target({ isNpc: true }));
		Navigation.navigateTo(target({ endMap: 'izlude' }));
		Navigation.onAirshipMove();

		expect(opened).toEqual([{ targetMap: 'izlude', toNpc: false }]);
	});

	it('forgets the NPC flag and map for a different target', () => {
		Navigation.navigateTo(target({ isNpc: true }));
		Navigation.navigateTo(target({ endMap: 'geffen', endX: 120, endY: 60 }));
		Navigation.onAirshipMove();

		expect(opened).toEqual([{ targetMap: 'geffen', toNpc: false }]);
	});

	it('keeps the loaded map name for a map click', async () => {
		const MapRenderer = (await import('Renderer/MapRenderer.js')).default;
		MapRenderer.currentMap = 'izlude_a.gat';
		const coords = vi.spyOn(Navigation, 'screenToMapCoordinates').mockReturnValue({ x: 120, y: 80 });
		try {
			Navigation.onMapClick({ clientX: 10, clientY: 10 });
			Navigation.onAirshipMove();
			expect(opened).toEqual([{ targetMap: 'izlude_a', toNpc: false }]);
		} finally {
			coords.mockRestore();
			MapRenderer.currentMap = 'prontera.gat';
		}
	});
});
