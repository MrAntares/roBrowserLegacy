import TextEncoding from 'Utils/CodepageManager.js';
import { lua } from 'DB/Loaders/LuaRuntime.js';
import SC from 'DB/Status/StatusConst.js';
import StatusInfo from 'DB/Status/StatusInfo.js';
import Client from 'Core/Client.js';

const userStringDecoder = TextEncoding;

export function loadStateIconInfo(basePath, callback, onEnd, getUserCharpage) {
	const resolveUserCharpage = typeof getUserCharpage === 'function' ? getUserCharpage : () => getUserCharpage;

	const files = ['efstids.lub', 'stateiconimginfo.lub', 'stateiconinfo.lub'];

	const loadedBuffers = [];

	const dirPath = basePath.endsWith('/') ? basePath : basePath + '/';

	function loadNext(index) {
		if (index >= files.length) {
			processLuaData();
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
				console.error('[loadStateIconInfo] - Failed to load ' + fullPath);
				if (onEnd) {
					onEnd();
				}
			}
		);
	}

	async function processLuaData() {
		try {
			const ctx = lua.ctx;

			ctx.mergeSC = (key, value) => {
				// Keys might be passed as Uint8Array from Lua by Wasmoon
				const safeKey =
					typeof key === 'string' ? key : key instanceof Uint8Array ? userStringDecoder.decode(key) : key;

				if (
					typeof safeKey === 'string' &&
					typeof value === 'number' &&
					value >= 0 &&
					safeKey.startsWith('EFST_')
				) {
					const jsKey = safeKey.replace('EFST_', '');
					SC[jsKey] = value;
				}

				// Add BLANK back if it was cleared and not defined in LUB
				if (!SC.BLANK) {
					SC.BLANK = -1;
				}
				return 1;
			};

			ctx.SetStatusInfo = (id, haveTimeLimit, posTimeLimitStr) => {
				if (!StatusInfo[id]) {
					StatusInfo[id] = {};
				}
				StatusInfo[id].haveTimeLimit = haveTimeLimit;
				StatusInfo[id].posTimeLimitStr = posTimeLimitStr;
				StatusInfo[id].descript = [];
				return 1;
			};

			ctx.AddStatusDesc = (id, desc, r, g, b) => {
				if (!StatusInfo[id]) {
					return 0;
				}
				const text = userStringDecoder.decode(desc, resolveUserCharpage());
				let color = null;
				if (r >= 0 && g >= 0 && b >= 0) {
					color = `rgb(${r}, ${g}, ${b})`;
				}
				StatusInfo[id].descript.push([text, color]);
				return 1;
			};

			ctx.SetStatusIcon = (id, iconName) => {
				const icon = userStringDecoder.decode(iconName);
				if (!StatusInfo[id]) {
					StatusInfo[id] = { descript: [] };
				}
				StatusInfo[id].icon = icon;
				return 1;
			};

			for (let i = 0; i < loadedBuffers.length; i++) {
				const f = loadedBuffers[i];
				const buffer = f.data instanceof ArrayBuffer ? new Uint8Array(f.data) : f.data;
				lua.mountFile(f.name, buffer);
				await lua.doFile(f.name);

				// This prevents the 'table index is nil' crash in stateiconimginfo.lub.
				// return SC.BLANK on nil
				if (f.name === 'efstids.lub') {
					await lua.doString(`
							if EFST_IDs then
								__EFST_IDS_ORIGINAL = EFST_IDs 

								EFST_IDs = setmetatable({}, {
									__index = function(t, k)
										local id = __EFST_IDS_ORIGINAL[k]
										return id ~= nil and id or -1
									end
								})
							end
						`);
				}
			}

			lua.doStringSync(`
					function extract_status_info()
						-- Sync StatusConst (SC) with the full list of EFST_IDs from the original table
						if type(__EFST_IDS_ORIGINAL) == "table" then
							for k, v in pairs(__EFST_IDS_ORIGINAL) do
								if type(k) == "string" and type(v) == "number" then
									mergeSC(k, v)
								end
							end
							
							local mt = getmetatable(__EFST_IDS_ORIGINAL)
							if mt and type(mt.__index) == "table" then
								for k, v in pairs(mt.__index) do
									if type(k) == "string" and type(v) == "number" then
										mergeSC(k, v)
									end
								end
							end
						end

						-- Process Basic Info & Descriptions
						if StateIconList ~= nil then
							for id, info in pairs(StateIconList) do
								SetStatusInfo(id, info.haveTimeLimit, info.posTimeLimitStr)

								if info.descript ~= nil then
									for _, descLine in ipairs(info.descript) do
										local text = descLine[1]
										local colorData = descLine[2]
										local r, g, b = -1, -1, -1

										if type(colorData) == "table" and #colorData >= 3 then
											r = colorData[1]
											g = colorData[2]
											b = colorData[3]
										end

										AddStatusDesc(id, text, r, g, b)
									end
								end
							end
						end

						-- Process Icons 
						if StateIconImgList ~= nil then
							for priorityId, list in pairs(StateIconImgList) do 
								if type(list) == "table" then
									for id, iconName in pairs(list) do
										SetStatusIcon(id, iconName)
									end
								end
							end
						end
					end

					extract_status_info()
				`);
		} catch (e) {
			console.error('[loadStateIconInfo] Lua Error:', e);
		} finally {
			loadedBuffers.forEach(f => lua.unmountFile(f.name));
			if (onEnd) {
				onEnd();
			}
		}
	}

	loadNext(0);
}
