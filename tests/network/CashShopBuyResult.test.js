import { describe, it, expect } from 'vitest';
import PACKET from 'Network/PacketStructure.js';
import BinaryReader from 'Utils/BinaryReader.js';

// rAthena PACKET_ZC_SE_PC_BUY_CASHITEM_RESULT, after the header:
// <item id>.L <result>.W <cash points>.L <kafra points>.L
describe('ZC_SE_PC_BUY_CASHITEM_RESULT', () => {
	it('reads the points past 65535 and the result', () => {
		const buf = new ArrayBuffer(14);
		const view = new DataView(buf);
		view.setUint32(0, 400064, true);
		view.setUint16(4, 4, true);
		view.setUint32(6, 123456, true);
		view.setUint32(10, 70000, true);

		const pkt = new PACKET.ZC.SE_PC_BUY_CASHITEM_RESULT(new BinaryReader(buf), buf.byteLength);

		expect(pkt).toMatchObject({ itemId: 400064, result: 4, cashPoints: 123456, kafraPoints: 70000 });
		expect(PACKET.ZC.SE_PC_BUY_CASHITEM_RESULT.size).toBe(16);
	});
});
