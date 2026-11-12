import LuaModuleLoader from 'Core/LuaModuleLoader.js';

export let lua, HO_AI, MER_AI, default_HO_AI, default_MER_AI;

async function createLuaVMs() {
	const wasmUrl = (await import('Vendors/liblua5.1.wasm?url')).default;
	const CLua = (await import('Vendors/wasmoon-lua5.1.js')).default;
	return Promise.all([
		CLua.Lua.create({ customWasmUri: wasmUrl }),
		CLua.Lua.create({ customWasmUri: wasmUrl }),
		CLua.Lua.create({ customWasmUri: wasmUrl }),
		CLua.Lua.create({ customWasmUri: wasmUrl }),
		CLua.Lua.create({ customWasmUri: wasmUrl })
	]);
}

export async function startLua(createVMs = createLuaVMs) {
	LuaModuleLoader.clearCache();
	const [l, ha, ma, dha, dma] = await createVMs();
	// Setup Lua module loaders for the default DB lua VM
	lua = LuaModuleLoader.setup(l);
	// HOAI and MER_AI are used for the AI lua VM and setuped in AIDriver.js
	HO_AI = ha;
	MER_AI = ma;
	default_HO_AI = dha;
	default_MER_AI = dma;
}
