import { describe, it, expect } from 'vitest';
import ItemTable from 'DB/Items/ItemTable.js';
import { createItemDatabase } from 'DB/Items/ItemDatabase.js';
import * as system from 'DB/System/SystemDatabase.js';

describe('client data reset', () => {
	it('restores built-in items and clears client-owned item tables in place', () => {
		const items = createItemDatabase({}, 'windows-1252', system.MsgStringTable);
		const original = ItemTable[501];
		const laphine = items.ItemDatabase.getLaphineSysList();
		const enchants = items.ItemDatabase.getEnchantGroups();
		original.ClassNum = 999;
		original.identifiedDisplayName = 'old';
		ItemTable[900001] = { ClassNum: 4 };
		laphine.old = { ItemID: 1 };
		enchants.old = {};
		items.parseBuyingStoreItem(0, '501');
		items.resetItemData();
		expect(ItemTable[501]).toBe(original);
		expect(original).toEqual({ ClassNum: 0 });
		expect(ItemTable[900001]).toBeUndefined();
		expect(items.ItemDatabase.getLaphineSysList()).toBe(laphine);
		expect(Object.keys(laphine)).toEqual([]);
		expect(items.ItemDatabase.getEnchantGroups()).toBe(enchants);
		expect(enchants).toEqual({});
		expect(items.ItemDatabase.getBuyingStoreItemList()).toEqual([]);
	});

	it('clears system tables without replacing shared references', () => {
		const messages = system.MsgStringTable;
		const config = system.CheckAttendanceTable.Config;
		const rewards = system.CheckAttendanceTable.Rewards;
		messages[1] = 'old';
		config.StartDate = 'old';
		rewards.push({ item_id: 1 });
		system.QuestInfo.old = {};
		system.resetSystemData();
		expect(system.MsgStringTable).toBe(messages);
		expect(messages).toEqual([]);
		expect(system.CheckAttendanceTable.Config).toBe(config);
		expect(config).toEqual({});
		expect(system.CheckAttendanceTable.Rewards).toBe(rewards);
		expect(rewards).toEqual([]);
		expect(system.QuestInfo).toEqual({});
	});
});
