import EquipLocation from 'DB/Items/EquipmentLocation.js';
import ItemType from 'DB/Items/ItemType.js';

/**
 * Only resolvable for our own character. Other entities: server sends only
 * view IDs, so we return false (shield default).
 */
export function isOwnOffhandWeapon(entity, sessionEntity, inventory) {
	if (!entity || !sessionEntity || entity.GID !== sessionEntity.GID || !inventory) {
		return false;
	}
	const indexes = inventory.equippedItems || [];
	for (let i = 0; i < indexes.length; i++) {
		const item = inventory.getItemByIndex(indexes[i]);
		const loc = item ? item.WearState || item.location || 0 : 0;
		if (loc & EquipLocation.SHIELD) {
			return item.type === ItemType.WEAPON;
		}
	}
	return false;
}
