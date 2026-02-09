/**
 * Controls/MouseEventHandler.js
 *
 * Mouse Event Handler
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

define(['Utils/jquery'], function (jQuery)
{
	'use strict';

	/**
	 * Mouse object
	 */
	var Mouse = {};

	/**
	 * Mouse screen position (2D)
	 */
	Mouse.screen = {
		x: -1,
		y: -1,
		width: 0,
		height: 0
	};

	/**
	 * Mouse world position (3d)
	 */
	Mouse.world = {
		x: -1,
		y: -1,
		z: -1
	};

	/**
	 * @var {boolean} Do we intersect object ?
	 */
	Mouse.intersect = false;

	Mouse.MOUSE_STATE = {
		NORMAL: 0,
		DRAGGING: 1,
		USESKILL: 2
	};

	/**
	 * @var {integer} Mouse state
	 */
	Mouse.state = 0;

	/**
	 * Track mouse move event
	 */
	jQuery(window).mousemove(function (event)
	{
		Mouse.screen.x = event.pageX;
		Mouse.screen.y = event.pageY;
	});

	/**
	 * Export
	 */
	return Mouse;
});
