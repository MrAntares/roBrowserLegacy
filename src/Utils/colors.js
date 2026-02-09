define(function () {
	'use strict';

	/**
	 * Convert a uint32 color value from BGR format to RGB format.
	 *
	 * @param {number} color - The color value in BGR format as a uint32.
	 * @return {string} The color value in CSS 'rgb' format.
	 */
	return function uint32ToRGB(color) {
		var red = color & 0xff;
		var green = (color >> 8) & 0xff;
		var blue = (color >> 16) & 0xff;
		return `rgb(${red},${green},${blue})`;
	};
});
