/**
 * tests/core/FileSystem.storedNames.test.js
 *
 * Chromium's FileSystem may refuse every name outside printable ASCII
 * (SecurityError), as the client's Korean folders (EUC-KR bytes read as
 * latin1). Such names are stored percent-encoded, under a folder of their
 * own, and found again under the client's own path.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const KOREAN_DIR = 'data\\texture\\\xc0\xaf\xc0\xfa\xc0\xce\xc5\xcd\xc6\xe4\xc0\xcc\xbd\xba';

/**
 * A FileSystem that only takes printable ASCII names: files in `stored`, keyed
 * by their path without the leading slash; `failWrite` makes the next write throw.
 */
function asciiOnlyFileSystem() {
	const stored = {};
	const state = { stored, failWrite: false };
	const clean = path => path.replace(/^\/+/, '').replace(/\/+$/, '');
	const check = path => {
		if (/[^\x20-\x7e]/.test(path)) {
			const err = new Error('certain files are unsafe for access');
			err.name = 'SecurityError';
			throw err;
		}
	};
	const writeTo = (key, blob) => {
		if (state.failWrite) {
			state.failWrite = false;
			const err = new Error('quota');
			err.name = 'QuotaExceededError';
			throw err;
		}
		stored[key] = blob;
	};
	const fileEntry = key => ({
		isFile: true,
		isDirectory: false,
		name: key.split('/').pop(),
		file: cb => (cb ? cb(stored[key]) : stored[key]),
		remove: () => {
			delete stored[key];
		},
		moveTo: (dir, name) => {
			for (const k in stored) {
				if (k === key || k.startsWith(key + '/')) {
					stored[name + k.slice(key.length)] = stored[k];
					delete stored[k];
				}
			}
		},
		createWriter: cb => {
			const writer = {
				write(blob) {
					writeTo(key, blob);
					if (writer.onwriteend) {
						writer.onwriteend();
					}
				}
			};
			return cb ? cb(writer) : writer;
		}
	});
	const dirEntry = prefix => ({
		isFile: false,
		isDirectory: true,
		createReader: () => ({
			readEntries: () => {
				const names = {};
				for (const key in stored) {
					if (key.startsWith(prefix)) {
						names[key.slice(prefix.length).split('/')[0]] = true;
					}
				}
				return Object.keys(names).map(name => fileEntry(prefix + name));
			}
		}),
		removeRecursively: () => {
			for (const key in stored) {
				if (key.startsWith(prefix)) {
					delete stored[key];
				}
			}
		}
	});
	const root = {
		getDirectory: path => {
			check(path);
			return dirEntry(clean(path) ? clean(path) + '/' : '');
		},
		getFile: (path, opts, ok, ko) => {
			try {
				check(path);
				const key = clean(path);
				if (!opts.create && !(key in stored)) {
					throw new Error('not found');
				}
				if (opts.create && !(key in stored)) {
					stored[key] = new Blob([]);
				}
				return ok ? ok(fileEntry(key)) : fileEntry(key);
			} catch (e) {
				if (ko) {
					ko(e);
					return undefined;
				}
				throw e;
			}
		},
		createReader: () => dirEntry('').createReader()
	};
	return { state, root };
}

describe('FileSystem with a cache that only takes ASCII names', () => {
	let state;

	beforeEach(() => {
		const fs = asciiOnlyFileSystem();
		state = fs.state;
		self.TEMPORARY = 0;
		self.webkitRequestFileSystemSync = () => ({ root: fs.root });
		self.webkitRequestFileSystem = (type, size, ok) => ok({ root: fs.root });
		vi.resetModules();
	});

	afterEach(() => {
		delete self.webkitRequestFileSystemSync;
		delete self.webkitRequestFileSystem;
		vi.restoreAllMocks();
	});

	async function load(files = []) {
		const { default: FileSystem } = await import('Core/FileSystem.js');
		FileSystem.init(files, true, { used: 1 });
		return FileSystem;
	}

	it('caches a file under a Korean folder and reads it back by its client path', async () => {
		const FileSystem = await load();
		const path = `${KOREAN_DIR}\\prt_01.bmp`;

		FileSystem.saveFile(path, new Uint8Array([66, 77]).buffer);

		const keys = Object.keys(state.stored);
		expect(keys).toHaveLength(1);
		expect(keys[0]).toMatch(/^[\x20-\x7e]+$/);
		expect(FileSystem.getFileSync(path)).toBe(state.stored[keys[0]]);
	});

	it('keeps an ASCII name unencoded', async () => {
		const FileSystem = await load();

		FileSystem.saveFile('data\\sprite\\poring.spr', new Uint8Array([1]).buffer);

		expect(Object.keys(state.stored)).toEqual(['cache-v2/data/sprite/poring.spr']);
	});

	it('never reads a file an older client stored under its raw name', async () => {
		const FileSystem = await load();
		state.stored['100%25.grf'] = new Blob([new Uint8Array([9])]);

		expect(FileSystem.getFileSync('100%.grf')).toBeNull();
		expect(FileSystem.search('100%.grf')).toHaveLength(0);
	});

	it('matches a search against the client name', async () => {
		const FileSystem = await load();

		FileSystem.saveFile('\xc7\xc1\xb7\xd0.grf', new Uint8Array([1]).buffer);
		FileSystem.saveFile('100%.grf', new Uint8Array([2]).buffer);

		expect(FileSystem.search('\xc7\xc1\xb7\xd0.grf')).toHaveLength(1);
		expect(FileSystem.search('100%.grf')).toHaveLength(1);
	});

	it('stores an emoji and a lone surrogate without throwing', async () => {
		const FileSystem = await load();
		const emoji = 'data\\\u{1F30D}.bmp';
		const lone = 'data\\\uD800.bmp';

		expect(() => FileSystem.saveFile(emoji, new Uint8Array([1]).buffer)).not.toThrow();
		expect(() => FileSystem.saveFile(lone, new Uint8Array([2]).buffer)).not.toThrow();

		expect(Object.keys(state.stored)).toHaveLength(2);
		expect(FileSystem.getFileSync(emoji)).not.toBeNull();
		expect(FileSystem.getFileSync(lone)).not.toBeNull();
	});

	it('leaves no empty entry behind when the write fails', async () => {
		const FileSystem = await load();
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		state.failWrite = true;

		FileSystem.saveFile('data\\texture\\t.bmp', new Uint8Array([1]).buffer);

		expect(FileSystem.getFileSync('data\\texture\\t.bmp')).toBeNull();
	});

	it('uploads a client folder with Korean names and finds its files', async () => {
		const path = `${KOREAN_DIR.replace(/\\/g, '/')}/prt_01.bmp`;
		const file = new Blob([new Uint8Array([66, 77])]);
		file.name = 'prt_01.bmp';
		const { default: FileSystem } = await import('Core/FileSystem.js');
		const uploaded = new Promise(resolve => FileSystem.bind('onuploaded', resolve));

		FileSystem.init([{ file, path }], true, { used: 1 });
		await uploaded;

		const keys = Object.keys(state.stored);
		expect(keys).toHaveLength(1);
		expect(keys[0]).toMatch(/^cache-v2\/data\/texture\/[\x20-\x7e]+\/prt_01\.bmp$/);
		expect(FileSystem.getFileSync(path)).toBe(file);
	});
});
