import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.hoisted(() => {
	if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage.getItem !== 'function') {
		const store = {};
		globalThis.localStorage = {
			getItem: key => (key in store ? store[key] : null),
			setItem: (key, val) => {
				store[key] = String(val);
			},
			removeItem: key => {
				delete store[key];
			},
			clear: () => {
				for (const k in store) delete store[k];
			}
		};
	}
});

// DBManager reads the langtype of the first server when it is imported
vi.mock('Core/Configs.js', async importOriginal => {
	const { default: Configs } = await importOriginal();
	Configs.set('servers', [{ langtype: 12 }]);
	return { default: Configs };
});

const files = vi.hoisted(() => ({}));
vi.mock('Core/Client.js', () => ({
	default: {
		loadFile: (filename, onload, onerror) => {
			if (filename in files) {
				onload(files[filename]);
			} else if (/msgstringtable/.test(filename)) {
				onerror();
			}
		},
		loadFiles: () => {},
		getFile: () => {}
	}
}));

import DB from 'DB/DBManager.js';

// Client files arrive as this realm's Uint8Array, which TextEncoding.decode checks for
const bytes = text => Uint8Array.from(new TextEncoder().encode(text));
const b64 = text => btoa(String.fromCharCode(...bytes(text)));

// key, Korean, English, 4 unused, Portuguese, unused, Spanish
const row = (key, ko, en, pt, es) => [key, ko, en, '', '', '', '', pt, '', es].map(t => (t ? b64(t) : '')).join(',');

const ml = [
	row('MSI_DO_YOU_AGREE', '동의 하십니까?', 'Do you agree?', 'Você concorda?', '¿Estás de acuerdo?'),
	row('MSI_NO_PT', '한국어', 'English only', '', 'Solo español'),
	row('MSI_INCORRECT_LOGIN_PASSWORD', '비밀번호가 틀립니다.', 'Incorrect password.', 'Usuário ou senha incorretos.', '')
].join('\r\n');

describe('msgstringtable_ml.csv', () => {
	beforeEach(() => {
		for (const k in files) delete files[k];
	});

	it('fills the messages in the langtype language when the client has no msgstringtable', () => {
		files['data/msgstringtable_ml.csv'] = bytes(ml + '\r\n');
		DB.init();

		expect(DB.getMessage(0)).toBe('Você concorda?');
		expect(DB.getMessage(2)).toBe('Usuário ou senha incorretos.');
	});

	it('uses English for rows without the translation', () => {
		files['data/msgstringtable_ml.csv'] = bytes(ml);
		DB.init();

		expect(DB.getMessage(1)).toBe('English only');
	});

	it('is not read when the client has msgstringtable.txt', () => {
		files['data/msgstringtable.txt'] = bytes('Do you agree?#\r\nFrom the txt#\r\n');
		files['data/msgstringtable_ml.csv'] = bytes(row('MSI_X', '', '', 'Do csv', ''));
		DB.init();

		expect(DB.getMessage(0)).toBe('Do you agree?');
		expect(DB.getMessage(1)).toBe('From the txt');
	});
});
