/**
 * Renderer/Effects/StrEffect.js
 *
 * Rendering Str File object
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import _vertexShader from './StrEffect.vs?raw';
import _fragmentShader from './StrEffect.fs?raw';
import WebGL from 'Utils/WebGL.js';
import Client from 'Core/Client.js';

/**
 * Look up table D3DX => OPENGL
 */
const D3DBLEND = {};

/**
 * @var {WebGLProgram}
 */
let _program = null;

/**
 * @var {WebGLBuffer}
 */
let _buffer = null;

/**
 * @var {Float32Array} scratchpad for sprite offset
 */
const _spriteOffset = new Float32Array(2);

/**
 * @var {Float32Array} scratchpad for corner X positions
 */
const _cornerX = new Float32Array(4);

/**
 * @var {Float32Array} scratchpad for corner Y positions
 */
const _cornerY = new Float32Array(4);

/**
 * @var {mat4} model view of the frame being drawn, to aim effects at a target
 */
let _modelView = null;

/**
 * Centre of the art in kRO's newer STR files, which are laid out on a
 * 640x480 canvas. An aimed effect turns about this point.
 */
const AIM_PIVOT_X = 320;

/**
 * Turn a frame's four corners as StrEffect.vs would (by the frame's own angle),
 * then mirror them, turn them by the aim and tilt them, in place. The shader
 * then draws them with no turn of its own.
 *
 * Corners are in STR pixels, y down the screen. Angles in degrees: `angle` is
 * the frame's, `aim` the effect's counter-clockwise turn, `tilt` a turn about
 * the screen's x axis (it shortens y by cos(tilt)).
 *
 * @param {number} angle
 * @param {number} aim
 * @param {boolean} flipX
 * @param {boolean} flipY
 * @param {number} tilt
 * @param {Float32Array|Array<number>} cornerX
 * @param {Float32Array|Array<number>} cornerY
 */
function transformCorners(angle, aim, flipX, flipY, tilt, cornerX, cornerY) {
	const r1 = (-angle / 180) * Math.PI;
	const c1 = Math.cos(r1);
	const s1 = Math.sin(r1);
	const r2 = (aim / 180) * Math.PI;
	const c2 = Math.cos(r2);
	const s2 = Math.sin(r2);
	const squash = tilt ? Math.cos((tilt / 180) * Math.PI) : 1;
	for (let i = 0; i < 4; i++) {
		// The shader's space: y up
		const px = cornerX[i];
		const py = -cornerY[i];
		let x = px * c1 - py * s1;
		let y = px * s1 + py * c1;
		if (flipX) {
			x = -x;
		}
		if (flipY) {
			y = -y;
		}
		const tx = x * c2 - y * s2;
		const ty = (x * s2 + y * c2) * squash;
		cornerX[i] = tx;
		cornerY[i] = -ty;
	}
}
const AIM_PIVOT_Y = 240;

// Pixel to world conversion for attachment offsets
const PIXEL_TO_WORLD_Z = 1.0 / 5.0;

const anim = {
	frame: 0,
	type: 0,
	aniframe: 0,
	anitype: 0,
	srcalpha: 1,
	destalpha: 1,
	mtpreset: 0,
	delay: 0.0,
	angle: 0.0,
	color: new Float32Array(4),
	pos: new Float32Array(2),
	uv: new Float32Array(8),
	xy: new Float32Array(8)
};

// Helper to copy animation state for caching
function copyAnim(src) {
	return {
		type: src.type,
		aniframe: src.aniframe,
		anitype: src.anitype,
		srcalpha: src.srcalpha,
		destalpha: src.destalpha,
		mtpreset: src.mtpreset,
		delay: src.delay,
		angle: src.angle,
		color: new Float32Array(src.color),
		pos: new Float32Array(src.pos),
		uv: new Float32Array(src.uv),
		xy: new Float32Array(src.xy)
	};
}

/**
 * Calculate effect animation base on the keyframe structure.
 *
 * @param {STRLayer} layer
 * @param {number} key index
 * @param {object} animation structure
 */
function calculateAnimation(layer, keyIndex, result) {
	let lastFrame = 0;
	let lastSource = 0;
	let fromId = -1,
		toId = -1;

	const animations = layer.animations;

	// Animations are sorted by the loader
	for (let i = 0; i < layer.anikeynum; ++i) {
		if (animations[i].frame <= keyIndex) {
			if (animations[i].type === 0) {
				fromId = i;
			}
			if (animations[i].type === 1) {
				toId = i;
			}
		}
		lastFrame = Math.max(lastFrame, animations[i].frame);

		if (animations[i].type === 0) {
			lastSource = Math.max(lastSource, animations[i].frame);
		}
	}

	// Nothing to render
	if (fromId < 0 || (toId < 0 && lastFrame < keyIndex)) {
		return false;
	}

	const from = animations[fromId];
	const to = animations[toId];
	const delta = keyIndex - from.frame;
	result.srcalpha = from.srcalpha;
	result.destalpha = from.destalpha;

	// Static frame (or frame that can't be updated)
	if (toId !== fromId + 1 || to.frame !== from.frame) {
		// No other source
		if (to && lastSource <= from.frame) {
			return false;
		}

		result.angle = from.angle;
		result.aniframe = from.aniframe;

		result.color.set(from.color);
		result.pos.set(from.pos);
		result.uv.set(from.uv);
		result.xy.set(from.xy);

		return true;
	}

	// Morph animation
	result.color[0] = from.color[0] + to.color[0] * delta;
	result.color[1] = from.color[1] + to.color[1] * delta;
	result.color[2] = from.color[2] + to.color[2] * delta;
	result.color[3] = from.color[3] + to.color[3] * delta;

	result.uv[0] = from.uv[0] + to.uv[0] * delta;
	result.uv[1] = from.uv[1] + to.uv[1] * delta;
	result.uv[2] = from.uv[2] + to.uv[2] * delta;
	result.uv[3] = from.uv[3] + to.uv[3] * delta;
	result.uv[4] = from.uv[4] + to.uv[4] * delta;
	result.uv[5] = from.uv[5] + to.uv[5] * delta;
	result.uv[6] = from.uv[6] + to.uv[6] * delta;
	result.uv[7] = from.uv[7] + to.uv[7] * delta;

	result.xy[0] = from.xy[0] + to.xy[0] * delta;
	result.xy[1] = from.xy[1] + to.xy[1] * delta;
	result.xy[2] = from.xy[2] + to.xy[2] * delta;
	result.xy[3] = from.xy[3] + to.xy[3] * delta;
	result.xy[4] = from.xy[4] + to.xy[4] * delta;
	result.xy[5] = from.xy[5] + to.xy[5] * delta;
	result.xy[6] = from.xy[6] + to.xy[6] * delta;
	result.xy[7] = from.xy[7] + to.xy[7] * delta;

	result.angle = from.angle + to.angle * delta;
	result.pos[0] = from.pos[0] + to.pos[0] * delta;
	result.pos[1] = from.pos[1] + to.pos[1] * delta;

	switch (to.anitype) {
		default: // bug fix
			result.aniframe = 0;
			break;

		case 1: // normal
			result.aniframe = from.aniframe + to.aniframe * delta;
			break;

		case 2: // Stop at end
			result.aniframe = Math.min(from.aniframe + to.delay * delta, layer.texcnt - 1);
			break;

		case 3: // Repeat
			result.aniframe = (from.aniframe + to.delay * delta) % layer.texcnt;
			break;

		case 4: // play reverse infinitly
			result.aniframe = (from.aniframe - to.delay * delta) % layer.texcnt;
			break;
	}

	return true;
}

/**
 * StrEffect constructor
 *
 * @param {string} str effect file
 * @param {Array} effect position
 * @param {string} start tick
 * @param {string} texturePath
 * @param {Array<{filename: string, texturePath: string}>} fallbacks - tried in order when the file is missing
 */
class StrEffect {
	constructor(filename, position, startTick, texturePath, fallbacks = []) {
		this.filename = filename;
		this.startTick = startTick;
		this.position = position;
		this.texturePath = texturePath;
		this.fallbacks = fallbacks.slice();
		this.load();
	}

	/**
	 * Load the file. Clients keep the same art under different folders from one
	 * release to the next, so a missing file moves on to the next candidate;
	 * when none is left the effect is removed.
	 */
	load() {
		Client.loadFile(
			this.filename,
			null,
			() => {
				const next = this.fallbacks.shift();
				if (!next) {
					this.needCleanUp = true;
					return;
				}
				this.filename = next.filename;
				this.texturePath = next.texturePath;
				this.load();
			},
			{ texturePath: this.texturePath }
		);
	}

	/**
	 * Preparing for render
	 *
	 * @param {object} webgl context
	 */
	init(gl) {
		this.ready = true;
	}

	/**
	 * Destroying data
	 *
	 * @param {object} webgl context
	 */
	free(gl) {
		this.ready = false;
	}

	/**
	 * Render in 3D effect
	 *
	 * @param {object} gl
	 * @param {number} tick
	 */
	render(gl, tick) {
		let layer;
		let i, keyIndex;

		// Follow entity position for attachments
		if (this.ownerEntity && this.ownerEntity.position) {
			this.position = this.ownerEntity.position;
			this.ownerDirection = this.ownerEntity.direction;
			if (this._Params && this._Params.Inst) {
				this._Params.Inst.position = this.position;
			}
		}

		const strFile = Client.loadFile(this.filename, null, null, { texturePath: this.texturePath });

		// Not loaded yet
		if (strFile === null) {
			return;
		}

		// Aimed at the other entity, and/or turned a fixed amount (screenTurn,
		// degrees clockwise on screen, as the client turns some EZ2 copies)
		const aim = this.getAimAngle();
		// Both reach below the feet on screen: drawn over the ground (renderAnimation)
		this.aimed = !!aim || !!this.screenTurn;
		this.aimAngle = aim - (this.screenTurn || 0);

		keyIndex = ((tick - this.startTick) / 1000) * strFile.fps;

		// Loop persistent effects
		if (this.persistent && strFile && strFile.maxKey) {
			keyIndex = keyIndex % strFile.maxKey;
		}

		// Cache for blank frame handling in hat effects
		if (!this._lastValidAnim) {
			this._lastValidAnim = {};
		}

		let anyFreshFrame = false;

		for (i = 0; i < strFile.layernum; i++) {
			layer = strFile.layers[i];

			if (layer.materials.length) {
				if (calculateAnimation(layer, keyIndex, anim)) {
					if (layer.materials[anim.aniframe | 0]) {
						this.renderAnimation(gl, layer.materials[anim.aniframe | 0], anim);
						anyFreshFrame = true;
						// Cache for hat effect blank frame handling
						if (this.persistent && this.ownerEntity) {
							this._lastValidAnim[i] = {
								anim: copyAnim(anim),
								material: layer.materials[anim.aniframe | 0]
							};
						}
					}
				} else if (this.persistent && this.ownerEntity && this._lastValidAnim[i]) {
					// Use cached frame for blank frames in hat effects
					this.renderAnimation(gl, this._lastValidAnim[i].material, this._lastValidAnim[i].anim);
				}
			}
		}

		// Reset hat effect animation when in blank region to avoid gaps
		if (this.persistent && this.ownerEntity && !anyFreshFrame && strFile.maxKey > 0) {
			this.startTick = tick;
			this._lastValidAnim = {};
		}

		// animation ended
		if (keyIndex >= strFile.maxKey) {
			this.needCleanUp = true;
		}
	}

	/**
	 * How far to turn an effect aimed between two entities, so it lines up
	 * with them on screen.
	 *
	 * `facing` is where the other entity sits in the file, in degrees (0 =
	 * right, 180 = left): the target for an effect on the caster, the caster
	 * for one on the target.
	 *
	 * @return {number} counter-clockwise turn in degrees, 0 when not aimed
	 */
	getAimAngle() {
		const effect = this._Params?.effect;
		const target = this._Params?.Inst?.otherPosition;
		if (!effect?.rotateToTarget || !target || !this.position || !_modelView) {
			return 0;
		}

		// World offset in the shader's axes (x, -z, y), then into view space
		const x = target[0] - this.position[0];
		const y = -(target[2] - this.position[2]);
		const z = target[1] - this.position[1];
		const m = _modelView;
		const viewX = m[0] * x + m[4] * y + m[8] * z;
		const viewY = m[1] * x + m[5] * y + m[9] * z;

		if (!viewX && !viewY) {
			return 0;
		}

		return (Math.atan2(viewY, viewX) * 180) / Math.PI - (effect.facing || 0);
	}

	/**
	 * Where a frame's art sits about the effect's position.
	 *
	 * Classic effects put the art's (320,320) on the position, half a cell
	 * lower. An effect from the client's EZ2 table (one with xOffset/yOffset)
	 * puts the art's centre (320,240) on the position moved PosX/PosY client
	 * units along the screen, as CEZ2STREffectEx does: 5 client units to a
	 * cell, 35 STR pixels to a cell.
	 *
	 * @param {object} animat - frame
	 * @param {number} sizeScale - owner's size, for attachments
	 * @param {Float32Array|Array<number>} out - gets the offset in STR pixels
	 * @returns {number} vertical base, in cells
	 */
	layout(animat, sizeScale, out) {
		const ez2 = !this.ownerEntity && this.ez2Offset;
		const pivotY = ez2 ? AIM_PIVOT_Y : 320;
		const shiftX = ez2 ? this.ez2Offset[0] * PIXEL_TO_WORLD_Z * 35 : 0;
		const shiftY = ez2 ? this.ez2Offset[1] * PIXEL_TO_WORLD_Z * 35 : 0;
		const verticalBase = ez2 ? 0.0 : 0.5;
		// Drawn larger or smaller about the art's anchor (the client's STR scale)
		const k = this.scale || 1;

		if (this.ownerEntity) {
			// Attachment: center at (320,320), apply offsets, scale with entity
			out[0] = (animat.pos[0] - 320) * k + (this.xOffset || 0) * PIXEL_TO_WORLD_Z * 35 * sizeScale;
			// flip Y offset only
			out[1] = (animat.pos[1] - 320) * k - (this.yOffset || 0) * PIXEL_TO_WORLD_Z * 35 * sizeScale;
			return 0.0;
		}

		if (this.aimAngle || this.flipX || this.flipY || this.tilt) {
			// Turn the layout about the art's anchor ((320,240) for EZ2 art, (320,320)
			// for classic art, as above); STR y points down the screen.
			// As the client does: mirrored first, then turned, then tilted (its
			// tilt is a turn about the screen's x axis, which shortens y).
			const rad = ((this.aimAngle || 0) / 180) * Math.PI;
			const cos = Math.cos(rad);
			const sin = Math.sin(rad);
			const x = (animat.pos[0] - AIM_PIVOT_X) * k * (this.flipX ? -1 : 1);
			const y = (pivotY - animat.pos[1]) * k * (this.flipY ? -1 : 1);
			const squash = this.tilt ? Math.cos((this.tilt / 180) * Math.PI) : 1;
			out[0] = x * cos - y * sin + shiftX;
			out[1] = -(x * sin + y * cos) * squash - shiftY;
			return verticalBase;
		}

		out[0] = (animat.pos[0] - 320) * k + shiftX;
		out[1] = (animat.pos[1] - pivotY) * k - shiftY;
		return verticalBase;
	}

	/**
	 * Setup geometries, send data to GPU
	 *
	 * @param {object} webgl context
	 * @param {glTexture} webgl texture
	 * @param {StrAnimation} animation object
	 */
	renderAnimation(gl, material, animat) {
		const uniform = _program.uniform;

		// Hat effects: Scale with entity size
		let sizeScale = 1.0;
		if (this.ownerEntity) {
			sizeScale = (this.ownerEntity.xSize + this.ownerEntity.ySize) / 2 / 5;
		}
		const cornerScale = sizeScale * (this.scale || 1);

		// TRIANGLE_STRIP: v0=(xy0,xy4) v1=(xy1,xy5) v2=(xy3,xy7) v3=(xy2,xy6)
		_cornerX[0] = animat.xy[0] * cornerScale;
		_cornerY[0] = animat.xy[4] * cornerScale;
		_cornerX[1] = animat.xy[1] * cornerScale;
		_cornerY[1] = animat.xy[5] * cornerScale;
		_cornerX[2] = animat.xy[3] * cornerScale;
		_cornerY[2] = animat.xy[7] * cornerScale;
		_cornerX[3] = animat.xy[2] * cornerScale;
		_cornerY[3] = animat.xy[6] * cornerScale;
		// Mirrored or tilted: the corners are turned here, as the shader would,
		// so the mirror and tilt can go between the frame's own turn and the aim.
		let spriteAngle = animat.angle - (this.aimAngle || 0);
		if (this.flipX || this.flipY || this.tilt) {
			transformCorners(animat.angle, this.aimAngle || 0, this.flipX, this.flipY, this.tilt, _cornerX, _cornerY);
			spriteAngle = 0;
		}
		gl.uniform4fv(uniform.uCornerX, _cornerX);
		gl.uniform4fv(uniform.uCornerY, _cornerY);

		const verticalBase = this.layout(animat, sizeScale, _spriteOffset);

		// Send effect parameters
		gl.uniform4fv(uniform.uSpriteColor, animat.color);
		gl.uniform2fv(uniform.uSpriteOffset, _spriteOffset);
		gl.uniform1f(uniform.uVerticalBase, verticalBase);
		gl.uniform3fv(uniform.uSpritePosition, this.position);
		gl.uniform1f(uniform.uSpriteAngle, spriteAngle);

		// Send texture and data
		gl.blendFunc(D3DBLEND[animat.srcalpha], D3DBLEND[animat.destalpha]);
		gl.bindTexture(gl.TEXTURE_2D, material);

		// An aimed effect stands at one entity and reaches the other. Turned
		// towards the camera, it runs through the ground and the other entity
		// in front of where it stands, which would hide part of it.
		if (this.aimed) {
			gl.disable(gl.DEPTH_TEST);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
			gl.enable(gl.DEPTH_TEST);
		} else {
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		}
	}

	/**
	 * Initialize StrEffect
	 *
	 * @param {object} gl context
	 */
	static init(gl) {
		if (!_buffer) {
			_buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0]), gl.STATIC_DRAW);
		}

		if (!_program) {
			_program = WebGL.createShaderProgram(gl, _vertexShader, _fragmentShader);
		}

		D3DBLEND[1] = gl.ZERO;
		D3DBLEND[2] = gl.ONE;
		D3DBLEND[3] = gl.SRC_COLOR;
		D3DBLEND[4] = gl.ONE_MINUS_SRC_COLOR;
		D3DBLEND[5] = gl.SRC_ALPHA;
		D3DBLEND[6] = gl.ONE_MINUS_SRC_ALPHA;
		D3DBLEND[7] = gl.DST_ALPHA;
		D3DBLEND[8] = gl.ONE_MINUS_DST_ALPHA;
		D3DBLEND[9] = gl.DST_COLOR;
		D3DBLEND[10] = gl.ONE_MINUS_DST_COLOR;
		D3DBLEND[11] = gl.SRC_ALPHA_SATURATE;
		D3DBLEND[14] = gl.CONSTANT_COLOR;
		D3DBLEND[15] = gl.ONE_MINUS_CONSTANT_ALPHA;

		this.ready = true;
	}

	/**
	 * Destroy Effect
	 *
	 * @param {object} webgl context
	 */
	static free(gl) {
		if (_program) {
			gl.deleteProgram(_program);
			_program = null;
		}

		if (_buffer) {
			gl.deleteBuffer(_buffer);
			_buffer = null;
		}

		this.ready = false;
	}

	/**
	 * Bind context
	 *
	 * @param {object} gl context
	 * @param {mat4} modelview
	 * @param {mat4} projection
	 * @param {object} fog structure
	 * @param {number} tick
	 */
	static beforeRender(gl, modelView, projection, fog, tick) {
		const uniform = _program.uniform;
		const attribute = _program.attribute;

		_modelView = modelView;

		gl.depthMask(false);
		gl.useProgram(_program);
		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
		gl.vertexAttribPointer(attribute.aPosition, 2, gl.FLOAT, false, 0, 0);

		gl.uniformMatrix4fv(uniform.uModelViewMat, false, modelView);
		gl.uniformMatrix4fv(uniform.uProjectionMat, false, projection);

		// Fog settings
		gl.uniform1f(uniform.uFogNear, fog.near * 100);
		gl.uniform1f(uniform.uFogFar, fog.far * 150);
		gl.uniform3fv(uniform.uFogColor, fog.color);

		// Textures
		gl.uniform1i(uniform.uDiffuse, 0);

		// Enable all attributes
		gl.enableVertexAttribArray(attribute.aPosition);

		gl.activeTexture(gl.TEXTURE0);
	}

	/**
	 * Unbind 3D Context
	 *
	 * @param {object} gl context
	 */
	static afterRender(gl) {
		gl.depthMask(true);

		gl.disableVertexAttribArray(_program.attribute.aPosition);

		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	}
}
/**
 * Export
 */
export default StrEffect;
