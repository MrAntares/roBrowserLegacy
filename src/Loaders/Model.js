/**
 * Loaders/Model.js
 *
 * Loaders for Gravity .rsm file (Resource Model)
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import BinaryReader, { SEEK_CUR } from 'Utils/BinaryReader.js';
import glMatrix from 'Utils/gl-matrix.js';

const { vec3, mat3, mat4 } = glMatrix;

/**
 * @class BoundingBox
 * @description Bounding box for RSM models and nodes.
 */
class BoundingBox {
	constructor() {
		this.max = vec3.fromValues(-Infinity, -Infinity, -Infinity);
		this.min = vec3.fromValues(Infinity, Infinity, Infinity);
		this.offset = vec3.create();
		this.range = vec3.create();
		this.center = vec3.create();
	}
}

/**
 * @class RSMNode
 * @description Represents a mesh node within an RSM model.
 */
class RSMNode {
	/**
	 * @constructor
	 * @param {RSM} rsm - Parent model
	 * @param {BinaryReader} fp - File pointer
	 * @param {boolean} only - Is it the only node
	 */
	constructor(rsm, fp, only) {
		const { version } = rsm;
		this.main = rsm;
		this.is_only = only;

		// Read name and parent name
		if (version >= 2.2) {
			this.name = fp.readBinaryString(fp.readLong());
			this.parentname = fp.readBinaryString(fp.readLong());
		} else {
			this.name = fp.readBinaryString(40);
			this.parentname = fp.readBinaryString(40);
		}

		// Read textures
		const texCount = fp.readLong();
		this.textures = new Array(texCount);
		for (let i = 0; i < texCount; i++) {
			this.textures[i] = version >= 2.3 ? fp.readBinaryString(fp.readLong()) : fp.readLong();
		}

		// Read options
		this.mat3 = [
			fp.readFloat(), fp.readFloat(), fp.readFloat(),
			fp.readFloat(), fp.readFloat(), fp.readFloat(),
			fp.readFloat(), fp.readFloat(), fp.readFloat()
		];
		this.offset = [fp.readFloat(), fp.readFloat(), fp.readFloat()];

		// Read position, rotation angle, rotation axis, and scale
		if (version >= 2.2) {
			this.pos = [0, 0, 0];
			this.rotangle = 0;
			this.rotaxis = [0, 0, 0];
			this.scale = [1, 1, 1];
			this.flip = [1, -1, 1];
		} else {
			this.pos = [fp.readFloat(), fp.readFloat(), fp.readFloat()];
			this.rotangle = fp.readFloat();
			this.rotaxis = [fp.readFloat(), fp.readFloat(), fp.readFloat()];
			this.scale = [fp.readFloat(), fp.readFloat(), fp.readFloat()];
			this.flip = [1, 1, 1];
		}

		// Read vertices
		const vertCount = fp.readLong();
		this.vertices = new Array(vertCount);
		for (let i = 0; i < vertCount; ++i) {
			this.vertices[i] = [fp.readFloat(), fp.readFloat(), fp.readFloat()];
		}

		// Read texture vertices
		const tvertCount = fp.readLong();
		this.tvertices = new Float32Array(tvertCount * 6);
		for (let i = 0, j = 0; i < tvertCount; ++i, j += 6) {
			if (version >= 1.2) {
				this.tvertices[j + 0] = fp.readUByte() / 255;
				this.tvertices[j + 1] = fp.readUByte() / 255;
				this.tvertices[j + 2] = fp.readUByte() / 255;
				this.tvertices[j + 3] = fp.readUByte() / 255;
			}
			this.tvertices[j + 4] = fp.readFloat() * 0.98 + 0.01;
			this.tvertices[j + 5] = fp.readFloat() * 0.98 + 0.01;
		}

		// Read faces
		const faceCount = fp.readLong();
		this.faces = new Array(faceCount);
		for (let i = 0; i < faceCount; ++i) {
			let len = -1;
			if (version >= 2.2) {
				len = fp.readLong();
			}
			const face = {
				vertidx: [fp.readUShort(), fp.readUShort(), fp.readUShort()],
				tvertidx: [fp.readUShort(), fp.readUShort(), fp.readUShort()],
				texid: fp.readUShort(),
				padding: fp.readUShort(),
				twoSide: fp.readLong()
			};

			if (version >= 1.2) {
				face.smoothGroup = fp.readLong();
				if (len > 24) {
					face.smoothGroup_1 = fp.readLong();
				}
				if (len > 28) {
					face.smoothGroup_2 = fp.readLong();
				}
				if (len > 32) {
					fp.seek(len - 32, SEEK_CUR);
				}
			}
			this.faces[i] = face;
		}

		// Read scaleKeyFrame
		if (version >= 1.6) {
			const count = fp.readLong();
			this.scaleKeyFrames = new Array(count);
			for (let i = 0; i < count; i++) {
				this.scaleKeyFrames[i] = {
					Frame: fp.readLong(),
					Scale: [fp.readFloat(), fp.readFloat(), fp.readFloat()],
					Data: fp.readFloat()
				};
			}
		}

		// Read rotkeyframes
		const rotCount = fp.readLong();
		this.rotKeyframes = new Array(rotCount);
		for (let i = 0; i < rotCount; ++i) {
			this.rotKeyframes[i] = {
				frame: fp.readLong(),
				q: [fp.readFloat(), fp.readFloat(), fp.readFloat(), fp.readFloat()]
			};
		}

		// Read poskeyframes
		if (version >= 2.2) {
			const count = fp.readLong();
			this.posKeyframes = new Array(count);
			for (let i = 0; i < count; ++i) {
				this.posKeyframes[i] = {
					frame: fp.readLong(),
					px: fp.readFloat(),
					py: fp.readFloat(),
					pz: fp.readFloat(),
					Data: fp.readLong()
				};
			}
		}

		// Version 2.3 texture animation
		if (version >= 2.3) {
			const count = fp.readLong();
			this.textureKeyFrameGroup = new Array(count);
			for (let i = 0; i < count; ++i) {
				const textureId = fp.readLong();
				const amountAnim = fp.readLong();
				const groups = [];
				groups[textureId] = [];

				for (let j = 0; j < amountAnim; ++j) {
					const type = fp.readLong();
					const amountFrames = fp.readLong();
					groups[textureId][type] = [];
					for (let k = 0; k < amountFrames; ++k) {
						groups[textureId][type].push({
							frame: fp.readLong(),
							offset: fp.readFloat()
						});
					}
				}
				this.textureKeyFrameGroup[i] = groups;
			}
		}

		this.box = new BoundingBox();
		this.matrix = mat4.create();
	}

	/**
	 * Calculate node bounding box
	 * @param {mat4} parentMatrix
	 */
	calcBoundingBox(parentMatrix) {
		const v = vec3.create();
		const { box, main, vertices, pos, rotKeyframes, rotangle, rotaxis, scale, offset, mat3: nodeMat3, is_only, name, matrix: localMatrix } = this;
		const { nodes } = main;
		const matrix = mat4.create();

		mat4.copy(localMatrix, parentMatrix);
		mat4.translate(localMatrix, localMatrix, pos);

		if (!rotKeyframes.length) {
			mat4.rotate(localMatrix, localMatrix, rotangle, rotaxis);
		} else {
			mat4.rotateQuat(localMatrix, localMatrix, rotKeyframes[0].q);
		}

		mat4.scale(localMatrix, localMatrix, scale);

		mat4.copy(matrix, localMatrix);
		if (!is_only) {
			mat4.translate(matrix, matrix, offset);
		}

		mat4.multiply(matrix, matrix, mat3.toMat4(nodeMat3));

		vertices.forEach(vert => {
			const [vx, vy, vz] = vert;
			v[0] = matrix[0] * vx + matrix[4] * vy + matrix[8] * vz + matrix[12];
			v[1] = matrix[1] * vx + matrix[5] * vy + matrix[9] * vz + matrix[13];
			v[2] = matrix[2] * vx + matrix[6] * vy + matrix[10] * vz + matrix[14];

			for (let j = 0; j < 3; j++) {
				box.min[j] = Math.min(v[j], box.min[j]);
				box.max[j] = Math.max(v[j], box.max[j]);
			}
		});

		for (let i = 0; i < 3; i++) {
			box.offset[i] = (box.max[i] + box.min[i]) / 2.0;
			box.range[i] = (box.max[i] - box.min[i]) / 2.0;
			box.center[i] = box.min[i] + box.range[i];
		}

		nodes.forEach(node => {
			if (node.parentname === name && name !== node.parentname) {
				node.calcBoundingBox(localMatrix);
			}
		});
	}

	/**
	 * Compile Node
	 * @param {mat4} instance_matrix 
	 * @returns {object} mesh
	 */
	compile(instance_matrix) {
		const modelViewMat = mat4.create();
		const normalMat = mat4.create();
		const matrix = mat4.create();

		mat4.identity(matrix);
		mat4.translate(matrix, matrix, [-this.main.box.center[0], -this.main.box.max[1], -this.main.box.center[2]]);
		mat4.multiply(matrix, matrix, this.matrix);

		if (!this.is_only) {
			mat4.translate(matrix, matrix, this.offset);
		}

		mat4.multiply(matrix, matrix, mat3.toMat4(this.mat3));
		mat4.multiply(modelViewMat, instance_matrix, matrix);
		mat4.extractRotation(normalMat, modelViewMat);

		const { vertices, faces, textures } = this;
		const vertCount = vertices.length;
		const vert = new Float32Array(vertCount * 3);
		
		vertices.forEach((v, i) => {
			const [vx, vy, vz] = v;
			vert[i * 3 + 0] = modelViewMat[0] * vx + modelViewMat[4] * vy + modelViewMat[8] * vz + modelViewMat[12];
			vert[i * 3 + 1] = modelViewMat[1] * vx + modelViewMat[5] * vy + modelViewMat[9] * vz + modelViewMat[13];
			vert[i * 3 + 2] = modelViewMat[2] * vx + modelViewMat[6] * vy + modelViewMat[10] * vz + modelViewMat[14];
		});

		const face_normal = new Float32Array(faces.length * 3);
		const mesh_size = {};
		const mesh = {};

		textures.forEach(t => mesh_size[t] = 0);
		faces.forEach(f => mesh_size[textures[f.texid]]++);
		textures.forEach(t => mesh[t] = new Float32Array(mesh_size[t] * 9 * 3));

		const shadeGroup = new Array(32);
		const shadeGroupUsed = new Array(32);

		const { shadeType } = this.main;
		const { SHADING } = RSM;

		if (shadeType === SHADING.NONE) {
			this.calcNormal_NONE(face_normal);
			this.generate_mesh_FLAT(vert, face_normal, mesh);
		} else if (shadeType === SHADING.FLAT) {
			this.calcNormal_FLAT(face_normal, normalMat, shadeGroupUsed);
			this.generate_mesh_FLAT(vert, face_normal, mesh);
		} else if (shadeType === SHADING.SMOOTH) {
			this.calcNormal_FLAT(face_normal, normalMat, shadeGroupUsed);
			this.calcNormal_SMOOTH(face_normal, shadeGroupUsed, shadeGroup);
			this.generate_mesh_SMOOTH(vert, shadeGroup, mesh);
		}

		return mesh;
	}

	/**
	 * Compile Node at frame
	 */
	compileAtFrame(instance_matrix, frame, animLen) {
		const modelViewMat = mat4.create();
		const normalMat = mat4.create();
		const matrix = mat4.create();

		mat4.identity(matrix);
		mat4.translate(matrix, matrix, [-this.main.box.center[0], -this.main.box.max[1], -this.main.box.center[2]]);

		const nodeMatrix = mat4.create();
		mat4.identity(nodeMatrix);

		const animPos = RSM.getPositionAtFrame(this.posKeyframes, frame, animLen);
		mat4.translate(nodeMatrix, nodeMatrix, animPos || this.pos);

		const animRot = RSM.getRotationAtFrame(this.rotKeyframes, frame, animLen);
		if (animRot) {
			mat4.rotateQuat(nodeMatrix, nodeMatrix, animRot);
		} else if (this.rotKeyframes?.length) {
			mat4.rotateQuat(nodeMatrix, nodeMatrix, this.rotKeyframes[0].q);
		} else {
			mat4.rotate(nodeMatrix, nodeMatrix, this.rotangle, this.rotaxis);
		}

		const animScale = RSM.getScaleAtFrame(this.scaleKeyFrames, frame, animLen);
		mat4.scale(nodeMatrix, nodeMatrix, animScale || this.scale);

		mat4.multiply(matrix, matrix, nodeMatrix);
		if (!this.is_only) {
			mat4.translate(matrix, matrix, this.offset);
		}

		mat4.multiply(matrix, matrix, mat3.toMat4(this.mat3));
		mat4.multiply(modelViewMat, instance_matrix, matrix);
		mat4.extractRotation(normalMat, modelViewMat);

		const { vertices, faces, textures } = this;
		const vert = new Float32Array(vertices.length * 3);
		vertices.forEach((v, i) => {
			const [vx, vy, vz] = v;
			vert[i * 3 + 0] = modelViewMat[0] * vx + modelViewMat[4] * vy + modelViewMat[8] * vz + modelViewMat[12];
			vert[i * 3 + 1] = modelViewMat[1] * vx + modelViewMat[5] * vy + modelViewMat[9] * vz + modelViewMat[13];
			vert[i * 3 + 2] = modelViewMat[2] * vx + modelViewMat[6] * vy + modelViewMat[10] * vz + modelViewMat[14];
		});

		const face_normal = new Float32Array(faces.length * 3);
		const mesh_size = {};
		const mesh = {};
		textures.forEach(t => mesh_size[t] = 0);
		faces.forEach(f => mesh_size[textures[f.texid]]++);
		textures.forEach(t => mesh[t] = new Float32Array(mesh_size[t] * 9 * 3));

		const shadeGroup = new Array(32);
		const shadeGroupUsed = new Array(32);

		const { shadeType } = this.main;
		const { SHADING } = RSM;

		if (shadeType === SHADING.NONE) {
			this.calcNormal_NONE(face_normal);
			this.generate_mesh_FLAT(vert, face_normal, mesh);
		} else if (shadeType === SHADING.FLAT) {
			this.calcNormal_FLAT(face_normal, normalMat, shadeGroupUsed);
			this.generate_mesh_FLAT(vert, face_normal, mesh);
		} else if (shadeType === SHADING.SMOOTH) {
			this.calcNormal_FLAT(face_normal, normalMat, shadeGroupUsed);
			this.calcNormal_SMOOTH(face_normal, shadeGroupUsed, shadeGroup);
			this.generate_mesh_SMOOTH(vert, shadeGroup, mesh);
		}

		return mesh;
	}

	calcNormal_NONE(out) {
		for (let i = 1; i < out.length; i += 3) {
			out[i] = -1;
		}
	}

	calcNormal_FLAT(out, normalMat, groupUsed) {
		const temp_vec = vec3.create();
		const { faces, vertices } = this;
		faces.forEach((face, i) => {
			vec3.calcNormal(vertices[face.vertidx[0]], vertices[face.vertidx[1]], vertices[face.vertidx[2]], temp_vec);
			const j = i * 3;
			out[j] = normalMat[0] * temp_vec[0] + normalMat[4] * temp_vec[1] + normalMat[8] * temp_vec[2] + normalMat[12];
			out[j + 1] = normalMat[1] * temp_vec[0] + normalMat[5] * temp_vec[1] + normalMat[9] * temp_vec[2] + normalMat[13];
			out[j + 2] = normalMat[2] * temp_vec[0] + normalMat[6] * temp_vec[1] + normalMat[10] * temp_vec[2] + normalMat[14];
			groupUsed[face.smoothGroup] = true;
		});
	}

	calcNormal_SMOOTH(normal, groupUsed, group) {
		const { vertices, faces } = this;
		const size = vertices.length;
		const count = faces.length;

		for (let j = 0; j < 32; ++j) {
			if (!groupUsed[j]) {
				continue;
			}
			group[j] = new Float32Array(size * 3);
			const norm = group[j];

			for (let v = 0; v < size; ++v) {
				let x = 0, y = 0, z = 0;
				for (let i = 0; i < count; ++i) {
					const face = faces[i];
					if (face.smoothGroup === j && (face.vertidx[0] === v || face.vertidx[1] === v || face.vertidx[2] === v)) {
						x += normal[i * 3];
						y += normal[i * 3 + 1];
						z += normal[i * 3 + 2];
					}
				}
				const len = 1 / Math.sqrt(x * x + y * y + z * z);
				const l = v * 3;
				norm[l] = x * len;
				norm[l + 1] = y * len;
				norm[l + 2] = z * len;
			}
		}
	}

	generate_mesh_FLAT(vert, norm, mesh) {
		const { faces, textures, tvertices: tver, main } = this;
		const { alpha } = main;
		const offset = {};
		textures.forEach(t => offset[t] = 0);

		faces.forEach((face, i) => {
			const { vertidx: idx, tvertidx: tidx, texid } = face;
			const t = textures[texid];
			const out = mesh[t];
			let o = offset[t];
			const k = i * 3;

			for (let j = 0; j < 3; j++, o += 9) {
				const a = idx[j] * 3;
				const b = tidx[j] * 6;
				out[o + 0] = vert[a + 0];
				out[o + 1] = vert[a + 1];
				out[o + 2] = vert[a + 2];
				out[o + 3] = norm[k + 0];
				out[o + 4] = norm[k + 1];
				out[o + 5] = norm[k + 2];
				out[o + 6] = tver[b + 4];
				out[o + 7] = tver[b + 5];
				out[o + 8] = alpha;
			}
			offset[t] = o;
		});
	}

	generate_mesh_SMOOTH(vert, shadeGroup, mesh) {
		const { faces, textures, tvertices: tver, main } = this;
		const { alpha } = main;
		const offset = {};
		textures.forEach(t => offset[t] = 0);

		faces.forEach(face => {
			const norm = shadeGroup[face.smoothGroup];
			const { vertidx: idx, tvertidx: tidx, texid } = face;
			const t = textures[texid];
			const out = mesh[t];
			let o = offset[t];

			for (let j = 0; j < 3; j++, o += 9) {
				const a = idx[j] * 3;
				const b = tidx[j] * 6;
				out[o + 0] = vert[a + 0];
				out[o + 1] = vert[a + 1];
				out[o + 2] = vert[a + 2];
				out[o + 3] = norm[a + 0];
				out[o + 4] = norm[a + 1];
				out[o + 5] = norm[a + 2];
				out[o + 6] = tver[b + 4];
				out[o + 7] = tver[b + 5];
				out[o + 8] = alpha;
			}
			offset[t] = o;
		});
	}
}

/**
 * @class RSM
 * @description Loader for Gravity .rsm models.
 */
class RSM {
	static SHADING = { NONE: 0, FLAT: 1, SMOOTH: 2 };

	/**
	 * @constructor
	 * @param {ArrayBuffer} [data]
	 */
	constructor(data) {
		this.version = 0.0;
		this.animLen = 0;
		this.shadeType = RSM.SHADING.SMOOTH;
		this.main_node = null;
		this.alpha = 1.0;
		this.frameRatePerSecond = 0;
		this.textures = [];
		this.nodes = [];
		this.posKeyframes = [];
		this.volumebox = [];
		this.instances = [];
		this.box = new BoundingBox();
		
		/** @private */
		this._hasanimation = false;

		if (data) {
			this.load(data);
		}
	}

	/**
	 * Loading RSM file
	 * @param {ArrayBuffer} data
	 */
	load(data) {
		const fp = new BinaryReader(data);
		const header = fp.readBinaryString(4);

		if (header !== 'GRSM' && header !== 'GRSX') {
			throw new Error(`RSM::load() - Incorrect header "${header}", must be "GRSM"`);
		}

		this.version = fp.readByte() + fp.readByte() / 10;
		this.animLen = fp.readLong();
		this.shadeType = fp.readLong();
		this.alpha = this.version >= 1.4 ? fp.readUByte() / 255.0 : 1.0;

		const textures = [];
		const additionalTextures = [];

		if (this.version >= 2.3) {
			this.frameRatePerSecond = fp.readFloat();
			const count = fp.readLong();
			for (let i = 0; i < count; i++) {
				textures.push(fp.readBinaryString(fp.readLong()));
			}
		} else if (this.version >= 2.2) {
			this.frameRatePerSecond = fp.readFloat();
			let count = fp.readLong();
			for (let i = 0; i < count; i++) {additionalTextures.push(fp.readBinaryString(fp.readLong()));}
			count = fp.readLong();
			for (let i = 0; i < count; i++) {textures.push(fp.readBinaryString(fp.readLong()));}
		} else {
			fp.seek(16, SEEK_CUR); // reserved
			const count = fp.readLong();
			for (let i = 0; i < count; i++) {
				additionalTextures.push(fp.readBinaryString(40));
			}
			textures.push(fp.readBinaryString(40));
		}

		const nodeCount = fp.readLong();
		this.nodes = new Array(nodeCount);
		for (let i = 0; i < nodeCount; i++) {
			this.nodes[i] = new RSMNode(this, fp, nodeCount === 1);
			if (this.nodes[i].name === textures[0]) {
				this.main_node = this.nodes[i];
			}
		}

		if (!this.main_node) {
			this.main_node = this.nodes[0];
		}

		if (this.version < 1.6) {
			const count = fp.readLong();
			this.posKeyframes = new Array(count);
			for (let i = 0; i < count; i++) {
				this.posKeyframes[i] = {
					frame: fp.readLong(),
					px: fp.readFloat(), py: fp.readFloat(), pz: fp.readFloat(),
					data: fp.readFloat()
				};
			}
		}

		const volCount = fp.offset >= fp.length ? 0 : fp.readLong();
		this.volumebox = new Array(volCount);
		for (let i = 0; i < volCount; i++) {
			this.volumebox[i] = {
				size: [fp.readFloat(), fp.readFloat(), fp.readFloat()],
				pos: [fp.readFloat(), fp.readFloat(), fp.readFloat()],
				rot: [fp.readFloat(), fp.readFloat(), fp.readFloat()],
				flag: this.version >= 1.3 ? fp.readLong() : 0
			};
		}

		this.textures = additionalTextures;
		if (this.version >= 2.3) {
			this.main_node.textures.forEach((texture, i) => {
				if (!this.textures.includes(texture)) {
					this.textures.push(texture);
				}
				this.main_node.textures[i] = this.textures.indexOf(texture);
			});
			this.nodes.forEach(node => {
				node.textures.forEach((texture, i) => {
					if (typeof texture !== 'number') {
						if (!this.textures.includes(texture)) {
							this.textures.push(texture);
						}
						node.textures[i] = this.textures.indexOf(texture);
					}
				});
			});
		}

		this.instances = [];
		this.box = new BoundingBox();
		this.calcBoundingBox();
	}

	createInstance(model, width, height) {
		const matrix = mat4.create();
		mat4.identity(matrix);
		mat4.translate(matrix, matrix, [model.position[0] + width, model.position[1], model.position[2] + height]);
		mat4.rotateZ(matrix, matrix, (model.rotation[2] / 180) * Math.PI);
		mat4.rotateX(matrix, matrix, (model.rotation[0] / 180) * Math.PI);
		mat4.rotateY(matrix, matrix, (model.rotation[1] / 180) * Math.PI);
		mat4.scale(matrix, matrix, model.scale);

		if (this.main_node.main.version >= 2.2) {
			mat4.scale(matrix, matrix, this.main_node.flip);
			mat4.translate(matrix, matrix, this.main_node.offset);
			mat4.translate(matrix, matrix, [0.0, this.box.range[1], 0.0]);
			mat4.translate(matrix, matrix, this.box.offset);
		}
		this.instances.push(matrix);
	}

	calcBoundingBox() {
		const matrix = mat4.create();
		mat4.identity(matrix);
		this.main_node.calcBoundingBox(matrix);

		const { box, nodes } = this;
		for (let i = 0; i < 3; ++i) {
			nodes.forEach(node => {
				box.max[i] = Math.max(box.max[i], node.box.max[i]);
				box.min[i] = Math.min(box.min[i], node.box.min[i]);
			});
			box.offset[i] = (box.max[i] + box.min[i]) / 2.0;
			box.range[i] = (box.max[i] - box.min[i]) / 2.0;
			box.center[i] = box.min[i] + box.range[i];
		}
	}

	compile() {
		const { nodes, instances, textures } = this;
		const meshes = new Array(nodes.length * instances.length);
		let k = 0;
		nodes.forEach(node => {
			instances.forEach(instance => {
				meshes[k++] = node.compile(instance);
			});
		});

		return { meshes, textures };
	}

	compileAtFrame(frame) {
		const { nodes, instances, textures, animLen } = this;
		const duration = animLen || 1;
		const meshes = new Array(nodes.length * instances.length);
		let k = 0;
		nodes.forEach(node => {
			instances.forEach(instance => {
				meshes[k++] = node.compileAtFrame(instance, frame, duration);
			});
		});

		return { meshes, textures };
	}

	hasAnimation() {
		if (this._hasanimation) {
			return true;
		}
		for (const node of this.nodes) {
			if (node.rotKeyframes?.length || node.posKeyframes?.length || node.scaleKeyFrames?.length) {
				this._hasanimation = true;
				return true;
			}
		}
		return false;
	}

	static getRotationAtFrame(keyframes, frame, animLen) {
		if (!keyframes?.length) {
			return null;
		}
		if (keyframes.length === 1) {
			return keyframes[0].q;
		}

		let prev = keyframes[0], next = null;
		for (const kf of keyframes) {
			if (kf.frame > frame) { next = kf; break; }
			prev = kf;
		}

		if (!next) {
			return prev.q;
		}
		const frameDiff = next.frame - prev.frame;
		if (frameDiff === 0) {
			return prev.q;
		}

		return slerpQuat(prev.q, next.q, (frame - prev.frame) / frameDiff);
	}

	static getPositionAtFrame(keyframes, frame, animLen) {
		if (!keyframes?.length) {
			return null;
		}
		if (keyframes.length === 1) {
			return [keyframes[0].px, keyframes[0].py, keyframes[0].pz];
		}

		let prev = keyframes[0], next = null;
		for (const kf of keyframes) {
			if (kf.frame > frame) { next = kf; break; }
			prev = kf;
		}

		if (!next) {
			return [prev.px, prev.py, prev.pz];
		}
		const frameDiff = next.frame - prev.frame;
		if (frameDiff === 0) {
			return [prev.px, prev.py, prev.pz];
		}

		const t = (frame - prev.frame) / frameDiff;
		return [
			prev.px + (next.px - prev.px) * t,
			prev.py + (next.py - prev.py) * t,
			prev.pz + (next.pz - prev.pz) * t
		];
	}

	static getScaleAtFrame(keyframes, frame, animLen) {
		if (!keyframes?.length) {
			return null;
		}
		if (keyframes.length === 1) {
			return keyframes[0].Scale;
		}

		let prev = keyframes[0], next = null;
		for (const kf of keyframes) {
			if (kf.Frame > frame) {
				next = kf;
				break;
			}
			prev = kf;
		}

		if (!next) {
			return prev.Scale;
		}
		const frameDiff = next.Frame - prev.Frame;
		if (frameDiff === 0) {
			return prev.Scale;
		}

		const t = (frame - prev.Frame) / frameDiff;
		return [
			prev.Scale[0] + (next.Scale[0] - prev.Scale[0]) * t,
			prev.Scale[1] + (next.Scale[1] - prev.Scale[1]) * t,
			prev.Scale[2] + (next.Scale[2] - prev.Scale[2]) * t
		];
	}
}

function slerpQuat(q1, q2, t) {
	const result = new Float32Array(4);
	let dot = q1[0] * q2[0] + q1[1] * q2[1] + q1[2] * q2[2] + q1[3] * q2[3];
	let q2Sign = 1;
	if (dot < 0) {
		dot = -dot;
		q2Sign = -1;
	}

	let scale0, scale1;
	if (dot > 0.9995) {
		scale0 = 1.0 - t;
		scale1 = t * q2Sign;
	} else {
		const theta = Math.acos(dot);
		const sinTheta = Math.sin(theta);
		scale0 = Math.sin((1.0 - t) * theta) / sinTheta;
		scale1 = (Math.sin(t * theta) / sinTheta) * q2Sign;
	}

	result[0] = scale0 * q1[0] + scale1 * q2[0];
	result[1] = scale0 * q1[1] + scale1 * q2[1];
	result[2] = scale0 * q1[2] + scale1 * q2[2];
	result[3] = scale0 * q1[3] + scale1 * q2[3];
	return result;
}

export default RSM;
