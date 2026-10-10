/**
 * tests/engine/CharEngine.reload.test.js
 *
 * Going back to character select fades the screen to black first; whatever
 * the caller tears down has to wait for the black, or the map vanishes before
 * the fade starts.
 */
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
	const calls = [];
	return {
		calls,
		fade: null,
		background: {
			setLoginBackground: vi.fn(cb => {
				mocks.fade = cb;
			})
		},
		uiManager: { removeComponents: vi.fn(() => calls.push('UIManager.removeComponents')) }
	};
});

vi.mock('DB/DBManager.js', () => ({ default: {} }));
vi.mock('Core/Configs.js', () => ({ default: { get: (_k, d) => d } }));
vi.mock('Core/Events.js', () => ({ default: {} }));
vi.mock('Audio/SoundManager.js', () => ({ default: {} }));
vi.mock('Audio/BGM.js', () => ({ default: {} }));
vi.mock('Engine/SessionStorage.js', () => ({ default: {} }));
vi.mock('Engine/MapEngine.js', () => ({ default: {} }));
vi.mock('Network/NetworkManager.js', () => ({ default: { close: vi.fn() } }));
vi.mock('Network/PacketVerManager.js', () => ({ default: { value: 20180704 } }));
vi.mock('Network/PacketStructure.js', () => ({ default: {} }));
vi.mock('UI/UIManager.js', () => ({ default: mocks.uiManager }));
vi.mock('UI/Background.js', () => ({ default: mocks.background }));
vi.mock('UI/Components/PincodeWindow/PincodeWindow.js', () => ({ default: {} }));
vi.mock('UI/Components/InputBox/InputBox.js', () => ({ default: {} }));
vi.mock('UI/Components/JoystickUI/JoystickUI.js', () => ({ default: {} }));
vi.mock('UI/Components/CharSelect/CharSelect.js', () => ({ default: {} }));
vi.mock('UI/Components/CharCreate/CharCreate.js', () => ({ default: {} }));
vi.mock('Renderer/Entity/Player.js', () => ({ default: {} }));

const CharEngine = (await import('Engine/CharEngine.js')).default;

describe('CharEngine.reload', () => {
	it('runs the caller teardown once the fade is black, before the windows go', () => {
		vi.spyOn(CharEngine, 'init').mockImplementation(() => {});
		const onBlack = vi.fn(() => mocks.calls.push('onBlack'));

		CharEngine.reload(onBlack);
		expect(onBlack).not.toHaveBeenCalled();

		mocks.fade();
		expect(mocks.calls).toEqual(['onBlack', 'UIManager.removeComponents']);
		expect(CharEngine.init).toHaveBeenCalledOnce();
	});
});
