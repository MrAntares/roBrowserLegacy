import EquipLocation from 'DB/Items/EquipmentLocation.js';
import ItemType from 'DB/Items/ItemType.js';
import DB from 'DB/DBManager.js';

/**
 * Check whether the local player is currently holding an offhand weapon.
 *
 * Resolvable only for our own character (entity.GID === sessionEntity.GID).
 * For other entities, the server transmits only view IDs without equipment
 * type metadata, so we return undefined (unknown) so callers can apply the
 * job-based dual-wield fallback.
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
	let weapon = weaponVal;
	let shield = shieldVal;
	const offhand = isOwnOffhandWeapon(entity, sessionEntity, inventory, equipment);

	// When switching from katar to sword/knife, server can put it in left hand instead of right hand first.
	if (weapon == 0 && shield != 0 && !DB.isShield(shield, entity.job, offhand)) {
		weapon = shield;
		shield = 0;
	}

	const weaponType = DB.getWeaponType(weapon, true);
	const viewId = DB.getWeaponViewID(weapon);

	if (DB.isAssassin(entity.job) && shield !== 0 && !DB.isShield(shield, entity.job, offhand) && weapon !== 0) {
		const secondaryWeaponType = DB.getWeaponType(shield, true);
		return {
			weapon: DB.mountWeapon(weaponType, secondaryWeaponType),
			shield: 0
		};
	}

	if (DB.isKatar(weaponType)) {
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
