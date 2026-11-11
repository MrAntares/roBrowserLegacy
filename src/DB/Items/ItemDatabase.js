import TextEncoding from 'Utils/CodepageManager.js';
import { createDBLoadContext } from 'DB/Loaders/DBLoadContext.js';
import ItemTable from 'DB/Items/ItemTable.js';
import RandomOption from 'DB/Items/ItemRandomOptionTable.js';

const defaultItems = Object.fromEntries(Object.entries(ItemTable).map(([id, item]) => [id, { ...item }]));

function clearTable(table) {
	for (const key of Object.keys(table)) delete table[key];
	if (Array.isArray(table)) table.length = 0;
}

export function createItemDatabase(DB, getUserCharpage, MsgStringTable) {
	const userStringDecoder = TextEncoding;
	const resolveUserCharpage = typeof getUserCharpage === 'function' ? getUserCharpage : () => getUserCharpage;
	const buyingStoreItemList = new Array();
	function parseBuyingStoreItem(_index, key) {
		buyingStoreItemList.push(parseInt(key, 10));
	}
	const LaphineSysTable = [];
	const LaphineUpgTable = [];
	const ItemDBNameTbl = {};
	const ItemReformTable = { ReformInfo: {}, ReformItemList: {} };
	const EnchantListTable = {};
	const unknownItem = {
		unidentifiedDisplayName: 'Unknown Item',
		unidentifiedResourceName: '\xbb\xe7\xb0\xfa',
		unidentifiedDescriptionName: ['...'],
		identifiedDisplayName: 'Unknown Item',
		identifiedResourceName: '\xbb\xe7\xb0\xfa',
		identifiedDescriptionName: ['...'],
		slotCount: 0,
		ClassNum: 0
	};
	function resetItemData() {
		for (const id of Object.keys(ItemTable)) {
			if (!Object.prototype.hasOwnProperty.call(defaultItems, id)) delete ItemTable[id];
		}
		for (const [id, defaults] of Object.entries(defaultItems)) {
			if (!ItemTable[id] || typeof ItemTable[id] !== 'object') ItemTable[id] = {};
			clearTable(ItemTable[id]);
			Object.assign(ItemTable[id], defaults);
		}
		for (const table of [
			buyingStoreItemList,
			LaphineSysTable,
			LaphineUpgTable,
			ItemDBNameTbl,
			ItemReformTable.ReformInfo,
			ItemReformTable.ReformItemList,
			EnchantListTable
		])
			clearTable(table);
	}
	function loadItemInfo(filename, callback, onEnd) {
		const { lua, loadFile, guard } = createDBLoadContext();
		callback = guard(callback);
		onEnd = guard(onEnd);

		const loadPromise = new Promise((resolve, reject) => {
			loadFile(filename, resolve, reject);
		});

		loadPromise
			.then(async file => {
				let wasSuccessful = false;
				try {
					console.log('Loading file "' + filename + '"...');
					// check if file is ArrayBuffer and convert to Uint8Array if necessary
					const buffer = file instanceof ArrayBuffer ? new Uint8Array(file) : file;
					// get context, a proxy. It will be used to interact with lua conveniently
					const ctx = lua.ctx;
					const userCharpage = resolveUserCharpage();

					// create itemInfo required functions in context
					ctx.AddItem = (
						ItemID,
						unidentifiedDisplayName,
						unidentifiedResourceName,
						identifiedDisplayName,
						identifiedResourceName,
						slotCount,
						ClassNum
					) => {
						ItemTable[ItemID] = {
							...(typeof ItemTable[ItemID] === 'object' && ItemTable[ItemID]),
							unidentifiedDisplayName: userStringDecoder.decode(unidentifiedDisplayName, userCharpage),
							unidentifiedResourceName: userStringDecoder.decode(unidentifiedResourceName),
							identifiedDisplayName: userStringDecoder.decode(identifiedDisplayName, userCharpage),
							identifiedResourceName: userStringDecoder.decode(identifiedResourceName),
							unidentifiedDescriptionName: [],
							identifiedDescriptionName: [],
							EffectID: null,
							costume: null,
							PackageID: null,
							slotCount: slotCount,
							ClassNum: ClassNum
						};
						return 1;
					};
					ctx.AddItemUnidentifiedDesc = (ItemID, v) => {
						ItemTable[ItemID].unidentifiedDescriptionName.push(userStringDecoder.decode(v, userCharpage));
						return 1;
					};
					ctx.AddItemIdentifiedDesc = (ItemID, v) => {
						ItemTable[ItemID].identifiedDescriptionName.push(userStringDecoder.decode(v, userCharpage));
						return 1;
					};
					ctx.AddItemEffectInfo = (ItemID, EffectID) => {
						ItemTable[ItemID].EffectID = EffectID;
						return 1;
					};
					ctx.AddItemIsCostume = (ItemID, costume) => {
						ItemTable[ItemID].costume = costume;
						return 1;
					};
					ctx.AddItemPackageID = (ItemID, PackageID) => {
						ItemTable[ItemID].PackageID = PackageID;
						return 1;
					};
					// mount file
					lua.mountFile(filename, buffer);
					// execute file
					await lua.doFile(filename);
					// create and execute our own main function
					// this is necessary because some servers has main function on itemInfo.lub and others load it from itemInfo_f.lub
					// doing this way we avoid to have to load the other file
					// on my tests dont care if the main() is on itemInfo.lub or itemInfo_f.lub the content is always the same
					lua.doStringSync(`
						function main_item()
							_processedItems = _processedItems or {} 
							for ItemID, DESC in pairs(tbl) do
								if not _processedItems[ItemID] and #DESC.identifiedDescriptionName > 0 then
									_processedItems[ItemID] = true 
									result, msg = AddItem(ItemID, DESC.unidentifiedDisplayName, DESC.unidentifiedResourceName, DESC.identifiedDisplayName, DESC.identifiedResourceName, DESC.slotCount, DESC.ClassNum)
									if not result then
										return false, msg
									end
									for k, v in pairs(DESC.unidentifiedDescriptionName) do
										result, msg = AddItemUnidentifiedDesc(ItemID, v)
										if not result then
											return false, msg
										end
									end
									for k, v in pairs(DESC.identifiedDescriptionName) do
										result, msg = AddItemIdentifiedDesc(ItemID, v)
										if not result then
											return false, msg
										end
									end
									if nil ~= DESC.EffectID then
										result, msg = AddItemEffectInfo(ItemID, DESC.EffectID)
										if not result then
											return false, msg
										end
									end
									if nil ~= DESC.costume then
										result, msg = AddItemIsCostume(ItemID, DESC.costume)
										if not result then
											return false, msg
										end
									end
									if nil ~= DESC.PackageID then
										result, msg = AddItemPackageID(ItemID, DESC.PackageID)
										if not result then
											return false, msg
										end
									end
								end
							end
							return true, "good"
							end
						main_item()
						`);
					wasSuccessful = true;
				} catch (error) {
					console.error('[loadItemInfo] Error: ', error);
				} finally {
					// release file from memmory
					lua.unmountFile(filename);
					// call onEnd
					onEnd(wasSuccessful);
				}
			})
			.catch(error => {
				if (typeof onEnd === 'function') {
					onEnd(false);
				}
			});
	}

	function loadLaphineSysFile(filename, callback, onEnd) {
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
					const userCharpage = resolveUserCharpage();

					// create required functions in context
					ctx.AddLaphineSysItem = (
						key,
						ItemID,
						NeedCount,
						NeedRefineMin,
						NeedRefineMax,
						NeedSource_String
					) => {
						const decoded_key = key && key.length > 1 ? userStringDecoder.decode(key) : null;
						const decoded_NeedSource_String =
							NeedSource_String && NeedSource_String.length > 1
								? userStringDecoder.decode(NeedSource_String, userCharpage)
								: '';
						LaphineSysTable[decoded_key] = {
							ItemID: ItemID,
							NeedCount: NeedCount,
							NeedRefineMin: NeedRefineMin,
							NeedRefineMax: NeedRefineMax,
							SourceItems: new Array(),
							NeedSource_String: decoded_NeedSource_String
						};
						return 1;
					};

					ctx.AddLaphineSysSourceItem = (key, name, count, ItemID) => {
						const decoded_key = key && key.length > 1 ? userStringDecoder.decode(key) : null;
						const decoded_name = name && name.length > 1 ? userStringDecoder.decode(name) : '';
						LaphineSysTable[decoded_key].SourceItems.push({
							name: decoded_name,
							count: count,
							id: ItemID
						});
						return 1;
					};

					// mount file
					lua.mountFile('lapineddukddakbox.lub', buffer);

					// execute file
					await lua.doFile('lapineddukddakbox.lub');

					// create and execute our own main function
					lua.doStringSync(`
						function main_laphynesys()
                            for key, value in pairs(tblLapineDdukddakBox.sources) do
                                result, msg = AddLaphineSysItem(key, value.ItemID, value.NeedCount, value.NeedRefineMin, value.NeedRefineMax, value.NeedSource_String)
                                if not result then
                                    return false, msg
                                end
                                for _, item in ipairs(value.SourceItems) do
                                    result, msg = AddLaphineSysSourceItem(key, item[1], item[2], item[3])
                                    if not result then
                                        return false, msg
                                    end

                                end
                            end
                        end
                        main_laphynesys()
					`);
				} catch (error) {
					console.error('[loadLaphineSysFile] Error: ', error);
				} finally {
					// release file from memmory
					lua.unmountFile('lapineddukddakbox.lub');
					// call onEnd
					onEnd();
				}
			},
			onEnd
		);
	}

	function loadLaphineUpgFile(filename, callback, onEnd) {
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
					const userCharpage = resolveUserCharpage();

					// create required functions in context
					ctx.AddLaphineUpgradeItem = (
						key,
						ItemID,
						NeedCount,
						NeedRefineMin,
						NeedRefineMax,
						NeedSource_String,
						NeedOptionNumMin,
						NotSocketEnchantItem
					) => {
						const decoded_key = key && key.length > 1 ? userStringDecoder.decode(key) : null;
						const decoded_NeedSource_String =
							NeedSource_String && NeedSource_String.length > 1
								? userStringDecoder.decode(NeedSource_String, userCharpage)
								: '';

						LaphineUpgTable[decoded_key] = {
							ItemID: ItemID,
							NeedCount: NeedCount,
							NeedRefineMin: NeedRefineMin,
							NeedRefineMax: NeedRefineMax,
							NeedOptionNumMin: NeedOptionNumMin,
							NotSocketEnchantItem: NotSocketEnchantItem,
							TargetItems: new Array(),
							NeedSource_String: decoded_NeedSource_String
						};
						return 1;
					};

					ctx.AddLaphineUpgradeTargetItem = (key, name, ItemID) => {
						const decoded_key = key && key.length > 1 ? userStringDecoder.decode(key) : null;
						const decoded_name = name && name.length > 1 ? userStringDecoder.decode(name) : '';
						LaphineUpgTable[decoded_key].TargetItems.push({
							name: decoded_name,
							id: ItemID
						});
						return 1;
					};

					// mount file
					lua.mountFile('lapineupgradebox.lub', buffer);

					// execute file
					await lua.doFile('lapineupgradebox.lub');

					// create and execute our own main function
					lua.doStringSync(`
						function main_laphyneupg()
                            for key, value in pairs(tblLapineUpgradeBox.targets) do
                                result, msg = AddLaphineUpgradeItem(key, value.ItemID, value.NeedCount, value.NeedRefineMin, value.NeedRefineMax, value.NeedSource_String, value.NeedOptionNumMin, value.NotSocketEnchantItem)
                                if not result then
                                    return false, msg
                                end
                                for _, item in ipairs(value.TargetItems) do
                                    result, msg = AddLaphineUpgradeTargetItem(key, item[1], item[2])
                                    if not result then
                                        return false, msg
                                    end

                                end
                            end
                        end
                        main_laphyneupg()
					`);
				} catch (error) {
					console.error('[loadLaphineUpgFile] Error: ', error);
				} finally {
					// release file from memmory
					lua.unmountFile('lapineupgradebox.lub');
					// call onEnd
					onEnd();
				}
			},
			onEnd
		);
	}

	function loadItemDBTable(filename, callback, onEnd) {
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
					ctx.AddDBItemName = (baseItem, itemID) => {
						const decoded_baseItem =
							baseItem && baseItem.length > 1 ? userStringDecoder.decode(baseItem) : null;
						ItemDBNameTbl[decoded_baseItem] = itemID;
						return 1;
					};

					// mount file
					lua.mountFile('ItemDBNameTbl.lub', buffer);

					// execute file
					await lua.doFile('ItemDBNameTbl.lub');

					// create and execute our own main function
					lua.doStringSync(`
						function main_itemDBTable()
                            for key, value in pairs(ItemDBNameTbl) do
                                result, msg = AddDBItemName(key, value)
                                if not result then
                                    return false, msg
                                end
                        	end
						end
                        main_itemDBTable()
					`);
				} catch (error) {
					console.error('[loadItemDBTable] Error: ', error);
				} finally {
					// release file from memmory
					lua.unmountFile('ItemDBNameTbl.lub');
					// call onEnd
					onEnd();
				}
			},
			onEnd
		);
	}

	function loadItemReformFile(filename, callback, onEnd) {
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
					ctx.AddReformInfo = (
						key,
						BaseItem,
						ResultItem,
						NeedRefineMin,
						NeedRefineMax,
						NeedOptionNumMin,
						IsEmptySocket,
						ChangeRefineValue,
						RandomOptionCode,
						PreserveSocketItem,
						PreserveGrade
					) => {
						const decoded_BaseItem =
							BaseItem && BaseItem.length > 1 ? userStringDecoder.decode(BaseItem) : null;
						const decoded_ResultItem =
							ResultItem && ResultItem.length > 1 ? userStringDecoder.decode(ResultItem) : null;
						const decoded_RandomOptionCode =
							RandomOptionCode && RandomOptionCode.length > 1
								? userStringDecoder.decode(RandomOptionCode)
								: null;

						ItemReformTable.ReformInfo[key] = {
							BaseItem: decoded_BaseItem,
							BaseItemId: DB.getItemIdfromBase(decoded_BaseItem),
							ResultItem: decoded_ResultItem,
							ResultItemId: DB.getItemIdfromBase(decoded_ResultItem),
							NeedRefineMin: NeedRefineMin,
							NeedRefineMax: NeedRefineMax,
							NeedOptionNumMin: NeedOptionNumMin,
							IsEmptySocket: IsEmptySocket,
							ChangeRefineValue: ChangeRefineValue,
							RandomOptionCode: decoded_RandomOptionCode,
							PreserveSocketItem: PreserveSocketItem,
							PreserveGrade: PreserveGrade,
							Materials: [],
							InformationString: []
						};
						return 1;
					};

					ctx.ReformInfoAddInformationString = (key, string) => {
						const decoded_string =
							string && string.length > 1
								? userStringDecoder.decode(string, resolveUserCharpage())
								: null;
						ItemReformTable.ReformInfo[key].InformationString.push(decoded_string);
						return 1;
					};

					ctx.ReformInfoAddMaterial = (key, Material, Amount) => {
						const decoded_Material =
							Material && Material.length > 1 ? userStringDecoder.decode(Material) : null;
						ItemReformTable.ReformInfo[key].Materials.push({
							Material: decoded_Material,
							Amount: Amount,
							MaterialItemID: DB.getItemIdfromBase(decoded_Material)
						});
						return 1;
					};

					ctx.AddReformItem = (baseItem, itemID) => {
						const decoded_baseItem =
							baseItem && baseItem.length > 1 ? userStringDecoder.decode(baseItem) : null;
						if (!ItemReformTable.ReformItemList[decoded_baseItem]) {
							ItemReformTable.ReformItemList[decoded_baseItem] = [];
						}
						ItemReformTable.ReformItemList[decoded_baseItem].push(itemID);
						return 1;
					};

					// mount file
					lua.mountFile('ItemReformSystem.lub', buffer);

					// execute file
					await lua.doFile('ItemReformSystem.lub');

					// create and execute our own main function
					lua.doStringSync(`
						function main_itemReform()
							for key, value in pairs(ReformInfo) do
								result, msg = AddReformInfo(key, value.BaseItem, value.ResultItem, value.NeedRefineMin, value.NeedRefineMax, value.NeedOptionNumMin, value.IsEmptySocket, value.ChangeRefineValue, value.RandomOptionCode, value.PreserveSocketItem, value.PreserveGrade)
								if not result then
									return false, msg
								end
								if type(value.InformationString) == "table" then
									for _, info in pairs(value.InformationString) do
										result, msg = ReformInfoAddInformationString(key, info)
										if not result then
											return false, msg
										end
									end
								end
								if type(value.Material) == "table" then
									for material, quantity in pairs(value.Material) do
										result, msg = ReformInfoAddMaterial(key, material, quantity)
										if not result then
											return false, msg
										end
									end
								end
							end
							for key, itemList in pairs(ReformItemList) do
								for index, value in ipairs(itemList) do
									result, msg = AddReformItem(key, value)
									if not result then
										return false, msg
									end
								end
							end
						end
                        main_itemReform()
					`);
				} catch (error) {
					console.error('[loadItemReformFile] Error: ', error);
				} finally {
					// release file from memmory
					lua.unmountFile('ItemReformSystem.lub');
					// call onEnd
					onEnd();
				}
			},
			onEnd
		);
	}

	function loadEnchantListFile(basePath, onEnd) {
		const { lua, loadFile, guard } = createDBLoadContext();
		onEnd = guard(onEnd);

		const normalizedBase = basePath.replace(/\.(lub|lua)$/i, '');
		const defFile = normalizedBase + '_f.lub';
		const listFile = normalizedBase + '.lub';

		loadFile(
			defFile,
			async function (file) {
				try {
					console.log('Loading file "' + defFile + '"...');

					const buffer = file instanceof ArrayBuffer ? new Uint8Array(file) : file;
					const ctx = lua.ctx;

					clearTable(EnchantListTable);

					const decodeLuaString = value => {
						if (value == null) {
							return null;
						}
						if (typeof value === 'string') {
							return value;
						}
						if (value instanceof Uint8Array) {
							return userStringDecoder.decode(value);
						}
						if (value instanceof ArrayBuffer) {
							return userStringDecoder.decode(new Uint8Array(value));
						}
						return String(value);
					};

					const resolveItem = baseName => ({
						base: baseName,
						id: DB.getItemIdfromBase(baseName) || 0
					});

					const ensureGroup = id => {
						const key = Number(id);
						if (!EnchantListTable[key]) {
							EnchantListTable[key] = {
								id: key,
								slotOrder: [],
								targetItems: [],
								condition: { minRefine: 0, minGrade: 0 },
								allowRandomOption: true,
								reset: { enabled: false, rate: 0, zeny: 0, materials: [] },
								caution: '',
								slots: {}
							};
						}
						return EnchantListTable[key];
					};

					const ensureSlot = (group, slotNum) => {
						const key = Number(slotNum);
						if (!group.slots[key]) {
							group.slots[key] = {
								slot: key,
								require: { zeny: 0, materials: [] },
								successRate: 0,
								gradeBonus: {},
								random: {},
								perfect: {},
								upgrade: {}
							};
						}
						return group.slots[key];
					};

					ctx.MessageBox = message => {
						console.error('[loadEnchantListFile] ' + decodeLuaString(message));
						return 1;
					};

					ctx.C_GetSlotCount = itemDb => {
						const baseName = decodeLuaString(itemDb);
						const itemId = DB.getItemIdfromBase(baseName);
						const item = itemId ? ItemTable[itemId] : null;
						return item && item.slotCount ? Number(item.slotCount) : 0;
					};

					ctx.MAX_SLOT_NUM = 4;
					ctx.MAX_MATERIAL_NUM = 10;
					ctx.MAX_REFINE_LEVEL = 20;
					ctx.MAX_GRADE_LEVEL = 4;
					ctx.IS_CLIENT = true;

					ctx.AddEnchantGroup = enchantId => {
						ensureGroup(enchantId);
						return 1;
					};
					ctx.AddEnchantSlotOrder = (enchantId, slotNum) => {
						const group = ensureGroup(enchantId);
						group.slotOrder.push(Number(slotNum));
						return 1;
					};
					ctx.AddEnchantTargetItem = (enchantId, itemDb) => {
						const group = ensureGroup(enchantId);
						const baseName = decodeLuaString(itemDb);
						group.targetItems.push(resolveItem(baseName));
						return 1;
					};
					ctx.SetEnchantCondition = (enchantId, minRefine, minGrade) => {
						const group = ensureGroup(enchantId);
						group.condition = { minRefine: minRefine, minGrade: minGrade };
						return 1;
					};
					ctx.SetEnchantRandomOption = (enchantId, allow) => {
						const group = ensureGroup(enchantId);
						group.allowRandomOption = !!allow;
						return 1;
					};
					ctx.SetEnchantReset = (enchantId, enabled, rate, zeny) => {
						const group = ensureGroup(enchantId);
						group.reset = { enabled: !!enabled, rate: rate, zeny: zeny, materials: [] };
						return 1;
					};
					ctx.SetEnchantCaution = (enchantId, message) => {
						const group = ensureGroup(enchantId);
						group.caution = userStringDecoder.decode(message, resolveUserCharpage());
						return 1;
					};
					ctx.AddEnchantResetMaterial = (enchantId, itemDb, count) => {
						const group = ensureGroup(enchantId);
						const baseName = decodeLuaString(itemDb);
						if (!group.reset) {
							group.reset = { enabled: false, rate: 0, zeny: 0, materials: [] };
						}
						group.reset.materials.push({ ...resolveItem(baseName), count: count });
						return 1;
					};
					ctx.AddEnchantSlot = (enchantId, slotNum) => {
						const group = ensureGroup(enchantId);
						ensureSlot(group, slotNum);
						return 1;
					};
					ctx.SetEnchantRequire = (enchantId, slotNum, zeny) => {
						const group = ensureGroup(enchantId);
						const slot = ensureSlot(group, slotNum);
						slot.require = { zeny: zeny, materials: [] };
						return 1;
					};
					ctx.AddEnchantRequireMaterial = (enchantId, slotNum, itemDb, count) => {
						const group = ensureGroup(enchantId);
						const slot = ensureSlot(group, slotNum);
						const baseName = decodeLuaString(itemDb);
						slot.require.materials.push({ ...resolveItem(baseName), count: count });
						return 1;
					};
					ctx.SetEnchantSuccessRate = (enchantId, slotNum, rate) => {
						const group = ensureGroup(enchantId);
						const slot = ensureSlot(group, slotNum);
						slot.successRate = rate;
						return 1;
					};
					ctx.AddEnchantGradeBonus = (enchantId, slotNum, grade, bonus) => {
						const group = ensureGroup(enchantId);
						const slot = ensureSlot(group, slotNum);
						slot.gradeBonus[grade] = bonus;
						return 1;
					};
					ctx.AddEnchantRate = (enchantId, slotNum, grade, itemDb, rate) => {
						const group = ensureGroup(enchantId);
						const slot = ensureSlot(group, slotNum);
						const baseName = decodeLuaString(itemDb);
						if (!slot.random[grade]) {
							slot.random[grade] = [];
						}
						slot.random[grade].push({ ...resolveItem(baseName), rate: rate });
						return 1;
					};
					ctx.AddPerfectEnchant = (enchantId, slotNum, itemDb, zeny) => {
						const group = ensureGroup(enchantId);
						const slot = ensureSlot(group, slotNum);
						const baseName = decodeLuaString(itemDb);
						slot.perfect[baseName] = { ...resolveItem(baseName), zeny: zeny, materials: [] };
						return 1;
					};
					ctx.AddPerfectEnchantMaterial = (enchantId, slotNum, itemDb, matDb, count) => {
						const group = ensureGroup(enchantId);
						const slot = ensureSlot(group, slotNum);
						const baseName = decodeLuaString(itemDb);
						const matName = decodeLuaString(matDb);
						if (!slot.perfect[baseName]) {
							slot.perfect[baseName] = { ...resolveItem(baseName), zeny: 0, materials: [] };
						}
						slot.perfect[baseName].materials.push({ ...resolveItem(matName), count: count });
						return 1;
					};
					ctx.AddUpgradeEnchant = (enchantId, slotNum, itemDb, resultDb, zeny) => {
						const group = ensureGroup(enchantId);
						const slot = ensureSlot(group, slotNum);
						const baseName = decodeLuaString(itemDb);
						const resultName = decodeLuaString(resultDb);
						slot.upgrade[baseName] = {
							...resolveItem(baseName),
							result: resolveItem(resultName),
							zeny: zeny,
							materials: []
						};
						return 1;
					};
					ctx.AddUpgradeEnchantMaterial = (enchantId, slotNum, itemDb, matDb, count) => {
						const group = ensureGroup(enchantId);
						const slot = ensureSlot(group, slotNum);
						const baseName = decodeLuaString(itemDb);
						const matName = decodeLuaString(matDb);
						if (!slot.upgrade[baseName]) {
							slot.upgrade[baseName] = {
								...resolveItem(baseName),
								result: resolveItem(baseName),
								zeny: 0,
								materials: []
							};
						}
						slot.upgrade[baseName].materials.push({ ...resolveItem(matName), count: count });
						return 1;
					};

					lua.mountFile('EnchantList_f.lub', buffer);
					await lua.doFile('EnchantList_f.lub');

					loadFile(
						listFile,
						async function (fileList) {
							try {
								console.log('Loading file "' + listFile + '"...');

								const listBuffer =
									fileList instanceof ArrayBuffer ? new Uint8Array(fileList) : fileList;
								lua.mountFile('EnchantList.lub', listBuffer);
								await lua.doFile('EnchantList.lub');

								lua.doStringSync(`
									function main_enchantlist()
										for enchantNum, info in pairs(Table) do
											AddEnchantGroup(enchantNum)
											if info.SlotOrder ~= nil then
												for _, slotNum in ipairs(info.SlotOrder) do
													AddEnchantSlotOrder(enchantNum, slotNum)
												end
											end
											if info.TargetItemTbl ~= nil then
												for _, itemDb in ipairs(info.TargetItemTbl) do
													AddEnchantTargetItem(enchantNum, itemDb)
												end
											end
											if info.Condition ~= nil then
												SetEnchantCondition(enchantNum, info.Condition.MinRefine, info.Condition.MinGrade)
											end
											if info.bApproveRandomOpt ~= nil then
												SetEnchantRandomOption(enchantNum, info.bApproveRandomOpt)
											end
											if info.Reset ~= nil then
												SetEnchantReset(enchantNum, info.Reset.bReset, info.Reset.Rate, info.Reset.Zeny)
												if info.Reset.MatTbl ~= nil then
													for matItem, matCount in pairs(info.Reset.MatTbl) do
														AddEnchantResetMaterial(enchantNum, matItem, matCount)
													end
												end
											end
											if info.CautionMsg ~= nil then
												SetEnchantCaution(enchantNum, info.CautionMsg)
											end
											if info.Slot ~= nil then
												for slotNum, slotInfo in pairs(info.Slot) do
													AddEnchantSlot(enchantNum, slotNum)
													if slotInfo.RequireTbl ~= nil then
														SetEnchantRequire(enchantNum, slotNum, slotInfo.RequireTbl.Zeny)
														if slotInfo.RequireTbl.MatTbl ~= nil then
															for matItem, matCount in pairs(slotInfo.RequireTbl.MatTbl) do
																AddEnchantRequireMaterial(enchantNum, slotNum, matItem, matCount)
															end
														end
													end
													if slotInfo.SuccessRate ~= nil then
														SetEnchantSuccessRate(enchantNum, slotNum, slotInfo.SuccessRate)
													end
													if slotInfo.GradeBonusTbl ~= nil then
														for grade, bonus in pairs(slotInfo.GradeBonusTbl) do
															AddEnchantGradeBonus(enchantNum, slotNum, grade, bonus)
														end
													end
													if slotInfo.EnchantRateTbl ~= nil then
														for grade, rateTbl in pairs(slotInfo.EnchantRateTbl) do
															for itemDb, rate in pairs(rateTbl) do
																AddEnchantRate(enchantNum, slotNum, grade, itemDb, rate)
															end
														end
													end
													if slotInfo.PerfectECTbl ~= nil then
														for itemDb, perfect in pairs(slotInfo.PerfectECTbl) do
															AddPerfectEnchant(enchantNum, slotNum, itemDb, perfect.Zeny)
															if perfect.MatTbl ~= nil then
																for matItem, matCount in pairs(perfect.MatTbl) do
																	AddPerfectEnchantMaterial(enchantNum, slotNum, itemDb, matItem, matCount)
																end
															end
														end
													end
													if slotInfo.UpgradeECTbl ~= nil then
														for itemDb, upgrade in pairs(slotInfo.UpgradeECTbl) do
															AddUpgradeEnchant(enchantNum, slotNum, itemDb, upgrade.ResultItemDB, upgrade.Zeny)
															if upgrade.MatTbl ~= nil then
																for matItem, matCount in pairs(upgrade.MatTbl) do
																	AddUpgradeEnchantMaterial(enchantNum, slotNum, itemDb, matItem, matCount)
																end
															end
														end
													end
												end
											end
										end
									end
									main_enchantlist()
								`);
							} catch (error) {
								console.error('[loadEnchantListFile] Error: ', error);
							} finally {
								lua.unmountFile('EnchantList.lub');
								lua.unmountFile('EnchantList_f.lub');
								onEnd();
							}
						},
						function () {
							console.error('[loadEnchantListFile] Missing file: ' + listFile);
							lua.unmountFile('EnchantList_f.lub');
							onEnd();
						}
					);
				} catch (error) {
					console.error('[loadEnchantListFile] Error: ', error);
					lua.unmountFile('EnchantList_f.lub');
					onEnd();
				}
			},
			function () {
				console.error('[loadEnchantListFile] Missing file: ' + defFile);
				onEnd();
			}
		);
	}
	class ItemDatabase {
		static getItemInfo(itemid) {
			const item = ItemTable[itemid] || unknownItem;

			if (!item._decoded) {
				item.identifiedDescriptionName =
					item.identifiedDescriptionName instanceof Array
						? item.identifiedDescriptionName.join('\n')
						: item.identifiedDescriptionName;
				item.unidentifiedDescriptionName =
					item.unidentifiedDescriptionName instanceof Array
						? item.unidentifiedDescriptionName.join('\n')
						: item.unidentifiedDescriptionName;
				item.prefixName = item.prefixName || '';
				item.isPostfix = item.isPostfix || false;
				item.processitemlist =
					item.processitemlist && item.processitemlist instanceof Array
						? item.processitemlist.join('\n')
						: '';
				item._decoded = true;
			}

			return item;
		}

		static getItemPath(itemid, identify) {
			const it = DB.getItemInfo(itemid);
			return (
				'data/sprite/\xbe\xc6\xc0\xcc\xc5\xdb/' +
				(identify ? it.identifiedResourceName : it.unidentifiedResourceName)
			);
		}

		static getItemName(item, options = {}) {
			const {
				showItemRefine = true,
				showItemGrade = true,
				showItemSlots = true,
				showItemPrefix = true,
				showItemPostfix = true,
				showItemOptions = true
			} = options;

			const it = DB.getItemInfo(item.ITID);
			let str = '';
			let prefix = '';
			let postfix = '';
			let showprefix = false;
			let showpostfix = false;

			if (!item.IsIdentified) {
				return it.unidentifiedDisplayName;
			}

			if (item.RefiningLevel && showItemRefine) {
				str = '+' + item.RefiningLevel + ' ';
			}

			if (item.enchantgrade && showItemGrade) {
				const list = ['', 'D', 'C', 'B', 'A'];
				str += '[' + list[item.enchantgrade] + '] ';
			}

			//Hide slots for forged weapons
			let showslots = true;
			if (item.slot) {
				let very = '';
				let name = '';
				let elem = '';

				switch (item.slot.card1) {
					case 0x00ff: {
						// FORGE
						showslots = false;
						if (item.slot.card2 >= 3840) {
							very = MsgStringTable[461]; //Very Very Very Strong
						} else if (item.slot.card2 >= 2560) {
							very = MsgStringTable[460]; //Very Very Strong
						} else if (item.slot.card2 >= 1024) {
							very = MsgStringTable[459]; //Very Strong
						}
						switch (Math.abs(item.slot.card2 % 10)) {
							case 1:
								elem = MsgStringTable[452];
								break; // 's Ice
							case 2:
								elem = MsgStringTable[454];
								break; // 's Earth
							case 3:
								elem = MsgStringTable[451];
								break; // 's Fire
							case 4:
								elem = MsgStringTable[453];
								break; // 's Wind
							default:
								elem = MsgStringTable[450];
								break; // 's
						}

						const GID = (item.slot.card4 << 16) + item.slot.card3;
						name = '<font color="red" class="owner-' + GID + '">Unknown</font>';
						if (DB.CNameTable[GID] && DB.CNameTable[GID] !== 'Unknown') {
							name = '<font color="#87cefa" class="owner-' + GID + '">' + DB.CNameTable[GID] + '</font>';
						} else {
							DB.UpdateOwnerName[GID] = function (pkt) {
								delete DB.UpdateOwnerName[pkt.GID];
								setTimeout(() => {
									const elements = document.querySelectorAll('.owner-' + pkt.GID);
									for (let i = 0; i < elements.length; i++) {
										elements[i].innerText = pkt.CName;
										elements[i].style.color = 'blue';
									}
								}, 1000);
							};
							DB.getNameByGID(GID);
						}

						str += very + ' ' + name + elem + ' ';
						break;
					}
					case 0x00fe: // CREATE
						elem = MsgStringTable[450];
						break;
					case 0xff00: // PET
						break;
					// Show card prefix
					default: {
						const list = ['', 'Double ', 'Triple ', 'Quadruple '];
						const cards = {};
						const cardList = [];

						for (let i = 1; i <= 4; ++i) {
							const card = item.slot['card' + i];

							if (card) {
								//store order
								if (!cardList.includes(card)) {
									cardList.push(card);
								}

								//store details
								if (cards[card]) {
									cards[card].count++;
								} else {
									cards[card] = {};
									cards[card].isPostfix = DB.getItemInfo(card).isPostfix;
									cards[card].prefixName = DB.getItemInfo(card).prefixName;
									cards[card].count = 0;
								}
							}
						}

						//create prefixes and postfixes in order
						cardList.forEach(card => {
							if (cards[card].isPostfix) {
								postfix += ' ' + list[cards[card].count] + cards[card].prefixName;
								showpostfix = true;
							} else {
								prefix += list[cards[card].count] + cards[card].prefixName + ' ';
								showprefix = true;
							}
						});
						break;
					}
				}
				switch (item.slot.card4) {
					case 0x1: //BELOVED PET
						showslots = false;
						str = DB.getMessage(756) + ' ' + str;
						break;
				}
			}

			if (showprefix && showItemPrefix) {
				str += prefix;
			}

			str += it.identifiedDisplayName;

			if (showpostfix && showItemPostfix) {
				str += postfix;
			}

			if (it.slotCount > 0 && showslots && showItemSlots) {
				str += ' [' + it.slotCount + ']';
			}

			if (item.Options && showItemOptions) {
				const numOfOptions = item.Options.filter(Option => Option?.index && Option?.index !== 0).length;
				if (numOfOptions) {
					str += ' [' + numOfOptions + ' Option]';
				}
			}

			return str;
		}

		static getOptionName(id) {
			if (!(id in RandomOption)) {
				return 'UNKNOWN RANDOM OPTION';
			}
			return RandomOption[id];
		}

		static getLaphineSysList() {
			return LaphineSysTable;
		}

		static getLaphineSysInfoById(itemId) {
			for (const key in LaphineSysTable) {
				if (LaphineSysTable[key].ItemID === itemId) {
					return LaphineSysTable[key];
				}
			}
			return null;
		}

		static getLaphineUpgList() {
			return LaphineUpgTable;
		}

		static getLaphineUpgInfoById(itemId) {
			for (const key in LaphineUpgTable) {
				if (LaphineUpgTable[key].ItemID === itemId) {
					return LaphineUpgTable[key];
				}
			}
			return null;
		}

		static getEnchantGroup(groupId) {
			return EnchantListTable[groupId] || null;
		}

		static getEnchantGroups() {
			return EnchantListTable;
		}

		static getEnchantSlot(groupId, slotNum) {
			const group = EnchantListTable[groupId];
			if (!group || !group.slots) {
				return null;
			}
			return group.slots[slotNum] || null;
		}

		static getItemIdfromBase(baseItem) {
			return ItemDBNameTbl[baseItem];
		}

		static getBasefromItemID(itemId) {
			for (const key in ItemDBNameTbl) {
				if (ItemDBNameTbl[key] === itemId) {
					return key;
				}
			}
			return null; // Return null if not found
		}

		static findReformListByItemID(itemId) {
			// First, get the base item from the item ID
			const baseItem = DB.getBasefromItemID(itemId);

			// Check if the base item was found and if it exists as a key in ReformItemList
			if (baseItem && ItemReformTable.ReformItemList.hasOwnProperty(baseItem)) {
				return ItemReformTable.ReformItemList[baseItem];
			} else {
				return null; // Return null if not found
			}
		}

		static getReformInfo(reformId) {
			// Check if the reformId exists in the ReformInfo
			if (ItemReformTable.ReformInfo[reformId]) {
				return ItemReformTable.ReformInfo[reformId];
			} else {
				return null; // Return null if the reform ID is not found
			}
		}

		static getAllReformInfos(reformIds) {
			const reformInfos = [];

			for (let i = 0; i < reformIds.length; i++) {
				const reformId = reformIds[i];
				const reformInfo = DB.getReformInfo(reformId);

				if (reformInfo) {
					reformInfos.push(reformInfo);
				} else {
					console.error('Reform Info not found for reform ID:', reformId);
				}
			}

			return reformInfos;
		}

		static getBuyingStoreItemList() {
			return buyingStoreItemList;
		}

		static isBuyable(id) {
			return buyingStoreItemList.includes(id);
		}

		static isPetEgg(id) {
			return id >= 9000 && id <= 9150;
		}
	}
	return {
		ItemDatabase,
		resetItemData,
		buyingStoreItemList,
		parseBuyingStoreItem,
		loadItemInfo,
		loadLaphineSysFile,
		loadLaphineUpgFile,
		loadItemDBTable,
		loadItemReformFile,
		loadEnchantListFile
	};
}
