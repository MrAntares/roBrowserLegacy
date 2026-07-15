/**
 * UI/Components/GrannyModelViewer/GrannyModelViewer.js
 *
 * Granny3D Model Viewer (gr2 file)
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 * @author Liam Mitchell
 */

import glMatrix from 'Utils/gl-matrix.js';
import Configs from 'Core/Configs.js';
import Client from 'Core/Client.js';
import GR2Loader from 'Loaders/GR2Loader.js';
import GR2ViewerRenderer from 'Renderer/GR2/GR2ViewerRenderer.js';
import Renderer from 'Renderer/Renderer.js';
import Camera from 'Renderer/Camera.js';
import GUIComponent from 'UI/GUIComponent.js';
import htmlText from './GrannyModelViewer.html?raw';
import cssText from './GrannyModelViewer.css?raw';

/**
 * Load dependencies
 */
const mat4 = glMatrix.mat4;

/**
 * @var {object} fog structure (disabled — the viewer shows the bare model)
 */
const _fog = {
	use: false,
	exist: true,
	far: 30,
	near: 180,
	factor: 1.0,
	color: new Float32Array([1, 1, 1])
};

/**
 * @var {object} light structure. Directional grey key light + grey ambient floor so the model
 * reads with depth (not flat fullbright); env untinted. Matches the GR2Model.fs grayscale path.
 */
const _light = {
	opacity: 1.0,
	ambient: new Float32Array([0.5, 0.5, 0.5]),
	diffuse: new Float32Array([0.7, 0.7, 0.7]),
	direction: new Float32Array([0, 1, 0]),
	env: new Float32Array([1, 1, 1])
};

/**
 * @var {mat4} orbit view matrix
 */
const _view = new Float32Array(4 * 4);

/**
 * @var {boolean} whether a model is decoded and ready to render
 */
let _hasModel = false;

/**
 * Camera framing derived from the current model's bounds.
 */
let _target = [0, 0, 0];
let _distance = 10;

/**
 * Create GrannyModelViewer component
 */
const Viewer = new GUIComponent('GrannyModelViewer', cssText);

Viewer.render = () => htmlText;

/**
 * Initialize Component
 */
Viewer.init = function init() {
	// Initialize WebGL
	Renderer.init({
		alpha: true,
		depth: true,
		stencil: false,
		antialias: true,
		premultipliedAlpha: false
	});

	Renderer.show();

	const root = this.getRoot();

	if (!Configs.get('API')) {
		initDropDown(root.querySelector('select'));
	} else {
		const hash = decodeURIComponent(location.hash);
		location.hash = hash;
		loadModel(hash.substr(1));
	}
};

/**
 * Once append to body, set body styles
 */
Viewer.onAppend = function onAppend() {
	document.body.style.backgroundColor = '#45484d';
	document.body.style.fontFamily = 'Arial';
	document.body.style.fontSize = '12px';
	document.body.style.margin = '0';
	document.body.style.overflow = 'hidden';
};

/**
 * Initialise Drop Down list
 *
 * @param {HTMLElement} select dropdown
 */
function initDropDown(select) {
	Client.search(/data\\[^\0]+\.gr2/gi, list => {
		list.sort();

		for (let i = 0, count = list.length; i < count; ++i) {
			list[i] = list[i].replace(/\\/g, '/');
			select.add(new Option(list[i], list[i]), null);
		}

		select.onchange = function () {
			loadModel((location.hash = this.value));
		};

		const hash = decodeURIComponent(location.hash);
		location.hash = hash;

		if (hash.indexOf('.gr2') !== -1) {
			loadModel(hash.substr(1));
			select.value = hash.substr(1);
		} else if (select.value) {
			loadModel(select.value);
		}

		const root = Viewer.getRoot();
		root.querySelector('.head').style.display = 'block';
		select.focus();
	});
}

/**
 * Stop rendering and drop the current model's GL resources.
 */
function stop() {
	const gl = Renderer.getContext();

	Renderer.stop();
	_hasModel = false;
	if (gl) {
		GR2ViewerRenderer.free(gl);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}
}

/**
 * Frame the orbit camera on the model's world-space bounds.
 *
 * @param {object} bounds { center:[x,y,z], radius }
 */
function frameCamera(bounds) {
	_target = bounds.center;
	// Pull back far enough to fit the bounding sphere in view, with headroom.
	_distance = Math.max(bounds.radius * 2.6, 1);
}

/**
 * Start loading a model.
 *
 * @param {string} filename
 */
function loadModel(filename) {
	stop();

	if (!filename) {
		return;
	}

	Client.getFile(filename, buf => {
		// granny-ro-js decodes texture pixels via WASM; make sure it is initialised first.
		GR2Loader.ready().then(() => {
			let loader;
			try {
				loader = new GR2Loader(buf);
			} catch (e) {
				console.error('[GrannyModelViewer] failed to decode', filename, e);
				return;
			}

			const gl = Renderer.getContext();
			GR2ViewerRenderer.init(gl, loader);
			frameCamera(GR2ViewerRenderer.getBounds());
			_hasModel = true;

			Renderer.render(render);
		});
	});
}

/**
 * Rendering scene
 *
 * @param {number} tick
 * @param {object} gl webgl context
 */
function render(tick, gl) {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	if (!_hasModel) {
		return;
	}

	// Orbit view: pull back by _distance, tilt down slightly, spin around Y, then recenter on
	// the model. view = T(0,0,-d) . Rx(pitch) . Ry(yaw) . T(-center).
	mat4.identity(_view);
	mat4.translate(_view, _view, [0, 0, -_distance]);
	mat4.rotateX(_view, _view, (20 / 180) * Math.PI);
	mat4.rotateY(_view, _view, (((tick / 1000) * 360) / 12 / 180) * Math.PI);
	mat4.translate(_view, _view, [-_target[0], -_target[1], -_target[2]]);

	GR2ViewerRenderer.render(gl, _view, Camera.projection, _fog, _light, tick);
}

/**
 * Export
 */
Viewer.loadModel = loadModel;
Viewer.stop = stop;

/**
 * Stored component and return it
 */
export default Viewer;
