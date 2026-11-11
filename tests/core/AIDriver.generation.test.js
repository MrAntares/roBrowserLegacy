import { describe, it, expect, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	vm: { ctx: {}, doStringSync() {} },
	load: vi.fn(), setup: vi.fn(), done: vi.fn()
}));
vi.mock('DB/DBManager.js', () => ({ default: { getHOAI_VM: () => mocks.vm, getMERAI_VM: () => mocks.vm, getDefaultHOAI_VM: () => mocks.vm, getDefaultMERAI_VM: () => mocks.vm } }));
vi.mock('Core/LuaModuleLoader.js', () => ({ default: { DEFAULT_SEARCH_PATHS: [], setup: mocks.setup, loadAndExecuteFiles: mocks.load } }));
vi.mock('Engine/SessionStorage.js', () => ({ default: {} }));
vi.mock('Network/NetworkManager.js', () => ({ default: {} }));
vi.mock('Network/PacketStructure.js', () => ({ default: {} }));
vi.mock('Network/PacketVerManager.js', () => ({ default: {} }));
vi.mock('Renderer/EntityManager.js', () => ({ default: {} }));
vi.mock('UI/UIManager.js', () => ({ default: {} }));
import AIDriver from 'Core/AIDriver.js';

describe('AI initialization generation', () => {
	it('stops a previous initialization after a client switch', async () => {
		let finish;
		let current = true;
		mocks.load.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
		const addCTX = vi.spyOn(AIDriver, 'addCTX').mockImplementation(() => {});
		try {
			const pending = AIDriver.initAI(mocks.done, () => current);
			expect(mocks.load).toHaveBeenCalledOnce();
			current = false;
			finish();
			await pending;
			expect(mocks.load).toHaveBeenCalledOnce();
			expect(mocks.done).not.toHaveBeenCalled();
			expect(AIDriver.ready).toBe(false);
		} finally {
			addCTX.mockRestore();
		}
	});
});
