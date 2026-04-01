/**
 * Loaders/World.js
 *
 * Loaders for Gravity .rsw file (Resource World)
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import BinaryReader, { SEEK_CUR } from 'Utils/BinaryReader.js';
import glMatrix from 'Utils/gl-matrix.js';

/**
 * @class RSW
 * @description Loader for Gravity .rsw files (Resource World - models, lights, sounds)
 */
class RSW {
	/**
	 * Default water settings
	 */
	static DEFAULT_WATER = {
		level: 0,
		type: 0,
		waveHeight: 0,
		waveSpeed: 0,
		wavePitch: 0,
		animSpeed: 0,
		splitWidth: 0,
		splitHeight: 0,
		images: new Array(32)
	};

	/**
	 * Default light settings
	 */
	static DEFAULT_LIGHT = {
		longitude: 45,
		latitude: 45,
		diffuse: [1.0, 1.0, 1.0],
		ambient: [0.0, 0.0, 0.0],
		opacity: 1.0,
		direction: glMatrix.vec3.create()
	};

	/**
	 * @constructor
	 * @param {ArrayBuffer} [data]
	 */
	constructor(data) {
		this.sounds = [];
		this.lights = [];
		this.effects = [];
		this.models = [];

		this.files = {
			buildnumber: null,
			ini: null,
			gnd: null,
			gat: null,
			src: null
		};

		this.ground = {
			top: -500,
			bottom: 500,
			left: -500,
			right: 500
		};

		this.water = { ...RSW.DEFAULT_WATER };
		this.light = { ...RSW.DEFAULT_LIGHT };

		if (data) {
			this.load(data);
		}
	}

	/**
	 * Start loading RSW file
	 * @param {ArrayBuffer} data
	 */
	load(data) {
		const fp = new BinaryReader(data);
		const header = fp.readBinaryString(4);
		const version = fp.readByte() + fp.readByte() / 10;

		if (header !== 'GRSW') {
			throw new Error(`RSW::load() - Invalid header "${header}", must be "GRSW"`);
		}

		if (version >= 2.5) {
			this.files.buildnumber = fp.readLong();
		}

		if (version >= 2.2) {
			fp.readByte();
		}

		// Read sub files.
		this.files.ini = fp.readBinaryString(40);
		this.files.gnd = fp.readBinaryString(40);
		this.files.gat = fp.readBinaryString(40);

		if (version >= 1.4) {
			this.files.src = fp.readBinaryString(40);
		}

		// Read water info.
		if (version < 2.6) {
			if (version >= 1.3) {
				this.water.level = fp.readFloat() / 5;
			} else {
				this.water.level = 0.0;
			}

			if (version >= 1.8) {
				this.water.type = fp.readLong();
				this.water.waveHeight = fp.readFloat() / 5;
				this.water.waveSpeed = fp.readFloat();
				this.water.wavePitch = fp.readFloat();
			} else {
				this.water.type = 0;
				this.water.waveHeight = 1.0;
				this.water.waveSpeed = 2.0;
				this.water.wavePitch = 50.0;
			}

			if (version >= 1.9) {
				this.water.animSpeed = fp.readLong();
			} else {
				this.water.animSpeed = 3;
			}
		}

		// Read lightmap.
		if (version >= 1.5) {
			this.light.longitude = fp.readLong();
			this.light.latitude = fp.readLong();
			this.light.diffuse = [fp.readFloat(), fp.readFloat(), fp.readFloat()];
			this.light.ambient = [fp.readFloat(), fp.readFloat(), fp.readFloat()];

			if (version >= 1.7) {
				this.light.opacity = fp.readFloat();
			}
		}

		// Read ground
		if (version >= 1.6) {
			this.ground.top = fp.readLong();
			this.ground.bottom = fp.readLong();
			this.ground.left = fp.readLong();
			this.ground.right = fp.readLong();
		}

		if (version >= 2.7) {
			const quadTreeCount = fp.readLong();
			fp.seek(4 * quadTreeCount, SEEK_CUR);
		}

		// Allocate and read objects
		const count = fp.readLong();
		
		for (let i = 0; i < count; ++i) {
			const type = fp.readLong();
			switch (type) {
				case 1: // Model
					this.models.push({
						name: version >= 1.3 ? fp.readBinaryString(40) : null,
						animType: version >= 1.3 ? fp.readLong() : 0,
						animSpeed: version >= 1.3 ? fp.readFloat() : 1.0,
						blockType: version >= 1.3 ? fp.readLong() : 0,
						UnknownByte: version >= 2.6 && this.files.buildnumber >= 186 ? fp.readByte() : 0,
						UnknownByte2: version >= 2.7 ? fp.readLong() : 0,
						filename: fp.readBinaryString(80),
						nodename: fp.readBinaryString(80),
						position: [fp.readFloat() / 5, fp.readFloat() / 5, fp.readFloat() / 5],
						rotation: [fp.readFloat(), fp.readFloat(), fp.readFloat()],
						scale: [fp.readFloat() / 5, fp.readFloat() / 5, fp.readFloat() / 5]
					});
					break;

				case 2: // Light
					this.lights.push({
						name: fp.readBinaryString(80),
						pos: [fp.readFloat() / 5, fp.readFloat() / 5, fp.readFloat() / 5],
						color: [fp.readLong(), fp.readLong(), fp.readLong()],
						range: fp.readFloat()
					});
					break;

				case 3: // Sound
					this.sounds.push({
						name: fp.readBinaryString(80),
						file: fp.readBinaryString(80),
						pos: [fp.readFloat() / 5, fp.readFloat() / 5, fp.readFloat() / 5],
						vol: fp.readFloat(),
						width: fp.readLong(),
						height: fp.readLong(),
						range: fp.readFloat(),
						cycle: version >= 2.0 ? fp.readFloat() : 0.0
					});
					break;

				case 4: // Effect
					this.effects.push({
						name: fp.readBinaryString(80),
						pos: [fp.readFloat() / 5, fp.readFloat() / 5, fp.readFloat() / 5],
						id: fp.readLong(),
						delay: fp.readFloat() * 10,
						param: [fp.readFloat(), fp.readFloat(), fp.readFloat(), fp.readFloat()]
					});
					break;
			}
		}
	}

	/**
	 * Compile RSW file data
	 * @returns {object} compiled data
	 */
	compile() {
		return {
			water: this.water,
			light: this.light,
			sound: this.sounds,
			effect: this.effects,
			models: this.models // Added for completeness, although not in legacy compile()
		};
	}
}

export default RSW;
