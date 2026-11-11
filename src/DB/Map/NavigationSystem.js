import Configs from 'Core/Configs.js';
import WorldMap from 'DB/Map/WorldMap.js';
import MapInfo from 'DB/Map/MapTable.js';
import {
	applyNavigationDistanceEra,
	applyNavigationLinkEra,
	applyNavigationMapEra,
	getIncomingNavigationMapPoint
} from 'DB/Map/NavigationEra.js';

/**
 * @const {Array} NaviMap Table
 */
export const NaviMapTable = [];

/**
 * @const {Array} NaviMob Table
 */
export const NaviMobTable = [];
export let navigationMobRowsByMap = new Map();

/**
 * @const {Array} NaviNpc Table
 */
export const NaviNpcTable = [];

/**
 * @const {Array} NaviLink Table
 */
export const NaviLinkTable = [];

/**
 * @const {Array} NaviLinkDistance Table
 */
export const NaviLinkDistanceTable = [];

/**
 * @const {Array} NaviNpcDistance Table
 */
export const NaviNpcDistanceTable = [];

/**
 * Put a loaded navigation table in place of the last one. The arrays are
 * kept, since callers hold them, and emptied first: a client loaded after a
 * server switch may be another archive, with a shorter table or none.
 *
 * @param {Array} table
 * @param {Array|Object|null} json
 */
export function fillNaviTable(table, json) {
	table.length = 0;
	if (json) {
		Object.assign(table, normalizeLuaTable(json));
	}
	if (table === NaviMobTable) {
		navigationMobRowsByMap = new Map();
		for (const mob of table) {
			if (!mob) continue;
			const mapName = normalizeNaviMapName(mob[0]);
			if (!mapName) continue;
			let rows = navigationMobRowsByMap.get(mapName);
			if (!rows) navigationMobRowsByMap.set(mapName, (rows = []));
			rows.push(mob);
		}
	}
}

/**
 * Normalize Lua tables converted to JS objects.
 *
 * Some LUB navigation files use numeric Lua keys. The current Lua-to-JSON
 * extractor can return those tables as objects like { "1": [...] } instead
 * of real arrays, so code using .length will silently fail.
 */
function isNumericLuaKey(key) {
	return /^(0|[1-9]\d*)$/.test(String(key));
}

function normalizeLuaTable(value) {
	if (Array.isArray(value)) {
		return value.map(normalizeLuaTable);
	}

	if (value && typeof value === 'object') {
		const keys = Object.keys(value);

		if (!keys.length) {
			return [];
		}

		if (keys.every(isNumericLuaKey)) {
			const sorted = keys.sort((a, b) => Number(a) - Number(b));
			if (sorted.every((key, index) => Number(key) === index + 1)) {
				return sorted.map(key => normalizeLuaTable(value[key]));
			}
		}

		const normalized = Object.create(null);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			normalized[key] = normalizeLuaTable(value[key]);
		}
		return normalized;
	}

	return value;
}

function normalizeNaviMapName(mapName) {
	return String(mapName || '')
		.replace(/\.gat$/, '')
		.toLowerCase();
}

function getDefaultNaviMapPoint(mapName) {
	const targetMap = normalizeNaviMapName(mapName);
	const links = applyNavigationLinkEra(
		normalizeLuaTable(NaviLinkTable),
		Configs.get('worldMapSettings', { episode: 98 })
	);
	return getIncomingNavigationMapPoint(targetMap, links);
}

function normalizeSearchText(value) {
	return String(value || '')
		.toLowerCase()
		.replace(/\.gat$/g, '')
		.replace(/[_\-()\[\],:]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function findWorldMapEntry(mapName) {
	const targetMap = normalizeNaviMapName(mapName);

	for (let i = 0; i < WorldMap.length; i++) {
		const worldMap = WorldMap[i];
		if (!worldMap || !worldMap.maps) {
			continue;
		}

		for (let j = 0; j < worldMap.maps.length; j++) {
			const section = worldMap.maps[j];
			if (section && normalizeNaviMapName(section.id) === targetMap) {
				return section;
			}
		}
	}

	return null;
}

function getNavigationMapDisplayName(mapName) {
	const normalizedMap = normalizeNaviMapName(mapName);
	const mapInfo = MapInfo[normalizedMap + '.rsw'] || MapInfo[normalizedMap] || null;

	if (mapInfo && mapInfo.displayName) {
		return mapInfo.displayName;
	}

	const worldMapEntry = findWorldMapEntry(normalizedMap);
	if (worldMapEntry && worldMapEntry.name) {
		return worldMapEntry.name;
	}

	return normalizedMap;
}

function navigationMapMatchesQuery(mapName, displayName, query) {
	const normalizedQuery = normalizeSearchText(query);
	if (!normalizedQuery) {
		return false;
	}

	return (
		normalizeSearchText(mapName).indexOf(normalizedQuery) !== -1 ||
		normalizeSearchText(displayName).indexOf(normalizedQuery) !== -1
	);
}

function decodeNavigationMobClass(value) {
	value = Number(value) || 0;
	// PACKETVER >= 20140000 stores amount in the high 16 bits and look base in
	// the low 16 bits. Older clients store only look base.
	return value > 0xffff ? value & 0xffff : value;
}

function getNavigationMobAmount(value) {
	value = Number(value) || 0;
	return value > 0xffff ? value >>> 16 : 1;
}

function getNavigationSpawnRateLabel(amount) {
	amount = Number(amount) || 0;

	if (amount >= 60) {
		return 'Very High';
	}
	if (amount >= 25) {
		return 'High';
	}
	if (amount >= 10) {
		return 'Average';
	}
	if (amount >= 3) {
		return 'Low';
	}
	return 'Very Low';
}

function decodeNavigationMobInfo(value) {
	value = Number(value) || 0;
	const race = value & 0xff;
	const size = (value >> 8) & 0xff;
	const elementPacked = (value >> 16) & 0xffff;
	const element = elementPacked % 20;
	const elementLevel = Math.floor(elementPacked / 20);
	const elementNames = ['Neutral', 'Water', 'Earth', 'Fire', 'Wind', 'Poison', 'Holy', 'Dark', 'Ghost', 'Undead'];
	const raceNames = [
		'Formless',
		'Undead',
		'Brute',
		'Plant',
		'Insect',
		'Fish',
		'Demon',
		'Demi-Human',
		'Angel',
		'Dragon',
		'Boss',
		'Non-Boss'
	];
	const sizeNames = ['Small', 'Medium', 'Large'];

	return {
		raw: value,
		race: race,
		raceName: raceNames[race] || 'Unknown',
		size: size,
		sizeName: sizeNames[size] || 'Medium',
		element: element,
		elementLevel: elementLevel,
		elementName: (elementNames[element] || 'Neutral') + (elementLevel ? ' ' + elementLevel : '')
	};
}

export function createNavigationSystem(DB) {
	return class NavigationSystem {
		static getNavigationMapMonsters(mapName) {
			mapName = normalizeNaviMapName(mapName);
			if (!mapName) {
				return [];
			}

			const mobTable = navigationMobRowsByMap.get(mapName) || [];
			const grouped = {};
			const point = getDefaultNaviMapPoint(mapName) || { x: 0, y: 0 };

			for (let i = 0; i < mobTable.length; i++) {
				const mob = mobTable[i];
				if (!mob) {
					continue;
				}

				const mobName = mob[4] || '';
				if (!mobName) {
					continue;
				}

				const mobClass = decodeNavigationMobClass(mob[3]);
				const amount = getNavigationMobAmount(mob[3]);
				const key = [mobClass, mobName].join(':');
				const mobLevel = Number(mob[6]);
				const mobType = Number(mob[2]);

				if (!grouped[key]) {
					grouped[key] = {
						type: 'MOB',
						id: mobClass,
						mobType: mobType,
						levels: Number.isFinite(mobLevel) && mobLevel > 0 ? [mobLevel] : [],
						name: mobName,
						mapName: mapName,
						x: point.x,
						y: point.y,
						amount: amount,
						rateLabel: getNavigationSpawnRateLabel(amount)
					};
				} else if (amount > grouped[key].amount) {
					grouped[key].amount = amount;
					grouped[key].rateLabel = getNavigationSpawnRateLabel(amount);
				}
				if (Number.isFinite(mobLevel) && mobLevel > 0 && !grouped[key].levels.includes(mobLevel))
					grouped[key].levels.push(mobLevel);
			}

			return Object.keys(grouped)
				.map(key => grouped[key])
				.sort(function (a, b) {
					const aName = String(a.name || '').toLowerCase();
					const bName = String(b.name || '').toLowerCase();
					return aName.localeCompare(bName) || String(a.id || '').localeCompare(String(b.id || ''));
				});
		}

		static searchNavigation(query, type) {
			if (!query || query.length < 2) {
				return [];
			}

			query = query.toLowerCase();
			type = type || 'ALL';
			const results = [];
			const seen = {};

			function pushResult(result) {
				if (!result || !result.mapName) {
					return;
				}

				result.mapName = normalizeNaviMapName(result.mapName);
				result.x = Number(result.x);
				result.y = Number(result.y);

				if (!Number.isFinite(result.x) || !Number.isFinite(result.y)) {
					const point = getDefaultNaviMapPoint(result.mapName) || { x: 0, y: 0 };
					result.x = point.x;
					result.y = point.y;
				}

				let key;
				if (result.type === 'MAP') {
					key = [result.type, result.mapName].join(':');
				} else if (result.type === 'NPC' && Array.isArray(result.spawns) && result.spawns.length) {
					key = [result.type, String(result.name || '').toLowerCase()].join(':');
				} else {
					key = [result.type, result.id, result.mapName, result.x, result.y, result.name].join(':');
				}
				if (seen[key]) {
					return;
				}

				seen[key] = true;
				results.push(result);
			}

			// Search map destinations too. World Map clicks put a map display name
			// in this input, so ALL/MAP must be able to resolve map names, not only NPC/MOB names.
			if (type === 'ALL' || type === 'MAP') {
				const maps = applyNavigationMapEra(
					normalizeLuaTable(NaviMapTable),
					Configs.get('worldMapSettings', { episode: 98 })
				);
				for (let i = 0; i < maps.length; i++) {
					const map = maps[i];
					if (!map) {
						continue;
					}

					const mapName = normalizeNaviMapName(map[0]);
					const displayName = getNavigationMapDisplayName(mapName);

					if (!navigationMapMatchesQuery(mapName, displayName, query)) {
						continue;
					}

					const point = getDefaultNaviMapPoint(mapName);
					pushResult({
						type: 'MAP',
						id: mapName,
						name: displayName,
						mapName: mapName,
						x: point ? point.x : -1,
						y: point ? point.y : -1
					});
				}

				// Also search the visible World Map sections. Some custom world maps use
				// display names that do not exist inside Navi_Map, but the map id can
				// still be routed through Navi_Link.
				for (let i = 0; i < WorldMap.length; i++) {
					const worldMap = WorldMap[i];
					if (!worldMap || !worldMap.maps) {
						continue;
					}

					for (let j = 0; j < worldMap.maps.length; j++) {
						const section = worldMap.maps[j];
						if (!section || !section.id) {
							continue;
						}

						const mapName = normalizeNaviMapName(section.id);
						const displayName = getNavigationMapDisplayName(mapName);

						if (
							!navigationMapMatchesQuery(mapName, displayName, query) &&
							!navigationMapMatchesQuery(mapName, section.name, query)
						) {
							continue;
						}

						const point = getDefaultNaviMapPoint(mapName);
						pushResult({
							type: 'MAP',
							id: mapName,
							name: displayName || section.name || mapName,
							mapName: mapName,
							x: point ? point.x : -1,
							y: point ? point.y : -1
						});
					}
				}
			}

			// Search NPCs if type is ALL or NPC. Group one NPC name in the
			// left list, then show each map entry on the detail pane.
			if (type === 'ALL' || type === 'NPC') {
				// NaviNpcTable structure: [map, npc_id, npc_type, class_id, name, detail, x, y]
				const npcTable = normalizeLuaTable(NaviNpcTable);
				const groupedNpcs = {};

				for (let i = 0; i < npcTable.length; i++) {
					const npc = npcTable[i];
					if (!npc) {
						continue;
					}

					const npcName = npc[4] || '';
					if (!npcName || npcName.toLowerCase().indexOf(query) === -1) {
						continue;
					}

					const mapName = normalizeNaviMapName(npc[0]);
					const key = String(npcName || '').toLowerCase();
					if (!groupedNpcs[key]) {
						groupedNpcs[key] = {
							type: 'NPC',
							id: npc[1],
							classId: Number(npc[3]) || Number(npc[1]) || 0,
							npcType: npc[2],
							name: npcName,
							mapName: mapName,
							x: npc[6],
							y: npc[7],
							spawns: []
						};
					}

					groupedNpcs[key].spawns.push({
						mapName: mapName,
						x: Number(npc[6]) || 0,
						y: Number(npc[7]) || 0,
						displayName: getNavigationMapDisplayName(mapName)
					});
				}

				const npcKeys = Object.keys(groupedNpcs);
				for (let i = 0; i < npcKeys.length; i++) {
					const result = groupedNpcs[npcKeys[i]];
					result.spawns.sort(function (a, b) {
						return String(a.mapName || '').localeCompare(String(b.mapName || ''));
					});
					if (result.spawns.length) {
						result.mapName = result.spawns[0].mapName;
						result.x = result.spawns[0].x;
						result.y = result.spawns[0].y;
					}
					pushResult(result);
				}
			}

			// Search MOBs if type is ALL or MOB. Official Navigation groups one
			// monster in the left result list, then shows each spawn map on the
			// detail pane. Keep that same shape so selecting "Spore" does not show
			// a separate left-row for every map.
			if (type === 'ALL' || type === 'MOB') {
				// NaviMobTable structure: [map, unique_code, mob_type, mob_class, name, sprite, level, info]
				const mobTable = normalizeLuaTable(NaviMobTable);
				const groupedMobs = {};

				for (let i = 0; i < mobTable.length; i++) {
					const mob = mobTable[i];
					if (!mob) {
						continue;
					}

					const mobName = mob[4] || '';
					if (!mobName || mobName.toLowerCase().indexOf(query) === -1) {
						continue;
					}

					const mobClass = decodeNavigationMobClass(mob[3]);
					const amount = getNavigationMobAmount(mob[3]);
					const info = decodeNavigationMobInfo(mob[7]);
					const mapName = normalizeNaviMapName(mob[0]);
					const point = getDefaultNaviMapPoint(mapName) || { x: 0, y: 0 };
					const key = [mobClass, mobName].join(':');

					if (!groupedMobs[key]) {
						groupedMobs[key] = {
							type: 'MOB',
							id: mobClass,
							uniqueCode: mob[1],
							mobType: mob[2],
							name: mobName,
							mapName: mapName,
							x: point.x,
							y: point.y,
							sprite: mob[5] || '',
							level: Number(mob[6]) || 0,
							info: Number(mob[7]) || 0,
							race: info.race,
							raceName: info.raceName,
							size: info.size,
							sizeName: info.sizeName,
							element: info.element,
							elementLevel: info.elementLevel,
							elementName: info.elementName,
							spawns: []
						};
					}

					groupedMobs[key].spawns.push({
						mapName: mapName,
						x: point.x,
						y: point.y,
						amount: amount,
						rateLabel: getNavigationSpawnRateLabel(amount),
						displayName: getNavigationMapDisplayName(mapName)
					});
				}

				const groupedKeys = Object.keys(groupedMobs);
				for (let i = 0; i < groupedKeys.length; i++) {
					const result = groupedMobs[groupedKeys[i]];
					// Official Navigation keeps the spawn list stable by map order.
					// Do not sort by amount first, otherwise common maps jump above the
					// official-looking order shown in the classic result pane.
					result.spawns.sort(function (a, b) {
						return String(a.mapName || '').localeCompare(String(b.mapName || ''));
					});

					if (result.spawns.length) {
						result.mapName = result.spawns[0].mapName;
						result.x = result.spawns[0].x;
						result.y = result.spawns[0].y;
					}

					pushResult(result);
				}
			}

			for (let i = 0; i < results.length; i++) {
				if (results[i] && results[i].type === 'MAP') {
					results[i].monsters = DB.getNavigationMapMonsters(results[i].mapName);
				}
			}

			results.sort(function (a, b) {
				const aName = String(a.name || a.mapName || '').toLowerCase();
				const bName = String(b.name || b.mapName || '').toLowerCase();
				const aExact = aName === query ? 0 : 1;
				const bExact = bName === query ? 0 : 1;
				const aStarts = aName.indexOf(query) === 0 ? 0 : 1;
				const bStarts = bName.indexOf(query) === 0 ? 0 : 1;

				return (
					aExact - bExact ||
					aStarts - bStarts ||
					aName.length - bName.length ||
					aName.localeCompare(bName) ||
					String(a.mapName || '').localeCompare(String(b.mapName || ''))
				);
			});

			// Return the full list. Kafra/service NPC searches can legitimately
			// return more than 50 entries because the same service exists in many towns.
			return results;
		}

		static getNaviMapPoint(mapName) {
			return getDefaultNaviMapPoint(mapName);
		}

		static getNaviMapDisplayName(mapName) {
			return getNavigationMapDisplayName(mapName);
		}

		static getNaviLinkTable() {
			return applyNavigationLinkEra(
				normalizeLuaTable(NaviLinkTable),
				Configs.get('worldMapSettings', { episode: 98 })
			);
		}

		static getNaviLinkDistanceTable() {
			return applyNavigationDistanceEra(
				normalizeLuaTable(NaviLinkDistanceTable),
				Configs.get('worldMapSettings', { episode: 98 })
			);
		}

		static getNaviNpcDistanceTable() {
			return normalizeLuaTable(NaviNpcDistanceTable);
		}
	};
}

export function clearNavigationMobIndex() {
	navigationMobRowsByMap.clear();
}
