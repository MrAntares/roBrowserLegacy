import Client from 'Core/Client.js';
import FileManager from 'Core/FileManager.js';
import DB from 'DB/DBManager.js';
import WebGL from 'Utils/WebGL.js';
import _vertexShader from './NavigationFootstep.vs?raw';
import _fragmentShader from './NavigationFootstep.fs?raw';

let _program;
let _buffer;
let _texture = null;
let _textureRequested = false;
let _textureRequestToken = 0;
let _useTexture = false;
let _gl = null;
let _selectedRoadIcon = 1;
let _loadedRoadIcon = 0;

const FALLBACK_FOOTSTEP_TEXTURES = [
	'data/texture/effect/footprint.bmp',
	'data/texture/effect/footprint.tga',
	'data/texture/effect/footprint_01.bmp',
	'data/texture/effect/footprint_01.tga',
	'data/texture/effect/footprint01.bmp',
	'data/texture/effect/footprint01.tga',
	'data/texture/effect/navi_footprint.bmp',
	'data/texture/effect/navi_footprint.tga',
	'data/texture/effect/navigation_footprint.bmp',
	'data/texture/effect/navigation_footprint.tga',
	'data/texture/effect/navi_arrow.bmp',
	'data/texture/effect/navi_arrow.tga',
	'data/texture/effect/navigation_arrow.bmp',
	'data/texture/effect/navigation_arrow.tga'
];

function normalizePath(path) {
	return String(path || '')
		.replace(/\\/g, '/')
		.replace(/^\/+/, '');
}

function uniqueList(list) {
	const seen = {};
	const out = [];
	for (let i = 0; i < list.length; i++) {
		const item = normalizePath(list[i]);
		if (!item || seen[item]) {
			continue;
		}
		seen[item] = true;
		out.push(item);
	}
	return out;
}

function findOfficialFootstepTextures() {
	const iconIndex = Math.max(1, Math.min(8, Number(_selectedRoadIcon) || 1));
	let navMatches = [];
	let effectMatches = [];

	const preferred = [];
	for (let i = 0; i < 8; i++) {
		preferred.push(DB.INTERFACE_PATH + 'navigation_interface3/navi_grid' + iconIndex + '_' + i + '.tga');
	}

	try {
		navMatches =
			FileManager.search(
				new RegExp(
					'data[\\\\/]texture[\\\\/].*[\\\\/]navigation_interface3[\\\\/]navi_grid' +
						iconIndex +
						'_[0-7]\\\\.(bmp|tga|png)$',
					'i'
				)
			) || [];
	} catch (_e) {
		navMatches = [];
	}

	try {
		effectMatches =
			FileManager.search(
				/data[\\/]texture[\\/]effect[\\/].*(foot|footprint|navi|navigation|arrow).*\.(bmp|tga|png)$/i
			) || [];
	} catch (_e) {
		effectMatches = [];
	}

	const matches = navMatches.map(normalizePath).sort((a, b) => a.localeCompare(b));

	return uniqueList(preferred.concat(matches, FALLBACK_FOOTSTEP_TEXTURES));
}

function requestOfficialFootstepTexture(gl) {
	if (!gl) {
		return;
	}

	const iconIndex = Math.max(1, Math.min(8, Number(_selectedRoadIcon) || 1));
	if (_textureRequested && _loadedRoadIcon === iconIndex) {
		return;
	}

	_textureRequested = true;
	_loadedRoadIcon = iconIndex;
	const token = ++_textureRequestToken;

	const candidates = findOfficialFootstepTextures();
	let index = 0;

	const tryNext = () => {
		if (token !== _textureRequestToken) {
			return;
		}

		if (index >= candidates.length) {
			_useTexture = false;
			return;
		}

		const path = candidates[index++];
		Client.loadFile(
			path,
			buffer => {
				if (token !== _textureRequestToken) {
					return;
				}

				if (!buffer) {
					tryNext();
					return;
				}

				WebGL.texture(gl, buffer, texture => {
					if (token !== _textureRequestToken) {
						if (texture) {
							gl.deleteTexture(texture);
						}
						return;
					}

					if (!texture) {
						tryNext();
						return;
					}

					if (_texture) {
						gl.deleteTexture(_texture);
					}

					_texture = texture;
					_useTexture = true;
				});
			},
			tryNext
		);
	};

	tryNext();
}

/**
 * Navigation floor marker.
 * It tries to use the official footprint/arrow texture from the loaded GRF.
 * If the GRF has no matching resource, it falls back to the procedural yellow
 * arrow so navigation still works on custom or stripped clients.
 */
class NavigationFootstep {
	constructor(position, angle, index, alpha) {
		this.position = position;
		this.angle = angle || 0;
		this.index = index || 0;
		this.alpha = alpha == null ? 0.95 : alpha;
		this.size = 0.7;
	}

	init() {
		this.ready = true;
	}

	free() {
		this.ready = false;
	}

	render(gl, tick) {
		if (!_program || !_buffer) {
			return;
		}

		const uniform = _program.uniform;
		gl.uniform3fv(uniform.uPosition, this.position);
		gl.uniform1f(uniform.uSize, this.size);
		gl.uniform1f(uniform.uAngle, this.angle);
		gl.uniform1f(uniform.uAlpha, this.alpha);
		gl.uniform1f(uniform.uTick, tick || 0);
		gl.uniform1f(uniform.uIndex, this.index);

		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}

	static init(gl) {
		_gl = gl;
		_program = WebGL.createShaderProgram(gl, _vertexShader, _fragmentShader);
		_buffer = gl.createBuffer();

		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([-1.0, -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0]),
			gl.STATIC_DRAW
		);

		requestOfficialFootstepTexture(gl);
		NavigationFootstep.ready = true;
	}

	static free(gl) {
		if (_texture) {
			gl.deleteTexture(_texture);
			_texture = null;
		}
		_useTexture = false;
		_textureRequested = false;
		_textureRequestToken++;
		_gl = null;

		if (_program) {
			gl.deleteProgram(_program);
			_program = null;
		}

		if (_buffer) {
			gl.deleteBuffer(_buffer);
			_buffer = null;
		}

		NavigationFootstep.ready = false;
	}

	static setRoadIcon(index) {
		index = Math.max(1, Math.min(8, Number(index) || 1));
		if (_selectedRoadIcon === index && _useTexture && _texture) {
			return;
		}

		_selectedRoadIcon = index;
		_textureRequested = false;
		_textureRequestToken++;
		_useTexture = false;

		if (_gl) {
			requestOfficialFootstepTexture(_gl);
		}
	}

	static beforeRender(gl, modelView, projection, fog, tick) {
		const uniform = _program.uniform;
		const attribute = _program.attribute;

		gl.useProgram(_program);
		gl.depthMask(false);
		gl.uniformMatrix4fv(uniform.uModelViewMat, false, modelView);
		gl.uniformMatrix4fv(uniform.uProjectionMat, false, projection);
		gl.uniform4fv(uniform.uColor, NavigationFootstep.color);
		gl.uniform1f(uniform.uUseTexture, _useTexture && _texture ? 1.0 : 0.0);

		if (_useTexture && _texture) {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, _texture);
			gl.uniform1i(uniform.uDiffuse, 0);
		}

		gl.enableVertexAttribArray(attribute.aPosition);
		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
		gl.vertexAttribPointer(attribute.aPosition, 2, gl.FLOAT, false, 2 * 4, 0);
	}

	static afterRender(gl) {
		gl.depthMask(true);
		gl.disableVertexAttribArray(_program.attribute.aPosition);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	}
}

NavigationFootstep.usesTexture = function usesTexture() {
	return !!(_useTexture && _texture);
};

NavigationFootstep.color = new Float32Array([1.0, 0.86, 0.1, 1.0]);
NavigationFootstep.renderBeforeEntities = true;

export default NavigationFootstep;
