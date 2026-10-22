import { beforeEach, describe, expect, it, vi } from 'vitest';

// When a quest is added, rAthena sends its objective counts twice: in
// ZC_HUNTING_QUEST_INFO (0x8fe) right after the quest, then again in
// ZC_UPDATE_MISSION_HUNT_EX (0x9fa). Each objective should reach chat once.
const mocks = vi.hoisted(() => {
	class MockGUIComponent {
		constructor(name) {
			this.name = name;
		}

		getRoot() {
			return null;
		}
	}

	return { MockGUIComponent, addText: vi.fn() };
});

vi.mock('DB/DBManager.js', () => ({ default: { getQuestInfo: () => ({ Title: 'Poring Hunt' }) } }));
vi.mock('Core/Preferences.js', () => ({ default: { get: (_k, def) => ({ ...def, save: vi.fn() }) } }));
vi.mock('Core/Client.js', () => ({ default: { loadFile: vi.fn() } }));
vi.mock('Renderer/Renderer.js', () => ({ default: { width: 1200, height: 800 } }));
vi.mock('UI/UIManager.js', () => ({ default: { addComponent: component => component } }));
vi.mock('UI/GUIComponent.js', () => ({ default: mocks.MockGUIComponent }));
vi.mock('UI/Elements/Elements.js', () => ({}));
vi.mock('Network/NetworkManager.js', () => ({ default: { sendPacket: vi.fn() } }));
vi.mock('Network/PacketStructure.js', () => ({ default: { CZ: {} } }));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({
	default: { addText: mocks.addText, TYPE: { ADMIN: 1, SELF: 2 }, FILTER: { QUEST: 1 } }
}));
vi.mock('Engine/SessionStorage.js', () => ({ default: {} }));

const { createQuest } = await import('UI/Components/Quest/QuestCommon.js');

function addPoringQuest(Quest) {
	const hunt_list = [];
	hunt_list[1000] = { huntID: 1000, mobName: 'Poring', huntCount: 0, maxCount: 0 };
	hunt_list[1001] = { huntID: 1001, mobName: 'Lunatic', huntCount: 0, maxCount: 0 };
	Quest.addQuest({ questID: 1, title: 'Poring Hunt', summary: '', hunt_list }, 1);
}

describe('Quest mission hunt chat lines', () => {
	let Quest;

	beforeEach(() => {
		mocks.addText.mockClear();
		Quest = createQuest({ name: 'Quest', htmlText: '', cssText: '', questHelper: {} });
		addPoringQuest(Quest);
	});

	it('prints each objective once when its counts arrive twice', () => {
		// 0x8fe
		Quest.updateMissionHunt({ huntID: 1000, maxCount: 5, huntCount: 0 }, 1, 1000);
		Quest.updateMissionHunt({ huntID: 1001, maxCount: 3, huntCount: 0 }, 1, 1001);
		// 0x9fa
		Quest.updateMissionHunt({ questID: 1, huntID: 1000, maxCount: 5, huntCount: 0 }, 1, 1000);
		Quest.updateMissionHunt({ questID: 1, huntID: 1001, maxCount: 3, huntCount: 0 }, 1, 1001);

		expect(mocks.addText.mock.calls.map(call => call[0])).toEqual([
			'Mission [Poring Hunt], you killed [Poring]. (0/5)',
			'Mission [Poring Hunt], you killed [Lunatic]. (0/3)'
		]);
	});

	it('still prints every kill', () => {
		Quest.updateMissionHunt({ huntID: 1000, maxCount: 5, huntCount: 0 }, 1, 1000);
		Quest.updateMissionHunt({ questID: 1, huntID: 1000, maxCount: 5, huntCount: 1 }, 1, 1000);
		Quest.updateMissionHunt({ questID: 1, huntID: 1000, maxCount: 5, huntCount: 2 }, 1, 1000);

		expect(mocks.addText).toHaveBeenCalledTimes(3);
		expect(mocks.addText.mock.calls[2][0]).toBe('Mission [Poring Hunt], you killed [Poring]. (2/5)');
	});

	it('shows a count that goes back to zero', () => {
		Quest.updateMissionHunt({ huntID: 1000, maxCount: 5, huntCount: 3 }, 1, 1000);
		Quest.updateMissionHunt({ questID: 1, huntID: 1000, maxCount: 5, huntCount: 0 }, 1, 1000);

		expect(mocks.addText.mock.calls.at(-1)[0]).toBe('Mission [Poring Hunt], you killed [Poring]. (0/5)');
	});
});
