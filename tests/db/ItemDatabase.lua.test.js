import { describe, it, expect, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ bytes: null }));
vi.mock('Vendors/liblua5.1.wasm?url', async () => {
	const fs = await import('fs');
	const path = await import('path');
	const bytes = fs.readFileSync(path.resolve(process.cwd(), 'src/Vendors/liblua5.1.wasm'));
	return { default: `data:application/octet-stream;base64,${bytes.toString('base64')}` };
});
vi.mock('Core/Client.js', () => ({ default: { loadFile(_name, success) { success(mocks.bytes); }, loadFiles() {}, getFile() {} } }));

describe('guarded item loading with a real Lua VM', () => {
	it('loads item fields and descriptions through the guarded context', async () => {
		const runtime = await import('DB/Loaders/LuaRuntime.js');
		const { createItemDatabase } = await import('DB/Items/ItemDatabase.js');
		const { default: ItemTable } = await import('DB/Items/ItemTable.js');
		const id = 600001;
		const previous = ItemTable[id];
		const source = `tbl = { [${id}] = { unidentifiedDisplayName = 'Unknown', unidentifiedResourceName = 'apple', identifiedDisplayName = 'Test Item', identifiedResourceName = 'apple', unidentifiedDescriptionName = {'unknown'}, identifiedDescriptionName = {'description'}, slotCount = 2, ClassNum = 3 } }`;
		mocks.bytes = Uint8Array.from(source, c => c.charCodeAt(0));
		await runtime.startLua();
		try {
			const items = createItemDatabase({}, 'windows-1252', []);
			const success = await new Promise(resolve => items.loadItemInfo('itemInfo.lua', null, resolve));
			expect(success).toBe(true);
			expect(ItemTable[id].identifiedDisplayName).toBe('Test Item');
			expect(ItemTable[id].identifiedDescriptionName).toEqual(['description']);
			expect(ItemTable[id].slotCount).toBe(2);
		} finally {
			if (previous === undefined) delete ItemTable[id]; else ItemTable[id] = previous;
		}
	});
});
