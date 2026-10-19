import { describe, it, expect } from 'vitest';
import { isOwnOffhandWeapon } from 'Engine/MapEngine/OffhandWeapon.js';
import EquipLocation from 'DB/Items/EquipmentLocation.js';
import ItemType from 'DB/Items/ItemType.js';
import DB from 'DB/DBManager.js';
import JobId from 'DB/Jobs/JobConst.js';

const me = { GID: 100 };
const makeInv = items => ({
	equippedItems: items.map(i => i.index),
	getItemByIndex: idx => items.find(i => i.index === idx)
});

describe('isOwnOffhandWeapon', () => {
	it('returns true when own left hand holds a weapon', () => {
		const inv = makeInv([{ index: 2, type: ItemType.WEAPON, WearState: EquipLocation.SHIELD }]);
		expect(isOwnOffhandWeapon(me, me, inv)).toBe(true);
	});

	it('returns false when own left hand holds a shield', () => {
		const inv = makeInv([{ index: 3, type: 4 /* armor: replace with ItemType constant */, WearState: EquipLocation.SHIELD }]);
		expect(isOwnOffhandWeapon(me, me, inv)).toBe(false);
	});

	it('ignores right-hand weapons', () => {
		const inv = makeInv([{ index: 1, type: ItemType.WEAPON, WearState: EquipLocation.WEAPON }]);
		expect(isOwnOffhandWeapon(me, me, inv)).toBe(false);
	});

	it('falls back to `location` when WearState is missing', () => {
		const inv = makeInv([{ index: 2, type: ItemType.WEAPON, location: EquipLocation.SHIELD }]);
		expect(isOwnOffhandWeapon(me, me, inv)).toBe(true);
	});

	it('returns false for other entities', () => {
		const inv = makeInv([{ index: 2, type: ItemType.WEAPON, WearState: EquipLocation.SHIELD }]);
		expect(isOwnOffhandWeapon({ GID: 999 }, me, inv)).toBe(false);
	});

	it('is safe with missing inventory / session / unknown index', () => {
		expect(isOwnOffhandWeapon(me, null, makeInv([]))).toBe(false);
		expect(isOwnOffhandWeapon(me, me, null)).toBe(false);
		expect(isOwnOffhandWeapon(me, me, { equippedItems: [7], getItemByIndex: () => undefined })).toBe(false);
	});

	it('integrates with DB.isShield for assassin view id 1', () => {
		const inv = makeInv([{ index: 2, type: ItemType.WEAPON, WearState: EquipLocation.SHIELD }]);
		expect(DB.isShield(1, JobId.ASSASSIN, isOwnOffhandWeapon(me, me, inv))).toBe(false);
		expect(DB.isShield(1, JobId.ASSASSIN, isOwnOffhandWeapon({ GID: 5 }, me, inv))).toBe(true);
	});
});
