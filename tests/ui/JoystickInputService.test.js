import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	renderer: {
		show: vi.fn(),
		hide: vi.fn()
	},
	buttonInput: { update: vi.fn(() => false) },
	axisInput: { update: vi.fn(() => false) },
	controls: { joyDeadline: 0.5 }
}));

vi.mock('UI/Components/JoystickUI/JoystickButtonInput.js', () => ({ default: mocks.buttonInput }));
vi.mock('UI/Components/JoystickUI/JoystickAxisInput.js', () => ({ default: mocks.axisInput }));
vi.mock('UI/Components/JoystickUI/JoystickUIRenderer.js', () => ({ default: mocks.renderer }));
vi.mock('Preferences/Controls.js', () => ({ default: mocks.controls }));

const { default: JoystickInputService } = await import('UI/Components/JoystickUI/JoystickInputService.js');

describe('JoystickInputService gamepad connection lifecycle', () => {
	beforeEach(() => {
		JoystickInputService.dispose();
		vi.clearAllMocks();
		JoystickInputService.active = false;
		JoystickInputService.buttonStates = {};
	});

	afterEach(() => {
		JoystickInputService.dispose();
	});

	it('shows the joystick again after a disconnect/reconnect cycle', () => {
		JoystickInputService.prepare();

		window.dispatchEvent(new Event('gamepadconnected'));
		expect(mocks.renderer.show).toHaveBeenCalledTimes(1);
		expect(JoystickInputService.active).toBe(true);

		window.dispatchEvent(new Event('gamepaddisconnected'));
		expect(mocks.renderer.hide).toHaveBeenCalledTimes(1);
		expect(JoystickInputService.active).toBe(false);

		// Reconnect: the connection listener must survive the disconnect.
		window.dispatchEvent(new Event('gamepadconnected'));
		expect(mocks.renderer.show).toHaveBeenCalledTimes(2);
		expect(JoystickInputService.active).toBe(true);
	});

	it('does not register duplicate listeners when prepare runs twice', () => {
		JoystickInputService.prepare();
		JoystickInputService.prepare();

		window.dispatchEvent(new Event('gamepadconnected'));

		expect(mocks.renderer.show).toHaveBeenCalledTimes(1);
	});

	it('stops reacting to gamepad events after dispose', () => {
		JoystickInputService.prepare();
		JoystickInputService.dispose();

		window.dispatchEvent(new Event('gamepadconnected'));
		window.dispatchEvent(new Event('gamepaddisconnected'));

		expect(mocks.renderer.show).not.toHaveBeenCalled();
		expect(mocks.renderer.hide).not.toHaveBeenCalled();
	});
});
