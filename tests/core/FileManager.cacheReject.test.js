/**
 * tests/core/FileManager.cacheReject.test.js
 *
 * A downloaded file whose cache write throws must still reach its caller,
 * once. A throw there used to call back a second time with null, which turned
 * every ground texture into nothing.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('FileManager.getHTTP with a cache that rejects every write', () => {
	beforeEach(() => {
		const reject = () => {
			const err = new Error('certain files are unsafe for access');
			err.name = 'SecurityError';
			throw err;
		};
		const fsSync = {
			root: {
				getDirectory: reject,
				getFile: reject
			}
		};
		self.TEMPORARY = 0;
		self.webkitRequestFileSystemSync = () => fsSync;
		self.webkitRequestFileSystem = (type, size, ok) => ok({ root: {} });
		vi.resetModules();
	});

	afterEach(() => {
		delete self.webkitRequestFileSystemSync;
		delete self.webkitRequestFileSystem;
		vi.unstubAllGlobals();
	});

	it('calls back once with the buffer', async () => {
		const { default: FileSystem } = await import('Core/FileSystem.js');
		const { default: FileManager } = await import('Core/FileManager.js');
		FileSystem.init([], true, { used: 1 });
		FileManager.remoteClient = '/grf/';

		const body = new Uint8Array([66, 77, 1, 2]).buffer;
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => ({
				ok: true,
				headers: { get: () => 'application/octet-stream' },
				arrayBuffer: async () => body
			}))
		);

		const callback = vi.fn();
		FileManager.getHTTP('data\\texture\\\xc7\xca\xb5\xe5\\prt_01.bmp', callback);
		// Under a loaded run the fetch chain may need more than one tick
		await vi.waitFor(() => expect(callback).toHaveBeenCalled());
		await new Promise(r => setTimeout(r, 10));

		expect(callback).toHaveBeenCalledOnce();
		expect(callback).toHaveBeenCalledWith(body);
	});
});
