import EquipLocation from 'DB/Items/EquipmentLocation.js';
import ItemType from 'DB/Items/ItemType.js';
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
export function isOwnOffhandWeapon(entity, sessionEntity, inventory, equipment) {
	if (!entity || !sessionEntity || entity.GID !== sessionEntity.GID) {
		return undefined;
	}

	if (equipment) {
		if (typeof equipment.getEquippedItemByLocation === 'function') {
			const item = equipment.getEquippedItemByLocation(EquipLocation.SHIELD);
			if (item) {
				return item.type === ItemType.WEAPON;
			}
		}
		if (typeof equipment.getEquippedItem === 'function' && inventory) {
			const indexes = inventory.equippedItems || [];
			for (let i = 0; i < indexes.length; i++) {
				const item = equipment.getEquippedItem(indexes[i]);
				const loc = item ? item.equipped || item.WearState || item.location || item.WearLocation || 0 : 0;
				if (loc & EquipLocation.SHIELD) {
					return item.type === ItemType.WEAPON;
				}
			}
		}
	}

	if (inventory) {
		const indexes = inventory.equippedItems || [];
		for (let i = 0; i < indexes.length; i++) {
			const item = typeof inventory.getItemByIndex === 'function' ? inventory.getItemByIndex(indexes[i]) : null;
			const loc = item ? item.equipped || item.WearState || item.location || item.WearLocation || 0 : 0;
			if (loc & EquipLocation.SHIELD) {
				return item.type === ItemType.WEAPON;
			}
		}
	}

	return false;
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
	const offhand = isOwnOffhandWeapon(entity, sessionEntity, inventory, equipment);

	const job = entity ? entity.job : undefined;
	const isAssassin = typeof DB.isAssassin === 'function' ? DB.isAssassin(job) : false;
	const isShield = typeof DB.isShield === 'function' ? DB.isShield(shield, job, offhand) : shield > 0;
	const getWeaponType = typeof DB.getWeaponType === 'function' ? (w, flag) => DB.getWeaponType(w, flag) : w => w;
	const getWeaponViewID = typeof DB.getWeaponViewID === 'function' ? w => DB.getWeaponViewID(w) : w => w;
	const isKatar = typeof DB.isKatar === 'function' ? wt => DB.isKatar(wt) : () => false;
	const mountWeapon =
		typeof DB.mountWeapon === 'function' ? (w1, w2) => DB.mountWeapon(w1, w2) : (w1, w2) => (w1 << 7) | w2;

	// When switching from katar to sword/knife, server can put it in left hand instead of right hand first.
	// Only apply this swap to Assassin-line jobs, never to non-dual-wield classes!
	if (isAssassin && weapon === 0 && shield !== 0 && !isShield) {
		weapon = shield;
		shield = 0;
	}

	const weaponType = getWeaponType(weapon, true);
	const viewId = getWeaponViewID(weapon);

	if (isAssassin && shield !== 0 && !isShield && weapon !== 0) {
		const secondaryWeaponType = getWeaponType(shield, true);
		return {
			weapon: mountWeapon(weaponType, secondaryWeaponType),
			shield: 0
		};
	}

	if (isKatar(weaponType)) {
		return {
			weapon: viewId,
			shield: viewId
		};
	}

	return {
		weapon: viewId,
		shield
	};
}
