import { describe, expect, it, vi } from 'vitest';

// onParameterChange is module-private and only reachable through the hooks
// MainEngine() registers, so the Network mock keeps the map of packet
// structure -> handler.
const mocks = vi.hoisted(() => ({
	hooks: new Map(),
	session: { Entity: { joblevel: 50 } },
	basicInfo: { update: vi.fn() }
}));

vi.mock('Network/NetworkManager.js', () => ({
	default: {
		hookPacket: (struct, fn) => mocks.hooks.set(struct, fn),
		sendPacket: vi.fn()
	}
}));
vi.mock('Engine/SessionStorage.js', () => ({ default: mocks.session }));
vi.mock('UI/Components/BasicInfo/BasicInfo.js', () => ({ default: mocks.basicInfo }));
vi.mock('DB/DBManager.js', () => ({ default: { getMessage: () => '' } }));
vi.mock('Renderer/EntityManager.js', () => ({ default: { get: () => null } }));
vi.mock('Renderer/EffectManager.js', () => ({ default: {} }));
vi.mock('Renderer/Renderer.js', () => ({ default: {} }));
vi.mock('Renderer/Effects/Damage.js', () => ({ default: {} }));
vi.mock('Renderer/Map/Altitude.js', () => ({ default: {} }));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({ default: { addText: vi.fn(), TYPE: {}, FILTER: {} } }));
vi.mock('UI/Components/ChatRoom/ChatRoom.js', () => ({ default: {} }));
vi.mock('UI/Components/Announce/Announce.js', () => ({ default: {} }));
vi.mock('UI/Components/Equipment/Equipment.js', () => ({ default: {} }));
vi.mock('UI/Components/ChangeCart/ChangeCart.js', () => ({ default: {} }));
vi.mock('UI/Components/PartyFriends/PartyFriends.js', () => ({ default: {} }));
vi.mock('UI/Components/SkillList/SkillList.js', () => ({ default: { onLevelUp: vi.fn() } }));
vi.mock('UI/Components/WinStats/WinStats.js', () => ({ default: {} }));

const MainEngine = (await import('Engine/MapEngine/Main.js')).default;
const PACKET = (await import('Network/PacketStructure.js')).default;
const StatusProperty = (await import('DB/Status/StatusProperty.js')).default;

MainEngine();

describe('Job level change', () => {
	// BasicInfo is rebuilt from Session.Entity.joblevel on the sprite change
	// that follows a job change, so a stale session value shows the old level.
	it('keeps the session job level in sync with the packet', () => {
		mocks.hooks.get(PACKET.ZC.PAR_CHANGE)({ varID: StatusProperty.JOBLEVEL, count: 1 });

		expect(mocks.session.Entity.joblevel).toBe(1);
		expect(mocks.basicInfo.update).toHaveBeenCalledWith('jlvl', 1);
	});
});
