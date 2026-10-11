import { describe, it, expect } from 'vitest';
import PACKET from 'Network/PacketStructure.js';
import BinaryReader from 'Utils/BinaryReader.js';

// ZC_CHANGE_GUILD, broadcast when a guild changes its emblem, in three
// generations. The newer two reorder what 0x01b4 sent - the account id moved
// from first to last - and widen the version from a short to a long, so the
// order is the whole point of the cases below.
//
// 0x0b1f is also the one that ships at two lengths: ten bytes from packetver
// 20190306 and fourteen from 20190619, the account id having been appended.
// Both arms are framed by the length table, which is where `end` comes from.

/** Body of a packet, header excluded - the parser is already past the opcode. */
function body(bytes) {
	const buf = new ArrayBuffer(bytes.length);
	new Uint8Array(buf).set(bytes);
	return buf;
}

function u32(value) {
	return [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff];
}

function u16(value) {
	return [value & 0xff, (value >>> 8) & 0xff];
}

/** Parse a body, framed at `end` bytes - the table's length minus the opcode. */
function parse(Struct, buf, end) {
	const fp = new BinaryReader(buf);
	return new Struct(fp, end === undefined ? buf.byteLength : end);
}

const GDID = 158;
const AID = 2000042;
const VERSION = 7;

describe('a guild emblem change on the wire', () => {
	// 12 bytes in every length table there is, 2003 to 2025.
	describe('PACKET.ZC.CHANGE_GUILD (0x01b4)', () => {
		it('reads the account id first and the version as a short', () => {
			const pkt = parse(PACKET.ZC.CHANGE_GUILD, body([...u32(AID), ...u32(GDID), ...u16(VERSION)]));

			expect(pkt.AID).toBe(AID);
			expect(pkt.GDID).toBe(GDID);
			expect(pkt.emblemVersion).toBe(VERSION);
		});
	});

	describe('PACKET.ZC.CHANGE_GUILD2 (0x0b1f)', () => {
		it('reads guild, version then account id on the fourteen-byte form', () => {
			const pkt = parse(PACKET.ZC.CHANGE_GUILD2, body([...u32(GDID), ...u32(VERSION), ...u32(AID)]));

			expect(pkt.GDID).toBe(GDID);
			expect(pkt.emblemVersion).toBe(VERSION);
			expect(pkt.AID).toBe(AID);
		});

		// The table frames this one at ten bytes for 20190306..20190618. Reading a
		// third long there runs past the packet and into whatever followed it.
		it('stops after the version on the ten-byte form', () => {
			const pkt = parse(PACKET.ZC.CHANGE_GUILD2, body([...u32(GDID), ...u32(VERSION)]));

			expect(pkt.GDID).toBe(GDID);
			expect(pkt.emblemVersion).toBe(VERSION);
			expect(pkt.AID).toBeUndefined();
		});

		// Framing is the length table's, not the buffer's: the reader holds the
		// whole chunk, so the next packet's bytes are sitting right there.
		it('does not read the packet that follows a ten-byte one', () => {
			const next = [0x47, 0x0b, ...u32(999), ...u32(999)];
			const pkt = parse(PACKET.ZC.CHANGE_GUILD2, body([...u32(GDID), ...u32(VERSION), ...next]), 8);

			expect(pkt.emblemVersion).toBe(VERSION);
			expect(pkt.AID).toBeUndefined();
		});
	});

	// 14 bytes only, from 20190724 on, and the same field order as the long 0x0b1f.
	describe('PACKET.ZC.CHANGE_GUILD3 (0x0b47)', () => {
		it('reads guild, version then account id', () => {
			const pkt = parse(PACKET.ZC.CHANGE_GUILD3, body([...u32(GDID), ...u32(VERSION), ...u32(AID)]));

			expect(pkt.GDID).toBe(GDID);
			expect(pkt.emblemVersion).toBe(VERSION);
			expect(pkt.AID).toBe(AID);
		});
	});
});
