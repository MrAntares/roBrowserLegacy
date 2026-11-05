import { describe, expect, it } from 'vitest';
import {
	applyNavigationDistanceEra,
	applyNavigationLinkEra,
	applyNavigationMapEra,
	getIncomingNavigationMapPoint,
	isPreSatanMorroc
} from 'DB/Map/NavigationEra.js';

describe('navigation era compatibility', () => {
	it('switches topology only before Episode 12', () => {
		const maps = [['moc_fild20'], ['prontera']];
		expect(isPreSatanMorroc({ episode: 11 })).toBe(true);
		expect(isPreSatanMorroc({ episode: 12 })).toBe(false);
		expect(applyNavigationMapEra(maps, { episode: 12 })).toBe(maps);
		expect(applyNavigationMapEra(maps, { episode: 11 }).some(map => map[0] === 'moc_fild20')).toBe(false);
	});

	it('filters post-Satan endpoints and disables the incompatible distance closure', () => {
		const links = [['prontera', 1, 200, 0, '', '', 0, 0, 'moc_fild20', 0, 0]];
		expect(applyNavigationLinkEra(links, { episode: 11 }).some(link => link[8] === 'moc_fild20')).toBe(false);
		expect(applyNavigationLinkEra(links, { episode: 12 })).toBe(links);
		expect(applyNavigationDistanceEra([[1]], { episode: 11 })).toEqual([]);
	});

	it('uses an incoming portal cell instead of map dimensions as the destination', () => {
		const naviMapRow = ['moc_fild04', 'moc_fild04', 5001, 400, 400];
		const links = [['prontera', 7, 200, 0, '', '', 50, 60, 'moc_fild04', 123, 234]];
		expect(naviMapRow.slice(3)).toEqual([400, 400]);
		expect(getIncomingNavigationMapPoint('moc_fild04', links)).toEqual({ x: 123, y: 234 });
		expect(getIncomingNavigationMapPoint('unknown', links)).toBeNull();
	});
});
