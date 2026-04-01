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

import Configs from 'Core/Configs.js';
import BinaryReader, { SEEK_SET } from 'Utils/BinaryReader.js';
import PACKETVER from 'Network/PacketVerManager.js';
import PacketVersions from 'Network/PacketVersions.js';
import PacketRegister from 'Network/PacketRegister.js';
import PacketCrypt from 'Network/PacketCrypt.js';
import PacketLength from 'Network/PacketLength.js';
import WebSocket from 'Network/SocketHelpers/WebSocket.js';
import NodeSocket from 'Network/SocketHelpers/NodeSocket.js';

/**
 * @class PacketDefinition
 * @description Structure to store packet info and its callback.
 */
class PacketDefinition {
	constructor(name, Struct, size) {
		this.name = name;
		this.Struct = Struct;
		this.size = size;
		this.callback = null;
		this.instance = null;
	}
}

/**
 * @class NetworkManager
 * @description Core network management class for handling server connections and packet dispatch.
 */
class NetworkManager {
	static #sockets = [];
	static #currentSocket = null;
	static #saveBuffer = null;
	static #socketFactory = null;
	static #packets = new Map();
	static #packetDump = Configs.get('packetDump', false);
	static #readCallback = null;

	/**
	 * Initialize NetworkManager: Register packet versions and handlers.
	 */
	static init() {
		// Add packet versioning support
		Object.entries(PacketVersions).forEach(([date, versions]) => {
			PACKETVER.addSupport(Number(date), versions);
		});

		// Register all known packets
		Object.entries(PacketRegister).forEach(([id, Struct]) => {
			this.registerPacket(Number(id), Struct);
		});
	}

	/**
	 * Default socket factory - creates NodeSocket or WebSocket based on environment.
	 * @param {string} host
	 * @param {number} port
	 * @returns {object} socket instance
	 */
	static defaultSocketFactory(host, port) {
		const proxy = Configs.get('socketProxy', null);
		if (NodeSocket.isSupported()) {
			return new NodeSocket(host, port, proxy);
		}
		return new WebSocket(host, port, proxy);
	}

	/**
	 * Connect to a server.
	 * Supports both legacy callback and modern promise-based usage.
	 * @param {string} host
	 * @param {number} port
	 * @param {function|boolean} [callbackOrIsZone=false] - callback (legacy) or isZone (modern)
	 * @param {boolean} [isZone=false] - is it a zone server? (legacy 4th arg)
	 * @returns {Promise<boolean>}
	 */
	static async connect(host, port, callbackOrIsZone = false, isZone = false) {
		let actualCallback = null;
		let actualIsZone = isZone;

		if (typeof callbackOrIsZone === 'function') {
			actualCallback = callbackOrIsZone;
		} else {
			actualIsZone = !!callbackOrIsZone;
		}

		const socket = this.#socketFactory
			? this.#socketFactory(host, port)
			: this.defaultSocketFactory(host, port);

		socket.isZone = !!actualIsZone;
		socket.onClose = this.onClose.bind(this, socket);

		return new Promise(resolve => {
			socket.onComplete = success => {
				if (success) {
					// Clean up previous socket ping
					if (this.#currentSocket?.ping) {
						clearInterval(this.#currentSocket.ping);
					}

					socket.onMessage = this.receive.bind(this);
					this.#currentSocket = socket;
					this.#sockets.push(socket);

					if (actualIsZone) {
						PacketCrypt.init();
					}
				}

				const color = success ? 'green' : 'red';
				const status = success ? 'Success' : 'Fail';
				console.log(
					`%c[Network] ${status} to connect to ${host}:${port}`,
					`font-weight:bold;color:${color}`
				);

				if (actualCallback) {
					actualCallback(success);
				}
				resolve(success);
			};
		});
	}

	/**
	 * Send a packet to the current server.
	 * @param {object} packet
	 */
	static sendPacket(packet) {
		const pkt = packet.build();

		if (this.#packetDump) {
			const fp = new BinaryReader(pkt.buffer);
			const id = fp.readUShort();
			console.log(
				'%c[Network] Dump Send: \n%cPacket ID: 0x%s\nPacket Name: %s\nLength: %d\nContent:\n%s',
				'color:#007070',
				'color:inherit',
				id.toString(16),
				packet.constructor.name,
				pkt.buffer.byteLength,
				this.utilsBufferToHexString(pkt.buffer).toUpperCase()
			);
		}

		console.log('%c[Network] Send:', 'color:#007070', packet);

		if (this.#currentSocket?.isZone) {
			PacketCrypt.process(pkt.view);
		}

		this.send(pkt.buffer);
	}

	/**
	 * Send raw buffer to the server.
	 * @param {ArrayBuffer} buffer
	 */
	static send(buffer) {
		if (this.#currentSocket) {
			this.#currentSocket.send(buffer);
		}
	}

	/**
	 * Register a packet structure.
	 * @param {number} id
	 * @param {function} Struct
	 */
	static registerPacket(id, Struct) {
		Struct.id = id;
		this.#packets.set(id, new PacketDefinition(Struct.name, Struct, Struct.size));
	}

	/**
	 * Hook a callback to a specific packet.
	 * @param {object} packet
	 * @param {function} callback
	 */
	static hookPacket(packet, callback) {
		if (!packet?.id) {
			const name = packet?.name || 'unknown';
			throw new Error(`NetworkManager::hookPacket() - Packet "${name}" not registered or invalid.`);
		}
		this.#packets.get(packet.id).callback = callback;
	}

	/**
	 * Set a one-time callback for the next received data.
	 * @param {function} callback
	 */
	static read(callback) {
		this.#readCallback = callback;
	}

	/**
	 * Handle incoming data from the server.
	 * @param {ArrayBuffer} buf
	 */
	static receive(buf) {
		let buffer;

		// Reassemble partial packets
		if (this.#saveBuffer) {
			const combined = new Uint8Array(this.#saveBuffer.length + buf.byteLength);
			combined.set(this.#saveBuffer, 0);
			combined.set(new Uint8Array(buf), this.#saveBuffer.length);
			buffer = combined.buffer;
		} else {
			buffer = buf;
		}

		const fp = new BinaryReader(buffer);

		if (this.#readCallback) {
			this.#readCallback(fp);
			this.#readCallback = null;
		}

		while (fp.tell() < fp.length) {
			const offset = fp.tell();

			if (offset + 2 > fp.length) {
				this.#saveBuffer = new Uint8Array(buffer, offset, fp.length - offset);
				return;
			}

			const id = fp.readUShort();
			let packetLen = PacketLength.getPacketLength(id);
			packetLen = packetLen || fp.length - offset;

			let length;
			if (packetLen < 0) {
				if (offset + 4 > fp.length) {
					this.#saveBuffer = new Uint8Array(buffer, offset, fp.length - offset);
					return;
				}
				length = fp.readUShort();
			} else {
				length = packetLen;
			}

			const endOffset = offset + length;
			if (endOffset > fp.length) {
				const start = fp.tell() - (packetLen < 0 ? 4 : 2);
				this.#saveBuffer = new Uint8Array(buffer, start, fp.length - start);
				return;
			}

			const packetInfo = this.#packets.get(id);
			if (packetInfo) {
				if (this.#packetDump) {
					const hex = this.utilsBufferToHexString(new Uint8Array(buffer, offset, length));
					console.log(
						'%c[Network] Dump Recv:\n%cPacket ID: 0x%s\nPacket Name: %s\nLength: %d\nContent:\n%s',
						'color:#900090', 'color:inherit', id.toString(16), packetInfo.name, length, hex.toUpperCase()
					);
				}

				packetInfo.instance = new packetInfo.Struct(fp, endOffset);
				console.log('%c[Network] Recv:', 'color:#900090', packetInfo.instance, packetInfo.callback ? '' : '(no callback)');

				if (packetInfo.callback) {
					packetInfo.callback(packetInfo.instance);
				}
			} else {
				if (this.#packetDump) {
					const hex = this.utilsBufferToHexString(new Uint8Array(buffer, offset, length));
					console.log(
						'%c[Network] Dump Recv:\n%cPacket ID: 0x%s\nPacket Name: [UNKNOWN]\nLength: %d\nContent:\n%s',
						'color:#900090', 'color:inherit', id.toString(16), length, hex.toUpperCase()
					);
				}
				console.error(`[Network] Packet 0x${id.toString(16)} not registered, skipping ${length} bytes.`);
			}

			if (length) {
				fp.seek(endOffset, SEEK_SET);
			}
		}

		this.#saveBuffer = null;
	}

	/**
	 * Handle socket closure.
	 * @param {object} socket
	 */
	static onClose(socket) {
		const idx = this.#sockets.indexOf(socket);
		if (socket === this.#currentSocket) {
			console.warn('[Network] Disconnected from server');
			if (socket.ping) {
				clearInterval(socket.ping);
			}

			import('UI/UIManager.js').then(({ default: UIManager }) => {
				UIManager.showErrorBox('Disconnected from Server.');
			});
			this.#currentSocket = null;
		}

		if (idx !== -1) {
			this.#sockets.splice(idx, 1);
		}
	}

	/**
	 * Manually close the current connection.
	 */
	static close() {
		if (this.#currentSocket) {
			const socket = this.#currentSocket;
			socket.close();

			if (socket.isZone) {
				PacketCrypt.reset();
			}

			if (socket.ping) {
				clearInterval(socket.ping);
			}

			const idx = this.#sockets.indexOf(socket);
			if (idx !== -1) {
				this.#sockets.splice(idx, 1);
			}
			this.#currentSocket = null;
		}
	}

	/**
	 * Setup a recurring ping for the current socket.
	 * @param {function} callback
	 */
	static setPing(callback) {
		if (this.#currentSocket) {
			if (this.#currentSocket.ping) {
				clearInterval(this.#currentSocket.ping);
			}
			this.#currentSocket.ping = setInterval(callback, 10000);

			// Keep only the active socket
			this.#sockets = this.#sockets.filter(s => s === this.#currentSocket || (s.close(), false));
		}
	}

	/**
	 * Set a custom socket factory.
	 * @param {function|null} factory
	 */
	static setSocketFactory(factory) {
		this.#socketFactory = factory;
	}

	/**
	 * Utility: Convert long value to IP string.
	 * @param {number} long
	 * @returns {string}
	 */
	static longToIP(long) {
		const buf = new Uint8Array(new Uint32Array([long]).buffer);
		return Array.prototype.join.call(buf, '.');
	}

	/**
	 * Utility: Convert ArrayBuffer to Hex string.
	 * @param {ArrayBuffer|Uint8Array} buffer
	 * @returns {string}
	 */
	static utilsBufferToHexString(buffer) {
		const view = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
		return [...view].map(x => x.toString(16).padStart(2, '0') + ' ').join('');
	}

	/**
	 * Legacy support: provide 'utils' namespace for older modules.
	 * @returns {object}
	 */
	static get utils() {
		return {
			longToIP: this.longToIP,
			bufferToHexString: this.utilsBufferToHexString
		};
	}
}

// Global initialization
NetworkManager.init();

export default NetworkManager;
