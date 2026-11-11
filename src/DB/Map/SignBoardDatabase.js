import TextEncoding from 'Utils/CodepageManager.js';
import { createDBLoadContext } from 'DB/Loaders/DBLoadContext.js';

export function createSignBoardDatabase(getUserCharpage) {
	const userStringDecoder = TextEncoding;
	const resolveUserCharpage =
		typeof getUserCharpage === 'function' ? getUserCharpage : () => getUserCharpage;
	const SignBoardTranslatedTable = {};
	let SignBoardTable = {};
	function loadSignBoardData(filename, callback, onEnd) {
		const { lua, loadFile, guard } = createDBLoadContext();
		callback = guard(callback);
		onEnd = guard(onEnd);

		loadFile(
			filename,
			async function (file) {
				try {
					console.log('Loading file "' + filename + '"...');

					// check if file is ArrayBuffer and convert to Uint8Array if necessary
					const buffer = file instanceof ArrayBuffer ? new Uint8Array(file) : file;

					// get context, a proxy. It will be used to interact with lua conveniently
					const ctx = lua.ctx;

					// create required functions in context
					ctx.AddSignBoardData = (key, translation) => {
						const decoded_key = key && key.length > 1 ? userStringDecoder.decode(key) : null;
						const decoded_translation =
							translation && translation.length > 1 ? userStringDecoder.decode(translation) : null;
						SignBoardTranslatedTable[decoded_key] = decoded_translation;
						return 1;
					};

					// mount file
					lua.mountFile('Sign_Data.lub', buffer);

					// execute file
					await lua.doFile('Sign_Data.lub');

					// create and execute our own main function
					lua.doStringSync(`
						function main_SignBoardData()
                            for key, value in pairs(SignBoardData) do
                                result, msg = AddSignBoardData(key, value)
                                if not result then
                                    return false, msg
                                end
                        	end
						end
                        main_SignBoardData()
					`);
				} catch (error) {
					console.error('[loadSignBoardData] Error: ', error);
				} finally {
					// release file from memmory
					lua.unmountFile('Sign_Data.lub');
					// call onEnd
					onEnd();
				}
			},
			onEnd
		);
	}

	function loadSignBoardList(filename, callback, onEnd) {
		const { lua, loadFile, guard } = createDBLoadContext();
		callback = guard(callback);
		onEnd = guard(onEnd);

		loadFile(
			filename,
			async function (file) {
				try {
					console.log('Loading file "' + filename + '"...');

					// create signboard list
					const signBoardList = [];

					// check if file is ArrayBuffer and convert to Uint8Array if necessary
					const buffer = file instanceof ArrayBuffer ? new Uint8Array(file) : file;

					// get context, a proxy. It will be used to interact with lua conveniently
					const ctx = lua.ctx;

					// create required functions in context
					ctx.AddSignBoard = (mapname, x, y, height, type, icon_location, description, color) => {
						const decoded_mapname =
							mapname && mapname.length > 1 ? userStringDecoder.decode(mapname) : null;
						const decoded_icon_location =
							icon_location && icon_location.length > 1 ? userStringDecoder.decode(icon_location) : null;
						const decoded_description =
							description && description.length > 1
								? userStringDecoder.decode(description, resolveUserCharpage())
								: null;
						const decoded_color = color && color.length > 1 ? userStringDecoder.decode(color) : null;

						signBoardList.push({
							mapname: decoded_mapname,
							x: x,
							y: y,
							height: height,
							type: type,
							icon_location: decoded_icon_location,
							description: decoded_description,
							color: decoded_color
						});

						return 1;
					};

					// mount file
					lua.mountFile('SignBoardList.lub', buffer);

					// execute file
					await lua.doFile('SignBoardList.lub');

					// create and execute our own main function
					lua.doStringSync(`
						function main_SignBoardList()
                            for key, value in pairs(SignBoardList) do
								local description = "";
								local color = "";
								if value[7] ~= nil then
									description = value[7];
								end
								if value[8] ~= nil then
									color = value[8];
								end
                                result, msg = AddSignBoard(value[1], value[2], value[3], value[4], value[5], value[6], description, color)
                                if not result then
                                    return false, msg
                                end
                        	end
						end
                        main_SignBoardList()
					`);

					SignBoardTable = preprocessSignboardData(signBoardList);
				} catch (error) {
					console.error('[loadSignBoardList] Error: ', error);
				} finally {
					// release file from memmory
					lua.unmountFile('SignBoardList.lub');
					// call onEnd
					onEnd();
				}
			},
			onEnd
		);
	}

	function preprocessSignboardData(signboardArray) {
		const signboardDict = {};

		for (const signboard of signboardArray) {
			const { mapname, x, y } = signboard;
			if (!signboardDict[mapname]) {
				signboardDict[mapname] = {};
			}
			if (!signboardDict[mapname][x]) {
				signboardDict[mapname][x] = {};
			}
			signboardDict[mapname][x][y] = signboard;
		}

		return signboardDict;
	}
	class SignBoardDatabase {
		static findSignboard(mapname, x, y, tolerance = 1) {
			const mapData = SignBoardTable[mapname];
			if (mapData) {
				for (const xKey in mapData) {
					if (Math.abs(x - xKey) <= tolerance) {
						const yData = mapData[xKey];
						for (const yKey in yData) {
							if (Math.abs(y - yKey) <= tolerance) {
								return yData[yKey];
							}
						}
					}
				}
			}
			return null;
		}

		static getAllSignboardsForMap(mapname) {
			return SignBoardTable[mapname] || null;
		}

		static getTranslatedSignBoard(description) {
			return SignBoardTranslatedTable[description] || description;
		}
	}
	return { SignBoardDatabase, loadSignBoardData, loadSignBoardList };
}
