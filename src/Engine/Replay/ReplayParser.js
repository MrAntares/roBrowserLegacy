/**
 * Engine/Replay/ReplayParser.js
 *
 * Ragnarok Online Replay Format (.rrf) Parser
 * Specification derived from ragreplaystats reference implementation.
 */

import BinaryReader from 'Utils/BinaryReader.js';
import { ContainerType, ContainerTypeNames } from 'Engine/Replay/ReplayTypes.js';

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

		return this.buildBuffers();
	}

	readHeader() {
		this.fp.seek(0, 0);

		// 100-byte header prefix string (e.g. "<< Ragnarok Replay File Version...")
		const _headerBytes = this.fp.readBinaryString(100);

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

		this.keys = this.deriveKeys(this.header.date);
	}

	deriveKeys(d) {
		const buf = new ArrayBuffer(4);
		const view = new DataView(buf);

		view.setInt16(0, d.year, true);
		view.setUint8(2, d.month);
		view.setUint8(3, d.day);
		const k1 = view.getInt32(0, true) >> 5;

		view.setUint8(0, 0);
		view.setUint8(1, d.hour);
		view.setUint8(2, d.minute);
		view.setUint8(3, d.second);
		const k2 = view.getInt32(0, true) >> 3;

		return { k1, k2 };
	}

	decryptChunk(data, size) {
		const out = new Uint8Array(data.length);
		out.set(data);

		const view = new DataView(out.buffer, out.byteOffset, out.byteLength);
		const wordCount = Math.floor(size / 4);

		for (let cursor = 0; cursor < wordCount; cursor++) {
			const old = view.getInt32(cursor * 4, true);
			const xorVal = Math.imul(this.keys.k1 + cursor + 1, this.keys.k2);
			view.setInt32(cursor * 4, old ^ xorVal, true);
		}

		return out;
	}

	readContainersV5() {
		const DESCRIPTOR_BYTES = 10;
		const tableOffset = 112; // 100 header prefix + 12 header bytes

		for (let i = 0; i < 24; i++) {
			this.fp.seek(tableOffset + i * DESCRIPTOR_BYTES, 0);
			const type = this.fp.readUShort();
			const declaredLength = this.fp.readLong();
			const offset = this.fp.readLong();

			let realLength = declaredLength;
			if (realLength === 0 && offset > 0) {
				realLength = this.size - offset;
			}

			const container = {
				type,
				declaredLength,
				offset,
				realLength,
				data: []
			};

			this.containers.push(container);

			if (offset === 0 && declaredLength === 0) {
				continue;
			}

			if (offset < 0 || offset >= this.size || offset + realLength > this.size) {
				continue;
			}

			this.fp.seek(offset, 0);
			const body = new Uint8Array(this.fp.buffer, offset, realLength);

			if (type === ContainerType.PacketStream) {
				this.parsePacketStream(container, body);
			} else {
				this.parseGenericContainer(container, body, declaredLength);
			}

			const typeName = ContainerTypeNames[container.type] || `Unknown(${container.type})`;
			console.log(`[ReplayParser] Container parsed: ${typeName}, chunks: ${container.data.length}`);
		}
	}

	parsePacketStream(container, body) {
		const view = new DataView(body.buffer, body.byteOffset, body.byteLength);
		let ptr = 0;
		while (ptr + 10 <= body.byteLength) {
			const id = view.getInt32(ptr, true);
			const time = view.getInt32(ptr + 4, true);
			const length = view.getUint16(ptr + 8, true);
			const dataStart = ptr + 10;
			const dataEnd = dataStart + length;
			if (dataEnd > body.byteLength) {
				break;
			}
			const encrypted = body.subarray(dataStart, dataEnd);
			const decrypted = this.decryptChunk(encrypted, length);
			const packetId = decrypted.length >= 2 ? decrypted[0] | (decrypted[1] << 8) : 0;

			container.data.push({ id, time, length, data: decrypted, packetId });
			ptr = dataEnd;
		}
	}

	parseGenericContainer(container, body, declaredLength) {
		if (declaredLength <= 0) {
			return;
		}

		const decrypted = this.decryptChunk(body, declaredLength);
		const view = new DataView(decrypted.buffer, decrypted.byteOffset, decrypted.byteLength);

		let ptr = 0;
		while (ptr + 6 <= declaredLength) {
			const id = view.getInt16(ptr, true);
			const length = view.getInt32(ptr + 2, true);
			const dataStart = ptr + 6;
			const dataEnd = dataStart + length;
			if (length < 0 || dataEnd > decrypted.byteLength) {
				break;
			}

			const data = decrypted.subarray(dataStart, dataEnd);
			container.data.push({ id, length, data });

			ptr = dataEnd;
		}
	}

	buildBuffers() {
		const sessionBuffer = this.buildSessionBuffer();

		const initialBuffer = [];
		const initialTypes = [
			ContainerType.InitialPackets,
			ContainerType.InitialEntities,
			ContainerType.InitialFloorItems
		];

		for (const container of this.containers) {
			if (!initialTypes.includes(container.type)) {
				continue;
			}
			if (container.data.length === 0) {
				continue;
			}
			const typeName = ContainerTypeNames[container.type] || `Unknown(${container.type})`;
			// Filter out empty bracket markers (len 0) and keep valid packet data
			const chunks = container.data
				.filter(chunk => chunk.data && chunk.data.byteLength > 0)
				.map(chunk => chunk.data);

			if (chunks.length > 0) {
				initialBuffer.push({ type: container.type, typeName, chunks });
				console.log(`[Replay] Loaded ${typeName} (${container.type}): ${chunks.length} packets`);
			}
		}

		const packetStreamContainer = this.containers.find(c => c.type === ContainerType.PacketStream);
		const packetStreamBuffer = packetStreamContainer ? packetStreamContainer.data : [];
		console.log(`[Replay] Packet stream loaded: ${packetStreamBuffer.length} chunks`);

		return {
			header: this.header,
			sessionBuffer,
			initialBuffer,
			packetStreamBuffer
		};
	}

	buildSessionBuffer() {
		const buf = {};

		const readU8  = chunk => new DataView(chunk.data.buffer, chunk.data.byteOffset, chunk.data.byteLength).getUint8(0);
		const readU16 = chunk => new DataView(chunk.data.buffer, chunk.data.byteOffset, chunk.data.byteLength).getUint16(0, true);
		const readU32 = chunk => new DataView(chunk.data.buffer, chunk.data.byteOffset, chunk.data.byteLength).getUint32(0, true);

		const readStringById = (container, id) => {
			const ch = container.data.find(c => c.id === id);
			if (!ch || ch.data.byteLength === 0) return null;
			return this.readString(ch.data);
		};

		const readU32ById = (container, id) => {
			const ch = container.data.find(c => c.id === id);
			if (!ch || ch.data.byteLength < 4) return null;
			return readU32(ch);
		};

		const replayData = this.containers.find(c => c.type === ContainerType.ReplayData);
		if (replayData) {
			const sexChunk = replayData.data.find(d => d.id === 963);
			if (sexChunk && sexChunk.data.byteLength > 0) {
				buf.sex = readU8(sexChunk);
			}

			const name = readStringById(replayData, 964);
			if (name) {
				buf.characterName = name;
			}

			let mapName = readStringById(replayData, 965);
			if (mapName) {
				if (!mapName.endsWith('.rsw')) {
					mapName += '.rsw';
				}
				buf.mapName = mapName;
			}

			const gx = readU32ById(replayData, 967);
			if (gx !== null) buf.startX = gx;

			const gy = readU32ById(replayData, 968);
			if (gy !== null) buf.startY = gy;
		}

		const sessionContainer = this.containers.find(c => c.type === ContainerType.Session);
		if (sessionContainer) {
			const aid = readU32ById(sessionContainer, 1010);
			if (aid !== null) {
				buf.AID = aid;
				buf.GID = aid;
			}

			const job = readU32ById(sessionContainer, 1014);
			if (job !== null) buf.job = job;

			const level = readU32ById(sessionContainer, 1016);
			if (level !== null) buf.level = level;

			const hairStyle = readU32ById(sessionContainer, 1060);
			if (hairStyle !== null) buf.head = hairStyle;

			const hairColor = readU32ById(sessionContainer, 1064);
			if (hairColor !== null) buf.headpalette = hairColor;

			const clothesColor = readU32ById(sessionContainer, 1063);
			if (clothesColor !== null) buf.bodypalette = clothesColor;
		}

		console.log('[Replay] Session data loaded:', JSON.stringify(buf));
		return buf;
	}

	toNetworkPacket(chunk) {
		return chunk.data;
	}

	readString(uint8array) {
		let length = 0;
		while (length < uint8array.length && uint8array[length] !== 0) {
			length++;
		}
		const decoder = new TextDecoder('euc-kr');
		return decoder.decode(uint8array.subarray(0, length));
	}
}
