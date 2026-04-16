// applications/electron/preload.mjs
import { contextBridge } from 'electron';
import fs from 'node:fs';
import net from 'node:net';
import { Buffer } from 'node:buffer';

contextBridge.exposeInMainWorld('electronAPI', {
	isElectron: true,

	// ─── TCP Socket ─────────────────────────────────────────
	createSocket(host, port) {
		const socket = net.connect(port, host);

		return {
			onConnect(cb) {
				socket.on('connect', cb);
			},
			onError(cb) {
				socket.on('error', cb);
			},
			onData(cb) {
				socket.on('data', buf => cb(new Uint8Array(buf)));
			},
			onClose(cb) {
				socket.on('close', cb);
			},
			write(arrayBuffer) {
				socket.write(new Uint8Array(arrayBuffer));
			},
			end() {
				socket.end();
			},
			destroy() {
				socket.destroy();
			}
		};
	},

	// ─── Filesystem (síncrono) ──────────────────────────────
	readFileSync(filePath) {
		return fs.readFileSync(filePath);
	},

	existsSync(filePath) {
		return fs.existsSync(filePath);
	},

	statSync(filePath) {
		const stat = fs.statSync(filePath);
		return { size: stat.size };
	},

	openSync(filePath, flags) {
		if (flags !== 'r') {
			throw new Error('openSync: only read mode is allowed');
		}
		return fs.openSync(filePath, flags);
	},

	readSync(fd, length, position) {
		const buf = Buffer.alloc(length);
		fs.readSync(fd, buf, 0, length, position);
		return buf;
	}
});
