/**
 * UI/Background.js
 *
 * Background Manager
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

/**
 * Load dependencies
 */
import DB from 'DB/DBManager.js';
import jQuery from 'Utils/jquery.js';
import Client from 'Core/Client.js';
import Configs from 'Core/Configs.js';

/**
 * @var {jQuery object} Background canvas element
 */
const _canvas = jQuery('<canvas/>').css({ position: 'absolute', top: 0, left: 0, zIndex: 5 });

/**
 * @var {CanvasRenderingContext2D} Background context
 */
const _ctx = _canvas[0].getContext('2d');

/**
 * @var {jQuery} Background overlay (used for transition)
 */
const _overlay = jQuery('<div/>').css({
	position: 'absolute',
	top: 0,
	left: 0,
	zIndex: 1000,
	backgroundColor: 'black',
	opacity: 0
});

/**
 * Background loading progress
 * @var {number} percent
 */
let _progress = -1;

/**
 * @var {Image} Background Image
 */
const _image = new Image();

/**
 * Background loading screen
 */
let _loading = [];

/**
 * Background Namespace
 */
class Background {
	/**
	 * Initialize Background component
	 *
	 * @param {Array} loading - Array of loading filenames stored in clientinfo.xml
	 */
	static init(loading) {
		let i;

		_progress = 0;
		_canvas.css('zIndex', 0);

		render();

		if (loading) {
			_loading = loading;
			return;
		}

		// Generate default loadings
		_loading.length = 10;
		for (i = 1; i <= 10; ++i) {
			_loading[i - 1] = `loading${i < 10 ? '0' + i : i}.jpg`;
		}
	}

	/**
	 * Resize the background
	 */
	static resize(width, height) {
		_canvas[0].width = width;
		_canvas[0].height = height;
		_overlay.css({ width: width, height: height });

		_ctx.fillStyle = 'black';
		_ctx.fillRect(0, 0, width, height);

		render();
	}

	/**
	 * Set an image as background
	 *
	 * @param {string} filename
	 * @param {function} callback once the image is loaded (optional)
	 */
	static setImage(filename, callback) {
		const exist = !!_canvas[0].parentNode;
		_progress = -1;

		render();

		// Get and load Image
		Client.loadFile(
			DB.INTERFACE_PATH + filename,
			url => {
				if (url !== _image.src) {
					_image.decoding = 'async';
					_image.src = url;
					_image.onload = render;
				}

				if (exist && callback) {
					callback();
				}
			},
			() => {
				if (exist && callback) {
					callback();
				}
			}
		);

		// Add transition only if the background isn't here
		if (!exist) {
			transition(() => {
				_canvas.appendTo('body');
				if (callback) {
					callback();
				}
			});
		}
	}

	/**
	 * Add loading background
	 *
	 * @param {function} callback once the loading is display (optional)
	 */
	static setLoading(callback) {
		const index = Math.floor(Math.random() * _loading.length);

		Background.setImage(_loading[index] || 'loading01.jpg', () => {
			_canvas.css('zIndex', 999);
			Background.setPercent(0.0);

			if (callback) {
				callback();
			}
		});
	}

	/**
	 * Remove background
	 *
	 * @param {function} callback once the overlay hide the window (optional)
	 */
	static remove(callback) {
		transition(() => {
			_canvas.css('zIndex', 0);
			_canvas.remove();
			_image.src = '';
			if (callback) {
				callback();
			}
		});
	}

	/**
	 * Adding progress bar to background
	 *
	 * @param {number} percent
	 */
	static setPercent(percent) {
		_progress = Math.min(Math.floor(percent), 100);

		const width = 240;
		const height = 15;
		const x = Math.floor((_canvas[0].width - width) * 0.5);
		const y = Math.floor(_canvas[0].height * 0.75);

		// Draw Rectangle border
		_ctx.fillStyle = 'rgb(0,255,255)';
		_ctx.fillRect(x, y, width, height);

		// Draw Rectangle "empty"
		_ctx.fillStyle = 'rgb(140,140,140)';
		_ctx.fillRect(x + 1, y + 1, width - 2, height - 2);

		// Draw progressbar
		_ctx.fillStyle = 'rgb(66,99,165)';
		_ctx.fillRect(x + 2, y + 2, Math.floor(percent * (width - 4) * 0.01), height - 4);

		// Draw percent
		_ctx.fillStyle = 'rgb(255,255,0)';
		_ctx.fillText(
			percent + '%',
			Math.floor((_canvas[0].width - _ctx.measureText(percent + '%').width) * 0.5),
			y + 11
		);
	}
}
/**
 * Render background (or a black background if no image is loaded yet)
 */
function render() {
	if (_image.complete && _image.width) {
		_ctx.drawImage(_image, 0, 0, _canvas[0].width, _canvas[0].height);
	} else {
		_ctx.fillStyle = '#000';
		_ctx.fillRect(0, 0, _canvas[0].width, _canvas[0].height);
	}

	if (_progress > -1) {
		Background.setPercent(_progress);
	}
}

/**
 * Play with the overlay
 *
 * @param {function} callback once the overlay hide the window
 */
function transition(callback) {
	const transitionDuration = Configs.get('transitionDuration') ? Configs.get('transitionDuration') : 500;

	_overlay
		.stop()
		.css('opacity', 0.01)
		.appendTo('body')
		.animate({ opacity: 1.0 }, transitionDuration, () => {
			callback();

			_overlay.stop().animate({ opacity: 0.01 }, transitionDuration, () => {
				_overlay.remove();
			});
		});
}

/**
 * Export
 */
export default Background;
