import EquipLocation from 'DB/Items/EquipmentLocation.js';
import ItemType from 'DB/Items/ItemType.js';
import WeaponType from 'DB/Items/WeaponType.js';
import DB from 'DB/DBManager.js';

/**
 * Check whether the local player is currently holding an offhand weapon.
 *
 * Resolvable only for our own character (entity.GID === sessionEntity.GID).
 * For other entities, the server transmits only view IDs without equipment
 * type metadata, so we return undefined (unknown) so callers can preserve
 * ambiguous offhand views as shields unless explicit weapon evidence is provided.
 *
 * @param {object} entity - Target entity
 * @param {object} sessionEntity - Local player entity (Session.Entity)
 * @param {object} [inventory] - Inventory component
 * @param {object} [equipment] - Equipment component
 * @returns {boolean|undefined} true if own offhand is weapon, false if own offhand is not weapon, undefined if unknown/other entity
 */
function getOwnEquippedItem(entity, sessionEntity, inventory, equipment, location) {
	if (!entity || !sessionEntity || entity.GID !== sessionEntity.GID) {
		return undefined;
	}

	if (equipment) {
		if (typeof equipment.getEquippedItemByLocation === 'function') {
			const item = equipment.getEquippedItemByLocation(location);
			if (item) {
				return item;
			}
		}
		if (typeof equipment.getEquippedItem === 'function' && inventory) {
			const indexes = inventory.equippedItems || [];
			for (let i = 0; i < indexes.length; i++) {
				const item = equipment.getEquippedItem(indexes[i]);
				const loc = item ? item.equipped || item.WearState || item.location || item.WearLocation || 0 : 0;
				if (loc & location) {
					return item;
				}
			}
		}
	}

	if (inventory) {
		const indexes = inventory.equippedItems || [];
		for (let i = 0; i < indexes.length; i++) {
			const item = typeof inventory.getItemByIndex === 'function' ? inventory.getItemByIndex(indexes[i]) : null;
			const loc = item ? item.equipped || item.WearState || item.location || item.WearLocation || 0 : 0;
			if (loc & location) {
				return item;
			}
		}
	}

	return null;
}

function getOwnOffhandItem(entity, sessionEntity, inventory, equipment) {
	return getOwnEquippedItem(entity, sessionEntity, inventory, equipment, EquipLocation.SHIELD);
}

export function isOwnOffhandWeapon(entity, sessionEntity, inventory, equipment) {
	const item = getOwnOffhandItem(entity, sessionEntity, inventory, equipment);
	return item === undefined ? undefined : !!item && item.type === ItemType.WEAPON;
}

/**
 * Resolve weapon and shield values for an entity given packet values.
 * Used by both spawn (onEntitySpam) and view change (onEntityViewChange) handling.
 *
 * @param {number} weaponVal - Weapon ID or view ID from packet
 * @param {number} shieldVal - Shield / offhand ID or view ID from packet
 * @param {object} entity - Entity being updated
 * @param {object} sessionEntity - Local player entity (Session.Entity)
 * @param {object} [inventory] - Inventory component
 * @param {object} [equipment] - Equipment component
 * @returns {{ weapon: number, shield: number }}
 */
export function resolveEntityWeapons(weaponVal, shieldVal, entity, sessionEntity, inventory, equipment) {
	let weapon = weaponVal || 0;
	let shield = shieldVal || 0;
	const ownMainHandItem = getOwnEquippedItem(entity, sessionEntity, inventory, equipment, EquipLocation.WEAPON);
	const ownOffhandItem = getOwnOffhandItem(entity, sessionEntity, inventory, equipment);
	const mainHandItemId = ownMainHandItem && ownMainHandItem.ITID ? ownMainHandItem.ITID : weapon;
	const offhand =
		ownOffhandItem === undefined ? undefined : !!ownOffhandItem && ownOffhandItem.type === ItemType.WEAPON;
	if (
		ownOffhandItem &&
		ownOffhandItem.ITID &&
		(offhand || (typeof DB.isShieldItem === 'function' && DB.isShieldItem(ownOffhandItem.ITID)))
	) {
		// Local equipment carries the real item ID, allowing both the shield's
		// job-specific sprite and the weapon/shield ambiguity to be resolved.
		shield = ownOffhandItem.ITID;
	}

	const job = entity ? entity.job : undefined;
	const isAssassin = typeof DB.isAssassin === 'function' ? DB.isAssassin(job) : false;
	const getWeaponType = typeof DB.getWeaponType === 'function' ? (w, flag) => DB.getWeaponType(w, flag) : w => w;
	const getWeaponViewID = typeof DB.getWeaponViewID === 'function' ? w => DB.getWeaponViewID(w) : w => w;
	const isKatar = typeof DB.isKatar === 'function' ? wt => DB.isKatar(wt) : () => false;
	const mountWeapon =
		typeof DB.mountWeapon === 'function' ? (w1, w2) => DB.mountWeapon(w1, w2) : (w1, w2) => (w1 << 7) | w2;

	let weaponType = getWeaponType(mainHandItemId, true);
	const offhandType = getWeaponType(shield, true);

	// Katar's ACT/SPR is already the complete Katar visual; it has no separate shield resource.
	// Some sprite updates put the Katar view in the second value, so accept it there for Assassin jobs.
	if (isKatar(weaponType)) {
		return { weapon: getWeaponViewID(weapon), shield: 0 };
	}
	if (isAssassin && weapon === 0 && shield !== 0 && isKatar(offhandType)) {
		weapon = shield;
		shield = 0;
		weaponType = offhandType;
	}

	let isShield = typeof DB.isShield === 'function' ? DB.isShield(shield, job, offhand) : shield > 0;
	// A weapon may arrive in the second value first while changing equipment; move it to the primary slot.
	if (isAssassin && weapon === 0 && shield !== 0 && !isShield) {
		weapon = shield;
		shield = 0;
		weaponType = getWeaponType(weapon, true);
		isShield = false;
	}
	const viewId = getWeaponViewID(weapon);

	if (isAssassin && shield !== 0 && !isShield && weapon !== 0) {
		const secondaryWeaponType = getWeaponType(shield, true);
		const combinedType =
			offhand && ownMainHandItem && ownOffhandItem && typeof DB.getDualWieldWeaponType === 'function'
				? DB.getDualWieldWeaponType(ownMainHandItem.ITID, ownOffhandItem.ITID)
				: mountWeapon(weaponType, secondaryWeaponType);
		const resolvedType =
			combinedType === WeaponType.NONE ||
			combinedType === WeaponType.TWOHANDAXE ||
			combinedType === WeaponType.MACE
				? WeaponType.SWORD
				: combinedType;
		return {
			weapon: resolvedType,
			shield: 0
		};
	}

	return {
		weapon: viewId,
		shield
	};
}
