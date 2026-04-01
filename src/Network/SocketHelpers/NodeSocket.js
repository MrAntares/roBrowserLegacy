/**
 * Network/SocketHelpers/NodeSocket.js
 *
 * Use Node net.Socket() to connect to a server.
 * Only used when compiled using node-webkit.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

/**
 * @class Socket
 * @description Node.js TCP Socket wrapper for game server connections.
 */
class Socket {
	#socket = null;
	connected = false;
	onComplete = null;
	onMessage = null;
	onClose = null;

	/**
	 * @return {boolean} is running in node-webkit
	 */
	static isSupported() {
		return !!window.requireNode;
	}

	/**
	 * Initialize NodeSocket connection.
	 * @param {string} host
	 * @param {number} port
	 */
	constructor(host, port) {
		this.#socket = window.requireNode('net').connect(port, host);

		this.#socket.on('connect', () => {
			this.connected = true;
			if (this.onComplete) {
				this.onComplete(true);
			}
		});

		this.#socket.on('error', () => {
			if (!this.connected && this.onComplete) {
				this.onComplete(false);
			}
		});

		this.#socket.on('data', data => {
			if (this.onMessage) {
				this.onMessage(new Uint8Array(data));
			}
		});

		this.#socket.on('close', () => {
			const wasConnected = this.connected;
			this.connected = false;
			this.#socket.destroy();

			if (wasConnected && this.onClose) {
				this.onClose();
			}
		});
	}

	/**
	 * Sending packet to server.
	 * @param {ArrayBuffer} buffer
	 */
	send(buffer) {
		if (this.connected && this.#socket) {
			this.#socket.write(Buffer.from(new Uint8Array(buffer)));
		}
	}

	/**
	 * Closing connection to server.
	 */
	close() {
		if (this.#socket) {
			if (this.connected) {
				this.#socket.end();
				this.#socket.destroy();
			}
			this.connected = false;
		}
	}
}

export default Socket;
