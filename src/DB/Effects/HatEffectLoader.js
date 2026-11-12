import TextEncoding from 'Utils/CodepageManager.js';
import { lua } from 'DB/Loaders/LuaRuntime.js';
import Client from 'Core/Client.js';

const userStringDecoder = TextEncoding;
const HatEffectID = {};
const HatEffectInfo = {};
const FootPrintEffectInfo = {};

export function getHatResource(id) {
	return HatEffectInfo[id] || null;
}

export function loadHatEffectInfo(luaPath, onEnd) {
	const basePath = luaPath + 'hateffectinfo/';
	const idFile = basePath + 'hateffectids.lub';
	const infoFile = basePath + 'hateffectinfo.lub';

	Client.loadFile(
		idFile,
		async function (idBuf) {
			const ctx = lua.ctx;

			ctx.MessageBox = function (msg) {
				console.warn('[HatEffect] ' + msg);
				return 1;
			};

			function decodeLuaString(v) {
				return userStringDecoder.decode(v);
			}

			ctx.__js_hat_effect_id = function (key, value) {
				HatEffectID[decodeLuaString(key)] = Number(value);
				return 1;
			};

			ctx.__js_hat_effect_info = function (id, info) {
				id = Number(id);

				HatEffectInfo[id] = {
					resourceFileName: info.resourceFileName ? decodeLuaString(info.resourceFileName) : null,

					hatEffectID: info.hatEffectID ? Number(info.hatEffectID) : 0,
					hatEffectPos: info.hatEffectPos || 0,
					hatEffectPosX: info.hatEffectPosX || 0,

					isAttachedHead: !!info.isAttachedHead,
					isIgnoreRiding: !!info.isIgnoreRiding,
					isRenderBeforeCharacter: !!info.isRenderBeforeCharacter,

					isAdjustPositionWhenShrinkState: !!info.isAdjustPositionWhenShrinkState,
					isAdjustSizeWhenShrinkState: !!info.isAdjustSizeWhenShrinkState,

					footprint: !!info.footprint
				};
				return 1;
			};

			ctx.__js_footprint_effect_info = function (id, info) {
				id = Number(id);

				FootPrintEffectInfo[id] = {
					type: info.Type || 0,

					pngLeft: info.PngFile_Left ? decodeLuaString(info.PngFile_Left) : null,
					pngRight: info.PngFile_Right ? decodeLuaString(info.PngFile_Right) : null,

					strBottomLeft: info.StrFile_Bottom_Left ? decodeLuaString(info.StrFile_Bottom_Left) : null,
					strBottomRight: info.StrFile_Bottom_Right ? decodeLuaString(info.StrFile_Bottom_Right) : null,

					strTopLeft: info.StrFile_Top_Left ? decodeLuaString(info.StrFile_Top_Left) : null,
					strTopRight: info.StrFile_Top_Right ? decodeLuaString(info.StrFile_Top_Right) : null,

					scaleBottom: info.Scale_Bottom ?? 0,
					scaleTop: info.Scale_Top ?? 0,
					heightTop: info.Height_Top ?? 0,

					stride: info.Stride ?? 50,
					gap: info.Gap ?? 2,
					isAdjustAngle: !!info.IsAdjustAngle
				};

				return 1;
			};

			// Load INFO file (AFTER IDs)
			async function LoadHatEffectInfo() {
				return Client.loadFile(infoFile, async function (infoBuf) {
					try {
						lua.mountFile(
							'hateffectinfo.lub',
							infoBuf instanceof ArrayBuffer ? new Uint8Array(infoBuf) : infoBuf
						);
						await lua.doFile('hateffectinfo.lub');
						await lua.doString(`
							if hatEffectTable ~= nil then
								for id, info in pairs(hatEffectTable) do
									__js_hat_effect_info(id, info)
								end
							end
						`);
						await LoadFootPrint();
					} catch (e) {
						console.error('[HatEffect] Info load error', e);
					} finally {
						lua.unmountFile('hateffectinfo.lub');
					}
				});
			}

			// Load FOOTPRINT file (AFTER Info)
			async function LoadFootPrint() {
				return Client.loadFile(basePath + 'footprinteffectinfo.lub', async function (buf) {
					try {
						lua.mountFile(
							'footprinteffectinfo.lub',
							buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf
						);
						await lua.doFile('footprinteffectinfo.lub');
						await lua.doString(`
							if FootPrintEffectTable ~= nil then
								for id, info in pairs(FootPrintEffectTable) do
									__js_footprint_effect_info(id, info)
								end
							end
						`);
					} catch (e) {
						console.error('[FootPrintEffect] load error', e);
					} finally {
						lua.unmountFile('footprinteffectinfo.lub');
					}
				});
			}

			try {
				lua.mountFile('hateffectids.lub', idBuf instanceof ArrayBuffer ? new Uint8Array(idBuf) : idBuf);
				await lua.doFile('hateffectids.lub');
				await lua.doString(`
					if HatEFID ~= nil then
						for k, v in pairs(HatEFID) do
							__js_hat_effect_id(k, v)
						end
					end
				`);

				await LoadHatEffectInfo();
			} catch (e) {
				console.error('[HatEffect] ID load error', e);
				return;
			} finally {
				lua.unmountFile('hateffectids.lub');
			}

			// All files loaded
			if (typeof onEnd === 'function') {
				onEnd();
			}
		},
		onEnd
	);
}
