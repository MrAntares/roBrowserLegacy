/**
 * UI/UIComponent.js
 *
 * Manage Component
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function (require) {
	'use strict';

	// Load dependencies
	var CommonCSS = require('text!./Common.css');
	var jQuery = require('Utils/jquery');
	var Cursor = require('./CursorManager');
	var DB = require('DB/DBManager');
	var Client = require('Core/Client');
	var Events = require('Core/Events');
	var Mouse = require('Controls/MouseEventHandler');
	var UIPreferences = require('Preferences/UI');
	var Session = require('Engine/SessionStorage');
	var Targa = require('Loaders/Targa');
	var Renderer = require('Renderer/Renderer');
	var getModule = require;

	/**
	 * Create a component
	 *
	 * @param {string} name
	 * @param {string} htmlText content
	 * @param {string} cssText content
	 */
	function UIComponent(name, htmlText, cssText) {
		this.name = name;
		this._htmlText = htmlText || null;
		this._cssText = cssText || null;
		this.magnet = {
			TOP: false,
			BOTTOM: false,
			LEFT: false,
			RIGHT: false
		};
	}

	/**
	 * @var {jQueryElement} <style>
	 */
	var _style = jQuery('style:first');
	if (!_style.length) {
		_style = jQuery('<style type="text/css"></style>').appendTo('head');
	}
	_style.append(CommonCSS);

	/**
	 * @var {enum} Mouse mode
	 */
	UIComponent.MouseMode = {
		CROSS: 0, // cross the ui and intersect with scene
		STOP: 1, // don't intersect the scene if mouse over the ui
		FREEZE: 2 // don't intersect the scene if ui is alive in scene
	};

	/**
	 * @var {number} mouse behavior
	 */
	UIComponent.prototype.mouseMode = UIComponent.MouseMode.STOP;

	/**
	 * @var {boolean} is Component ready ?
	 */
	UIComponent.prototype.__loaded = false;

	/**
	 * @var {boolean} is Component active ?
	 */
	UIComponent.prototype.__active = false;

	/**
	 * @var {boolean} focus element zIndex ?
	 */
	UIComponent.prototype.needFocus = true;

	var _snapCache = [];

	/**
	 * Prepare the component to be used
	 */
	UIComponent.prototype.prepare = function prepare() {
		if (this.__loaded) {
			return;
		}

		if (this._htmlText) {
			this.ui = jQuery(this._htmlText);
			this.ui.css('zIndex', 50);
		}

		// Add style to view
		if (this._cssText) {
			// Avoid adding css each time the same component is created
			if (_style.text().indexOf('\n\n/** ' + this.name + ' **/\n') === -1) {
				_style.append('\n\n/** ' + this.name + ' **/\n' + this._cssText);
			}
			jQuery('body').append(this.ui);
		}

		// Prepare html
		if (this._htmlText) {
			this.ui.each(this.parseHTML).find('*').each(this.parseHTML);
		}

		// Initialize
		if (this.init) {
			this.init();
		}

		// If the ui don't allow to be crossed by mouse to intersect the scene then
		// _enter variable is here to fix a recurrent bug in mouseenter and mouseleave
		// when mouseenter can be triggered multiples time
		if (this.mouseMode === UIComponent.MouseMode.STOP) {
			var _intersect,
				_enter = 0;
			let element = this.__mouseStopBlock || this.ui;

			// stop intersection
			element.mouseenter(function () {
				if (_enter === 0) {
					_intersect = Mouse.intersect;
					_enter++;
					if (_intersect) {
						Mouse.intersect = false;
						Cursor.setType(Cursor.ACTION.DEFAULT);
						getModule('Renderer/EntityManager').setOverEntity(null);
					}
				}
			});

			// restore previous state
			element.mouseleave(function () {
				if (_enter > 0) {
					_enter--;

					if (_enter === 0 && _intersect) {
						if (!Session.FreezeUI) {
							Mouse.intersect = true;
						}
						getModule('Renderer/EntityManager').setOverEntity(null);
					}
				}
			});

			// Custom fix for firefox, mouseleave isn't trigger when element is
			// removed from body, test case: http://jsfiddle.net/7h4sj/
			element.on('x_remove', function () {
				if (_enter > 0) {
					_enter = 0;
					if (_intersect) {
						Mouse.intersect = true;
						getModule('Renderer/EntityManager').setOverEntity(null);
					}
				}
			});

			// Focus the UI on mousedown
			element.mousedown(this.focus.bind(this));
		}

		if (this.mouseMode !== UIComponent.MouseMode.CROSS) {
			let element = this.__mouseStopBlock || this.ui;
			// Do not cross
			element.on('touchstart', function (event) {
				event.stopImmediatePropagation();
			});
		}

		if (this._htmlText) {
			this.ui.detach();
		}

		this.__loaded = true;
	};

	/**
	 * Remove a component from HTML
	 */
	UIComponent.prototype.remove = function remove() {
		this.__active = false;

		if (this.__loaded && this.ui.parent().length) {
			if (this.onRemove) {
				this.onRemove();
			}

			if (this.onKeyDown) {
				jQuery(window).off('keydown.' + this.name);
			}

			this.ui.trigger('x_remove');
			this.ui.detach();

			if (this.mouseMode === UIComponent.MouseMode.FREEZE) {
				Mouse.intersect = true;
				Session.FreezeUI = false;
			}
		}
	};

	/**
	 * Add the component to HTML
	 *
	 * @param {string|jQueryElement} [target] - Target element to append the UI to. If not provided, appends to body.
	 */
	UIComponent.prototype.append = function append(target) {
		this.__active = true;

		if (!this.__loaded) {
			this.prepare();

			if (this.__active) {
				this.append();
			}

			return;
		}

		// Determine the target element
		var $target;
		if (target) {
			$target = jQuery(target);
			if (!$target.length) {
				console.error('Error: Unable to find target element for appending UI.');
				return;
			}
		} else {
			$target = jQuery('body');
		}

		// Append UI content to the target element
		this.ui.appendTo($target);

		if (this.onKeyDown) {
			jQuery(window)
				.off('keydown.' + this.name)
				.on('keydown.' + this.name, this.onKeyDown.bind(this));
		}

		if (this.mouseMode === UIComponent.MouseMode.FREEZE) {
			Mouse.intersect = false;
			Session.FreezeUI = true;
			Cursor.setType(Cursor.ACTION.DEFAULT);
		}

		if (this.onAppend) {
			this.onAppend();
		}

		//Fix position after append (screen changed since last time and it loads invalid positions)
		if (this.ui) {
			var x, y, width, height, WIDTH, HEIGHT;
			x = this.ui.offset().left;
			y = this.ui.offset().top;
			width = this.ui.width();
			height = this.ui.height();
			WIDTH = Renderer.width;
			HEIGHT = Renderer.height;

			if (y + height > HEIGHT) {
				this.ui.css('top', HEIGHT - Math.min(height, HEIGHT));
			}

			if (x + width > WIDTH) {
				this.ui.css('left', WIDTH - Math.min(width, WIDTH));
			}

			//Magnet
			if (this.magnet.TOP) {
				//nothing to do
			}
			if (this.magnet.BOTTOM) {
				this.ui.css('top', HEIGHT - height);
			}
			if (this.magnet.LEFT) {
				//nothing to do
			}
			if (this.magnet.RIGHT) {
				this.ui.css('left', WIDTH - width);
			}
		}

		this.focus();
	};

	/**
	 * Focus the UI
	 * (stay at the top of others)
	 */
	UIComponent.prototype.focus = function focus() {
		if (!this.manager || !this.needFocus) {
			return;
		}

		var components = this.manager.components;
		var name,
			zIndex,
			list = [];
		var i, count, j;

		// Store components zIndex in a list
		for (name in components) {
			if (this !== components[name] && components[name].__active && components[name].needFocus) {
				zIndex = parseInt(components[name].ui.css('zIndex'), 10);
				list[zIndex - 50] = zIndex;
			}
		}

		// Re-organize it to have a linear zIndex order (remove gap)
		for (i = 0, j = 0, count = list.length; i < count; ++i) {
			if (!list[i]) {
				j++;
				continue;
			}
			list[i] -= j;
		}

		// Apply new zIndex to list
		for (name in components) {
			if (this !== components[name] && components[name].__active && components[name].needFocus) {
				zIndex = parseInt(components[name].ui.css('zIndex'), 10);
				components[name].ui.css('zIndex', list[zIndex - 50]);
			}
		}

		// Push our zIndex at top
		this.ui.css('zIndex', list.length + 50 - j);
	};

	/**
	 * add UI at the top of others
	 */
	UIComponent.prototype.placeOnTop = function placeOnTop() {
		if (!this.manager) {
			return;
		}

		var components = this.manager.components;
		var name,
			zIndex,
			list = [];

		// Store components zIndex in a list
		for (name in components) {
			if (this !== components[name] && components[name].__active) {
				zIndex = parseInt(components[name].ui.css('zIndex'), 10);
				list.push(zIndex);
			}
		}
		let lastZIndex = Math.max(...list);
		this.ui.css('zIndex', lastZIndex + 1);
	};

	/**
	 * Clone a component
	 *
	 * @param {string} name - new component name
	 */
	UIComponent.prototype.clone = function clone(name, full) {
		var ui = new UIComponent(name, this._htmlText, this._cssText);

		if (full) {
			var keys = Object.keys(this);
			var i,
				count = keys.length;

			for (i = 0; i < count; ++i) {
				ui[keys[i]] = this[keys[i]];
			}
		}

		return ui;
	};

	/**
	 * Enable a type (keydown is the only one supported yet)
	 *
	 * @param {string} type to enable
	 */
	UIComponent.prototype.on = function on(type) {
		switch (type.toLowerCase()) {
			case 'keydown':
				if (this.onKeyDown) {
					jQuery(window)
						.off('keydown.' + this.name)
						.on('keydown.' + this.name, this.onKeyDown.bind(this));
				}
				break;
		}
	};

	/**
	 * Disable a type (keydown is the only one supported yet)
	 *
	 * @param {string} type to disable
	 */
	UIComponent.prototype.off = function off(type) {
		switch (type.toLowerCase()) {
			case 'keydown':
				jQuery(window).off('keydown.' + this.name);
				break;
		}
	};

	/**
	 * Drag an element
	 */
	UIComponent.prototype.draggable = function draggable(element) {
		var container = jQuery(this.ui).filter(function () {
			return this.nodeType === 1;
		});

		var component = this;

		// Global variable
		if (!element) {
			element = this.ui;
		}

		element = jQuery(element).filter(function () {
			return this.nodeType === 1;
		});
		if (!container.length || !element.length) {
			return this;
		}

		// Drag drop stuff
		element.on('mousedown touchstart', function (event) {
			if (event.type === 'touchstart') {
				Mouse.screen.x = event.originalEvent.touches[0].pageX;
				Mouse.screen.y = event.originalEvent.touches[0].pageY;
			}

			// Only on left click
			else if (event.which !== 1) {
				return;
			}

			var x, y, width, height, drag;
			var startPos = container.position();
			x = startPos.left - Mouse.screen.x;
			y = startPos.top - Mouse.screen.y;

			width = container.width();
			height = container.height();

			_snapCache = [];
			if (UIPreferences.windowmagnet && component.manager) {
				var containerParent = container.offsetParent();
				var components = component.manager.components;

				for (var name in components) {
					var other = components[name];

					if (!other || other === component || !other.__active || !other.ui || !other.ui.length) {
						continue;
					}

					var otherParent = other.ui.offsetParent();
					if (containerParent.length && otherParent.length && otherParent[0] !== containerParent[0]) {
						continue;
					}

					var oPos = other.ui.position();
					var oW = other.ui.width();
					var oH = other.ui.height();

					_snapCache.push({
						left: oPos.left,
						top: oPos.top,
						right: oPos.left + oW,
						bottom: oPos.top + oH
					});
				}
			}

			// Start the loop
			container.stop();
			drag = Events.setTimeout(dragging, 15);

			// Stop the drag (need to focus on window to avoid possible errors...)
			jQuery(window).on('mouseup.dragdrop touchend.dragdrop', function (event) {
				if (event.type === 'touchend' || event.which === 1 || event.isTrigger) {
					container.stop().animate({ opacity: 1.0 }, 500);
					Events.clearTimeout(drag);
					jQuery(window).off('mouseup.dragdrop touchend.dragdrop');
					_snapCache = [];
				}
			});

			// Process dragging
			function dragging() {
				var x_ = Mouse.screen.x + x;
				var y_ = Mouse.screen.y + y;
				var opacity = parseFloat(container.css('opacity') || 1) - 0.02;
				var snapDistance = 10;

				if (component.magnet) {
					component.magnet.TOP =
						component.magnet.BOTTOM =
						component.magnet.LEFT =
						component.magnet.RIGHT =
							false;
				}

				// Magnet on border
				if (Math.abs(x_) < snapDistance) {
					x_ = 0;
					if (component.magnet) {
						component.magnet.LEFT = true;
					}
				}
				if (Math.abs(y_) < snapDistance) {
					y_ = 0;
					if (component.magnet) {
						component.magnet.TOP = true;
					}
				}

				if (Math.abs(x_ + width - Mouse.screen.width) < snapDistance) {
					x_ = Mouse.screen.width - width;
					if (component.magnet) {
						component.magnet.RIGHT = true;
					}
				}

				if (Math.abs(y_ + height - Mouse.screen.height) < snapDistance) {
					y_ = Mouse.screen.height - height;
					if (component.magnet) {
						component.magnet.BOTTOM = true;
					}
				}

				if (UIPreferences.windowmagnet && component.manager) {
					var lockX = component.magnet && (component.magnet.LEFT || component.magnet.RIGHT);
					var lockY = component.magnet && (component.magnet.TOP || component.magnet.BOTTOM);
					var snapX = null;
					var snapY = null;
					var snapXD = snapDistance + 1;
					var snapYD = snapDistance + 1;

					function checkX(val) {
						var d = Math.abs(val - x_);
						if (d < snapXD) {
							snapXD = d;
							snapX = val;
						}
					}

					function checkY(val) {
						var d = Math.abs(val - y_);
						if (d < snapYD) {
							snapYD = d;
							snapY = val;
						}
					}

					function isNear(startA, endA, startB, endB) {
						return !(endA + snapDistance < startB || endB + snapDistance < startA);
					}

					var len = _snapCache.length;
					for (var i = 0; i < len; i++) {
						var box = _snapCache[i];

						if (!lockX && isNear(y_, y_ + height, box.top, box.bottom)) {
							checkX(box.left);
							checkX(box.right);
							checkX(box.left - width);
							checkX(box.right - width);
						}

						if (!lockY && isNear(x_, x_ + width, box.left, box.right)) {
							checkY(box.top);
							checkY(box.bottom);
							checkY(box.top - height);
							checkY(box.bottom - height);
						}
					}

					if (!lockX && snapX !== null) {
						x_ = snapX;
					}
					if (!lockY && snapY !== null) {
						y_ = snapY;
					}
				}

				container.offset({ top: y_, left: x_ });
				container.css('opacity', Math.max(opacity, 0.7));
				drag = Events.setTimeout(dragging, 15);
			}
		});

		return this;
	};

	/**
	 * Parse a component html view (data-* attributes)
	 */
	UIComponent.prototype.parseHTML = function parseHTML() {
		var $node = jQuery(this);
		var background = $node.data('background');
		var preload = $node.data('preload');
		var hover = $node.data('hover');
		var down = $node.data('down');
		var active = $node.data('active');
		var msgId = $node.data('text');

		var preloads, i, count;

		var bg_uri = null;
		var hover_uri = null;
		var active_uri = null;
		var down_uri = null;

		var state = {
			hover: false,
			down: false,
			active: false
		};

		function updateBackground() {
			if (state.down && down_uri) {
				$node.css('backgroundImage', 'url(' + down_uri + ')');
			} else if (state.active && active_uri) {
				$node.css('backgroundImage', 'url(' + active_uri + ')');
			} else if (state.hover && hover_uri) {
				$node.css('backgroundImage', 'url(' + hover_uri + ')');
			} else if (bg_uri) {
				$node.css('backgroundImage', 'url(' + bg_uri + ')');
			} else {
				$node.css('backgroundImage', '');
			}
		}

		// text
		if (msgId && DB.getMessage(msgId, '')) {
			$node.text(DB.getMessage(msgId, ''));
		}

		// Default background
		if (background) {
			Client.loadFile(DB.INTERFACE_PATH + background, function (dataURI) {
				bg_uri = dataURI;
				if (dataURI instanceof ArrayBuffer) {
					try {
						var tga = new Targa();
						tga.load(new Uint8Array(dataURI));
						bg_uri = tga.getDataURL();
					} catch (e) {
						console.error(e.message);
					}
				}
				updateBackground();
			});
		}

		// Active background
		if (active) {
			Client.loadFile(DB.INTERFACE_PATH + active, function (dataURI) {
				active_uri = dataURI;

				// Initialize active state if class is already present
				if ($node.hasClass('active')) {
					state.active = true;
					updateBackground();
				}
			});

			// Watch for class changes
			var observer = new MutationObserver(function (mutations) {
				mutations.forEach(function (mutation) {
					if (mutation.attributeName === 'class') {
						var isActive = $node.hasClass('active');
						if (state.active !== isActive) {
							state.active = isActive;
							updateBackground();
						}
					}
				});
			});

			observer.observe($node[0], {
				attributes: true,
				attributeFilter: ['class']
			});

			// Clean up observer when node is removed
			$node.on('remove', function () {
				observer.disconnect();
			});
		}

		// On mouse over
		if (hover) {
			Client.loadFile(DB.INTERFACE_PATH + hover, function (dataURI) {
				hover_uri = dataURI;
			});
			$node.mouseover(function () {
				state.hover = true;
				updateBackground();
			});
			$node.mouseout(function () {
				state.hover = false;
				updateBackground();
			});
		}

		// On mouse down
		if (down) {
			Client.loadFile(DB.INTERFACE_PATH + down, function (dataURI) {
				down_uri = dataURI;
			});
			$node.mousedown(function (event) {
				state.down = true;
				updateBackground();
			});
			$node.mouseup(function () {
				state.down = false;
				updateBackground();
			});

			// If not hovering, we need to handle mouseout to reset down state if dragged out
			if (!hover) {
				$node.mouseout(function () {
					state.down = false;
					state.hover = false; // Just in case
					updateBackground();
				});
			}
		}

		// Preload images ?
		if (preload) {
			preloads = preload.split(';');
			for (i = 0, count = preloads.length; i < count; ++i) {
				preloads[i] = DB.INTERFACE_PATH + jQuery.trim(preloads[i]);
			}
			Client.loadFiles(preloads);
		}
	};

	/**
	 * Export
	 */
	return UIComponent;
});
