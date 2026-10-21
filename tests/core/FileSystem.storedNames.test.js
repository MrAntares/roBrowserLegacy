/**
 * tests/core/FileSystem.storedNames.test.js
 *
 * Chromium's FileSystem may refuse every name outside printable ASCII
 * (SecurityError), as the client's Korean folders (EUC-KR bytes read as
 * latin1). Such names are stored percent-encoded, and found again under the
 * client's own path.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const KOREAN_DIR = 'data\\texture\\\xc0\xaf\xc0\xfa\xc0\xce\xc5\xcd\xc6\xe4\xc0\xcc\xbd\xba';

describe('FileSystem with a cache that only takes ASCII names', () => {
	let stored;

	beforeEach(() => {
		stored = {};
		const check = path => {
			if (/[^\x20-\x7e]/.test(path)) {
				const err = new Error('certain files are unsafe for access');
				err.name = 'SecurityError';
				throw err;
			}
		};
		const entry = path => ({
			isFile: true,
			name: path.split('/').pop(),
			file: () => stored[path],
			createWriter: () => ({
				write(blob) {
					stored[path] = blob;
				}
			})
		});
		const fsSync = {
			root: {
				getDirectory: check,
				getFile: (path, opts) => {
					check(path);
					if (!opts.create && !(path in stored)) {
						throw new Error('not found');
					}
					return entry(path);
				},
				createReader: () => ({
					readEntries: () => Object.keys(stored).filter(p => !p.includes('/')).map(entry)
				})
			}
		};
		self.TEMPORARY = 0;
		self.webkitRequestFileSystemSync = () => fsSync;
		self.webkitRequestFileSystem = (type, size, ok) => ok({ root: fsSync.root });
		vi.resetModules();
	});

	afterEach(() => {
		delete self.webkitRequestFileSystemSync;
		delete self.webkitRequestFileSystem;
	});

	async function load() {
		const { default: FileSystem } = await import('Core/FileSystem.js');
		FileSystem.init([], true, { used: 1 });
		return FileSystem;
	}

	it('caches a file under a Korean folder and reads it back by its client path', async () => {
		const FileSystem = await load();
		const path = `${KOREAN_DIR}\\prt_01.bmp`;

		FileSystem.saveFile(path, new Uint8Array([66, 77]).buffer);

		const keys = Object.keys(stored);
		expect(keys).toHaveLength(1);
		expect(keys[0]).toMatch(/^[\x20-\x7e]+$/);
		expect(FileSystem.getFileSync(path)).toBe(stored[keys[0]]);
	});

	it('keeps an ASCII name as it is', async () => {
		const FileSystem = await load();

		FileSystem.saveFile('data\\sprite\\poring.spr', new Uint8Array([1]).buffer);

		expect(Object.keys(stored)).toEqual(['data/sprite/poring.spr']);
	});

	it('matches a search against the client name', async () => {
		const FileSystem = await load();

		FileSystem.saveFile('\xc7\xc1\xb7\xd0.grf', new Uint8Array([1]).buffer);
		FileSystem.saveFile('100%.grf', new Uint8Array([2]).buffer);

		expect(FileSystem.search('\xc7\xc1\xb7\xd0.grf')).toHaveLength(1);
		expect(FileSystem.search('100%.grf')).toHaveLength(1);
	});
});
