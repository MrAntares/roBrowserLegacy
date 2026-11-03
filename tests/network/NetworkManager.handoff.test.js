/**
 * tests/network/NetworkManager.handoff.test.js
 *
 * Once the char server has sent us to a map server (or a map server to
 * another one), its socket is done. If it closes while the next socket is
 * still opening, that is no disconnection: the next socket connects a moment
 * later and the game goes on, behind a "Disconnected from Server." box that
 * sends the player back to the login screen.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	uiManager: { showErrorBox: vi.fn() }
}));

vi.mock('UI/UIManager.js', () => ({ default: mocks.uiManager }));

let Network;

function fakeSocket() {
	return {
		connected: true,
		close: vi.fn(),
		send: vi.fn()
	};
}

/**
 * Open a socket through the manager and return it, opened or still pending.
 */
function open(host, opened) {
	let socket;
	Network.setSocketFactory(() => (socket = fakeSocket()));
	Network.connect(host, 1, () => {});
	if (opened) {
		socket.onComplete(true);
	}
	return socket;
}

// The error box goes through a dynamic import
const settle = () => new Promise(resolve => setTimeout(resolve, 0));

describe('a socket closing after the server sent us elsewhere', () => {
	beforeEach(async () => {
		vi.resetModules();
		mocks.uiManager.showErrorBox.mockClear();
		Network = (await import('Network/NetworkManager.js')).default;
	});

	it('still reports a char server closing before any hand-off', async () => {
		const char = open('char', true);
		char.onClose();
		await settle();

		expect(mocks.uiManager.showErrorBox).toHaveBeenCalledWith('Disconnected from Server.');
	});

	it('shows no error box when the char socket closes while the map one opens', async () => {
		const char = open('char', true);
		Network.expectClose();
		const map = open('map', false);

		char.onClose();
		await settle();
		expect(mocks.uiManager.showErrorBox).not.toHaveBeenCalled();

		map.onComplete(true);
		map.onClose();
		await settle();
		expect(mocks.uiManager.showErrorBox).toHaveBeenCalledOnce();
	});

	it('stops the ping of the socket we left once it closes', () => {
		vi.useFakeTimers();
		const ping = vi.fn();
		const char = open('char', true);
		Network.setPing(ping);
		Network.expectClose();

		char.onClose();
		vi.advanceTimersByTime(30000);
		vi.useRealTimers();

		expect(ping).not.toHaveBeenCalled();
	});

	it('shows no error box when the char socket closes before the map one is asked for', async () => {
		const char = open('char', true);
		Network.expectClose();

		char.onClose();
		await settle();

		expect(mocks.uiManager.showErrorBox).not.toHaveBeenCalled();
	});
});
