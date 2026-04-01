/**
 * Core/MemoryManager.js
 *
 * Memory Manager
 *
 * Set up a cache context to avoid re-loading/parsing files each time, files are removed automatically if not used
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import MemoryItem from 'Core/MemoryItem.js';

/**
 * @class MemoryManager
 * @description Manages in-memory cache for game assets, handling automatic cleanup and WebGL resource deallocation.
 */
class MemoryManager {
	static #memory = {};
	static #rememberTime = 30 * 1000; // 30s
	static #lastCheckTick = 0;
	static #cleanUpInterval = 10 * 1000;

	// Async cleanup state tracking
	static #cleaningInProgress = false;
	static #cleanIndex = 0;
	static #filesToClean = [];

	/**
	 * Get back data from memory
	 *
	 * @param {string} filename
	 * @param {Function} [onload]
	 * @param {Function} [onerror]
	 * @returns {*} data
	 */
	static get(filename, onload, onerror) {
		// Not in memory yet, create slot
		if (!this.#memory[filename]) {
			this.#memory[filename] = new MemoryItem();
		}

		const item = this.#memory[filename];

		if (onload) {
			item.addEventListener('load', onload);
		}

		if (onerror) {
			item.addEventListener('error', onerror);
		}

		return item.data;
	}

	/**
	 * Check if the entry exists
	 *
	 * @param {string} filename
	 * @returns {boolean}
	 */
	static exist(filename) {
		return !!this.#memory[filename];
	}

	/**
	 * Stored data in memory
	 *
	 * @param {string} filename
	 * @param {string|object} data
	 * @param {string} [error]
	 */
	static set(filename, data, error) {
		// Not in memory yet, create slot
		if (!this.#memory[filename]) {
			this.#memory[filename] = new MemoryItem();
		}

		if (error || !data) {
			this.#memory[filename].onerror(error);
		} else {
			this.#memory[filename].onload(data);
		}
	}

	/**
	 * Clean up not used data from memory
	 *
	 * @param {WebGLRenderingContext} gl
	 * @param {number} now - game tick
	 */
	static clean(gl, now) {
		// Skip cleanup if interval has not elapsed or if an async cleanup is already running
		if (this.#lastCheckTick + this.#cleanUpInterval > now || this.#cleaningInProgress) {
			return;
		}

		this.#filesToClean = [];
		const keys = Object.keys(this.#memory);
		const tick = now - this.#rememberTime;

		keys.forEach(key => {
			const item = this.#memory[key];
			if (item.complete && item.lastTimeUsed < tick) {
				this.#filesToClean.push(key);
			}
		});

		// If nothing needs to be cleaned, just update the last check timestamp
		if (this.#filesToClean.length === 0) {
			this.#lastCheckTick = now;
			return;
		}

		// Mark cleanup as running to avoid re-entry
		this.#cleaningInProgress = true;
		this.#cleanIndex = 0;
		const filesRemoved = [];

		// Perform cleanup incrementally during idle time to reduce frame drops
		const cleanChunk = (deadline) => {
			let processed = 0;
			const maxProcess = Math.min(5, this.#filesToClean.length - this.#cleanIndex);

			while (this.#cleanIndex < this.#filesToClean.length && processed < maxProcess && deadline.timeRemaining() > 0) {
				const filename = this.#filesToClean[this.#cleanIndex];
				this.remove(gl, filename);
				filesRemoved.push(filename);
				this.#cleanIndex++;
				processed++;
			}

			if (this.#cleanIndex < this.#filesToClean.length) {
				requestIdleCallback(cleanChunk);
			} else {
				this.#cleaningInProgress = false;
				this.#lastCheckTick = now;
				this.#filesToClean = [];

				if (filesRemoved.length) {
					console.log(
						`%c[MemoryManager] - Removed ${filesRemoved.length} unused elements from memory.`,
						'color:#d35111',
						{ files: filesRemoved }
					);
				}
			}
		};

		requestIdleCallback(cleanChunk);
	}

	/**
	 * Remove Item from memory
	 *
	 * @param {WebGLRenderingContext} gl
	 * @param {string} filename
	 */
	static remove(gl, filename) {
		if (!filename || !this.#memory[filename]) {
			return;
		}

		const file = this.get(filename);
		const matches = filename.match(/\.[^.]+$/);
		const ext = matches ? matches[0].toLowerCase() : '';

		if (file) {
			switch (ext) {
				case '.spr':
					if (file.frames) {
						file.frames.forEach(frame => {
							if (frame.texture && gl?.isTexture(frame.texture)) {
								gl.deleteTexture(frame.texture);
							}
						});
					}
					if (file.texture && gl?.isTexture(file.texture)) {
						gl.deleteTexture(file.texture);
					}
					break;

				case '.pal':
					if (file.texture && gl?.isTexture(file.texture)) {
						gl.deleteTexture(file.texture);
					}
					break;

				default:
					if (typeof file === 'string' && file.startsWith('blob:')) {
						URL.revokeObjectURL(file);
					}
					break;
			}
		}

		delete this.#memory[filename];
	}

	/**
	 * Search files in memory based on a regex
	 *
	 * @param {RegExp|string} regex
	 * @returns {string[]} filename
	 */
	static search(regex) {
		return Object.keys(this.#memory).filter(k => k.match(regex));
	}
}

export default MemoryManager;
