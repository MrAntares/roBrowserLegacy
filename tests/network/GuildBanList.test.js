import { describe, it, expect, beforeEach } from 'vitest';
import PACKET from 'Network/PacketStructure.js';
import PACKETVER from 'Network/PacketVerManager.js';
import BinaryReader from 'Utils/BinaryReader.js';

const NAME_LENGTH = 24;
const REASON_LENGTH = 40;

// rathena src/map/packets_struct.hpp, PACKET_ZC_BAN_LIST_sub - one arm per
// generation. The strides are what tells the three apart on the wire, and the
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
		charname: 'ClaudeTest' + i,
		reason: 'Blibli ' + i
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
			const buf = buildGen3([{ GID: 150002, charname: 'ClaudeTestB', reason: 'Blibli' }]);
			const pkt = parse(PACKET.ZC.BAN_LIST3, buf);

			expect(buf.byteLength).toBe(68);
			expect(pkt.banList[0].reason).toBe('Blibli');
			expect(pkt.banList[0].charname).toBe('ClaudeTestB');
		});

		it('never reads past the end of the packet', () => {
			const buf = buildGen3(makeEntries(3));
			const pkt = parse(PACKET.ZC.BAN_LIST3, buf.slice(0, buf.byteLength - 5));

			expect(pkt.banList).toHaveLength(2);
			expect(pkt.banList.every(Boolean)).toBe(true);
		});
	});
});
