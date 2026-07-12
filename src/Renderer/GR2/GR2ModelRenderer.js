/**
 * Renderer/GR2/GR2ModelRenderer.js
 *
 * GPU-skinned Granny3D (.gr2) model renderer for on-map 3dmob actors (guild flag,
 * Emperium, guardians). Ported from the sandbox robrowser render path
 * (re-ro-clients-asm/sandbox/src/subsystems/gr2/draw-gpu-robrowser.js) to roBrowser
 * conventions, consuming Loaders/GR2Loader.js.
 *
 * Architecture:
 *   - Per-TYPE resource cache (key = gr2 path): one VBO/IBO/VAO/textures/skeleton/parsed
 *     per type, refcounted. N instances carry only { world, actor, animIndex, t }.
 *   - 40 Hz pose cache: poseAt is recomputed on the rag tick, keyed
 *     (path, animIndex, quantize(t, 1/40)). Same-type / same-phase instances collapse to
 *     one poseAt; culled/absent instances never pose.
 *   - Bones: mat4 uBones[48] uniform + one draw per submesh per instance.
 *
 * Wired at the AnimatedModels seam of MapRenderer.onRender, wrapped in
 * SpriteRenderer.runWithDepth(true, true, true). Frustum/distance culling is deferred to the
 * Entity-integration pass (needs the populated EntityManager). Drive it from the /api.html
 * console via window.RO.load('Renderer/GR2/GR2ModelRenderer'): RO.spawn(path, {pos, dir, action}).
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import Client from 'Core/Client.js';
import glMatrix from 'Utils/gl-matrix.js';
import WebGL from 'Utils/WebGL.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import Session from 'Engine/SessionStorage.js';
import Altitude from 'Renderer/Map/Altitude.js';
import GR2Loader from 'Loaders/GR2Loader.js';
import { poseAt } from 'granny-ro-js/wasm';
import { packRobrowserInterleave, flattenPose, poseCacheKey, quantizePoseTime, recenterEmblem } from './gr2Pack.js';
import { buildWorld, computeGroundOffset } from './gr2World.js';
import { createActor, setAction, actorPose } from './actorAction.js';
import _vertexShader from './GR2Model.vs?raw';
import _fragmentShader from './GR2Model.fs?raw';

const mat3 = glMatrix.mat3;
const mat4 = glMatrix.mat4;

/**
 * Phase-0 grayscale directional lighting (gr2-lighting-shadow-mars26.md): intensity
 * 128/255, ambient floor 127/255, no env tint, full directional opacity. No uShadow cell
 * scalar, no shadow blob.
 */
const ALPHA_REF = 207 / 255;
const _phaseDiffuse = new Float32Array([128 / 255, 128 / 255, 128 / 255]);
const _phaseAmbient = new Float32Array([127 / 255, 127 / 255, 127 / 255]);
const _phaseEnv = new Float32Array([1, 1, 1]);

let _program = null;

// Per-type resource cache (key = gr2 path).
let _types = {};

// Live instances: { path, world, worldBuilt, actor, dir, pos, standbyIdx, animIndex, t }.
let _instances = [];

// Pose cache — set each frame to only the poses used that frame (bounds memory, keeps the
// 40 Hz reuse across rAF frames when the quantized bucket is unchanged).
let _poseCache = {};

// granny-ro-js WASM init (texture pixel decode); shared across all types.
let _readyPromise = null;

// Scratchpads to evade the GC.
const _mv = mat4.create();
const _nmat = mat3.create();
const _lightView = new Float32Array(3);

/**
 * Initialize the shader program.
 */
function init(gl) {
	_program = WebGL.createShaderProgram(gl, _vertexShader, _fragmentShader);

	_program.uniform = {
		uModelViewMat: gl.getUniformLocation(_program, 'uModelViewMat'),
		uProjectionMat: gl.getUniformLocation(_program, 'uProjectionMat'),
		uNormalMat: gl.getUniformLocation(_program, 'uNormalMat'),
		uBones: gl.getUniformLocation(_program, 'uBones[0]'),
		uLightDirection: gl.getUniformLocation(_program, 'uLightDirection'),
		uLightOpacity: gl.getUniformLocation(_program, 'uLightOpacity'),
		uLightAmbient: gl.getUniformLocation(_program, 'uLightAmbient'),
		uLightDiffuse: gl.getUniformLocation(_program, 'uLightDiffuse'),
		uLightEnv: gl.getUniformLocation(_program, 'uLightEnv'),
		uAlphaRef: gl.getUniformLocation(_program, 'uAlphaRef'),
		uFogUse: gl.getUniformLocation(_program, 'uFogUse'),
		uFogNear: gl.getUniformLocation(_program, 'uFogNear'),
		uFogFar: gl.getUniformLocation(_program, 'uFogFar'),
		uFogColor: gl.getUniformLocation(_program, 'uFogColor'),
		uDiffuse: gl.getUniformLocation(_program, 'uDiffuse')
	};

	_program.attribute = {
		aPosition: gl.getAttribLocation(_program, 'aPosition'),
		aNormal: gl.getAttribLocation(_program, 'aNormal'),
		aTextureCoord: gl.getAttribLocation(_program, 'aTextureCoord'),
		aBoneIndex: gl.getAttribLocation(_program, 'aBoneIndex'),
		aBoneWeight: gl.getAttribLocation(_program, 'aBoneWeight')
	};
}

/**
 * Free all type GL resources and drop every instance (MapRenderer calls this on map unload).
 */
function free(gl) {
	for (const path in _types) {
		const type = _types[path];
		if (type.submeshes) {
			for (let s = 0; s < type.submeshes.length; s++) {
				const sm = type.submeshes[s];
				gl.deleteVertexArray(sm.vao);
				gl.deleteBuffer(sm.vbo);
				gl.deleteBuffer(sm.ibo);
			}
		}
		if (type.textures) {
			for (const file in type.textures.byFile) {
				gl.deleteTexture(type.textures.byFile[file]);
			}
		}
	}
	_types = {};
	_instances = [];
	_poseCache = {};
}

/**
 * keyGr2Magenta(px) — ASM-faithful gr2 texture transparency. The client keys MAGENTA
 * 0xFF00FF by zeroing the whole pixel to black + alpha 0 (mars26 fcn.0054e950 / ver12
 * fcn.00417550). Discarded before the RGB contributes (opaque + hard alpha-test at 207).
 * A 32-bit source with its own alpha is honoured verbatim.
 */
function keyGr2Magenta(px) {
	for (let i = 3; i < px.length; i += 4) {
		if (px[i] < 255) {
			return px;
		}
	}
	const out = new Uint8Array(px);
	for (let i = 0; i < out.length; i += 4) {
		if (out[i] >= 248 && out[i + 1] < 8 && out[i + 2] >= 248) {
			out[i] = out[i + 1] = out[i + 2] = out[i + 3] = 0;
		}
	}
	return out;
}

/**
 * makeTypeTextures(gl, parsed) -> { byFile:{ textureFile -> GLTexture } }. One texture per
 * embedded granny texture, keyed by its file name (the string a packed mesh carries in
 * texFile). LINEAR + CLAMP = the client's active sampler 0 (byte-cited).
 */
function makeTypeTextures(gl, parsed) {
	const byFile = {};
	const list = parsed.textures || [];
	for (let i = 0; i < list.length; i++) {
		const t = list[i];
		const tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		if (t && t.pixels) {
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				t.width,
				t.height,
				0,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				keyGr2Magenta(t.pixels)
			);
		} else {
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				1,
				1,
				0,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				new Uint8Array([200, 200, 200, 255])
			);
		}
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		byFile[t.name] = tex;
	}
	const grey = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, grey);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([180, 180, 185, 255]));
	byFile.__grey = grey;
	gl.bindTexture(gl.TEXTURE_2D, null);
	return { byFile: byFile };
}

/**
 * acquire(path) — refcount a type; on first acquire fetch the .gr2 (worker Thread ->
 * cyro source) and decode it on the CPU (GL upload is deferred to the first render that
 * has a gl context). Returns the type entry immediately (empty until decode completes).
 */
function acquire(path) {
	let type = _types[path];
	if (type) {
		type.refcount++;
		return type;
	}

	type = {
		path: path,
		refcount: 1,
		cpuReady: false,
		glReady: false,
		parsed: null,
		meshes: null,
		ipRow: undefined,
		boneCount: 0,
		duration: 1,
		submeshes: null,
		textures: null
	};
	_types[path] = type;

	if (!_readyPromise) {
		_readyPromise = GR2Loader.ready();
	}
	Client.getFile(
		path,
		function (buffer) {
			_readyPromise.then(function () {
				// The type may have been freed before the async decode returned.
				if (_types[path] !== type) {
					return;
				}
				const loader = new GR2Loader(buffer);
				type.parsed = loader.parsed;
				type.meshes = loader.meshes;
				recenterEmblem(type.meshes); // render-only: centre the off-baked emblem on the banner
				type.groundOffset = computeGroundOffset(type.meshes); // drop the base onto the terrain
				type.ipRow = loader.ipRow;
				type.boneCount = loader.boneCount;
				type.duration = loader.duration;
				type.cpuReady = true;
			});
		},
		function () {
			console.warn('[GR2ModelRenderer] failed to fetch', path);
		}
	);
	return type;
}

/**
 * buildTypeGL(gl, type) — upload the type's VBO/IBO/VAO per submesh + textures, once the
 * CPU decode is done. One VAO per submesh, 16-float interleave (stride 64).
 */
function buildTypeGL(gl, type) {
	type.textures = makeTypeTextures(gl, type.parsed);
	const attr = _program.attribute;
	type.submeshes = type.meshes.map(function (mesh) {
		const vao = gl.createVertexArray();
		gl.bindVertexArray(vao);

		const vbo = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		gl.bufferData(gl.ARRAY_BUFFER, packRobrowserInterleave(mesh), gl.STATIC_DRAW);

		const stride = 64;
		gl.enableVertexAttribArray(attr.aPosition);
		gl.vertexAttribPointer(attr.aPosition, 3, gl.FLOAT, false, stride, 0);
		gl.enableVertexAttribArray(attr.aNormal);
		gl.vertexAttribPointer(attr.aNormal, 3, gl.FLOAT, false, stride, 12);
		gl.enableVertexAttribArray(attr.aTextureCoord);
		gl.vertexAttribPointer(attr.aTextureCoord, 2, gl.FLOAT, false, stride, 24);
		gl.enableVertexAttribArray(attr.aBoneIndex);
		gl.vertexAttribPointer(attr.aBoneIndex, 4, gl.FLOAT, false, stride, 32);
		gl.enableVertexAttribArray(attr.aBoneWeight);
		gl.vertexAttribPointer(attr.aBoneWeight, 4, gl.FLOAT, false, stride, 48);

		const ibo = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

		gl.bindVertexArray(null);
		return {
			vao: vao,
			vbo: vbo,
			ibo: ibo,
			count: mesh.indices.length,
			tex: type.textures.byFile[mesh.texFile] || type.textures.byFile.__grey
		};
	});
	type.glReady = true;
}

function mat3MulVec3(m, v, out) {
	out[0] = m[0] * v[0] + m[4] * v[1] + m[8] * v[2];
	out[1] = m[1] * v[0] + m[5] * v[1] + m[9] * v[2];
	out[2] = m[2] * v[0] + m[6] * v[1] + m[10] * v[2];
}

function normalize3(v) {
	const len = Math.hypot(v[0], v[1], v[2]) || 1;
	v[0] /= len;
	v[1] /= len;
	v[2] /= len;
}

/**
 * Render every live GR2 instance. Signature mirrors AnimatedModels.render (the seam it
 * sits next to): (gl, modelView, projection, normalMat, fog, light, tick). modelView is
 * Camera.modelView (the view matrix); the per-instance world is composed on top.
 */
function render(gl, modelView, projection, normalMat, fog, light, tick) {
	if (_instances.length === 0 || !light) {
		return;
	}
	if (!_program) {
		init(gl);
	}

	// Build GL resources for any type whose CPU decode has finished.
	for (const path in _types) {
		const type = _types[path];
		if (type.cpuReady && !type.glReady) {
			buildTypeGL(gl, type);
		}
	}

	const uniform = _program.uniform;
	gl.useProgram(_program);

	// Per-frame constant uniforms.
	gl.uniformMatrix4fv(uniform.uProjectionMat, false, projection);
	gl.uniform1f(uniform.uLightOpacity, 1.0);
	gl.uniform3fv(uniform.uLightDiffuse, _phaseDiffuse);
	gl.uniform3fv(uniform.uLightAmbient, _phaseAmbient);
	gl.uniform3fv(uniform.uLightEnv, _phaseEnv);
	gl.uniform1f(uniform.uAlphaRef, ALPHA_REF);
	gl.uniform1i(uniform.uFogUse, fog.use && fog.exist);
	gl.uniform1f(uniform.uFogNear, fog.near);
	gl.uniform1f(uniform.uFogFar, fog.far);
	gl.uniform3fv(uniform.uFogColor, fog.color);
	gl.activeTexture(gl.TEXTURE0);
	gl.uniform1i(uniform.uDiffuse, 0);

	// Opaque device state — no blend (client draws the GR2 opaque with a hard alpha-test). Saved
	// and restored so the later transparent passes (entity shadow, water, effects) keep their blend.
	const blendWasEnabled = gl.isEnabled(gl.BLEND);
	gl.disable(gl.BLEND);

	// Scene light direction (world) -> view space, so N.L shares the normal's frame.
	mat3MulVec3(modelView, light.direction, _lightView);
	normalize3(_lightView);
	gl.uniform3fv(uniform.uLightDirection, _lightView);

	const seen = {};
	SpriteRenderer.runWithDepth(true, true, true, function () {
		for (let i = 0; i < _instances.length; i++) {
			const inst = _instances[i];
			const type = _types[inst.path];
			if (!type || !type.glReady) {
				continue;
			}

			// Build the instance world matrix once the type (its ipRow) is known. Entity
			// positions are [cellX, cellY, height]; roBrowser's world axes are X=cellX,
			// Y=height (up), Z=cellY — so swap Y/Z into buildWorld's ground-plane frame (the
			// same swap Camera.update does: _position[1]=pos[2], _position[2]=pos[1]).
			if (!inst.worldBuilt) {
				const p = inst.pos;
				// RO direction is an 8-way index (0-7); the world yaw wants degrees (45 deg/step).
				inst.world = buildWorld(inst.dir * 45, [p[0], p[2], p[1]], type.ipRow, {
					heightOffset: type.groundOffset
				});
				inst.worldBuilt = true;
			}

			// Advance the action clock, then resolve/cache the pose at 40 Hz.
			const pose = actorPose(inst.actor, type, tick, inst.standbyIdx, null);
			inst.animIndex = pose.animIndex;
			inst.t = pose.t;

			const key = poseCacheKey(inst.path, pose.animIndex, quantizePoseTime(pose.t));
			let bones = seen[key] || _poseCache[key];
			if (!bones) {
				const idx = pose.animIndex < 0 ? -1 : pose.animIndex;
				const sampleT = pose.animIndex < 0 ? 0 : pose.t;
				bones = flattenPose(poseAt(type.parsed, idx, sampleT), type.boneCount);
			}
			seen[key] = bones;

			// Per-instance matrices: modelView = view * world, normalMat = inv-transpose of its 3x3.
			mat4.multiply(_mv, modelView, inst.world);
			mat4.toInverseMat3(_mv, _nmat);
			mat3.transpose(_nmat, _nmat);
			gl.uniformMatrix4fv(uniform.uModelViewMat, false, _mv);
			gl.uniformMatrix3fv(uniform.uNormalMat, false, _nmat);
			gl.uniformMatrix4fv(uniform.uBones, false, bones);

			for (let s = 0; s < type.submeshes.length; s++) {
				const sm = type.submeshes[s];
				gl.bindTexture(gl.TEXTURE_2D, sm.tex);
				gl.bindVertexArray(sm.vao);
				gl.drawElements(gl.TRIANGLES, sm.count, gl.UNSIGNED_SHORT, 0);
			}
		}
	});
	gl.bindVertexArray(null);
	if (blendWasEnabled) {
		gl.enable(gl.BLEND);
	}
	_poseCache = seen;
}

/**
 * spawn(path, opts) — dev harness: place a GR2 instance. opts = { pos, dir, action,
 * standbyIdx }; pos/dir default to the player's position/facing. Returns the instance.
 */
function spawn(path, opts) {
	const o = opts || {};
	const ent = Session.Entity;
	const pos = o.pos || (ent ? [ent.position[0], ent.position[1], ent.position[2]] : [0, 0, 0]);
	const dir = o.dir != null ? o.dir : ent ? ent.direction : 0;
	// Ground the base on the REAL terrain height at the target cell (what a real entity carries in
	// position[2]) — so an offset dev spawn sits on the local ground, not the player's height.
	pos[2] = Altitude.getCellHeight(pos[0], pos[1]);

	acquire(path);

	const actor = createActor();
	if (o.action && o.action !== 'stand') {
		setAction(actor, o.action, 0);
		if (o.action === 'move') {
			actor.loop = true;
		}
	}

	const inst = {
		path: path,
		world: null,
		worldBuilt: false,
		actor: actor,
		dir: dir,
		pos: pos,
		standbyIdx: o.standbyIdx != null ? o.standbyIdx : 0,
		animIndex: 0,
		t: 0
	};
	_instances.push(inst);
	return inst;
}

/**
 * spawnMany(path, n, opts) — dev stress path: spawn n instances of one type in a sunflower
 * (phyllotaxis) spiral radiating out around the player, to prove same-type mobs collapse to one
 * geometry upload + one poseAt per phase. opts.spacing scales the disk radius.
 */
function spawnMany(path, n, opts) {
	const o = opts || {};
	const ent = Session.Entity;
	const base = o.pos || (ent ? [ent.position[0], ent.position[1], ent.position[2]] : [0, 0, 0]);
	const spacing = o.spacing || 1.2;
	const golden = Math.PI * (3 - Math.sqrt(5)); // ~137.5 deg — even phyllotaxis fill
	const out = [];
	for (let i = 0; i < n; i++) {
		const r = spacing * Math.sqrt(i + 0.5); // radius grows outward, dense near the centre
		const a = i * golden;
		const inst = spawn(path, {
			pos: [base[0] + r * Math.cos(a), base[1] + r * Math.sin(a), base[2]],
			dir: o.dir,
			action: o.action,
			standbyIdx: o.standbyIdx
		});
		// decorrelate: phase-shift each instance by one 40 Hz tick so they land in distinct pose
		// buckets (realistic non-synchronized load — poseAt count then caps at duration*40, not N).
		if (o.decorrelate) {
			inst.actor.startT = -i * 25;
		}
		out.push(inst);
	}
	return out;
}

/**
 * clear() — dev: drop every instance (GL type resources stay cached for re-spawn; the map
 * unload frees them via free(gl)).
 */
function clear() {
	_instances = [];
	_poseCache = {};
}

export default {
	init: init,
	free: free,
	render: render,
	spawn: spawn,
	spawnMany: spawnMany,
	clear: clear
};
