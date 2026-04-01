/**
 * Network/PacketVerManager.js
 *
 * Manager to find the server protocol
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import Configs from 'Core/Configs.js';
import PacketLength from 'Network/PacketLength.js';
import { SEEK_CUR } from 'Utils/BinaryReader.js';

/**
 * @class PacketVerManager
 * @description Manages server protocol version detection and character block size calculations.
 */
class PacketVerManager {
	static _value = 0;

	/**
	 * Get the current PACKETVER value.
	 * Falls back to ROConfig if not explicitly set.
	 * @returns {number}
	 */
	static get value() {
		return this._value > 0
			? this._value
			: window.ROConfig?.servers?.[0]?.packetver || window.ROConfig?.packetver || 0;
	}

	/**
	 * Set the PACKETVER value and initialize packet lengths.
	 * @param {number} v
	 */
	static set value(v) {
		if (v !== this._value) {
			this._value = v;
			PacketLength.init(v);
			console.log(`%c[PACKETVER] Set packet version ${v}`, 'color:#007070');
		}
	}

	/**
	 * Loop over versions to find the matching one based on current PACKETVER.
	 * This is typically used as a mixin or on packet prototypes.
	 * @returns {number[]} matched version info
	 */
	static getPacketVersion() {
		const versions = this.versions;
		let i;
		const count = versions.length;

		for (i = 0; i < count - 1; ++i) {
			if (PacketVerManager.value < versions[i + 1][0]) {
				return versions[i];
			}
		}
		return versions[i];
	}

	/**
	 * Calculate block size based on current PACKETVER.
	 * @returns {number} blocksize
	 */
	static calculateBlockSize() {
		let blockSize = 106;
		blockSize += 2; // hairColor;
		blockSize += 4; // unknown value

		// slot/haircolor (2 * (short)) -> (2 * (char))
		// remove unknown 4 bytes
		blockSize += -(2 * 2) + 1 * 2 - 4;

		const v = this.value;

		if (v >= 20061023) {
			blockSize += 2; // .bIsChangedCharName
		}

		if (v > 20081217) {
			blockSize += -(2 * 2) + 2 * 4; // hp/maxhp (short -> int)
		}

		if ((v >= 20100720 && v <= 20100727) || v >= 20100803) {
			blockSize += 12; // lastMap(14)
			blockSize += 4; // lastMap(16)
		}

		if (v >= 20100803) {
			blockSize += 4; // delete date
		}

		if (v >= 20110111) {
			blockSize += 4; // robe
		}

		if (v >= 20110928) {
			blockSize += 4; // slot addon
		}

		if (v >= 20111025) {
			blockSize += 4; // rename addon
		}

		if (v >= 20141016) {
			blockSize++; // Character sex
		}

		if (v >= 20141022) {
			blockSize += 2; // Body
		}

		if (v >= 20170830) {
			blockSize += 8; // base_exp + job_exp
		}

		if (v >= 20211103) {
			blockSize += 20; // hp(int) + maxhp(int) + sp(long) + maxsp(long)
		}

		return blockSize;
	}

	/**
	 * Parse character list from BinaryReader.
	 * @param {BinaryReader} fp
	 * @param {number} [end]
	 * @returns {object[]} list of characters
	 */
	static parseCharInfo(fp, end = fp.length) {
		const out = [];
		let blockSize = Configs.get('charBlockSize') || this.calculateBlockSize();
		const length = end - fp.tell();

		if (length <= 0) {
			return out;
		}

		if (!blockSize || length % blockSize) {
			console.error(`CHARACTER_INFO size error!! blockSize: "${blockSize}", length: ${length}, detecting...`);

			const knownSize = [106, 108, 112, 116, 124, 128, 132, 136, 140, 144, 145, 147, 155, 175];
			const matches = knownSize.filter(size => length % size === 0);

			if (matches.length !== 1) {
				import('UI/UIManager.js').then(({ default: UIManager }) => {
					UIManager.showErrorBox(`CHARACTER_INFO size error!! blockSize: "${blockSize}", length: ${length}`);
				});
				return out;
			}
			blockSize = matches[0];
		}

		const v = this.value;
		const count = length / blockSize;

		for (let i = 0; i < count; ++i) {
			const char = {};
			char.GID = fp.readULong();
			char.exp = fp.readLong();
			if (v >= 20170830 || blockSize >= 155) {
				fp.readLong();
			}
			char.money = fp.readLong();
			char.jobexp = fp.readLong();
			if (v >= 20170830 || blockSize >= 155) {
				fp.readLong();
			}
			char.joblevel = fp.readLong();
			char.bodyState = fp.readLong();
			char.healthState = fp.readLong();
			char.effectState = fp.readLong();
			char.virtue = fp.readLong();
			char.honor = fp.readLong();
			char.jobpoint = fp.readShort();

			if (blockSize < 112) {
				char.hp = fp.readShort();
				char.maxhp = fp.readShort();
			} else {
				char.hp = fp.readLong();
				if (v >= 20211103 || blockSize >= 175) {
					fp.readLong();
				}
				char.maxhp = fp.readLong();
				if (v >= 20211103 || blockSize >= 175) {
					fp.readLong();
				}
			}

			if (v < 20201007 || blockSize < 175) {
				char.sp = fp.readShort();
				char.maxsp = fp.readShort();
			} else {
				char.sp = fp.readLong();
				if (v >= 20211103 || blockSize >= 175) {
					fp.readLong();
				}
				char.maxsp = fp.readLong();
				if (v >= 20211103 || blockSize >= 175) {
					fp.readLong();
				}
			}

			char.speed = fp.readShort();
			char.job = fp.readShort();
			char.head = fp.readShort();
			if (blockSize >= 147) {
				char.body = fp.readShort();
			}

			char.weapon = fp.readShort();
			char.level = fp.readShort();
			char.sppoint = fp.readShort();
			char.accessory = fp.readShort();
			char.shield = fp.readShort();
			char.accessory2 = fp.readShort();
			char.accessory3 = fp.readShort();
			char.headpalette = fp.readShort();
			char.bodypalette = fp.readShort();
			char.name = fp.readString(24);
			char.Str = fp.readUChar();
			char.Agi = fp.readUChar();
			char.Vit = fp.readUChar();
			char.Int = fp.readUChar();
			char.Dex = fp.readUChar();
			char.Luk = fp.readUChar();

			if (blockSize < 108) {
				char.CharNum = fp.readUShort();
			} else if (blockSize < 124) {
				char.CharNum = fp.readUShort();
				char.haircolor = fp.readUShort();
			} else {
				char.CharNum = fp.readUChar();
				char.haircolor = fp.readUChar();
			}

			if (blockSize === 116) {
				fp.seek(0x04, SEEK_CUR); // unknown
			}

			if (blockSize >= 124) {
				char.bIsChangedCharName = fp.readShort();
				char.lastMap = fp.readBinaryString(blockSize === 124 ? 12 : 16);
			}

			if (blockSize >= 132) {
				char.DeleteDate = fp.readLong();
			}

			if (blockSize >= 136) {
				char.Robe = fp.readLong();
			}

			if (blockSize >= 140) {
				char.SlotAddon = fp.readLong();
			}

			if (blockSize >= 144) {
				char.RenameAddon = fp.readLong();
			}

			if (blockSize >= 145) {
				char.sex = fp.readUChar();
			}

			out.push(char);
		}

		return out;
	}

	/**
	 * Add support for a new packet version to packet prototypes.
	 * @param {number} date
	 * @param {Array[]} list - list of [packet, versions]
	 */
	static addSupport(date, list) {
		list.forEach(param => {
			const packet = param[0];
			param[0] = date;

			if (!packet.prototype.versions) {
				packet.prototype.versions = [];
			}

			packet.prototype.versions.push(param);
			packet.prototype.getPacketVersion = this.getPacketVersion;
		});
	}
}

export default PacketVerManager;
