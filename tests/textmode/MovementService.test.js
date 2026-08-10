import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	sendPacket: vi.fn(),
	pathSearch: vi.fn(),
	entityGet: vi.fn(),
	searchNavigation: vi.fn()
}));

vi.mock('DB/DBManager.js', () => ({
	default: { searchNavigation: mocks.searchNavigation }
}));
vi.mock('Engine/SessionStorage.js', () => ({ default: {} }));
vi.mock('Network/NetworkManager.js', () => ({ default: { sendPacket: mocks.sendPacket } }));
vi.mock('Network/PacketVerManager.js', () => ({ default: { value: 20200101 } }));
vi.mock('Network/PacketStructure.js', () => {
	class MovePacket {
		constructor() {
			this.dest = [0, 0];
		}
	}
	class ActionPacket {}
	return {
		default: {
			CZ: { REQUEST_MOVE: MovePacket, REQUEST_MOVE2: MovePacket, REQUEST_ACT: ActionPacket, REQUEST_ACT2: ActionPacket }
		}
	};
});
vi.mock('Renderer/EntityManager.js', () => ({ default: { get: mocks.entityGet } }));
vi.mock('Renderer/Entity/Entity.js', () => ({ default: { TYPE_MOB: 5, TYPE_NPC_ABR: 13, TYPE_NPC_BIONIC: 14 } }));
vi.mock('Renderer/Map/Altitude.js', () => ({
	default: { width: 300, height: 300, TYPE: { WALKABLE: 2 }, getCellType: () => 2 }
}));
vi.mock('Renderer/MapRenderer.js', () => ({ default: { currentMap: 'test.gat' } }));
vi.mock('Utils/PathFinding.js', () => ({ default: { search: mocks.pathSearch } }));

import { MovementError, MovementService } from 'Engine/TextMode/MovementService.js';

function createService() {
	const session = { Playing: true, Entity: { position: [10, 10], attack_range: 1 }, moveAction: null };
	return { session, service: new MovementService({ session }) };
}

describe('MovementService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.pathSearch.mockImplementation((_x0, _y0, x, y, _range, out) => {
			out.push(10, 10, Number(x), Number(y));
			return 2;
		});
	});

	it('converts Chinese direction movement to a validated destination packet', () => {
		const { service } = createService();
		service.moveDirection('北', 5);
		expect(mocks.sendPacket.mock.calls[0][0].dest).toEqual([10, 15]);
	});

	it('rejects an unreachable coordinate without sending movement', () => {
		const { service } = createService();
		mocks.pathSearch.mockReturnValue(0);
		expect(() => service.moveTo(20, 20)).toThrow(MovementError);
		expect(mocks.sendPacket).not.toHaveBeenCalled();
	});

	it('queues an attack for exactly the requested gid while approaching', () => {
		const { service, session } = createService();
		mocks.entityGet.mockReturnValue({ GID: 42, objecttype: 5, position: [15, 15], action: 0, ACTION: { DIE: 99 } });
		service.attackEntity(42);
		expect(session.moveAction.targetGID).toBe(42);
		expect(session.moveAction.action).toBe(7);
	});
});
