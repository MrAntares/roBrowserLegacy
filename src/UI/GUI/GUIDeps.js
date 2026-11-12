/**
 * Heavy modules loaded lazily to keep viewer bundles lightweight.
 * In Online/full-game context these resolve instantly (already loaded).
 * In viewer context they are never triggered.
 */
let _Cursor = null;
let _DB = null;
let _Client = null;
let _Renderer = null;
let _EntityManager = null;
let _ScrollBar = null;

let _depsPromise = null;

async function _loadHeavyDeps() {
	if (_Cursor) return;
	const [CursorMod, DBMod, ClientMod, RendererMod, EntityManagerMod, ScrollBarMod] = await Promise.all([
		import('UI/CursorManager.js'),
		import('DB/DBManager.js'),
		import('Core/Client.js'),
		import('Renderer/Renderer.js'),
		import('Renderer/EntityManager.js'),
		import('UI/Scrollbar.js')
	]);
	_Cursor = CursorMod.default;
	_DB = DBMod.default;
	_Client = ClientMod.default;
	_Renderer = RendererMod.default;
	_EntityManager = EntityManagerMod.default;
	_ScrollBar = ScrollBarMod.default;
}

export function ensureDeps() {
	if (!_depsPromise) {
		_depsPromise = _loadHeavyDeps();
	}
	return _depsPromise;
}

export const getCursor = () => _Cursor;
export const getDB = () => _DB;
export const getClient = () => _Client;
export const getRenderer = () => _Renderer;
export const getEntityManager = () => _EntityManager;
export const getScrollBar = () => _ScrollBar;
