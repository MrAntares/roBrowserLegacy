import TextEncoding from 'Utils/CodepageManager.js';
import { createDBLoadContext } from 'DB/Loaders/DBLoadContext.js';
import WorldMap from 'DB/Map/WorldMap.js';
import TownInfo from 'DB/TownInfo.js';
import PrivateAirship from 'DB/Map/PrivateAirship.js';
import Client from 'Core/Client.js';

export function createMapLoaders(getUserCharpage) {
	const userStringDecoder = TextEncoding;
	const resolveUserCharpage = typeof getUserCharpage === 'function' ? getUserCharpage : () => getUserCharpage;
	function loadWorldMapInfo(basePath, onEnd) {
		const { lua } = createDBLoadContext();

		const files = ['worldviewdata_language.lub', 'worldviewdata_list.lub', 'worldviewdata_table.lub'];

		const dirPath = basePath.endsWith('/') ? basePath : basePath + '/';
		const loadedBuffers = [];

		// Recursive loader to ensure sequential loading
		function loadNext(index) {
			if (index >= files.length) {
				processWorldMapLua();
				return;
			}

			const fullPath = dirPath + files[index];
			console.log('Loading file "' + fullPath + '"...');

			Client.loadFile(
				fullPath,
				function (data) {
					loadedBuffers.push({ name: files[index], data: data });
					loadNext(index + 1);
				},
				function () {
					console.error('[loadWorldMapInfo] - Failed to load ' + fullPath);
					// If a file fails, we might not be able to generate the map, but we continue to avoid hanging
					if (onEnd) {
						onEnd();
					}
				}
			);
		}

		async function processWorldMapLua() {
			try {
				const ctx = lua.ctx;

				// Function to add a World Category (e.g., Midgard)
				ctx.AddWorldMapCategory = (id, name, tableKey) => {
					const decodedName = userStringDecoder.decode(name);
					const decodedId = userStringDecoder.decode(id);
					const decodedTableKey = userStringDecoder.decode(tableKey);

					WorldMap.push({
						id: decodedId || decodedTableKey, // fallback to table name if id missing
						ep_from: 0,
						ep_to: 99,
						name: decodedName,
						maps: [],
						_tableKey: decodedTableKey // Internal use for mapping maps to this world
					});
					return 1;
				};

				// Function to add a Map to a specific World
				ctx.AddMapToWorld = (
					dgIndex,
					worldTableKey,
					rswName,
					left,
					top,
					right,
					bottom,
					nameDisplay,
					level,
					mapType
				) => {
					const decodedTableKey = userStringDecoder.decode(worldTableKey);
					let decodedRsw = userStringDecoder.decode(rswName);
					const decodedName = userStringDecoder.decode(nameDisplay, resolveUserCharpage());
					const decodedLevel = level ? userStringDecoder.decode(level) : '';

					// Find the world this map belongs to
					const world = WorldMap.find(w => w._tableKey === decodedTableKey);

					if (mapType === 1) {
						const originalMap = world.maps.find(m => m.index === dgIndex && m.type === 0);
						if (originalMap) {
							decodedRsw = originalMap.id;
						} // Copy rsw name
					}

					if (world) {
						// clean .rsw extension for ID
						const mapId = decodedRsw.toLowerCase().replace('.rsw', '').replace('.gat', '');

						world.maps.push({
							index: dgIndex,
							id: mapId,
							ep_from: 0,
							ep_to: 99,
							name: decodedName,
							top: top,
							left: left,
							width: right - left, // Calculate width
							height: bottom - top, // Calculate height
							moblevel: decodedLevel,
							type: mapType
						});
					}
					return 1;
				};

				// Mount and execute all files
				for (let i = 0; i < loadedBuffers.length; i++) {
					const f = loadedBuffers[i];
					const buffer = f.data instanceof ArrayBuffer ? new Uint8Array(f.data) : f.data;
					lua.mountFile(f.name, buffer);
					await lua.doFile(f.name);
				}

				// Clean Hardcoded DB Safely
				WorldMap.splice(0, WorldMap.length);

				// Execute the processing script
				// Logic: Iterate over World_List -> Get Table Name -> Iterate over that Table -> Extract Data
				lua.doStringSync(`
					function main_worldmap_process()
						if World_List == nil then return end

						for _, worldData in ipairs(World_List) do
							-- worldData structure: { Name, MainTableName, DungeonTableName, BgImage }
							local worldName = worldData[1]
							local mainTableStr = worldData[2]
							local dgTableStr = worldData[3]
							local resourceStr = worldData[4]

							-- Add the world category
							AddWorldMapCategory(resourceStr, worldName, mainTableStr)

							-- Fetch the actual table using the string name (global variable)
							local mapTable = _G[mainTableStr]

							if mapTable ~= nil then
								for _, mapEntry in ipairs(mapTable) do
									-- mapEntry structure: { Index, "map.rsw", left, top, right, bottom, LocalizedName, ... }
									local index = mapEntry[1]
									local rswName = mapEntry[2]
									local left = mapEntry[3]
									local top = mapEntry[4]
									local right = mapEntry[5]
									local bottom = mapEntry[6]
									local nameDisplay = mapEntry[7] or "" -- This is resolved from WORLD_MSGID by Lua automatically
									local level = mapEntry[8] or 0

									AddMapToWorld(index, mainTableStr, rswName, left, top, right, bottom, nameDisplay, level, 0)
								end
							end

							mapTable = _G[dgTableStr]

							if mapTable ~= nil then
								for _, mapEntry in ipairs(mapTable) do
									local index = mapEntry[1]
									local left = mapEntry[2]
									local top = mapEntry[3]
									local right = mapEntry[4]
									local bottom = mapEntry[5]
									local nameDisplay = mapEntry[6] or ""
									local level = mapEntry[7] or 0

									AddMapToWorld(index, mainTableStr, "", left, top, right, bottom, nameDisplay, level, 1)
								end
							end

						end
					end
					main_worldmap_process()
				`);

				// Clean up internal keys
				WorldMap.forEach(w => delete w._tableKey);
			} catch (e) {
				console.error('[loadWorldMapInfo] Lua Error:', e);
			} finally {
				// Unmount files
				loadedBuffers.forEach(f => lua.unmountFile(f.name));
				if (onEnd) {
					onEnd();
				}
			}
		}

		// Start the chain
		loadNext(0);
	}

	function loadTownInfoFile(filename, callback, onEnd) {
		const { lua } = createDBLoadContext();

		Client.loadFile(
			filename,
			async function (file) {
				console.log('Loading file "' + filename + '"...');
				try {
					const buffer = file instanceof ArrayBuffer ? new Uint8Array(file) : file;
					// get context, a proxy. It will be used to interact with lua conveniently
					const ctx = lua.ctx;

					// create AddTownInfo required functions in context
					ctx.AddTownInfo = function AddTownInfo(mapName, name, X, Y, TYPE) {
						mapName = userStringDecoder.decode(mapName);
						TownInfo[mapName] = [];
						TownInfo[mapName].push({
							Name: userStringDecoder.decode(name, resolveUserCharpage()),
							X: X,
							Y: Y,
							Type: TYPE
						});
					};
					// mount file
					lua.mountFile(filename, buffer);
					// execute file
					await lua.doFile(filename);
					// execute main lua function
					lua.doStringSync('main()');
				} catch (error) {
					console.error('[loadTownInfoFile] Error: ', error);
				} finally {
					// release file from memmory
					lua.unmountFile(filename);
					// call onEnd
					onEnd();
				}
			},
			onEnd
		);
	}

	function loadPrivateAirship(filename, callback, onEnd) {
		const { lua } = createDBLoadContext();

		Client.loadFile(
			filename,
			async function (file) {
				console.log('Loading file "' + filename + '"...');
				let success = false;
				try {
					const buffer = file instanceof ArrayBuffer ? new Uint8Array(file) : file;
					const ctx = lua.ctx;
					PrivateAirship.reset();
					ctx.InsertStartableMap = mapName => {
						PrivateAirship.addStartableMap(userStringDecoder.decode(mapName));
						return 1;
					};
					ctx.InsertEndableMap = mapName => {
						PrivateAirship.addEndableMap(userStringDecoder.decode(mapName));
						return 1;
					};
					ctx.InsertNeedItem = itemId => {
						PrivateAirship.addNeedItem(itemId);
						return 1;
					};
					lua.mountFile(filename, buffer);
					await lua.doFile(filename);
					lua.doStringSync('main()');
					success = PrivateAirship.isLoaded();
				} catch (error) {
					console.error('[loadPrivateAirship] Error: ', error);
					PrivateAirship.reset();
				} finally {
					lua.unmountFile(filename);
					onEnd(success);
				}
			},
			() => onEnd(false)
		);
	}
	return { loadWorldMapInfo, loadTownInfoFile, loadPrivateAirship };
}
