import { describe, it, expect } from 'vitest';
import ItemTable from 'DB/Items/ItemTable.js';
import * as rows from 'DB/Items/LegacyItemRows.js';

describe('legacy item table rows', () => {
	it('merges legacy names, descriptions and card metadata into the existing item', () => {
		const id = 999992;
		const previous = ItemTable[id];
		const item = { ClassNum: 3 };
		ItemTable[id] = item;
		try {
			rows.unidentifiedDisplayName(0, id, 'Old_Name');
			rows.identifiedDisplayName(0, id, 'New_Name');
			rows.identifiedDescriptionName(0, id, 'first\nsecond');
			rows.slotCount(0, id, '2');
			rows.isPostfix(0, id);
			expect(ItemTable[id]).toBe(item);
			expect(item).toMatchObject({ ClassNum: 3, unidentifiedDisplayName: 'Old Name', identifiedDisplayName: 'New Name', identifiedDescriptionName: ['first', 'second'], slotCount: '2', isPostfix: true });
		} finally {
			if (previous === undefined) delete ItemTable[id]; else ItemTable[id] = previous;
		}
	});
});
