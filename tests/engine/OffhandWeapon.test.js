import { describe, it, expect } from 'vitest';
import { isOwnOffhandWeapon, resolveEntityWeapons } from 'Engine/MapEngine/OffhandWeapon.js';
import EquipLocation from 'DB/Items/EquipmentLocation.js';
import ItemType from 'DB/Items/ItemType.js';
import DB from 'DB/DBManager.js';
import JobId from 'DB/Jobs/JobConst.js';

const me = { GID: 100 };
const other = { GID: 999 };

const makeInv = items => ({
	equippedItems: items.map(i => i.index),
	getItemByIndex: idx => items.find(i => i.index === idx)
});

function createInventoryAndEquipment() {
	const inv = {
		list: [],
		equippedItems: [],
		addItem(item) {
			this.list.push(item);
		},
		getItemByIndex(idx) {
			return this.list.find(i => i.index === idx);
		},
		removeItem(idx) {
			const index = this.list.findIndex(i => i.index === idx);
			if (index !== -1) {
				return this.list.splice(index, 1)[0];
			}
			return null;
		}
	};

	const equip = {
		_list: {},
		equip(item, location) {
			item.equipped = location;
			this._list[item.index] = item;
			if (!inv.equippedItems.includes(item.index)) {
				inv.equippedItems.push(item.index);
			}
		},
		unEquip(idx) {
			const item = this._list[idx];
			delete this._list[idx];
			const eqIdx = inv.equippedItems.indexOf(idx);
			if (eqIdx !== -1) {
				inv.equippedItems.splice(eqIdx, 1);
			}
			return item;
		},
		getEquippedItem(idx) {
			return this._list[idx] || null;
		},
		getEquippedItemByLocation(location) {
			for (const key in this._list) {
				const item = this._list[key];
				const loc = item ? item.equipped || item.WearState || item.location || item.WearLocation || 0 : 0;
				if (loc & location) {
					return item;
				}
			}
			return null;
		}
	};

	return { inv, equip };
}

describe('isOwnOffhandWeapon', () => {
	it('returns true when own left hand holds a weapon in inventory fallback', () => {
		const inv = makeInv([{ index: 2, type: ItemType.WEAPON, WearState: EquipLocation.SHIELD }]);
		expect(isOwnOffhandWeapon(me, me, inv)).toBe(true);
	});

	it('returns false when own left hand holds a shield in inventory fallback', () => {
		const inv = makeInv([{ index: 3, type: ItemType.ARMOR, WearState: EquipLocation.SHIELD }]);
		expect(isOwnOffhandWeapon(me, me, inv)).toBe(false);
	});

	it('ignores right-hand weapons', () => {
		const inv = makeInv([{ index: 1, type: ItemType.WEAPON, WearState: EquipLocation.WEAPON }]);
		expect(isOwnOffhandWeapon(me, me, inv)).toBe(false);
	});

	it('falls back to location when WearState is missing', () => {
		const inv = makeInv([{ index: 2, type: ItemType.WEAPON, location: EquipLocation.SHIELD }]);
		expect(isOwnOffhandWeapon(me, me, inv)).toBe(true);
	});

	it('returns undefined for other entities so callers can use job-based fallback', () => {
		const inv = makeInv([{ index: 2, type: ItemType.WEAPON, WearState: EquipLocation.SHIELD }]);
		expect(isOwnOffhandWeapon(other, me, inv)).toBeUndefined();
	});

	it('is safe with missing inventory / session / unknown index', () => {
		expect(isOwnOffhandWeapon(me, null, makeInv([]))).toBeUndefined();
		expect(isOwnOffhandWeapon(null, me, makeInv([]))).toBeUndefined();
		expect(isOwnOffhandWeapon(me, me, null)).toBe(false);
		expect(isOwnOffhandWeapon(me, me, { equippedItems: [7], getItemByIndex: () => undefined })).toBe(false);
	});

	it('resolves offhand weapon when item is moved from inventory to equipment', () => {
		const { inv, equip } = createInventoryAndEquipment();
		const dagger = { index: 10, ITID: 1201, type: ItemType.WEAPON, location: EquipLocation.SHIELD };
		inv.addItem(dagger);

		expect(inv.getItemByIndex(10)).toBe(dagger);

		// Equipment.equip workflow: item is removed from inventory and moved to equipment
		const item = inv.removeItem(10);
		equip.equip(item, EquipLocation.SHIELD);

		// Item is no longer in inventory list
		expect(inv.getItemByIndex(10)).toBeUndefined();
		// Index is in equippedItems
		expect(inv.equippedItems).toContain(10);
		// Retained in equipment
		expect(equip.getEquippedItem(10)).toBe(dagger);

		expect(isOwnOffhandWeapon(me, me, inv, equip)).toBe(true);
	});

	it('resolves offhand shield when item is moved from inventory to equipment', () => {
		const { inv, equip } = createInventoryAndEquipment();
		const guard = { index: 11, ITID: 2101, type: ItemType.ARMOR, location: EquipLocation.SHIELD };
		inv.addItem(guard);

		const item = inv.removeItem(11);
		equip.equip(item, EquipLocation.SHIELD);

		expect(inv.getItemByIndex(11)).toBeUndefined();
		expect(isOwnOffhandWeapon(me, me, inv, equip)).toBe(false);
	});
});

describe('Integration with DB.isShield', () => {
	it('integrates with DB.isShield for own assassin holding dagger vs shield', () => {
		const { inv, equip } = createInventoryAndEquipment();

		// Equip dagger
		const dagger = { index: 2, ITID: 1201, type: ItemType.WEAPON, location: EquipLocation.SHIELD };
		equip.equip(dagger, EquipLocation.SHIELD);
		const offhandDagger = isOwnOffhandWeapon(me, me, inv, equip);
		expect(offhandDagger).toBe(true);
		// Dagger view ID 1 is recognized as weapon, not shield
		expect(DB.isShield(1, JobId.ASSASSIN, offhandDagger)).toBe(false);

		// Switch to shield
		equip.unEquip(2);
		const guard = { index: 3, ITID: 2101, type: ItemType.ARMOR, location: EquipLocation.SHIELD };
		equip.equip(guard, EquipLocation.SHIELD);
		const offhandShield = isOwnOffhandWeapon(me, me, inv, equip);
		expect(offhandShield).toBe(false);
		// Guard view ID 1 is recognized as shield
		expect(DB.isShield(1, JobId.ASSASSIN, offhandShield)).toBe(true);
	});

	it('integrates with DB.isShield for remote entities where offhand is unknown', () => {
		const { inv, equip } = createInventoryAndEquipment();
		const offhandRemote = isOwnOffhandWeapon(other, me, inv, equip);
		expect(offhandRemote).toBeUndefined();

		// Remote assassin with view ID 1: preserves ambiguous view ID as shield
		expect(DB.isShield(1, JobId.ASSASSIN, offhandRemote)).toBe(true);
		// Remote assassin with view ID 2: preserves ambiguous view ID as shield
		expect(DB.isShield(2, JobId.ASSASSIN, offhandRemote)).toBe(true);
		// Remote swordman with view ID 1: recognized as shield
		expect(DB.isShield(1, JobId.SWORDMAN, offhandRemote)).toBe(true);
		// Remote assassin with shield item ID (2101): recognized as shield
		expect(DB.isShield(2101, JobId.ASSASSIN, offhandRemote)).toBe(true);
		// Remote assassin with weapon item ID (1201): recognized as offhand weapon via item ID evidence
		expect(DB.isShield(1201, JobId.ASSASSIN, offhandRemote)).toBe(false);
	});
});

describe('Spawn and SPRITE_CHANGE2 resolution paths', () => {
	const ownAssassin = { GID: 100, job: JobId.ASSASSIN, objecttype: 0 };
	const remoteAssassin = { GID: 999, job: JobId.ASSASSIN, objecttype: 0 };
	const remoteSwordman = { GID: 888, job: JobId.SWORDMAN, objecttype: 0 };

	it('handles spawn path for own assassin with offhand dagger', () => {
		const { inv, equip } = createInventoryAndEquipment();
		equip.equip({ index: 5, ITID: 1201, type: ItemType.WEAPON, location: EquipLocation.SHIELD }, EquipLocation.SHIELD);

		// Dagger view ID 1 in main hand, dagger view ID 1 in offhand
		const result = resolveEntityWeapons(1, 1, ownAssassin, me, inv, equip);
		expect(result.weapon).toBe(DB.mountWeapon(DB.getWeaponType(1, true), DB.getWeaponType(1, true)));
		expect(result.shield).toBe(0);
	});

	it('handles spawn path for own assassin with offhand shield', () => {
		const { inv, equip } = createInventoryAndEquipment();
		equip.equip({ index: 6, ITID: 2101, type: ItemType.ARMOR, location: EquipLocation.SHIELD }, EquipLocation.SHIELD);

		// Sword view ID 2 in main hand, guard view ID 1 in offhand
		const result = resolveEntityWeapons(2, 1, ownAssassin, me, inv, equip);
		expect(result.weapon).toBe(DB.getWeaponViewID(2));
		expect(result.shield).toBe(1);
	});

	it('handles spawn path for remote assassin with ambiguous view ID (preserves shield)', () => {
		const { inv, equip } = createInventoryAndEquipment();
		// Remote assassin sends weapon view 2 and shield view 1
		const result = resolveEntityWeapons(2, 1, remoteAssassin, me, inv, equip);
		expect(result.weapon).toBe(DB.getWeaponViewID(2));
		expect(result.shield).toBe(1);
	});

	it('handles spawn path for remote assassin with weapon item ID (reliable weapon evidence)', () => {
		const { inv, equip } = createInventoryAndEquipment();
		const result = resolveEntityWeapons(1, 1201, remoteAssassin, me, inv, equip);
		expect(result.weapon).toBe(DB.mountWeapon(DB.getWeaponType(1, true), DB.getWeaponType(1201, true)));
		expect(result.shield).toBe(0);
	});

	it('handles spawn path for remote swordman with shield view ID', () => {
		const { inv, equip } = createInventoryAndEquipment();
		const result = resolveEntityWeapons(2, 1, remoteSwordman, me, inv, equip);
		expect(result.weapon).toBe(DB.getWeaponViewID(2));
		expect(result.shield).toBe(1);
	});

	it('handles SPRITE_CHANGE2 path for own assassin with offhand dagger', () => {
		const { inv, equip } = createInventoryAndEquipment();
		equip.equip({ index: 5, ITID: 1201, type: ItemType.WEAPON, location: EquipLocation.SHIELD }, EquipLocation.SHIELD);

		const result = resolveEntityWeapons(1, 1, ownAssassin, me, inv, equip);
		expect(result.weapon).toBe(DB.mountWeapon(DB.getWeaponType(1, true), DB.getWeaponType(1, true)));
		expect(result.shield).toBe(0);
	});

	it('handles SPRITE_CHANGE2 path for own assassin with offhand shield', () => {
		const { inv, equip } = createInventoryAndEquipment();
		equip.equip({ index: 6, ITID: 2101, type: ItemType.ARMOR, location: EquipLocation.SHIELD }, EquipLocation.SHIELD);

		const result = resolveEntityWeapons(2, 1, ownAssassin, me, inv, equip);
		expect(result.weapon).toBe(DB.getWeaponViewID(2));
		expect(result.shield).toBe(1);
	});

	it('handles SPRITE_CHANGE2 path for remote assassin with ambiguous view ID (preserves shield)', () => {
		const { inv, equip } = createInventoryAndEquipment();
		// Remote assassin sends weapon view 2 and shield view 1
		const result = resolveEntityWeapons(2, 1, remoteAssassin, me, inv, equip);
		expect(result.weapon).toBe(DB.getWeaponViewID(2));
		expect(result.shield).toBe(1);
	});

	it('handles SPRITE_CHANGE2 path for remote assassin with weapon item ID (reliable weapon evidence)', () => {
		const { inv, equip } = createInventoryAndEquipment();
		const result = resolveEntityWeapons(1, 1201, remoteAssassin, me, inv, equip);
		expect(result.weapon).toBe(DB.mountWeapon(DB.getWeaponType(1, true), DB.getWeaponType(1201, true)));
		expect(result.shield).toBe(0);
	});

	it('handles SPRITE_CHANGE2 path for remote assassin with shield item ID (2101)', () => {
		const { inv, equip } = createInventoryAndEquipment();
		const result = resolveEntityWeapons(1, 2101, remoteAssassin, me, inv, equip);
		expect(result.weapon).toBe(DB.getWeaponViewID(1));
		expect(result.shield).toBe(2101);
	});

	it('handles left-hand first swap when server sends weapon 0 and shield non-zero for own assassin', () => {
		const { inv, equip } = createInventoryAndEquipment();
		equip.equip({ index: 5, ITID: 1201, type: ItemType.WEAPON, location: EquipLocation.SHIELD }, EquipLocation.SHIELD);

		// Server puts weapon on left hand first (weapon=0, shield=1)
		const result = resolveEntityWeapons(0, 1, ownAssassin, me, inv, equip);
		expect(result.weapon).toBe(DB.getWeaponViewID(1));
		expect(result.shield).toBe(0);
	});

	it('does not swap shield to weapon for remote assassin with weapon 0 and ambiguous shield view', () => {
		const { inv, equip } = createInventoryAndEquipment();
		const result = resolveEntityWeapons(0, 1, remoteAssassin, me, inv, equip);
		expect(result.weapon).toBe(0);
		expect(result.shield).toBe(1);
	});
});
