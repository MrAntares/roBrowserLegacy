import { describe, it, expect, beforeEach } from 'vitest';
import PACKET from 'Network/PacketStructure.js';
import PACKETVER from 'Network/PacketVerManager.js';
import BinaryReader from 'Utils/BinaryReader.js';

const NAME_LENGTH = 24;
const REASON_LENGTH = 40;

// One arm per generation, as the server declares them. The strides are what
// tells the three apart on the wire, and the
// field order is not the same in all three: 0x0b7c puts the name *after* the
// reason, where 0x0163 puts it before.
const STRIDE = {
	BAN_LIST: NAME_LENGTH + REASON_LENGTH, // 64
	BAN_LIST2: 4 + REASON_LENGTH, // 44
	BAN_LIST3: 4 + REASON_LENGTH + NAME_LENGTH // 68
};

function writeString(view, offset, str, length) {
	for (let i = 0; i < length; ++i) {
		view.setUint8(offset + i, i < str.length ? str.charCodeAt(i) : 0);
	}
}

function makeEntries(n) {
	return Array.from({ length: n }, (_, i) => ({
		GID: 150000 + i,
		charname: 'Rekenber' + i,
		reason: 'Rekenber spy ' + i
	}));
}

function build(stride, write) {
	const buf = new ArrayBuffer(stride.length * stride.size);
	const view = new DataView(buf);
	for (let i = 0; i < stride.length; ++i) {
		write(view, i * stride.size, stride.entries[i]);
	}
	return buf;
}

function buildGen1(entries) {
	return build({ size: STRIDE.BAN_LIST, length: entries.length, entries }, (view, at, e) => {
		writeString(view, at, e.charname, NAME_LENGTH);
		writeString(view, at + 24, e.reason, REASON_LENGTH);
	});
}

function buildGen2(entries) {
	return build({ size: STRIDE.BAN_LIST2, length: entries.length, entries }, (view, at, e) => {
		view.setUint32(at, e.GID, true);
		writeString(view, at + 4, e.reason, REASON_LENGTH);
	});
}

function buildGen3(entries) {
	return build({ size: STRIDE.BAN_LIST3, length: entries.length, entries }, (view, at, e) => {
		view.setUint32(at, e.GID, true);
		writeString(view, at + 4, e.reason, REASON_LENGTH);
		writeString(view, at + 44, e.charname, NAME_LENGTH);
	});
}

function parse(Struct, buf) {
	const fp = new BinaryReader(buf);
	return new Struct(fp, buf.byteLength);
}

describe('guild expulsion list', () => {
	describe('PACKET.ZC.BAN_LIST (0x0163)', () => {
		it.each([0, 1, 5, 11, 32])('parses %i entries at PACKETVER >= 20100803', (n) => {
			PACKETVER.value = 20211103;
			const entries = makeEntries(n);
			const pkt = parse(PACKET.ZC.BAN_LIST, buildGen1(entries));

			expect(pkt.banList).toHaveLength(n);
			entries.forEach((e, i) => {
				expect(pkt.banList[i].charname).toBe(e.charname);
				expect(pkt.banList[i].reason).toBe(e.reason);
			});
		});

		// The struct's 88-byte pre-20100803 arm is gated on `PACKETVER.max`, which
		// nothing in the codebase ever defines, so it is unreachable and untested
		// here on purpose. See PR-NOTES.md - it predates this change.
	});

	describe('PACKET.ZC.BAN_LIST2 (0x0a87)', () => {
		beforeEach(() => {
			PACKETVER.value = 20190116;
		});

		it.each([0, 1, 11, 32])('parses %i entries', (n) => {
			const entries = makeEntries(n);
			const pkt = parse(PACKET.ZC.BAN_LIST2, buildGen2(entries));

			expect(pkt.banList).toHaveLength(n);
			entries.forEach((e, i) => {
				expect(pkt.banList[i].GID).toBe(e.GID);
				expect(pkt.banList[i].reason).toBe(e.reason);
			});
		});

		it('leaves the name empty - this generation carries a char id only', () => {
			const pkt = parse(PACKET.ZC.BAN_LIST2, buildGen2(makeEntries(2)));
			expect(pkt.banList.every((entry) => entry.charname === '')).toBe(true);
		});
	});

	describe('PACKET.ZC.BAN_LIST3 (0x0b7c)', () => {
		beforeEach(() => {
			PACKETVER.value = 20211103;
		});

		it.each([0, 1, 11, 32])('parses %i entries', (n) => {
			const entries = makeEntries(n);
			const pkt = parse(PACKET.ZC.BAN_LIST3, buildGen3(entries));

			expect(pkt.banList).toHaveLength(n);
			entries.forEach((e, i) => {
				expect(pkt.banList[i].GID).toBe(e.GID);
				expect(pkt.banList[i].charname).toBe(e.charname);
				expect(pkt.banList[i].reason).toBe(e.reason);
			});
		});

		// The one mistake this layout invites: reading the 24-byte name where the
		// 40-byte reason is. Both fields are populated in every other case here,
		// so only distinct lengths catch a swap.
		it('reads the reason before the name', () => {
			const buf = buildGen3([{ GID: 150002, charname: 'Seyren', reason: 'Rekenber spy' }]);
			const pkt = parse(PACKET.ZC.BAN_LIST3, buf);

			expect(buf.byteLength).toBe(68);
			expect(pkt.banList[0].reason).toBe('Rekenber spy');
			expect(pkt.banList[0].charname).toBe('Seyren');
		});

		it('never reads past the end of the packet', () => {
			const buf = buildGen3(makeEntries(3));
			const pkt = parse(PACKET.ZC.BAN_LIST3, buf.slice(0, buf.byteLength - 5));

			expect(pkt.banList).toHaveLength(2);
			expect(pkt.banList.every(Boolean)).toBe(true);
		});
	});
});

/**
 * The live departure notices of the same era. rAthena swaps both at
 * PACKETVER_MAIN 20161019 / RE 20160921 for a character id and no name, so these
 * two are what a modern server actually sends when somebody leaves or is thrown
 * out - the list above being the Expel History tab's own packet, not these.
 * @see docs/reference/guild/member-view.md
 */
describe('guild departure notices that carry a character id', () => {
	/**
	 * The two carry the same two fields IN THE OPPOSITE ORDER: the expulsion leads
	 * with the reason, the withdrawal with the id. One builder for both would encode
	 * the assumption the structures are the same, which is the bug these cases
	 * exist to catch - a shared builder let it pass byte-level tests once already.
	 */
	function buildExpulsion(GID, reason) {
		const buf = new ArrayBuffer(REASON_LENGTH + 4);
		const view = new DataView(buf);
		writeString(view, 0, reason, REASON_LENGTH);
		view.setUint32(REASON_LENGTH, GID, true);
		return buf;
	}

	function buildWithdrawal(GID, reason) {
		const buf = new ArrayBuffer(4 + REASON_LENGTH);
		const view = new DataView(buf);
		view.setUint32(0, GID, true);
		writeString(view, 4, reason, REASON_LENGTH);
		return buf;
	}

	for (const [label, Struct, build] of [
		['ZC_ACK_BAN_GUILD_DELNAME (0x0a82)', PACKET.ZC.ACK_BAN_GUILD_DELNAME, buildExpulsion],
		['ZC_ACK_LEAVE_GUILD_DELNAME (0x0a83)', PACKET.ZC.ACK_LEAVE_GUILD_DELNAME, buildWithdrawal]
	]) {
		describe(label, () => {
			it('declares the size the server sends, header included', () => {
				expect(Struct.size).toBe(2 + 4 + REASON_LENGTH);
			});

			it('reads the character id and the reason', () => {
				const pkt = parse(Struct, build(150002, 'Rekenber spy'));

				expect(pkt.GID).toBe(150002);
				expect(pkt.reasonDesc).toBe('Rekenber spy');
			});

			// The id is unsigned on the wire and rAthena's own column is unsigned.
			// Read as signed, a high char id comes back negative and matches nobody.
			it('reads a high character id unsigned', () => {
				const pkt = parse(Struct, build(0xf0000001, 'bye'));

				expect(pkt.GID).toBe(0xf0000001);
			});

			// A reason read four bytes late loses its first four characters and the id
			// becomes reason bytes, so nobody is ever recognised as themselves. That is
			// what a swapped field order looks like from the outside.
			it('keeps the whole reason, first character included', () => {
				const pkt = parse(Struct, build(150002, 'u2 live check'));

				expect(pkt.reasonDesc).toBe('u2 live check');
			});
		});
	}

	it('gives the two opcodes their own structure, or one of them is dropped', () => {
		expect(PACKET.ZC.ACK_BAN_GUILD_DELNAME).not.toBe(PACKET.ZC.ACK_LEAVE_GUILD_DELNAME);
	});
});
