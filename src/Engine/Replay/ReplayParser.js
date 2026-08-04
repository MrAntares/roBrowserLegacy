/**
 * Engine/Replay/ReplayParser.js
 *
 * Ragnarok Online Replay Format (.rrf) Parser
 */

import BinaryReader from 'Utils/BinaryReader.js';
import { ReplayOpCodes, ReplayOpCodeName } from 'Engine/Replay/ReplayOpCode.js';

export const ContainerType = {
	None: 0,
	PacketStream: 1,
	ReplayData: 2,
	Session: 3,
	Status: 4,
	Quests: 6,
	GroupAndFriends: 7,
	Items: 8,
	UnknownContainingPet: 9,
	InitialPackets: 14,
	InitialEntities: 15,
	Efst: 17,
	EfstList: 18
};

export const ContainerTypeNames = { }

for (const [name, code] of Object.entries(ContainerType)) {
	ContainerTypeNames[code] = name;
}

export default class ReplayParser {
	constructor(fileBuffer) {
		this.fp = new BinaryReader(fileBuffer);
		this.header = {};
		this.containers = [];
		this.size = fileBuffer.byteLength;
	}

	parse() {
		this.readHeader();
		console.log('[ReplayParser] Header parsed:', this.header);
		if (this.header.version === 5) {
			this.readContainersV5();
		} else {
			console.warn('[ReplayParser] Unsupported version: ' + this.header.version);
		}

		return {
			header: this.header,
			containers: this.containers
		};
	}

	readHeader() {
		this.fp.seek(0, 0); // SEEK_SET
		
		// 100 bytes header string
		const headerBytes = this.fp.readBinaryString(100);
		
		this.header.version = this.fp.readUByte();
		this.header.sig = this.fp.readBinaryString(3);
		
		this.header.date = {
			year: this.fp.readShort(),
			month: this.fp.readUByte(),
			day: this.fp.readUByte()
		};
		this.header.dateUnused = this.fp.readUByte();
		
		this.header.date.hour = this.fp.readUByte();
		this.header.date.minute = this.fp.readUByte();
		this.header.date.second = this.fp.readUByte();
	}

	readContainersV5() {
		// Read container descriptors
		for (let i = 0; i < 24; i++) {
			const type = this.fp.readUShort();
			const length = this.fp.readLong();
			const offset = this.fp.readLong();

			this.containers.push({
				type,
				length,
				realLength: length,
				offset,
				data: []
			});
		}

		// Read container data
		for (let i = 0; i < 24; i++) {
			const container = this.containers[i];
			if (container.offset === 0) {
				continue;
			}

			if (container.realLength === 0) {
				container.realLength = this.size - container.offset;
			}

			this.fp.seek(container.offset, 0); // SEEK_SET
			
			if (container.type === ContainerType.PacketStream) {
				this.parsePacketStream(container);
			} else {
				this.parseGenericContainer(container);
			}
		}
	}

	parsePacketStream(container) {
		let ptr = 0;
		while (ptr < container.realLength) {
			const id = this.fp.readLong();
			const time = this.fp.readLong();
			const length = this.fp.readUShort();
			
			const encData = new Uint8Array(this.fp.buffer, this.fp.tell(), length);
			this.fp.seek(this.fp.tell() + length, 0);
			
			const decData = this.decrypt(encData, length);
			
			container.data.push({
				id,
				time,
				length,
				data: decData
			});
			
			ptr += length + 10;
		}
	}

	parseGenericContainer(container) {
		const encData = new Uint8Array(this.fp.buffer, this.fp.tell(), container.length);
		const decData = this.decrypt(encData, container.length);
		
		const cp = new BinaryReader(decData.buffer);
		let ptr = 0;
		
		while (ptr < container.length) {
			const id = cp.readShort();
			const length = cp.readLong();
			
			// Safety check in case of corrupted lengths
			if (ptr + 6 + length > container.length || length < 0) {
				break;
			}
			
			const data = new Uint8Array(decData.buffer, cp.tell(), length);
			cp.seek(cp.tell() + length, 0);
			
			container.data.push({
				id,
				length,
				data
			});
			
			console.log(`[ReplayParser] Container ${container.type} (${ContainerTypeNames[container.type] || 'Unknown'}) packet ${id} ${ReplayOpCodeName[id] || 'Unknown'} with length ${length}`);

			ptr += length + 6;
		}
	}

	decrypt(buffer, size) {
		const realKey1 = this.getKey1() >>> 5;
		const realKey2 = this.getKey2() >>> 3;
		
		const result = new Uint8Array(size);
		const view = new DataView(result.buffer);
		const srcView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
		
		let offset = 0;
		const blocks = Math.floor(size / 4);
		
		for (let cursor = 0; cursor < blocks; cursor++) {
			const tempOld = srcView.getInt32(offset, true);
			// temp = tempOld ^ (realKey1 + (cursor + 1)) * realKey2
			// Use Math.imul to simulate 32-bit integer multiplication
			const mult = Math.imul((realKey1 + (cursor + 1)) | 0, realKey2);
			const temp = tempOld ^ mult;
			view.setInt32(offset, temp, true);
			offset += 4;
		}
		
		// Copy remaining bytes
		for (let i = offset; i < size; i++) {
			result[i] = buffer[i];
		}
		
		return result;
	}

	getKey1() {
		const buf = new ArrayBuffer(4);
		const view = new DataView(buf);
		view.setInt16(0, this.header.date.year, true);
		view.setUint8(2, this.header.date.month);
		view.setUint8(3, this.header.date.day);
		return view.getInt32(0, true);
	}

	getKey2() {
		const buf = new ArrayBuffer(4);
		const view = new DataView(buf);
		view.setUint8(0, 0);
		view.setUint8(1, this.header.date.hour);
		view.setUint8(2, this.header.date.minute);
		view.setUint8(3, this.header.date.second);
		return view.getInt32(0, true);
	}
}
