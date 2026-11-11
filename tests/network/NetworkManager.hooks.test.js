import { describe, it, expect, vi } from 'vitest';
import Network from 'Network/NetworkManager.js';

describe('packet handler registration', () => {
	it('replaces the handler when the same packet is hooked again', () => {
		class TestPacket {}
		TestPacket.size = 2;
		Network.registerPacket(0x7ffe, TestPacket);
		const first = vi.fn();
		const second = vi.fn();
		Network.hookPacket(TestPacket, first);
		Network.hookPacket(TestPacket, second);
		const socket = { connected: true, close: vi.fn(), send: vi.fn() };
		Network.setSocketFactory(() => socket);
		try {
			Network.connect('test', 1, () => {});
			socket.onComplete(true);
			socket.onMessage(new Uint8Array([0xfe, 0x7f]));
			expect(first).not.toHaveBeenCalled();
			expect(second).toHaveBeenCalledOnce();
		} finally {
			Network.close();
			Network.setSocketFactory(null);
		}
	});
});
