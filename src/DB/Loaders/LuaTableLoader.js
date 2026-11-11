import Client from 'Core/Client.js';
import TextEncoding from 'Utils/CodepageManager.js';
import { lua } from 'DB/Loaders/LuaRuntime.js';

export function createLuaTableLoaders(getUserCharpage, grfCharpage) {
	const userStringDecoder = TextEncoding;
	const resolveUserCharpage = typeof getUserCharpage === 'function' ? getUserCharpage : () => getUserCharpage;
	function loadLuaTable(file_list, table_name, callback, onEnd, contextFunc, useCharPage = true) {
		const instance = lua;
		const id_filename = file_list[0];
		const value_table_filename = file_list[1];
		let finished = false;
		let idMounted = false;
		let valueMounted = false;
		function finish(success) {
			if (finished) return;
			finished = true;
			if (valueMounted) instance.unmountFile(value_table_filename);
			if (idMounted) instance.unmountFile(id_filename);
			if (onEnd) onEnd(success);
		}

		try {
			console.log('Loading file "' + id_filename + '"...');
			Client.loadFile(
				id_filename,
				async function (file) {
					if (finished) return;
					try {
						// check if file is ArrayBuffer and convert to Uint8Array if necessary
						const buffer = file instanceof ArrayBuffer ? new Uint8Array(file) : file;
						// mount file
						instance.mountFile(id_filename, buffer);
						idMounted = true;
						// execute file
						await instance.doFile(id_filename);
						loadValueTable();
					} catch (hException) {
						console.error(`(${id_filename}) error: `, hException);
						finish(false);
					}
				},
				() => finish(false)
			);

			function loadValueTable() {
				console.log('Loading file "' + value_table_filename + '"...');
				Client.loadFile(
					value_table_filename,
					async function (file) {
						if (finished) return;
						try {
							// check if file is ArrayBuffer and convert to Uint8Array if necessary
							const buffer = file instanceof ArrayBuffer ? new Uint8Array(file) : file;
							// mount file
							instance.mountFile(value_table_filename, buffer);
							valueMounted = true;
							// execute file
							await instance.doFile(value_table_filename);
							parseTable();
						} catch (hException) {
							console.error(`(${value_table_filename}) error: `, hException);
							finish(false);
						}
					},
					() => finish(false)
				);
			}

			function parseTable() {
				// declare the table object
				const table = {};

				// get context
				const ctx = instance.ctx;
				const charpage = useCharPage ? resolveUserCharpage() : grfCharpage;

				// create context function
				ctx.addKeyAndValueToTable = (key, value) => {
					table[key] = userStringDecoder.decode(value, charpage);
					return 1;
				};

				// used in some specific cases like skilldescript.lub
				ctx.addKeyAndMoreValuesToTable = (key, value) => {
					if (!table[key]) {
						table[key] = '';
					}
					table[key] += userStringDecoder.decode(value, charpage) + '\n';
					return 1;
				};

				// create and execute a wrapper lua code
				// this way we let webassembly handle the code and still can get the table data
				instance.doStringSync(`
							function main_table()
								for key, value in pairs(${table_name}) do
									if type(value) == "table" then
										for k, v in pairs(value) do
											result, msg = addKeyAndMoreValuesToTable(key, v)
										end
									else
										result, msg = addKeyAndValueToTable(key, value)
									end
									if not result then
										return false, msg
									end
								end
								return true, "good"
							end
							main_table()
						`);

				if (typeof contextFunc === 'function') {
					contextFunc();
				}

				// return table
				callback.call(null, table);
				finish(true);
			}
		} catch (e) {
			console.error('error: ', e);
			finish(false);
		}
	}

	/**
	 * Extracts a variable from a Lua file and converts it to a JavaScript value
	 * @param {String} file_path - Path to the Lua file
	 * @param {String} variable_name - Name of the variable to extract
	 * @param {function} callback - Function to run with the extracted value
	 * @param {function} onEnd - Function to run once the process is complete
	 *
	 * @author guicaulada
	 */
	function loadLuaValue(file_path, variable_name, callback, onEnd) {
		const instance = lua;
		let settled = false;
		try {
			console.log('Loading file "' + file_path + '"...');
			Client.loadFile(
				file_path,
				async function (file) {
					if (settled) return;
					settled = true;
					let mounted = false;
					try {
						// Check if file is ArrayBuffer and convert to Uint8Array if necessary
						const buffer = file instanceof ArrayBuffer ? new Uint8Array(file) : file;

						// Mount file
						instance.mountFile(file_path, buffer);
						mounted = true;

						// Execute file
						await instance.doFile(file_path);

						// Get context
						const ctx = instance.ctx;

						// Initialize result variable
						let result = null;

						// Add key-value pairs to objects at any nesting level
						ctx.extractValue = value => {
							result = JSON.parse(userStringDecoder.decode(value));
						};

						// Create and execute a wrapper Lua code to extract the variable
						instance.doStringSync(
							String.raw`
								local function escape_str(str)
									return str:gsub("\\", "\\\\"):gsub("\"", "\\\"")
								end

								local function to_json(value)
									if type(value) == "boolean" then
										return tostring(value)
									elseif type(value) == "number" then
										return value
									elseif type(value) == "string" then
										return "\"" .. escape_str(value) .. "\""
									elseif type(value) == "table" then
										-- pairs() visits keys in no set order, so count them rather than
										-- expect 1, 2, 3...: an array is keys 1..n with none missing
										local is_array = true
										local count, highest = 0, 0
										for k, _ in pairs(value) do
											if type(k) ~= "number" or k < 1 or k % 1 ~= 0 then
												is_array = false
												break
											end
											count = count + 1
											highest = math.max(highest, k)
										end
										is_array = is_array and count == highest

										local result = {}
										if is_array then
											for _, v in ipairs(value) do
												table.insert(result, to_json(v))
											end
											return "[" .. table.concat(result, ",") .. "]"
										else
											for k, v in pairs(value) do
												if type(k) == "string" then
													table.insert(result, "\"" .. escape_str(k) .. "\":" .. to_json(v))
												elseif type(k) == "number" then
													table.insert(result, "\"" .. tostring(k) .. "\":" .. to_json(v))
												end
											end
											return "{" .. table.concat(result, ",") .. "}"
										end
									else
										return "null"
									end
								end
							` +
								`
								extractValue(to_json(${variable_name}))
							`
						);

						// Unmount file
						instance.unmountFile(file_path);
						mounted = false;

						// Return the extracted value
						callback.call(null, result);
					} catch (hException) {
						console.error(`(${file_path}) error: `, hException);
					} finally {
						if (mounted) instance.unmountFile(file_path);
						if (onEnd) {
							onEnd.call();
						}
					}
				},
				function () {
					if (settled) return;
					settled = true;
					if (onEnd) onEnd.call();
				}
			);
		} catch (e) {
			if (settled) return;
			settled = true;
			console.error('error: ', e);
			if (onEnd) {
				onEnd.call();
			}
		}
	}

	return { loadLuaTable, loadLuaValue };
}
