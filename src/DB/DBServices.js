import Client from 'Core/Client.js';
import { createDBBootstrap } from 'DB/Bootstrap/DBBootstrap.js';
import Configs from 'Core/Configs.js';
import TextEncoding from 'Utils/CodepageManager.js';
import JobId from 'DB/Jobs/JobConst.js';

import { createActorResourcePaths } from 'DB/Jobs/ActorResourcePaths.js';
import { createEquipmentRules } from 'DB/Items/EquipmentRules.js';
import { setSkillAttackSliceResolver } from 'DB/Items/WeaponQueries.js';
import { loadMoveInfoTable } from 'DB/Items/ItemMoveInfoLoader.js';
import { createItemDatabase } from 'DB/Items/ItemDatabase.js';
import { mergeMonsterNames } from 'DB/Monsters/MonsterDatabase.js';

import * as legacyItemRows from 'DB/Items/LegacyItemRows.js';
import { mergeAccessoryNames, mergeRobeNames, mergeRandomOptions } from 'DB/Items/ResourceTableRows.js';
import { loadWeaponTable } from 'DB/Items/WeaponTableLoader.js';
import { createMapLoaders } from 'DB/Map/MapLoaders.js';
import { createMapDatabase, setLegacyMapMusic, setLegacyMapName, resetLoadedMapNames } from 'DB/Map/MapDatabase.js';
import { createSignBoardDatabase } from 'DB/Map/SignBoardDatabase.js';
import {
	createNavigationSystem,
	fillNaviTable,
	NaviMapTable,
	NaviMobTable,
	NaviNpcTable,
	NaviLinkTable,
	NaviLinkDistanceTable,
	NaviNpcDistanceTable,
	clearNavigationMobIndex
} from 'DB/Map/NavigationSystem.js';
import { setSkillDescription, parseLegacySkillDescription, mergeSkillIds } from 'DB/Skills/SkillDescriptions.js';
import { createSkillLoaders } from 'DB/Skills/SkillLoaders.js';
import mergeEz2Effects from 'DB/Effects/Ez2EffectMerge.js';
import Ez2streffect from 'DB/Effects/Ez2EffectData.js';
import { loadHatEffectInfo } from 'DB/Effects/HatEffectLoader.js';
import PrivateAirship from 'DB/Map/PrivateAirship.js';
import { loadStateIconInfo } from 'DB/Status/StatusInfoLoader.js';
import { createTableLoaders } from 'DB/Loaders/TableLoader.js';
import loadFontFromClient from 'DB/Loaders/ClientFont.js';
import { getSystemAliases, tryLoadLuaAliases } from 'DB/Loaders/LuaAliases.js';
import { createLuaTableLoaders } from 'DB/Loaders/LuaTableLoader.js';
import { startLua, invalidateLuaRuntime } from 'DB/Loaders/LuaRuntime.js';

import { createOwnerNameResolver } from 'DB/System/OwnerNameResolver.js';
import { createEmblemLoader } from 'DB/System/EmblemLoader.js';
import {
	createSystemDatabase,
	resetSystemData,
	MsgStringTable,
	setMsgStringTable,
	setJokeRow,
	setScreamRow,
	ReputeGroup,
	ReputeInfo,
	mergeAchievements,
	setEffectMessageResolvers,
	MsgEmotionCSV
} from 'DB/System/SystemDatabase.js';
import { createPetDatabase, loadPetInfo, loadPetEvolution, setPetTalkTable } from 'DB/Pets/PetDatabase.js';
import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import PACKETVER from 'Network/PacketVerManager.js';
import MemoryManager from 'Core/MemoryManager.js';
import LuaModuleLoader from 'Core/LuaModuleLoader.js';

export function createDBServices(DB) {
	setSkillAttackSliceResolver((job, weapon) => DB.getAttackSlice(job, weapon));
	setEffectMessageResolvers(
		() => DB.getRandomJoke(),
		() => DB.getRandomScream()
	);
	const SexTable = ['\xbf\xa9', '\xb3\xb2'];
	const getUserCharpage = () => {
		if (DB.userCharpage) return DB.userCharpage;
		const servers = Configs.get('servers', []);
		const langType = Configs.get('langtype', servers[0]?.langtype ?? 0);
		return TextEncoding.detectEncodingByLangtype(langType, Configs.get('disableKorean'));
	};
	const grfCharpage = 'windows-1252';
	TextEncoding.setCharset(grfCharpage);
	const { loadTable, loadCSV, loadXMLFile, loadBSONFile } = createTableLoaders(getUserCharpage);
	const { loadLuaTable, loadLuaValue } = createLuaTableLoaders(getUserCharpage, grfCharpage);
	const EquipmentRules = createEquipmentRules(DB, SexTable);
	const NavigationSystem = createNavigationSystem(DB);
	const ActorResourcePaths = createActorResourcePaths(DB, SexTable);
	const PetDatabase = createPetDatabase(DB);
	const signBoards = createSignBoardDatabase(getUserCharpage);
	const { loadSignBoardData, loadSignBoardList } = signBoards;
	const systemDatabase = createSystemDatabase(DB, getUserCharpage);
	const { loadAttendanceFile, loadTitleTable, loadQuestInfo, parseQuestEntry, loadCashShopBanner } = systemDatabase;
	const itemDatabase = createItemDatabase(DB, getUserCharpage, MsgStringTable);
	const {
		parseBuyingStoreItem,
		loadItemInfo,
		loadLaphineSysFile,
		loadLaphineUpgFile,
		loadItemDBTable,
		loadItemReformFile,
		loadEnchantListFile
	} = itemDatabase;
	const mapDatabase = createMapDatabase(DB, getUserCharpage);
	const { loadMapTbl, parseFogEntry, parseIndoorEntry, setMapAlias } = mapDatabase;
	const ownerNames = createOwnerNameResolver(DB);
	const emblemLoader = createEmblemLoader(DB);
	const { loadWorldMapInfo, loadTownInfoFile, loadPrivateAirship } = createMapLoaders(getUserCharpage);
	const { loadSkillInfoList, loadSkillTreeView } = createSkillLoaders(DB, getUserCharpage);
	const bootstrap = createDBBootstrap(DB, {
		mergeAchievements,
		Client,
		Configs,
		Ez2streffect,
		mergeAccessoryNames,
		legacyItemRows,
		JobId,
		setJokeRow,
		LuaModuleLoader,
		setLegacyMapMusic,
		setLegacyMapName,
		resetLoadedMapNames,
		resetClientData: () => {
			itemDatabase.resetItemData();
			resetSystemData();
		},
		setMapAlias,
		MemoryManager,
		mergeMonsterNames,
		MsgEmotionCSV,
		MsgStringTable,
		setMsgStringTable,
		mergeSkillIds,
		NaviLinkDistanceTable,
		NaviLinkTable,
		NaviMapTable,
		NaviMobTable,
		NaviNpcDistanceTable,
		NaviNpcTable,
		Network,
		PACKET,
		PACKETVER,
		PrivateAirship,
		mergeRandomOptions,
		ReputeGroup,
		ReputeInfo,
		mergeRobeNames,
		setScreamRow,
		parseBuyingStoreItem,
		clearNavigationMobIndex,
		invalidateLuaRuntime,
		fillNaviTable,
		getSystemAliases,
		loadAttendanceFile,
		loadBSONFile,
		loadCSV,
		loadCashShopBanner,
		loadEnchantListFile,
		loadFontFromClient,
		loadHatEffectInfo,
		loadItemDBTable,
		loadItemInfo,
		loadItemReformFile,
		loadLaphineSysFile,
		loadLaphineUpgFile,
		loadLuaTable,
		loadLuaValue,
		loadMapTbl,
		loadMoveInfoTable,
		loadPetEvolution,
		loadPetInfo,
		loadPrivateAirship,
		loadQuestInfo,
		loadSignBoardData,
		loadSignBoardList,
		loadSkillInfoList,
		loadSkillTreeView,
		loadStateIconInfo,
		loadTable,
		loadTitleTable,
		loadTownInfoFile,
		loadWeaponTable,
		loadWorldMapInfo,
		loadXMLFile,
		mergeEz2Effects,
		ownerNames,
		parseFogEntry,
		parseIndoorEntry,
		parseQuestEntry,
		parseLegacySkillDescription,
		setPetTalkTable,
		setSkillDescription,
		startLua,
		tryLoadLuaAliases,
		getUserCharpage
	});
	return {
		EquipmentRules,
		NavigationSystem,
		ActorResourcePaths,
		PetDatabase,
		signBoards,
		systemDatabase,
		itemDatabase,
		mapDatabase,
		ownerNames,
		emblemLoader,
		bootstrap
	};
}

