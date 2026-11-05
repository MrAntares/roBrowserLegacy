import { describe, expect, it } from 'vitest';
import {
	applyNavigationDistanceEra,
	applyNavigationLinkEra,
	applyNavigationMapEra,
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
});
