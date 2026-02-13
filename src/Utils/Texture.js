/**
 * Utils/Texture.js
 *
 * WebGL Helper function
 *
 * Trying to define here some functions related to textures.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

define(['Loaders/Targa', 'Vendors/libgif'], function (Targa, GIF) {
	'use strict';

	/**
	 * Namespace
	 */
	var Texture = {};

	var procCanvas = document.createElement('canvas');
	var procCtx = procCanvas.getContext('2d', { willReadFrequently: true });

	/**
	 * Texture Constructor
	 *
	 * @param {string|object} data
	 * @param {function} oncomplete callback
	 */
	Texture.load = function load(data, oncomplete) {
		var args = Array.prototype.slice.call(arguments, 2);

		// Possible missing textures on loaders
		if (!data) {
			args.unshift(false);
			oncomplete.apply(null, args);
			return;
		}

		// TGA Support
		if (data instanceof ArrayBuffer) {
			try {
				var tga = new Targa();
				tga.load(new Uint8Array(data));
				args.unshift(true);
				oncomplete.apply(tga.getCanvas(), args);
			} catch (e) {
				console.error(e.message);
				args.unshift(false);
				oncomplete.apply(null, args);
			}
			return;
		}

		// Regular images
		var img = new Image();
		img.decoding = 'async';
		img.src = data;
		img.onload = function OnLoadClosure() {
			// Clean up blob
			if (data.match(/^blob:/)) {
				URL.revokeObjectURL(data);
			}

			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d', { willReadFrequently: true });

			canvas.width = this.width;
			canvas.height = this.height;

			ctx.drawImage(this, 0, 0, this.width, this.height);
			Texture.removeMagenta(canvas);

			args.unshift(true);
			oncomplete.apply(canvas, args);
		};
	};

	// Creates a canvas spritesheet with gif metadata to animate in guild display
	Texture.processGifToSpriteSheet = function processGifToSpriteSheet(buffer, callback) {
		var args = Array.prototype.slice.call(arguments, 2);
		var dummyParent = document.createElement('div');
		var img = new Image();
		dummyParent.appendChild(img);

		img.onload = function () {
			try {
				var gif = new GIF({
					gif: img,
					auto_play: false,
					vp_w: img.width,
					vp_h: img.height
				});

				gif.load(function () {
					var frameCount = gif.get_length();
					var frameWidth = img.width;
					var frameHeight = img.height;

					var framesData = gif.get_frames();
					var frameDelays = [];

					var fLineCount = Math.ceil(Math.sqrt((frameCount * frameWidth) / frameHeight));
					var spriteSheetWidth = fLineCount * frameWidth;
					var spriteSheetHeight = Math.ceil(frameCount / fLineCount) * frameHeight;

					var canvas = document.createElement('canvas');
					canvas.width = spriteSheetWidth;
					canvas.height = spriteSheetHeight;
					var ctx = canvas.getContext('2d', {
						willReadFrequently: true
					});

					for (var i = 0; i < frameCount; i++) {
						var delay = framesData[i] && framesData[i].delay ? framesData[i].delay : 10;
						frameDelays.push(delay * 10);

						gif.move_to(i);
						var frameCanvas = gif.get_canvas();
						var row = Math.floor(i / fLineCount);
						var col = i % fLineCount;
						ctx.drawImage(frameCanvas, col * frameWidth, row * frameHeight);
					}

					Texture.removeMagenta(canvas);

					canvas.isAnimated = true;
					canvas.frameDelays = frameDelays;
					canvas.frameWidth = frameWidth;
					canvas.frameHeight = frameHeight;
					canvas.frameCount = frameCount;
					canvas.framesPerRow = fLineCount;
					canvas.currentFrame = 0;
					canvas.lastFrameChange = Date.now();

					args.unshift(true);
					callback.apply(canvas, args);
				});
			} catch (e) {
				args.unshift(false);
				callback.apply(null, args);
			}
		};

		var blob = new Blob([buffer], {
			type: 'image/gif'
		});
		img.src = URL.createObjectURL(blob);
	};

	/**
	 * Remove magenta pixels from image
	 *
	 * @param {HTMLElement} canvas
	 */
	Texture.removeMagenta = function removeMagenta(canvas) {
		var w = canvas.width;
		var h = canvas.height;

		procCtx.clearRect(0, 0, w, h);

		if (procCanvas.width !== w || procCanvas.height !== h) {
			procCanvas.width = w;
			procCanvas.height = h;
		}

		procCtx.drawImage(canvas, 0, 0);
		var imageData = procCtx.getImageData(0, 0, w, h);
		var data = imageData.data;
		var count = data.length;

		for (var i = 0; i < data.length; i += 4) {
			if (data[i] > 230 && data[i + 1] < 20 && data[i + 2] > 230) {
				data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 0;
			}
		}

		canvas.getContext('2d').putImageData(imageData, 0, 0);
	};

	/**
	 * Export
	 */
	return Texture;
});
