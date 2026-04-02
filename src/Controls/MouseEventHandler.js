/**
 * Controls/MouseEventHandler.js
 *
 * Mouse Event Handler
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import jQuery from 'Utils/jquery.js';

/**
 * Mouse object
 */
class Mouse {
	/**
	 * Mouse screen position (2D)
	 */
	static screen = {
		x: -1,
		y: -1,
		width: 0,
		height: 0
	};

	/**
	 * Mouse world position (3d)
	 */
	static world = {
		x: -1,
		y: -1,
		z: -1
	};

	/**
	 * @var {boolean} Do we intersect object ?
	 */
	static intersect = false;

	static MOUSE_STATE = {
		NORMAL: 0,
		DRAGGING: 1,
		USESKILL: 2
	};

	/**
	 * @var {integer} Mouse state
	 */
	static state = 0;
}

/**
 * Track mouse move event
 */
jQuery(window).mousemove(event => {
	Mouse.screen.x = event.pageX;
	Mouse.screen.y = event.pageY;
});

/**
 * Export
 */
export default Mouse;
