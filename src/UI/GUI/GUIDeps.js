/**
 * Heavy modules loaded lazily to keep viewer bundles lightweight.
 * In Online/full-game context these resolve instantly (already loaded).
 * In viewer context they are never triggered.
 *
 * @author AoShinHo
 */

let _Cursor = null;
let _Client = null;
let _Renderer = null;
let _EntityManager = null;
let _ScrollBar = null;
let _DB = null;
let _depsPromise = null;

async function _loadHeavyDeps() {
	if (_Cursor) return;
	const [Cursor, DB, Client, Renderer, EntityManager, ScrollBar] = await Promise.all([
		import('UI/CursorManager.js'),
		import('DB/DBManager.js'),
		import('Core/Client.js'),
		import('Renderer/Renderer.js'),
		import('Renderer/EntityManager.js'),
		import('UI/Scrollbar.js')
	]);
	_Cursor = Cursor.default;
	_DB = DB.default;
	_Client = Client.default;
	_Renderer = Renderer.default;
	_EntityManager = EntityManager.default;
	_ScrollBar = ScrollBar.default;
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
