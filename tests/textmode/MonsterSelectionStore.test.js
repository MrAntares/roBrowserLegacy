import { describe, expect, it } from 'vitest';
import { MonsterSelectionStore, normalizeMapName } from 'Engine/TextMode/MonsterSelectionStore.js';

function memoryStorage() {
	const values = new Map();
	return {
		getItem: key => values.get(key) ?? null,
		setItem: (key, value) => values.set(key, value),
		removeItem: key => values.delete(key)
	};
}

describe('MonsterSelectionStore', () => {
	it('keeps independent selections per normalized map filename', () => {
		const store = new MonsterSelectionStore(memoryStorage());
		store.toggle('prt_fild08.gat', 1002, true);
		store.toggle('pay_fild01', 1007, true);

		expect([...store.get('PRT_FILD08')]).toEqual([1002]);
		expect([...store.get('pay_fild01.gat')]).toEqual([1007]);
	});

	it('clears only the current map selection', () => {
		const store = new MonsterSelectionStore(memoryStorage());
		store.set('map_a', [1, 2]);
		store.set('map_b', [3]);
		store.clear('map_a');

		expect(store.get('map_a').size).toBe(0);
		expect([...store.get('map_b')]).toEqual([3]);
	});

	it('normalizes map filenames', () => {
		expect(normalizeMapName('Prontera.GAT')).toBe('prontera');
	});
});
