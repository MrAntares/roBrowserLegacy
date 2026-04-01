/**
 * Network/SocketHelpers/WebSocket.js
 *
 * HTML5 WebSocket if the server supports the protocol
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

/**
 * @class Socket
 * @description HTML5 WebSocket System wrapper for game server connections.
 */
class Socket {
	#ws = null;
	connected = false;
	onComplete = null;
	onMessage = null;
	onClose = null;

	/**
	 * Initialize WebSocket connection.
	 * @param {string} host
	 * @param {number} port
	 * @param {string} [proxy]
	 */
	constructor(host, port, proxy) {
		let url = `ws://${host}:${port}/`;

		// Use of a proxy
		if (proxy) {
			url = proxy;

			if (!url.match(/\/$/)) {
				url += '/';
			}

			url += `${host}:${port}`;
		}

		// Open Websocket
		this.#ws = new WebSocket(url);
		this.#ws.binaryType = 'arraybuffer';

		this.#ws.onopen = () => {
			this.connected = true;
			if (this.onComplete) {
				this.onComplete(true);
			}
		};

		this.#ws.onerror = () => {
			if (!this.connected && this.onComplete) {
				this.onComplete(false);
			}
		};

		this.#ws.onmessage = event => {
			if (this.onMessage) {
				this.onMessage(event.data);
			}
		};

		this.#ws.onclose = () => {
			const wasConnected = this.connected;
			this.connected = false;
			this.close();

			if (wasConnected && this.onClose) {
				this.onClose();
			}
		};
	}

	/**
	 * Sending packet to server.
	 * @param {ArrayBuffer} buffer
	 */
	send(buffer) {
		if (this.connected) {
			this.#ws.send(buffer);
		}
	}

	/**
	 * Closing connection to server.
	 */
	close() {
		if (this.#ws) {
			if (this.connected) {
				this.#ws.close();
			}
			this.connected = false;
		}
	}
}

export default Socket;
