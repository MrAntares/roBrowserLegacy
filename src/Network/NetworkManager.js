/**
 * Network/NetworkManager.js
 *
 * Network Manager
 * Manage sockets and packets
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

// Load dependencies
import Configs from 'Core/Configs.js';
import BinaryReader from 'Utils/BinaryReader.js';
import PACKETVER from './PacketVerManager.js';
import PacketVersions from './PacketVersions.js';
import PacketRegister from './PacketRegister.js';
import PacketCrypt from './PacketCrypt.js';
import PacketLength from './PacketLength.js';
import WebSocket from './SocketHelpers/WebSocket.js';
import NodeSocket from './SocketHelpers/NodeSocket.js';

/**
 * Sockets list
 * @const {Socket[]}
 */
const _sockets = [];

/**
 * Custom socket factory for plugins
 * @type {function}
 */
let _socketFactory = null;

/**
 * Default socket factory - creates NodeSocket or WebSocket based on environment.
 * Custom factories can call this as a fallback.
 *
 * @param {string} host
 * @param {number} port
 * @return {Socket}
 */
function defaultSocketFactory(host, port) {
	const proxy = Configs.get('socketProxy', null);

	if (NodeSocket.isSupported()) {
		return new NodeSocket(host, port, proxy);
	}
	return new WebSocket(host, port, proxy);
}

/**
 * Current Socket
 * @type {Socket}
 */
let _socket = null;

/**
 * Pre-allocated pool and ring queue for packet logging.
 * Reuses static entry slots to achieve 0 allocation in steady-state.
 */
const LOG_ENTRY_KNOWN = 1;
const LOG_ENTRY_UNKNOWN = 2;
const LOG_QUEUE_SIZE = 1024; // Power of two
const LOG_QUEUE_MASK = LOG_QUEUE_SIZE - 1;

class LogEntry {
	type = 0;
	pktId = 0;
	pktName = '';
	pktLen = 0;
	dumpBytes = null;
	instance = null;
	hasCallback = false;

	reset() {
		this.type = 0;
		this.pktId = 0;
		this.pktName = '';
		this.pktLen = 0;
		this.dumpBytes = null;
		this.instance = null;
		this.hasCallback = false;
	}
}

const _logPool = Array.from({ length: LOG_QUEUE_SIZE }, () => new LogEntry());
let _logHead = 0;
let _logTail = 0;
let _logScheduled = false;

function _scheduleLogCallback(cb) {
	if (typeof window !== 'undefined' && window.requestIdleCallback) {
		requestIdleCallback(cb);
	} else {
		setTimeout(() => cb({ timeRemaining: () => 0, didTimeout: true }));
	}
}

function _processLogEntry(entry) {
	if (entry.type === LOG_ENTRY_KNOWN) {
		if (entry.dumpBytes) {
			console.log(
				'%c[Network] Dump Recv:\n%cPacket ID: 0x%s\nPacket Name: %s\nLength: %d\nContent:\n%s',
				'color:#900090',
				'color:inherit',
				entry.pktId.toString(16),
				entry.pktName,
				entry.pktLen,
				utilsBufferToHexString(entry.dumpBytes).toUpperCase()
			);
		}
		console.log('%c[Network] Recv:', 'color:#900090', entry.instance, entry.hasCallback ? '' : '(no callback)');
	} else if (entry.type === LOG_ENTRY_UNKNOWN) {
		if (entry.dumpBytes) {
			console.log(
				'%c[Network] Dump Recv:\n%cPacket ID: 0x%s\nPacket Name: [UNKNOWN]\nLength: %d\nContent:\n%s',
				'color:#900090',
				'color:inherit',
				entry.pktId.toString(16),
				entry.pktLen,
				utilsBufferToHexString(entry.dumpBytes).toUpperCase()
			);
		}
		console.error(
			'[Network] Packet "%c0x%s%c" not registered, skipping %d bytes.',
			'font-weight:bold',
			entry.pktId.toString(16),
			'font-weight:normal',
			entry.pktLen
		);
	}
	entry.reset();
}

function _runLogDrain(deadline) {
	while (_logHead !== _logTail && (deadline.timeRemaining() > 0 || deadline.didTimeout)) {
		const entry = _logPool[_logHead & LOG_QUEUE_MASK];
		_logHead++;
		_processLogEntry(entry);
	}

	if (_logHead !== _logTail) {
		_scheduleLogCallback(_runLogDrain);
	} else {
		_logHead = 0;
		_logTail = 0;
		_logScheduled = false;
	}
}

function _flushLogs() {
	if (_logScheduled) {
		return;
	}
	_logScheduled = true;
	_scheduleLogCallback(_runLogDrain);
}

/**
 * Ring buffer for incoming network data — avoids per-message Uint8Array allocation.
 * `_ring_head` is the index of the first unread byte;
 * `_ring_tail` is the index where the next incoming byte will be written.
 * When head === tail the ring is empty.
 * The capacity is always a power of two so wrap-around is a cheap bitwise AND.
 * @type {Uint8Array}
 */
let _ring = new Uint8Array(256 * 1024); // 256 KB initial capacity
let _ring_mask = _ring.length - 1; // capacity - 1 (bitmask for wrap)
let _ring_head = 0; // read cursor (logical byte index)
let _ring_tail = 0; // write cursor (logical byte index)

/**
 * Singleton BinaryReader reused across every receive() call to avoid
 * allocating a new instance (and a new DataView) per network message.
 * Initialised lazily on first use inside receive().
 * @type {BinaryReader|null}
 */
let _fp = null;

/**
 * Custom callback for disconnection
 * @type {function}
 */
let _onDisconnect = null;

/**
 * Defines if dump packets as hex string
 * @const {boolean}
 */
const packetDump = Configs.get('packetDump', false);

/**
 * Packets definition
 *
 * @param {string} name
 * @param {callback} struct - callback to parse the packet
 * @param {number} size - packet size
 */
function Packets(name, Struct, size) {
	this.name = name;
	this.Struct = Struct;
	this.size = size;
	this.callback = null;
}

/**
 * List of supported packets
 * @type {Packets[]}
 */
Packets.list = [];

/**
 * Connect to a server
 *
 * @param {string} host
 * @param {number} port
 * @param {function} callback once connected or not
 * @param {boolean} is zone server ?
 */
function connect(host, port, callback, isZone) {
	const socket = _socketFactory ? _socketFactory(host, port) : defaultSocketFactory(host, port);

	socket.isZone = !!isZone;
	socket.onClose = onClose;
	socket.onComplete = function onComplete(success) {
		let msg = 'Fail';
		let color = 'red';

		if (success) {
			msg = 'Success';
			color = 'green';

			// If current socket has ping, remove it
			if (_socket && _socket.ping) {
				clearInterval(_socket.ping);
			}
			_ring_head = 0;
			_ring_tail = 0;
			socket.onMessage = receive;
			_sockets.push((_socket = socket));

			// Map server encryption
			if (isZone) {
				PacketCrypt.init();
			}
		}
		console.log('%c[Network] ' + msg + ' to connect to ' + host + ':' + port, 'font-weight:bold;color:' + color);
		callback.call(this, success);
	};
}

/**
 * Send a packet to the server
 *
 * @param Packet
 */
function sendPacket(Packet) {
	const pkt = Packet.build();

	if (packetDump) {
		const fp = new BinaryReader(pkt.buffer);
		const id = fp.readUShort();
		console.log(
			'%c[Network] Dump Send: \n%cPacket ID: 0x%s\nPacket Name: %s\nLength: %d\nContent:\n%s',
			'color:#007070',
			'color:inherit',
			id.toString(16),
			Packet.constructor.name,
			pkt.buffer.byteLength,
			utilsBufferToHexString(pkt.buffer).toUpperCase()
		);
	}

	console.log('%c[Network] Send:', 'color:#007070', Packet);

	// Encrypt packet
	if (_socket && _socket.isZone) {
		PacketCrypt.process(pkt.view);
	}

	send(pkt.buffer);
}

/**
 * Send buffer to the server
 *
 * @param {ArrayBuffer} buffer
 */
function send(buffer) {
	if (_socket) {
		_socket.send(buffer);
	}
}

/**
 * Register a Packet
 *
 * @param {number} id - packet UID
 * @param {function} struct - packet structure callback
 */
function registerPacket(id, Struct) {
	if (Struct) {
		Struct.id = id;
		Packets.list[id] = new Packets(Struct.name, Struct, Struct.size);
	} else {
		console.error('registerPacket: Struct is undefined for id: 0x' + parseInt(id, 10).toString(16));
	}
}

/**
 * Hook a Packet
 *
 * @param {object} packet
 * @param {function} callback to use packet
 */
function hookPacket(packet, callback) {
	if (!packet) {
		throw new Error('NetworkManager::HookPacket() - Invalid packet structure "' + JSON.stringify(packet) + '"');
	}

	if (!packet.id) {
		throw new Error('NetworkManager::HookPacket() - Packet not yet register "' + packet.name + '"');
	}

	Packets.list[packet.id].callback = callback;
}

/**
 * Force to read from a used version for the next receive data
 *
 * @param callback
 */
function read(callback) {
	read.callback = callback;
}

/**
 * Callback used for reading the data for the next buffer received from server
 * @type {function}
 */
read.callback = null;

/**
 * Grow the ring buffer to at least `minCapacity` bytes, preserving pending data.
 * New capacity is the next power of two >= minCapacity.
 *
 * @param {number} minCapacity
 */
function _ringGrow(minCapacity) {
	let newCap = _ring.length;
	while (newCap < minCapacity) {
		newCap *= 2;
	}

	const pending = _ring_tail - _ring_head; // bytes currently buffered
	const newRing = new Uint8Array(newCap);

	// Copy pending bytes to the start of the new ring (linearising any wrap)
	if (pending > 0) {
		const physHead = _ring_head & _ring_mask;
		const physTail = _ring_tail & _ring_mask;

		if (physTail > physHead) {
			// Contiguous
			newRing.set(_ring.subarray(physHead, physTail), 0);
		} else {
			// Wraps around
			const firstChunk = _ring.length - physHead;
			newRing.set(_ring.subarray(physHead), 0);
			newRing.set(_ring.subarray(0, physTail), firstChunk);
		}
	}

	_ring = newRing;
	_ring_mask = newCap - 1;
	_ring_head = 0;
	_ring_tail = pending;
}

/**
 * Return a contiguous Uint8Array view of `len` bytes starting at ring logical
 * position `logicalStart`.  When the slice crosses the ring's physical
 * boundary a minimal temporary copy is made (slow path, very rare).
 *
 * @param {number} logicalStart  logical read position (ring_head-relative)
 * @param {number} len           number of bytes to view
 * @return {Uint8Array}
 */
function _ringSlice(logicalStart, len) {
	const physStart = logicalStart & _ring_mask;
	const physEnd = physStart + len;

	if (physEnd <= _ring.length) {
		// Fast path – entirely within one physical region
		return _ring.subarray(physStart, physEnd);
	}

	// Slow path – wraps around the ring boundary: materialise a contiguous copy
	const tmp = new Uint8Array(len);
	const firstChunk = _ring.length - physStart;
	tmp.set(_ring.subarray(physStart), 0);
	tmp.set(_ring.subarray(0, len - firstChunk), firstChunk);
	return tmp;
}

/**
 * Read a little-endian uint16 from the ring at logical position `logPos`
 * without going through BinaryReader (avoids a DataView when in the fast
 * path — both bytes are within the same physical region).
 *
 * @param {number} logPos
 * @return {number}
 */
function _ringReadUShort(logPos) {
	const p = logPos & _ring_mask;
	if (p + 2 <= _ring.length) {
		return _ring[p] | (_ring[p + 1] << 8);
	}
	// Wrap: low byte at end, high byte at start
	return _ring[p] | (_ring[0] << 8);
}

/**
 * Received data from server.
 * Appends `buf` into the persistent ring buffer, then parses as many complete
 * packets as available.  Incomplete packet bytes remain in the ring and are
 * consumed on the next call — no allocation needed for the common case.
 *
 * @param {ArrayBuffer|Uint8Array} buf
 */
function receive(buf) {
	const incoming = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
	const inLen = incoming.length;

	// ── Grow ring if incoming data would overflow ──────────────────────────
	const pending = _ring_tail - _ring_head;
	const needed = pending + inLen;
	if (needed > _ring.length) {
		_ringGrow(needed);
	}

	// ── Append incoming bytes into the ring ───────────────────────────────
	const physTail = _ring_tail & _ring_mask;
	const spaceToEnd = _ring.length - physTail;

	if (inLen <= spaceToEnd) {
		_ring.set(incoming, physTail);
	} else {
		// Wrap: write in two chunks
		_ring.set(incoming.subarray(0, spaceToEnd), physTail);
		_ring.set(incoming.subarray(spaceToEnd), 0);
	}
	_ring_tail += inLen;

	// ── Initialise the singleton BinaryReader lazily ─────────────────────
	if (!_fp) {
		// A zero-byte placeholder; reset() will supply the real view per packet
		_fp = new BinaryReader(new ArrayBuffer(0));
	}

	// ── Read hook (one-shot raw access) ──────────────────────────────────
	if (read.callback) {
		const cb = read.callback;
		read.callback = null;
		const start = _ring_head;
		_fp.reset(_ringSlice(start, _ring_tail - start));
		cb(_fp);
		if (_ring_head === start) {
			_ring_head += _fp.tell();
		}
	}

	// ── Parse packets ─────────────────────────────────────────────────────
	let id, packet;
	let length = 0;

	while (_ring_tail - _ring_head >= 2) {
		const pktStart = _ring_head; // logical start of this packet
		const avail = _ring_tail - pktStart;

		// Not enough bytes for the 2-byte opcode
		if (avail < 2) {
			break;
		}

		id = _ringReadUShort(pktStart);
		let packet_len = PacketLength.getPacketLength(id);
		packet_len = packet_len ? packet_len : avail;

		if (packet_len < 0) {
			// Variable-length packet: the 3rd+4th bytes carry the total length
			if (avail < 4) {
				break; // wait for more data
			}
			length = _ringReadUShort(pktStart + 2);
		} else {
			length = packet_len;
		}

		// Not enough bytes for the full packet yet
		if (avail < length) {
			break;
		}

		// ── Materialise a contiguous Uint8Array for this packet ──────────
		// _ringSlice is zero-copy in the common (non-wrapping) case.
		const pktBytes = _ringSlice(pktStart, length);

		// Advance the ring head past this packet
		// Support for "0" type: if length is 0, advance by 2 to avoid infinite loop
		_ring_head += length || 2;

		if (Packets.list[id]) {
			packet = Packets.list[id];

			// Reset the singleton reader to point at this packet's bytes.
			// fp.offset is 0; Struct constructors receive (fp, endOffset).
			_fp.reset(pktBytes);
			_fp.seek(packet_len < 0 ? 4 : 2, SEEK_SET);

			// Parse packet — new Struct per packet intentionally (see comment
			// at original lines 308-313: reuse causes residual-state bugs).
			packet.instance = new packet.Struct(_fp, length);

			// Grab the slot BEFORE bumping tail. If the queue is full, this slot is the
			// oldest unprocessed entry (tail & mask === head & mask), so overwriting it
			// here IS the "drop oldest" — the head bump below just skips past it.
			const entry = _logPool[_logTail & LOG_QUEUE_MASK];
			_logTail++;
			if (_logTail - _logHead > LOG_QUEUE_SIZE) {
				_logHead = _logTail - LOG_QUEUE_SIZE; // Drop oldest if buffer overflows
			}
			entry.type = LOG_ENTRY_KNOWN;
			entry.pktId = id;
			entry.pktName = packet.name;
			entry.pktLen = length;
			entry.dumpBytes = packetDump ? pktBytes.slice() : null;
			entry.instance = packet.instance;
			entry.hasCallback = !!packet.callback;

			_flushLogs();

			// Call controller
			if (packet.callback) {
				packet.callback(packet.instance);
			}
		} else {
			// Grab the slot BEFORE bumping tail. If the queue is full, this slot is the
			// oldest unprocessed entry (tail & mask === head & mask), so overwriting it
			// here IS the "drop oldest" — the head bump below just skips past it.
			const entry = _logPool[_logTail & LOG_QUEUE_MASK];
			_logTail++;
			if (_logTail - _logHead > LOG_QUEUE_SIZE) {
				_logHead = _logTail - LOG_QUEUE_SIZE;
			}
			entry.type = LOG_ENTRY_UNKNOWN;
			entry.pktId = id;
			entry.pktName = '';
			entry.pktLen = length;
			entry.dumpBytes = packetDump ? pktBytes.slice() : null;
			entry.instance = null;
			entry.hasCallback = false;

			_flushLogs();
		}
	}

	// Compact the ring when it is empty to prevent unbounded logical-index growth
	if (_ring_head === _ring_tail) {
		_ring_head = 0;
		_ring_tail = 0;
	}
}

/**
 * Communication end
 * Server ask to close the socket
 */
function onClose() {
	const idx = _sockets.indexOf(this);

	if (this === _socket) {
		console.warn('[Network] Disconnect from server');

		if (_socket.ping) {
			clearInterval(_socket.ping);
		}

		if (_onDisconnect) {
			_onDisconnect();
		} else {
			import('UI/UIManager.js').then(UIManager => {
				UIManager.default.showErrorBox('Disconnected from Server.');
			});
		}
	}

	if (idx !== -1) {
		_sockets.splice(idx, 1);
	}
}

/**
 * Close connection with server
 * Is this needed ?
 */
function close() {
	let idx;

	if (_socket) {
		const s = _socket;
		_socket = null;

		s.close();

		if (s.isZone) {
			PacketCrypt.reset();
		}

		if (s.ping) {
			clearInterval(s.ping);
		}

		idx = _sockets.indexOf(s);
		if (idx !== -1) {
			_sockets.splice(idx, 1);
		}
		_ring_head = 0;
		_ring_tail = 0;
	}
}

/**
 * Define a ping
 *
 * @param callback
 */
function setPing(callback) {
	if (_socket) {
		if (_socket.ping) {
			clearInterval(_socket.ping);
		}
		_socket.ping = setInterval(callback, 10000);

		while (_sockets.length > 1) {
			if (_socket !== _sockets[0]) {
				_sockets[0].close();
				_sockets.splice(0, 1);
			}
		}
	}
}

/**
 * Set a custom socket factory for plugins.
 * The factory receives (host, port) and returns a socket.
 * Call defaultSocketFactory(host, port) inside your factory as a fallback.
 *
 * @param {function|null} factory
 */
function setSocketFactory(factory) {
	_socketFactory = factory;
}

/**
 * Get back ip from long
 *
 * @param {number} long ip
 * @return {string} ip
 */
function utilsLongToIP(long) {
	const buf = new ArrayBuffer(4);
	const uint8 = new Uint8Array(buf);
	const uint32 = new Uint32Array(buf);
	uint32[0] = long;

	return Array.prototype.join.call(uint8, '.');
}

/**
 * Convert ArryBuffer into a hex string
 *
 * @param {ArrayBuffer} buffer
 */
function utilsBufferToHexString(buffer) {
	return [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, '0') + ' ').join('');
}

/**
 * Export
 */
const Network = (function network() {
	let keys;
	let i, count;

	// Add packet version
	keys = Object.keys(PacketVersions);
	count = keys.length;

	for (i = 0; i < count; ++i) {
		PACKETVER.addSupport(keys[i], PacketVersions[keys[i]]);
	}

	// Register packets
	keys = Object.keys(PacketRegister);
	count = keys.length;

	for (i = 0; i < count; ++i) {
		registerPacket(keys[i], PacketRegister[keys[i]]);
	}

	return {
		sendPacket: sendPacket,
		send: send,
		setPing: setPing,
		connect: connect,
		hookPacket: hookPacket,
		close: close,
		read: read,
		set onDisconnect(callback) {
			_onDisconnect = callback;
		},
		get onDisconnect() {
			return _onDisconnect;
		},
		setSocketFactory: setSocketFactory,
		defaultSocketFactory: defaultSocketFactory,
		registerPacket: registerPacket,
		utils: {
			longToIP: utilsLongToIP
		}
	};
})();

export default Network;
