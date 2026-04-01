/**
 * Loaders/Action.js
 *
 * Loaders for Gravity .act file (Action)
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import BinaryReader, { SEEK_CUR } from 'Utils/BinaryReader.js';

/**
 * @class ACT
 * @description Loader for Gravity .act files (Action animations)
 */
class ACT {
	/**
	 * @constructor
	 * @param {ArrayBuffer} [data]
	 */
	constructor(data) {
		this.fp = null;
		this.version = 0.0;
		this.actions = [];
		this.sounds = [];

		if (data) {
			this.load(data);
		}
	}

	/**
	 * Parse an ACT file
	 * @param {ArrayBuffer} data
	 */
	load(data) {
		this.fp = new BinaryReader(data);
		this.header = this.fp.readBinaryString(2);

		if (this.header !== 'AC') {
			throw new Error(`ACT::load() - Incorrect header "${this.header}", must be "AC"`);
		}

		this.version = this.fp.readUByte() / 10 + this.fp.readUByte();
		this.readActions();

		if (this.version >= 2.1) {
			const count = this.fp.readLong();
			this.sounds = new Array(count);

			for (let i = 0; i < count; ++i) {
				this.sounds[i] = this.fp.readBinaryString(40);
			}

			if (this.version >= 2.2) {
				this.actions.forEach(action => {
					action.delay = this.fp.readFloat() * 25;
				});
			}
		}
	}

	/**
	 * Load Action part of ACT file
	 */
	readActions() {
		const count = this.fp.readUShort();
		this.fp.seek(10, SEEK_CUR); // Unknown bytes

		this.actions = new Array(count);
		for (let i = 0; i < count; ++i) {
			this.actions[i] = {
				animations: this.readAnimations(),
				delay: 150
			};
		}
	}

	/**
	 * Load Animation part in ACT file
	 * @returns {object[]} animations
	 */
	readAnimations() {
		const count = this.fp.readULong();
		const anim = new Array(count);

		for (let i = 0; i < count; ++i) {
			this.fp.seek(32, SEEK_CUR); // Unknown bytes
			anim[i] = this.readLayers();
		}

		return anim;
	}

	/**
	 * Load ACT Layers
	 * @returns {object} animation data
	 */
	readLayers() {
		const count = this.fp.readULong();
		const layers = new Array(count);
		const { version } = this;

		for (let i = 0; i < count; ++i) {
			const layer = {
				pos: [this.fp.readLong(), this.fp.readLong()],
				index: this.fp.readLong(),
				is_mirror: this.fp.readLong(),
				scale: [1.0, 1.0],
				color: [1.0, 1.0, 1.0, 1.0],
				angle: 0,
				spr_type: 0,
				width: 0,
				height: 0
			};

			if (version >= 2.0) {
				layer.color[0] = this.fp.readUByte() / 255;
				layer.color[1] = this.fp.readUByte() / 255;
				layer.color[2] = this.fp.readUByte() / 255;
				layer.color[3] = this.fp.readUByte() / 255;
				layer.scale[0] = this.fp.readFloat();
				layer.scale[1] = version <= 2.3 ? layer.scale[0] : this.fp.readFloat();
				layer.angle = this.fp.readLong();
				layer.spr_type = this.fp.readLong();

				if (version >= 2.5) {
					layer.width = this.fp.readLong();
					layer.height = this.fp.readLong();
				}
			}
			layers[i] = layer;
		}

		const sound = version >= 2.0 ? this.fp.readLong() : -1;
		let pos = [];

		if (version >= 2.3) {
			const posCount = this.fp.readLong();
			pos = new Array(posCount);

			for (let i = 0; i < posCount; ++i) {
				this.fp.seek(4, SEEK_CUR); // Unknown
				pos[i] = { x: this.fp.readLong(), y: this.fp.readLong() };
				this.fp.seek(4, SEEK_CUR); // Unknown
			}
		}

		return {
			layers,
			sound,
			pos
		};
	}

	/**
	 * Make it transferable in worker context
	 * @returns {object} compiled data
	 */
	compile() {
		return {
			actions: this.actions,
			sounds: this.sounds
		};
	}
}

export default ACT;
