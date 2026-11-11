import Client from 'Core/Client.js';
import TextEncoding from 'Utils/CodepageManager.js';
import { lua, getLuaGeneration } from 'DB/Loaders/LuaRuntime.js';
import MapInfo from 'DB/Map/MapTable.js';
import TownInfo from 'DB/TownInfo.js';

export const MapTable = {};
export const mapState = { mapalias: {} };
const mapNames = new WeakMap();
const loadedDisplayNames = new Set();
const builtInDisplayNames = new Map(Object.entries(MapInfo).map(([key, info]) => [key, info.displayName]));

export function resetLoadedMapNames() {
	loadedDisplayNames.clear();
}

function ensureMap(key) {
	return MapTable[key] || (MapTable[key] = {});
}

function attachMapName(key, map) {
	if (mapNames.has(map)) return;
	const state = { legacyName: map.name };
	mapNames.set(map, state);
	Object.defineProperty(map, 'name', {
		enumerable: true,
		configurable: true,
		get() {
			return (
				(loadedDisplayNames.has(key) && MapInfo[key] && MapInfo[key].displayName) ||
				state.legacyName ||
				builtInDisplayNames.get(key)
			);
		},
		set(value) {
			if (loadedDisplayNames.has(key) && MapInfo[key] && MapInfo[key].displayName)
				MapInfo[key].displayName = value;
			else state.legacyName = value;
		}
	});
}

export function setLegacyMapMusic(_index, key, value) {
	ensureMap(key).mp3 = value;
}

export function setLegacyMapName(_index, key, value) {
	const map = ensureMap(key);
	attachMapName(key, map);
	mapNames.get(map).legacyName = value;
}

export function createMapDatabase(DB, getUserCharpage) {
	const userStringDecoder = TextEncoding;
	const resolveUserCharpage = typeof getUserCharpage === 'function' ? getUserCharpage : () => getUserCharpage;
	function setMapAlias(_index, key, value) {
		DB.mapalias[key] = value;
	}
	function loadMapTbl(filename, callback, onEnd) {
		const instance = lua;
		const generation = getLuaGeneration();
		const isCurrent = () => generation === getLuaGeneration();
		const loadPromise = new Promise((resolve, reject) => {
			Client.loadFile(filename, resolve, reject);
		});

		loadPromise
			.then(async file => {
				if (!isCurrent()) return;
				let success = false;
				try {
					console.log('Loading file "' + filename + '"...');
					// check if file is ArrayBuffer and convert to Uint8Array if necessary
					const buffer = file instanceof ArrayBuffer ? new Uint8Array(file) : file;

					// get context, a proxy. It will be used to interact with lua conveniently
					const ctx = instance.ctx;
					const userCharpage = resolveUserCharpage();

					// create mapInfo required functions in context
					ctx.AddMapDisplayName = (name, displayName, notify_enter) => {
						if (!isCurrent()) return 1;
						const decoded_name = userStringDecoder.decode(name);
						MapInfo[decoded_name] = {
							displayName: userStringDecoder.decode(displayName, userCharpage),
							notifyEnter: notify_enter,
							signName: {
								subTitle: null,
								mainTitle: null
							},
							backgroundBmp: null
						};
						loadedDisplayNames.add(decoded_name);

						return 1;
					};

					ctx.AddMapSignName = (name, subTitle, mainTitle) => {
						if (!isCurrent()) return 1;
						const decoded_name = userStringDecoder.decode(name);
						const decoded_subTitle =
							subTitle && subTitle.length > 1 ? userStringDecoder.decode(subTitle, userCharpage) : null;
						const decoded_mainTitle =
							mainTitle && mainTitle.length > 1
								? userStringDecoder.decode(mainTitle, userCharpage)
								: null;
						MapInfo[decoded_name].signName = {
							subTitle: decoded_subTitle,
							mainTitle: decoded_mainTitle
						};
						return 1;
					};

					ctx.AddMapBackgroundBmp = (name, backgroundBmp) => {
						if (!isCurrent()) return 1;
						const decoded_name = userStringDecoder.decode(name);
						MapInfo[decoded_name].backgroundBmp = backgroundBmp
							? userStringDecoder.decode(backgroundBmp)
							: 'field';
						return 1;
					};

					// mount file
					instance.mountFile(filename, buffer);

					// execute file
					await instance.doFile(filename);
					if (!isCurrent()) return;

					// execute main function
					instance.doStringSync('main()');
					updateMapTable();
					success = true;
				} catch (error) {
					console.error('[loadMapTbl] Error: ', error);
				} finally {
					// release file from memmory
					instance.unmountFile(filename);
					// call onEnd
					if (isCurrent()) onEnd(success);
				}
			})
			.catch(error => {
				if (isCurrent()) onEnd(false);
			});
	}

	function parseFogEntry(index, key, near, far, color, factor) {
		const int_color = parseInt(color, 16);
		const map = ensureMap(key);

		map.fog = {
			near: parseFloat(near),
			far: parseFloat(far),
			color: [
				(255 & (int_color >> 16)) / 255.0,
				(255 & (int_color >> 8)) / 255.0,
				(255 & (int_color >> 0)) / 255.0
			],
			factor: parseFloat(factor)
		};
	}

	function parseIndoorEntry(index, key) {
		key = key.replace('.gat', '.rsw');
		const map = ensureMap(key);
		map.indoor = true;
	}

	function updateMapTable() {
		for (const key of loadedDisplayNames) {
			const map = ensureMap(key);
			attachMapName(key, map);
		}
	}
	class MapDatabase {
		static getTownInfo(mapname) {
			return TownInfo[mapname] || null;
		}
		static getMap(mapname) {
			const map = mapname.replace('.gat', '.rsw');
			const entry = MapTable[map];
			if (entry && ('name' in entry || loadedDisplayNames.has(map) || builtInDisplayNames.has(map)))
				attachMapName(map, entry);
			return entry || null;
		}

		static getMapName(mapname, defaultName) {
			if (!mapname) {
				return typeof defaultName === 'undefined' ? DB.getMessage(187) : defaultName;
			}
			const map = mapname.replace('.gat', '.rsw');
			const entry = MapTable[map];
			if (entry && ('name' in entry || loadedDisplayNames.has(map) || builtInDisplayNames.has(map)))
				attachMapName(map, entry);
			const name = (entry && entry.name) || builtInDisplayNames.get(map);
			if (!name) {
				return typeof defaultName === 'undefined' ? DB.getMessage(187) : defaultName;
			}

			return name;
		}

		static getMapInfo(mapname) {
			return MapInfo[mapname] || null;
		}

		static isIndoor(mapname) {
			if (mapname === undefined) {
				return -1;
			}
			let map;
			if (mapname.substring(mapname.length - 4, mapname.length) == '.gat') {
				map = mapname.replace('.gat', '.rsw');
			} else {
				map = mapname;
			}
			if (MapTable[map] === undefined) {
				return false;
			}
			return MapTable[map].indoor || false;
		}
	}
	return { MapDatabase, loadMapTbl, parseFogEntry, parseIndoorEntry, updateMapTable, setMapAlias };
}
