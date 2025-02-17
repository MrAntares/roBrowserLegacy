/**
 * Renderer/EntityDisplay.js
 *
 * Manage Entity Display (pseudo + guild + party)
 * Writing to canvas is very ugly, this file contain some hack to get some best results on Firefox and Chrome.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(['Utils/gl-matrix', 'Renderer/Renderer'], function (glMatrix, Renderer) {
	'use strict';

	var MapPreferences = require('Preferences/Map');

	/**
	 * Global methods
	 */
	var vec4 = glMatrix.vec4;
	var _pos = new Float32Array(4);
	var _size = new Float32Array(2);


	// Some helper for Firefox to render text-border
	if (typeof CanvasRenderingContext2D !== 'undefined') {
		CanvasRenderingContext2D.prototype.outlineText =
			function outlineText(txt, x, y) {
				this.fillText(txt, x - 1, y);
				this.fillText(txt, x, y - 1);
				this.fillText(txt, x + 1, y);
				this.fillText(txt, x, y + 1);
			};
	}

	// Some helper for Chrome to render text-border
	function multiShadow(ctx, text, x, y, offsetX, offsetY, blur) {
		ctx.textBaseline = 'top';
		ctx.lineWidth = 1;
		ctx.shadowColor = '#000';
		ctx.shadowBlur = blur;
		ctx.shadowOffsetX = offsetX;
		ctx.shadowOffsetY = offsetY;
		ctx.fillStyle = 'black';
		ctx.fillText(text, x, y);
	}


	/**
	 * @var {boolean} is the shadow ugly in the GPU ?
	 * Used to fallback to another renderer.
	 *
	 * For more informations, check :
	 * http://forum.robrowser.com/index.php?topic=32200
	 */
	var _isUglyShadow = function isUglyGPUShadow() {
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		var fontSize = 12;
		var text = 'Testing';
		var width, height, percent;

		// Create canvas
		ctx.font = fontSize + 'px Arial';
		width = ctx.measureText(text).width + 10;
		height = fontSize * 3 * (text.length ? 2 : 1);
		ctx.canvas.width = width;
		ctx.canvas.height = height;

		ctx.font = fontSize + 'px Arial';
		ctx.textBaseline = 'top';

		// Render text and shadows
		function testShadow() {
			multiShadow(ctx, text, 5, 0, 0, -1, 0);
			multiShadow(ctx, text, 5, 0, 0, 1, 0);
			multiShadow(ctx, text, 5, 0, -1, 0, 0);
			multiShadow(ctx, text, 5, 0, 1, 0, 0);

			ctx.fillStyle = 'white';
			ctx.strokeStyle = 'black';
			ctx.strokeText(text, 5, 0);
			ctx.fillText(text, 5, 0);
		}

		// Read canvas pixels and get the average black
		function getBlackPercent() {
			var imageData = ctx.getImageData(0, 0, width, height);
			var pixels = imageData.data;
			var i, count = pixels.length;
			var total = 0;

			for (i = 0; i < count; i += 4) {
				total += ((255 - pixels[i]) / 255) * pixels[i + 3];
			}

			return (total / (count / 4)) / 2.55;
		}

		// Do tests
		testShadow();
		percent = getBlackPercent();

		// 6.1% seems for the moment a good value
		// to check if there is too much black.
		return !window.chrome || percent > 6.15;
	}();


	/**
	 * Display structure
	 */
	function Display() {
		this.TYPE = {
			NONE: 0,
			LOADING: 1,
			COMPLETE: 2
		};

		this.STYLE = {
			DEFAULT: 0,
			MOB: 1,
			NPC: 2,
			ITEM: 3,
			ADMIN: 4
		};

		this.load = this.TYPE.NONE;
		this.name = '';
		this.fakename = '';
		this.party_name = '';
		this.guild_name = '';
		this.guild_rank = '';
		this.title_name = '';
		this.emblem = null;
		this.display = false;
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');
		this.canvas.style.position = 'absolute';
		this.canvas.style.zIndex = 1;
	}


	/**
	 * Add GUI to html
	 */
	Display.prototype.add = function add() {
		this.display = true;
	};


	/**
	 * Remove GUI from html
	 */
	Display.prototype.remove = function remove() {
		if (this.canvas.parentNode) {
			document.body.removeChild(this.canvas);
		}
		this.display = false;
	};


	/**
	 * Clean it (remove informations)
	 */
	Display.prototype.clean = function clean() {
		this.remove();
	};


	/**
	 * Update the display
	 * @param {string} color
	 */
	Display.prototype.update = function update(style) {
		style = style || this.STYLE.DEFAULT;

		// Setup variables
		var lines = new Array(2);
		var fontSize = 12;
		var ctx = this.ctx;
		var start_x = (this.emblem && (style === this.STYLE.DEFAULT || style === this.STYLE.ADMIN || style === this.STYLE.MOB || style === this.STYLE.NPC) ? 26 : 0) + 5;
		var width, height;
		var paddingTop = 5;

		// Skip the "#" in the pseudo
		lines[0] = this.fakename ? this.fakename.split('#')[0] : this.name.split('#')[0];
		lines[1] = '';


		// Add the party name
		if (this.party_name.length && (style === this.STYLE.DEFAULT || style === this.STYLE.ADMIN || style === this.STYLE.MOB || style === this.STYLE.NPC)) {
			lines[0] += ' (' + this.party_name + ')';
		}

		// Add guild name
		if (this.guild_name.length && (style === this.STYLE.DEFAULT || style === this.STYLE.ADMIN || style === this.STYLE.MOB || style === this.STYLE.NPC)) {
			lines[1] = this.guild_name;

			// Add guild rank
			if (this.guild_rank.length) {
				lines[1] += ' [' + this.guild_rank + ']';
			}
		}

		// Add Title name
		// when title is set client render title in line[0] and name/fakename in line[1]
		if (this.title_name.length && (style === this.STYLE.DEFAULT || style === this.STYLE.ADMIN || style === this.STYLE.MOB || style === this.STYLE.NPC)) {
			[lines[0], lines[1]] = [this.title_name, lines[0]];
		}

		// Setup the canvas
		var fontBold = MapPreferences.showname ? 'bold ' : '';
		ctx.font = fontBold + fontSize + 'px Arial';

		width = Math.max(ctx.measureText(lines[0]).width, ctx.measureText(lines[1]).width) + start_x + 5;
		height = fontSize * 3 * (lines[1].length ? 2 : 1) + paddingTop;
		ctx.canvas.width = width;
		ctx.canvas.height = height;

		// Draw emblem
		if (this.emblem && (style === this.STYLE.DEFAULT || style === this.STYLE.ADMIN || style === this.STYLE.MOB || style === this.STYLE.NPC)) {
			ctx.drawImage(this.emblem, 0, 0);
		}

		// TODO: complete the color list in the Entity display
		var color = 'white';
		switch (style) {
			case this.STYLE.MOB: color = '#ffc6c6'; break;
			case this.STYLE.NPC: color = '#94bdf7'; break;
			case this.STYLE.ITEM: color = '#FFEF94'; break;
			case this.STYLE.ADMIN: color = '#ffff00'; break;
		}


		var fontBold = MapPreferences.showname ? 'bold ' : '';
		ctx.font = fontBold + fontSize + 'px Arial';
		ctx.textBaseline = 'top';

		// Shadow renderer
		if (!_isUglyShadow) {
			multiShadow(ctx, lines[0], start_x, paddingTop, 0, -1, 0);
			multiShadow(ctx, lines[0], start_x, paddingTop, 0, 1, 0);
			multiShadow(ctx, lines[0], start_x, paddingTop, -1, 0, 0);
			multiShadow(ctx, lines[0], start_x, paddingTop, 1, 0, 0);
			multiShadow(ctx, lines[1], start_x, fontSize * 1.2 + paddingTop, 0, -1, 0);
			multiShadow(ctx, lines[1], start_x, fontSize * 1.2 + paddingTop, 0, 1, 0);
			multiShadow(ctx, lines[1], start_x, fontSize * 1.2 + paddingTop, -1, 0, 0);
			multiShadow(ctx, lines[1], start_x, fontSize * 1.2 + paddingTop, 1, 0, 0);
			ctx.fillStyle = color;
			ctx.strokeStyle = 'black';
			ctx.strokeText(lines[0], start_x, 0 + paddingTop);
			ctx.fillText(lines[0], start_x, paddingTop);
			ctx.strokeText(lines[1], start_x, fontSize * 1.2 + paddingTop);
			ctx.fillText(lines[1], start_x, fontSize * 1.2 + paddingTop);

		}

		// fillText renderer
		else {
			ctx.translate(0.5, 0.5);
			ctx.fillStyle = 'black';
			ctx.outlineText(lines[0], start_x, paddingTop);
			ctx.outlineText(lines[1], start_x, fontSize * 1.2 + paddingTop);
			ctx.fillStyle = color;
			ctx.fillText(lines[0], start_x, paddingTop);
			ctx.fillText(lines[1], start_x, fontSize * 1.2 + paddingTop);
		}
	};

	/**
	 * Refreshes the display (when player uses /showname)
	 */
	Display.prototype.refresh = function refresh(entity) {
		this.update(
			entity.objecttype === entity.constructor.TYPE_MOB ? entity.display.STYLE.MOB :
				entity.objecttype === entity.constructor.TYPE_NPC_ABR ? entity.display.STYLE.MOB :
					entity.objecttype === entity.constructor.TYPE_NPC_BIONIC ? entity.display.STYLE.MOB :
						entity.objecttype === entity.constructor.TYPE_DISGUISED ? entity.display.STYLE.MOB :
							entity.objecttype === entity.constructor.TYPE_NPC ? entity.display.STYLE.NPC :
								entity.objecttype === entity.constructor.TYPE_NPC2 ? entity.display.STYLE.NPC :
									entity.objecttype === entity.constructor.TYPE_ITEM ? entity.display.STYLE.ITEM :
										(entity.objecttype === entity.constructor.TYPE_PC && entity.isAdmin) ? entity.display.STYLE.ADMIN :
											entity.display.STYLE.DEFAULT
		)
	}

	/**
	 * Rendering GUI
	 */
	Display.prototype.render = function (matrix) {
		var canvas = this.canvas;
		var z;

		// Cast position
		_pos[0] = 0.0;
		_pos[1] = -0.5;
		_pos[2] = 0.0;
		_pos[3] = 1.0;

		// Set the viewport
		_size[0] = Renderer.width / 2;
		_size[1] = Renderer.height / 2;

		// Project point to scene
		vec4.transformMat4(_pos, _pos, matrix);

		// Calculate position
		z = _pos[3] === 0.0 ? 1.0 : (1.0 / _pos[3]);
		_pos[0] = _size[0] + Math.round(_size[0] * (_pos[0] * z));
		_pos[1] = _size[1] - Math.round(_size[1] * (_pos[1] * z));

		canvas.style.top = ((_pos[1] + 13) | 0) + 'px';
		canvas.style.left = ((_pos[0] - canvas.width / 2) | 0) + 'px';

		// Append to body
		if (!canvas.parentNode) {
			document.body.appendChild(canvas);
		}
	};


	/**
	 * Exporting
	 */
	return function Init() {
		this.display = new Display();
	};
});
