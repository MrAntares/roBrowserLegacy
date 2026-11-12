import TextEncoding from 'Utils/CodepageManager.js';
import { lua } from 'DB/Loaders/LuaRuntime.js';
import Client from 'Core/Client.js';

export const MsgStringTable = [];
export const JokeTable = [];
export const ScreamTable = [];
export const CheckAttendanceTable = { Config: {}, Rewards: [] };
export const QuestInfo = {};
export const TitleTable = {};
export const ReputeGroup = {};
export const ReputeInfo = {};
export const AchievementTable = {};
export const MsgEmotionCSV = {};
export const CashShopBannerTable = [];

export function resetSystemData() {
	for (const table of [
		MsgStringTable,
		JokeTable,
		ScreamTable,
		CheckAttendanceTable.Config,
		CheckAttendanceTable.Rewards,
		QuestInfo,
		TitleTable,
		ReputeGroup,
		ReputeInfo,
		AchievementTable,
		MsgEmotionCSV,
		CashShopBannerTable
	]) {
		for (const key of Object.keys(table)) delete table[key];
		if (Array.isArray(table)) table.length = 0;
	}
}

export function setMsgStringTable(index, value) {
	MsgStringTable[index] = value;
}
export function setJokeRow(index, value) {
	JokeTable[index] = value;
}
export function setScreamRow(index, value) {
	ScreamTable[index] = value;
}
export function mergeAchievements(rows) {
	if (rows) Object.assign(AchievementTable, rows);
}

export function getRandomJoke() {
	return JokeTable[Math.round(Math.random() * (JokeTable.length - 1))];
}

export function getRandomScream() {
	return ScreamTable[Math.round(Math.random() * (ScreamTable.length - 1))];
}

let effectJokeResolver = getRandomJoke;
let effectScreamResolver = getRandomScream;

export function setEffectMessageResolvers(joke, scream) {
	effectJokeResolver = joke;
	effectScreamResolver = scream;
}

export function getEffectJoke() {
	return effectJokeResolver();
}
export function getEffectScream() {
	return effectScreamResolver();
}

export function createSystemDatabase(DB, getUserCharpage) {
	const userStringDecoder = TextEncoding;
	const resolveUserCharpage = typeof getUserCharpage === 'function' ? getUserCharpage : () => getUserCharpage;
	function loadAttendanceFile(filename, callback, onEnd) {
		Client.loadFile(
			filename,
			async function (file) {
				try {
					const buffer = new Uint8Array(file);
					// get context, a proxy. It will be used to interact with lua conveniently
					const ctx = lua.ctx;
					// create CheckAttendance required functions in context
					ctx.InsertCheckAttendanceConfig = (EvendOnOff, StartDate, EndDate) => {
						CheckAttendanceTable.Config.StartDate = StartDate;
						CheckAttendanceTable.Config.EndDate = EndDate;
						return 1;
					};
					ctx.InsertCheckAttendanceReward = (day, item_id, quantity) => {
						CheckAttendanceTable.Rewards[day - 1] = { day: day, item_id: item_id, quantity: quantity };
						return 1;
					};
					// mount file
					lua.mountFile('CheckAttendance.lub', buffer);
					// execute file
					await lua.doFile('CheckAttendance.lub');
					// execute main lua function
					lua.doStringSync('main()');
				} catch (error) {
					console.error('[loadAttendanceFile] Error: ', error);
				} finally {
					// release file from memmory
					lua.unmountFile('CheckAttendance.lub');
					// call onEnd
					onEnd();
				}
			},
			onEnd
		);
	}

	function loadTitleTable(filename, callback, onEnd) {
		Client.loadFile(
			filename,
			async function (file) {
				try {
					console.log('Loading file "' + filename + '"...');
					const buffer = file instanceof ArrayBuffer ? new Uint8Array(file) : file;

					const ctx = lua.ctx;

					ctx.AddTitle = function (titleID, titleName) {
						TitleTable[titleID] = userStringDecoder.decode(titleName, resolveUserCharpage());
						return 1;
					};

					lua.mountFile(filename, buffer);
					await lua.doFile(filename);

					lua.doStringSync(`  
						function main_title()  
							if title_tbl then  
								for titleID, titleName in pairs(title_tbl) do  
									result, msg = AddTitle(titleID, titleName)  
									if not result then  
										return false, msg  
									end  
								end  
							end  
						return true, "success"  
						end
						main_title()  
					`);
				} catch (error) {
					console.error('[loadTitleTable] Error: ', error);
				} finally {
					lua.unmountFile(filename);
					onEnd();
				}
			},
			onEnd
		);
	}

	function loadQuestInfo(filename, callback, onEnd) {
		const loadPromise = new Promise((resolve, reject) => {
			Client.loadFile(filename, resolve, reject);
		});

		loadPromise
			.then(async file => {
				console.log('Loading file "' + filename + '"...');

				try {
					// check if file is ArrayBuffer and convert to Uint8Array if necessary
					const buffer = file instanceof ArrayBuffer ? new Uint8Array(file) : file;

					// get context, a proxy. It will be used to interact with lua conveniently
					const ctx = lua.ctx;

					// create required functions in context

					// add quest info
					ctx.AddQuestInfo = (
						QuestID,
						Title,
						Summary,
						IconName,
						NpcSpr,
						NpcNavi,
						NpcPosX,
						NpcPosY,
						RewardEXP,
						RewardJEXP
					) => {
						const userCharpage = resolveUserCharpage();
						QuestInfo[QuestID] = {
							Title: userStringDecoder.decode(Title, userCharpage),
							Summary: userStringDecoder.decode(Summary, userCharpage),
							IconName: userStringDecoder.decode(IconName),
							Description: [],
							NpcSpr: NpcSpr instanceof Uint8Array ? userStringDecoder.decode(NpcSpr) : null,
							NpcNavi: NpcNavi instanceof Uint8Array ? userStringDecoder.decode(NpcNavi) : null,
							NpcPosX: NpcPosX,
							NpcPosY: NpcPosY,
							RewardItemList: [],
							RewardEXP: RewardEXP,
							RewardJEXP: RewardJEXP
						};

						return 1;
					};

					// add quest description
					ctx.AddQuestDescription = (QuestID, QuestDescription) => {
						QuestInfo[QuestID].Description.push(
							userStringDecoder.decode(QuestDescription, resolveUserCharpage())
						);
						return 1;
					};

					// add quest reward item
					ctx.AddQuestRewardItem = (QuestID, ItemID, ItemNum) => {
						QuestInfo[QuestID].RewardItemList.push({ ItemID: ItemID, ItemNum: ItemNum });
						return 1;
					};

					// mount file
					lua.mountFile(filename, buffer);
					// execute file
					await lua.doFile(filename);

					// create and execute our own main function
					lua.doStringSync(`
					function main_quest()
					-- Check if QuestInfoList is a table and not nil
					if type(QuestInfoList) ~= "table" or QuestInfoList == nil then
						return false, "Error: Quest table is nil or not a table"
					end

					for QuestID, DESC in pairs(QuestInfoList) do
						-- Ensure DESC is a table, use empty table if nil
						DESC = type(DESC) == "table" and DESC or {}

						-- Provide default values for DESC fields if they are nil
						local questData = {
							Title = DESC.Title or "Unknown Quest",
							Summary = DESC.Summary or "Unknown Quest",
							IconName = DESC.IconName or "",
							NpcSpr = DESC.NpcSpr or "",
							NpcNavi = DESC.NpcNavi or "",
							NpcPosX = DESC.NpcPosX or 0,
							NpcPosY = DESC.NpcPosY or 0,
							RewardItemList = DESC.RewardItemList or {},
							RewardEXP = tonumber(DESC.RewardEXP) or 0,
							RewardJEXP = tonumber(DESC.RewardJEXP) or 0,

							Description = type(DESC.Description) == "table" and DESC.Description or {}
						}

						result, msg = AddQuestInfo(QuestID, questData.Title, questData.Summary, questData.IconName, 
												questData.NpcSpr, questData.NpcNavi, questData.NpcPosX, 
												questData.NpcPosY, questData.RewardEXP, 
												questData.RewardJEXP)
						if not result then
							return false, msg
						end

						-- Iterate over RewardItemList table, use empty table if nil
						for k, v in pairs(questData.RewardItemList) do
							result, msg = AddQuestRewardItem(QuestID, v.ItemID, v.ItemNum)
							if not result then
								return false, msg
							end
						end

						-- Iterate over Description table, use empty table if nil
						for k, v in pairs(questData.Description) do
							result, msg = AddQuestDescription(QuestID, v or "No description available")
							if not result then
								return false, msg
							end
						end
					end
					return true, "good"
				end

				main_quest()
					`);
				} catch (error) {
					console.error('[loadQuestInfo] Error: ', error);
				} finally {
					// release file from memmory
					lua.unmountFile(filename);
					// call onEnd
					onEnd(true);
				}
			})
			.catch(error => {
				if (typeof onEnd === 'function') {
					onEnd(false);
				}
			});
	}

	function parseQuestEntry(index, key, title, group, image, description, summary) {
		const quest = QuestInfo[key] || (QuestInfo[key] = {});

		quest.Title = title;
		quest.Group = group;
		quest.Image = image;
		quest.Description = description;
		quest.Summary = summary;
	}

	function loadCashShopBanner(filename, callback, onEnd) {
		Client.loadFile(
			filename,
			async function (file) {
				try {
					console.log('Loading file "' + filename + '"...');

					// check if file is ArrayBuffer and convert to Uint8Array if necessary
					const buffer = file instanceof ArrayBuffer ? new Uint8Array(file) : file;

					// get context
					const ctx = lua.ctx;

					// Define the function that Lua will call
					// add_cashshop_banner( bitmap_name, url )
					ctx.add_cashshop_banner = function (bitmap_name, url) {
						const decoded_bmp = userStringDecoder.decode(bitmap_name);
						const decoded_url = userStringDecoder.decode(url);

						CashShopBannerTable.push({
							bmp: decoded_bmp,
							url: decoded_url
						});
						return 1;
					};

					// mount file
					lua.mountFile(filename, buffer);

					// execute file to load the table and function definition
					await lua.doFile(filename);

					// execute the main function: set_cashshop_banner()
					lua.doStringSync(`
						if set_cashshop_banner then
							set_cashshop_banner()
						end
					`);
				} catch (error) {
					console.error('[loadCashShopBanner] Error: ', error);
				} finally {
					lua.unmountFile(filename);
					onEnd(true);
				}
			},
			// onError for loadFile
			function () {
				if (onEnd) {
					onEnd(false);
				}
			}
		);
	}
	class SystemDatabase {
		static getAllTitles() {
			return TitleTable;
		}

		static getAchievementTable() {
			return AchievementTable;
		}

		static getTitleString(titleID) {
			return TitleTable[titleID] || '';
		}

		static getMessage(id, defaultText) {
			if (!(id in MsgStringTable)) {
				return defaultText !== undefined ? defaultText : 'NO MSG ' + id;
			}

			return MsgStringTable[id];
		}

		static getMessageEmotionCSV(keyOrIndex) {
			if (typeof keyOrIndex === 'number') {
				// Get keys as array just for this lookup
				const keys = Object.keys(MsgEmotionCSV);
				const key = keys[keyOrIndex];
				return key ? MsgEmotionCSV[key] : null;
			}
			// string key lookup
			return MsgEmotionCSV[keyOrIndex] ?? null;
		}

		static getRandomJoke() {
			return getRandomJoke();
		}

		static getRandomScream() {
			return getRandomScream();
		}

		static getQuestInfo(questID) {
			return (
				QuestInfo[questID] || {
					Title: 'Unknown Quest',
					Description: [],
					Summary: 'Uknown Quest',
					IconName: '',
					NpcSpr: null,
					NpcNavi: null,
					NpcPosX: null,
					NpcPosY: null,
					RewardItemList: [],
					RewardEXP: 0,
					RewardJEXP: 0
				}
			);
		}

		static getCheckAttendanceInfo() {
			return CheckAttendanceTable;
		}

		static getReputeGroup() {
			return ReputeGroup;
		}

		static getReputeGroupList(repute_group) {
			const group = ReputeGroup[repute_group];
			return (group && group.ReputeList) || null;
		}

		static getReputeInfo() {
			return ReputeInfo;
		}

		static getReputeData(repute_id) {
			return ReputeInfo[repute_id] || null;
		}

		static getCashShopBannerTable() {
			return CashShopBannerTable;
		}
	}
	return { SystemDatabase, loadAttendanceFile, loadTitleTable, loadQuestInfo, parseQuestEntry, loadCashShopBanner };
}
