/**
 * Loaders/Ground.js
 *
 * Loaders for Gravity .gnd file (Ground)
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import BinaryReader, { SEEK_CUR } from 'Utils/BinaryReader.js';
import glMatrix from 'Utils/gl-matrix.js';

const { vec3, vec4 } = glMatrix;

/**
 * @class GND
 * @description Loader for Gravity .gnd files (Ground mesh).
 */
class GND {
	/**
	 * @constructor
	 * @param {ArrayBuffer} [data]
	 */
	constructor(data) {
		this.fp = null;
		this.version = 0.0;
		this.width = 0;
		this.height = 0;
		this.zoom = 1.0;
		this.textures = [];
		this.textureIndexes = [];
		this.lightmap = null;
		this.tiles = [];
		this.surfaces = [];
		this.water = null;

		if (data) {
			this.load(data);
		}
	}

	/**
	 * Load file
	 * @param {ArrayBuffer} data
	 */
	load(data) {
		this.fp = new BinaryReader(data);
		const header = this.fp.readBinaryString(4);

		if (header !== 'GRGN') {
			throw new Error(`GND::load() - Invalid header "${header}"`);
		}

		this.version = this.fp.readUByte() + this.fp.readUByte() / 10;
		this.width = this.fp.readULong();
		this.height = this.fp.readULong();
		this.zoom = this.fp.readFloat();

		this.parseTextures();
		this.parseLightmaps();

		this.tiles = this.parseTiles();
		this.surfaces = this.parseSurfaces();

		// Read water-related parameters
		if (this.version >= 1.8) {
			this.water = {
				level: this.fp.readFloat() / 5,
				type: this.fp.readLong(),
				waveHeight: this.fp.readFloat() / 5,
				waveSpeed: this.fp.readFloat(),
				wavePitch: this.fp.readFloat(),
				animSpeed: this.fp.readLong(),
				splitWidth: this.fp.readLong(),
				splitHeight: this.fp.readLong(),
				Zones: []
			};
			if (this.version >= 1.9) {
				const count = this.water.splitWidth * this.water.splitHeight;
				for (let i = 0; i < count; i++) {
					this.water.Zones.push({
						level: this.fp.readFloat(),
						type: this.fp.readLong(),
						waveHeight: this.fp.readFloat(),
						waveSpeed: this.fp.readFloat(),
						wavePitch: this.fp.readFloat(),
						animSpeed: this.fp.readLong()
					});
				}
			}
		}
	}

	/**
	 * Loading textures
	 */
	parseTextures() {
		const count = this.fp.readULong();
		const length = this.fp.readULong();
		const indexes = new Array(count);
		const textures = [];

		for (let i = 0; i < count; ++i) {
			const texture = this.fp.readBinaryString(length);
			let pos = textures.indexOf(texture);

			if (pos === -1) {
				pos = textures.length;
				textures.push(texture);
			}

			indexes[i] = pos;
		}

		this.textures = textures;
		this.textureIndexes = indexes;
	}

	/**
	 * Parse Lightmap
	 */
	parseLightmaps() {
		const fp = this.fp;
		const count = fp.readLong();
		const per_cell_x = fp.readLong();
		const per_cell_y = fp.readLong();
		const size_cell = fp.readLong();
		const per_cell = per_cell_x * per_cell_y * size_cell;

		this.lightmap = {
			per_cell,
			count,
			data: new Uint8Array(fp.buffer, fp.offset, count * per_cell * 4)
		};

		fp.seek(count * per_cell * 4, SEEK_CUR);
	}

	/**
	 * Parse Tiles
	 * @returns {object[]} tiles
	 */
	parseTiles() {
		const fp = this.fp;
		const count = fp.readULong();
		const tiles = new Array(count);

		// Texture atlas constants
		const texLen = this.textures.length;
		const ATLAS_COLS = Math.round(Math.sqrt(texLen));
		const ATLAS_ROWS = Math.ceil(Math.sqrt(texLen));
		const ATLAS_WIDTH = Math.pow(2, Math.ceil(Math.log(ATLAS_COLS * 258) / Math.log(2)));
		const ATLAS_HEIGHT = Math.pow(2, Math.ceil(Math.log(ATLAS_ROWS * 258) / Math.log(2)));
		const ATLAS_FACTOR_U = (ATLAS_COLS * 258) / ATLAS_WIDTH;
		const ATLAS_FACTOR_V = (ATLAS_ROWS * 258) / ATLAS_HEIGHT;
		const ATLAS_PX_U = 1 / 258;
		const ATLAS_PX_V = 1 / 258;

		const atlasGenerate = (tile) => {
			const u = tile.texture % ATLAS_COLS;
			const v = Math.floor(tile.texture / ATLAS_COLS);
			tile.u1 = ((u + tile.u1 * (1 - ATLAS_PX_U * 2) + ATLAS_PX_U) * ATLAS_FACTOR_U) / ATLAS_COLS;
			tile.u2 = ((u + tile.u2 * (1 - ATLAS_PX_U * 2) + ATLAS_PX_U) * ATLAS_FACTOR_U) / ATLAS_COLS;
			tile.u3 = ((u + tile.u3 * (1 - ATLAS_PX_U * 2) + ATLAS_PX_U) * ATLAS_FACTOR_U) / ATLAS_COLS;
			tile.u4 = ((u + tile.u4 * (1 - ATLAS_PX_U * 2) + ATLAS_PX_U) * ATLAS_FACTOR_U) / ATLAS_COLS;
			tile.v1 = ((v + tile.v1 * (1 - ATLAS_PX_V * 2) + ATLAS_PX_V) * ATLAS_FACTOR_V) / ATLAS_ROWS;
			tile.v2 = ((v + tile.v2 * (1 - ATLAS_PX_V * 2) + ATLAS_PX_V) * ATLAS_FACTOR_V) / ATLAS_ROWS;
			tile.v3 = ((v + tile.v3 * (1 - ATLAS_PX_V * 2) + ATLAS_PX_V) * ATLAS_FACTOR_V) / ATLAS_ROWS;
			tile.v4 = ((v + tile.v4 * (1 - ATLAS_PX_V * 2) + ATLAS_PX_V) * ATLAS_FACTOR_V) / ATLAS_ROWS;
		};

		for (let i = 0; i < count; ++i) {
			const tile = {
				u1: fp.readFloat(),
				u2: fp.readFloat(),
				u3: fp.readFloat(),
				u4: fp.readFloat(),
				v1: fp.readFloat(),
				v2: fp.readFloat(),
				v3: fp.readFloat(),
				v4: fp.readFloat(),
				texture: fp.readUShort(),
				light: fp.readUShort(),
				color: [fp.readUByte(), fp.readUByte(), fp.readUByte(), fp.readUByte()]
			};

			tile.texture = this.textureIndexes[tile.texture];
			atlasGenerate(tile);
			tiles[i] = tile;
		}

		return tiles;
	}

	/**
	 * Parse GND surfaces
	 * @returns {object[]} surfaces
	 */
	parseSurfaces() {
		const fp = this.fp;
		const count = this.width * this.height;
		const surfaces = new Array(count);

		for (let i = 0; i < count; ++i) {
			surfaces[i] = {
				height: [fp.readFloat() / 5, fp.readFloat() / 5, fp.readFloat() / 5, fp.readFloat() / 5],
				tile_up: fp.readLong(),
				tile_front: fp.readLong(),
				tile_right: fp.readLong()
			};
		}

		return surfaces;
	}

	/**
	 * Create a large image_data array with all lightmaps
	 * @returns {Uint8Array} pixels
	 */
	createLightmapImage() {
		const { lightmap } = this;
		const { count, data, per_cell } = lightmap;

		const width = Math.round(Math.sqrt(count));
		const height = Math.ceil(Math.sqrt(count));
		const _width = Math.pow(2, Math.ceil(Math.log(width * 8) / Math.log(2)));
		const _height = Math.pow(2, Math.ceil(Math.log(height * 8) / Math.log(2)));

		const out = new Uint8Array(_width * _height * 4);

		for (let i = 0; i < count; ++i) {
			const pos = i * 4 * per_cell;
			const x = (i % width) * 8;
			const y = Math.floor(i / width) * 8;

			for (let _x = 0; _x < 8; ++_x) {
				for (let _y = 0; _y < 8; ++_y) {
					const idx = (x + _x + (y + _y) * _width) * 4;
					out[idx + 0] = data[pos + per_cell + (_x + _y * 8) * 3 + 0];
					out[idx + 1] = data[pos + per_cell + (_x + _y * 8) * 3 + 1];
					out[idx + 2] = data[pos + per_cell + (_x + _y * 8) * 3 + 2];
					out[idx + 3] = data[pos + (_x + _y * 8)];
				}
			}
		}

		return out;
	}

	/**
	 * Create a large image_data array with all tiles color
	 * @returns {Uint8Array} pixels
	 */
	createTilesColorImage() {
		const { width, height, surfaces, tiles } = this;
		const data = new Uint8Array(width * height * 4);

		for (let y = 0; y < height; ++y) {
			for (let x = 0; x < width; ++x) {
				const cell = surfaces[x + y * width];
				if (cell.tile_up > -1) {
					const [b, g, r, a] = tiles[cell.tile_up].color;
					data.set([r, g, b, a], (x + y * width) * 4);
				}
			}
		}

		return data;
	}

	/**
	 * Create ShadowMap data
	 * @returns {Uint8Array} data
	 */
	createShadowmapData() {
		const { width, height, lightmap, tiles, surfaces } = this;
		const { data, per_cell } = lightmap;
		const out = new Uint8Array(width * 8 * (height * 8));

		for (let y = 0; y < height; ++y) {
			for (let x = 0; x < width; ++x) {
				const cell = surfaces[x + y * width];
				if (cell.tile_up > -1) {
					const index = tiles[cell.tile_up].light * 4 * per_cell;
					for (let i = 0; i < 8; ++i) {
						for (let j = 0; j < 8; ++j) {
							out[x * 8 + i + (y * 8 + j) * (width * 8)] = data[index + i + j * 8];
						}
					}
				} else {
					for (let i = 0; i < 8; ++i) {
						for (let j = 0; j < 8; ++j) {
							out[x * 8 + i + (y * 8 + j) * (width * 8)] = 255;
						}
					}
				}
			}
		}

		return out;
	}

	/**
	 * Smooth ground normals
	 * @returns {Array[]} normals
	 */
	getSmoothNormal() {
		const { surfaces, width, height } = this;
		const a = vec3.create();
		const b = vec3.create();
		const c = vec3.create();
		const d = vec3.create();
		const empty_vec = vec3.create();

		const count = width * height;
		const tmp = new Array(count);
		const normals = new Array(count);

		for (let y = 0; y < height; ++y) {
			for (let x = 0; x < width; ++x) {
				const idx = x + y * width;
				const cell = surfaces[idx];
				tmp[idx] = vec3.create();

				if (cell.tile_up > -1) {
					vec3.set(a, (x + 0) * 2, cell.height[0], (y + 0) * 2);
					vec3.set(b, (x + 1) * 2, cell.height[1], (y + 0) * 2);
					vec3.set(c, (x + 1) * 2, cell.height[3], (y + 1) * 2);
					vec3.set(d, (x + 0) * 2, cell.height[2], (y + 1) * 2);

					vec4.calcNormal(a, b, c, d, tmp[idx]);
				}
			}
		}

		for (let y = 0; y < height; ++y) {
			for (let x = 0; x < width; ++x) {
				const n = normals[x + y * width] = [
					[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]
				];

				const getTmp = (tx, ty) => {
					if (tx < 0 || tx >= width || ty < 0 || ty >= height) {
						return empty_vec;
					}
					return tmp[tx + ty * width];
				};

				// Smooth for each vertex of the cell
				// TL
				vec3.add(n[0], n[0], tmp[x + y * width]);
				vec3.add(n[0], n[0], getTmp(x - 1, y));
				vec3.add(n[0], n[0], getTmp(x - 1, y - 1));
				vec3.add(n[0], n[0], getTmp(x, y - 1));
				vec3.normalize(n[0], n[0]);
				// TR
				vec3.add(n[1], n[1], tmp[x + y * width]);
				vec3.add(n[1], n[1], getTmp(x + 1, y));
				vec3.add(n[1], n[1], getTmp(x + 1, y - 1));
				vec3.add(n[1], n[1], getTmp(x, y - 1));
				vec3.normalize(n[1], n[1]);
				// BR
				vec3.add(n[2], n[2], tmp[x + y * width]);
				vec3.add(n[2], n[2], getTmp(x + 1, y));
				vec3.add(n[2], n[2], getTmp(x + 1, y + 1));
				vec3.add(n[2], n[2], getTmp(x, y + 1));
				vec3.normalize(n[2], n[2]);
				// BL
				vec3.add(n[3], n[3], tmp[x + y * width]);
				vec3.add(n[3], n[3], getTmp(x - 1, y));
				vec3.add(n[3], n[3], getTmp(x - 1, y + 1));
				vec3.add(n[3], n[3], getTmp(x, y + 1));
				vec3.normalize(n[3], n[3]);
			}
		}

		return normals;
	}

	/**
	 * Compile GND file
	 * @param {number} WATER_LEVEL
	 * @param {number} WATER_HEIGHT
	 * @returns {object} export
	 */
	compile(WATER_LEVEL, WATER_HEIGHT) {
		const { width, height, surfaces, tiles, lightmap: lmInfo } = this;
		const normals = this.getSmoothNormal();

		const water = [];
		const mesh = [];

		const lightmap = this.createLightmapImage();
		const l_count_w = Math.round(Math.sqrt(lmInfo.count));
		const l_count_h = Math.ceil(Math.sqrt(lmInfo.count));
		const l_width = Math.pow(2, Math.ceil(Math.log(l_count_w * 8) / Math.log(2)));
		const l_height = Math.pow(2, Math.ceil(Math.log(l_count_h * 8) / Math.log(2)));

		const lCoords = { u1: 0, u2: 0, v1: 0, v2: 0 };
		const updateLightCoords = (i) => {
			lCoords.u1 = (((i % l_count_w) + 0.125) / l_count_w) * ((l_count_w * 8) / l_width);
			lCoords.u2 = (((i % l_count_w) + 0.875) / l_count_w) * ((l_count_w * 8) / l_width);
			lCoords.v1 = ((((i / l_count_w) | 0) + 0.125) / l_count_h) * ((l_count_h * 8) / l_height);
			lCoords.v2 = ((((i / l_count_w) | 0) + 0.875) / l_count_h) * ((l_count_h * 8) / l_height);
		};

		for (let y = 0; y < height; ++y) {
			for (let x = 0; x < width; ++x) {
				const cell_a = surfaces[x + y * width];
				const h = cell_a.height;

				// Up Tile
				if (cell_a.tile_up > -1) {
					const tile = tiles[cell_a.tile_up];
					const n = normals[x + y * width];
					updateLightCoords(tile.light);

					mesh.push(
						(x + 0) * 2, h[0], (y + 0) * 2, n[0][0], n[0][1], n[0][2], tile.u1, tile.v1, lCoords.u1, lCoords.v1, (x + 0.5) / width, (y + 0.5) / height,
						(x + 1) * 2, h[1], (y + 0) * 2, n[1][0], n[1][1], n[1][2], tile.u2, tile.v2, lCoords.u2, lCoords.v1, (x + 1.5) / width, (y + 0.5) / height,
						(x + 1) * 2, h[3], (y + 1) * 2, n[2][0], n[2][1], n[2][2], tile.u4, tile.v4, lCoords.u2, lCoords.v2, (x + 1.5) / width, (y + 1.5) / height,
						(x + 1) * 2, h[3], (y + 1) * 2, n[2][0], n[2][1], n[2][2], tile.u4, tile.v4, lCoords.u2, lCoords.v2, (x + 1.5) / width, (y + 1.5) / height,
						(x + 0) * 2, h[2], (y + 1) * 2, n[3][0], n[3][1], n[3][2], tile.u3, tile.v3, lCoords.u1, lCoords.v2, (x + 0.5) / width, (y + 1.5) / height,
						(x + 0) * 2, h[0], (y + 0) * 2, n[0][0], n[0][1], n[0][2], tile.u1, tile.v1, lCoords.u1, lCoords.v1, (x + 0.5) / width, (y + 0.5) / height
					);

					if (h[0] > WATER_LEVEL - WATER_HEIGHT || h[1] > WATER_LEVEL - WATER_HEIGHT || h[2] > WATER_LEVEL - WATER_HEIGHT || h[3] > WATER_LEVEL - WATER_HEIGHT) {
						water.push(
							(x + 0) * 2, WATER_LEVEL, (y + 0) * 2, ((x + 0) % 5) / 5, ((y + 0) % 5) / 5,
							(x + 1) * 2, WATER_LEVEL, (y + 0) * 2, ((x + 1) % 5) / 5 || 1, ((y + 0) % 5) / 5,
							(x + 1) * 2, WATER_LEVEL, (y + 1) * 2, ((x + 1) % 5) / 5 || 1, ((y + 1) % 5) / 5 || 1,
							(x + 1) * 2, WATER_LEVEL, (y + 1) * 2, ((x + 1) % 5) / 5 || 1, ((y + 1) % 5) / 5 || 1,
							(x + 0) * 2, WATER_LEVEL, (y + 1) * 2, ((x + 0) % 5) / 5, ((y + 1) % 5) / 5 || 1,
							(x + 0) * 2, WATER_LEVEL, (y + 0) * 2, ((x + 0) % 5) / 5, ((y + 0) % 5) / 5
						);
					}
				}

				// Front Tile
				if (cell_a.tile_front > -1 && y + 1 < height) {
					const tile = tiles[cell_a.tile_front];
					const cell_b = surfaces[x + (y + 1) * width];
					updateLightCoords(tile.light);
					mesh.push(
						(x + 0) * 2, cell_b.height[0], (y + 1) * 2, 0, 0, 1, tile.u3, tile.v3, lCoords.u1, lCoords.v2, 0, 0,
						(x + 1) * 2, h[3], (y + 1) * 2, 0, 0, 1, tile.u2, tile.v2, lCoords.u2, lCoords.v1, 0, 0,
						(x + 1) * 2, cell_b.height[1], (y + 1) * 2, 0, 0, 1, tile.u4, tile.v4, lCoords.u2, lCoords.v2, 0, 0,
						(x + 0) * 2, cell_b.height[0], (y + 1) * 2, 0, 0, 1, tile.u3, tile.v3, lCoords.u1, lCoords.v2, 0, 0,
						(x + 1) * 2, h[3], (y + 1) * 2, 0, 0, 1, tile.u2, tile.v2, lCoords.u2, lCoords.v1, 0, 0,
						(x + 0) * 2, h[2], (y + 1) * 2, 0, 0, 1, tile.u1, tile.v1, lCoords.u1, lCoords.v1, 0, 0
					);
				}

				// Right Tile
				if (cell_a.tile_right > -1 && x + 1 < width) {
					const tile = tiles[cell_a.tile_right];
					const cell_b = surfaces[x + 1 + y * width];
					updateLightCoords(tile.light);
					mesh.push(
						(x + 1) * 2, h[1], (y + 0) * 2, 1, 0, 0, tile.u2, tile.v2, lCoords.u2, lCoords.v1, 0, 0,
						(x + 1) * 2, h[3], (y + 1) * 2, 1, 0, 0, tile.u1, tile.v1, lCoords.u1, lCoords.v1, 0, 0,
						(x + 1) * 2, cell_b.height[0], (y + 0) * 2, 1, 0, 0, tile.u4, tile.v4, lCoords.u2, lCoords.v2, 0, 0,
						(x + 1) * 2, cell_b.height[0], (y + 0) * 2, 1, 0, 0, tile.u4, tile.v4, lCoords.u2, lCoords.v2, 0, 0,
						(x + 1) * 2, cell_b.height[2], (y + 1) * 2, 1, 0, 0, tile.u3, tile.v3, lCoords.u1, lCoords.v2, 0, 0,
						(x + 1) * 2, h[3], (y + 1) * 2, 1, 0, 0, tile.u1, tile.v1, lCoords.u1, lCoords.v1, 0, 0
					);
				}
			}
		}

		return {
			width, height,
			textures: this.textures,
			lightmap,
			lightmapSize: lmInfo.count,
			tileColor: this.createTilesColorImage(),
			shadowMap: this.createShadowmapData(),
			mesh: new Float32Array(mesh),
			meshVertCount: mesh.length / 12,
			waterMesh: new Float32Array(water),
			waterVertCount: water.length / 5
		};
	}
}

export default GND;
