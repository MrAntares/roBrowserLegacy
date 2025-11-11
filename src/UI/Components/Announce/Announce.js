/**
 * UI/Components/Announce/Announce.js
 *
 * Announce GUI
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function(require)
{
	'use strict';


	/**
	 * Dependencies
	 */
	var jQuery      = require('Utils/jquery');
	var Events      = require('Core/Events');
	var Renderer    = require('Renderer/Renderer');
	var UIManager   = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');


	/**
	 * Create Announce component
	 */
	var Announce = new UIComponent( 'Announce' );


	/**
	 * Mouse can cross this UI
	 */
	Announce.mouseMode = UIComponent.MouseMode.CROSS;


	/**
	 * @var {boolean} do not focus this UI
	 */
	Announce.needFocus = false;


	/**
	 * @var {TimeOut} timer
	 */
	var _timer = 0;


	/**
	 * @var {number} how many time the announce is display (20secs)
	 */
	var _life = 20 * 1000;


	/**
	 * Initialize component
	 */
	Announce.init = function init()
	{
		this.canvas = document.createElement('canvas');
		this.ctx    = this.canvas.getContext('2d');
		this.ui     = jQuery(this.canvas);

		this.ui.attr('id', 'Announce').css({
			position: 'absolute',
			top:       40,
			zIndex:    40
		});
	};


	/**
	 * Once removed from HTML, clean timer
	 */
	Announce.onRemove = function onRemove()
	{
		if (_timer) {
			Events.clearTimeout( _timer );
			_timer = 0;
		}
		this.ui.remove(); // Remove from DOM
	};


	/**
	 * Timer end, cleaning announce
	 */
	Announce.timeEnd = function timeEnd()
	{
		this.remove();
	};


	/**
	 * Add an announce with text and color
	 *
	 * @param {string} text to display
	 * @param {string} color
	 */
	Announce.set = function set( text, color, allowNewlines = false)
	{
		var fontSize = 12;
		var maxWidth = 500;
		var lines    = [];

		var width    = 0;
		var result;
		var i, j, count;

		this.ctx.font = fontSize + 'px Arial';

		if (allowNewlines) {
			// Process '\n' explicitly as a new line
			text.split('\n').forEach((line) => {
				const words = line.split(' ');
				let currentLine = '';
	
				words.forEach((word) => {
					const testLine = currentLine + word + ' ';
					if (this.ctx.measureText(testLine).width > maxWidth) {
						lines.push(currentLine.trim());
						currentLine = word + ' ';
					} else {
						currentLine = testLine;
					}
				});
	
				if (currentLine.trim()) {
					lines.push(currentLine.trim());
				}
			});
		} else {
			// Ignore '\n' and wrap text as a single block
			let currentLine = '';
			text.split(' ').forEach((word) => {
				const testLine = currentLine + word + ' ';
				if (this.ctx.measureText(testLine).width > maxWidth) {
					lines.push(currentLine.trim());
					currentLine = word + ' ';
				} else {
					currentLine = testLine;
				}
			});

			if (currentLine.trim()) {
				lines.push(currentLine.trim());
			}
		}

		// Get new canvas size
		this.canvas.width = 20 + Math.max(...lines.map((line) => this.ctx.measureText(line).width));
		this.canvas.height = 10 + (fontSize + 5) * lines.length;
		this.canvas.style.left = `${((Renderer.width - this.canvas.width) >> 1)}px`;

		// Updating canvas size resets font value
		this.ctx.font = fontSize + 'px Arial';

		// Display background
		this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// Display text
		this.ctx.fillStyle = color || '#FFFF00';
		lines.forEach((line, index) => {
			this.ctx.fillText(line, 10, 5 + fontSize + (fontSize + 5) * index);
		});

		// Start timer
		if (_timer) {
			Events.clearTimeout(_timer);
		}

		_timer = Events.setTimeout(this.timeEnd.bind(this), _life);
	};


	/**
	 * Create component and return it
	 */
	return UIManager.addComponent(Announce);
});
