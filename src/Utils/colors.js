'use strict';

/**
	 * Convert a uint32 color value from BGR format to RGB format.
	 *
	 * @param {number} color - The color value in BGR format as a uint32.
	 * @return {string} The color value in CSS 'rgb' format.
	 */
export default function uint32ToRGB(color) {
		let red = color & 0xff;
		let green = (color >> 8) & 0xff;
		let blue = (color >> 16) & 0xff;
		return `rgb(${red},${green},${blue})`;
	};