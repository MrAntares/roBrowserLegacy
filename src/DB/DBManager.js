/**
 * DB/DBManager.js
 *
 * Manage and load DB files
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import { createDBServices } from 'DB/DBServices.js';

import * as JobClassification from 'DB/Jobs/JobClassification.js';
import { createJobGroups } from 'DB/Jobs/JobGroups.js';

import { getMonsterName } from 'DB/Monsters/MonsterDatabase.js';

import { getSkillName, getSkillDescription } from 'DB/Skills/SkillDescriptions.js';

import { getHatResource } from 'DB/Effects/HatEffectLoader.js';

import { HO_AI, MER_AI, default_HO_AI, default_MER_AI } from 'DB/Loaders/LuaRuntime.js';
import { createItemLink, parseItemLink, getItemNameFromLink } from 'DB/Items/ItemLink.js';
import { formatUnixDate, formatMsgToHtml } from 'DB/System/Formatting.js';

// Sex-specific asset path components.

// setup default encoding

// create decoders

/**
 * DB NameSpace
 */
let initialJobGroups = createJobGroups();

class DB {
	/**
	 * @type {Object} file alias list
	 */
	static mapalias = {};

	/**
	 * @type {Object} CharName by GID list
	 */
	static CNameTable = {};

	/**
	 * @type {string} interface path
	 */
	static INTERFACE_PATH = 'data/texture/\xc0\xaf\xc0\xfa\xc0\xce\xc5\xcd\xc6\xe4\xc0\xcc\xbd\xba/';

	/**
	 * @type {string} lua path
	 */
	static LUA_PATH = 'data/luafiles514/lua files/';

	/**
	 * @type {Object} UpdateOwnerName Table
	 */
	static UpdateOwnerName = {};

	/**
	 * Initialize DB
	 */
	static init() {
		return bootstrap.init(...arguments);
	}

	static isLoaded = false;
	static count = 0;
	static index = 0;
	static async lazyInit() {
		return bootstrap.lazyInit(...arguments);
	}
	static getHOAI_VM() {
		return HO_AI;
	}

	static getMERAI_VM() {
		return MER_AI;
	}

	static getDefaultHOAI_VM() {
		return default_HO_AI;
	}

	static getDefaultMERAI_VM() {
		return default_MER_AI;
	}

	static getAllTitles() {
		return systemDatabase.SystemDatabase.getAllTitles(...arguments);
	}

	static getAchievementTable() {
		return systemDatabase.SystemDatabase.getAchievementTable(...arguments);
	}

	static getTitleString(titleID) {
		return systemDatabase.SystemDatabase.getTitleString(...arguments);
	}

	static getSkillName(skillID) {
		return getSkillName(skillID);
	}

	/**
	 * Actor Type checks
	 *
	 * @param {number} jobid
	 */
	static isNPC(jobid) {
		return JobClassification.isNPC.call(this, jobid);
	}

	static isMercenary(jobid) {
		return JobClassification.isMercenary.call(this, jobid);
	}

	static isHomunculus(jobid) {
		return JobClassification.isHomunculus.call(this, jobid);
	}

	static isMonster(jobid) {
		return JobClassification.isMonster.call(this, jobid);
	}

	static isPlayer(jobid) {
		return JobClassification.isPlayer.call(this, jobid);
	}

	static isDoram(jobid) {
		return JobClassification.isDoram.call(this, jobid);
	}

	/**
	 * Is character id a baby ?
	 *
	 * @param {number} job id
	 * @return {boolean} is baby
	 */
	static isBaby(jobid) {
		return JobClassification.isBaby.call(this, jobid);
	}

	/**
	 * Is character a Assassin class
	 *
	 * @param {number} jobid
	 * @return {boolean}
	 */
	static S_JOBS_ASSASSIN = initialJobGroups.S_JOBS_ASSASSIN;

	static isAssassin(jobid) {
		return JobClassification.isAssassin.call(this, jobid);
	}

	/**
	 * Is character a Hunter class
	 *
	 * @param {number} jobid
	 * @return {boolean}
	 */
	static S_JOBS_HUNTER = initialJobGroups.S_JOBS_HUNTER;

	static isHunter(jobid) {
		return JobClassification.isHunter.call(this, jobid);
	}

	/**
	 * Is character a Monk class
	 *
	 * @param {number} jobid
	 * @return {boolean}
	 */
	static S_JOBS_MONK = initialJobGroups.S_JOBS_MONK;

	static isMonk(jobid) {
		return JobClassification.isMonk.call(this, jobid);
	}

	/**
	 * Is character a SN class
	 *
	 * @param {number} jobid
	 * @return {boolean}
	 */
	static S_JOBS_SN = initialJobGroups.S_JOBS_SN;

	static isSuperNovice(jobid) {
		return JobClassification.isSuperNovice.call(this, jobid);
	}

	/**
	 * Is character a TaeKwon class
	 *
	 * @param {number} jobid
	 * @return {boolean}
	 */
	static S_JOBS_TAEKWON = initialJobGroups.S_JOBS_TAEKWON;

	static isTaeKwon(jobid) {
		return JobClassification.isTaeKwon.call(this, jobid);
	}

	/**
	 * Is character a Gunslinger class
	 *
	 * @param {number} jobid
	 * @return {boolean}
	 */
	static S_JOBS_GS = initialJobGroups.S_JOBS_GS;

	static isGunslinger(jobid) {
		return JobClassification.isGunslinger.call(this, jobid);
	}

	/**
	 * Is character a Royal Guard class
	 *
	 * @param {number} jobid
	 * @return {boolean}
	 */
	static S_JOBS_RG = initialJobGroups.S_JOBS_RG;

	static isRoyalGuard(jobid) {
		return JobClassification.isRoyalGuard.call(this, jobid);
	}

	/**
	 * Is character using Madogear
	 *
	 * @param {number} jobid
	 * @return {boolean}
	 */
	static S_JOBS_MADO = initialJobGroups.S_JOBS_MADO;

	static isMadogear(jobid) {
		return JobClassification.isMadogear.call(this, jobid);
	}

	static isElem(jobid) {
		return JobClassification.isElem.call(this, jobid);
	}

	static isAbr(jobid) {
		return JobClassification.isAbr.call(this, jobid);
	}

	static isBionic(jobid) {
		return JobClassification.isBionic.call(this, jobid);
	}

	static isWarp(jobid) {
		return JobClassification.isWarp.call(this, jobid);
	}

	/**
	 * @return {string} path to body sprite/action
	 * @param {number} id entity
	 * @param {boolean} sex
	 * @param {number} alternative sprite
	 * @return {string}
	 */
	static getBodyPath(id, sex, alternative = -1, cashMountCostume = false) {
		return ActorResourcePaths.getBodyPath(...arguments);
	}

	/**
	 * @return {string} path of admin clothes
	 * @param {boolean} sex
	 */
	static getAdminPath(sex) {
		return ActorResourcePaths.getAdminPath(...arguments);
	}

	/**
	 * Whether the archive ships the halter-lead mounts' own palettes, read off
	 * a file only those archives have: asked once per archive.
	 *
	 * @param {function} onAnswer - called once the archive answers, if it has not yet
	 * @return {boolean|undefined} undefined until the archive answers
	 */
	static hasMountPalettes(onAnswer) {
		return bootstrap.hasMountPalettes(...arguments);
	}

	/**
	 * @return {string} path to body palette
	 * @param {number} id entity
	 * @param {number} pal
	 * @param {boolean} sex
	 */
	static getBodyPalPath(id, pal, sex) {
		return ActorResourcePaths.getBodyPalPath(...arguments);
	}

	/**
	 * @return {string} path to head sprite/action
	 * @param {number} id hair style
	 * @param {number} job job id
	 * @param {boolean} sex
	 * @param {boolean} orcish
	 */
	static getHeadPath(id, job, sex, orcish) {
		return ActorResourcePaths.getHeadPath(...arguments);
	}

	/**
	 * @return {string} path to head palette
	 * @param {number} id hair style
	 * @param {number} pal id
	 * @param {number} job job id
	 * @param {boolean} sex
	 */
	static getHeadPalPath(id, pal, job, sex) {
		return ActorResourcePaths.getHeadPalPath(...arguments);
	}

	/**
	 * @return {string} path to hat
	 * @param {number} id hair style
	 * @param {boolean} sex
	 */
	static getHatPath(id, sex) {
		return ActorResourcePaths.getHatPath(...arguments);
	}

	/**
	 * @return {string} path to Robe
	 * @param {number} id robe id
	 * @param {number} job class
	 * @param {boolean} sex
	 */
	static getRobePath(id, job, sex) {
		return ActorResourcePaths.getRobePath(...arguments);
	}

	/**
	 * @return {string} path to spr robe on costume root folder
	 * @param {number} id robe id
	 * @param {number} job class
	 * @param {boolean} sex
	 */
	static getRobePathNoSex(id, job, sex) {
		return ActorResourcePaths.getRobePathNoSex(...arguments);
	}

	/**
	 * @return {string} Path to pets equipements
	 * @param {number} id (pets)
	 */
	static getPetEquipPath(id) {
		return ActorResourcePaths.getPetEquipPath(...arguments);
	}

	/**
	 * @return {string} Path to pets equipements
	 * @param {number} id (pets)
	 */
	static getPetIllustPath(id) {
		return ActorResourcePaths.getPetIllustPath(...arguments);
	}

	/**
	 * Is the item ID a shield item?
	 * Only checks inventory item IDs, never view IDs.
	 *
	 * @param {integer} id item id
	 * @return {boolean}
	 */
	static isShieldItem(id) {
		return EquipmentRules.isShieldItem(...arguments);
	}

	/**
	 * is shield checking
	 *
	 * The left-hand slot can hold either an item ID or a view ID (ClassNum, <= 500).
	 * Shield views and weapon views share the same numeric range (1-500).
	 *
	 * When reliable offhand information is known (isOffhandWeapon === true/false),
	 * that flag distinguishes weapons from shields.
	 * When explicitly marked (isOffhandWeapon is true/false), that classification is honored.
	 * When unknown (isOffhandWeapon === undefined), ambiguous view IDs (<= 500) are preserved
	 * as shields unless reliable weapon evidence is present (e.g. item ID > 500), rather than
	 * assuming every assassin's shield view is a weapon.
	 *
	 * @param {integer} id item id or view id
	 * @param {integer} [job] job id of the owner
	 * @param {boolean} [isOffhandWeapon] explicitly marks whether the equipment is an offhand weapon
	 * @return {boolean} is shield?
	 *
	 * @author MrUnzO
	 */
	static isShield(id, job, isOffhandWeapon) {
		return EquipmentRules.isShield(...arguments);
	}

	/**
	 * Whether the reference client has a shield sprite for this job/view pair.
	 * The original check uses custom item sprites for IDs above 2000 and fixed
	 * job/view support for the four generic shield sprites.
	 * @param {number} job
	 * @param {number} shieldView shield item ID or generic shield view
	 * @returns {boolean}
	 */
	static hasJobShieldSprite(job, shieldView) {
		return EquipmentRules.hasJobShieldSprite(...arguments);
	}

	static getPCAttackMotion(job, sex, itemID, isDualWeapon) {
		return EquipmentRules.getPCAttackMotion(...arguments);
	}

	static isDualWeapon(job, sex, weaponType) {
		return EquipmentRules.isDualWeapon(...arguments);
	}

	static getWeaponType(itemID, realType = false, considerDualHandIds = false) {
		return EquipmentRules.getWeaponType(...arguments);
	}

	/**
	 * @return {string} Path to shield
	 * @param {number} id shield
	 * @param {number} job class
	 * @param {boolean} sex
	 */
	static getShieldPath(id, job, sex, isMounted = false) {
		return EquipmentRules.getShieldPath(...arguments);
	}

	/**
	 * Convert an equipped shield item ID to the view value used by the generic
	 * shield resource fallback. Packet view IDs are already in this form.
	 * @param {number} id item ID or view ID
	 * @returns {number}
	 */
	static getShieldViewID(id) {
		return EquipmentRules.getShieldViewID(...arguments);
	}

	/**
	 * @return {string} Path to weapon
	 * @param {number} id weapon
	 * @param {number} job class
	 * @param {boolean} sex
	 */
	static getWeaponPath(id, job, sex, leftid = false) {
		return EquipmentRules.getWeaponPath(...arguments);
	}

	/**
	 * @return {string} Path to weapon trail
	 * @param {number} id weapon
	 * @param {number} job class
	 * @param {boolean} sex
	 */
	static getWeaponTrail(id, job, sex) {
		return EquipmentRules.getWeaponTrail(...arguments);
	}

	/**
	 * Resolve the generic weapon-effect sprite used by ACT layer 6 in the
	 * reference client. `id` is a weapon item/view ID; -1 selects a class-only
	 * effect name (used by special job effects).
	 * @param {number} id weapon item or view ID, or -1 for class-only effects
	 * @param {number} job class
	 * @param {number} sex
	 * @param {number} effect 0 = weapon glow, 1 = class aura
	 * @returns {string|null}
	 */
	static getWeaponEffectPath(id, job, sex, effect = 0) {
		return EquipmentRules.getWeaponEffectPath(...arguments);
	}

	/**
	 * @param {number} cart id
	 */
	static getCartPath(num) {
		return EquipmentRules.getCartPath(...arguments);
	}

	/**
	 * @return {string} Path to weapon sound
	 * @param {number} weapon id
	 */
	static getWeaponSound(id) {
		return EquipmentRules.getWeaponSound(...arguments);
	}

	/**
	 * @return {string} Path to eapon sound
	 * @param {number} weapon id
	 */
	static getWeaponHitSound(id) {
		return EquipmentRules.getWeaponHitSound(...arguments);
	}

	/**
	 * @return {string} Path to eapon sound [MrUnzO]
	 * @param {number} weapon id
	 */
	static getJobHitSound(job_id) {
		return EquipmentRules.getJobHitSound(...arguments);
	}

	/**
	 * @return {number} weapon viewid
	 * @param {number} id weapon
	 */
	static getWeaponViewID(id) {
		return EquipmentRules.getWeaponViewID(...arguments);
	}

	/**
	 * @return {number} weapon action frame
	 * @param {number} id weapon
	 * @param {number} job
	 * @param {number} sex
	 */
	static getWeaponAction(id, job, sex) {
		return EquipmentRules.getWeaponAction(...arguments);
	}

	/**
	 * @return {{frame: number, length: number}|null} attack slice for jobs with combined action sheets
	 * @param {number} job
	 * @param {number} weapon
	 */
	static getAttackSlice(job, weapon) {
		return EquipmentRules.getAttackSlice(...arguments);
	}

	/**
	 * Resolve Assassin-family dual-wield categories from the original item ID ranges.
	 * The client uses these ranges in CPc::GetDualWieldWeaponType (RVA 0x00DAB460).
	 */
	static getDualWieldWeaponType(firstItemId, secondItemId) {
		return EquipmentRules.getDualWieldWeaponType(...arguments);
	}

	static mountWeapon(weaponID, shieldID) {
		return EquipmentRules.mountWeapon(...arguments);
	}

	static isBow(weaponType) {
		return EquipmentRules.isBow(...arguments);
	}

	static isKatar(weaponType) {
		return EquipmentRules.isKatar(...arguments);
	}

	/**
	 * Get back informations from id
	 *
	 * @param {number} item id
	 * @return {object} item
	 */
	static getItemInfo(itemid) {
		return itemDatabase.ItemDatabase.getItemInfo(...arguments);
	}

	/**
	 * Get back item path
	 *
	 * @param {number} item id
	 * @param {boolean} is identify
	 * @return {string} path
	 */
	static getItemPath(itemid, identify) {
		return itemDatabase.ItemDatabase.getItemPath(...arguments);
	}

	/**
	 * Get full item name
	 *
	 * @param {object} item - The item object containing details about the item.
	 * @param {object} [options] - Optional parameters to customize the output.
	 * @param {boolean} [options.showItemRefine=true] - Whether to show the refining level of the item.
	 * @param {boolean} [options.showItemGrade=true] - Whether to show the grade of the item.
	 * @param {boolean} [options.showItemSlots=true] - Whether to show the number of slots on the item.
	 * @param {boolean} [options.showItemPrefix=true] - Whether to show the prefix of the item.
	 * @param {boolean} [options.showItemPostfix=true] - Whether to show the postfix of the item.
	 * @param {boolean} [options.showItemOptions=true] - Whether to show the number of options on the item.
	 * @return {string} - The full name of the item with all applicable details.
	 */
	static getItemName(item, options = {}) {
		return itemDatabase.ItemDatabase.getItemName(...arguments);
	}

	/**
	 * Get random option name
	 *
	 * @param {integer} id
	 * @return {string} item full name
	 */
	static getOptionName(id) {
		return itemDatabase.ItemDatabase.getOptionName(...arguments);
	}
	/**
	 * Get a message from msgstringtable
	 *
	 * @param {number} message id
	 * @param {string} optional string to show if the text isn't defined
	 * @return {string} message
	 */
	static getMessage(id, defaultText) {
		return systemDatabase.SystemDatabase.getMessage(...arguments);
	}

	/**
	 * Get a message string from the MsgEmotionCSV
	 *
	 * @param {string} key - The key to search for
	 * @return {string|null} - The value associated with the given key, or null if not found.
	 */
	static getMessageEmotionCSV(keyOrIndex) {
		return systemDatabase.SystemDatabase.getMessageEmotionCSV(...arguments);
	}

	/**
	 * Get Skill Description from DB
	 *
	 * @param {number} skill id
	 */
	static getSkillDescription(id) {
		return getSkillDescription(id);
	}

	/**
	 * @param {string} filename
	 * @return {object}
	 */
	static getMap(mapname) {
		return mapDatabase.MapDatabase.getMap(...arguments);
	}

	/**
	 * Get a message from msgstringtable
	 *
	 * @param {string} mapname
	 * @param {string} default name if not found
	 * @return {string} map location
	 */
	static getMapName(mapname, defaultName) {
		return mapDatabase.MapDatabase.getMapName(...arguments);
	}

	/**
	 * Get monster name
	 *
	 * @param {number} job id
	 */
	static getMonsterName(job) {
		return getMonsterName(job);
	}

	/**
	 * Get back town information by mapname
	 * @param {number} efst id
	 */
	static getTownInfo(mapname) {
		return mapDatabase.MapDatabase.getTownInfo(mapname);
	}

	/**
	 * Get back map information by mapname
	 * @param {number} efst id
	 */
	static getMapInfo(mapname) {
		return mapDatabase.MapDatabase.getMapInfo(...arguments);
	}

	/**
	 * Get the whole Laphine Synthesis Table
	 * @returns LaphineSysTable
	 */
	static getLaphineSysList() {
		return itemDatabase.ItemDatabase.getLaphineSysList(...arguments);
	}

	/**
	 * Get Laphine Synthesis information by itemId
	 * @param {number} itemId
	 * @returns LaphineSysTable[key] if itemId found
	 */
	static getLaphineSysInfoById(itemId) {
		return itemDatabase.ItemDatabase.getLaphineSysInfoById(...arguments);
	}

	/**
	 * Retrieves the Laphine Upgrade Table.
	 *
	 * @return {Object} The Laphine Upgrade Table.
	 */
	static getLaphineUpgList() {
		return itemDatabase.ItemDatabase.getLaphineUpgList(...arguments);
	}

	/**
	 * Retrieves the Laphine Upgrade information by the given item ID.
	 *
	 * @param {number} itemId - The ID of the item to search for.
	 * @return {Object|null} The Laphine Upgrade information if found, or null if not found.
	 */
	static getLaphineUpgInfoById(itemId) {
		return itemDatabase.ItemDatabase.getLaphineUpgInfoById(...arguments);
	}

	/**
	 * Retrieves the Enchant group info by the given group ID.
	 *
	 * @param {number} groupId - The Enchant group ID.
	 * @return {Object|null} The Enchant group info if found, or null.
	 */
	static getEnchantGroup(groupId) {
		return itemDatabase.ItemDatabase.getEnchantGroup(...arguments);
	}

	/**
	 * Retrieves all Enchant groups.
	 *
	 * @return {Object} Enchant group table.
	 */
	static getEnchantGroups() {
		return itemDatabase.ItemDatabase.getEnchantGroups(...arguments);
	}

	/**
	 * Retrieves Enchant slot info by group and slot.
	 *
	 * @param {number} groupId - The Enchant group ID.
	 * @param {number} slotNum - Slot index.
	 * @return {Object|null} Enchant slot info if found.
	 */
	static getEnchantSlot(groupId, slotNum) {
		return itemDatabase.ItemDatabase.getEnchantSlot(...arguments);
	}

	/**
	 * Returns the item ID associated with a given base item.
	 *
	 * @param {string} baseItem - The base item to get the ID for.
	 * @return {number} The item ID associated with the base item.
	 */
	static getItemIdfromBase(baseItem) {
		return itemDatabase.ItemDatabase.getItemIdfromBase(...arguments);
	}

	/**
	 * Retrieves the base item associated with a given item ID.
	 *
	 * @param {number} itemId - The ID of the item to search for.
	 * @return {string|null} The base item associated with the item ID, or null if not found.
	 */
	static getBasefromItemID(itemId) {
		return itemDatabase.ItemDatabase.getBasefromItemID(...arguments);
	}

	/**
	 * Finds the reform list associated with a given item ID.
	 *
	 * @param {number} itemId - The ID of the item to search for.
	 * @return {Object|null} The reform list associated with the item ID, or null if not found.
	 */
	static findReformListByItemID(itemId) {
		return itemDatabase.ItemDatabase.findReformListByItemID(...arguments);
	}

	/**
	 * Retrieves the reform information for a given reform ID.
	 *
	 * @param {string} reformId - The ID of the reform to retrieve information for.
	 * @return {Object|null} The reform information object if found, or null if not found.
	 */
	static getReformInfo(reformId) {
		return itemDatabase.ItemDatabase.getReformInfo(...arguments);
	}

	/**
	 * Retrieves information for all reform IDs in the provided array.
	 *
	 * @param {Array} reformIds - An array of reform IDs to retrieve information for.
	 * @return {Array} An array of reform information objects.
	 */
	static getAllReformInfos(reformIds) {
		return itemDatabase.ItemDatabase.getAllReformInfos(...arguments);
	}

	/**
	 * Finds a signboard in the given map based on the provided coordinates.
	 *
	 * @param {string} mapname - The name of the map to search in.
	 * @param {number} x - The x-coordinate of the signboard.
	 * @param {number} y - The y-coordinate of the signboard.
	 * @param {number} [tolerance=1] - The tolerance value for matching coordinates.
	 * @return {Object|null} The signboard object if found, or null if not found.
	 */
	static findSignboard(mapname, x, y, tolerance = 1) {
		return signBoards.SignBoardDatabase.findSignboard(...arguments);
	}

	/**
	 * Get all signboards for a specific map
	 * @param {string} mapname - Map name
	 * @return {Object} Signboard data for the map
	 */
	static getAllSignboardsForMap(mapname) {
		return signBoards.SignBoardDatabase.getAllSignboardsForMap(...arguments);
	}

	/**
	 * Retrieves the translated signboard description based on the provided description.
	 *
	 * @param {string} description - The description of the signboard.
	 * @return {string} The translated signboard description if found, otherwise the original description.
	 */
	static getTranslatedSignBoard(description) {
		return signBoards.SignBoardDatabase.getTranslatedSignBoard(...arguments);
	}

	static getRandomJoke() {
		return systemDatabase.SystemDatabase.getRandomJoke(...arguments);
	}

	static getRandomScream() {
		return systemDatabase.SystemDatabase.getRandomScream(...arguments);
	}

	/**
	 * @type {Object<number, Function[]>} Pending name-resolution callbacks keyed by GID
	 * @private
	 */
	static _nameCallbacks = {};

	/**
	 * @type {Object<number, ReturnType<typeof setTimeout>>} Per-GID TTL timers
	 * @private
	 */
	static _nameCallbackTimers = {};

	/**
	 * Request a character name by GID from the server.
	 * Returns a Promise that resolves with the name once the server responds.
	 * If the name is already cached, resolves immediately.
	 * If a request is already in-flight, piggybacks on the pending response.
	 *
	 * If the server never responds within `ttl` milliseconds the pending
	 * callbacks are resolved with 'Unknown', the CNameTable entry is cleared
	 * (so the next caller can retry), and all references are freed.
	 *
	 * @param {number} GID
	 * @param {number} [ttl=8000] - Milliseconds before treating the request as timed-out
	 * @returns {Promise<string>} resolves with the character name
	 */
	static getNameByGID(GID, ttl = 8000) {
		return ownerNames.OwnerNameResolver.getNameByGID(...arguments);
	}

	/**
	 * Notify all pending name-resolution callbacks for a GID.
	 * Called internally when a name response packet arrives.
	 *
	 * @param {number} GID
	 * @param {string} name
	 * @private
	 */
	static _resolveNameCallbacks(GID, name) {
		return ownerNames.OwnerNameResolver._resolveNameCallbacks(...arguments);
	}

	/**
	 * Get Pet talk message
	 *
	 * @param {integer} message data combined with mob id, hungryState, actionState
	 * @return {string} pet telk sentence
	 *
	 * @author MrUnzO
	 */
	static getPetTalk(data) {
		return PetDatabase.getPetTalk(...arguments);
	}

	/**
	 * Get Pet Hungry state
	 *
	 * @param {integer} hunger
	 * @return {integer} hunger state
	 *
	 * @author MrUnzO
	 */
	static getPetHungryState(hunger) {
		return PetDatabase.getPetHungryState(...arguments);
	}

	/**
	 * Get Pet Friendly state
	 *
	 * @param {integer} friendly
	 * @return {integer} friendly state
	 *
	 * @author MrUnzO
	 */
	static getPetFriendlyState(friendly) {
		return PetDatabase.getPetFriendlyState(...arguments);
	}

	/**
	 * Get Pet Action text
	 *
	 * @param {integer} action
	 * @return {string} action string
	 *
	 * @author MrUnzO
	 */
	static getPetActText(action) {
		return PetDatabase.getPetActText(...arguments);
	}

	/**
	 * Get Pet Hungry state text
	 *
	 * @param {integer} hungry state
	 * @return {String} hungry state text
	 *
	 * @author MrUnzO
	 */
	static getPetHungryText(state) {
		return PetDatabase.getPetHungryText(...arguments);
	}

	/**
	 * Get Pet Emotion ID
	 *
	 * @param {integer} hungry state
	 * @param {integer} friendly state
	 * @param {integer} action
	 * @return {integer} emotion id
	 *
	 * @author MrUnzO
	 */
	static getPetEmotion(hunger, friendly, act) {
		return PetDatabase.getPetEmotion(...arguments);
	}

	/**
	 * Get Pet talk number message (for send to server to distribute)
	 *
	 * @param {integer} job (mob id)
	 * @param {integer} action
	 * @param {integer} hungry state
	 * @return {integer} message data
	 *
	 * @author MrUnzO
	 */
	static getPetTalkNumber(job, act, hungry) {
		return PetDatabase.getPetTalkNumber(...arguments);
	}

	/**
	 * Indoor checking
	 *
	 * @param {string} map name
	 * @return {boolean} is indoor?
	 *
	 * @author MrUnzO
	 */
	static isIndoor(mapname) {
		return mapDatabase.MapDatabase.isIndoor(...arguments);
	}

	/**
	 * Get Quest Info by ID
	 *
	 * @param {integer} questID (quest id)
	 *
	 * @author alisonrag
	 */
	static getQuestInfo(questID) {
		return systemDatabase.SystemDatabase.getQuestInfo(...arguments);
	}

	static getCheckAttendanceInfo() {
		return systemDatabase.SystemDatabase.getCheckAttendanceInfo(...arguments);
	}

	static getBuyingStoreItemList() {
		return itemDatabase.ItemDatabase.getBuyingStoreItemList(...arguments);
	}

	static isBuyable(id) {
		return itemDatabase.ItemDatabase.isBuyable(...arguments);
	}

	/**
	 * Is item id a pet egg?
	 *
	 * Used for older versions,
	 * because item type PETEGG didn't exist back then
	 * and type ARMOR was used with equip location 0,
	 * but this is not usable in vending since location
	 * is not received with packet...
	 *
	 * @param {integer} id
	 * @returns {boolean}
	 */
	static isPetEgg(id) {
		return itemDatabase.ItemDatabase.isPetEgg(...arguments);
	}

	/**
	 * Get Job Class Category
	 *
	 * @param {integer} JobId
	 *
	 */
	static getJobClass(job) {
		return JobClassification.getJobClass(job);
	}

	/**
	 * Load Clan Emblem file
	 * Icons for group reads from texture/유저인터페이스/clan_system/...
	 *
	 * @param {integer} clanId
	 * @param {function} callback to run once the file is loaded
	 *
	 * @author alisonrag
	 */
	static loadClanEmblem(clanId, callback) {
		return emblemLoader.loadClanEmblem(...arguments);
	}

	/**
	 * Load Group Emblem file
	 * Icons for group reads from texture/유저인터페이스/group/...
	 *
	 * @param {integer} groupId
	 * @param {function} callback to run once the file is loaded
	 *
	 * @author alisonrag
	 */
	static loadGroupEmblem(groupId, callback) {
		return emblemLoader.loadGroupEmblem(...arguments);
	}

	/**
	 * Load Mob Type file
	 * Icons for Miniboss and MVP from texture/À¯ÀúÀÎÅÍÆäÀÌ½º/montype_...bmp
	 *
	 * @param {integer} mobType
	 * @param {function} callback to run once the file is loaded
	 *
	 */
	static loadMobEmblem(mobType, callback) {
		return emblemLoader.loadMobEmblem(...arguments);
	}
	/**
	 * Get grouped monster entries for a single navigation map.
	 *
	 * @param {string} mapName
	 * @returns {Array<Object>} grouped monsters in that map
	 */
	static getNavigationMapMonsters(mapName) {
		return NavigationSystem.getNavigationMapMonsters(...arguments);
	}

	/**
	 * Search for NPCs or MOBs in the navigation tables
	 *
	 * @param {string} query - The search query
	 * @param {string} type - The type of search (ALL, NPC, MOB)
	 * @returns {Array} Array of search results
	 */
	static searchNavigation(query, type) {
		return NavigationSystem.searchNavigation(...arguments);
	}

	/**
	 * Get the default navigation point for a map.
	 * Used by the World Map and MAP search results to route to a map even
	 * when there is no exact NPC/monster coordinate.
	 *
	 * @param {string} mapName
	 * @returns {{x:number,y:number}|null}
	 */
	static getNaviMapPoint(mapName) {
		return NavigationSystem.getNaviMapPoint(...arguments);
	}

	/**
	 * Get a readable navigation map name when available.
	 *
	 * @param {string} mapName
	 * @returns {string}
	 */
	static getNaviMapDisplayName(mapName) {
		return NavigationSystem.getNaviMapDisplayName(...arguments);
	}

	/**
	 * Get the NaviLinkTable
	 *
	 * @returns {Array} The NaviLinkTable
	 */
	static getNaviLinkTable() {
		return NavigationSystem.getNaviLinkTable(...arguments);
	}

	/**
	 * Get the NaviLinkDistanceTable
	 *
	 * @returns {Array} The NaviLinkDistanceTable
	 */
	static getNaviLinkDistanceTable() {
		return NavigationSystem.getNaviLinkDistanceTable(...arguments);
	}

	/**
	 * Get the NaviNpcDistanceTable
	 *
	 * @returns {Array} The NaviNpcDistanceTable
	 */
	static getNaviNpcDistanceTable() {
		return NavigationSystem.getNaviNpcDistanceTable(...arguments);
	}

	static createItemLink(item) {
		return createItemLink(item);
	}

	static parseItemLink(itemLink) {
		return parseItemLink(itemLink, item => DB.getItemName(item));
	}

	static getItemNameFromLink(itemLink) {
		return getItemNameFromLink(itemLink, item => DB.parseItemLink(item));
	}

	/**
	 * Format a Unix timestamp (seconds) into MM/DD HH:mm
	 *
	 * @param {number} unixTimestamp - Unix time in seconds
	 * @returns {string} Formatted date string (MM/DD HH:mm)
	 */
	static formatUnixDate(unixTimestamp) {
		return formatUnixDate(unixTimestamp);
	}

	/**
	 * Convert RO color codes (^RRGGBB) to HTML spans
	 *
	 * @param {string} msg - Message with RO color codes
	 * @returns {string} Message formatted to HTML
	 */
	static formatMsgToHtml(msg) {
		return formatMsgToHtml(msg);
	}

	/**
	 * Get pet data by job ID
	 *
	 * @param {number} jobID - Job ID
	 * @returns {?Object} Pet data or null if not found
	 */
	static getPetByJobID(jobID) {
		return PetDatabase.getPetByJobID(...arguments);
	}

	/**
	 * Get pet evolution data by job ID
	 *
	 * @param {number} jobID - Job ID
	 * @returns {?Object} Pet evolution data or null if not found
	 */
	static getPetEvolutionByJob(jobID) {
		return PetDatabase.getPetEvolutionByJob(...arguments);
	}

	/**
	 * Get pet data by pet egg ID
	 *
	 * @param {number|string} eggID - Pet egg ID
	 * @returns {?Object} Pet data or null if not found
	 */
	static getPetByEggID(eggID) {
		return PetDatabase.getPetByEggID(...arguments);
	}

	/**
	 * Get the entire reputation group list
	 *
	 * @returns {Object} Reputation group list
	 */
	static getReputeGroup() {
		return systemDatabase.SystemDatabase.getReputeGroup(...arguments);
	}

	/**
	 * Get the reputation group list for a given group id
	 *
	 * @param {string} repute_group - Reputation group id
	 * @returns {?Object} Reputation group list or null if not found
	 */
	static getReputeGroupList(repute_group) {
		return systemDatabase.SystemDatabase.getReputeGroupList(...arguments);
	}

	/**
	 * Get the entire reputation information list
	 *
	 * @returns {Object} Reputation information list
	 */
	static getReputeInfo() {
		return systemDatabase.SystemDatabase.getReputeInfo(...arguments);
	}

	/**
	 * Get the reputation data for a given reputation ID
	 *
	 * @param {number|string} repute_id - Reputation ID
	 * @returns {?Object} Reputation data or null if not found
	 */
	static getReputeData(repute_id) {
		return systemDatabase.SystemDatabase.getReputeData(...arguments);
	}

	/**
	 * Get a Hateffect Info by ID
	 * @param {number} id - Hateffect ID
	 * @returns {Object|null} Hateffect info or null if not found
	 */
	static getHatResource(id) {
		return getHatResource(id);
	}

	/**
	 * Get the CashShopBannerTable
	 *
	 * @returns {Array} CashShopBannerTable
	 */
	static getCashShopBannerTable() {
		return systemDatabase.SystemDatabase.getCashShopBannerTable(...arguments);
	}
}

initialJobGroups = null;

const {
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
} = createDBServices(DB);

export default DB;
