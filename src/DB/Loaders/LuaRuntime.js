import LuaModuleLoader from 'Core/LuaModuleLoader.js';

export let lua, HO_AI, MER_AI, default_HO_AI, default_MER_AI;
let runtimeGeneration = 0;
let clientGeneration = 0;

export function invalidateLuaRuntime() {
	runtimeGeneration++;
	clientGeneration++;
}

export function getLuaGeneration() {
	return runtimeGeneration;
}

export function getClientGeneration() {
	return clientGeneration;
}

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
	const generation = ++runtimeGeneration;
	LuaModuleLoader.clearCache();
	const [l, ha, ma, dha, dma] = await createVMs();
	if (generation !== runtimeGeneration) return false;
	lua = LuaModuleLoader.setup(l);
	HO_AI = LuaModuleLoader.setup(ha, {
		searchPaths: [
			'./?.lua',
			'./?.lub',
			'AI/USER_AI/?.lua',
			'AI/USER_AI/?.lub',
			'AI/?.lua',
			'AI/?.lub',
			...LuaModuleLoader.DEFAULT_SEARCH_PATHS
		]
	});
	MER_AI = LuaModuleLoader.setup(ma, {
		searchPaths: [
			'./?.lua',
			'./?.lub',
			'AI/USER_AI/?.lua',
			'AI/USER_AI/?.lub',
			'AI/?.lua',
			'AI/?.lub',
			...LuaModuleLoader.DEFAULT_SEARCH_PATHS
		]
	});
	default_HO_AI = LuaModuleLoader.setup(dha, {
		searchPaths: [
			'./?.lua',
			'./?.lub',
			'AI/?.lua',
			'AI/?.lub',
			'AI/USER_AI/?.lua',
			'AI/USER_AI/?.lub',
			...LuaModuleLoader.DEFAULT_SEARCH_PATHS
		]
	});
	default_MER_AI = LuaModuleLoader.setup(dma, {
		searchPaths: [
			'./?.lua',
			'./?.lub',
			'AI/?.lua',
			'AI/?.lub',
			'AI/USER_AI/?.lua',
			'AI/USER_AI/?.lub',
			...LuaModuleLoader.DEFAULT_SEARCH_PATHS
		]
	});
	return true;
}
