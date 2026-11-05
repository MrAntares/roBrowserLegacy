import { afterEach, describe, expect, it, vi } from 'vitest';
import DB from 'DB/DBManager.js';
import MapPathFinder from 'UI/Components/Navigation/MapPathFinder.js';

describe('MapPathFinder service routes', () => {
	afterEach(() => vi.restoreAllMocks());

	it('allows a same-map destination without navigation links', () => {
		const route = MapPathFinder.findPathBetweenMaps('custom_island', 12, 18, 'custom_island', -1, -1, [200]);
		expect(route).toEqual([{
			map: 'custom_island',
			x: -1,
			y: -1,
			warpId: null,
			type: null,
			service: false,
			name: ''
		}]);
	});

	it('keeps service links opt-in and returns the selected transport path', () => {
		vi.spyOn(DB, 'getNaviLinkTable').mockReturnValue([
			['prontera', 1, 201, 0, 'Kafra', '', 10, 10, 'izlude', 20, 20]
		]);
		vi.spyOn(DB, 'getNaviLinkDistanceTable').mockReturnValue([]);
		expect(MapPathFinder.findPathBetweenMaps('prontera', 1, 1, 'izlude', 30, 30)).toBeNull();
		const route = MapPathFinder.findPathBetweenMaps('prontera', 1, 1, 'izlude', 30, 30, { allowServices: true });
		expect(route).toEqual([
			{ map: 'prontera', x: 10, y: 10, warpId: 1, destX: 20, destY: 20, destMap: 'izlude', service: true, type: 201, name: 'Kafra' },
			{ map: 'izlude', x: 30, y: 30, warpId: null, service: false, type: null, name: '' }
		]);
	});
});
