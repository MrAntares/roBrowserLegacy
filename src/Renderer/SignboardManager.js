// src/Renderer/SignboardManager.js
define(function (require)
{
	'use strict';

	var SignboardManager = {};
	var signboards = [];
	var glMatrix = require('Utils/gl-matrix');
	var mat4 = glMatrix.mat4;
	var vec4 = glMatrix.vec4;
	var Renderer = require('Renderer/Renderer');
	var DB = require('DB/DBManager');
	var _pos = new Float32Array(4);
	var _size = new Float32Array(2);

	SignboardManager.add = function (x, y, signboardData)
	{
		var EntitySignboard = require('UI/Components/EntitySignboard/EntitySignboard');

		// Clone the UI component
		var signboardUI = EntitySignboard.clone('EntitySignboard', true);
		signboardData.icon_location = signboardData.icon_location.replace(
			'\xc0\xaf\xc0\xfa\xc0\xce\xc5\xcd\xc6\xe4\xc0\xcc\xbd\xba' + '\\',
			''
		);

		// Prepare the UI component
		signboardUI.prepare();

		// Initialize and append to DOM
		signboardUI.append();

		// Set title and icon based on type
		if (signboardData.type === 1)
		{
			// ICON_ONLY
			signboardUI.setIconOnly(DB.INTERFACE_PATH + signboardData.icon_location);
		}
		else
		{
			// FULL_SIGNBOARD
			signboardUI.setTitle(
				DB.getTranslatedSignBoard(signboardData.description),
				DB.INTERFACE_PATH + signboardData.icon_location
			);
		}

		signboards.push({
			type: signboardData.type,
			x: x,
			y: y,
			data: signboardData,
			icon_location: signboardData.icon_location,
			ui: signboardUI,
			posX: signboardData.type === 1 ? 120 : 140,
			posY: signboardData.type === 1 ? 15 : 70
		});
	};

	SignboardManager.render = function (gl, modelView, projection)
	{
		var _matrix = mat4.create();
		var _vector = vec4.create();

		for (var i = 0; i < signboards.length; i++)
		{
			var signboard = signboards[i];

			var ui = signboard.ui.ui[0];
			var z;

			// Calculate world position
			_vector[0] = signboard.x + 0.5;
			_vector[1] = 0; // Ground level
			_vector[2] = signboard.y + 0.5;
			mat4.translate(_matrix, modelView, _vector);

			// Set up billboard
			_matrix[0] = 1.0;
			_matrix[1] = 0.0;
			_matrix[2] = 0.0;
			_matrix[4] = 0.0;
			_matrix[5] = 1.0;
			_matrix[6] = 0.0;
			_matrix[8] = 0.0;
			_matrix[9] = 0.0;
			_matrix[10] = 1.0;

			// Project to screen
			mat4.multiply(_matrix, projection, _matrix);

			// Cast position
			_pos[0] = 0.0;
			_pos[1] = signboard.posX / 35;
			_pos[2] = 0.0;
			_pos[3] = 1.0;

			// Set the viewport
			_size[0] = Renderer.width / 2;
			_size[1] = Renderer.height / 2;

			// Project point to scene
			vec4.transformMat4(_pos, _pos, _matrix);

			// Calculate position
			z = _pos[3] === 0.0 ? 1.0 : 1.0 / _pos[3];
			_pos[0] = _size[0] + Math.round(_size[0] * (_pos[0] * z));
			_pos[1] = _size[1] - Math.round(_size[1] * (_pos[1] * z));

			// Check if the Vertical Flip (Illusion effect) is active
			// If true, invert the Y coordinate relative to the renderer height
			if (require('Renderer/Effects/Shaders/VerticalFlip').isActive()) {_pos[1] = Renderer.height - _pos[1];}

			ui.style.top = (_pos[1] | 0) + 'px';
			ui.style.left = ((_pos[0] - signboard.posY) | 0) + 'px';
		}
	};

	SignboardManager.free = function ()
	{
		for (var i = 0; i < signboards.length; i++)
		{
			signboards[i].ui.remove();
		}
		signboards = [];
	};

	return SignboardManager;
});
