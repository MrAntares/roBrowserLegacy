/**
 * Loaders/Str.js
 *
 * Loaders for Gravity .str file (effects file)
 * It's basically a .ezv file compiled to binary (except ezv file are version 0x95, str are 0x94).
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import BinaryReader, { SEEK_CUR } from 'Utils/BinaryReader.js';

/**
 * @class STRAnimation
 * @description Frame structure for STR effects
 */
class STRAnimation {
	/**
	 * @constructor
	 * @param {BinaryReader} fp
	 */
	constructor(fp) {
		this.frame = fp.readLong();
		this.type = fp.readULong();
		this.pos = new Float32Array([fp.readFloat(), fp.readFloat()]);
		this.uv = new Float32Array([
			fp.readFloat(),
			fp.readFloat(),
			fp.readFloat(),
			fp.readFloat(),
			fp.readFloat(),
			fp.readFloat(),
			fp.readFloat(),
			fp.readFloat()
		]);
		this.xy = new Float32Array([
			fp.readFloat(),
			fp.readFloat(),
			fp.readFloat(),
			fp.readFloat(),
			fp.readFloat(),
			fp.readFloat(),
			fp.readFloat(),
			fp.readFloat()
		]);
		this.aniframe = fp.readFloat();
		this.anitype = fp.readULong();
		this.delay = fp.readFloat();
		this.angle = fp.readFloat() / (1024 / 360);
		this.color = new Float32Array([
			fp.readFloat() / 255.0,
			fp.readFloat() / 255.0,
			fp.readFloat() / 255.0,
			fp.readFloat() / 255.0
		]);
		this.srcalpha = fp.readULong();
		this.destalpha = fp.readULong();
		this.mtpreset = fp.readULong();
	}
}

/**
 * @class STRLayer
 * @description Layer structure for STR effects
 */
class STRLayer {
	/**
	 * @constructor
	 * @param {BinaryReader} fp
	 * @param {string} texturePath
	 */
	constructor(fp, texturePath) {
		const texcnt = fp.readLong();
		this.texname = new Array(texcnt);

		for (let i = 0; i < texcnt; ++i) {
			this.texname[i] = `data\\texture\\effect\\${texturePath}${fp.readBinaryString(128)}`;
		}

		const anikeynum = fp.readLong();
		this.animations = new Array(anikeynum);

		for (let i = 0; i < anikeynum; ++i) {
			this.animations[i] = new STRAnimation(fp);
		}
	}
}

/**
 * @class STR
 * @description Loader for Gravity .str files (visual effects)
 */
class STR {
	/**
	 * @constructor
	 * @param {ArrayBuffer} [data]
	 * @param {string} [texturePath='']
	 */
	constructor(data, texturePath = '') {
		this.version = 0.0;
		this.texturePath = texturePath;
		this.header = '';
		this.fps = 0;
		this.maxKey = 0;
		this.layernum = 0;
		this.layers = [];

		if (data) {
			this.load(data);
		}
	}

	/**
	 * Parse a STR file
	 * @param {ArrayBuffer} data
	 */
	load(data) {
		const fp = new BinaryReader(data);
		this.header = fp.readBinaryString(4);

		if (this.header !== 'STRM') {
			throw new Error(`STR::load() - Incorrect header "${this.header}", must be "STRM"`);
		}

		this.version = fp.readULong();

		if (this.version !== 0x94) {
			throw new Error(`STR - Invalid version "0x${this.version.toString(16)}", not supported`);
		}

		this.fps = fp.readULong();
		this.maxKey = fp.readULong();
		this.layernum = fp.readULong();
		fp.seek(16, SEEK_CUR); // display, group, type, ... ?

		this.layers = new Array(this.layernum);
		for (let i = 0; i < this.layernum; ++i) {
			this.layers[i] = new STRLayer(fp, this.texturePath);
		}
	}
}

export default STR;
