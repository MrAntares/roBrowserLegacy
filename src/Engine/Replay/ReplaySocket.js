/**
 * Engine/Replay/ReplaySocket.js
 *
 * Mock socket for feeding RRF packets into NetworkManager
 */

export default class ReplaySocket {
	constructor(host, port) {
		this.host = host;
		this.port = port;
		this.connected = false;

		// The NetworkManager binds to these
		this.onMessage = null;
		this.onClose = null;
		this.onError = null;
		this.onComplete = null; // Called when connected

		// Simulate async connection
		setTimeout(() => {
			this.connected = true;
			if (this.onComplete) {
				this.onComplete(true);
			}
		}, 10);
	}

	send(buffer) {
		// In a real socket, this sends data to the server.
		// In a replay, we just ignore outgoing packets.
		// The ReplayPlayer will handle the replay flow.
	}

	close() {
		this.connected = false;
		if (this.onClose) {
			this.onClose();
		}
	}

	/**
	 * Feed data into NetworkManager
	 * @param {Uint8Array} data
	 */
	push(data) {
		if (this.connected && this.onMessage) {
			this.onMessage(data.slice().buffer);
		}
	}
}
