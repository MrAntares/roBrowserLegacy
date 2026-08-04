/**
 * Engine/Replay/ReplayPlayer.js
 *
 * Replay System orchestrator
 */
import DB from 'DB/DBManager.js';
import Network from 'Network/NetworkManager.js';
import MapRenderer from 'Renderer/MapRenderer.js';
import Session from 'Engine/SessionStorage.js';
import MapEngine from 'Engine/MapEngine.js';
import ReplayParser, { ContainerType } from './ReplayParser.js';
import ReplaySocket from './ReplaySocket.js';

export default class ReplayPlayer {
	constructor() {
		this.parser = null;
		this.socket = null;
		
		this.playing = false;
		this.speed = 1.0;
		
		this.chunks = [];
		this.currentChunkIndex = 0;
		this.startTime = 0;
		
		this.onTick = this.tick.bind(this);
	}

	async load(file) {
		const buffer = await file.arrayBuffer();
		this.parser = new ReplayParser(buffer);
		const result = this.parser.parse();
		this._setupSession(result.containers);
		this._prepareChunks(result.containers);
	}

	_setupSession(containers) {
		// Defaults
		this.mapName = 'prontera.rsw';
		Session.Character = Session.Character || {};
		Session.Character.name = 'Replay';

		const sessionContainer = containers.find(c => c.type === ContainerType.Session);
		if (sessionContainer && sessionContainer.data.length > 0) {
			const u16 = (chunk) => new DataView(chunk.data.buffer, chunk.data.byteOffset, chunk.data.byteLength).getUint16(0, true);
			const u32 = (chunk) => new DataView(chunk.data.buffer, chunk.data.byteOffset, chunk.data.byteLength).getUint32(0, true);

			const props = {
				1010: ['AID', u32, Session],
				1011: ['GID', u32, Session],
				1014: ['job', u16, Session.Character],
				1015: ['exp', u32, Session.Character],
				1016: ['level', u16, Session.Character],
				1018: ['exp_next', u32, Session.Character],
				1019: ['joblevel', u16, Session.Character],
				1024: ['str', u16, Session.Character],
				1025: ['agi', u16, Session.Character],
				1026: ['vit', u16, Session.Character],
				1027: ['int', u16, Session.Character],
				1028: ['dex', u16, Session.Character],
				1029: ['luk', u16, Session.Character],
				1051: ['money', u32, Session.Character],
				1052: ['speed', u16, Session.Character],
				1060: ['head', u16, Session.Character],
				1061: ['weapon', u16, Session.Character],
				1062: ['shield', u16, Session.Character],
				1063: ['bodypalette', u16, Session.Character],
				1064: ['headpalette', u16, Session.Character],
				1065: ['accessory', u16, Session.Character],
				1066: ['accessory2', u16, Session.Character],
				1067: ['accessory3', u16, Session.Character],
				1071: ['robe', u16, Session.Character]
			};

			for (const chunk of sessionContainer.data) {
				const map = props[chunk.id];
				if (map && chunk.data.byteLength > 0) {
					map[2][map[0]] = map[1](chunk);
				}
			}

			// GID and AID need to be in Session.Character as well to bind correctly to the Entity
			if (Session.GID) {
				Session.Character.GID = Session.GID;
			}
			if (Session.AID) {
				Session.Character.AID = Session.AID;
			}
		}

		const replayData = containers.find(c => c.type === ContainerType.ReplayData);
		if (replayData) {
			const sexChunk = replayData.data.find(d => d.id === 963);
			if (sexChunk && sexChunk.data.byteLength > 0) {
				const view = new DataView(sexChunk.data.buffer, sexChunk.data.byteOffset, sexChunk.data.byteLength);
				Session.Sex = view.getUint8(0);
				Session.Character.sex = Session.Sex;
			}
			const nameChunk = replayData.data.find(d => d.id === 964) || replayData.data[3];
			if (nameChunk && nameChunk.data.byteLength > 0) {
				const str = this._readString(nameChunk.data);
				if (str) Session.Character.name = str;
			}
			const mapChunk = replayData.data.find(d => d.id === 965) || replayData.data[4];
			if (mapChunk && mapChunk.data.byteLength > 0) {
				const str = this._readString(mapChunk.data);
				if (str) {
					this.mapName = str;
					if (!this.mapName.endsWith('.rsw')) {
						this.mapName += '.rsw';
					}
				}
			}
			
			// Parse coordinates for ACCEPT_ENTER
			const xChunk = replayData.data.find(d => d.id === 967); // PosX
			if (xChunk && xChunk.data.byteLength >= 2) {
				const view = new DataView(xChunk.data.buffer, xChunk.data.byteOffset, xChunk.data.byteLength);
				this.startX = view.getUint16(0, true);
			}
			const yChunk = replayData.data.find(d => d.id === 968); // PosY
			if (yChunk && yChunk.data.byteLength >= 2) {
				const view = new DataView(yChunk.data.buffer, yChunk.data.byteOffset, yChunk.data.byteLength);
				this.startY = view.getUint16(0, true);
			}
			const dirChunk = replayData.data.find(d => d.id === 969); // Direction
			if (dirChunk && dirChunk.data.byteLength >= 1) {
				const view = new DataView(dirChunk.data.buffer, dirChunk.data.byteOffset, dirChunk.data.byteLength);
				this.startDir = view.getUint8(0);
			}
		}
	}

	_prepareChunks(containers) {
		this.chunks = [];

		// The Replay file does not contain the ACCEPT_ENTER packet that normally
		// transitions the client from Login to Map state. We synthesize it here and
		// push it at the very beginning (time 0) so MapEngine correctly initializes
		// Session.Entity and loads the map BEFORE processing the replay stream.
		const acceptEnter = new Uint8Array(11);
		const view = new DataView(acceptEnter.buffer);
		view.setUint16(0, 0x0073, true); // PACKET.ZC.ACCEPT_ENTER (0x73)
		view.setUint32(2, Date.now(), true); // startTime

		// Encode 3-byte PosDir: (x << 14) | (y << 4) | (dir & 0x0f)
		const x = this.startX || 0;
		const y = this.startY || 0;
		const dir = this.startDir || 0;
		const p = (x << 14) | (y << 4) | (dir & 0x0f);
		
		// In JS, BinaryReader.readPos() decodes it from 3 bytes where byte[0] is the least significant
		// but in getUint8 it reads byte[0], byte[1], byte[2]. So it's:
		// bf_wba[2] = byte0, bf_wba[1] = byte1, bf_wba[0] = byte2.
		view.setUint8(6, (p >> 16) & 0xff);
		view.setUint8(7, (p >> 8) & 0xff);
		view.setUint8(8, p & 0xff);

		this.chunks.push({
			time: 0,
			data: acceptEnter
		});
		
		// Initial packets (sent immediately)
		const initialPackets = containers.find(c => c.type === ContainerType.InitialPackets);
		if (initialPackets) {
			for (const chunk of initialPackets.data) {
				this.chunks.push({
					time: 0,
					data: chunk.data
				});
			}
		}

		// Packet stream (sent over time)
		const packetStream = containers.find(c => c.type === ContainerType.PacketStream);
		if (packetStream) {
			for (const chunk of packetStream.data) {
				this.chunks.push({
					time: chunk.time,
					data: chunk.data
				});
			}
		}
	}

	_readString(uint8array) {
		let length = 0;
		while (length < uint8array.length && uint8array[length] !== 0) {
			length++;
		}
		const decoder = new TextDecoder('euc-kr');
		return decoder.decode(uint8array.subarray(0, length));
	}

	start() {
		console.log('[ReplayPlayer] start() called.');
		if (!this.parser || !this.mapName) {
			console.error('[ReplayPlayer] No replay loaded');
			throw new Error('No replay loaded');
		}

		if (!DB.isLoaded) {
			if (!DB.startedLazyInit) {
				DB.lazyInit();
				DB.startedLazyInit = true;
			}
			this._retryCount = (this._retryCount || 0) + 1;
			if (this._retryCount > 600) {
				console.error('[Replay] Failed loading databases.');
				this._retryCount = 0;
				DB.startedLazyInit = false;
				return;
			}
			setTimeout(() => this.start(), 100);
			return;
		}
		this._retryCount = 0;
		DB.startedLazyInit = false;

		// Mock network
		Network.setSocketFactory((host, port) => {
			this.socket = new ReplaySocket(host, port);
			return this.socket;
		});

		// Ensure no previous connections
		Network.close();

		this.playing = true;
		this.startTime = Date.now();
		this.lastTickTime = Date.now();
		this.currentChunkIndex = 0;

		// Start map engine with mock parameters
		MapEngine.init('127.0.0.1', 6900, this.mapName);

		// Hook into renderer loop
		// We use an independent requestAnimationFrame loop instead of Renderer.renderCallbacks
		// so it survives MapRenderer's Renderer.remove() calls during loading screens.
		this._animate = true;
		this.onTick();
	}

	pause() {
		this.playing = false;
	}

	resume() {
		this.playing = true;
		// Adjust start time to account for the pause duration
		const logicalTime = this.chunks[this.currentChunkIndex]?.time || 0;
		this.startTime = Date.now() - (logicalTime / this.speed);
	}

	stop() {
		this.playing = false;
		this._animate = false;
		Network.setSocketFactory(null);
		// TODO: Gracefully exit map engine and return to login/intro
	}

	setSpeed(speed) {
		const logicalTime = this.chunks[this.currentChunkIndex]?.time || 0;
		this.speed = speed;
		this.startTime = Date.now() - (logicalTime / this.speed);
	}

	tick() {
		if (this._animate) {
			requestAnimationFrame(this.onTick);
		}

		if (!this.playing || !this.socket || !this.socket.connected) {
			this.lastTickTime = Date.now();
			return;
		}

		const now = Date.now();

		if (MapRenderer.loading) {
			this.startTime += (now - this.lastTickTime);
			this.lastTickTime = now;
			return;
		}

		this.lastTickTime = now;
		const logicalTime = (now - this.startTime) * this.speed;

		while (this.currentChunkIndex < this.chunks.length) {
			if (MapRenderer.loading) {
				break;
			}

			const chunk = this.chunks[this.currentChunkIndex];
			if (chunk.time <= logicalTime) {
				// Inject packet into network manager
				try {
					this.socket.push(chunk.data);
				} catch (e) {
					console.error('[Replay] Packet injection error:', e);
				}
				this.currentChunkIndex++;
			} else {
				break;
			}
		}

		if (this.currentChunkIndex >= this.chunks.length) {
			this.stop(); // End of replay
		}
	}
}
