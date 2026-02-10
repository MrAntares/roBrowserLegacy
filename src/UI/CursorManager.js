/**
 * UI/CursorManager.js
 *
 * Display Cursor
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

define(function (require) {
	'use strict';

	// Load dependencies
	var jQuery = require('Utils/jquery');
	var Client = require('Core/Client');
	var MemoryManager = require('Core/MemoryManager');
	var Graphics = require('Preferences/Graphics');
	var Sprite = require('Loaders/Sprite');
	var Action = require('Loaders/Action');
	var Preferences = require('Preferences/Controls');
	var getModule = require;

	/**
	 * Cursor Constructor
	 */
	var Cursor = {};

	/**
	 * Cursor animation Constant
	 */
	Cursor.ACTION = {
		DEFAULT: 0,
		TALK: 1,
		CLICK: 2,
		LOCK: 3,
		ROTATE: 4,
		ATTACK: 5,
		WARP: 7,
		PICK: 9,
		TARGET: 10,
		NOWALK: 13
	};

	/**
	 * @var {boolean} block change ?
	 */
	Cursor.freeze = false;

	/**
	 * @var {integer} left in px
	 */
	Cursor.x = 0;

	/**
	 * @var {integer} top in px
	 */
	Cursor.y = 0;

	/**
	 * @var {boolean} magnetism while picking entites ?
	 */
	Cursor.magnetism = true;

	/**
	 * @var {boolean} force disabled magnetism
	 * Used to cast zone skill to ground
	 */
	Cursor.blockMagnetism = false;

	/**
	 * @var {integer} Cursor.ACTION.* constant
	 */
	var _type = Cursor.ACTION.DEFAULT;

	/**
	 * @var {integer} tick
	 */
	var _tick = 0;

	/**
	 * @var {boolean} repeat animation ?
	 */
	var _norepeat = false;

	/**
	 * @var {integer} animation frame
	 */
	var _animation = 0;

	/**
	 * @var {boolean} play animation ?
	 */
	var _play = true;

	/**
	 * @var {number} last style id rendered
	 */
	var _lastStyleId = -1;

	/**
	 * @var {number} last rendered position x
	 */
	var _lastX = 0;

	/**
	 * @var {number} last renderer position y
	 */
	var _lastY = 0;

	/**
	 * @var {Array} css style list
	 */
	var _compiledStyle = [];

	/**
	 * @var {Sprite} sprite
	 */
	var _sprite;

	/**
	 * @var {Action} action
	 */
	var _action;

	/**
	 * @var {reference} selector
	 */
	var _selector;

	/**
	 * Define sprite informations (hardcoded)
	 */
	const ActionInformations = {};
	ActionInformations[Cursor.ACTION.DEFAULT] = { drawX: 1, drawY: 19, startX: 0, startY: 0, delayMult: 2.0 };
	ActionInformations[Cursor.ACTION.TALK] = { drawX: 20, drawY: 40, startX: 20, startY: 20, delayMult: 1.0 };
	ActionInformations[Cursor.ACTION.WARP] = { drawX: 10, drawY: 32, startX: 0, startY: 0, delayMult: 1.0 };
	ActionInformations[Cursor.ACTION.ROTATE] = { drawX: 18, drawY: 26, startX: 10, startY: 0, delayMult: 1.0 };
	ActionInformations[Cursor.ACTION.PICK] = { drawX: 20, drawY: 40, startX: 15, startY: 15, delayMult: 1.0 };
	ActionInformations[Cursor.ACTION.TARGET] = { drawX: 20, drawY: 50, startX: 20, startY: 28, delayMult: 0.5 };
	ActionInformations[Cursor.ACTION.NOWALK] = { drawX: 13, drawY: 25, startX: 14, startY: 6, delayMult: 1.0 };

	var EntityManager, Entity, SpriteRenderer, Mouse;

	/**
	 * Load cursor data (action, sprite)
	 */
	Cursor.init = function init(fn) {
		// Already loaded
		if (_sprite) {
			fn();
			return;
		}

		Client.getFiles(['data/sprite/cursors.spr', 'data/sprite/cursors.act'], function (spr, act) {
			try {
				_sprite = new Sprite(spr);
				_action = new Action(act);
			} catch (e) {
				console.error('Cursor::init() - ' + e.message);
				return;
			}

			// Load it properly later using webgl
			MemoryManager.remove(null, 'data/sprite/cursors.spr');
			MemoryManager.remove(null, 'data/sprite/cursors.act');

			bindMouseEvents();
			preCompiledAnimations();
			createSpriteSheet();
			fn();
		});

		EntityManager = getModule('Renderer/EntityManager');
		Entity = getModule('Renderer/Entity/Entity');
		SpriteRenderer = getModule('Renderer/SpriteRenderer');
		Mouse = getModule('Controls/MouseEventHandler');
	};

	/**
	 * Change the cursor for the button click event
	 */
	function bindMouseEvents() {
		const cursorCSS = `
		.custom-cursor * { cursor: none!important; }
		.custom-cursor .cursor { display: block; }
		.cursor { pointer-events: none; z-index: 9999; position: fixed; width: 50px; height: 50px; overflow: hidden; display: none; }
		.cursor__sprite { position: absolute; top: 0; left: 0; }
	`;
		jQuery('head').append(`<style type="text/css">${cursorCSS}</style>`);
		jQuery('body').append('<div class="cursor"></div>');
		_selector = document.querySelector('.cursor');

		const CLICKABLE_SELECTOR = [
			'a',
			'button',
			'input',
			'label',
			'select',
			'textarea',
			'.item-link',
			'.draggable'
		].join(',');

		let _hasClickableHover = false;
		let _restoreType = Cursor.ACTION.DEFAULT;

		const findClickableTarget = target => {
			if (!target) {
				return null;
			}

			// Text node → element
			if (target.nodeType && target.nodeType !== 1) {
				target = target.parentElement;
			}

			if (!target) {
				return null;
			}

			// Tabs are clickable UI, but should not override the game cursor to "click".
			if (target.closest && target.closest('#chatbox td.tab')) {
				return null;
			}

			if (target.closest) {
				return target.closest(CLICKABLE_SELECTOR);
			}

			while (target && target !== document.body) {
				if (target.matches && target.matches(CLICKABLE_SELECTOR)) {
					return target;
				}
				target = target.parentElement;
			}

			return null;
		};

		const setCursorClick = (norepeat, animation) => {
			if (norepeat) {
				Cursor.setType(Cursor.ACTION.CLICK, true, animation);
				return;
			}

			if (Cursor.getActualType() !== Cursor.ACTION.CLICK) {
				Cursor.setType(Cursor.ACTION.CLICK);
			}
		};

		document.body.addEventListener('mouseover', e => {
			if (findClickableTarget(e.target)) {
				if (!_hasClickableHover) {
					_restoreType = Cursor.getActualType();
					_hasClickableHover = true;
				}
				setCursorClick(false, 0);
			}
		});

		document.body.addEventListener('mouseout', e => {
			if (!_hasClickableHover) {
				return;
			}

			// Ignore transitions between clickable elements.
			if (findClickableTarget(e.relatedTarget)) {
				return;
			}

			_hasClickableHover = false;
			Cursor.setType(_restoreType);
		});

		document.body.addEventListener(
			'mousedown',
			e => {
				if (findClickableTarget(e.target)) {
					if (!_hasClickableHover) {
						_restoreType = Cursor.getActualType();
						_hasClickableHover = true;
					}
					setCursorClick(true, 1);
				}
			},
			true
		);

		document.body.addEventListener('mouseup', e => {
			if (findClickableTarget(e.target)) {
				setCursorClick(false, 0);
				return;
			}

			if (_hasClickableHover) {
				_hasClickableHover = false;
				Cursor.setType(_restoreType);
			}
		});

		document.addEventListener(
			'mousemove',
			e => {
				Cursor.x = e.pageX;
				Cursor.y = e.pageY;
				_selector.style.left = `${e.pageX}px`;
				_selector.style.top = `${e.pageY}px`;
			},
			true
		);
	}

	/**
	 * Start pre-compiling animation to avoid building sprites
	 * during the rendering loop
	 */
	function preCompiledAnimations() {
		var i, j, k, count, size, total, pos;
		var action, animation, info;
		var canvas, ctx, entity;
		var binary, data, dataURI;
		var dataURIList, position;

		// Start initializing variables
		canvas = document.createElement('canvas');
		canvas.width = 50;
		canvas.height = 50;
		ctx = canvas.getContext('2d');
		entity = new Entity();
		dataURIList = [];
		_compiledStyle = [];
		position = [0, 0];

		// Start compiling animation
		for (i = 0, count = _action.actions.length; i < count; ++i) {
			action = _action.actions[i];
			info = ActionInformations[i] || ActionInformations[Cursor.ACTION.DEFAULT];

			for (j = 0, size = action.animations.length; j < size; ++j) {
				animation = action.animations[j];

				// Initialize context
				SpriteRenderer.bind2DContext(ctx, info.drawX, info.drawY);
				ctx.clearRect(0, 0, 50, 50);

				// // add borders to debug
				// ctx.strokeStyle = 'red';
				// ctx.strokeRect(0, 0, 50, 50);

				// Render layers
				for (k = 0, total = animation.layers.length; k < total; ++k) {
					entity.renderLayer(animation.layers[k], _sprite, _sprite, 1.0, position, false);
				}

				dataURI = canvas.toDataURL('image/png');
				pos = dataURIList.indexOf(dataURI);

				// Already build
				if (pos > -1) {
					animation.compiledStyleIndex = pos;
					continue;
				}

				// Modify the canvas to a file object
				binary = atob(dataURI.replace(/^data[^,]+,/, ''));
				total = binary.length;
				data = new Uint8Array(total);

				for (k = 0; k < total; ++k) {
					data[k] = binary.charCodeAt(k);
				}

				// Store it.
				animation.compiledStyleIndex = _compiledStyle.length;

				dataURIList.push(dataURI);

				var blobURL = URL.createObjectURL(new Blob([data.buffer], { type: 'image/png' }));

				_compiledStyle.push(blobURL);
			}
		}
	}

	/**
	 * Creates a sprite sheet from a list of image URLs and appends it to the DOM.
	 *
	 * Creates a canvas, draws each sprite in a row, converts the canvas to a data URL,
	 * and then creates a Blob URL to display the sprite sheet.
	 */
	function createSpriteSheet() {
		var spriteWidth = 50,
			spriteHeight = 50;
		var totalSprites = _compiledStyle.length;
		var spriteSheetWidth = totalSprites * spriteWidth;
		var spriteSheetHeight = spriteHeight;

		// Create a canvas to hold the sprite sheet
		var spriteSheetCanvas = document.createElement('canvas');
		spriteSheetCanvas.width = spriteSheetWidth;
		spriteSheetCanvas.height = spriteSheetHeight;
		var ctx = spriteSheetCanvas.getContext('2d');

		var imagesLoaded = 0;

		function drawSprite(n) {
			var img = new Image();
			img.decoding = 'async';
			img.onload = function () {
				ctx.drawImage(img, n * spriteWidth, 0, spriteWidth, spriteHeight);
				imagesLoaded++;
				if (imagesLoaded === totalSprites) {
					finalizeSpriteSheet();
				}
			};
			img.src = _compiledStyle[n];
		}

		function finalizeSpriteSheet() {
			// Convert the sprite sheet canvas to a data URL
			var spriteSheetDataURL = spriteSheetCanvas.toDataURL('image/png');

			// Create a Blob from the sprite sheet data URL
			var binary = atob(spriteSheetDataURL.split(',')[1]);
			var array = [];
			for (var i = 0; i < binary.length; i++) {
				array.push(binary.charCodeAt(i));
			}
			var blob = new Blob([new Uint8Array(array)], { type: 'image/png' });
			var spriteSheetBlobURL = URL.createObjectURL(blob);

			// Append the sprite sheet to the DOM
			var imageElem = jQuery('<img class="cursor__sprite" src="' + spriteSheetBlobURL + '">');
			imageElem.one('load', function (e) {
				URL.revokeObjectURL(e.target.src);
			});
			jQuery('.cursor').append(imageElem);
		}

		for (var i = 0; i < totalSprites; i++) {
			drawSprite(i);
		}
	}

	/**
	 * Change cursor action
	 *
	 * @param {number} type - Cursor.ACTION.*
	 * @param {boolean} norepeat - repeat animation ?
	 * @param {number} animation numero (optional)
	 */
	Cursor.setType = function SetType(type, norepeat, animation) {
		if (Cursor.freeze) {
			return;
		}

		_type = type;
		_tick = Date.now();
		_norepeat = !!norepeat;

		if (typeof animation !== 'undefined') {
			_animation = animation;
			_play = false;
		} else {
			_animation = animation || 0;
			_play = true;
		}
	};

	/**
	 * Simple method to get the current cursor type
	 *
	 * @return {number} Cursor.ACTION.*
	 */
	Cursor.getActualType = function getActualType() {
		return _type;
	};

	/**
	 * Render the cursor (update)
	 */
	Cursor.render = function render(tick) {
		if (!Graphics.cursor || !_compiledStyle.length) {
			if (_selector) {
				_selector.style.display = 'hidden';
			}
			return;
		}
		if (_selector.style.display !== 'show') {
			if (_selector) {
				_selector.style.display = 'show';
			}
		}

		let info = ActionInformations[_type] || ActionInformations[Cursor.ACTION.DEFAULT];
		let action = _action.actions[_type] || _action.actions[Cursor.ACTION.DEFAULT];
		let anim = _animation;
		let delay = action.delay * info.delayMult;
		let x = info.startX;
		let y = info.startY;
		let animation;

		if (_play) {
			let frame = Math.floor((tick - _tick) / delay);
			anim = _norepeat ? Math.min(frame, action.animations.length - 1) : frame % action.animations.length;
		}

		if (Graphics.cursor) {
			document.body.classList.add('custom-cursor');
		}

		animation = action.animations[anim];

		if (!animation) {
			return;
		}

		if (Cursor.magnetism && !Cursor.blockMagnetism) {
			let entity = EntityManager.getOverEntity();
			if (entity) {
				switch (entity.objecttype) {
					case Entity.TYPE_MOB:
					case Entity.TYPE_NPC_ABR:
					case Entity.TYPE_NPC_BIONIC:
						if (!Preferences.snap) {
							break;
						}
						x += Math.floor(
							Mouse.screen.x -
								(entity.boundingRect.x1 + (entity.boundingRect.x2 - entity.boundingRect.x1) / 2)
						);
						y += Math.floor(
							Mouse.screen.y -
								(entity.boundingRect.y1 + (entity.boundingRect.y2 - entity.boundingRect.y1) / 2)
						);
						break;
					case Entity.TYPE_ITEM:
						if (!Preferences.itemsnap) {
							break;
						}
						x += Math.floor(
							Mouse.screen.x -
								(entity.boundingRect.x1 + (entity.boundingRect.x2 - entity.boundingRect.x1) / 2)
						);
						y += Math.floor(
							Mouse.screen.y -
								(entity.boundingRect.y1 + (entity.boundingRect.y2 - entity.boundingRect.y1) / 2)
						);
						break;
					default:
						break;
				}
			}
		}

		if (animation.compiledStyleIndex !== _lastStyleId || x !== _lastX || y !== _lastY) {
			_lastStyleId = animation.compiledStyleIndex;
			_lastX = x;
			_lastY = y;

			let cursorSprite = document.querySelector('.cursor__sprite');
			if (cursorSprite) {
				cursorSprite.style.left = `${-_lastStyleId * 50}px`;
			}

			let cursor = document.querySelector('.cursor');
			if (cursor) {
				cursor.style.transform = `translate(-${_lastX}px, -${_lastY}px)`;
			}
		}
	};

	/**
	 * Export
	 */
	return Cursor;
});
