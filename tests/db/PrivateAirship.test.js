import { afterEach, describe, expect, it } from 'vitest';
import PrivateAirship from 'DB/Map/PrivateAirship.js';

afterEach(() => PrivateAirship.reset());

describe('private airship table', () => {
	it('lets every map through and lists the kRO items until the file is read', () => {
		expect(PrivateAirship.isLoaded()).toBe(false);
		expect(PrivateAirship.isStartableMap('anywhere')).toBe(true);
		expect(PrivateAirship.isEndableMap('anywhere')).toBe(true);
		expect(PrivateAirship.getNeedItems()).toEqual([6909, 25464]);
	});

	it('checks maps against the file, ignoring case and extension', () => {
		PrivateAirship.addStartableMap('izlude_a');
		PrivateAirship.addEndableMap('Prt_Mk');
		PrivateAirship.addNeedItem(25464);
		PrivateAirship.addNeedItem(25464);

		expect(PrivateAirship.isLoaded()).toBe(true);
		expect(PrivateAirship.isStartableMap('IZLUDE_A.gat')).toBe(true);
		expect(PrivateAirship.isStartableMap('izlude')).toBe(false);
		expect(PrivateAirship.isEndableMap('prt_mk.rsw')).toBe(true);
		expect(PrivateAirship.isEndableMap('izlude_a')).toBe(false);
		expect(PrivateAirship.getNeedItems()).toEqual([25464]);
	});
});
