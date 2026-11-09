/**
 * The attendance rewards show their item icon through data-background, which
 * GUIComponent already resolves against DB.INTERFACE_PATH. The icon must be
 * given relative to it, or the path holds the interface folder twice and no
 * icon is found.
 */
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ requested: [] }));

const INTERFACE_PATH = 'data/texture/interface/';

vi.mock('Core/Client.js', () => ({
	default: {
		loadFile: vi.fn(path => {
			mocks.requested.push(path);
		}),
		loadFiles: vi.fn()
	}
}));
vi.mock('DB/DBManager.js', () => ({
	default: {
		INTERFACE_PATH,
		getMessage: () => '',
		getItemInfo: () => ({ identifiedResourceName: 'apple', identifiedDisplayName: 'Apple' }),
		getCheckAttendanceInfo: () => ({
			Config: { StartDate: '20260101', EndDate: '20261231' },
			Rewards: Array.from({ length: 20 }, () => ({ item_id: 512, quantity: 1 }))
		})
	}
}));
vi.mock('Renderer/Renderer.js', () => ({ default: { width: 1024, height: 768 } }));
vi.mock('Renderer/EntityManager.js', () => ({ default: {} }));
vi.mock('Network/NetworkManager.js', () => ({ default: { sendPacket: vi.fn() } }));
vi.mock('Network/PacketStructure.js', () => ({ default: { CZ: { REQ_CHECK_ATTENDANCE: class {} } } }));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({ default: { addText: vi.fn(), TYPE: {} } }));
vi.mock('UI/UIManager.js', () => ({ default: { addComponent: component => component } }));
vi.mock('UI/CursorManager.js', () => ({ default: { ACTION: {}, getActualType: () => 0, setType: vi.fn() } }));
vi.mock('UI/Scrollbar.js', () => ({ default: {} }));
vi.mock('Core/Preferences.js', () => ({ default: { get: (_k, def) => ({ ...def, show: true, save: vi.fn() }) } }));

const { default: CheckAttendance } = await import('UI/Components/CheckAttendance/CheckAttendance.js');

// GUIComponent loads Client and DB itself before it handles a node
await new Promise(r => setTimeout(r, 20));

describe('CheckAttendance reward icons', () => {
	it('load from the interface item folder, named once', async () => {
		CheckAttendance.setData(0);
		CheckAttendance.append();
		await new Promise(r => setTimeout(r, 20));

		const icons = mocks.requested.filter(path => path.endsWith('apple.bmp'));
		expect(icons.length).toBeGreaterThan(0);
		for (const path of icons) {
			expect(path).toBe(INTERFACE_PATH + 'item/apple.bmp');
		}
		CheckAttendance.remove();
	});

	it('keeps 20 days however many times the map changes', () => {
		CheckAttendance.setData(0);
		for (let i = 0; i < 3; i++) {
			CheckAttendance.append(); // MapEngine appends every window on each map load
			CheckAttendance.remove();
		}
		CheckAttendance.append();
		expect(CheckAttendance.getRoot().querySelectorAll('.days-list li').length).toBe(20);
		CheckAttendance.remove();
	});

	it('claims once when the day is clicked twice', () => {
		CheckAttendance.setData(0);
		CheckAttendance.append();
		const day1 = CheckAttendance.getRoot().querySelector('#attendance_day_0');
		day1.click();
		day1.click();
		CheckAttendance.remove();
		CheckAttendance.append();

		const root = CheckAttendance.getRoot();
		expect(root.querySelector('#attendance_day_0 .checked')).not.toBeNull();
		expect(root.querySelector('#attendance_day_1 .checked')).toBeNull();
		CheckAttendance.remove();
	});

	it('still shows a claimed day as claimed after a map change', () => {
		CheckAttendance.setData(0);
		CheckAttendance.append();
		CheckAttendance.getRoot().querySelector('#attendance_day_0').click();
		CheckAttendance.remove();
		CheckAttendance.append(); // map change before the server sends the attendance data again

		const day1 = CheckAttendance.getRoot().querySelector('#attendance_day_0');
		expect(day1.querySelector('.checked')).not.toBeNull();
		expect(day1.classList.contains('event_add_cursor')).toBe(false);
		CheckAttendance.remove();
	});
});
