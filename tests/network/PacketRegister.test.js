import { describe, expect, it } from 'vitest';
import PacketRegister from 'Network/PacketRegister.js';

/**
 * Registering a packet writes the opcode onto the structure itself, and hooking
 * a handler goes through that one stamped id. A structure registered under two
 * opcodes therefore keeps only the one it was registered under last, and the
 * other parses cleanly and is then dropped with no handler and no error.
 *
 * This is invisible to a test that mocks hookPacket by structure, which is how
 * it shipped once: two generations of the guild emblem-change notice shared a
 * structure, and the older opcode was silently dead.
 */
describe('the packet register', () => {
	it('gives every opcode its own structure', () => {
		const opcodesOf = {};

		for (const opcode in PacketRegister) {
			const struct = PacketRegister[opcode];
			if (!struct) {
				continue;
			}
			const key = struct.name || String(opcode);
			if (!opcodesOf[key]) {
				opcodesOf[key] = [];
			}
			opcodesOf[key].push('0x' + Number(opcode).toString(16));
		}

		const shared = [];
		for (const name in opcodesOf) {
			if (opcodesOf[name].length > 1) {
				shared.push(`${name} -> ${opcodesOf[name].join(', ')}`);
			}
		}

		expect(shared).toEqual([]);
	});

	it('registers no opcode against a missing structure', () => {
		const missing = [];

		for (const opcode in PacketRegister) {
			if (!PacketRegister[opcode]) {
				missing.push('0x' + Number(opcode).toString(16));
			}
		}

		expect(missing).toEqual([]);
	});
});
