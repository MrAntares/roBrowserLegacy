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
import { poseAt, parseAnimated } from 'granny-ro-js/wasm';
import {
	packRobrowserInterleave,
	flattenPose,
	poseCacheKey,
	quantizePoseTime,
	recenterEmblem,
	gr2ActionFor,
	frustumCullClip
} from './gr2Pack.js';
import { buildWorld, computeGroundOffset } from './gr2World.js';
import { createActor, setAction, actorPose, ACTION } from './actorAction.js';
import { bankPathsFor } from './gr2Banks.js';
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

/**
 * Byte-decided per-model lighting (gr2-lighting-shadow-mars26.md §6): the client shades each GR2
 * with a fixed grayscale diffuse/ambient keyed on the model, NOT the map light. Two constant sets
 * (dispatch is exhaustive — flag vs. everything else). Values ÷255 from the client bytes; the
 * Emperium set numerically equals the Phase-0 grays but encodes a distinct byte fact, so it is
 * named on its own. Keyed on the .gr2 basename — dev-spawned instances have no entity, so the
 * basename is the only universal key.
 */
const _gr2FlagDiffuse = new Float32Array([100 / 255, 100 / 255, 100 / 255]); // 0.392
const _gr2EmpDiffuse = new Float32Array([128 / 255, 128 / 255, 128 / 255]); // 0.502
const _gr2EmpAmbient = new Float32Array([127 / 255, 127 / 255, 127 / 255]); // 0.498
const _gr2FlagAmbient = new Float32Array(3); // scratch: per-frame grayscale of the map ambient
const _gr2EmpSet = { empelium90_0: 1, kguardian90_7: 1, aguardian90_8: 1, sguardian90_9: 1, treasurebox_2: 1 };

// Lowercased .gr2 basename (no dir, no extension) — the per-model lighting key.
function gr2Basename(path) {
	const cut = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
	const dot = path.lastIndexOf('.');
	return path.slice(cut + 1, dot > cut ? dot : path.length).toLowerCase();
}

// Collapse a map-light color to one grayscale scalar (Rec.601 luma), broadcast R=G=B. Stand-in for
// the flag's runtime scene-global ambient (0xef90f4, no static byte). VISUAL-UNVERIFIED — swap to a
// flat average if the in-engine A/B wants it flatter.
function grayBroadcast(src, out) {
	const g = 0.299 * src[0] + 0.587 * src[1] + 0.114 * src[2];
	out[0] = out[1] = out[2] = g;
	return out;
}

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
const _mvp = mat4.create();
const _nmat = mat3.create();
const _lightView = new Float32Array(3);
const _clip = new Float32Array(4);

// Frustum-cull margin (NDC), padded so a model straddling the screen edge is not clipped
// by its ground anchor alone.
const CULL_MARGIN = 0.2;

// Removal-fade toggles — both OFF by default = FAITHFUL. For a genuine 3D (.gr2) actor the
// official mars26 client instantiates NEITHER the out-of-sight alpha fade NOR the death corpse
// (CCorpse) — both are 2D-sprite-only; a genuine 3D actor hard-POPS on removal (verified by RE
// on mars26; no alpha fade-in on spawn either). Our GR2 roster (guardians, Emperium, guild
// flag, treasure box) IS that 3D set, so popping is correct. Set a toggle true to A/B a
// roBrowser-parity fade over remove_delay instead (NON-authentic). Exported -> runtime-mutable:
// RO.load('Renderer/GR2/GR2ModelRenderer').FADE.death.
//   death  -> the DIE removal        vanish -> the out-of-sight removal
const FADE = { death: false, vanish: false };

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
		uAlpha: gl.getUniformLocation(_program, 'uAlpha'),
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
		textures: null,
		// External animation banks (data/model/3dmob_bone/<setId>_<suffix>.gr2) loaded
		// lazily, prioritised by the current action (see pumpBanks). The main .gr2 gives
		// the mesh + embedded standby; move/attack/dead/damage stream in on demand.
		declaredBanks: bankPathsFor(path), // [{ name, path }]
		bankQueue: bankPathsFor(path).map(b => b.name),
		bankState: {}, // name -> 'loading' | 'loaded'
		bankLoading: false
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
				try {
					const loader = new GR2Loader(buffer);
					type.parsed = loader.parsed;
					type.meshes = loader.meshes;
					recenterEmblem(type.meshes); // render-only: centre the off-baked emblem on the banner
					type.groundOffset = computeGroundOffset(type.meshes); // drop the base onto the terrain
					type.aabb = computeLocalAABB(type.meshes); // local bounds for the screen-space pick box
					type.ipRow = loader.ipRow;
					type.boneCount = loader.boneCount;
					type.duration = loader.duration;
					type.cpuReady = true;
				} catch (e) {
					console.error('[GR2ModelRenderer] decode failed', path, e);
				}
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

/**
 * computeLocalAABB(meshes) -> the model's local bind-pose axis-aligned bounds { min, max }, or
 * null if empty. Used to project a screen-space pick box (see computeScreenRect) — the GR2 path
 * suppresses the 2D sprite body, which is what normally fills entity.boundingRect.
 */
function computeLocalAABB(meshes) {
	let minX = Infinity,
		minY = Infinity,
		minZ = Infinity;
	let maxX = -Infinity,
		maxY = -Infinity,
		maxZ = -Infinity;
	for (let k = 0; k < meshes.length; k++) {
		const bind = meshes[k].bind;
		const vc = meshes[k].vcount;
		for (let i = 0; i < vc; i++) {
			const x = bind[i * 3];
			const y = bind[i * 3 + 1];
			const z = bind[i * 3 + 2];
			if (x < minX) minX = x;
			if (x > maxX) maxX = x;
			if (y < minY) minY = y;
			if (y > maxY) maxY = y;
			if (z < minZ) minZ = z;
			if (z > maxZ) maxZ = z;
		}
	}
	if (minX === Infinity) {
		return null;
	}
	return { min: [minX, minY, minZ], max: [maxX, maxY, maxZ] };
}

/**
 * computeScreenRect(aabb, mvp, out) -> project the 8 AABB corners through mvp to a screen-space
 * rect (window pixels, y-down: x1/y1 = min, x2/y2 = max), written into `out`. Returns false when
 * every corner is behind the camera. Mirrors EntityRender.calculateBoundingRect's NDC->pixel map
 * so the projected box lines up with EntityManager's mouse-space pick test.
 */
function computeScreenRect(aabb, mvp, out) {
	const min = aabb.min;
	const max = aabb.max;
	const halfW = window.innerWidth * 0.5;
	const halfH = window.innerHeight * 0.5;
	let minX = Infinity,
		minY = Infinity,
		maxX = -Infinity,
		maxY = -Infinity;
	let any = false;
	for (let i = 0; i < 8; i++) {
		const x = i & 1 ? max[0] : min[0];
		const y = i & 2 ? max[1] : min[1];
		const z = i & 4 ? max[2] : min[2];
		const cw = mvp[3] * x + mvp[7] * y + mvp[11] * z + mvp[15];
		if (cw <= 1e-6) {
			continue;
		}
		const inv = 1 / cw;
		const sx = halfW * (1 + (mvp[0] * x + mvp[4] * y + mvp[8] * z + mvp[12]) * inv);
		const sy = halfH * (1 - (mvp[1] * x + mvp[5] * y + mvp[9] * z + mvp[13]) * inv);
		if (sx < minX) minX = sx;
		if (sx > maxX) maxX = sx;
		if (sy < minY) minY = sy;
		if (sy > maxY) maxY = sy;
		any = true;
	}
	if (!any) {
		return false;
	}
	out.x1 = minX;
	out.y1 = minY;
	out.x2 = maxX;
	out.y2 = maxY;
	return true;
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
	// Opacity and env tint come from the map's own light (parity with Models.js / AnimatedModels.js
	// — the GR2 .fs math is byte-identical). uLightDiffuse / uLightAmbient are byte-decided per model
	// and set inside the instance loop below. Falls back to the Phase-0 baked grays if a map omits a
	// field (dev spawn always has light; the render early-returns without it).
	gl.uniform1f(uniform.uLightOpacity, light.opacity != null ? light.opacity : 1.0);
	gl.uniform3fv(uniform.uLightEnv, light.env || _phaseEnv);
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

			// Entity-backed instance: pull pos/dir/action from the live entity (1-frame lag —
			// this pass runs before EntityManager.render) and prioritise its bank load.
			if (inst.entity) {
				syncFromEntity(inst, type, tick);
			}

			// Frustum cull BEFORE posing — a culled instance neither poses nor draws. The anchor
			// negates the height to match buildWorld's world-Y (-position[2]).
			worldAnchorToClip(inst.pos, modelView, projection, _clip);
			if (frustumCullClip(_clip[0], _clip[1], _clip[3], CULL_MARGIN)) {
				// Off-screen: drop the stale pick box so the hover test can't match it (the entity
				// falls back to EntityRender's default box, which is off-screen anyway).
				inst.screenRect = null;
				continue;
			}

			// Build the instance world matrix once the type (its ipRow) is known. Entity
			// positions are [cellX, cellY, position[2]] where position[2] = getCellHeight (a
			// NEGATED terrain height). roBrowser's world-Y (up) is -position[2] (see the 2D sprite
			// Project(): `y = -pos.z`), so negate p[2] into buildWorld's up axis — else the
			// placement error is proportional to the terrain height (flat OK, hills sink/vanish).
			if (!inst.worldBuilt) {
				const p = inst.pos;
				// RO direction is an 8-way index (0-7); the world yaw wants degrees (45 deg/step).
				inst.world = buildWorld(inst.dir * 45, [p[0], -p[2], p[1]], type.ipRow, {
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

			// Per-model lighting constants (gr2-lighting-shadow-mars26.md §6): the client shades each
			// GR2 by a byte-decided grayscale diffuse/ambient, not the map light. Re-issued every
			// iteration because GL uniforms are stateful — a fixed-constant model must not leak its
			// diffuse/ambient onto the next instance.
			const base = gr2Basename(inst.path);
			if (base === 'guildflag90_1') {
				gl.uniform3fv(uniform.uLightDiffuse, _gr2FlagDiffuse);
				gl.uniform3fv(uniform.uLightAmbient, grayBroadcast(light.ambient || _phaseAmbient, _gr2FlagAmbient));
			} else if (_gr2EmpSet[base]) {
				gl.uniform3fv(uniform.uLightDiffuse, _gr2EmpDiffuse);
				gl.uniform3fv(uniform.uLightAmbient, _gr2EmpAmbient);
			} else {
				gl.uniform3fv(uniform.uLightDiffuse, light.diffuse || _phaseDiffuse);
				gl.uniform3fv(uniform.uLightAmbient, light.ambient || _phaseAmbient);
			}

			// Project the model AABB to a screen-space pick box for EntityManager's hover/click
			// test. Stashed on the instance (not entity.boundingRect) because Entity.render()
			// resets that rect after this map pass; EntityRender.calculateBoundingRect copies it.
			if (inst.entity && type.aabb) {
				mat4.multiply(_mvp, projection, _mv);
				const box = inst.screenRect || (inst.screenRect = { x1: 0, y1: 0, x2: 0, y2: 0 });
				if (!computeScreenRect(type.aabb, _mvp, box)) {
					inst.screenRect = null;
				}
			}

			// Removal fade: honour the entity's current alpha — effectColor[3] scaled by the
			// remove_tick ramp, the SAME fade a 2D body applies (EntityRender.renderLayer) — so a
			// GR2 mob/NPC fades out on death/vanish instead of hard-popping. Opaque instances
			// (alpha 1) stay on the no-blend fast path; only a fading instance flips blend on and
			// back off (the outer save/restore only guards the BLEND enable bit).
			let alpha = 1.0;
			const e = inst.entity;
			if (e) {
				alpha = e.effectColor[3];
				if (e.remove_tick && e.remove_delay) {
					const isDeath = e.action === e.ACTION.DIE;
					if (isDeath ? FADE.death : FADE.vanish) {
						alpha *= 1 - (Date.now() - e.remove_tick) / e.remove_delay;
					}
				}
				alpha = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
			}
			gl.uniform1f(uniform.uAlpha, alpha);
			const fading = alpha < 1;
			if (fading) {
				gl.enable(gl.BLEND);
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			}

			for (let s = 0; s < type.submeshes.length; s++) {
				const sm = type.submeshes[s];
				gl.bindTexture(gl.TEXTURE_2D, sm.tex);
				gl.bindVertexArray(sm.vao);
				gl.drawElements(gl.TRIANGLES, sm.count, gl.UNSIGNED_SHORT, 0);
			}

			if (fading) {
				gl.disable(gl.BLEND);
			}
		}
	});
	gl.bindVertexArray(null);
	if (blendWasEnabled) {
		gl.enable(gl.BLEND);
	}
	_poseCache = seen;
}

// worldAnchorToClip(pos, modelView, projection, out4): project the instance ground anchor to
// clip space for the frustum cull. Mirrors buildWorld's frame: world-X = cellX, world-Y (up) =
// -position[2] (the negated terrain height), world-Z = cellY.
function worldAnchorToClip(pos, modelView, projection, out) {
	const x = pos[0];
	const y = -pos[2];
	const z = pos[1];
	const vx = modelView[0] * x + modelView[4] * y + modelView[8] * z + modelView[12];
	const vy = modelView[1] * x + modelView[5] * y + modelView[9] * z + modelView[13];
	const vz = modelView[2] * x + modelView[6] * y + modelView[10] * z + modelView[14];
	const vw = modelView[3] * x + modelView[7] * y + modelView[11] * z + modelView[15];
	out[0] = projection[0] * vx + projection[4] * vy + projection[8] * vz + projection[12] * vw;
	out[1] = projection[1] * vx + projection[5] * vy + projection[9] * vz + projection[13] * vw;
	out[2] = projection[2] * vx + projection[6] * vy + projection[10] * vz + projection[14] * vw;
	out[3] = projection[3] * vx + projection[7] * vy + projection[11] * vz + projection[15] * vw;
}

/**
 * pumpBanks(type, priorityName): per-type sequential loader for the external animation
 * banks. The current action's bank (priorityName) jumps to the front of the queue; one bank
 * is fetched at a time and grafted into the shared type.parsed.animations at its action slot
 * (loaded once for every instance of that type). A 404 drops the name (stays bind pose).
 */
function pumpBanks(type, priorityName) {
	const queue = type.bankQueue;

	// Re-prioritise: the current action's bank jumps the queue ("change la priorité au besoin").
	if (priorityName) {
		const at = queue.indexOf(priorityName);
		if (at > 0) {
			queue.splice(at, 1);
			queue.unshift(priorityName);
		}
	}

	if (type.bankLoading || queue.length === 0) {
		return;
	}

	const name = queue.shift();
	const entry = type.declaredBanks.find(b => b.name === name);
	if (!entry) {
		return;
	}
	type.bankLoading = true;
	type.bankState[name] = 'loading';
	Client.getFile(
		entry.path,
		function (buffer) {
			type.bankLoading = false;
			// The type may have been freed during the async fetch.
			if (_types[type.path] === type && type.parsed) {
				const bank = parseAnimated(new Uint8Array(buffer));
				type.parsed.animations[ACTION[name].idx] = bank.animations[0];
				type.bankState[name] = 'loaded';
			}
			pumpBanks(type);
		},
		function () {
			type.bankLoading = false;
			delete type.bankState[name];
			pumpBanks(type);
		}
	);
}

// syncFromEntity(inst, type, tick): pull the live entity's pos/dir/action onto the instance
// each frame. NPC instances (standbyIdx < 0) are never action-driven (static bind pose); MOB
// instances map their action enum to a GR2 action and priority-load that bank.
function syncFromEntity(inst, type, tick) {
	const e = inst.entity;
	const p = e.position;
	const dir = e.direction;
	if (inst.pos[0] !== p[0] || inst.pos[1] !== p[1] || inst.pos[2] !== p[2] || inst.dir !== dir) {
		inst.pos[0] = p[0];
		inst.pos[1] = p[1];
		inst.pos[2] = p[2];
		inst.dir = dir;
		inst.worldBuilt = false;
	}

	if (inst.standbyIdx < 0) {
		return;
	}

	const name = gr2ActionFor(e);
	pumpBanks(type, name);
	// Re-cut on a name change OR a re-issued action with the same name. The client restarts the
	// clip on every ZC_NOTIFY_ACT (SetAction = hard clock reset, no same-action dedup); a name-only
	// guard latched one-shot actions — an immobile plant re-hit stays entity.action=HURT, so the
	// hurt clip plays once and never replays. The entity bumps animation.tick on every setAction()
	// (EntityAction), so a changed tick is the faithful "re-issued this frame" signal.
	const animTick = e.animation.tick;
	if (name !== inst._lastAction || animTick !== inst._lastTick) {
		setAction(inst.actor, name, tick);
		inst.actor.loop = name === 'move';
		inst._lastAction = name;
		inst._lastTick = animTick;
	}
}

/**
 * attach(entity): create a GR2 instance bound to a mob/NPC entity. standbyIdx is classified
 * by objecttype — NPC -> -1 (static poseAt(-1); SetAction never fires) vs MOB -> 0 (animated
 * idx-0 standby). The renderer pulls pos/dir/action from the entity each frame (syncFromEntity).
 */
function attach(entity) {
	acquire(entity.gr2);
	const p = entity.position;
	const isNpc = entity.objecttype === entity.constructor.TYPE_NPC;
	const inst = {
		entity: entity,
		path: entity.gr2,
		world: null,
		worldBuilt: false,
		actor: createActor(),
		dir: entity.direction,
		pos: [p[0], p[1], p[2]],
		standbyIdx: isNpc ? -1 : 0,
		animIndex: 0,
		t: 0,
		_lastAction: 'stand',
		_lastTick: 0,
		screenRect: null
	};
	_instances.push(inst);
	return inst;
}

/**
 * detach(inst): drop an entity's GR2 instance (called from EntityManager on removal). The type
 * GL resources stay cached until map unload (free); the type set is bounded, so no leak.
 */
function detach(inst) {
	const idx = _instances.indexOf(inst);
	if (idx !== -1) {
		_instances.splice(idx, 1);
	}
	const type = _types[inst.path];
	if (type && type.refcount > 0) {
		type.refcount--;
	}
	inst.entity = null;
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
	attach: attach,
	detach: detach,
	spawn: spawn,
	spawnMany: spawnMany,
	clear: clear,
	FADE: FADE
};
