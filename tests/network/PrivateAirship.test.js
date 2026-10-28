import { afterEach, describe, expect, it } from 'vitest';
import PACKET from 'Network/PacketStructure.js';
import PacketRegister from 'Network/PacketRegister.js';
import PACKETVER from 'Network/PacketVerManager.js';
import BinaryReader from 'Utils/BinaryReader.js';

const originalVersion = PACKETVER.value;
afterEach(() => {
	PACKETVER.value = originalVersion;
});

const u16 = v => [v & 0xff, (v >>> 8) & 0xff];
const u32 = v => [...u16(v), ...u16(v >>> 16)];
const name16 = text => [...Array.from(text, c => c.charCodeAt(0)), ...new Array(16 - text.length).fill(0)];

describe('private airship packets', () => {
	it('registers the request and the answer', () => {
		expect(PacketRegister[0xa49]).toBe(PACKET.CZ.PRIVATE_AIRSHIP_REQUEST);
		expect(PacketRegister[0xa4a]).toBe(PACKET.ZC.PRIVATE_AIRSHIP_RESPONSE);
	});

	it('sends the map with .gat and a 4-byte item id from 2018-11-21, 2 bytes before', () => {
		for (const [date, width] of [
			[20180321, u16],
			[20181121, u32],
			[20221005, u32]
		]) {
			PACKETVER.value = date;
			const pkt = new PACKET.CZ.PRIVATE_AIRSHIP_REQUEST();
			pkt.mapName = 'geffen.gat';
			pkt.ItemID = 25464;
			// 0x0A49, map name in 16 bytes, item id: 18 + 2 or 4 bytes, as rAthena reads it.
			expect([...new Uint8Array(pkt.build().buffer)]).toEqual([...u16(0xa49), ...name16('geffen.gat'), ...width(25464)]);
		}
	});

	it('reads the 4-byte result', () => {
		const bytes = new Uint8Array(u32(2));
		const fp = new BinaryReader(bytes.buffer);
		expect(new PACKET.ZC.PRIVATE_AIRSHIP_RESPONSE(fp, 4)).toEqual({ result: 2 });
		expect(fp.tell()).toBe(4);
		expect(PACKET.ZC.PRIVATE_AIRSHIP_RESPONSE.size).toBe(6);
	});
});
