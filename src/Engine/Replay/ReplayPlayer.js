/**
 * Engine/Replay/ReplayPlayer.js
 *
 * Ragnarok Online Replay System â€” Orchestrator / State Machine
 *
 * Pipeline:
 *   IDLE â†’ LOADING_REPLAY â†’ APPLYING_SESSION â†’ LOADING_MAP
 *        â†’ PLAYING_INITIAL_DATA â†’ INITIAL_DATA_COMPLETE
 *        â†’ PLAYING_PACKET_STREAM â†’ REPLAY_FINISHED
 */
import DB from 'DB/DBManager.js';
import Network from 'Network/NetworkManager.js';
import MapRenderer from 'Renderer/MapRenderer.js';
import Session from 'Engine/SessionStorage.js';
import MapEngine from 'Engine/MapEngine.js';
import Player from 'Renderer/Entity/Player.js';
import { ReplayState } from 'Engine/Replay/ReplayTypes.js';
import ReplaySocket from './ReplaySocket.js';
import ReplayParser from './ReplayParser.js';

export default class ReplayPlayer {
	constructor() {
		this.parser = null;
		this.socket = null;

		// Playback controls
		this.playing = false;
		this.speed = 1.0;
		this.startTime = 0;
		this.lastTickTime = 0;

		// State machine
		this._state = ReplayState.IDLE;

		// Three independent buffers (populated by load())
		this._sessionData = null;
		this._initialBuffer = [];       // Array of { type, typeName, chunks: [{ time, data }] }
		this._packetStreamBuffer = [];  // Array of { id, time, length, data }

		// Playback cursors
		this._initialGroupIndex = 0;
		this._initialChunkIndex = 0;
		this._streamChunkIndex = 0;

		// Bound tick handler
		this._onTick = this.tick.bind(this);
		this._animate = false;

		// DB retry counter
		this._retryCount = 0;
	}

	async load(file) {
		this._setState(ReplayState.LOADING_REPLAY);
		console.log('[Replay] Loading RRF...');

		const buffer = await file.arrayBuffer();
		this.parser = new ReplayParser(buffer);
		const result = this.parser.parse();

		this._sessionData = result.sessionBuffer;
		this._initialBuffer = result.initialBuffer;
		this._packetStreamBuffer = result.packetStreamBuffer;

		this._setState(ReplayState.IDLE);
	}

	start() {
		if (!this.parser || !this._sessionData) {
			console.error('[ReplayPlayer] No replay loaded');
			throw new Error('No replay loaded');
		}

		// Wait for DB to be ready
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

		// Reset cursors
		this._initialGroupIndex = 0;
		this._initialChunkIndex = 0;
		this._streamChunkIndex = 0;
		this.playing = true;
		this.startTime = 0;
		this.lastTickTime = Date.now();

		// Install mock socket
		Network.setSocketFactory((host, port) => {
			this.socket = new ReplaySocket(host, port);
			return this.socket;
		});

		Network.close();

		// Apply session data BEFORE loading map
		this._applySession();
	}

	pause() {
		this.playing = false;
	}

	resume() {
		this.playing = true;
		const nextChunk = this._getCurrentStreamChunk();
		const logicalTime = nextChunk ? nextChunk.time : 0;
		this.startTime = Date.now() - logicalTime / this.speed;
	}

	stop() {
		this.playing = false;
		this._animate = false;
		Network.setSocketFactory(null);
		this._setState(ReplayState.IDLE);
	}

	setSpeed(speed) {
		const nextChunk = this._getCurrentStreamChunk();
		const logicalTime = nextChunk ? nextChunk.time : 0;
		this.speed = speed;
		this.startTime = Date.now() - logicalTime / this.speed;
	}

	_setState(newState) {
		this._state = newState;
	}

	/**
	 * Applies session data directly to Session/Session.Entity.
	 * Called BEFORE MapEngine.init so map name and character are available.
	 */
	_applySession() {
		this._setState(ReplayState.APPLYING_SESSION);
		console.log('[Replay] Applying session...');

		const s = this._sessionData;

		const charName = s.characterName || 'Replay';

		// Reset Session.Entity completely using a new Player instance so no stale data
		// from previous sessions leaks in, and all Entity methods (walkTo, display, etc.) exist.
		const playerInitData = {
			name: charName,
			sex: (s.sex === 0 || s.sex === 1) ? s.sex : 0,
			job: s.job !== undefined ? s.job : 0,
			clevel: s.level !== undefined ? s.level : 1,
			joblevel: s.joblevel !== undefined ? s.joblevel : 1,
			exp: s.exp || 0,
			exp_next: s.exp_next || 0,
			str: s.str || 1, agi: s.agi || 1, vit: s.vit || 1, int: s.int || 1, dex: s.dex || 1, luk: s.luk || 1,
			money: s.money || 0,
			speed: s.speed || 150,
			head: s.head || 0,
			weapon: s.weapon || 0,
			shield: s.shield || 0,
			bodypalette: s.bodypalette || 0,
			headpalette: s.headpalette || 0,
			accessory: s.accessory || 0,
			accessory2: s.accessory2 || 0,
			accessory3: s.accessory3 || 0,
			robe: s.robe || 0
		};

		if (s.AID !== undefined) {
			Session.AID = s.AID;
			playerInitData.AID = s.AID;
		}
		if (s.GID !== undefined) {
			Session.GID = s.GID;
			playerInitData.GID = s.GID;
		}

		Session.Entity = new Player(playerInitData);

		// Mirror sex into Session.Sex
		Session.Sex = Session.Entity.sex;

		// Apply all remaining character properties from session data
		const charProps = ['job', 'exp', 'level', 'exp_next', 'joblevel', 'str', 'agi',
			'vit', 'int', 'dex', 'luk', 'money', 'speed', 'head', 'weapon', 'shield',
			'bodypalette', 'headpalette', 'accessory', 'accessory2', 'accessory3', 'robe'];

		for (const prop of charProps) {
			if (s[prop] !== undefined) {
				Session.Entity[prop] = s[prop];
			}
		}

		console.log('[Replay] Session applied — sex:', Session.Entity.sex, 'head:', Session.Entity.head, 'job:', Session.Entity.job, 'map:', s.mapName);

		this._mapName = s.mapName || 'prontera.rsw';
		this._startX = s.startX || 0;
		this._startY = s.startY || 0;
		this._startDir = s.startDir || 0;

		this._loadMap();
	}

	_loadMap() {
		this._setState(ReplayState.LOADING_MAP);
		console.log('[Replay] Loading map...');

		// ACCEPT_ENTER must be sent after socket connects so MapEngine can call
		// MapRenderer.setMap() and start the loading sequence.
		this._acceptEnterSent = false;
		// Track if map loading has actually started (setMap called)
		this._mapLoadStarted = false;

		// NOTE: We do NOT hook MapRenderer.onLoad here because MapEngine.onMapChange()
		// overwrites it. Instead we poll MapRenderer.loading in tick().

		MapEngine.init('127.0.0.1', 6900, this._mapName);

		// Start animation loop
		this._animate = true;
		this.lastTickTime = Date.now();
		this._onTick();
	}

	/**
	 * Synthesizes the ZC_ACCEPT_ENTER (0x0073) packet that MapEngine needs
	 * to register the player entity and trigger the full map initialisation sequence.
	 */
	_sendAcceptEnter() {
		const pkt = new Uint8Array(11);
		const view = new DataView(pkt.buffer);
		view.setUint16(0, 0x0073, true);
		view.setUint32(2, Date.now(), true);

		const x = this._startX;
		const y = this._startY;
		const dir = this._startDir;
		const p = (x << 14) | (y << 4) | (dir & 0x0f);
		view.setUint8(6, (p >> 16) & 0xff);
		view.setUint8(7, (p >> 8) & 0xff);
		view.setUint8(8, p & 0xff);

		this._pushPacket(pkt);
	}

	tick() {
		if (this._animate) {
			requestAnimationFrame(this._onTick);
		}

		if (!this.playing || !this.socket || !this.socket.connected) {
			this.lastTickTime = Date.now();
			return;
		}

		const now = Date.now();

		switch (this._state) {
			case ReplayState.LOADING_MAP:
				// Step 1: Send ACCEPT_ENTER as soon as the socket connects so MapEngine
				// calls MapRenderer.setMap() and starts the asset loading sequence.
				if (!this._acceptEnterSent) {
					this._sendAcceptEnter();
					this._acceptEnterSent = true;
					this._mapLoadStarted = false;
				}
				// Step 2: Once MapRenderer.loading becomes true, the map started loading.
				if (this._acceptEnterSent && MapRenderer.loading) {
					this._mapLoadStarted = true;
				}
				// Step 3: Once MapRenderer.loading becomes false AFTER it was true,
				// the map has fully loaded — transition to initial data.
				if (this._mapLoadStarted && !MapRenderer.loading) {
					console.log('[Replay] Map loaded');
					this._mapLoadStarted = false;
					this._setState(ReplayState.PLAYING_INITIAL_DATA);
					console.log('[Replay] Playing initial packets...');
				}
				// Freeze stream time while map is loading
				this.startTime += now - this.lastTickTime;
				this.lastTickTime = now;
				break;

			case ReplayState.PLAYING_INITIAL_DATA:
				this.lastTickTime = now;
				this._tickInitialData();
				break;

			case ReplayState.INITIAL_DATA_COMPLETE:
				this._setState(ReplayState.PLAYING_PACKET_STREAM);
				this.startTime = Date.now();
				this.lastTickTime = now;
				this._firstStreamTime = this._packetStreamBuffer.length > 0 ? this._packetStreamBuffer[0].time : 0;
				console.log(`[Replay] Starting packet stream: ${this._packetStreamBuffer.length} chunks (first time: ${this._firstStreamTime}ms)`);
				break;

			case ReplayState.PLAYING_PACKET_STREAM:
				this.lastTickTime = now;
				this._tickPacketStream(now);
				break;

			default:
				this.lastTickTime = now;
				break;
		}
	}

	/**
	 * Drains initial data (InitialPackets → InitialEntities → InitialFloorItems)
	 * in original file order immediately without tick delays.
	 */
	_tickInitialData() {
		console.log(`[Replay] Injecting initial data groups (${this._initialBuffer.length} groups)...`);

		for (const group of this._initialBuffer) {
			console.log(`[Replay] Playing ${group.typeName || 'initial group'} (${group.chunks.length} packets)...`);
			for (const chunk of group.chunks) {
				const data = chunk.data || chunk;
				this._pushPacket(data);
			}
		}

		console.log('[Replay] Initial data completed');
		this._setState(ReplayState.INITIAL_DATA_COMPLETE);
	}

	/**
	 * Time-based packet injection from the PacketStream buffer.
	 */
	_tickPacketStream(now) {
		const logicalTime = (now - this.startTime) * this.speed + (this._firstStreamTime || 0);

		while (this._streamChunkIndex < this._packetStreamBuffer.length) {
			const chunk = this._packetStreamBuffer[this._streamChunkIndex];
			if (chunk.time <= logicalTime) {
				this._pushPacket(chunk.data);
				this._streamChunkIndex++;
			} else {
				break;
			}
		}

		if (this._streamChunkIndex >= this._packetStreamBuffer.length) {
			console.log('[Replay] Replay finished');
			this._setState(ReplayState.REPLAY_FINISHED);
			this.stop();
		}
	}

	_getCurrentStreamChunk() {
		return this._packetStreamBuffer[this._streamChunkIndex] || null;
	}

	/**
	 * Injects a raw network packet buffer into the NetworkManager via the mock socket.
	 */
	_pushPacket(data) {
		if (!this.socket || !this.socket.connected) {
			return;
		}
		try {
			this.socket.push(data);
		} catch (e) {
			console.error('[Replay] Packet injection error:', e);
		}
	}
}
