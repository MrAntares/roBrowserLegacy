import Client from 'Core/Client.js';
import { createDBBootstrap } from './Bootstrap/DBBootstrap.js';
import Configs from 'Core/Configs.js';
import TextEncoding from 'Utils/CodepageManager.js';
import JobId from './Jobs/JobConst.js';

import { createActorResourcePaths } from './Jobs/ActorResourcePaths.js';
import { createEquipmentRules } from './Items/EquipmentRules.js';
import { setSkillAttackSliceResolver } from './Items/WeaponQueries.js';
import { loadMoveInfoTable } from './Items/ItemMoveInfoLoader.js';
import { createItemDatabase } from './Items/ItemDatabase.js';
import { mergeMonsterNames } from './Monsters/MonsterDatabase.js';

import * as legacyItemRows from './Items/LegacyItemRows.js';
import { mergeAccessoryNames, mergeRobeNames, mergeRandomOptions } from './Items/ResourceTableRows.js';
import { loadWeaponTable } from './Items/WeaponTableLoader.js';
import { createMapLoaders } from './Map/MapLoaders.js';
import { createMapDatabase, setLegacyMapMusic, setLegacyMapName, resetLoadedMapNames } from './Map/MapDatabase.js';
import { createSignBoardDatabase } from './Map/SignBoardDatabase.js';
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
} from './Map/NavigationSystem.js';
import { setSkillDescription, parseLegacySkillDescription, mergeSkillIds } from './Skills/SkillDescriptions.js';
import { createSkillLoaders } from './Skills/SkillLoaders.js';
import mergeEz2Effects from './Effects/Ez2EffectMerge.js';
import Ez2streffect from './Effects/Ez2EffectData.js';
import { loadHatEffectInfo } from './Effects/HatEffectLoader.js';
import PrivateAirship from './Map/PrivateAirship.js';
import { loadStateIconInfo } from './Status/StatusInfoLoader.js';
import { createTableLoaders } from './Loaders/TableLoader.js';
import loadFontFromClient from './Loaders/ClientFont.js';
import { getSystemAliases, tryLoadLuaAliases } from './Loaders/LuaAliases.js';
import { createLuaTableLoaders } from './Loaders/LuaTableLoader.js';
import { startLua, invalidateLuaRuntime } from './Loaders/LuaRuntime.js';

import { createOwnerNameResolver } from './System/OwnerNameResolver.js';
import { createEmblemLoader } from './System/EmblemLoader.js';
import {
	createSystemDatabase,
	resetSystemData,
	MsgStringTable,
	setMessageRow,
	setJokeRow,
	setScreamRow,
	ReputeGroup,
	ReputeInfo,
	mergeAchievements,
	setEffectMessageResolvers,
	MsgEmotionCSV
} from './System/SystemDatabase.js';
import { createPetDatabase, loadPetInfo, loadPetEvolution, setPetTalkTable } from './Pets/PetDatabase.js';
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
	const servers = Configs.get('servers', []);
	const langType = servers[0] && servers[0].langtype ? parseInt(servers[0].langtype, 0) : 0;
	const userCharpage = TextEncoding.detectEncodingByLangtype(langType, Configs.get('disableKorean'));
	const grfCharpage = 'windows-1252';
	TextEncoding.setCharset(grfCharpage);
	const { loadTable, loadCSV, loadXMLFile, loadBSONFile } = createTableLoaders(userCharpage);
	const { loadLuaTable, loadLuaValue } = createLuaTableLoaders(userCharpage, grfCharpage);
	const EquipmentRules = createEquipmentRules(DB, SexTable);
	const NavigationSystem = createNavigationSystem(DB);
	const ActorResourcePaths = createActorResourcePaths(DB, SexTable);
	const PetDatabase = createPetDatabase(DB);
	const signBoards = createSignBoardDatabase(userCharpage);
	const { loadSignBoardData, loadSignBoardList } = signBoards;
	const systemDatabase = createSystemDatabase(DB, userCharpage);
	const { loadAttendanceFile, loadTitleTable, loadQuestInfo, parseQuestEntry, loadCashShopBanner } = systemDatabase;
	const itemDatabase = createItemDatabase(DB, userCharpage, MsgStringTable);
	const {
		parseBuyingStoreItem,
		loadItemInfo,
		loadLaphineSysFile,
		loadLaphineUpgFile,
		loadItemDBTable,
		loadItemReformFile,
		loadEnchantListFile
	} = itemDatabase;
	const mapDatabase = createMapDatabase(DB, userCharpage);
	const { loadMapTbl, parseFogEntry, parseIndoorEntry, setMapAlias } = mapDatabase;
	const ownerNames = createOwnerNameResolver(DB);
	const emblemLoader = createEmblemLoader(DB);
	const { loadWorldMapInfo, loadTownInfoFile, loadPrivateAirship } = createMapLoaders(userCharpage);
	const { loadSkillInfoList, loadSkillTreeView } = createSkillLoaders(DB, userCharpage);
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
		setMessageRow,
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
		userCharpage
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
