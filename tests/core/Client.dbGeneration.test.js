import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock('Core/Thread.js', () => ({ default: { send: mocks.send } }));
import Client from 'Core/Client.js';
import Memory from 'Core/MemoryManager.js';

describe('client DB file cache generation', () => {
	beforeEach(() => { mocks.send.mockClear(); Client.invalidateDBFiles(); });

	it.each(['loadFile', 'getFile'])('does not let an old %s response fill the new cache slot', async method => {
		const filename = 'data/test-client-generation.txt';
		const oldCallback = vi.fn();
		const newCallback = vi.fn();
		Client[method](filename, oldCallback);
		const oldRequest = mocks.send.mock.calls[0][2];
		Client.invalidateDBFiles();
		Client[method](filename, newCallback);
		const newRequest = mocks.send.mock.calls[1][2];
		const oldData = new Uint8Array([1]);
		const newData = new Uint8Array([2]);
		await oldRequest(oldData, null, { filename });
		expect(oldCallback).not.toHaveBeenCalled();
		expect(newCallback).not.toHaveBeenCalled();
		await newRequest(newData, null, { filename });
		expect(newCallback).toHaveBeenCalledOnce();
		expect(newCallback).toHaveBeenCalledWith(newData);
		expect(Memory.get(filename)).toBe(newData);
	});

	it('removes completed table entries but keeps unrelated assets', async () => {
		const table = 'data/test-client-generation.lua';
		const asset = 'data/test-client-generation.bin';
		Memory.set(table, new Uint8Array([3]));
		Memory.set(asset, new Uint8Array([4]));
		Client.invalidateDBFiles();
		expect(Memory.exist(table)).toBe(false);
		expect(Memory.exist(asset)).toBe(true);
		Memory.remove(null, asset);
	});

	it('keeps newer cached data when the old request finishes last', async () => {
		const filename = 'data/test-late-generation.csv';
		const oldCallback = vi.fn();
		const newCallback = vi.fn();
		Client.loadFile(filename, oldCallback);
		const oldRequest = mocks.send.mock.calls[0][2];
		Client.invalidateDBFiles();
		Client.loadFile(filename, newCallback);
		const newRequest = mocks.send.mock.calls[1][2];
		const current = new Uint8Array([2]);
		await newRequest(current, null, { filename });
		await oldRequest(new Uint8Array([1]), null, { filename });
		expect(newCallback).toHaveBeenCalledOnce();
		expect(oldCallback).not.toHaveBeenCalled();
		expect(Memory.get(filename)).toBe(current);
	});
});
