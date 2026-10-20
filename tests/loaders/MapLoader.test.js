import { describe, it, expect, vi, beforeEach } from 'vitest';

// Every file the loader asks for, and a way to answer each one by hand.
const files = vi.hoisted(() => ({ asked: [], pending: new Map() }));

vi.mock('Core/FileManager.js', () => ({
	default: {
		filesAlias: {},
		load(name, callback) {
			files.asked.push(name);
			files.pending.set(name, callback);
		}
	}
}));

import MapLoader from 'Loaders/MapLoader.js';

const model = {
	instances: [],
	createInstance() {},
	hasAnimation: () => false,
	compile: () => ({ meshes: [], textures: [] })
};

const world = {
	files: { gat: 'map.gat', gnd: 'map.gnd' },
	models: [{ filename: 'a.rsm' }, { filename: 'b.rsm' }, { filename: 'a.rsm' }],
	water: { level: 0, waveHeight: 0 },
	compile: () => ({})
};

const ground = {
	version: 1.7,
	width: 1,
	height: 1,
	textures: ['t1.bmp', 't2.bmp'],
	compile: () => ({ textures: ['t1.bmp', 't2.bmp'], waterVertCount: 0 })
};

const altitude = { compile: () => ({}) };

function answer(name, data) {
	const callback = files.pending.get(name);
	expect(callback, `${name} was not asked for`).toBeTypeOf('function');
	files.pending.delete(name);
	callback(data);
}

const settle = () => new Promise(resolve => setTimeout(resolve, 0));

describe('MapLoader', () => {
	beforeEach(() => {
		files.asked.length = 0;
		files.pending.clear();
	});

	it('asks for the ground with the altitude, then its textures and the models, and still hands them on in order', async () => {
		const loader = new MapLoader();
		const order = [];
		loader.ondata = type => order.push(type);
		loader.onload = ok => order.push(`done:${ok}`);
		loader.load('map.rsw');

		answer('data\\map.rsw', world);
		await settle();
		expect(files.asked).toEqual(['data\\map.rsw', 'data\\map.gnd', 'data\\map.gat']);

		// The ground arrives first: its textures and the models are asked for
		// at once, but the ground is not used before the altitude.
		answer('data\\map.gnd', ground);
		await settle();
		expect(files.asked.slice(3)).toEqual([
			'data\\texture\\t1.bmp',
			'data\\texture\\t2.bmp',
			'data\\model\\a.rsm',
			'data\\model\\b.rsm'
		]);
		expect(order).toEqual([]);

		answer('data\\map.gat', altitude);
		await settle();
		expect(order).toEqual(['MAP_ALTITUDE']);
		// The texture step asked for nothing again.
		expect(files.asked).toHaveLength(7);

		answer('data\\model\\a.rsm', { ...model });
		answer('data\\model\\b.rsm', { ...model });
		answer('data\\texture\\t1.bmp', 'blob:t1');
		answer('data\\texture\\t2.bmp', 'blob:t2');
		await settle();
		await settle();

		expect(order).toEqual(['MAP_ALTITUDE', 'MAP_WORLD', 'MAP_GROUND', 'MAP_MODELS', 'done:true']);
		expect(new Set(files.asked).size).toBe(files.asked.length);
	});

	it("gives a texture the ground and a model share to each its own answer, since a blob URL is revoked once loaded", async () => {
		const loader = new MapLoader();
		const data = {};
		loader.ondata = (type, value) => (data[type] = value);
		loader.onload = () => {};
		loader.load('map.rsw');

		answer('data\\map.rsw', { ...world, models: [{ filename: 'a.rsm' }] });
		await settle();
		answer('data\\map.gnd', ground);
		answer('data\\map.gat', altitude);
		await settle();
		answer('data\\texture\\t1.bmp', 'blob:ground-t1');
		answer('data\\texture\\t2.bmp', 'blob:ground-t2');
		answer('data\\model\\a.rsm', {
			...model,
			compile: () => ({ meshes: [{ 0: new Float32Array(9) }], textures: ['t1.bmp'] })
		});
		await settle();
		await settle();

		// The model's texture is asked for again, not handed the ground's URL
		answer('data\\texture\\t1.bmp', 'blob:model-t1');
		await settle();

		expect(data.MAP_GROUND.textures).toEqual(['blob:ground-t1', 'blob:ground-t2']);
		expect(data.MAP_MODELS.infos.map(info => info.texture)).toEqual(['blob:model-t1']);
	});

	it('stops at a missing altitude without using the ground', async () => {
		const loader = new MapLoader();
		const order = [];
		loader.ondata = type => order.push(type);
		loader.onload = (ok, error) => order.push(`done:${ok}:${error}`);
		loader.load('map.rsw');

		const compile = vi.spyOn(ground, 'compile');
		answer('data\\map.rsw', world);
		await settle();
		answer('data\\map.gnd', ground);
		answer('data\\map.gat', null);
		await settle();

		expect(order).toEqual(['done:false:Can\'t find file "map.gat" !']);
		expect(compile).not.toHaveBeenCalled();
		compile.mockRestore();
	});

	it('loads at most six files at once across all the steps, and a step\'s own files go first', async () => {
		const loader = new MapLoader();
		loader.ondata = () => {};
		loader.onload = () => {};
		loader.load('map.rsw');

		const models = Array.from({ length: 10 }, (_, i) => ({ filename: `m${i}.rsm` }));
		const many = {
			...ground,
			textures: ['t1.bmp', 't2.bmp', 't3.bmp'],
			compile: () => ({ textures: ['t1.bmp', 't2.bmp', 't3.bmp'], waterVertCount: 1 })
		};
		answer('data\\map.rsw', { ...world, models, water: { ...world.water, type: 0 } });
		await settle();
		answer('data\\map.gnd', many);
		await settle();

		// The altitude and five early files
		expect(files.pending.size).toBe(6);
		expect([...files.pending.keys()]).toEqual([
			'data\\map.gat',
			'data\\texture\\t1.bmp',
			'data\\texture\\t2.bmp',
			'data\\texture\\t3.bmp',
			'data\\model\\m0.rsm',
			'data\\model\\m1.rsm'
		]);

		// The ground step needs the water images, not asked for early: they go
		// before the models still waiting.
		answer('data\\map.gat', altitude);
		await settle();
		answer('data\\model\\m0.rsm', { ...model });
		await settle();
		expect(files.asked.at(-1)).toMatch(/water000\.jpg$/);
		expect(files.pending.size).toBe(6);
	});

	it.each([
		['before', true],
		['after', false]
	])('frees the early textures when the altitude is missing, with the ground arriving %s it', async (_when, groundFirst) => {
		const revoke = vi.fn();
		vi.stubGlobal('URL', { ...URL, revokeObjectURL: revoke });

		const loader = new MapLoader();
		loader.ondata = () => {};
		loader.onload = () => {};
		loader.load('map.rsw');

		answer('data\\map.rsw', { ...world, models: [] });
		await settle();
		if (groundFirst) {
			answer('data\\map.gnd', ground);
			await settle();
			answer('data\\texture\\t1.bmp', 'blob:t1');
			answer('data\\map.gat', null);
			await settle();
			answer('data\\texture\\t2.bmp', 'blob:t2');
		} else {
			answer('data\\map.gat', null);
			await settle();
			answer('data\\map.gnd', ground);
			await settle();
		}
		await settle();

		expect(revoke.mock.calls.map(call => call[0]).sort()).toEqual(groundFirst ? ['blob:t1', 'blob:t2'] : []);
		// Nothing more is asked for once the load has failed
		expect(files.pending.size).toBe(0);
		vi.unstubAllGlobals();
	});
});
