import { describe, it, expect, beforeAll, vi } from 'vitest';

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

// The Lua VM is real; Vite's ?url import has no server here, so hand it the wasm inline.
vi.mock('Vendors/liblua5.1.wasm?url', async () => {
	const fs = await import('fs');
	const path = await import('path');
	const bytes = fs.readFileSync(path.resolve(process.cwd(), 'src/Vendors/liblua5.1.wasm'));
	return { default: `data:application/octet-stream;base64,${bytes.toString('base64')}` };
});

// Ids the built-in tables lack (hat, robe) or that the Lua table replaces (mercenary),
// so each name can only come from the Lua table.
const SINGER_HAT = 29999;
const FEATHER_ROBE = 999;
const SWORD_MERCENARY = 6017;
// Korean resource names, as the EUC-KR bytes a client's .lub stores:
// '_음유시인모자' (Bard Hat), '_꼬마깃털' (garment), '검사_용병' (mercenary sprite).
const SINGER_HAT_BYTES = [0x5f, 0xc0, 0xbd, 0xc0, 0xaf, 0xbd, 0xc3, 0xc0, 0xce, 0xb8, 0xf0, 0xc0, 0xda];
const FEATHER_ROBE_BYTES = [95, 178, 191, 184, 182, 177, 234, 197, 208];
const SWORD_MERCENARY_BYTES = [176, 203, 187, 231, 95, 191, 235, 186, 180];

const MAX_HP_OPTION = 999;
// '最大HP' as the big5 bytes a Taiwan client's addrandomoptionnametable.lub stores.
const MAX_HP_BYTES = [0xb3, 0xcc, 0xa4, 0x6a, 0x48, 0x50];

const luaBytes = bytes => bytes.map(b => '\\' + b).join('');
const luaSource = text => new TextEncoder().encode(text);

const LUA = 'data/luafiles514/lua files/datainfo/';
const files = {
	[LUA + 'accessoryid.lub']: luaSource(`ACCESSORY_IDs = { ACCESSORY_SINGERHAT = ${SINGER_HAT} }`),
	[LUA + 'accname.lub']: luaSource(
		`AccNameTable = { [ACCESSORY_IDs.ACCESSORY_SINGERHAT] = "${luaBytes(SINGER_HAT_BYTES)}" }`
	),
	[LUA + 'spriterobeid.lub']: luaSource(`SPRITE_ROBE_IDs = { ROBE_FEATHER = ${FEATHER_ROBE} }`),
	[LUA + 'spriterobename.lub']: luaSource(
		`RobeNameTable = { [SPRITE_ROBE_IDs.ROBE_FEATHER] = "${luaBytes(FEATHER_ROBE_BYTES)}" }`
	),
	[LUA + 'npcidentity.lub']: luaSource(`jobtbl = { JT_MER_SWORDMAN = ${SWORD_MERCENARY} }`),
	[LUA + 'jobname.lub']: luaSource(`JobNameTable = { [jobtbl.JT_MER_SWORDMAN] = "${luaBytes(SWORD_MERCENARY_BYTES)}" }`),
	[LUA + 'enumvar.lub']: luaSource(`VAR_MAXHPAMOUNT = ${MAX_HP_OPTION}`),
	[LUA + 'addrandomoptionnametable.lub']: luaSource(
		`NameTable_VAR = { [VAR_MAXHPAMOUNT] = "${luaBytes(MAX_HP_BYTES)}" }`
	)
};
const requested = [];

vi.mock('Core/Client.js', () => ({
	default: {
		// Answers later, as a real file request does
		loadFile: (name, callback) => {
			requested.push(name);
			if (name in files) {
				setTimeout(() => callback(files[name]), 0);
			}
		},
		loadFiles: () => {},
		getFile: () => {}
	}
}));

// DB.lazyInit() would load the AI driver, and the renderer behind it, after the
// test is over: nothing here needs it.
vi.mock('Core/AIDriver.js', () => ({ default: { initAI: () => {} } }));

async function waitFor(check) {
	for (let i = 0; i < 200; i++) {
		if (check()) {
			return;
		}
		await new Promise(resolve => setTimeout(resolve, 25));
	}
	throw new Error('timed out');
}

const name = path => path.slice(path.lastIndexOf('/') + 1);

// A Taiwan server: user-facing text is big5, but the client's resource names stay Korean.
describe('Lua tables with a non-Korean langtype', () => {
	let DB, TextEncoding, grf, big5;

	beforeAll(async () => {
		const { default: Configs } = await import('Core/Configs.js');
		Configs.set('servers', [{ langtype: 4 }]);
		Configs.set('loadLua', true);
		// A client recent enough to load the pet tables after the job names
		const { default: PACKETVER } = await import('Network/PacketVerManager.js');
		PACKETVER.value = 20240417;

		TextEncoding = (await import('Utils/CodepageManager.js')).default;
		grf = bytes => TextEncoding.decode(new Uint8Array(bytes), 'windows-1252');
		big5 = bytes => TextEncoding.decode(new Uint8Array(bytes), 'big5');
		DB = (await import('DB/DBManager.js')).default;
		DB.lazyInit();

		await waitFor(
			() =>
				DB.getHatPath(SINGER_HAT, 0) &&
				DB.getRobePathNoSex(FEATHER_ROBE, 0, 0) &&
				name(DB.getBodyPath(SWORD_MERCENARY, 0)) !== name(DB.getBodyPath(6018, 0)) &&
				DB.getOptionName(MAX_HP_OPTION) !== 'UNKNOWN RANDOM OPTION'
		);
	});

	// GRF lookup uses windows-1252 strings of the raw bytes (docs/Encoding.md), not
	// the bytes read as big5, which name a file no client has.
	it('keep headgear names in the filesystem charset', () => {
		expect(DB.getHatPath(SINGER_HAT, 0).endsWith(grf(SINGER_HAT_BYTES))).toBe(true);
	});

	it('keep garment names in the filesystem charset', () => {
		expect(name(DB.getRobePathNoSex(FEATHER_ROBE, 0, 0))).toBe(grf(FEATHER_ROBE_BYTES));
		expect(DB.getRobePathNoSex(FEATHER_ROBE, 0, 0)).not.toContain(big5(FEATHER_ROBE_BYTES));
	});

	it('keep job sprite names in the filesystem charset', () => {
		expect(name(DB.getBodyPath(SWORD_MERCENARY, 0))).toBe(grf(SWORD_MERCENARY_BYTES));
	});

	it('still load the pet tables once the job names are in', async () => {
		await waitFor(() => requested.includes(LUA + 'petinfo.lub'));
	});

	it('decode user-facing text with the langtype charset', () => {
		expect(DB.getOptionName(MAX_HP_OPTION)).toBe('最大HP');
	});
});
